import os
import zipfile
import xml.etree.ElementTree as ET
import sys

# Configurar salida estándar para soportar UTF-8 en Windows
sys.stdout.reconfigure(encoding='utf-8')

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # Namespace para Word XML
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for para in root.findall('.//w:p', namespaces):
                texts = []
                for text_el in para.findall('.//w:t', namespaces):
                    if text_el.text:
                        texts.append(text_el.text)
                if texts:
                    paragraphs.append("".join(texts))
            
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error leyendo el archivo: {e}"

def main():
    scratch_dir = r"C:\Users\Agustin\.gemini\antigravity\scratch"
    files = os.listdir(scratch_dir)
    docx_files = [f for f in files if f.lower().endswith('.docx')]
    
    if not docx_files:
        print("No se encontraron archivos .docx en la carpeta de scratch.")
        return
        
    for docx_file in docx_files:
        full_path = os.path.join(scratch_dir, docx_file)
        # Limpiar caracteres conflictivos solo para imprimir en pantalla
        safe_display_name = docx_file.encode('ascii', errors='replace').decode('ascii')
        print(f"=== Leyendo archivo: {safe_display_name} ===")
        text = extract_text_from_docx(full_path)
        
        # Guardar en archivo .txt para fácil lectura (siempre en UTF-8)
        out_name = docx_file.rsplit('.', 1)[0] + ".txt"
        out_path = os.path.join(scratch_dir, out_name)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Texto extraído guardado en: {out_name.encode('ascii', errors='replace').decode('ascii')}\n")
        
        # Mostrar los primeros 1000 caracteres
        print("--- Contenido preliminar ---")
        preview = text[:1500]
        # Imprimir de forma segura para la terminal
        print(preview.encode(sys.stdout.encoding, errors='replace').decode(sys.stdout.encoding))
        if len(text) > 1500:
            print("\n... [Archivo truncado en vista previa]")

if __name__ == "__main__":
    main()
