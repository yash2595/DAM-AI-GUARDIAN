const { ChatConversation, SensorData, Alert } = require('../database/models');

/**
 * AI Chatbot Controller
 * Handles chatbot interactions with database persistence
 */

// Process chatbot message
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user?.id || 'guest';
    
    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findById(conversationId);
    }
    
    if (!conversation) {
      conversation = new ChatConversation({
        userId,
        title: message.substring(0, 50)
      });
    }
    
    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Generate AI response
    const response = await generateAIResponse(message, conversation);
    
    // Add AI response
    conversation.messages.push({
      role: 'assistant',
      content: response.text,
      timestamp: new Date(),
      metadata: response.metadata
    });
    
    conversation.lastMessageAt = new Date();
    await conversation.save();
    
    res.json({ 
      success: true, 
      data: {
        conversationId: conversation._id,
        response: response.text,
        metadata: response.metadata
      }
    });
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get conversation history
exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all conversations for user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || 'guest';
    
    const conversations = await ChatConversation.find({ userId })
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .select('title lastMessageAt messages');
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await ChatConversation.findByIdAndDelete(conversationId);
    
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chatbot analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalConversations = await ChatConversation.countDocuments();
    const totalMessages = await ChatConversation.aggregate([
      { $project: { messageCount: { $size: '$messages' } } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);
    
    const activeToday = await ChatConversation.countDocuments({
      lastMessageAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const topQueries = await ChatConversation.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.role': 'user' } },
      { $group: { 
        _id: { $substr: ['$messages.content', 0, 50] },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({ 
      success: true, 
      data: {
        totalConversations,
        totalMessages: totalMessages[0]?.total || 0,
        activeToday,
        topQueries
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate AI response (mock implementation)
async function generateAIResponse(message, conversation) {
  const messageLower = message.toLowerCase();
  
  // Check for specific queries
  if (messageLower.includes('water level') || messageLower.includes('current status')) {
    const latestData = await SensorData.findOne().sort({ timestamp: -1 });
    return {
      text: `Current water level is ${latestData?.waterLevel || 75}% of capacity. ` +
            `Flow rate: ${latestData?.flowRate || 1250} cubic meters/second. ` +
            `All parameters are within normal operating limits.`,
      metadata: { type: 'status', data: latestData }
    };
  }
  
  if (messageLower.includes('alert') || messageLower.includes('warning')) {
    const activeAlerts = await Alert.find({ status: 'active' }).limit(5);
    if (activeAlerts.length === 0) {
      return {
        text: 'There are no active alerts at this time. All systems are operating normally.',
        metadata: { type: 'alerts', count: 0 }
      };
    }
    return {
      text: `There are ${activeAlerts.length} active alerts:\n` +
            activeAlerts.map((a, i) => `${i+1}. ${a.type} - ${a.severity} severity`).join('\n'),
      metadata: { type: 'alerts', data: activeAlerts }
    };
  }
  
  if (messageLower.includes('emergency') || messageLower.includes('contact')) {
    return {
      text: `For emergencies, please call: 8000824196\n\n` +
            `This is the 24/7 emergency hotline for dam operations. ` +
            `For routine inquiries, you can continue chatting with me.`,
      metadata: { type: 'emergency' }
    };
  }
  
  if (messageLower.includes('predict') || messageLower.includes('forecast')) {
    return {
      text: `Based on current trends and weather forecasts:\n` +
            `• Water level expected to rise by 2-3% in next 24 hours\n` +
            `• Rainfall prediction: 45mm in next 48 hours\n` +
            `• Recommended action: Continue monitoring, no immediate concerns\n` +
            `• Confidence: 87%`,
      metadata: { type: 'prediction' }
    };
  }
  
  if (messageLower.includes('history') || messageLower.includes('data')) {
    return {
      text: `Historical data shows:\n` +
            `• Average water level this month: 78%\n` +
            `• Peak level in last year: 92%\n` +
            `• Number of alerts in last 30 days: 3\n` +
            `• Average inflow rate: 1150 cubic meters/second`,
      metadata: { type: 'historical' }
    };
  }
  
  if (messageLower.includes('safety') || messageLower.includes('secure')) {
    return {
      text: `Dam safety status:\n` +
            `• Structural integrity: Excellent\n` +
            `• All sensors operational: Yes\n` +
            `• Last safety inspection: 5 days ago\n` +
            `• Next scheduled inspection: 25 days\n` +
            `• Overall safety rating: 9.5/10`,
      metadata: { type: 'safety' }
    };
  }
  
  // Default response with context
  const responses = [
    "I'm here to help you monitor the dam operations. You can ask me about:\n" +
    "• Current water levels and flow rates\n" +
    "• Active alerts and warnings\n" +
    "• Predictions and forecasts\n" +
    "• Historical data and trends\n" +
    "• Safety status and inspections\n" +
    "• Emergency contact information",
    
    "I can provide real-time information about the dam. Try asking about:\n" +
    "• 'What's the current water level?'\n" +
    "• 'Are there any active alerts?'\n" +
    "• 'What's the prediction for tomorrow?'\n" +
    "• 'Show me historical data'\n" +
    "• 'Emergency contact number'",
    
    `Based on your question, I'd be happy to provide specific information. ` +
    `The dam is currently operating normally with all systems functional. ` +
    `What specific aspect would you like to know more about?`
  ];
  
  return {
    text: responses[Math.floor(Math.random() * responses.length)],
    metadata: { type: 'general' }
  };
}

module.exports = exports;
