import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def parse_extracted_products(txt_path):
    products = []
    current_category = "General"
    
    exclude_keywords = [
        "productos (empresa)", "productos (total)", 
        "el fernet y la coca cola, no tienen descuentos",
        "vigencia de la cotización", "la caja puede personalizarse",
        "esta bonificada la personalizacion", "tiene un costo de",
        "el tiempo de taller", "la caja es de cartón",
        "entrega de las cajas", "las cajas se entregan",
        "costo de envío", "fecha de entrega", "confirmacion del pedido",
        "validez de la oferta", "forma de pago", "descuento financiero"
    ]
    
    with open(txt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    prod_id = 1
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith("Categoría:"):
            current_category = line.replace("Categoría:", "").strip()
            continue
            
        if line.startswith("-"):
            item_text = line[1:].strip()
            
            if any(keyword in item_text.lower() for keyword in exclude_keywords):
                continue
                
            brand = ""
            match = re.search(r'\(([^)]+)\)$', item_text)
            if match:
                brand = match.group(1).strip()
                item_text = re.sub(r'\s*\([^)]+\)$', '', item_text).strip()
            
            # Asignar costo estimado neto sin IVA según categoría
            cost = 1000.0
            cat_lower = current_category.lower()
            if "sidra" in cat_lower or "fizz" in cat_lower:
                cost = 2500.0 if "1888" in item_text else 1200.0
            elif "vino" in cat_lower or "norton" in cat_lower or "trivento" in cat_lower or "salentein" in cat_lower:
                cost = 4500.0
                if "reserve" in item_text.lower() or "catena" in item_text.lower():
                    cost = 8500.0
            elif "champagne" in cat_lower or "espumante" in cat_lower:
                cost = 5000.0
            elif "pan dulce" in cat_lower or "pannetone" in cat_lower or "pannettone" in cat_lower:
                cost = 2200.0
                if "almendras" in item_text.lower():
                    cost = 3800.0
            elif "budin" in cat_lower:
                cost = 900.0
            elif "turrón" in cat_lower or "tabletas" in cat_lower or "crocantes" in cat_lower:
                cost = 700.0
                if "almendras" in item_text.lower() or "estuche" in item_text.lower():
                    cost = 1500.0
            elif "bañados" in cat_lower or "chocolate" in cat_lower:
                cost = 1100.0
            elif "caja" in cat_lower:
                cost = 1500.0
                if "personalizada" in item_text.lower():
                    cost = 2000.0
            elif "fernet" in cat_lower:
                cost = 6500.0
            elif "coca cola" in cat_lower:
                cost = 1500.0
                
            price = round(cost / 0.7, -1) # Margen de aprox 30%, redondeado a decena
            
            # Inicializar stock
            stock = 120
            if "personalizada" in item_text.lower():
                stock = 0 
            
            # Crear código de producto único
            code = f"COD-{brand[:3].upper().replace('.','').strip()}-{prod_id:03d}" if brand else f"COD-GEN-{prod_id:03d}"
            
            products.append({
                "id": f"prod_{prod_id}",
                "code": code,
                "name": item_text,
                "brand": brand or "NAVIDAD Y EMPRESAS",
                "category": current_category,
                "cost": float(cost),
                "price": float(price),
                "stock": stock
            })
            prod_id += 1
            
    return products

def generate_store_js(products, target_path):
    import json
    products_json = json.dumps(products, indent=4, ensure_ascii=False)
    
    js_content = f"""// Motor de datos y persistencia del ERP de Cajas Navideñas (NAVIDAD Y EMPRESAS)
// Todos los precios y costos en el sistema se consideran NETOS SIN IVA.

const INITIAL_CATALOG = {products_json};

const INITIAL_LEADS = [
    {{
        id: "lead_1",
        clientName: "Empresa Transportes Andes",
        contactName: "Raúl Gómez",
        phone: "+54 351 555-1234",
        email: "rgomez@transportesandes.com.ar",
        source: "WhatsApp",
        notes: "Interesado en 150 cajas corporativas medianas. Presupuesto estimado para fines de noviembre.",
        status: "Contactado",
        date: "2026-11-15T10:30:00Z",
        reminders: [
            {{ id: "rem_1", text: "Llamar para definir contenido", date: "2026-11-20", done: false }}
        ]
    }},
    {{
        id: "lead_2",
        clientName: "Sanatorio de la Sierra",
        contactName: "Dra. Marta Paz",
        phone: "+54 351 987-6543",
        email: "compras@sanatoriosierra.com",
        source: "Email",
        notes: "Consulta por 400 cajas Premium. Requieren factura A y entrega fraccionada en Córdoba Capital.",
        status: "En Negociación",
        date: "2026-11-16T14:15:00Z",
        reminders: []
    }}
];

const INITIAL_EMPLOYEES = [
    {{ id: "emp_1", name: "Juan Pérez", hourlyRate: 2500, extraHourlyRate: 3750 }},
    {{ id: "emp_2", name: "María Gómez", hourlyRate: 2500, extraHourlyRate: 3750 }},
    {{ id: "emp_3", name: "Pedro Rodríguez", hourlyRate: 2500, extraHourlyRate: 3750 }},
    {{ id: "emp_4", name: "Ana Martínez", hourlyRate: 2700, extraHourlyRate: 4050 }},
    {{ id: "emp_5", name: "Lucas Peralta", hourlyRate: 2400, extraHourlyRate: 3600 }}
];

// Asistencia por operario y por fecha
const INITIAL_ATTENDANCE = [
    {{ id: "att_1", date: "2026-11-30", employeeId: "emp_1", clockIn: "08:00", clockOut: "16:00", hours: 8.0, normalHours: 8.0, extraHours: 0.0, totalPay: 20000 }},
    {{ id: "att_2", date: "2026-11-30", employeeId: "emp_2", clockIn: "08:00", clockOut: "17:30", hours: 9.5, normalHours: 8.0, extraHours: 1.5, totalPay: 25625 }},
    {{ id: "att_3", date: "2026-11-30", employeeId: "emp_4", clockIn: "09:00", clockOut: "15:30", hours: 6.5, normalHours: 6.5, extraHours: 0.0, totalPay: 17550 }},
    {{ id: "att_4", date: "2026-12-01", employeeId: "emp_1", clockIn: "08:00", clockOut: "16:00", hours: 8.0, normalHours: 8.0, extraHours: 0.0, totalPay: 20000 }}
];

const INITIAL_COMBOS = [
    {{
        id: "combo_premium",
        name: "Caja Navideña Premium 1888",
        price: 35000,
        items: [
            {{ prodId: "prod_5", qty: 1 }}, // CAJA CON MOTIVOS NAVIDEÑOS 350 x 210 x 350
            {{ prodId: "prod_18", qty: 1 }}, // SIDRA 1888 SAENZ BRIONES X750 CC
            {{ prodId: "prod_28", qty: 1 }}, // VINO TRIVENTO RESERVA MALBEC
            {{ prodId: "prod_72", qty: 1 }}, // PAN DULCE STEINHAUSER ALMENDRAS
            {{ prodId: "prod_91", qty: 1 }}, // BUDIN MUSEL C/NUEZ Y ALMENDRAS
            {{ prodId: "prod_128", qty: 1 }} // VIZZIO ALMENDRAS ESTUCHE
        ]
    }},
    {{
        id: "combo_clasico",
        name: "Caja Navideña Clásica",
        price: 18500,
        items: [
            {{ prodId: "prod_3", qty: 1 }}, // CAJA CON MOTIVOS NAVIDEÑOS 300 x 160 x 340
            {{ prodId: "prod_16", qty: 1 }}, // SIDRA REAL ETIQUETA BLANCA
            {{ prodId: "prod_23", qty: 1 }}, // VINO CALLIA MALBEC
            {{ prodId: "prod_62", qty: 1 }}, // PAN DULCE BONAFIDE CON FRUTAS
            {{ prodId: "prod_78", qty: 1 }}, // BUDIN BONAFIDE VAINILLA
            {{ prodId: "prod_99", qty: 2 }}  // TURRON DE MANI GEORGALOS
        ]
    }}
];

const INITIAL_ORDERS = [
    {{
        id: "ord_1",
        leadId: "lead_1",
        clientName: "Empresa Transportes Andes",
        cuit: "30-58392019-9",
        date: "2026-11-18",
        numberOfBoxes: 50,
        internalShippingCost: 15000, // Gasto interno de la empresa (no suma al precio del cliente)
        boxRecipe: [
            {{ type: "combo", id: "combo_clasico", name: "Caja Navideña Clásica", qty: 1, price: 18500, cost: 12500 }}
        ],
        total: 925000, // (1 * 18500 * 50) = 925000. El shipping NO forma parte de la venta
        costEst: 625000, // (1 * 12500 * 50)
        margin: 300000, // (925000 - 625000) = 300000
        status: "Presupuesto Enviado",
        validUntil: "2026-11-28",
        deliveryDate: "2026-12-10",
        deliveryAddress: "Av. Vélez Sarsfield 2500",
        deliveryLocation: "Córdoba Capital",
        assignedDriver: "",
        invoiceStatus: "No Facturado",
        paymentStatus: "Impago",
        payments: [],
        assemblyStatus: "Pendiente",
        assemblyPhoto: "",
        signedRemitoPhoto: "",
        scheduledInvoices: [
            {{ id: "task_1_1", desc: "Factura inicial (100% de la venta)", date: "2026-11-18", percent: 100, amount: 925000, status: "Pendiente", ref: "" }}
        ],
        history: [
            {{ date: "2026-11-18T11:00:00Z", user: "Vendedor1", action: "Creación del presupuesto comercial (Sin IVA)" }},
            {{ date: "2026-11-18T11:05:00Z", user: "Vendedor1", action: "Presupuesto enviado a cliente" }}
        ]
    }},
    {{
        id: "ord_2",
        leadId: "",
        clientName: "Supermercados El Dino",
        cuit: "30-99281722-5",
        date: "2026-11-10",
        numberOfBoxes: 100,
        internalShippingCost: 45000,
        boxRecipe: [
            {{ type: "combo", id: "combo_premium", name: "Caja Navideña Premium 1888", qty: 1, price: 35000, cost: 24000 }},
            {{ type: "product", id: "prod_47", qty: 1, name: "FERNET BRANCA X750 CC", price: 9290, cost: 6500 }},
            {{ type: "product", id: "prod_50", qty: 2, name: "COCA COLA X2250 CC", price: 2140, cost: 1500 }}
        ],
        // Costo caja unitario = 24000 + 6500 + (1500*2) = 33500
        // Venta caja unitario = 35000 + 9290 + (2140*2) = 48570
        // Total venta = 48570 * 100 = 4857000
        // Total costo = 33500 * 100 = 3350000
        // Margen = 1507000
        total: 4857000,
        costEst: 3350000,
        margin: 1507000,
        status: "Confirmado",
        validUntil: "2026-11-20",
        deliveryDate: "2026-12-05",
        deliveryAddress: "Ruta 9, Km 550",
        deliveryLocation: "Villa María",
        assignedDriver: "Transporte Express",
        invoiceStatus: "Facturado Parcial (50%)",
        paymentStatus: "Señado",
        payments: [
            {{ id: "pay_1", amount: 2428500, date: "2026-11-12", method: "Transferencia", notes: "Seña de confirmación (50% neto)" }}
        ],
        assemblyStatus: "En Proceso",
        assemblyPhoto: "",
        signedRemitoPhoto: "",
        scheduledInvoices: [
            {{ id: "task_2_1", desc: "Factura inicial - Seña (50%)", date: "2026-11-10", percent: 50, amount: 2428500, status: "Realizada", ref: "A-0001-0982312" }},
            {{ id: "task_2_2", desc: "Factura final - Saldo (50%)", date: "2026-12-05", percent: 50, amount: 2428500, status: "Pendiente", ref: "" }}
        ],
        history: [
            {{ date: "2026-11-10T09:00:00Z", user: "Admin", action: "Creación de presupuesto" }},
            {{ date: "2026-11-12T15:30:00Z", user: "Admin", action: "Seña del 50% registrada. Pedido Confirmado." }}
        ]
    }}
];

const DEFAULT_GLOBAL_SETTINGS = {{
    jornadaNormal: 8.0,
    valorHoraNormal: 2500,
    valorHoraExtra: 3750,
    notasAlPie: `CAJA PERSONALIZADA

La Caja puede PERSONALIZARSE con la imagen corporativa de la empresa en las 5 caras visibles.
Está bonificada la personalización por el volumen de cajas adquiridas.
Tiene un costo de $ 0 más IVA por caja.
El tiempo de taller e imprenta hasta tener la caja terminada es de 40 días corridos.
La caja es de cartón microcorrugado forrado con cartulina impresa full color con terminación de barniz.

ENTREGA DE LAS CAJAS

Las cajas se entregan palletizadas con esquineros y film stretch.
Costo de envío: Ciudad de Córdoba sin cargo.
Fecha de entrega: La determina el cliente.`
}};

class ChristmasERPStore {{
    constructor() {{
        this.loadData();
    }}

    loadData() {{
        const stored = localStorage.getItem("christmas_erp_data_v2");
        if (stored) {{
            try {{
                const data = JSON.parse(stored);
                this.products = data.products || INITIAL_CATALOG;
                this.leads = data.leads || INITIAL_LEADS;
                this.employees = data.employees || INITIAL_EMPLOYEES;
                this.attendance = data.attendance || INITIAL_ATTENDANCE;
                this.combos = data.combos || INITIAL_COMBOS;
                this.orders = data.orders || INITIAL_ORDERS;
                this.settings = data.settings || DEFAULT_GLOBAL_SETTINGS;
            }} catch (e) {{
                console.error("Error al cargar localStorage, usando datos por defecto", e);
                this.resetToDefaults();
            }}
        }} else {{
            this.resetToDefaults();
        }}
    }}

    saveData() {{
        const data = {{
            products: this.products,
            leads: this.leads,
            employees: this.employees,
            attendance: this.attendance,
            combos: this.combos,
            orders: this.orders,
            settings: this.settings
        }};
        localStorage.setItem("christmas_erp_data_v2", JSON.stringify(data));
    }}

    resetToDefaults() {{
        this.products = JSON.parse(jsonCopy(INITIAL_CATALOG));
        this.leads = JSON.parse(jsonCopy(INITIAL_LEADS));
        this.employees = JSON.parse(jsonCopy(INITIAL_EMPLOYEES));
        this.attendance = JSON.parse(jsonCopy(INITIAL_ATTENDANCE));
        this.combos = JSON.parse(jsonCopy(INITIAL_COMBOS));
        this.orders = JSON.parse(jsonCopy(INITIAL_ORDERS));
        this.settings = JSON.parse(jsonCopy(DEFAULT_GLOBAL_SETTINGS));
        this.saveData();
    }}
}}

function jsonCopy(obj) {{
    return JSON.stringify(obj);
}}

window.store = new ChristmasERPStore();
// Soporte para versión vieja de datos limpia
localStorage.removeItem("christmas_erp_data");
"""

    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"store.js actualizado generado en {target_path}")

def main():
    scratch_dir = r"C:\Users\Agustin\.gemini\antigravity\scratch"
    txt_path = os.path.join(scratch_dir, "Productos_Extraidos.txt")
    target_path = os.path.join(scratch_dir, "christmas-erp", "js", "store.js")
    
    if not os.path.exists(txt_path):
        print(f"No se encontró el txt en: {txt_path}")
        return
        
    products = parse_extracted_products(txt_path)
    print(f"Total productos reales procesados con códigos: {len(products)}")
    generate_store_js(products, target_path)

if __name__ == "__main__":
    main()
