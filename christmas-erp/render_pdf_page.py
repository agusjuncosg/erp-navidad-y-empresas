import os

try:
    import fitz  # PyMuPDF
except ImportError:
    import subprocess
    subprocess.check_call(["pip", "install", "pymupdf"])
    import fitz

pdf_path = os.path.join("..", "Identidad - Navidad y Empresas.pdf")
if not os.path.exists(pdf_path):
    pdf_path = "Identidad - Navidad y Empresas.pdf"

if os.path.exists(pdf_path):
    doc = fitz.open(pdf_path)
    # Page 9 (0-indexed: index 8)
    if len(doc) > 8:
        page = doc[8]
        pix = page.get_pixmap()
        output_image = "page_9_colors.png"
        pix.save(output_image)
        print(f"Saved page 9 as {output_image}")
        
        # Analyze colors in the image
        from PIL import Image
        img = Image.open(output_image).convert('RGB')
        img.thumbnail((300, 300))
        colors = img.getdata()
        
        from collections import Counter
        counter = Counter(colors)
        
        print("\nDominant non-neutral colors on Page 9:")
        count = 0
        for rgb, freq in counter.most_common(500):
            r, g, b = rgb
            # Skip white, black, grey backgrounds
            if abs(r - g) < 10 and abs(g - b) < 10 and abs(r - b) < 10:
                continue
            if r > 240 and g > 240 and b > 240:
                continue
            if r < 15 and g < 15 and b < 15:
                continue
            hex_color = f"#{r:02x}{g:02x}{b:02x}"
            print(f"  {hex_color} - RGB: {rgb} - Freq: {freq}")
            count += 1
            if count >= 15:
                break
    else:
        print("Page 9 not found, doc length:", len(doc))
else:
    print("PDF not found!")
