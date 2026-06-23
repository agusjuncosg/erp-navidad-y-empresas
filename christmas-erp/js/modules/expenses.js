// Módulo de Gastos y Egresos (NAVIDAD Y EMPRESAS)
// Todos los montos se computan como valores NETOS SIN IVA

class ExpensesModule {
    constructor() {
        this.activeTab = "history"; // "history" o "new"
        this.categories = [
            "Sueldos", 
            "Combustible", 
            "Envíos", 
            "Reparaciones", 
            "Papelería", 
            "Servicios", 
            "Impuestos", 
            "Mantenimiento", 
            "Otros"
        ];
        
        // Filtros del historial
        this.filters = {
            category: "",
            query: "",
            dateFrom: "",
            dateTo: ""
        };
    }

    render(container) {
        // Calcular estadísticas
        let totalExpenses = 0;
        let totalSalaries = 0;
        let totalOthers = 0;

        store.expenses.forEach(e => {
            totalExpenses += e.amount;
            if (e.category === "Sueldos") {
                totalSalaries += e.amount;
            } else {
                totalOthers += e.amount;
            }
        });

        const fmt = (num) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Egresos y Gastos Administrativos <span style="font-size:0.9rem; color:var(--color-gold); font-weight:600;">(NETO SIN IVA)</span></h2>
                    <p>Registro de gastos generales y egresos por salarios liquidados de la Cola de Armado.</p>
                </div>
            </div>

            <div class="kpi-container">
                <div class="kpi-card">
                    <div class="kpi-icon red">📉</div>
                    <div class="kpi-info">
                        <h4>Gastos Totales</h4>
                        <div class="value">${fmt(totalExpenses)}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon blue">🧑‍🏭</div>
                    <div class="kpi-info">
                        <h4>Gastos en Sueldos</h4>
                        <div class="value">${fmt(totalSalaries)}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon gold">🧾</div>
                    <div class="kpi-info">
                        <h4>Gastos Operativos</h4>
                        <div class="value">${fmt(totalOthers)}</div>
                    </div>
                </div>
            </div>

            <div class="tab-container">
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'history' ? 'active' : ''}" id="tab-exp-history">Historial de Gastos</div>
                    <div class="tab ${this.activeTab === 'new' ? 'active' : ''}" id="tab-exp-new">Registrar Nuevo Gasto</div>
                </div>
            </div>

            <div id="expenses-content-area">
                <!-- Se inyecta dinámicamente -->
            </div>
        `;

        document.getElementById("tab-exp-history").addEventListener("click", () => this.switchTab("history"));
        document.getElementById("tab-exp-new").addEventListener("click", () => this.switchTab("new"));

        this.renderActiveTab();
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        this.renderActiveTab();
    }

    renderActiveTab() {
        const area = document.getElementById("expenses-content-area");
        if (this.activeTab === "history") {
            this.renderHistoryTab(area);
        } else {
            this.renderNewExpenseTab(area);
        }
    }

    // --- TAB 1: HISTORIAL DE GASTOS ---
    renderHistoryTab(container) {
        const fmt = (num) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);

        // Opciones del selector de categorías en filtros
        let catOptions = `<option value="">Todas las categorías</option>`;
        this.categories.forEach(cat => {
            catOptions += `<option value="${cat}" ${this.filters.category === cat ? 'selected' : ''}>${cat}</option>`;
        });

        // Filtrar egresos
        const filteredExpenses = store.expenses.filter(e => {
            if (this.filters.category && e.category !== this.filters.category) {
                return false;
            }
            if (this.filters.query) {
                const q = this.filters.query.toLowerCase();
                const descMatch = e.description && e.description.toLowerCase().includes(q);
                const noteMatch = e.notes && e.notes.toLowerCase().includes(q);
                const empMatch = e.employeeName && e.employeeName.toLowerCase().includes(q);
                if (!descMatch && !noteMatch && !empMatch) return false;
            }
            if (this.filters.dateFrom && e.date < this.filters.dateFrom) {
                return false;
            }
            if (this.filters.dateTo && e.date > this.filters.dateTo) {
                return false;
            }
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id));

        // Calcular desglose por categoría para el panel lateral
        const breakdown = {};
        this.categories.forEach(cat => breakdown[cat] = 0);
        store.expenses.forEach(e => {
            if (breakdown[e.category] !== undefined) {
                breakdown[e.category] += e.amount;
            } else {
                breakdown["Otros"] += e.amount;
            }
        });

        let breakdownHtml = "";
        const totalAll = store.expenses.reduce((sum, e) => sum + e.amount, 0);

        this.categories.forEach(cat => {
            const amt = breakdown[cat];
            const pct = totalAll > 0 ? Math.round((amt / totalAll) * 100) : 0;
            if (amt > 0) {
                breakdownHtml += `
                    <div style="margin-bottom:12px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
                            <strong>${cat}</strong>
                            <span>${fmt(amt)} (${pct}%)</span>
                        </div>
                        <div style="background-color: var(--bg-sidebar); height: 6px; border-radius:3px; overflow:hidden;">
                            <div style="background-color: var(--color-gold); width: ${pct}%; height: 100%;"></div>
                        </div>
                    </div>
                `;
            }
        });

        let rowsHtml = "";
        filteredExpenses.forEach(e => {
            // Distinguir gastos de sueldos automáticos
            let refText = e.notes || "";
            if (e.category === "Sueldos" && e.employeeName) {
                refText = `Liquidación operario: <strong>${e.employeeName}</strong>. ID Jornal: ${e.attendanceId}`;
            }

            rowsHtml += `
                <tr>
                    <td><strong>${new Date(e.date + "T00:00:00").toLocaleDateString("es-AR")}</strong></td>
                    <td><strong>${e.description}</strong></td>
                    <td><span class="badge" style="background-color:var(--bg-sidebar); color:var(--color-text); border:1px solid var(--color-border); font-weight:600;">${e.category}</span></td>
                    <td style="font-weight:600; color:var(--color-red);">${fmt(e.amount)}</td>
                    <td style="font-size:0.8rem; color:var(--color-text-muted); max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${refText.replace(/<[^>]*>/g, '')}">${refText}</td>
                    <td>
                        <button class="btn btn-red btn-sm" onclick="expensesModule.deleteExpense('${e.id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 3fr 1.2fr; gap:24px;">
                <!-- Panel Principal: Buscador y Tabla -->
                <div>
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-title">Filtros de Búsqueda</div>
                        <div class="form-row" style="display:grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap:12px;">
                            <div class="form-group">
                                <label>Búsqueda libre</label>
                                <input type="text" id="filter-exp-query" class="form-control" placeholder="Concepto, operario..." value="${this.filters.query}">
                            </div>
                            <div class="form-group">
                                <label>Categoría</label>
                                <select id="filter-exp-category" class="form-control">
                                    ${catOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Fecha Desde</label>
                                <input type="date" id="filter-exp-date-from" class="form-control" value="${this.filters.dateFrom}">
                            </div>
                            <div class="form-group">
                                <label>Fecha Hasta</label>
                                <input type="date" id="filter-exp-date-to" class="form-control" value="${this.filters.dateTo}">
                            </div>
                        </div>
                        <div style="display:flex; justify-content: flex-end; gap:8px; margin-top:12px;">
                            <button class="btn btn-secondary btn-sm" onclick="expensesModule.resetFilters()">Limpiar Filtros</button>
                            <button class="btn btn-primary btn-sm" onclick="expensesModule.applyFilters()">Aplicar Filtros</button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Concepto / Descripción</th>
                                        <th>Categoría</th>
                                        <th>Monto</th>
                                        <th>Notas / Referencias</th>
                                        <th style="width:70px;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml || '<tr><td colspan="6" style="text-align:center; color:var(--color-text-muted);">No se encontraron gastos con los filtros aplicados.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Panel Lateral: Desglose por Categoría -->
                <div class="card" style="height: fit-content;">
                    <div class="card-title">Desglose por Categoría</div>
                    <div style="margin-top:15px;">
                        ${breakdownHtml || '<p style="color:var(--color-text-muted); text-align:center; font-size:0.85rem;">No hay gastos registrados para analizar.</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    applyFilters() {
        this.filters.query = document.getElementById("filter-exp-query").value.trim();
        this.filters.category = document.getElementById("filter-exp-category").value;
        this.filters.dateFrom = document.getElementById("filter-exp-date-from").value;
        this.filters.dateTo = document.getElementById("filter-exp-date-to").value;
        this.renderActiveTab();
    }

    resetFilters() {
        this.filters = {
            category: "",
            query: "",
            dateFrom: "",
            dateTo: ""
        };
        this.renderActiveTab();
    }

    // --- TAB 2: REGISTRAR NUEVO GASTO ---
    renderNewExpenseTab(container) {
        const todayStr = new Date().toISOString().split('T')[0];

        // Opciones del selector de categorías para carga (excluir "Sueldos" por ser automático, aunque dejarlo al final con aclaración)
        let catOptions = "";
        this.categories.forEach(cat => {
            if (cat === "Sueldos") {
                catOptions += `<option value="${cat}">${cat} (Liquidación automática)</option>`;
            } else {
                catOptions += `<option value="${cat}">${cat}</option>`;
            }
        });

        container.innerHTML = `
            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <div class="card-title" style="margin-bottom:15px;">Registrar Comprobante de Gasto</div>
                <form id="form-new-expense" onsubmit="expensesModule.saveExpense(event)">
                    <div class="form-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom: 12px;">
                        <div class="form-group">
                            <label>Fecha del Gasto *</label>
                            <input type="date" id="exp-date" class="form-control" value="${todayStr}" required>
                        </div>
                        <div class="form-group">
                            <label>Categoría *</label>
                            <select id="exp-category" class="form-control" required>
                                ${catOptions}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label>Monto Neto ($) *</label>
                        <input type="number" id="exp-amount" class="form-control" min="0.01" step="0.01" placeholder="Ej: 4500" required>
                    </div>

                    <div class="form-group" style="margin-bottom: 12px;">
                        <label>Concepto / Descripción Corta *</label>
                        <input type="text" id="exp-description" class="form-control" placeholder="Ej: Pago de Luz Edenor / Nafta furgón" required>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label>Notas de Comprobante / Observaciones Adicionales</label>
                        <textarea id="exp-notes" class="form-control" rows="4" placeholder="Detalles de facturas, n° ticket, método de pago..."></textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid var(--color-border); padding-top:15px;">
                        <button type="button" class="btn btn-secondary" onclick="expensesModule.cancelNewExpense()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Registrar Egreso</button>
                    </div>
                </form>
            </div>
        `;
    }

    cancelNewExpense() {
        this.switchTab("history");
    }

    saveExpense(e) {
        e.preventDefault();
        const date = document.getElementById("exp-date").value;
        const category = document.getElementById("exp-category").value;
        const amount = parseFloat(document.getElementById("exp-amount").value) || 0;
        const description = document.getElementById("exp-description").value.trim();
        const notes = document.getElementById("exp-notes").value.trim();

        if (!date || !category || amount <= 0 || !description) {
            app.showToast("Todos los campos marcados con asterisco son requeridos", "error");
            return;
        }

        const expense = {
            id: "exp_" + Date.now(),
            date,
            category,
            amount,
            description,
            notes
        };

        store.expenses.push(expense);
        store.saveData();

        app.showToast(`Gasto por $${amount.toLocaleString('es-AR')} registrado con éxito.`, "success");
        this.switchTab("history");
    }

    deleteExpense(expenseId) {
        const idx = store.expenses.findIndex(e => e.id === expenseId);
        if (idx === -1) return;

        const expense = store.expenses[idx];
        
        let confirmMsg = `¿Está seguro de que desea eliminar este registro de gasto de $${expense.amount.toLocaleString('es-AR')}?`;
        if (expense.category === "Sueldos" && expense.attendanceId) {
            confirmMsg = `⚠️ ADVERTENCIA: Este gasto de Sueldos se generó automáticamente al liquidar la asistencia diaria del operario "${expense.employeeName}". \n\nSi lo elimina de aquí, no se revertirá el estado del jornal en la Cola de Armado. Se recomienda anularlo desde la Cola de Armado para mantener la integridad de los datos.\n\n¿Desea eliminarlo de todos modos?`;
        }

        if (!confirm(confirmMsg)) {
            return;
        }

        store.expenses.splice(idx, 1);
        store.saveData();

        app.showToast("Registro de gasto eliminado.", "info");
        this.renderActiveTab();
    }
}

// Registrar en el objeto global
window.expensesModule = new ExpensesModule();
