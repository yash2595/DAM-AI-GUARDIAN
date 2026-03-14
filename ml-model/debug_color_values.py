"""
Debug color values in test images
"""

import numpy as np
from PIL import Image
from colorsys import rgb_to_hsv

def create_realistic_non_dam_image(image_type):
    """Create realistic images that are NOT dams"""
    if image_type == "landscape":
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

def rgb_to_hsv_modified(r, g, b):
    """Convert RGB (0-255) to HSV (0-180, 0-255, 0-255) like OpenCV"""
    h, s, v = rgb_to_hsv(r/255.0, g/255.0, b/255.0)
    return int(h * 180), int(s * 255), int(v * 255)

# Load and analyze
for img_type in ["landscape", "text_document"]:
    img = create_realistic_non_dam_image(img_type)
    arr = np.array(img)
    
    print(f"\n{img_type.upper()}")
    print("="*40)
    print(f"Shape: {arr.shape}")
    print(f"Min RGB: {arr.min(axis=(0,1))}")
    print(f"Max RGB: {arr.max(axis=(0,1))}")
    mean_rgb = arr.mean(axis=(0,1))
    print(f"Mean RGB: [{mean_rgb[0]:.0f}, {mean_rgb[1]:.0f}, {mean_rgb[2]:.0f}]")
    
    # Convert to HSV (manually)
    hsv_arr = np.zeros_like(arr)
    for i in range(arr.shape[0]):
        for j in range(arr.shape[1]):
            r, g, b = arr[i, j]
            h, s, v = rgb_to_hsv_modified(r, g, b)
            hsv_arr[i, j] = [h, s, v]
    
    print(f"\nHSV Stats:")
    print(f"  Hue (0-180): min={hsv_arr[:,:,0].min()}, max={hsv_arr[:,:,0].max()}, mean={hsv_arr[:,:,0].mean():.1f}")
    print(f"  Saturation (0-255): min={hsv_arr[:,:,1].min()}, max={hsv_arr[:,:,1].max()}, mean={hsv_arr[:,:,1].mean():.1f}")
    print(f"  Value (0-255): min={hsv_arr[:,:,2].min()}, max={hsv_arr[:,:,2].max()}, mean={hsv_arr[:,:,2].mean():.1f}")
    
    # Green detection
    green_mask = ((hsv_arr[:,:,0] > 25) & (hsv_arr[:,:,0] < 90))
    green_pixels = np.count_nonzero(green_mask)
    green_ratio = green_pixels / hsv_arr.size
    print(f"\nGreen pixels (Hue 25-90): {green_ratio*100:.1f}%")
    
    # Light pixels
    light_pixels = np.count_nonzero(hsv_arr[:,:,2] > 200)
    light_ratio = light_pixels / hsv_arr.size
    print(f"Very light pixels (Value > 200): {light_ratio*100:.1f}%")
    if light_pixels > 0:
        print(f"Avg saturation for light pixels: {hsv_arr[hsv_arr[:,:,2] > 200, 1].mean():.1f}")
