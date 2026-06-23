import os

filepath = 'js/sales.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Block 1: checkOrderStock
target_1 = """    checkOrderStock(order) {
        let hasFaltantes = false;
        let detail = {};
        
        order.boxRecipe.forEach(item => {
            const neededQty = item.qty * order.numberOfBoxes;
            const prod = store.products.find(p => p.id === item.id);
            if (prod) {
                if (prod.stock < neededQty) {
                    hasFaltantes = true;
                    detail[prod.id] = {
                        name: prod.name,
                        stock: prod.stock,
                        needed: neededQty,
                        diff: neededQty - prod.stock
                    };
                }
            }
        });
        
        return { hasFaltantes, detail };
    }"""

replacement_1 = """    checkOrderStock(order) {
        let hasFaltantes = false;
        let detail = {};
        
        const flatRecipe = store.expandRecipe(order.boxRecipe, order.numberOfBoxes);
        for (const [prodId, neededQty] of Object.entries(flatRecipe)) {
            const prod = store.products.find(p => p.id === prodId);
            if (prod) {
                if (prod.stock < neededQty) {
                    hasFaltantes = true;
                    detail[prod.id] = {
                        name: prod.name,
                        stock: prod.stock,
                        needed: neededQty,
                        diff: neededQty - prod.stock
                    };
                }
            }
        }
        
        return { hasFaltantes, detail };
    }"""

# Block 2: saveBuilderOrder start
target_2 = """        let order = null;
        let isEditing = false;

        if (this.editingOrderId) {
            order = store.orders.find(o => o.id === this.editingOrderId);
            if (order) isEditing = true;
        }"""

replacement_2 = """        let order = null;
        let isEditing = false;
        let oldOrderCopy = null;

        if (this.editingOrderId) {
            order = store.orders.find(o => o.id === this.editingOrderId);
            if (order) {
                isEditing = true;
                oldOrderCopy = JSON.parse(JSON.stringify(order));
            }
        }"""

# Block 3: saveBuilderOrder end
target_3 = """        // Si se está confirmando o modificando un pedido en estado "En Producción" o superior,
        // y ya se descontó el stock de la receta vieja, hay que devolver el stock viejo y descontar el nuevo.
        // Esto corrige el bug de inconsistencia de inventario al editar.
        
        // Si el estado a guardar (saveAsStatus o el del pedido existente) es "En Producción", "Terminado / Listo", "Entregado"
        // y es una edición:"""

replacement_3 = """        // Si se está confirmando o modificando un pedido en estado "En Producción" o superior,
        // y ya se descontó el stock de la receta vieja, hay que devolver el stock viejo y descontar el nuevo.
        // Esto corrige el bug de inconsistencia de inventario al editar.
        const isStockDeducted = status => ["En Producción", "Terminado / Listo", "Entregado"].includes(status);
        if (isEditing && oldOrderCopy && isStockDeducted(oldOrderCopy.status)) {
            // Devolver el stock viejo
            const oldFlatRecipe = store.expandRecipe(oldOrderCopy.boxRecipe, oldOrderCopy.numberOfBoxes);
            for (const [prodId, qty] of Object.entries(oldFlatRecipe)) {
                const prod = store.products.find(p => p.id === prodId);
                if (prod) {
                    prod.stock += qty;
                }
            }
        }
        if (isStockDeducted(order.status)) {
            // Descontar el stock nuevo
            const newFlatRecipe = store.expandRecipe(order.boxRecipe, order.numberOfBoxes);
            for (const [prodId, qty] of Object.entries(newFlatRecipe)) {
                const prod = store.products.find(p => p.id === prodId);
                if (prod) {
                    prod.stock -= qty;
                }
            }
        }

        // Recalcular y sincronizar dinámicamente el estado de pago (paymentStatus)
        const paidTotal = (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
        let payStatus = "Impago";
        if (paidTotal >= order.total) {
            payStatus = "Pagado";
        } else if (paidTotal > 0) {
            payStatus = "Señado";
        }
        order.paymentStatus = payStatus;"""

# Block 4: confirmLogisticsSelection address/location validation
target_4 = """    confirmLogisticsSelection() {
        const realCost = parseFloat(document.getElementById("logistics-real-cost-input").value) || 0;
        const zoneSelect = document.getElementById("logistics-zone-select");
        const zone = zoneSelect ? zoneSelect.value : "";
        const isManual = document.getElementById("logistics-manual-mode").checked;
        const calcMode = isManual ? "manual" : "auto";

        const address = document.getElementById("logistics-address-input").value.trim();
        const location = document.getElementById("logistics-location-input").value.trim();
        const province = document.getElementById("logistics-province-input").value;

        if (!zone) {
            app.showToast("Debe establecer la zona de envío.", "error");
            return;
        }"""

replacement_4 = """    confirmLogisticsSelection() {
        const realCost = parseFloat(document.getElementById("logistics-real-cost-input").value) || 0;
        const zoneSelect = document.getElementById("logistics-zone-select");
        const zone = zoneSelect ? zoneSelect.value : "";
        const isManual = document.getElementById("logistics-manual-mode").checked;
        const calcMode = isManual ? "manual" : "auto";

        const address = document.getElementById("logistics-address-input").value.trim();
        const location = document.getElementById("logistics-location-input").value.trim();
        const province = document.getElementById("logistics-province-input").value;

        if (!address) {
            app.showToast("Debe ingresar la dirección de entrega.", "error");
            return;
        }
        if (!location) {
            app.showToast("Debe ingresar la localidad de entrega.", "error");
            return;
        }
        if (!zone) {
            app.showToast("Debe establecer la zona de envío.", "error");
            return;
        }"""

# Normalize line endings to LF for Python string replacement to be robust
content_normalized = content.replace('\r\n', '\n')
target_1_n = target_1.replace('\r\n', '\n')
replacement_1_n = replacement_1.replace('\r\n', '\n')
target_2_n = target_2.replace('\r\n', '\n')
replacement_2_n = replacement_2.replace('\r\n', '\n')
target_3_n = target_3.replace('\r\n', '\n')
replacement_3_n = replacement_3.replace('\r\n', '\n')
target_4_n = target_4.replace('\r\n', '\n')
replacement_4_n = replacement_4.replace('\r\n', '\n')

# Verify replacements
replacements = [
    (target_1_n, replacement_1_n, "checkOrderStock"),
    (target_2_n, replacement_2_n, "saveBuilderOrder start"),
    (target_3_n, replacement_3_n, "saveBuilderOrder stock / payment recalculation"),
    (target_4_n, replacement_4_n, "confirmLogisticsSelection validation")
]

modified_content = content_normalized
for target, replacement, desc in replacements:
    if target in modified_content:
        modified_content = modified_content.replace(target, replacement)
        print(f"✅ Success replacing {desc}")
    else:
        print(f"❌ Failed to find target for {desc}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(modified_content.replace('\n', '\r\n'))
print("File sales.js written successfully.")
