import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ========================================
// Community Alerts Service
// ========================================
export const communityAlertsService = {
  sendSMS: async (recipients: string[], message: string, communities: any[]) => {
    const response = await axios.post(`${API_BASE_URL}/api/community-alerts/sms`, {
      recipients,
      message,
      communities
    });
    return response.data;
  },

  sendWhatsApp: async (recipients: string[], message: string, communities: any[]) => {
    const response = await axios.post(`${API_BASE_URL}/api/community-alerts/whatsapp`, {
      recipients,
      message,
      communities
    });
    return response.data;
  },

  sendBroadcast: async (message: string, communities: any[]) => {
    const response = await axios.post(`${API_BASE_URL}/api/community-alerts/broadcast`, {
      message,
      communities
    });
    return response.data;
  }
};

// ========================================
// Social Media Service
// ========================================
export const socialMediaService = {
  postToTwitter: async (content: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/social-media/twitter`, {
      content
    });
    return response.data;
  },

  postToFacebook: async (content: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/social-media/facebook`, {
      content
    });
    return response.data;
  },

  postToAll: async (content: string, platforms: string[]) => {
    const response = await axios.post(`${API_BASE_URL}/api/social-media/post-all`, {
      content,
      platforms
    });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/social-media/analytics`);
    return response.data;
  }
};

// ========================================
// Government Integration Service
// ========================================
export const governmentService = {
  getNDMAAlerts: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/government/ndma-alerts`);
    return response.data;
  },

  getIMDWeather: async (location: string = 'Tehri') => {
    const response = await axios.get(`${API_BASE_URL}/api/government/imd-weather`, {
      params: { location }
    });
    return response.data;
  },

  getCWCData: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/government/cwc-data`);
    return response.data;
  },

  submitComplianceReport: async (reportType: string, agency: string, data: any, attachments?: any[]) => {
    const response = await axios.post(`${API_BASE_URL}/api/government/compliance-report`, {
      reportType,
      agency,
      data,
      attachments
    });
    return response.data;
  },

  syncWithAgencies: async (agencies: string[]) => {
    const response = await axios.post(`${API_BASE_URL}/api/government/sync`, {
      agencies
    });
    return response.data;
  }
};

// ========================================
// Chatbot Service
// ========================================
export const chatbotService = {
  sendMessage: async (message: string, language: string = 'en', conversationId?: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/chatbot/message`, {
      message,
      language,
      conversationId
    });
    return response.data;
  },

  getFAQs: async (language: string = 'en', category?: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/chatbot/faq`, {
      params: { language, category }
    });
    return response.data;
  }
};

export default {
  communityAlertsService,
  socialMediaService,
  governmentService,
  chatbotService
};
