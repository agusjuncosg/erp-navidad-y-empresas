import os

filepath = 'js/purchases.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Target savePurchase item loop
target_1 = """        // Impactar stock de insumos físicos y actualizar costos si corresponde
        newPurchase.items.forEach(item => {
            const prod = store.products.find(p => p.id === item.prodId);
            if (prod) {
                prod.stock += item.qty;
                if (updateCosts) {
                    prod.cost = item.cost;
                    // Sugerir nuevo precio de venta manteniendo el margen o cargando el costo neto sin IVA
                    prod.price = Math.round(item.cost * 1.4); // 40% margen comercial por defecto
                }
            }
        });"""

replacement_1 = """        // Impactar stock de insumos físicos y actualizar costos si corresponde
        newPurchase.items.forEach(item => {
            const prod = store.products.find(p => p.id === item.prodId);
            if (prod) {
                item.previousCost = prod.cost; // Guardar costo anterior en el ítem de la compra
                prod.stock += item.qty;
                if (updateCosts) {
                    prod.cost = item.cost;
                    // Sugerir nuevo precio de venta manteniendo el margen o cargando el costo neto sin IVA
                    prod.price = Math.round(item.cost * 1.4); // 40% margen comercial por defecto
                }
            }
        });"""

# Target openAnnulConfirmation and annulPurchase
target_2 = """    openAnnulConfirmation(purchaseId) {
        const pur = store.purchases.find(p => p.id === purchaseId);
        if (!pur) return;

        if (confirm(`¿Está seguro de ANULAR la factura de compra #${pur.invoiceNumber}? Esta acción restará el stock ingresado y anulará el egreso de caja automático.`)) {
            this.annulPurchase(purchaseId);
        }
    }

    annulPurchase(purchaseId) {
        const pur = store.purchases.find(p => p.id === purchaseId);
        if (!pur) return;

        // Restar stock
        pur.items.forEach(item => {
            const prod = store.products.find(p => p.id === item.prodId);
            if (prod) {
                prod.stock -= item.qty;
            }
        });

        // Cambiar estado de compra
        pur.status = "Anulada";

        // Buscar y eliminar el egreso de caja asociado
        if (store.expenses) {
            store.expenses = store.expenses.filter(e => e.refId !== purchaseId);
        }

        store.saveData();
        app.showToast("Factura de Compra anulada. Stock y egresos descontados.", "success");
        this.render(document.getElementById("main-content"));
    }"""

replacement_2 = """    openAnnulConfirmation(purchaseId) {
        const pur = store.purchases.find(p => p.id === purchaseId);
        if (!pur) return;
        if (pur.status === "Anulada") {
            app.showToast("Esta factura ya se encuentra anulada.", "error");
            return;
        }

        let leavesNegativeStock = false;
        let negativeItems = [];
        pur.items.forEach(item => {
            const prod = store.products.find(p => p.id === item.prodId);
            if (prod && (prod.stock - item.qty < 0)) {
                leavesNegativeStock = true;
                negativeItems.push(`- ${prod.name} (Stock actual: ${prod.stock}, Resta: ${item.qty})`);
            }
        });

        let confirmMsg = `¿Está seguro de ANULAR la factura de compra #${pur.invoiceNumber}? Esta acción restará el stock ingresado y anulará el egreso de caja automático.`;
        if (leavesNegativeStock) {
            confirmMsg = `⚠️ ADVERTENCIA: La anulación de esta factura dejará los siguientes insumos con stock físico NEGATIVO:\\n\\n` +
                         negativeItems.join('\\n') + 
                         `\\n\\n¿Desea anular la factura de todos modos?`;
        }

        if (confirm(confirmMsg)) {
            this.annulPurchase(purchaseId);
        }
    }

    annulPurchase(purchaseId) {
        const pur = store.purchases.find(p => p.id === purchaseId);
        if (!pur) return;
        if (pur.status === "Anulada") {
            app.showToast("Esta factura ya se encuentra anulada.", "error");
            return;
        }

        // Restar stock y revertir costo si corresponde
        pur.items.forEach(item => {
            const prod = store.products.find(p => p.id === item.prodId);
            if (prod) {
                prod.stock -= item.qty;
                if (pur.costsUpdated && item.previousCost !== undefined) {
                    prod.cost = item.previousCost;
                    prod.price = Math.round(item.previousCost * 1.4); // Restaurar también el precio sugerido
                }
            }
        });

        // Cambiar estado de compra
        pur.status = "Anulada";

        // Buscar y eliminar el egreso de caja asociado
        if (store.expenses) {
            store.expenses = store.expenses.filter(e => e.refId !== purchaseId);
        }

        store.saveData();
        app.showToast("Factura de Compra anulada. Stock, costos y egresos actualizados.", "success");
        this.render(document.getElementById("main-content"));
    }"""

# Normalize
content_normalized = content.replace('\r\n', '\n')
target_1_n = target_1.replace('\r\n', '\n')
replacement_1_n = replacement_1.replace('\r\n', '\n')
target_2_n = target_2.replace('\r\n', '\n')
replacement_2_n = replacement_2.replace('\r\n', '\n')

if target_1_n in content_normalized:
    content_normalized = content_normalized.replace(target_1_n, replacement_1_n)
    print("✅ Success replacing savePurchase loop")
else:
    print("❌ Failed replacing savePurchase loop")

if target_2_n in content_normalized:
    content_normalized = content_normalized.replace(target_2_n, replacement_2_n)
    print("✅ Success replacing annulPurchase")
else:
    print("❌ Failed replacing annulPurchase")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content_normalized.replace('\n', '\r\n'))
print("File purchases.js written successfully.")
