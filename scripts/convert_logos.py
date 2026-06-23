import os
import base64

def main():
    scratch_dir = r"C:\Users\Agustin\.gemini\antigravity\scratch"
    logo_navidad_path = os.path.join(scratch_dir, "LOGO NAVIDAD Y EMPRESAS.png")
    logo_golosinas_path = os.path.join(scratch_dir, "LOGO GOLOSINAS Y COMESTIBLES.png")
    js_path = os.path.join(scratch_dir, "christmas-erp", "js", "logo.js")
    
    # Navidad y Empresas Logo
    if os.path.exists(logo_navidad_path):
        with open(logo_navidad_path, "rb") as f:
            navidad_encoded = base64.b64encode(f.read()).decode('utf-8')
    else:
        print("No se encontró LOGO NAVIDAD Y EMPRESAS.png")
        navidad_encoded = ""
        
    # Golosinas y Comestibles Logo
    if os.path.exists(logo_golosinas_path):
        with open(logo_golosinas_path, "rb") as f:
            golosinas_encoded = base64.b64encode(f.read()).decode('utf-8')
    else:
        print("No se encontró LOGO GOLOSINAS Y COMESTIBLES.png")
        golosinas_encoded = ""
        
    js_content = f"""// Logotipos corporativos en formato Base64 autocontenidos
window.LOGO_NAVIDAD_Y_EMPRESAS = "data:image/png;base64,{navidad_encoded}";
window.LOGO_GOLOSINAS_Y_COMESTIBLES = "data:image/png;base64,{golosinas_encoded}";
window.LOGO_BASE64 = window.LOGO_NAVIDAD_Y_EMPRESAS; // Fallback
"""
    
    os.makedirs(os.path.dirname(js_path), exist_ok=True)
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print("logo.js generado con éxito conteniendo ambos logotipos!")

if __name__ == "__main__":
    main()
