// Process voice command
exports.processCommand = async (req, res) => {
  try {
    const { command, language = 'en' } = req.body;
    const cmd = command.toLowerCase();
    
    let response;
    if (cmd.includes('status') || cmd.includes('how')) {
      response = {
        action: 'status_report',
        response: 'All systems are operating normally. Water level is at 75%, pressure is stable.',
        spokenText: 'All systems are operating normally. Water level is at seventy-five percent, pressure is stable.'
      };
    } else if (cmd.includes('alert') || cmd.includes('warning')) {
      response = {
        action: 'get_alerts',
        response: 'There are currently 2 active alerts: High water level warning and Maintenance due.',
        spokenText: 'There are currently two active alerts: High water level warning and Maintenance due.'
      };
    } else if (cmd.includes('help')) {
      response = {
        action: 'help',
        response: 'You can ask for status, alerts, or say emergency to activate emergency protocols.',
        spokenText: 'You can ask for status, alerts, or say emergency to activate emergency protocols.'
      };
    } else {
      response = {
        action: 'unknown',
        response: 'Command not recognized. Please try again.',
        spokenText: 'Command not recognized. Please try again.'
      };
    }
    
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Text to speech (mock)
exports.textToSpeech = async (req, res) => {
  try {
    const { text, language = 'en', voice = 'female' } = req.body;
    res.json({
      success: true,
      data: {
        audioUrl: '/api/voice/audio/generated',
        duration: text.length * 0.1,
        language,
        voice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
