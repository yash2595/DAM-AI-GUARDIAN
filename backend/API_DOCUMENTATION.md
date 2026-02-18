# Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication Endpoints

### POST /api/auth/login
Login user with credentials
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### POST /api/auth/register
Register new user
```json
{
  "name": "User Name",
  "email": "user@example.com", 
  "password": "password",
  "role": "user"
}
```

## IoT Endpoints

### GET /api/iot/sensors
Get all sensor data
```json
{
  "sensors": [
    {
      "id": "sensor_001",
      "type": "water_level",
      "value": 45.5,
      "unit": "meters",
      "timestamp": "2024-11-17T10:30:00Z",
      "status": "normal"
    }
  ]
}
```

### GET /api/iot/sensors/:id
Get specific sensor data

### POST /api/iot/sensors/:id/calibrate
Calibrate sensor

## Weather Endpoints

### GET /api/weather/current/:location
Get current weather for location
```json
{
  "location": "Bhakra Dam",
  "temperature": 25.5,
  "humidity": 65,
  "windSpeed": 12.3,
  "condition": "clear",
  "timestamp": "2024-11-17T10:30:00Z"
}
```

### GET /api/weather/forecast/:location
Get weather forecast

## Alert Endpoints

### POST /api/alerts/sms
Send SMS alert
```json
{
  "recipients": ["+91XXXXXXXXXX"],
  "message": "Emergency alert message",
  "priority": "high"
}
```

### POST /api/alerts/whatsapp
Send WhatsApp message
```json
{
  "recipients": ["+91XXXXXXXXXX"],
  "message": "WhatsApp alert message",
  "mediaUrl": "optional_image_url"
}
```

### POST /api/alerts/email
Send email alert
```json
{
  "recipients": ["user@example.com"],
  "subject": "Dam Alert",
  "message": "Alert message body",
  "priority": "high"
}
```

### GET /api/alerts/history
Get alert history

## Community Endpoints

### GET /api/community/alerts
Get community alerts

### POST /api/community/alerts
Create community alert

### GET /api/community/members
Get community members

## Government Endpoints

### GET /api/government/reports
Get compliance reports

### POST /api/government/emergency
Declare emergency

### GET /api/government/regulations
Get current regulations

## Chatbot Endpoints

### POST /api/chatbot/message
Send message to chatbot
```json
{
  "message": "What is the current status?",
  "userId": "user123"
}
```

### GET /api/chatbot/history/:userId
Get chat history

## Error Responses

All endpoints return standard error responses:
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error