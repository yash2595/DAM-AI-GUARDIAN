"""
Test full integration: Frontend → Backend → Flask API
Mimics exact flow with base64 encoding
"""

import requests
import base64
import io
import numpy as np
from PIL import Image

# Create test images exactly as the frontend sends them
def create_test_image(image_type):
    """Create test images matching what tests showed"""
    if image_type == "blank":
        # Pure white image (should fail: too flat)
        img = Image.new('RGB', (100, 100), color='white')
    elif image_type == "noise":
        # Random noise (should fail: too much laplacian)
        arr = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
        img = Image.fromarray(arr, 'RGB')
    elif image_type == "structured":
        # Structured image with edges (should pass)
        arr = np.ones((100, 100, 3), dtype=np.uint8) * 128
        # Add some structure
        arr[20:80, 20:80] = 200  # Light square
        arr[30:70, 30:70] = 80   # Dark inner square
        # Add some texture
        for i in range(20, 30):
            arr[i, 20:80] = 50
        img = Image.fromarray(arr, 'RGB')
    else:
        return None
    
    return img

def image_to_base64_uri(pil_image):
    """Convert PIL image to base64 data URI (exactly as frontend does)"""
    buffer = io.BytesIO()
    pil_image.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

# Test Backend Endpoint (will proxy to Flask API)
def test_backend_endpoint(image_type):
    """Test the full backend flow"""
    print(f"\n{'='*60}")
    print(f"Testing Backend Endpoint with {image_type} image")
    print(f"{'='*60}")
    
    # Create test image
    test_img = create_test_image(image_type)
    base64_uri = image_to_base64_uri(test_img)
    
    # Prepare form data exactly as frontend does
    form_data = {
        'damName': 'Test Dam',
        'location': 'Test Location',
        'damType': 'Concrete',
        'constructionYear': '2020'
    }
    
    # Convert image to file for form submission
    buffer = io.BytesIO()
    test_img.save(buffer, format='PNG')
    buffer.seek(0)
    
    files = {
        'image': ('test.png', buffer, 'image/png')
    }
    
    # Send to Backend
    try:
        response = requests.post(
            'http://localhost:5000/api/dam/analyze',
            data=form_data,
            files=files,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            response_json = response.json()
            print(f"Response JSON:")
            if response.status_code >= 400:
                if 'error' in response_json:
                    print(f"  Error: {response_json.get('error')}")
                if 'message' in response_json:
                    print(f"  Message: {response_json.get('message')}")
            else:
                print(f"  Status: {response_json.get('status')}")
                if 'condition_score' in response_json:
                    print(f"  Condition Score: {response_json.get('condition_score')}")
        except:
            print(f"Response Text: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

# Test Flask API Directly
def test_flask_api(image_type):
    """Test Flask API endpoint directly"""
    print(f"\n{'='*60}")
    print(f"Testing Flask API with {image_type} image")
    print(f"{'='*60}")
    
    # Create test image
    test_img = create_test_image(image_type)
    base64_uri = image_to_base64_uri(test_img)
    
    # Prepare JSON payload exactly as backend sends it
    payload = {
        'image': base64_uri,
        'dam_name': 'Test Dam',
        'location': 'Test Location',
        'dam_type': 'Concrete',
        'construction_year': 2020
    }
    
    try:
        response = requests.post(
            'http://localhost:5002/analyze-dam',
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        try:
            response_json = response.json()
            print(f"Response JSON:")
            if response.status_code >= 400:
                if 'error' in response_json:
                    print(f"  Error: {response_json.get('error')}")
                if 'message' in response_json:
                    print(f"  Message: {response_json.get('message')}")
            else:
                print(f"  Status: {response_json.get('status')}")
                if 'condition_score' in response_json:
                    print(f"  Condition Score: {response_json.get('condition_score')}")
        except:
            print(f"Response Text: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("\n🧪 FULL INTEGRATION TEST")
    print("Testing complete flow: Frontend → Backend → Flask API")
    
    # Test Backend with all three image types
    for img_type in ["blank", "noise", "structured"]:
        test_backend_endpoint(img_type)
    
    print("\n" + "="*60)
    print("Testing Flask API directly (for comparison)")
    print("="*60)
    
    # Test Flask API with all three image types
    for img_type in ["blank", "noise", "structured"]:
        test_flask_api(img_type)
    
    print("\n✅ Integration test complete!")
