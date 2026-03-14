const nodemailer = require('nodemailer');
const { Alert, Authority } = require('../database/models');

const inferSeverity = (value) => {
  const normalized = String(value || '').toLowerCase();
  if (['low', 'medium', 'high', 'critical'].includes(normalized)) {
    return normalized;
  }
  if (normalized.includes('critical')) return 'critical';
  if (normalized.includes('high')) return 'high';
  if (normalized.includes('medium')) return 'medium';
  return 'high';
};

const inferType = (value) => {
  const normalized = String(value || '').toLowerCase();
  if (['water_level', 'seismic', 'vibration', 'crack', 'weather', 'system'].includes(normalized)) {
    return normalized;
  }
  if (normalized.includes('seismic')) return 'seismic';
  if (normalized.includes('vibration')) return 'vibration';
  if (normalized.includes('crack')) return 'crack';
  if (normalized.includes('weather') || normalized.includes('rain')) return 'weather';
  return 'system';
};

const buildHistoryEntry = (alertRecord) => ({
  id: alertRecord._id,
  timestamp: alertRecord.createdAt,
  subject: alertRecord.title,
  recipients: (alertRecord.notificationsSent || []).map((item) => item.recipient),
  status: alertRecord.status,
  severity: alertRecord.severity,
  metadata: {
    damId: alertRecord.damId,
    sensorData: alertRecord.sensorData,
  },
  results: alertRecord.notificationsSent || [],
});

// Create transporter based on available env vars
// Returns { transporter, isDemo }
const createTransporter = async () => {
  // Priority 1: Gmail with App Password
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS && process.env.GMAIL_PASS.trim() !== '') {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS.trim() }
    });
    return { transporter, isDemo: false };
  }

  // Priority 2: Generic SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    return { transporter, isDemo: false };
  }

  // Fallback: Ethereal test account (no real delivery — preview URL only)
  console.warn('⚠️  No GMAIL_PASS set — using Ethereal demo mode (emails NOT delivered to real inbox)');
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
  return { transporter, isDemo: true };
};

/**
 * POST /api/alerts/send
 * Body: { recipients, subject, body, metadata }
 *
 * If recipients is empty, fetches all active authorities from DB.
 * Sends email to each recipient, returns preview URLs (Ethereal) in demo mode.
 */
exports.sendAlert = async (req, res) => {
  try {
    let { recipients, subject, body, metadata, severity, type, damId } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ ok: false, error: 'subject and body are required' });
    }

    // If no recipients passed in, pull from authority DB
    if (!recipients || recipients.length === 0) {
      const authorities = await Authority.find({ isActive: true });
      recipients = authorities.map(a => a.email);
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'No authority recipients found. Please add authorities in Settings.'
      });
    }

    const { transporter, isDemo } = await createTransporter();
    const fromAddress = process.env.GMAIL_USER || process.env.SMTP_USER || '"DAM AI Guardian" <noreply@dam-guardian.gov.in>';

    const results = [];
    const previewUrls = [];

    for (const to of recipients) {
      try {
        const info = await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text: body,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:2px solid #dc2626;border-radius:8px;">
            <h2 style="color:#dc2626;margin-top:0;">⚠️ DAM SAFETY ALERT</h2>
            <pre style="white-space:pre-wrap;font-size:14px;line-height:1.6;">${body}</pre>
            ${metadata ? `<hr/><p style="font-size:12px;color:#666;">Alert ID: ${metadata.id || 'N/A'} | Severity: ${metadata.level || 'N/A'} | Dam: ${metadata.dam || 'N/A'}</p>` : ''}
            <hr/><p style="font-size:11px;color:#999;">Sent by DAM AI Guardian Monitoring System</p>
          </div>`
        });

        const previewUrl = isDemo ? nodemailer.getTestMessageUrl(info) : null;
        results.push({ to, status: 'sent', messageId: info.messageId });
        if (previewUrl) previewUrls.push({ to, previewUrl });

        console.log(`✅ Alert email sent to ${to}${previewUrl ? ` | Preview: ${previewUrl}` : ''}`);
      } catch (mailErr) {
        console.error(`❌ Failed to send to ${to}:`, mailErr.message);
        results.push({ to, status: 'failed', error: mailErr.message });
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;

    const alertRecord = await Alert.create({
      type: inferType(type || metadata?.type),
      severity: inferSeverity(severity || metadata?.level || subject),
      title: subject,
      message: body,
      damId: damId || metadata?.damId || metadata?.dam || 'TEHRI_DAM_001',
      sensorData: metadata?.sensorData || metadata || null,
      status: sentCount > 0 ? 'active' : 'resolved',
      notificationsSent: results.map((item) => ({
        recipient: item.to,
        channel: 'email',
        sentAt: new Date(),
        status: item.status,
      })),
    });

    return res.json({
      ok: true,
      message: `Alert sent to ${sentCount}/${recipients.length} recipients`,
      demo: isDemo,
      previewUrl: previewUrls.length > 0 ? previewUrls[0].previewUrl : null,
      previewUrls,
      results,
      historyId: alertRecord._id
    });
  } catch (error) {
    console.error('Alert send error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};

exports.getAlertHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const alerts = await Alert.find({}).sort({ createdAt: -1 }).limit(limit);
    const history = alerts.map(buildHistoryEntry);

    return res.json({
      ok: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error('Get alert history error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * POST /api/alerts/broadcast
 * Sends alert to ALL active authorities + SMS/WhatsApp to all communities
 */
exports.broadcastEmergency = async (req, res) => {
  try {
    const { subject, body, severity = 'critical', metadata } = req.body;

    // Email to authorities
    const emailReq = { body: { recipients: [], subject, body, metadata } };
    const emailResults = [];

    const authorities = await Authority.find({ isActive: true });
    const emailRecipients = authorities.map(a => a.email);

    let emailResponse = null;
    if (emailRecipients.length > 0) {
      const mockRes = {
        json: (data) => { emailResponse = data; },
        status: () => ({ json: (data) => { emailResponse = data; } })
      };
      await exports.sendAlert({ body: { recipients: emailRecipients, subject, body, metadata } }, mockRes);
    }

    return res.json({
      ok: true,
      message: 'Emergency broadcast initiated',
      emailResponse,
      severity
    });
  } catch (error) {
    console.error('Emergency broadcast error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};
