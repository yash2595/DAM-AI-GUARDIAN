"""
Dam Physical Condition Analysis using Computer Vision
Analyzes dam photos to assess structural condition
"""

import cv2
import numpy as np
from PIL import Image
import io
import base64
from datetime import datetime

class DamConditionAnalyzer:
    """Analyze dam physical condition from images"""
    
    def __init__(self):
        self.condition_levels = {
            0: {'label': 'Excellent', 'risk': 'Low', 'color': 'green'},
            1: {'label': 'Good', 'risk': 'Low', 'color': 'lightgreen'},
            2: {'label': 'Fair', 'risk': 'Medium', 'color': 'yellow'},
            3: {'label': 'Poor', 'risk': 'High', 'color': 'orange'},
            4: {'label': 'Critical', 'risk': 'Critical', 'color': 'red'}
        }
    
    def analyze_image(self, image_data):
        """
        Analyze dam image for physical condition
        Returns condition assessment with details
        """
        try:
            # Convert base64 to image
            if isinstance(image_data, str):
                image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
                image = Image.open(io.BytesIO(image_bytes))
            else:
                image = image_data
            
            # Convert to numpy array
            image_array = np.array(image)
            
            # Convert BGR to grayscale if needed
            if len(image_array.shape) == 3:
                gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = image_array
            
            # Analyze various aspects
            results = {
                'cracks': self._detect_cracks(gray),
                'surface_wear': self._assess_surface_wear(gray),
                'moisture': self._detect_moisture(gray),
                'algae_growth': self._detect_algae(image_array),
                'structural_damage': self._detect_structural_damage(gray),
                'erosion': self._assess_erosion(gray)
            }
            
            # Calculate overall condition
            overall_score = self._calculate_overall_score(results)
            condition_level = self._get_condition_level(overall_score)
            
            return {
                'status': 'success',
                'timestamp': datetime.now().isoformat(),
                'overall_condition': condition_level,
                'condition_score': round(overall_score, 2),  # 0-100
                'risk_level': self.condition_levels[condition_level]['risk'],
                'analysis': {
                    'cracks': {
                        'detected': results['cracks']['detected'],
                        'severity': results['cracks']['severity'],  # None, Minor, Moderate, Severe
                        'coverage': round(results['cracks']['coverage'], 2)  # percentage
                    },
                    'surface_wear': {
                        'level': results['surface_wear']['level'],  # None, Minor, Moderate, Severe
                        'coverage': round(results['surface_wear']['coverage'], 2)
                    },
                    'moisture': {
                        'detected': results['moisture']['detected'],
                        'level': results['moisture']['level'],  # Low, Medium, High
                        'areas': results['moisture']['affected_areas']
                    },
                    'algae_growth': {
                        'detected': results['algae_growth']['detected'],
                        'coverage': round(results['algae_growth']['coverage'], 2)
                    },
                    'structural_damage': {
                        'detected': results['structural_damage']['detected'],
                        'severity': results['structural_damage']['severity'],
                        'areas': results['structural_damage']['damaged_areas']
                    },
                    'erosion': {
                        'detected': results['erosion']['detected'],
                        'level': results['erosion']['level']
                    }
                },
                'recommendations': self._get_recommendations(condition_level, results),
                'next_inspection': self._get_next_inspection_date(condition_level)
            }
        
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
                'error_type': type(e).__name__
            }
    
    def _detect_cracks(self, gray):
        """Detect cracks in dam surface"""
        # Apply morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        morph = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
        
        # Edge detection
        edges = cv2.Canny(morph, 50, 150)
        
        # Dilate to connect nearby edges
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        dilated = cv2.dilate(edges, kernel, iterations=2)
        
        # Calculate metrics
        crack_pixels = np.count_nonzero(dilated)
        total_pixels = gray.size
        coverage = (crack_pixels / total_pixels) * 100
        
        if coverage < 1:
            severity = None
        elif coverage < 3:
            severity = 'Minor'
        elif coverage < 7:
            severity = 'Moderate'
        else:
            severity = 'Severe'
        
        return {
            'detected': coverage > 0.5,
            'severity': severity,
            'coverage': coverage,
            'pixel_count': crack_pixels
        }
    
    def _assess_surface_wear(self, gray):
        """Assess surface wear and degradation"""
        # Calculate histogram
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = hist.flatten() / hist.sum()
        
        # Wear increases variance in pixel values
        variance = np.var(gray)
        
        # Map variance to wear level
        if variance < 500:
            level = None
        elif variance < 1500:
            level = 'Minor'
        elif variance < 3000:
            level = 'Moderate'
        else:
            level = 'Severe'
        
        # Calculate coverage as percentage of varied pixels
        threshold = np.percentile(gray, 25)
        wear_pixels = np.count_nonzero(np.abs(gray - np.mean(gray)) > threshold)
        coverage = (wear_pixels / gray.size) * 100
        
        return {
            'level': level,
            'variance': float(variance),
            'coverage': coverage
        }
    
    def _detect_moisture(self, gray):
        """Detect moisture and water damage"""
        # Lower pixel values often indicate moisture
        darker_regions = np.count_nonzero(gray < 100)
        moisture_percentage = (darker_regions / gray.size) * 100
        
        if moisture_percentage < 5:
            level = 'Low'
            detected = False
        elif moisture_percentage < 15:
            level = 'Medium'
            detected = True
        else:
            level = 'High'
            detected = True
        
        # Estimate affected areas
        num_labels, labeled_array = cv2.connectedComponents((gray < 100).astype(np.uint8))
        
        return {
            'detected': detected,
            'level': level,
            'percentage': float(moisture_percentage),
            'affected_areas': int(num_labels)
        }
    
    def _detect_algae(self, image):
        """Detect algae growth (green discoloration)"""
        if len(image.shape) != 3:
            return {'detected': False, 'coverage': 0}
        
        # Convert to HSV
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Green color range
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([90, 255, 255])
        
        mask = cv2.inRange(hsv, lower_green, upper_green)
        green_pixels = np.count_nonzero(mask)
        coverage = (green_pixels / image.size) * 100
        
        return {
            'detected': coverage > 2,
            'coverage': float(coverage)
        }
    
    def _detect_structural_damage(self, gray):
        """Detect major structural damage"""
        # Use Laplacian for edge detection
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        damage_map = np.abs(laplacian)
        
        # High Laplacian values indicate edges/damage
        threshold = np.percentile(damage_map, 75)
        damage_pixels = np.count_nonzero(damage_map > threshold)
        
        # Find connected components
        binary_damage = (damage_map > threshold).astype(np.uint8)
        num_regions, labeled = cv2.connectedComponents(binary_damage)
        
        damage_percentage = (damage_pixels / gray.size) * 100
        
        if damage_percentage < 1:
            severity = None
        elif damage_percentage < 3:
            severity = 'Minor'
        elif damage_percentage < 6:
            severity = 'Moderate'
        else:
            severity = 'Severe'
        
        return {
            'detected': damage_percentage > 0.5,
            'severity': severity,
            'damaged_areas': int(num_regions),
            'coverage': float(damage_percentage)
        }
    
    def _assess_erosion(self, gray):
        """Assess erosion level"""
        # Erosion creates rough texture with varying pixel values
        # Apply Sobel to detect gradient changes
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        
        magnitude = np.sqrt(sobelx**2 + sobely**2)
        erosion_score = np.mean(magnitude)
        
        if erosion_score < 10:
            level = None
        elif erosion_score < 25:
            level = 'Minor'
        elif erosion_score < 50:
            level = 'Moderate'
        else:
            level = 'Severe'
        
        return {
            'detected': erosion_score > 5,
            'level': level,
            'score': float(erosion_score)
        }
    
    def _calculate_overall_score(self, results):
        """Calculate overall dam condition score (0-100, 100 is best)"""
        score = 100
        
        # Cracks impact
        if results['cracks']['severity'] == 'Minor':
            score -= 10
        elif results['cracks']['severity'] == 'Moderate':
            score -= 25
        elif results['cracks']['severity'] == 'Severe':
            score -= 40
        
        # Surface wear impact
        if results['surface_wear']['level'] == 'Minor':
            score -= 5
        elif results['surface_wear']['level'] == 'Moderate':
            score -= 15
        elif results['surface_wear']['level'] == 'Severe':
            score -= 30
        
        # Moisture impact
        if results['moisture']['level'] == 'Medium':
            score -= 10
        elif results['moisture']['level'] == 'High':
            score -= 25
        
        # Algae growth impact
        score -= min(results['algae_growth']['coverage'], 20)
        
        # Structural damage impact
        if results['structural_damage']['severity'] == 'Minor':
            score -= 15
        elif results['structural_damage']['severity'] == 'Moderate':
            score -= 35
        elif results['structural_damage']['severity'] == 'Severe':
            score -= 50
        
        # Erosion impact
        if results['erosion']['level'] == 'Minor':
            score -= 8
        elif results['erosion']['level'] == 'Moderate':
            score -= 18
        elif results['erosion']['level'] == 'Severe':
            score -= 35
        
        return max(0, min(100, score))
    
    def _get_condition_level(self, score):
        """Convert score to condition level (0-4)"""
        if score >= 85:
            return 0  # Excellent
        elif score >= 70:
            return 1  # Good
        elif score >= 50:
            return 2  # Fair
        elif score >= 30:
            return 3  # Poor
        else:
            return 4  # Critical
    
    def _get_recommendations(self, condition_level, results):
        """Get maintenance recommendations based on analysis"""
        recommendations = []
        
        if results['cracks']['detected']:
            if results['cracks']['severity'] == 'Severe':
                recommendations.append('🚨 URGENT: Major cracks detected - Immediate structural inspection required')
            elif results['cracks']['severity'] == 'Moderate':
                recommendations.append('⚠️  Significant cracks found - Schedule detailed inspection within 1 month')
            else:
                recommendations.append('📝 Minor cracks detected - Monitor and document')
        
        if results['moisture']['detected']:
            if results['moisture']['level'] == 'High':
                recommendations.append('💧 High moisture detected - Improve drainage and check for seepage')
            else:
                recommendations.append('💧 Moisture present - Review waterproofing')
        
        if results['algae_growth']['detected']:
            if results['algae_growth']['coverage'] > 10:
                recommendations.append('🍃 Heavy algae growth - Clean surface and apply anti-algae treatment')
            else:
                recommendations.append('🍃 Algae growth observed - Schedule cleaning')
        
        if results['structural_damage']['detected']:
            recommendations.append('⚠️  Structural damage signs - Conduct professional engineering assessment')
        
        if results['erosion']['detected']:
            if results['erosion']['level'] == 'Severe':
                recommendations.append('📉 Severe erosion - Apply protective coating urgently')
            else:
                recommendations.append('📉 Surface erosion present - Consider protective treatment')
        
        if not recommendations:
            recommendations.append('✅ Dam appears to be in good condition - Continue regular monitoring')
        
        return recommendations
    
    def _get_next_inspection_date(self, condition_level):
        """Recommend next inspection date based on condition"""
        months = {
            0: 12,  # Excellent - annual
            1: 6,   # Good - bi-annual
            2: 3,   # Fair - quarterly
            3: 1,   # Poor - monthly
            4: 0    # Critical - immediate
        }
        
        months_until = months[condition_level]
        if months_until == 0:
            return 'IMMEDIATE'
        else:
            return f'{months_until} month{"s" if months_until > 1 else ""}'

# Test the analyzer
if __name__ == "__main__":
    analyzer = DamConditionAnalyzer()
    print("Dam Condition Analyzer initialized successfully")
    print(f"Condition levels: {analyzer.condition_levels}")
