import os

filepath = 'js/inventory.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target_1 = """            // Calcular Stock Comprometido basado en pedidos confirmados o en producción
            let comprometido = 0;
            store.orders.forEach(order => {
                if (order.status === "Confirmado" || order.status === "En Producción") {
                    order.items.forEach(item => {
                        if (item.type === "product" && item.id === p.id) {
                            comprometido += item.qty;
                        } else if (item.type === "combo") {
                            const combo = store.combos.find(c => c.id === item.id);
                            if (combo) {
                                combo.items.forEach(ci => {
                                    if (ci.prodId === p.id) {
                                        comprometido += (ci.qty * item.qty);
                                    }
                                });
                            }
                        }
                    });
                }
            });"""

replacement_1 = """            // Calcular Stock Comprometido basado en pedidos confirmados o en producción
            let comprometido = 0;
            store.orders.forEach(order => {
                if (order.status === "Confirmado" || order.status === "En Producción") {
                    const flatRecipe = store.expandRecipe(order.boxRecipe, order.numberOfBoxes);
                    if (flatRecipe[p.id]) {
                        comprometido += flatRecipe[p.id];
                    }
                }
            });"""

target_2 = """    deleteCombo(comboId) {
        if (confirm("¿Está seguro de eliminar este combo?")) {
            store.combos = store.combos.filter(c => c.id !== comboId);
            store.saveData();
            app.showToast("Combo eliminado", "success");
            this.renderActiveTab();
        }
    }"""

replacement_2 = """    deleteCombo(comboId) {
        const activeOrders = store.orders.filter(order => {
            const isFinished = ["Cancelado", "Entregado", "Cerrado"].includes(order.status);
            if (isFinished) return false;
            return order.boxRecipe.some(item => item.type === "combo" && item.id === comboId);
        });

        if (activeOrders.length > 0) {
            const orderList = activeOrders.map(o => `#${o.id.substring(4)} (${o.clientName})`).join(", ");
            app.showToast(`No se puede eliminar el combo. Está asignado a pedidos activos: ${orderList}`, "error");
            return;
        }

        if (confirm("¿Está seguro de eliminar este combo?")) {
            store.combos = store.combos.filter(c => c.id !== comboId);
            store.saveData();
            app.showToast("Combo eliminado", "success");
            this.renderActiveTab();
        }
    }"""

# Normalize
content_normalized = content.replace('\r\n', '\n')
target_1_n = target_1.replace('\r\n', '\n')
replacement_1_n = replacement_1.replace('\r\n', '\n')
target_2_n = target_2.replace('\r\n', '\n')
replacement_2_n = replacement_2.replace('\r\n', '\n')

if target_1_n in content_normalized:
    content_normalized = content_normalized.replace(target_1_n, replacement_1_n)
    print("✅ Success replacing comprometido stock loop")
else:
    print("❌ Failed replacing comprometido stock loop")

if target_2_n in content_normalized:
    content_normalized = content_normalized.replace(target_2_n, replacement_2_n)
    print("✅ Success replacing deleteCombo")
else:
    print("❌ Failed replacing deleteCombo")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content_normalized.replace('\n', '\r\n'))
print("File inventory.js written successfully.")
