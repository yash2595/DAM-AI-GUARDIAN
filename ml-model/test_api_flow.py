import requests
import numpy as np
import cv2
import base64
from io import BytesIO
from PIL import Image

print("=" * 70)
print("TESTING COMPLETE DAM ANALYSIS PIPELINE")
print("=" * 70)

# Test 1: Random noise (should be rejected)
print("\n[TEST 1] Random Noise Image")
print("-" * 70)
random_img = np.random.randint(0, 255, (500, 500, 3), dtype=np.uint8)
_, buffer = cv2.imencode('.png', random_img)
base64_image = base64.b64encode(buffer).decode('utf-8')

payload = {
    "image": f"data:image/png;base64,{base64_image}",
    "dam_name": "Test Dam",
    "location": "Test Location",
    "dam_type": "Concrete",
    "construction_year": 2020
}

try:
    response = requests.post("http://localhost:5002/analyze-dam", json=payload, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"ERROR: {str(e)}")

# Test 2: Structured image (should be accepted)
print("\n[TEST 2] Natural Structure Image")
print("-" * 70)
natural_img = np.zeros((500, 500, 3), dtype=np.uint8)
cv2.rectangle(natural_img, (50, 100), (450, 400), (120, 120, 120), -1)
cv2.line(natural_img, (100, 200), (400, 200), (80, 80, 80), 3)
cv2.line(natural_img, (100, 250), (400, 250), (80, 80, 80), 3)
cv2.line(natural_img, (100, 300), (400, 300), (80, 80, 80), 3)
cv2.circle(natural_img, (250, 250), 20, (60, 60, 60), -1)

_, buffer = cv2.imencode('.png', natural_img)
base64_image = base64.b64encode(buffer).decode('utf-8')

payload = {
    "image": f"data:image/png;base64,{base64_image}",
    "dam_name": "Real Dam",
    "location": "River Valley",
    "dam_type": "Concrete",
    "construction_year": 2015
}

try:
    response = requests.post("http://localhost:5002/analyze-dam", json=payload, timeout=10)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Status: {result.get('status')}")
    print(f"Message: {result.get('message', 'N/A')}")
    if 'error_type' in result:
        print(f"Error Type: {result.get('error_type')}")
    if 'overall_condition' in result:
        print(f"Overall Condition: {result.get('overall_condition')}")
        print(f"Condition Score: {result.get('condition_score')}")
except Exception as e:
    print(f"ERROR: {str(e)}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
