import numpy as np
import cv2
from dam_condition_analyzer import DamConditionAnalyzer

analyzer = DamConditionAnalyzer()

print("=" * 60)
print("TESTING IMPROVED VALIDATION")
print("=" * 60)

# Test 1: Blank image (should FAIL)
blank_img = np.ones((500,500,3), dtype=np.uint8) * 100
result1 = analyzer.analyze_image(blank_img)
print("\n✓ Test 1 (Blank Image):")
print(f"  Status: {result1.get('status')}")
print(f"  Message: {result1.get('message', 'SUCCESS')}")

# Test 2: Random noise image (should FAIL)
random_img = np.random.randint(0, 255, (500,500,3), dtype=np.uint8)
result2 = analyzer.analyze_image(random_img)
print("\n✓ Test 2 (Random Noise):")
print(f"  Status: {result2.get('status')}")
print(f"  Message: {result2.get('message', 'SUCCESS')}")

# Test 3: Natural-looking image (should SUCCEED)
natural_img = np.zeros((500,500,3), dtype=np.uint8)
cv2.rectangle(natural_img, (50,100), (450,400), (120,120,120), -1)
cv2.line(natural_img, (100,200), (400,200), (80,80,80), 3)
cv2.line(natural_img, (100,250), (400,250), (80,80,80), 3)
cv2.line(natural_img, (100,300), (400,300), (80,80,80), 3)
cv2.circle(natural_img, (250,250), 20, (60,60,60), -1)
result3 = analyzer.analyze_image(natural_img)
print("\n✓ Test 3 (Natural Structure):")
print(f"  Status: {result3.get('status')}")
print(f"  Message: {result3.get('message', 'SUCCESS')}")

print("\n" + "=" * 60)
print("SUMMARY:")
print("=" * 60)
print(f"Blank Image: {result1.get('status')} (EXPECTED: error)")
print(f"Random Noise: {result2.get('status')} (EXPECTED: error)")
print(f"Natural Structure: {result3.get('status')} (EXPECTED: success)")
print("=" * 60)
