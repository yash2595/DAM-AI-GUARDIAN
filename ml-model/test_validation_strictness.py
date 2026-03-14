"""
Test with realistic non-dam images to ensure validation rejects them
"""

import requests
import base64
import io
import json
import numpy as np
from PIL import Image

def create_realistic_non_dam_image(image_type):
    """Create realistic images that are NOT dams"""
    if image_type == "portrait":
        # A portrait-like image (person's face area)
        img = Image.new('RGB', (150, 200), color=(220, 180, 160))
        pixels = img.load()
        # Add some texture to simulate skin
        for i in range(150):
            for j in range(200):
                pixels[i, j] = (220 + np.random.randint(-10, 10), 
                               180 + np.random.randint(-10, 10),
                               160 + np.random.randint(-10, 10))
        return img
    
    elif image_type == "landscape":
        # Landscape image (sky + ground)
        img = Image.new('RGB', (200, 150))
        pixels = img.load()
        # Sky (light blue)
        for i in range(200):
            for j in range(75):
                pixels[i, j] = (135 + np.random.randint(-10, 10),
                               206 + np.random.randint(-10, 10),
                               235 + np.random.randint(-10, 10))
        # Ground (green)
        for i in range(200):
            for j in range(75, 150):
                pixels[i, j] = (34 + np.random.randint(-10, 10),
                               139 + np.random.randint(-10, 10),
                               34 + np.random.randint(-10, 10))
        return img
    
    elif image_type == "text_document":
        # Document/text image (mostly white with some black text)
        img = Image.new('RGB', (200, 150), color=(255, 255, 255))
        pixels = img.load()
        # Add some text-like markings
        for i in range(50, 150):
            for j in range(20, 120):
                if np.random.random() < 0.1:
                    pixels[i, j] = (0, 0, 0)  # Text pixels
        return img
    
    elif image_type == "smooth_gradient":
        # Smooth gradient (no structure, just color transition)
        img = Image.new('RGB', (150, 150))
        pixels = img.load()
        for i in range(150):
            for j in range(150):
                # Smooth gradient from dark to light
                val = int((i / 150) * 255)
                pixels[i, j] = (val, val, val)
        return img

def image_to_base64_uri(pil_image):
    buffer = io.BytesIO()
    pil_image.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

def test_backend_with_image(image_type):
    """Test backend with a specific image type"""
    print(f"\nTesting: {image_type.upper()}")
    print("-" * 40)
    
    test_img = create_realistic_non_dam_image(image_type)
    form_data = {
        'damName': 'Test Dam',
        'location': 'Test Location',
        'damType': 'Concrete',
        'constructionYear': '2020'
    }
    
    buffer = io.BytesIO()
    test_img.save(buffer, format='PNG')
    buffer.seek(0)
    
    files = {
        'image': ('test.png', buffer, 'image/png')
    }
    
    try:
        response = requests.post(
            'http://localhost:5000/api/dam/analyze',
            data=form_data,
            files=files,
            timeout=30
        )
        
        if response.status_code >= 400:
            data = response.json()
            print(f"❌ REJECTED (Status {response.status_code})")
            print(f"   Error: {data.get('error', 'Unknown')}")
            print(f"   Message: {data.get('message', 'No details')}")
        else:
            data = response.json()
            print(f"✅ ACCEPTED (Status {response.status_code})")
            print(f"   Condition Score: {data.get('analysis', {}).get('condition_score', 'N/A')}")
            print(f"   Risk Level: {data.get('analysis', {}).get('risk_level', 'N/A')}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

print("\n🧪 TESTING VALIDATION STRICTNESS")
print("="*60)
print("Testing non-dam images to ensure they're rejected")
print("="*60)

# Test various non-dam images
test_backend_with_image("portrait")
test_backend_with_image("landscape")
test_backend_with_image("text_document")
test_backend_with_image("smooth_gradient")

print("\n" + "="*60)
print("VALIDATION TEST COMPLETE")
print("="*60)
