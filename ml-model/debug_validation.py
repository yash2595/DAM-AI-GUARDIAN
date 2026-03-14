import numpy as np
import cv2

# Test random noise
random_img = np.random.randint(0, 255, (500,500,3), dtype=np.uint8)
gray = cv2.cvtColor(random_img, cv2.COLOR_RGB2GRAY)

# Check metrics
std_dev = np.std(gray)
laplacian = cv2.Laplacian(gray, cv2.CV_64F)
laplacian_variance = np.var(laplacian)

edges = cv2.Canny(gray, 100, 200)
edge_density = np.count_nonzero(edges) / gray.size

hsv = cv2.cvtColor(random_img, cv2.COLOR_RGB2HSV)
avg_saturation = np.mean(hsv[:,:,1])

print("RANDOM NOISE METRICS:")
print(f"  Std Dev: {std_dev}")
print(f"  Laplacian Variance: {laplacian_variance}")
print(f"  Edge Density: {edge_density}")
print(f"  Avg Saturation: {avg_saturation}")
print()
print("CURRENT CHECKS:")
print(f"  std_dev < 10? {std_dev < 10} (FAILS: {std_dev < 10})")
print(f"  laplacian_variance > 50000? {laplacian_variance > 50000}")
print(f"  edge_density < 0.005? {edge_density < 0.005}")
print(f"  edge_density > 0.4? {edge_density > 0.4}")
print(f"  avg_saturation > 180? {avg_saturation > 180}")
