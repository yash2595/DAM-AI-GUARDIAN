"""
Flask API Server for ML Model Predictions
Serves the trained dam monitoring ML model
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load models
print("Loading ML models...")
try:
    rf_model = joblib.load('models/random_forest.pkl')
    gb_model = joblib.load('models/gradient_boosting.pkl')
    nn_model = joblib.load('models/neural_network.pkl')
    scaler = joblib.load('models/scaler.pkl')
    
    with open('models/metadata.json', 'r') as f:
        metadata = json.load(f)
    
    print("✓ Models loaded successfully!")
except Exception as e:
    print(f"✗ Error loading models: {e}")
    print("Please run train_model.py first to train the models.")
    rf_model = gb_model = nn_model = scaler = None
    metadata = {}

feature_names = [
    'waterLevel', 'pressure', 'seepage', 'structuralStress', 
    'temperature', 'inflow', 'outflow', 'turbidity', 
    'ph', 'dissolvedOxygen', 'vibration', 'rainfall'
]

risk_labels = ['Safe', 'Medium Risk', 'High Risk', 'Critical']

@app.route('/')
def home():
    return jsonify({
        'status': 'online',
        'message': 'Dam Monitoring ML API',
        'version': metadata.get('model_version', '1.0.0'),
        'trained_date': metadata.get('trained_date', 'Unknown'),
        'endpoints': {
            '/predict': 'POST - Predict risk level',
            '/health': 'GET - Check API health',
            '/model-info': 'GET - Get model information'
        }
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'models_loaded': rf_model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/model-info')
def model_info():
    return jsonify({
        'version': metadata.get('model_version', '1.0.0'),
        'trained_date': metadata.get('trained_date', 'Unknown'),
        'features': feature_names,
        'risk_levels': risk_labels,
        'models': ['Random Forest', 'Gradient Boosting', 'Neural Network'],
        'ensemble_method': 'Average voting'
    })

@app.route('/predict', methods=['POST'])
def predict():
    if not rf_model or not gb_model or not nn_model or not scaler:
        return jsonify({
            'success': False,
            'error': 'Models not loaded. Please train the models first.'
        }), 500
    
    try:
        data = request.json
        sensor_data = data.get('sensorData', {})
        
        # Prepare input
        input_data = np.array([[
            sensor_data.get('waterLevel', 65),
            sensor_data.get('pressure', 70),
            sensor_data.get('seepage', 3),
            sensor_data.get('structuralStress', 40),
            sensor_data.get('temperature', 20),
            sensor_data.get('inflow', 1000),
            sensor_data.get('outflow', 950),
            sensor_data.get('turbidity', 5),
            sensor_data.get('ph', 7.2),
            sensor_data.get('dissolvedOxygen', 7),
            sensor_data.get('vibration', 0.3),
            sensor_data.get('rainfall', 15)
        ]])
        
        # Scale input
        input_scaled = scaler.transform(input_data)
        
        # Get predictions from all models
        rf_pred = rf_model.predict_proba(input_scaled)[0]
        gb_pred = gb_model.predict_proba(input_scaled)[0]
        nn_pred = nn_model.predict_proba(input_scaled)[0]
        
        # Ensemble prediction
        ensemble_proba = (rf_pred + gb_pred + nn_pred) / 3
        risk_level = int(np.argmax(ensemble_proba))
        confidence = float(ensemble_proba[risk_level])
        
        # Calculate risk score (0-100)
        risk_score = float(
            ensemble_proba[0] * 0 + 
            ensemble_proba[1] * 33 + 
            ensemble_proba[2] * 66 + 
            ensemble_proba[3] * 100
        )
        
        # Generate recommendations
        recommendations = generate_recommendations(sensor_data, risk_level)
        
        # Generate prediction details
        prediction_details = {
            'level': risk_labels[risk_level],
            'probability': confidence,
            'message': get_risk_message(risk_level),
            'action': get_risk_action(risk_level)
        }
        
        response = {
            'success': True,
            'data': {
                'riskScore': round(risk_score, 2),
                'riskLevel': risk_level,
                'riskLabel': risk_labels[risk_level],
                'confidence': round(confidence * 100, 2),
                'prediction': prediction_details,
                'probabilities': {
                    'safe': round(float(ensemble_proba[0]) * 100, 2),
                    'medium': round(float(ensemble_proba[1]) * 100, 2),
                    'high': round(float(ensemble_proba[2]) * 100, 2),
                    'critical': round(float(ensemble_proba[3]) * 100, 2)
                },
                'models': {
                    'randomForest': int(np.argmax(rf_pred)),
                    'gradientBoosting': int(np.argmax(gb_pred)),
                    'neuralNetwork': int(np.argmax(nn_pred))
                },
                'recommendations': recommendations,
                'timestamp': datetime.now().isoformat(),
                'modelVersion': metadata.get('model_version', '1.0.0')
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_recommendations(sensor_data, risk_level):
    """Generate actionable recommendations based on sensor data and risk level"""
    recommendations = []
    
    water_level = sensor_data.get('waterLevel', 65)
    pressure = sensor_data.get('pressure', 70)
    seepage = sensor_data.get('seepage', 3)
    structural_stress = sensor_data.get('structuralStress', 40)
    rainfall = sensor_data.get('rainfall', 15)
    
    if risk_level >= 3:  # Critical
        recommendations.append({
            'priority': 'CRITICAL',
            'category': 'Emergency Response',
            'action': 'Activate emergency response protocol immediately',
            'reason': 'Multiple parameters indicate imminent failure risk'
        })
        recommendations.append({
            'priority': 'CRITICAL',
            'category': 'Public Safety',
            'action': 'Evacuate downstream areas immediately',
            'reason': 'Dam failure probability is critically high'
        })
    
    if risk_level >= 2:  # High
        recommendations.append({
            'priority': 'HIGH',
            'category': 'Monitoring',
            'action': 'Implement 24/7 monitoring with hourly reports',
            'reason': 'Elevated risk requires continuous surveillance'
        })
    
    if water_level > 85:
        recommendations.append({
            'priority': 'HIGH',
            'category': 'Water Management',
            'action': 'Increase outflow through spillways immediately',
            'reason': f'Water level at {water_level:.1f}% approaching maximum capacity'
        })
    
    if pressure > 100:
        recommendations.append({
            'priority': 'HIGH',
            'category': 'Structural Integrity',
            'action': 'Emergency structural inspection required',
            'reason': f'Pressure at {pressure:.1f} kPa exceeds safe limits'
        })
    
    if seepage > 7:
        recommendations.append({
            'priority': 'HIGH',
            'category': 'Maintenance',
            'action': 'Inspect and seal seepage points urgently',
            'reason': f'Seepage rate of {seepage:.1f} L/min is dangerously high'
        })
    
    if structural_stress > 75:
        recommendations.append({
            'priority': 'HIGH',
            'category': 'Structural Assessment',
            'action': 'Conduct immediate structural stress analysis',
            'reason': f'Structural stress at {structural_stress:.1f}% approaching failure threshold'
        })
    
    if rainfall > 80:
        recommendations.append({
            'priority': 'MEDIUM',
            'category': 'Weather Monitoring',
            'action': 'Monitor weather forecasts and prepare for increased inflow',
            'reason': f'Heavy rainfall of {rainfall:.1f} mm detected'
        })
    
    if risk_level <= 1 and len(recommendations) == 0:
        recommendations.append({
            'priority': 'LOW',
            'category': 'Routine Operations',
            'action': 'Continue routine monitoring and maintenance',
            'reason': 'All systems operating within normal parameters'
        })
    
    return recommendations

def get_risk_message(risk_level):
    """Get descriptive message for risk level"""
    messages = {
        0: 'All systems operating within normal parameters',
        1: 'Some concerns detected. Increased monitoring recommended',
        2: 'Elevated risk detected. Close monitoring required',
        3: 'High probability of structural failure within 24-48 hours'
    }
    return messages.get(risk_level, 'Unknown risk level')

def get_risk_action(risk_level):
    """Get recommended action for risk level"""
    actions = {
        0: 'Continue routine monitoring',
        1: 'Schedule inspection and review maintenance logs',
        2: 'Prepare evacuation plan and notify authorities',
        3: 'IMMEDIATE EVACUATION REQUIRED'
    }
    return actions.get(risk_level, 'Consult with experts')

if __name__ == '__main__':
    print("\n" + "="*60)
    print("DAM MONITORING ML API SERVER")
    print("="*60)
    print("\nStarting Flask server...")
    print("API will be available at: http://localhost:5001")
    print("\nEndpoints:")
    print("  GET  /           - API information")
    print("  GET  /health     - Health check")
    print("  GET  /model-info - Model details")
    print("  POST /predict    - Predict risk level")
    print("\n" + "="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
