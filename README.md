# HydroLake Insight 🌊

An intelligent dam monitoring and community alert system built with React, Node.js, and real-time IoT simulation.

## Features

- **Real-time Dam Monitoring**: Live sensor data visualization and alerts
- **Weather Integration**: Real-time weather data and forecasting
- **Community Alerts**: SMS, WhatsApp, and email notifications
- **AI Risk Assessment**: Intelligent analysis of dam safety conditions
- **Government Dashboard**: Compliance reporting and regulatory oversight
- **Multi-language Support**: English and Hindi language options
- **PWA Support**: Install as mobile app for offline access
- **Voice Controls**: Voice-activated alerts and commands

## Quick Start

1. **Install Dependencies**
```bash
npm install
cd backend && npm install
cd ../ml-model && pip install -r requirements.txt
```

2. **Start All Services**
```bash
# Start frontend (port 8080)
npm run dev

# Start backend (port 5000)
cd backend && node server.js

# Start ML API (port 3001)
cd ml-model && python api_server.py
```

3. **Access the Application**
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- ML API: http://localhost:3001

## Environment Setup

Create `.env` files for SMS/WhatsApp alerts:

**Backend .env:**
```
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

WHATSAPP_API_TOKEN=your_green_api_token
WHATSAPP_INSTANCE_ID=your_green_api_instance
```

## Project Structure

```
hydrolake-insight/
├── src/           # React frontend
├── backend/       # Node.js API server
├── ml-model/      # Python ML services
├── public/        # Static assets
└── docs/          # Documentation
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Socket.IO
- **Database**: JSON files (upgradeable to MongoDB)
- **Alerts**: Twilio SMS, WhatsApp Green API
- **Weather**: Open-Meteo API
- **ML**: Python, scikit-learn

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.