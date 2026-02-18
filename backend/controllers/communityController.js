const { Community, Alert } = require('../database/models');

// Get all communities
exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ isActive: true }).sort({ distance: 1 });
    
    res.json({
      success: true,
      count: communities.length,
      data: communities
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add new community
exports.addCommunity = async (req, res) => {
  try {
    const community = await Community.create(req.body);
    
    console.log('✅ Community added:', community.name);
    
    res.status(201).json({
      success: true,
      message: 'Community added successfully',
      data: community
    });
  } catch (error) {
    console.error('Error adding community:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update community
exports.updateCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }
    
    console.log('✅ Community updated:', community.name);
    
    res.json({
      success: true,
      message: 'Community updated successfully',
      data: community
    });
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send SMS alert
exports.sendSMSAlert = async (req, res) => {
  try {
    const { recipients, message, communityIds } = req.body;
    
    console.log('📱 SMS Alert Request:', { recipients: recipients?.length, communities: communityIds?.length });
    
    // In production, integrate with Twilio, MSG91, or similar SMS API
    // const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    
    const results = [];
    for (const recipient of recipients || []) {
      // Simulate SMS sending
      // await twilioClient.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE,
      //   to: recipient
      // });
      
      results.push({
        recipient,
        status: 'sent',
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }
    
    // Log alerts sent to communities
    if (communityIds && communityIds.length > 0) {
      await Community.updateMany(
        { _id: { $in: communityIds } },
        {
          $push: {
            alertsSent: {
              message,
              channel: 'sms',
              sentAt: new Date(),
              recipients: recipients.length
            }
          }
        }
      );
    }
    
    console.log('✅ SMS alerts sent:', results.length);
    
    res.json({
      success: true,
      message: `SMS sent to ${results.length} recipients`,
      results
    });
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send WhatsApp alert
exports.sendWhatsAppAlert = async (req, res) => {
  try {
    const { recipients, message, communityIds } = req.body;
    
    console.log('💬 WhatsApp Alert Request:', { recipients: recipients?.length, communities: communityIds?.length });
    
    // In production, integrate with WhatsApp Business API
    // const WhatsAppClient = require('@green-api/whatsapp-api-client');
    
    const results = [];
    for (const recipient of recipients || []) {
      // Simulate WhatsApp sending
      results.push({
        recipient,
        status: 'sent',
        messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }
    
    // Log alerts sent
    if (communityIds && communityIds.length > 0) {
      await Community.updateMany(
        { _id: { $in: communityIds } },
        {
          $push: {
            alertsSent: {
              message,
              channel: 'whatsapp',
              sentAt: new Date(),
              recipients: recipients.length
            }
          }
        }
      );
    }
    
    console.log('✅ WhatsApp alerts sent:', results.length);
    
    res.json({
      success: true,
      message: `WhatsApp sent to ${results.length} recipients`,
      results
    });
  } catch (error) {
    console.error('❌ WhatsApp sending failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Emergency broadcast
exports.sendEmergencyBroadcast = async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('🚨 Emergency Broadcast Request');
    
    const communities = await Community.find({ isActive: true });
    
    const smsResults = [];
    const whatsappResults = [];
    
    for (const community of communities) {
      smsResults.push({
        community: community.name,
        recipient: community.contactPhone,
        status: 'sent',
        channel: 'sms'
      });
      
      whatsappResults.push({
        community: community.name,
        recipient: community.whatsappNumber,
        status: 'sent',
        channel: 'whatsapp'
      });
      
      // Log alert
      community.alertsSent.push({
        message,
        channel: 'emergency_broadcast',
        sentAt: new Date(),
        recipients: 2
      });
      await community.save();
    }
    
    console.log('✅ Emergency broadcast complete:', { sms: smsResults.length, whatsapp: whatsappResults.length });
    
    res.json({
      success: true,
      message: `Emergency broadcast sent to ${communities.length} communities`,
      smsResults,
      whatsappResults
    });
  } catch (error) {
    console.error('❌ Broadcast failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
