import os
import sys
import subprocess

# Asegurar que openpyxl esté instalado
try:
    import openpyxl
except ImportError:
    print("Instalando la librería 'openpyxl' necesaria para leer archivos de Excel...")
    subprocess.run([sys.executable, "-m", "pip", "install", "openpyxl"], check=True)
    import openpyxl

sys.stdout.reconfigure(encoding='utf-8')

def read_excel_products(file_path):
    wb = openpyxl.load_workbook(file_path, data_only=True)
    sheet = wb.active
    print(f"Hoja activa: {sheet.title}")
    
    rows = list(sheet.iter_rows(values_only=True))
    output_lines = []
    
    # Procesar filas
    current_category = "General"
    output_lines.append(f"Categoría: {current_category}")
    
    for row in rows:
        # Si la fila está vacía, saltar
        if not any(row):
            continue
        
        # Detectar posible encabezado o categoría (celda única no vacía o estilo)
        non_empty = [val for val in row if val is not None]
        if len(non_empty) == 1 and isinstance(non_empty[0], str) and len(non_empty[0]) > 2:
            # Podría ser una categoría
            val = non_empty[0].strip()
            if val.lower() not in ["producto", "marca", "categoría", "precio"]:
                current_category = val
                output_lines.append(f"\nCategoría: {current_category}")
                continue
                
        # Procesar fila de producto
        prod_name = row[0]
        brand = row[1] if len(row) > 1 else None
        
        if prod_name:
            prod_str = str(prod_name).strip()
            brand_str = str(brand).strip() if brand else ""
            
            # Evitar repetir cabeceras
            if prod_str.lower() in ["producto", "artículo", "nombre"]:
                continue
                
            if brand_str:
                output_lines.append(f"- {prod_str} ({brand_str})")
            else:
                output_lines.append(f"- {prod_str}")
                
    return "\n".join(output_lines)

def main():
    scratch_dir = r"C:\Users\Agustin\.gemini\antigravity\scratch"
    file_path = os.path.join(scratch_dir, "Productos.xlsx")
    
    if not os.path.exists(file_path):
        print(f"No se encontró el archivo en: {file_path}")
        return
        
    print("=== Leyendo Productos.xlsx ===")
    content = read_excel_products(file_path)
    
    # Guardar en archivo .txt
    out_path = os.path.join(scratch_dir, "Productos_Extraidos.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Productos extraídos con éxito.")
    print("--- Contenido extraído ---")
    print(content[:1500] + "\n..." if len(content) > 1500 else content)

if __name__ == "__main__":
    main()
