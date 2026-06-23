import os

filepath = 'js/payments.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Target addInvoiceTask
target_1 = """    addInvoiceTask() {
        const order = store.orders.find(o => o.id === this.selectedOrderId);
        if (!order) return;

        const desc = document.getElementById("task-desc").value.trim();
        const date = document.getElementById("task-date").value;
        const percent = parseFloat(document.getElementById("task-percent").value) || 0;

        if (!desc || !date || percent <= 0) {
            app.showToast("Complete descripción, fecha y un porcentaje válido", "error");
            return;
        }

        const amount = Math.round(order.total * (percent / 100));
        
        if (!order.scheduledInvoices) order.scheduledInvoices = [];
        
        const nextId = "task_" + order.id.substring(4) + "_" + (order.scheduledInvoices.length + 1);

        order.scheduledInvoices.push({
            id: nextId,
            desc,
            date,
            percent,
            amount,
            status: "Pendiente",
            ref: ""
        });"""

replacement_1 = """    addInvoiceTask() {
        const order = store.orders.find(o => o.id === this.selectedOrderId);
        if (!order) return;

        const desc = document.getElementById("task-desc").value.trim();
        const date = document.getElementById("task-date").value;
        const percent = parseFloat(document.getElementById("task-percent").value) || 0;

        if (!desc || !date || percent <= 0) {
            app.showToast("Complete descripción, fecha y un porcentaje válido", "error");
            return;
        }

        const currentTotalPercent = (order.scheduledInvoices || []).reduce((acc, t) => acc + (t.percent || 0), 0);
        if (currentTotalPercent + percent > 100) {
            app.showToast(`El porcentaje total de facturación no puede superar el 100%. Porcentaje actual: ${currentTotalPercent}%, nuevo hito: ${percent}%`, "error");
            return;
        }

        const amount = Math.round(order.total * (percent / 100));
        
        if (!order.scheduledInvoices) order.scheduledInvoices = [];
        
        const nextId = "task_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

        order.scheduledInvoices.push({
            id: nextId,
            desc,
            date,
            percent,
            amount,
            status: "Pendiente",
            ref: ""
        });"""

# Target savePayment
target_2 = """    savePayment() {
        const order = store.orders.find(o => o.id === this.selectedOrderId);
        if (!order) return;

        const amount = parseFloat(document.getElementById("pay-amount").value) || 0;
        const date = document.getElementById("pay-date").value;
        const method = document.getElementById("pay-method").value;
        const notes = document.getElementById("pay-notes").value.trim();

        if (!date || amount <= 0) {
            app.showToast("Complete la fecha y un monto válido", "error");
            return;
        }"""

replacement_2 = """    savePayment() {
        const order = store.orders.find(o => o.id === this.selectedOrderId);
        if (!order) return;

        const rawAmountInput = document.getElementById("pay-amount").value.trim();
        if (rawAmountInput === "" || isNaN(rawAmountInput)) {
            app.showToast("El monto ingresado debe ser un número válido.", "error");
            return;
        }

        const amount = parseFloat(rawAmountInput) || 0;
        const date = document.getElementById("pay-date").value;
        const method = document.getElementById("pay-method").value;
        const notes = document.getElementById("pay-notes").value.trim();

        if (!date || amount <= 0) {
            app.showToast("Complete la fecha y un monto válido", "error");
            return;
        }

        const totalPaid = (order.payments || []).reduce((acc, p) => acc + p.amount, 0);
        const pendingBalance = order.total - totalPaid;

        if (amount > pendingBalance) {
            app.showToast(`El monto a cobrar ($${amount.toLocaleString('es-AR')}) no puede superar el saldo pendiente ($${pendingBalance.toLocaleString('es-AR')}).`, "error");
            return;
        }"""

# Normalize
content_normalized = content.replace('\r\n', '\n')
target_1_n = target_1.replace('\r\n', '\n')
replacement_1_n = replacement_1.replace('\r\n', '\n')
target_2_n = target_2.replace('\r\n', '\n')
replacement_2_n = replacement_2.replace('\r\n', '\n')

if target_1_n in content_normalized:
    content_normalized = content_normalized.replace(target_1_n, replacement_1_n)
    print("✅ Success replacing addInvoiceTask")
else:
    print("❌ Failed replacing addInvoiceTask")

if target_2_n in content_normalized:
    content_normalized = content_normalized.replace(target_2_n, replacement_2_n)
    print("✅ Success replacing savePayment")
else:
    print("❌ Failed replacing savePayment")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content_normalized.replace('\n', '\r\n'))
print("File payments.js written successfully.")
