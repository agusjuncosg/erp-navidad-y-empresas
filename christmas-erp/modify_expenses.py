import os

filepath = 'js/expenses.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    deleteExpense(expenseId) {
        if (confirm("¿Está seguro de eliminar este egreso de caja?")) {
            store.expenses = store.expenses.filter(e => e.id !== expenseId);
            store.saveData();
            app.showToast("Egreso eliminado", "success");
            this.render(document.getElementById("main-content"));
        }
    }"""

replacement = """    deleteExpense(expenseId) {
        if (confirm("¿Está seguro de eliminar este egreso de caja?")) {
            const exp = store.expenses.find(e => e.id === expenseId);
            if (exp) {
                if (exp.attendanceIds && Array.isArray(exp.attendanceIds)) {
                    exp.attendanceIds.forEach(id => {
                        const rec = store.attendance.find(a => a.id === id);
                        if (rec) {
                            rec.paymentStatus = "Pendiente";
                        }
                    });
                }
            }
            store.expenses = store.expenses.filter(e => e.id !== expenseId);
            store.saveData();
            app.showToast("Egreso eliminado", "success");
            this.render(document.getElementById("main-content"));
        }
    }"""

# Normalize
content_normalized = content.replace('\r\n', '\n')
target_n = target.replace('\r\n', '\n')
replacement_n = replacement.replace('\r\n', '\n')

if target_n in content_normalized:
    content_normalized = content_normalized.replace(target_n, replacement_n)
    print("✅ Success replacing deleteExpense")
else:
    print("❌ Failed replacing deleteExpense")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content_normalized.replace('\n', '\r\n'))
print("File expenses.js written successfully.")
