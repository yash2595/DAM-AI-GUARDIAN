"""
Flask API for Dam Physical Condition Analysis
Provides endpoints for analyzing dam images
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import traceback
import numpy as np
from dam_condition_analyzer import DamConditionAnalyzer

app = Flask(__name__)
CORS(app)

# Initialize analyzer
analyzer = DamConditionAnalyzer()

@app.route('/', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Dam Condition Analysis API',
        'version': '1.0.0'
    }), 200

@app.route('/analyze-dam', methods=['POST'])
def analyze_dam():
    """
    Analyze dam image for physical condition
    
    Expected JSON:
    {
        "image": "base64_encoded_image_data",
        "dam_name": "Dam Name",
        "location": "Location",
        "dam_type": "Concrete/Earthen/Arch",
        "construction_year": 2000
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Extract metadata
        dam_name = data.get('dam_name', 'Unknown')
        location = data.get('location', 'Unknown')
        dam_type = data.get('dam_type', 'Concrete')
        construction_year = data.get('construction_year')
        
        # Analyze image
        result = analyzer.analyze_image(data['image'])
        
        if result.get('status') == 'error':
            return jsonify({'error': result.get('message', 'Analysis failed')}), 400
        
        # Add metadata to result
        result['dam_metadata'] = {
            'name': dam_name,
            'location': location,
            'type': dam_type,
            'construction_year': construction_year
        }
        
        # Final safety check for JSON serializability
        def force_serializable(obj):
            if isinstance(obj, dict):
                return {k: force_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [force_serializable(x) for x in obj]
            elif isinstance(obj, (np.integer, np.floating, np.bool_)):
                if isinstance(obj, np.bool_):
                    return bool(obj)
                return obj.item()
            elif isinstance(obj, np.ndarray):
                return force_serializable(obj.tolist())
            return obj

        serializable_result = force_serializable(result)
        return jsonify(serializable_result), 200
    
    except Exception as e:
        print(f"Error in analyze_dam: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e)
        }), 500

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Analyze multiple dam images
    
    Expected JSON:
    {
        "images": [
            {
                "image": "base64_data",
                "dam_name": "Dam1"
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'images' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        results = []
        errors = []
        
        for idx, img_data in enumerate(data['images']):
            try:
                dam_name = img_data.get('dam_name', f'Dam_{idx}')
                location = img_data.get('location', 'Unknown')
                dam_type = img_data.get('dam_type', 'Concrete')
                construction_year = img_data.get('construction_year')
                
                result = analyzer.analyze_image(img_data['image'])
                
                if result['status'] != 'error':
                    result['dam_metadata'] = {
                        'name': dam_name,
                        'location': location,
                        'type': dam_type,
                        'construction_year': construction_year
                    }
                    results.append(result)
                else:
                    errors.append({
                        'dam_name': dam_name,
                        'error': result.get('message', 'Unknown error')
                    })
            
            except Exception as e:
                errors.append({
                    'dam_name': img_data.get('dam_name', f'Dam_{idx}'),
                    'error': str(e)
                })
        
        return jsonify({
            'status': 'completed',
            'total': len(data['images']),
            'successful': len(results),
            'failed': len(errors),
            'results': results,
            'errors': errors if errors else None
        }), 200
    
    except Exception as e:
        print(f"Error in batch_analyze: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': 'Batch analysis failed',
            'message': str(e)
        }), 500

@app.route('/condition-levels', methods=['GET'])
def get_condition_levels():
    """Get condition level definitions"""
    return jsonify({
        'levels': analyzer.condition_levels,
        'score_scale': {
            '85-100': 'Excellent',
            '70-84': 'Good',
            '50-69': 'Fair',
            '30-49': 'Poor',
            '0-29': 'Critical'
        }
    }), 200

@app.route('/analysis-factors', methods=['GET'])
def get_analysis_factors():
    """Get list of factors analyzed"""
    return jsonify({
        'factors': [
            {
                'name': 'Cracks',
                'description': 'Surface and structural cracks',
                'severity_levels': ['None', 'Minor', 'Moderate', 'Severe']
            },
            {
                'name': 'Surface Wear',
                'description': 'Material degradation and weathering',
                'severity_levels': ['None', 'Minor', 'Moderate', 'Severe']
            },
            {
                'name': 'Moisture/Seepage',
                'description': 'Water infiltration and moisture buildup',
                'levels': ['Low', 'Medium', 'High']
            },
            {
                'name': 'Algae Growth',
                'description': 'Biological growth on surface',
                'metric': 'Coverage percentage'
            },
            {
                'name': 'Structural Damage',
                'description': 'Major structural defects and damage',
                'severity_levels': ['None', 'Minor', 'Moderate', 'Severe']
            },
            {
                'name': 'Erosion',
                'description': 'Surface erosion and material loss',
                'severity_levels': ['None', 'Minor', 'Moderate', 'Severe']
            }
        ]
    }), 200

@app.route('/sample-analysis', methods=['GET'])
def get_sample_analysis():
    """Get a sample analysis result for testing"""
    return jsonify({
        'status': 'success',
        'timestamp': '2026-03-14T12:00:00',
        'overall_condition': 2,
        'condition_score': 65.5,
        'risk_level': 'Medium',
        'analysis': {
            'cracks': {
                'detected': True,
                'severity': 'Moderate',
                'coverage': 2.5
            },
            'surface_wear': {
                'level': 'Moderate',
                'coverage': 18.3
            },
            'moisture': {
                'detected': True,
                'level': 'Medium',
                'areas': 3
            },
            'algae_growth': {
                'detected': True,
                'coverage': 8.2
            },
            'structural_damage': {
                'detected': False,
                'severity': None,
                'areas': 0
            },
            'erosion': {
                'detected': True,
                'level': 'Minor'
            }
        },
        'recommendations': [
            '⚠️ Significant cracks found - Schedule detailed inspection within 1 month',
            '💧 Moisture present - Review waterproofing',
            '🍃 Algae growth observed - Schedule cleaning'
        ],
        'next_inspection': '1 month'
    }), 200

if __name__ == '__main__':
    print("="*60)
    print("DAM CONDITION ANALYSIS API")
    print("="*60)
    print("\nStarting Flask server...")
    print("API will be available at: http://localhost:5002")
    print("\nEndpoints:")
    print("  GET  /                    - API information")
    print("  POST /analyze-dam         - Analyze single dam image")
    print("  POST /batch-analyze       - Analyze multiple dam images")
    print("  GET  /condition-levels    - Get condition level definitions")
    print("  GET  /analysis-factors    - Get analysis factors")
    print("  GET  /sample-analysis     - Get sample analysis result")
    print("\n" + "="*60)
    
    app.run(debug=True, host='0.0.0.0', port=5002)
