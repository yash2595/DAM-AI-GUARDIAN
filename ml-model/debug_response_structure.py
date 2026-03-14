"""
Debug the exact response structure for successful analysis
"""

import requests
import base64
import io
import json
import numpy as np
from PIL import Image

def create_structured_image():
    """Create a structured test image that will pass validation"""
    arr = np.ones((100, 100, 3), dtype=np.uint8) * 128
    arr[20:80, 20:80] = 200
    arr[30:70, 30:70] = 80
    for i in range(20, 30):
        arr[i, 20:80] = 50
    return Image.fromarray(arr, 'RGB')

def image_to_base64_uri(pil_image):
    buffer = io.BytesIO()
    pil_image.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

# Test Backend with structured image
test_img = create_structured_image()
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

print("Testing Backend Structured Image Response")
print("="*60)

response = requests.post(
    'http://localhost:5000/api/dam/analyze',
    data=form_data,
    files=files,
    timeout=30
)

print(f"Status Code: {response.status_code}\n")
print("Full Response JSON:")
print(json.dumps(response.json(), indent=2))
