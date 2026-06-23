import os
import base64

def main():
    scratch_dir = r"C:\Users\Agustin\.gemini\antigravity\scratch"
    logo_path = os.path.join(scratch_dir, "LOGO.png")
    js_path = os.path.join(scratch_dir, "christmas-erp", "js", "logo.js")
    
    if not os.path.exists(logo_path):
        print("No se encontró LOGO.png en la carpeta scratch.")
        return
        
    with open(logo_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')
        
    js_content = f"""// Logotipo corporativo en formato Base64 autocontenido
window.LOGO_BASE64 = "data:image/png;base64,{encoded}";
"""
    
    os.makedirs(os.path.dirname(js_path), exist_ok=True)
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print("logo.js generado con éxito!")

if __name__ == "__main__":
    main()
