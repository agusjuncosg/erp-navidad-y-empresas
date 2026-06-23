import os
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call(["pip", "install", "Pillow"])
    from PIL import Image

logo_path = os.path.join("..", "LOGO.png")
if not os.path.exists(logo_path):
    logo_path = "LOGO.png"

if os.path.exists(logo_path):
    img = Image.open(logo_path)
    img = img.convert('RGB')
    # Resize to speed up and average colors
    img.thumbnail((150, 150))
    
    # Get all colors
    colors = img.getdata()
    
    # Count frequencies
    from collections import Counter
    counter = Counter(colors)
    
    # Print the most common colors that are not white/black/transparent-ish
    print("Most common colors in LOGO.png (R, G, B) and Hex:")
    count = 0
    for rgb, freq in counter.most_common(100):
        # Ignore very light/very dark background colors
        r, g, b = rgb
        # Skip pure white/black and greys
        if abs(r - g) < 15 and abs(g - b) < 15 and abs(r - b) < 15:
            continue
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        print(f"  {hex_color} - RGB: {rgb} - Freq: {freq}")
        count += 1
        if count >= 10:
            break
else:
    print("LOGO.png not found!")
