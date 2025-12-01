# SMS and WhatsApp Setup Guide

## Overview
This guide will help you set up real SMS and WhatsApp messaging for the HydroLake Insight alert system.

## Twilio SMS Setup

### 1. Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Get $15 free credit for testing

### 2. Get Credentials
1. From the Twilio Console Dashboard, copy:
   - Account SID
   - Auth Token
2. Buy a phone number or use the trial number

### 3. Configure Environment
Add to `backend/.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Test SMS
```javascript
// Test SMS endpoint
POST http://localhost:5000/api/alerts/sms
{
  "recipients": ["+919999999999"],
  "message": "Test alert from HydroLake Insight"
}
```

## WhatsApp Green API Setup

### 1. Create Green API Account
1. Go to [Green API](https://green-api.com/)
2. Sign up and create an instance
3. Connect your WhatsApp number

### 2. Get Credentials
1. Copy Instance ID and Token from dashboard
2. Scan QR code with WhatsApp to authorize

### 3. Configure Environment
Add to `backend/.env`:
```env
WHATSAPP_API_TOKEN=your_green_api_token
WHATSAPP_INSTANCE_ID=your_instance_id
```

### 4. Test WhatsApp
```javascript
// Test WhatsApp endpoint
POST http://localhost:5000/api/alerts/whatsapp
{
  "recipients": ["+919999999999"],
  "message": "Test WhatsApp alert from HydroLake Insight"
}
```

## Alternative WhatsApp Setup (Twilio)

### 1. Twilio WhatsApp Sandbox
1. In Twilio Console, go to WhatsApp → Try it Out
2. Follow sandbox setup instructions
3. Add approved numbers for testing

### 2. Production WhatsApp
1. Apply for WhatsApp Business API approval
2. Complete business verification
3. Get production WhatsApp number

## Email Setup (Nodemailer)

### 1. Gmail Setup
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password instead of regular password

### 2. Configure Email
Add to `backend/.env`:
```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=HydroLake Insight <your.email@gmail.com>
```

### 3. Other Email Providers
```env
# Outlook/Hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587

# Yahoo
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587

# Custom SMTP
EMAIL_HOST=your.smtp.server.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## Testing All Services

### 1. Check Service Status
```javascript
GET http://localhost:5000/api/health
```

### 2. Test Individual Services
```bash
# SMS Test
curl -X POST http://localhost:5000/api/alerts/sms \
  -H "Content-Type: application/json" \
  -d '{"recipients":["+919999999999"],"message":"Test SMS"}'

# WhatsApp Test
curl -X POST http://localhost:5000/api/alerts/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"recipients":["+919999999999"],"message":"Test WhatsApp"}'

# Email Test
curl -X POST http://localhost:5000/api/alerts/email \
  -H "Content-Type: application/json" \
  -d '{"recipients":["test@example.com"],"subject":"Test","message":"Test Email"}'
```

### 3. Mass Alert Test
```javascript
POST http://localhost:5000/api/community-alerts/send
{
  "type": "emergency",
  "message": "EMERGENCY: Dam water level critical. Evacuate immediately.",
  "channels": ["sms", "whatsapp", "email"],
  "priority": "high"
}
```

## Troubleshooting

### Common Issues

1. **SMS Not Sending**
   - Check Twilio account balance
   - Verify phone number format (+country_code)
   - Check if number is verified (trial accounts)

2. **WhatsApp Not Working**
   - Ensure WhatsApp is connected to Green API
   - Check instance status in Green API dashboard
   - Verify recipient has WhatsApp

3. **Email Failing**
   - Check App Password is correct
   - Verify Gmail "Less secure apps" is disabled
   - Check firewall/antivirus blocking SMTP

### Demo Mode
If credentials are not configured, the system automatically runs in demo mode:
- SMS: Logs message instead of sending
- WhatsApp: Simulated response
- Email: Logs email content

### Production Considerations
1. **Rate Limiting**: Implement rate limiting for mass alerts
2. **Queue System**: Use Redis/Bull for message queuing
3. **Monitoring**: Add logging and monitoring for failed messages
4. **Backup Channels**: Configure multiple SMS/email providers
5. **Compliance**: Ensure compliance with local messaging regulations

## Support
- Twilio Support: [Twilio Help](https://support.twilio.com/)
- Green API Docs: [Green API Documentation](https://green-api.com/docs/)
- Gmail App Passwords: [Google Support](https://support.google.com/accounts/answer/185833)
