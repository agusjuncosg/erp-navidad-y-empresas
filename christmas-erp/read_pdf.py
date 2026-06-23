import os
import re

try:
    import pypdf
except ImportError:
    import subprocess
    subprocess.check_call(["pip", "install", "pypdf"])
    import pypdf

pdf_path = os.path.join("..", "Identidad - Navidad y Empresas.pdf")
if not os.path.exists(pdf_path):
    # Try current directory
    pdf_path = "Identidad - Navidad y Empresas.pdf"

if os.path.exists(pdf_path):
    print("Found PDF at:", pdf_path)
    reader = pypdf.PdfReader(pdf_path)
    print("Total pages:", len(reader.pages))
    
    # Extract text from all pages and look for HEX colors or font names
    full_text = ""
    for i in range(len(reader.pages)):
        text = reader.pages[i].extract_text()
        full_text += f"\n--- Page {i+1} ---\n" + text
        
    # Search for color patterns like #FFFFFF or RGB/CMYK, and font names like Inter, Outfit, Montserrat, etc.
    hex_colors = set(re.findall(r'#[0-9a-fA-F]{6}\b', full_text))
    print("\nPotential HEX colors found in PDF:")
    for c in hex_colors:
        print("  ", c)
        
    print("\nSearching for color terms (rojo, verde, dorado, oro, burdeos, vino, crema, blanco, negro, gris)...")
    for word in ["color", "paleta", "rojo", "verde", "dorado", "oro", "burdeos", "vino", "crema", "blanco", "negro", "pantone"]:
        matches = [line.strip() for line in full_text.split('\n') if word in line.lower()]
        print(f"Matches for '{word}': {len(matches)}")
        for m in matches[:5]:
            print("  ", m)
            
    print("\nSearching for typography terms...")
    for word in ["font", "fuente", "tipografia", "tipo", "family"]:
        matches = [line.strip() for line in full_text.split('\n') if word in line.lower()]
        print(f"Matches for '{word}': {len(matches)}")
        for m in matches[:5]:
            print("  ", m)
            
    # Write full text to a text file for easy manual reading if needed
    with open("extracted_identity_text.txt", "w", encoding="utf-8") as f:
        f.write(full_text)
    print("\nSaved full extracted text to extracted_identity_text.txt")
else:
    print("PDF not found!")
