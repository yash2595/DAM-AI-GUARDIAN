"""
Dam Monitoring ML Model Training Script
Predicts dam failure risk based on sensor data
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class DamMonitoringMLModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.rf_model = None
        self.gb_model = None
        self.nn_model = None
        self.feature_names = [
            'waterLevel', 'pressure', 'seepage', 'structuralStress', 
            'temperature', 'inflow', 'outflow', 'turbidity', 
            'ph', 'dissolvedOxygen', 'vibration', 'rainfall'
        ]
        
    def generate_training_data(self, n_samples=10000):
        """
        Generate synthetic training data based on dam physics
        """
        print("Generating training data...")
        
        np.random.seed(42)
        data = []
        
        for _ in range(n_samples):
            # Normal operation (70%)
            if np.random.random() < 0.7:
                water_level = np.random.uniform(40, 75)
                pressure = np.random.uniform(50, 80)
                seepage = np.random.uniform(1, 4)
                structural_stress = np.random.uniform(20, 50)
                temperature = np.random.uniform(15, 25)
                inflow = np.random.uniform(800, 1200)
                outflow = np.random.uniform(750, 1150)
                turbidity = np.random.uniform(3, 8)
                ph = np.random.uniform(7.0, 7.8)
                dissolved_oxygen = np.random.uniform(6, 9)
                vibration = np.random.uniform(0.1, 0.5)
                rainfall = np.random.uniform(0, 30)
                risk_level = 0  # Safe
                
            # Medium risk (20%)
            elif np.random.random() < 0.9:
                water_level = np.random.uniform(70, 85)
                pressure = np.random.uniform(75, 95)
                seepage = np.random.uniform(3.5, 6)
                structural_stress = np.random.uniform(45, 70)
                temperature = np.random.uniform(12, 28)
                inflow = np.random.uniform(1100, 1500)
                outflow = np.random.uniform(1000, 1400)
                turbidity = np.random.uniform(7, 12)
                ph = np.random.uniform(6.5, 8.2)
                dissolved_oxygen = np.random.uniform(4, 7)
                vibration = np.random.uniform(0.4, 0.8)
                rainfall = np.random.uniform(25, 60)
                risk_level = 1  # Medium Risk
                
            # High risk (8%)
            elif np.random.random() < 0.98:
                water_level = np.random.uniform(82, 92)
                pressure = np.random.uniform(90, 110)
                seepage = np.random.uniform(5.5, 8)
                structural_stress = np.random.uniform(65, 85)
                temperature = np.random.uniform(10, 30)
                inflow = np.random.uniform(1400, 1800)
                outflow = np.random.uniform(1200, 1600)
                turbidity = np.random.uniform(11, 16)
                ph = np.random.uniform(6.0, 8.5)
                dissolved_oxygen = np.random.uniform(3, 6)
                vibration = np.random.uniform(0.7, 1.2)
                rainfall = np.random.uniform(55, 90)
                risk_level = 2  # High Risk
                
            # Critical risk (2%)
            else:
                water_level = np.random.uniform(88, 98)
                pressure = np.random.uniform(105, 130)
                seepage = np.random.uniform(7.5, 12)
                structural_stress = np.random.uniform(80, 100)
                temperature = np.random.uniform(8, 32)
                inflow = np.random.uniform(1700, 2200)
                outflow = np.random.uniform(1400, 1900)
                turbidity = np.random.uniform(15, 22)
                ph = np.random.uniform(5.5, 9.0)
                dissolved_oxygen = np.random.uniform(2, 5)
                vibration = np.random.uniform(1.0, 2.0)
                rainfall = np.random.uniform(85, 150)
                risk_level = 3  # Critical
            
            # Add correlations and physics-based relationships
            if water_level > 80:
                pressure += np.random.uniform(5, 15)
                seepage += np.random.uniform(0.5, 2)
            
            if rainfall > 60:
                inflow += rainfall * np.random.uniform(5, 15)
                water_level += np.random.uniform(2, 8)
            
            if structural_stress > 70:
                vibration += np.random.uniform(0.2, 0.6)
                seepage += np.random.uniform(0.5, 1.5)
            
            data.append({
                'waterLevel': water_level,
                'pressure': pressure,
                'seepage': seepage,
                'structuralStress': structural_stress,
                'temperature': temperature,
                'inflow': inflow,
                'outflow': outflow,
                'turbidity': turbidity,
                'ph': ph,
                'dissolvedOxygen': dissolved_oxygen,
                'vibration': vibration,
                'rainfall': rainfall,
                'riskLevel': risk_level
            })
        
        df = pd.DataFrame(data)
        print(f"Generated {len(df)} training samples")
        print(f"Risk distribution:\n{df['riskLevel'].value_counts().sort_index()}")
        
        return df
    
    def train_models(self, df):
        """
        Train multiple ML models and select the best
        """
        print("\nPreparing data for training...")
        
        X = df[self.feature_names]
        y = df['riskLevel']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print(f"\nTraining set size: {len(X_train)}")
        print(f"Test set size: {len(X_test)}")
        
        # Train Random Forest
        print("\n" + "="*60)
        print("Training Random Forest Classifier...")
        print("="*60)
        self.rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.rf_model.fit(X_train_scaled, y_train)
        rf_pred = self.rf_model.predict(X_test_scaled)
        rf_accuracy = accuracy_score(y_test, rf_pred)
        print(f"Random Forest Accuracy: {rf_accuracy:.4f}")
        
        # Train Gradient Boosting
        print("\n" + "="*60)
        print("Training Gradient Boosting Classifier...")
        print("="*60)
        self.gb_model = GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.gb_model.fit(X_train_scaled, y_train)
        gb_pred = self.gb_model.predict(X_test_scaled)
        gb_accuracy = accuracy_score(y_test, gb_pred)
        print(f"Gradient Boosting Accuracy: {gb_accuracy:.4f}")
        
        # Train Neural Network
        print("\n" + "="*60)
        print("Training Neural Network Classifier...")
        print("="*60)
        self.nn_model = MLPClassifier(
            hidden_layer_sizes=(64, 32, 16),
            activation='relu',
            solver='adam',
            max_iter=500,
            random_state=42,
            early_stopping=True
        )
        self.nn_model.fit(X_train_scaled, y_train)
        nn_pred = self.nn_model.predict(X_test_scaled)
        nn_accuracy = accuracy_score(y_test, nn_pred)
        print(f"Neural Network Accuracy: {nn_accuracy:.4f}")
        
        # Ensemble prediction (voting)
        print("\n" + "="*60)
        print("Ensemble Model Performance")
        print("="*60)
        ensemble_pred = np.round((rf_pred + gb_pred + nn_pred) / 3).astype(int)
        ensemble_accuracy = accuracy_score(y_test, ensemble_pred)
        print(f"Ensemble Accuracy: {ensemble_accuracy:.4f}")
        
        # Print detailed classification report
        print("\n" + "="*60)
        print("Detailed Classification Report (Ensemble)")
        print("="*60)
        print(classification_report(y_test, ensemble_pred, 
                                  target_names=['Safe', 'Medium Risk', 'High Risk', 'Critical']))
        
        # Feature importance (from Random Forest)
        print("\n" + "="*60)
        print("Feature Importance (Random Forest)")
        print("="*60)
        importances = self.rf_model.feature_importances_
        indices = np.argsort(importances)[::-1]
        
        for i, idx in enumerate(indices):
            print(f"{i+1}. {self.feature_names[idx]}: {importances[idx]:.4f}")
        
        return {
            'rf_accuracy': rf_accuracy,
            'gb_accuracy': gb_accuracy,
            'nn_accuracy': nn_accuracy,
            'ensemble_accuracy': ensemble_accuracy,
            'feature_importance': dict(zip(self.feature_names, importances))
        }
    
    def predict_risk(self, sensor_data):
        """
        Predict risk level for new sensor data
        """
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
        input_scaled = self.scaler.transform(input_data)
        
        # Get predictions from all models
        rf_pred = self.rf_model.predict_proba(input_scaled)[0]
        gb_pred = self.gb_model.predict_proba(input_scaled)[0]
        nn_pred = self.nn_model.predict_proba(input_scaled)[0]
        
        # Ensemble prediction
        ensemble_proba = (rf_pred + gb_pred + nn_pred) / 3
        risk_level = np.argmax(ensemble_proba)
        confidence = ensemble_proba[risk_level]
        
        risk_labels = ['Safe', 'Medium Risk', 'High Risk', 'Critical']
        
        return {
            'riskLevel': int(risk_level),
            'riskLabel': risk_labels[risk_level],
            'confidence': float(confidence),
            'probabilities': {
                'safe': float(ensemble_proba[0]),
                'medium': float(ensemble_proba[1]),
                'high': float(ensemble_proba[2]),
                'critical': float(ensemble_proba[3])
            },
            'models': {
                'randomForest': int(np.argmax(rf_pred)),
                'gradientBoosting': int(np.argmax(gb_pred)),
                'neuralNetwork': int(np.argmax(nn_pred))
            }
        }
    
    def save_models(self, path='ml-model/models'):
        """
        Save trained models and scaler
        """
        import os
        os.makedirs(path, exist_ok=True)
        
        joblib.dump(self.rf_model, f'{path}/random_forest.pkl')
        joblib.dump(self.gb_model, f'{path}/gradient_boosting.pkl')
        joblib.dump(self.nn_model, f'{path}/neural_network.pkl')
        joblib.dump(self.scaler, f'{path}/scaler.pkl')
        
        # Save metadata
        metadata = {
            'trained_date': datetime.now().isoformat(),
            'feature_names': self.feature_names,
            'model_version': '1.0.0',
            'description': 'Dam Monitoring Risk Prediction Model'
        }
        
        with open(f'{path}/metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"\nModels saved to {path}/")
    
    def load_models(self, path='ml-model/models'):
        """
        Load pre-trained models
        """
        self.rf_model = joblib.load(f'{path}/random_forest.pkl')
        self.gb_model = joblib.load(f'{path}/gradient_boosting.pkl')
        self.nn_model = joblib.load(f'{path}/neural_network.pkl')
        self.scaler = joblib.load(f'{path}/scaler.pkl')
        
        print("Models loaded successfully!")

def main():
    print("="*60)
    print("DAM MONITORING ML MODEL TRAINING")
    print("="*60)
    
    # Initialize model
    model = DamMonitoringMLModel()
    
    # Generate training data
    df = model.generate_training_data(n_samples=10000)
    
    # Train models
    metrics = model.train_models(df)
    
    # Save models
    model.save_models()
    
    # Test prediction
    print("\n" + "="*60)
    print("Testing Model Prediction")
    print("="*60)
    
    test_cases = [
        {
            'name': 'Normal Operation',
            'data': {
                'waterLevel': 65, 'pressure': 70, 'seepage': 3, 
                'structuralStress': 40, 'temperature': 22, 'inflow': 1000,
                'outflow': 950, 'turbidity': 5, 'ph': 7.2, 
                'dissolvedOxygen': 7.5, 'vibration': 0.3, 'rainfall': 15
            }
        },
        {
            'name': 'High Water Level',
            'data': {
                'waterLevel': 85, 'pressure': 95, 'seepage': 5.5, 
                'structuralStress': 65, 'temperature': 20, 'inflow': 1400,
                'outflow': 1200, 'turbidity': 10, 'ph': 7.0, 
                'dissolvedOxygen': 6, 'vibration': 0.7, 'rainfall': 55
            }
        },
        {
            'name': 'Critical Situation',
            'data': {
                'waterLevel': 92, 'pressure': 115, 'seepage': 9, 
                'structuralStress': 88, 'temperature': 18, 'inflow': 1900,
                'outflow': 1500, 'turbidity': 18, 'ph': 6.5, 
                'dissolvedOxygen': 4, 'vibration': 1.5, 'rainfall': 110
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\nTest Case: {test_case['name']}")
        print("-" * 40)
        result = model.predict_risk(test_case['data'])
        print(f"Risk Level: {result['riskLabel']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Probabilities: Safe={result['probabilities']['safe']:.2%}, "
              f"Medium={result['probabilities']['medium']:.2%}, "
              f"High={result['probabilities']['high']:.2%}, "
              f"Critical={result['probabilities']['critical']:.2%}")
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print("\nModel files saved in: ml-model/models/")
    print("- random_forest.pkl")
    print("- gradient_boosting.pkl")
    print("- neural_network.pkl")
    print("- scaler.pkl")
    print("- metadata.json")

if __name__ == "__main__":
    main()
