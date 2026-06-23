// Módulo de Finanzas y Caja (NAVIDAD Y EMPRESAS)
// Todos los montos se computan como PRECIOS NETOS SIN IVA

class PaymentsModule {
    constructor() {
        this.activeTab = "control"; // "control", "invoicing" o "gastos"
        const currentDate = new Date();
        this.currentCalendarYear = currentDate.getFullYear();
        this.currentCalendarMonth = currentDate.getMonth();
        // Filtros del módulo de gastos (absorbe expenses.js)
        this.expensesFilters = { category: "", query: "", dateFrom: "", dateTo: "" };
        this.expensesCategories = ["Sueldos","Combustible","Envíos","Reparaciones","Papelería","Servicios","Impuestos","Mantenimiento","Otros"];
    }

    // Suma los pagos recibidos de una entidad de facturación
    _entityCollected(ef) {
        return (ef.pagos || []).reduce((s, p) => s + (p.amount || 0), 0);
    }

    // Calcula deuda de una entidad
    _entityDebt(ef) {
        return Math.max(0, (ef.monto || 0) - this._entityCollected(ef));
    }

    render(container) {
        // Calcular estadísticas desde entidadesFacturacion
        let totalSales = 0, totalCollected = 0, totalDebt = 0;
        let deudoresCount = 0;

        store.orders.forEach(order => {
            if (order.status === "Cancelado") return;
            const efs = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
                ? order.entidadesFacturacion
                : [{ monto: order.total || 0, pagos: order.payments || [] }];

            efs.forEach(ef => {
                const monto = ef.monto || 0;
                const cobrado = this._entityCollected(ef);
                const deuda = Math.max(0, monto - cobrado);
                totalSales += monto;
                totalCollected += cobrado;
                totalDebt += deuda;
                if (deuda > 0) deudoresCount++;
            });
        });

        const fmt = (num) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Finanzas &amp; Caja <span style="font-size:0.9rem; color:var(--color-gold); font-weight:600;">(NETO SIN IVA)</span></h2>
                    <p>Control de cobros, facturación programada y registro de gastos operativos.</p>
                </div>
            </div>

            <div class="kpi-container">
                <div class="kpi-card">
                    <div class="kpi-icon blue">💰</div>
                    <div class="kpi-info">
                        <h4>Ventas Totales (Netas)</h4>
                        <div class="value">${fmt(totalSales)}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon green">📈</div>
                    <div class="kpi-info">
                        <h4>Cobrado (Caja)</h4>
                        <div class="value">${fmt(totalCollected)}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon red">📉</div>
                    <div class="kpi-info">
                        <h4>Deuda Pendiente</h4>
                        <div class="value">${fmt(totalDebt)}</div>
                        <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:2px;">${deudoresCount} entidad${deudoresCount !== 1 ? "es" : ""} con saldo</div>
                    </div>
                </div>
            </div>

            <div class="tab-container">
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'agenda'   ? 'active' : ''}" id="tab-pay-agenda">📅 Agenda del Día</div>
                    <div class="tab ${this.activeTab === 'control'  ? 'active' : ''}" id="tab-pay-control">Control de Cobros</div>
                    <div class="tab ${this.activeTab === 'invoicing'? 'active' : ''}" id="tab-pay-calendar">Calendario Financiero</div>
                    <div class="tab ${this.activeTab === 'gastos'   ? 'active' : ''}" id="tab-pay-gastos">Gastos &amp; Egresos</div>
                </div>
            </div>

            <div id="payments-content-area-new"></div>
        `;

        document.getElementById("tab-pay-agenda").addEventListener("click",   () => this.switchTab("agenda"));
        document.getElementById("tab-pay-control").addEventListener("click",  () => this.switchTab("control"));
        document.getElementById("tab-pay-calendar").addEventListener("click", () => this.switchTab("invoicing"));
        document.getElementById("tab-pay-gastos").addEventListener("click",   () => this.switchTab("gastos"));

        this.renderActiveTab();
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        this.renderActiveTab();
    }

    renderActiveTab() {
        const area = document.getElementById("payments-content-area-new");
        if      (this.activeTab === "agenda")   this.renderAgendaTab(area);
        else if (this.activeTab === "control")  this.renderControlTab(area);
        else if (this.activeTab === "invoicing") this.renderInvoicingCalendarTab(area);
        else                                     this.renderGastosTab(area);
    }

    // ─── TAB 3: GASTOS & EGRESOS (absorbido de expenses.js) ────────────────────
    renderGastosTab(container) {
        let totalExpenses = 0, totalSalaries = 0, totalOthers = 0;
        store.expenses.forEach(e => {
            totalExpenses += e.amount;
            if (e.category === "Sueldos") totalSalaries += e.amount; else totalOthers += e.amount;
        });
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        const catOpts = `<option value="">Todas las categorías</option>` + this.expensesCategories.map(c => `<option value="${c}" ${this.expensesFilters.category === c ? 'selected' : ''}>${c}</option>`).join("");

        let filtered = [...store.expenses];
        if (this.expensesFilters.category) filtered = filtered.filter(e => e.category === this.expensesFilters.category);
        if (this.expensesFilters.query) filtered = filtered.filter(e => (e.description || "").toLowerCase().includes(this.expensesFilters.query.toLowerCase()));
        if (this.expensesFilters.dateFrom) filtered = filtered.filter(e => e.date >= this.expensesFilters.dateFrom);
        if (this.expensesFilters.dateTo) filtered = filtered.filter(e => e.date <= this.expensesFilters.dateTo);
        filtered.sort((a, b) => b.date.localeCompare(a.date));

        let rowsHtml = filtered.length === 0
            ? `<tr><td colspan="5" style="text-align:center; color:var(--color-text-muted); padding:20px;">Sin gastos registrados.</td></tr>`
            : filtered.map(e => `<tr>
                <td>${new Date(e.date + "T00:00:00").toLocaleDateString("es-AR")}</td>
                <td>${e.description || 'Sin descripción'}</td>
                <td><span class="badge lead" style="font-size:0.72rem;">${e.category}</span></td>
                <td style="text-align:right; font-weight:600; color:var(--color-red);">${fmt(e.amount)}</td>
                <td style="text-align:center;">
                    ${!e.attendanceId ? `<button class="btn btn-secondary btn-sm" onclick="paymentsModule.deleteExpense('${e.id}')" style="color:var(--color-red); padding:2px 6px; font-size:0.75rem;">Eliminar</button>` : '<span style="font-size:0.75rem; color:var(--color-text-muted);">Auto (Sueldo)</span>'}
                </td>
            </tr>`).join("");

        container.innerHTML = `
            <div class="kpi-container" style="margin-bottom:20px;">
                <div class="kpi-card"><div class="kpi-icon red">📉</div><div class="kpi-info"><h4>Total Gastos</h4><div class="value">${fmt(totalExpenses)}</div></div></div>
                <div class="kpi-card"><div class="kpi-icon blue">🧑‍🏭</div><div class="kpi-info"><h4>Sueldos</h4><div class="value">${fmt(totalSalaries)}</div></div></div>
                <div class="kpi-card"><div class="kpi-icon gold">🧾</div><div class="kpi-info"><h4>Gastos Operativos</h4><div class="value">${fmt(totalOthers)}</div></div></div>
            </div>

            <div class="card" style="margin-bottom:20px; padding:15px;">
                <div class="card-title">Registrar Nuevo Gasto</div>
                <form onsubmit="paymentsModule.saveExpense(event)">
                    <div class="form-row">
                        <div class="form-group"><label>Fecha *</label><input type="date" id="exp-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required></div>
                        <div class="form-group"><label>Categoría *</label>
                            <select id="exp-cat" class="form-control" required>${this.expensesCategories.map(c => `<option>${c}</option>`).join("")}</select></div>
                        <div class="form-group"><label>Monto ($) *</label><input type="number" id="exp-amount" class="form-control" placeholder="0" required></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex:2;"><label>Descripción *</label><input type="text" id="exp-desc" class="form-control" placeholder="Detalle del gasto" required></div>
                        <div class="form-group" style="flex:1;"><label>Notas</label><input type="text" id="exp-notes" class="form-control" placeholder="Opcional"></div>
                    </div>
                    <div style="display:flex; justify-content:flex-end;"><button type="submit" class="btn btn-primary btn-sm">Registrar Gasto</button></div>
                </form>
            </div>

            <div class="card">
                <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <span>Historial de Gastos</span>
                    <button class="btn btn-secondary btn-sm" onclick="paymentsModule.exportExpensesCSV()">⬇ Exportar CSV</button>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:15px;">
                    <select class="form-control" style="width:180px; padding:4px;" onchange="paymentsModule.setExpFilter('category', this.value)">${catOpts}</select>
                    <input type="text" class="form-control" style="width:200px; padding:4px;" placeholder="Buscar..." value="${this.expensesFilters.query}" oninput="paymentsModule.setExpFilter('query', this.value)">
                    <input type="date" class="form-control" style="width:145px; padding:4px;" value="${this.expensesFilters.dateFrom}" onchange="paymentsModule.setExpFilter('dateFrom', this.value)">
                    <input type="date" class="form-control" style="width:145px; padding:4px;" value="${this.expensesFilters.dateTo}" onchange="paymentsModule.setExpFilter('dateTo', this.value)">
                </div>
                <div class="table-container">
                    <table><thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th style="text-align:right;">Monto</th><th style="text-align:center;">Acción</th></tr></thead>
                    <tbody>${rowsHtml}</tbody></table>
                </div>
            </div>
        `;
    }

    setExpFilter(key, val) { this.expensesFilters[key] = val; this.renderActiveTab(); }

    saveExpense(e) {
        e.preventDefault();
        const date = document.getElementById("exp-date").value;
        const category = document.getElementById("exp-cat").value;
        const amount = parseFloat(document.getElementById("exp-amount").value) || 0;
        const description = document.getElementById("exp-desc").value.trim();
        const notes = document.getElementById("exp-notes").value.trim();
        if (!description || amount <= 0) { app.showToast("Completá descripción y monto.", "error"); return; }
        if (!store.expenses) store.expenses = [];
        store.expenses.push({ id: "exp_" + Date.now(), date, description, category, amount, notes });
        store.saveData();
        app.showToast("Gasto registrado correctamente.", "success");
        this.renderActiveTab();
    }

    deleteExpense(id) {
        if (confirm("¿Eliminar este gasto?")) {
            store.expenses = store.expenses.filter(e => e.id !== id);
            store.saveData();
            app.showToast("Gasto eliminado.", "info");
            this.renderActiveTab();
        }
    }

    exportExpensesCSV() {
        if (!store.expenses || store.expenses.length === 0) { app.showToast("No hay gastos para exportar.", "info"); return; }
        const headers = ["Fecha","Descripción","Categoría","Monto","Notas"];
        const rows = store.expenses.map(e => [e.date, `"${(e.description||"").replace(/"/g,'""')}"`, e.category, e.amount, `"${(e.notes||"").replace(/"/g,'""')}"`]);
        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
        a.download = `gastos_navidad_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    }

    // --- TAB 1: CONTROL FINANCIERO — una fila por entidad de facturación ---
    renderControlTab(container) {
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
        let rowsHtml = "";

        store.orders.forEach(order => {
            if (order.status === "Cancelado") return;

            const efs = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
                ? order.entidadesFacturacion
                : [{ id: `ef_${order.id}_leg`, razonSocial: order.clientName, cuit: order.cuit || "", cantidadCajas: order.numberOfBoxes, monto: order.total, pagos: order.payments || [], facturas: order.scheduledInvoices || [] }];

            const isMultiEF = efs.length > 1;
            const derived   = store.deriveOrderStatus(order);

            efs.forEach((ef, idx) => {
                const cobrado = this._entityCollected(ef);
                const deuda   = this._entityDebt(ef);
                const monto   = ef.monto || 0;

                // Estado pago por entidad
                let payLabel, payColor;
                if (deuda <= 0) { payLabel = "Pagada ✓"; payColor = "var(--color-green)"; }
                else if (cobrado > 0) { payLabel = "Señada"; payColor = "var(--color-gold)"; }
                else { payLabel = "Impaga"; payColor = "var(--color-red)"; }

                // Estado facturación por entidad
                const pendingFact = (ef.facturas || []).filter(f => f.status === "Pendiente").length;
                const totalFact   = (ef.facturas || []).length;
                let invLabel, invColor;
                if (totalFact === 0) { invLabel = "Sin programar"; invColor = "var(--color-text-muted)"; }
                else if (pendingFact === 0) { invLabel = "Facturada ✓"; invColor = "var(--color-green)"; }
                else if (pendingFact < totalFact) { invLabel = "Parcial"; invColor = "var(--color-gold)"; }
                else { invLabel = "Pendiente"; invColor = "var(--color-gold)"; }

                // Alertas
                let alertHtml = "";
                if (!ef.cuit) alertHtml += `<br><span style="color:var(--color-red); font-size:0.72rem; font-weight:600;">⚠️ SIN CUIT</span>`;
                if (derived === "Entregado" && deuda > 0) alertHtml += `<br><span style="color:var(--color-red); font-size:0.72rem; font-weight:600;">⚠️ ENTREGADO IMPAGO</span>`;

                // Separador visual entre entidades del mismo pedido
                const rowStyle = idx === 0
                    ? "border-top:2px solid var(--color-border);"
                    : "border-top:1px dashed var(--color-border); background:rgba(0,0,0,0.02);";

                rowsHtml += `
                    <tr style="${rowStyle}">
                        <td style="padding:6px 10px; vertical-align:top;">
                            ${idx === 0 ? `<strong>${order.displayId || "#" + order.id.substring(4)}</strong>${isMultiEF ? `<br><span style="font-size:0.7rem; color:var(--color-teal,#04c5af);">${efs.length} entidades</span>` : ""}` : ""}
                        </td>
                        <td style="padding:6px 10px;">
                            ${idx === 0 ? `<strong>${esc(order.clientName)}</strong><br><span style="font-size:0.72rem; color:var(--color-text-muted);">${derived}</span>` : `<span style="font-size:0.72rem; color:var(--color-text-muted); padding-left:12px;">↳</span>`}
                        </td>
                        <td style="padding:6px 10px;">
                            <strong>${esc(ef.razonSocial)}</strong>${alertHtml}
                            <br><span style="font-size:0.72rem; color:var(--color-text-muted);">CUIT: ${esc(ef.cuit || 'S/D')} · ${ef.cantidadCajas} cajas</span>
                        </td>
                        <td style="padding:6px 10px; text-align:right;"><strong>${fmt(monto)}</strong></td>
                        <td style="padding:6px 10px; text-align:right; color:var(--color-green); font-weight:500;">${fmt(cobrado)}</td>
                        <td style="padding:6px 10px; text-align:right; color:${deuda > 0 ? 'var(--color-red)' : 'var(--color-text-muted)'}; font-weight:600;">${fmt(deuda)}</td>
                        <td style="padding:6px 10px; text-align:center;">
                            <span style="font-size:0.78rem; font-weight:600; color:${payColor};">${payLabel}</span>
                        </td>
                        <td style="padding:6px 10px; text-align:center;">
                            <span style="font-size:0.78rem; color:${invColor};">${invLabel}</span>
                        </td>
                        <td style="padding:6px 10px; text-align:right;">
                            <div style="display:flex; gap:4px; justify-content:flex-end; flex-wrap:wrap;">
                                ${deuda > 0 ? `<button class="btn btn-green btn-sm" onclick="paymentsModule.openRegisterPaymentModal('${order.id}','${ef.id}')" style="padding:2px 6px; font-size:0.73rem;">Cobrar</button>` : ""}
                                <button class="btn btn-secondary btn-sm" onclick="paymentsModule.openSchedulePaymentsModal('${order.id}','${ef.id}')" style="padding:2px 6px; font-size:0.73rem;">💰 Cobros</button>
                                <button class="btn btn-secondary btn-sm" onclick="paymentsModule.openScheduleInvoicesModal('${order.id}','${ef.id}')" style="padding:2px 6px; font-size:0.73rem;">🧾 Ficha</button>
                                <button class="btn btn-secondary btn-sm" onclick="paymentsModule.viewPaymentsHistory('${order.id}','${ef.id}')" style="padding:2px 6px; font-size:0.73rem;">Historial</button>
                            </div>
                        </td>
                    </tr>`;
            });
        });

        container.innerHTML = `
            <div class="card">
                <div class="table-container">
                    <table style="width:100%; border-collapse:collapse; font-size:0.84rem;">
                        <thead>
                            <tr style="background:rgba(0,0,0,0.04); border-bottom:2px solid var(--color-border); text-align:left;">
                                <th style="padding:7px 10px; width:90px;">Pedido</th>
                                <th style="padding:7px 10px;">Cliente</th>
                                <th style="padding:7px 10px;">Entidad Facturación</th>
                                <th style="padding:7px 10px; text-align:right;">Monto (Neto)</th>
                                <th style="padding:7px 10px; text-align:right;">Cobrado</th>
                                <th style="padding:7px 10px; text-align:right;">Saldo</th>
                                <th style="padding:7px 10px; text-align:center;">Pago</th>
                                <th style="padding:7px 10px; text-align:center;">Factura</th>
                                <th style="padding:7px 10px; text-align:right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml || '<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--color-text-muted);">No hay ventas activas.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // --- TAB 2: CALENDARIO DE FACTURACIÓN PROGRAMADA ---
    renderInvoicingCalendarTab(container) {
        const year = this.currentCalendarYear;
        const month = this.currentCalendarMonth;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let startDayOfWeek = new Date(year, month, 1).getDay();
        if (startDayOfWeek === 0) startDayOfWeek = 7;
        
        let daysHtml = "";
        
        // Mes anterior celdas vacías
        for (let i = 1; i < startDayOfWeek; i++) {
            daysHtml += `<div class="calendar-day-card other-month"></div>`;
        }

        // Recopilar tareas de facturación desde entidadesFacturacion
        const allTasks = [];
        store.orders.forEach(order => {
            if (order.status === "Cancelado") return;

            const efs = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
                ? order.entidadesFacturacion
                : [{ id: `ef_${order.id}_leg`, razonSocial: order.clientName, cuit: order.cuit, facturas: order.scheduledInvoices || [] }];

            efs.forEach(ef => {
                (ef.facturas || []).forEach(task => {
                    allTasks.push({ orderId: order.id, clientName: order.clientName, entidadName: ef.razonSocial, cuit: ef.cuit, entidadId: ef.id, task, type: "invoice" });
                });
            });

            // Cobros programados — leer de ef.cobrosProgramados[] (nuevo) y order.scheduledPayments[] (legacy)
            const efsCobros = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
                ? order.entidadesFacturacion
                : [];
            if (efsCobros.length > 0) {
                efsCobros.forEach(ef => {
                    (ef.cobrosProgramados || []).forEach(task => {
                        allTasks.push({ orderId: order.id, clientName: order.clientName, entidadName: ef.razonSocial, cuit: ef.cuit, entidadId: ef.id, task, type: "payment" });
                    });
                });
            } else {
                (order.scheduledPayments || []).forEach(task => {
                    allTasks.push({ orderId: order.id, clientName: order.clientName, entidadName: order.clientName, cuit: order.cuit, task, type: "payment" });
                });
            }
        });

        // Celdas del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            // Filtrar tareas de este día
            const dayTasks = allTasks.filter(t => t.task.date === dateStr);
            
            let badgesHtml = "";
            dayTasks.forEach(t => {
                const isInvoice  = t.type === "invoice";
                const isDone     = t.task.status === "Realizada" || t.task.status === "Cobrado";
                const colorClass = isDone ? "green" : (isInvoice ? "gold" : "green");
                const prefix     = isInvoice ? "🧾" : "💰";
                const nameForBadge = t.entidadName && t.entidadName !== t.clientName ? t.entidadName : t.clientName;
                const onClick    = isInvoice
                    ? `paymentsModule.openInvoiceTaskDetails('${t.orderId}','${t.task.id}','${t.entidadId || ""}')`
                    : `paymentsModule.confirmCollectScheduledPayment('${t.orderId}','${t.task.id}','${t.entidadId || ""}')`;
                const clientShort = nameForBadge.length > 14 ? nameForBadge.substring(0, 12) + "…" : nameForBadge;
                badgesHtml += `
                    <div class="calendar-day-badge ${colorClass}"
                         onclick="${onClick}"
                         title="${prefix} ${nameForBadge} — ${t.task.desc} (${t.task.percent}%)">
                        <span style="font-weight:700; display:block; font-size:0.68rem;">${clientShort}</span>
                        <span style="font-size:0.62rem;">${prefix} ${t.task.percent}%</span>
                    </div>
                `;
            });

            daysHtml += `
                <div class="calendar-day-card ${dayTasks.length > 0 ? 'active-day' : ''}">
                    <div class="calendar-day-number">${day}</div>
                    <div style="display:flex; flex-direction:column; gap:3px; overflow:hidden;">
                        ${badgesHtml}
                    </div>
                </div>
            `;
        }

        // Listar tareas pendientes en formato lista
        const pendingListTasks = allTasks.filter(t => t.task.status === "Pendiente").sort((a,b) => new Date(a.task.date) - new Date(b.task.date));
        
        let listHtml = "";
        pendingListTasks.forEach(t => {
            const formattedAmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(t.task.amount);
            listHtml += `
                <div style="background: var(--bg-sidebar); border:1px solid var(--color-border); padding:12px; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div>
                        <strong>#${t.orderId.substring(4)} - ${t.clientName}</strong> (CUIT: ${t.cuit || 'Falta CUIT'})<br>
                        <span style="font-size:0.8rem; color:var(--color-text-muted);">${t.task.desc} | Hito: ${t.task.percent}% | Fecha: ${new Date(t.task.date).toLocaleDateString("es-AR")}</span>
                    </div>
                    <div style="text-align:right; display:flex; align-items:center; gap:12px;">
                        <strong style="color:var(--color-gold);">${formattedAmt}</strong>
                        <button class="btn btn-primary btn-sm" onclick="paymentsModule.openInvoiceTaskDetails('${t.orderId}','${t.task.id}','${t.entidadId || ""}')">Emitir</button>
                    </div>
                </div>
            `;
        });

        const monthName = new Date(year, month).toLocaleDateString("es-AR", { month: 'long', year: 'numeric' });

        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
                <!-- Calendario mensual -->
                <div class="card">
                    <div class="calendar-header" style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-secondary btn-sm" onclick="paymentsModule.prevMonth()">&larr; Anterior</button>
                            <button class="btn btn-secondary btn-sm" onclick="paymentsModule.nextMonth()">Siguiente &rarr;</button>
                        </div>
                        <h3 style="margin:0; text-transform:uppercase;">📅 ${monthName.toUpperCase()}</h3>
                        <div style="font-size:0.78rem; color:var(--color-text-muted); display:flex; gap:12px; flex-wrap:wrap;">
                            <span><span style="display:inline-block; width:10px; height:10px; background:var(--color-gold); border-radius:2px; margin-right:4px;"></span>🧾 Factura pendiente</span>
                            <span><span style="display:inline-block; width:10px; height:10px; background:var(--color-green); border-radius:2px; margin-right:4px;"></span>💰 Cobro programado</span>
                            <span><span style="display:inline-block; width:10px; height:10px; background:#2f7968; border-radius:2px; margin-right:4px;"></span>✓ Realizado</span>
                        </div>
                    </div>
                    <div class="calendar-monthly-grid">
                        <div class="calendar-day-name">Lunes</div>
                        <div class="calendar-day-name">Martes</div>
                        <div class="calendar-day-name">Miércoles</div>
                        <div class="calendar-day-name">Jueves</div>
                        <div class="calendar-day-name">Viernes</div>
                        <div class="calendar-day-name">Sábado</div>
                        <div class="calendar-day-name">Domingo</div>
                        ${daysHtml}
                    </div>
                </div>
                
                <!-- Lista de pendientes -->
                <div>
                    <h3 style="margin-bottom:12px;">Facturaciones Pendientes</h3>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${listHtml || '<div class="card" style="text-align:center; color:var(--color-green);">✓ Sin facturas pendientes.</div>'}
                    </div>
                </div>
            </div>
        `;
    }

    // --- DIALOGO DE DETALLE Y EMISIÓN DE FACTURA ---
    openInvoiceTaskDetails(orderId, taskId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        // Buscar tarea en ef.facturas o legado
        let task = null, ef = null;
        if (entidadId) {
            ef = (order.entidadesFacturacion || []).find(e => e.id === entidadId);
            if (ef) task = (ef.facturas || []).find(t => t.id === taskId);
        }
        if (!task) task = (order.scheduledInvoices || []).find(t => t.id === taskId);
        if (!task) return;

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
        const entidadNombre = ef ? ef.razonSocial : order.clientName;
        const entidadCuit   = ef ? ef.cuit : order.cuit;

        const html = `
            <form onsubmit="paymentsModule.completeInvoiceTask(event,'${orderId}','${taskId}','${entidadId || ""}')">
                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); padding:12px; border-radius:var(--radius-sm); margin-bottom:15px; font-size:0.9rem;">
                    <strong>Entidad a Facturar:</strong> ${entidadNombre}<br>
                    <strong>CUIT:</strong> ${entidadCuit || 'SIN CUIT REGISTRADO'}<br>
                    <strong>Detalle Hito:</strong> ${task.desc} (${task.percent}%)<br>
                    <strong>Monto Neto:</strong> ${fmt(task.amount)} (Sin IVA)
                </div>
                ${task.status === "Realizada" ? `
                    <div style="background:rgba(20,160,90,0.15); border:1px solid var(--color-green); padding:10px; border-radius:var(--radius-sm); font-size:0.85rem; margin-bottom:15px;">
                        ✓ Factura ya emitida. Referencia AFIP: <strong>${task.ref}</strong>
                    </div>
                    <div style="display:flex; justify-content:flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cerrar</button>
                    </div>` : `
                    <div class="form-group">
                        <label>Tipo de Comprobante AFIP</label>
                        <select id="it-type" class="form-control">
                            <option value="Factura A">Factura A (Responsable Inscripto)</option>
                            <option value="Factura B">Factura B (Monotributo / Consumidor Final)</option>
                            <option value="Nota de Crédito A">Nota de Crédito A</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nº de Factura AFIP / CAE *</label>
                        <input type="text" id="it-ref" class="form-control" placeholder="Ej: A-0001-00004512" required value="A-0001-${Math.floor(100000 + Math.random()*900000)}">
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Marcar como Facturada</button>
                    </div>`}
            </form>`;

        app.showModal(`Emitir Factura — ${entidadNombre} (${order.displayId || "#" + order.id.substring(4)})`, html);
    }

    completeInvoiceTask(e, orderId, taskId, entidadId) {
        e.preventDefault();
        const type = document.getElementById("it-type").value;
        const ref  = document.getElementById("it-ref").value;

        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const refStr = `${type} - ${ref}`;

        // Marcar en ef.facturas (usando taskId — desde addInvoiceTask ambos comparten el mismo ID)
        let efTask = null;
        let taskEf = null;
        if (entidadId) {
            taskEf = (order.entidadesFacturacion || []).find(e => e.id === entidadId);
            if (taskEf) efTask = (taskEf.facturas || []).find(t => t.id === taskId);
        }
        // Si no encontró por entidadId, buscar en todos los EFs por el ID compartido
        if (!efTask) {
            for (const ef of (order.entidadesFacturacion || [])) {
                const found = (ef.facturas || []).find(t => t.id === taskId);
                if (found) { efTask = found; taskEf = ef; break; }
            }
        }
        if (efTask) {
            efTask.status = "Realizada";
            efTask.ref = refStr;
            // Snapshot de razón social y CUIT al momento de emisión (para auditoría)
            if (taskEf) {
                efTask.razonSocialSnapshot = taskEf.razonSocial;
                efTask.cuitSnapshot = taskEf.cuit;
            }
        }

        // Sincronizar en scheduledInvoices (mismo ID compartido)
        const legacyTask = (order.scheduledInvoices || []).find(t => t.id === taskId);
        if (legacyTask) { legacyTask.status = "Realizada"; legacyTask.ref = refStr; }

        if (!efTask && !legacyTask) return; // task no encontrada en ningún lado

        // Calcular invoiceStatus desde ef.facturas (fuente principal)
        const allFact = (order.entidadesFacturacion || []).flatMap(ef => ef.facturas || []);
        const allTasks = allFact.length > 0 ? allFact : (order.scheduledInvoices || []);
        const pending  = allTasks.filter(t => t.status === "Pendiente").length;
        order.invoiceStatus = pending === 0 ? `Facturado Total (${ref})` : `Facturado Parcial (${ref})`;

        app.logAction(order.id, `Factura emitida: ${(efTask || legacyTask).desc} (${(efTask || legacyTask).percent}%). Ref: ${refStr}.`);
        store.saveData();
        app.closeModal();
        app.showToast("Factura AFIP registrada.", "success");
        this.render(document.getElementById("main-content"));
    }


    // --- MIGRACIÓN SILENCIOSA: separar montoCajas y montoEnvio de ef.monto legacy ---
    _migrateEfShipping(order, ef) {
        if (ef.montoCajas !== undefined) return; // ya migrado
        const totalBoxes = order.numberOfBoxes || 1;
        const cajasEf = ef.cantidadCajas || totalBoxes;
        const shippingPro = Math.round((order.shippingCharged || 0) * (cajasEf / totalBoxes));
        ef.montoEnvio = shippingPro;
        ef.montoEnvioOverride = false;
        ef.montoCajas = Math.max(0, Math.round((ef.monto || 0) - shippingPro));
    }

    // --- FICHA DE FACTURACIÓN (MODAL PRINCIPAL POR ENTIDAD) ---
    openScheduleInvoicesModal(orderId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const efs = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
            ? order.entidadesFacturacion
            : [{ id: `ef_${order.id}_leg`, razonSocial: order.clientName, cuit: order.cuit, monto: order.total, pagos: order.payments || [], facturas: order.scheduledInvoices || [] }];

        const ef = entidadId ? efs.find(e => e.id === entidadId) : efs[0];
        if (!ef) return;

        // Migración silenciosa si datos son legacy
        this._migrateEfShipping(order, ef);
        store.saveData();

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);

        // --- Sección 1: Datos de Facturación ---
        const totalBoxes = order.numberOfBoxes || 1;
        const cajasEf = ef.cantidadCajas || totalBoxes;
        const efMontoCajas = ef.montoCajas || 0;
        const montoEnvioAuto = Math.round((order.shippingCharged || 0) * (cajasEf / totalBoxes));
        const efMontoEnvio = ef.montoEnvioOverride ? (ef.montoEnvio || 0) : montoEnvioAuto;
        const efTotal = efMontoCajas + efMontoEnvio;
        const unitPricePuro = cajasEf > 0 ? Math.round(efMontoCajas / cajasEf) : 0;

        // Advertencia si hay múltiples entidades y los envíos manuales no cuadran
        let shippingMismatchHtml = "";
        if (efs.length > 1) {
            const sumEnvio = efs.reduce((s, e) => {
                const auto = Math.round((order.shippingCharged || 0) * ((e.cantidadCajas || 0) / totalBoxes));
                return s + (e.montoEnvioOverride ? (e.montoEnvio || 0) : auto);
            }, 0);
            const diff = Math.abs(sumEnvio - (order.shippingCharged || 0));
            if (diff > 1) {
                shippingMismatchHtml = `<div style="background:rgba(255,193,7,0.15); border:1px solid #e6a817; border-radius:4px; padding:6px 10px; font-size:0.78rem; color:#7a5500; margin-top:8px;">⚠️ La suma de envío entre entidades (${fmt(sumEnvio)}) difiere del envío cobrado (${fmt(order.shippingCharged || 0)}) en ${fmt(diff)}.</div>`;
            }
        }

        const envioLabelTipo = ef.montoEnvioOverride
            ? `<span style="font-size:0.7rem; color:var(--color-gold); font-weight:600;">(manual)</span>`
            : `<span style="font-size:0.7rem; color:var(--color-text-muted);">(proporcional)</span>`;
        const envioActionBtn = ef.montoEnvioOverride
            ? `<button type="button" class="btn btn-secondary btn-sm" onclick="paymentsModule.resetEnvioOverride('${orderId}','${ef.id}')" style="padding:2px 8px; font-size:0.72rem; color:var(--color-text-muted);" title="Volver al cálculo proporcional automático">↩ Auto</button>`
            : `<button type="button" class="btn btn-secondary btn-sm" onclick="paymentsModule.showEnvioOverrideInput()" style="padding:2px 8px; font-size:0.72rem;">🖊 Editar</button>`;

        // Advertencia si la razón social cambió después de emitir alguna factura
        const facturasEmitidas = (ef.facturas || []).filter(t => t.status === "Realizada" && t.razonSocialSnapshot);
        const razonSocialCambio = facturasEmitidas.find(t => t.razonSocialSnapshot !== ef.razonSocial);
        const razonSocialAlertHtml = razonSocialCambio
            ? `<div style="background:rgba(220,53,69,0.1); border:1px solid var(--color-red); border-radius:4px; padding:8px 12px; font-size:0.78rem; color:var(--color-red); margin-bottom:10px;">⚠️ <strong>Atención:</strong> Hay facturas emitidas a nombre de "<strong>${esc(razonSocialCambio.razonSocialSnapshot)}</strong>" pero la razón social actual es "<strong>${esc(ef.razonSocial)}</strong>". Las facturas emitidas en AFIP no se actualizan automáticamente.</div>`
            : "";

        const billingSection = `
            <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:14px; margin-bottom:16px;">
                <div style="font-size:0.7rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">📦 Datos de Facturación</div>
                ${razonSocialAlertHtml}
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px 16px; font-size:0.85rem; margin-bottom:12px;">
                    <div><span style="color:var(--color-text-muted);">Empresa:</span> <strong>${esc(ef.razonSocial)}</strong></div>
                    <div><span style="color:var(--color-text-muted);">CUIT:</span> <strong>${esc(ef.cuit || 'S/D')}</strong></div>
                    <div><span style="color:var(--color-text-muted);">Producto:</span> <strong>Caja Navideña 2026</strong></div>
                    <div><span style="color:var(--color-text-muted);">Cajas:</span> <strong>${cajasEf}</strong></div>
                    <div><span style="color:var(--color-text-muted);">Valor unitario:</span> <strong>${fmt(unitPricePuro)}</strong></div>
                    <div><span style="color:var(--color-text-muted);">Subtotal cajas:</span> <strong>${fmt(efMontoCajas)}</strong></div>
                </div>
                <div style="border-top:1px solid var(--color-border); padding-top:10px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <span style="font-size:0.83rem; color:var(--color-text-muted); flex:1;">Envío ${envioLabelTipo}:</span>
                        <strong style="font-size:0.9rem;">${fmt(efMontoEnvio)}</strong>
                        ${envioActionBtn}
                    </div>
                    <div id="envio-override-form" style="display:none; margin-top:8px; padding:8px; background:rgba(0,0,0,0.03); border-radius:4px; border:1px solid var(--color-border);">
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <label style="font-size:0.78rem; white-space:nowrap; margin:0; color:var(--color-text-muted);">Monto de envío manual:</label>
                            <input type="number" id="ef-envio-manual" class="form-control" style="width:130px; padding:4px 8px; font-size:0.83rem;" value="${efMontoEnvio}" min="0">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="paymentsModule.saveEnvioOverride('${orderId}','${ef.id}')" style="padding:3px 10px; font-size:0.78rem;">Guardar</button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('envio-override-form').style.display='none'" style="padding:3px 10px; font-size:0.78rem; color:var(--color-text-muted);">Cancelar</button>
                        </div>
                    </div>
                    ${shippingMismatchHtml}
                    <div style="display:flex; justify-content:flex-end; margin-top:8px; padding-top:8px; border-top:1px solid var(--color-border);">
                        <span style="font-size:0.83rem; color:var(--color-text-muted); margin-right:8px;">TOTAL ENTIDAD:</span>
                        <strong style="font-size:1.05rem; color:var(--color-gold);">${fmt(efTotal)}</strong>
                    </div>
                </div>
            </div>`;

        // --- Sección 2: Contacto de Facturación ---
        const cf = ef.contactoFacturacion || {};
        const hasContact = cf.email || cf.whatsapp || cf.persona;
        const lead = order.leadId ? (store.leads || []).find(l => l.id === order.leadId) : null;
        const copyFromLeadBtn = lead
            ? `<button type="button" class="btn btn-secondary btn-sm" onclick="paymentsModule.copyContactFromLead('${orderId}','${ef.id}')" style="padding:3px 10px; font-size:0.78rem;">📋 Copiar desde Lead</button>`
            : '';

        const contactSection = `
            <div style="background:${!hasContact ? 'rgba(255,193,7,0.07)' : 'var(--bg-sidebar)'}; border:1px solid ${!hasContact ? '#e6a817' : 'var(--color-border)'}; border-radius:var(--radius-md); padding:14px; margin-bottom:16px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                    <div style="font-size:0.7rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.5px;">📞 Contacto de Facturación</div>
                    ${copyFromLeadBtn}
                </div>
                ${!hasContact ? `<div style="background:rgba(255,193,7,0.15); border:1px solid #e6a817; border-radius:4px; padding:8px 12px; font-size:0.82rem; color:#7a5500; margin-bottom:12px;">⚠️ No hay contacto registrado para esta entidad.</div>` : ''}
                <form onsubmit="paymentsModule.saveContactoFacturacion(event,'${orderId}','${ef.id}')">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.75rem; margin-bottom:3px; display:block;">Persona de contacto</label>
                            <input type="text" id="cf-persona" class="form-control" style="padding:4px 8px; font-size:0.82rem;" value="${cf.persona || ''}" placeholder="Nombre y apellido">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.75rem; margin-bottom:3px; display:block;">Medio preferido</label>
                            <select id="cf-medio" class="form-control" style="padding:4px 8px; font-size:0.82rem;">
                                <option value="Email" ${(cf.medio || 'Email') === 'Email' ? 'selected' : ''}>Email</option>
                                <option value="WhatsApp" ${cf.medio === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                                <option value="Teléfono" ${cf.medio === 'Teléfono' ? 'selected' : ''}>Teléfono</option>
                                <option value="Portal" ${cf.medio === 'Portal' ? 'selected' : ''}>Portal</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.75rem; margin-bottom:3px; display:block;">Email</label>
                            <input type="email" id="cf-email" class="form-control" style="padding:4px 8px; font-size:0.82rem;" value="${cf.email || ''}" placeholder="facturacion@empresa.com">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.75rem; margin-bottom:3px; display:block;">WhatsApp</label>
                            <input type="tel" id="cf-whatsapp" class="form-control" style="padding:4px 8px; font-size:0.82rem;" value="${cf.whatsapp || ''}" placeholder="+54 9 351...">
                        </div>
                    </div>
                    <div style="display:flex; justify-content:flex-end;">
                        <button type="submit" class="btn btn-secondary btn-sm" style="padding:3px 10px; font-size:0.78rem;">Guardar Contacto</button>
                    </div>
                </form>
            </div>`;

        // --- Sección 3: Hitos de Facturación (sin cambios) ---
        const facturas = ef.facturas || [];
        let totalPercent = facturas.reduce((s, t) => s + (t.percent || 0), 0);

        let listHtml = facturas.length === 0
            ? `<p style="color:var(--color-text-muted); text-align:center; font-size:0.85rem;">No hay hitos programados para esta entidad.</p>`
            : facturas.map(task => {
                const snapshotMismatch = task.status === "Realizada" && task.razonSocialSnapshot && task.razonSocialSnapshot !== ef.razonSocial;
                const snapshotHtml = snapshotMismatch
                    ? `<br><span style="font-size:0.7rem; color:var(--color-red);">⚠ Emitida a: ${task.razonSocialSnapshot} / CUIT: ${task.cuitSnapshot || 'S/D'}</span>`
                    : (task.razonSocialSnapshot ? `<br><span style="font-size:0.7rem; color:var(--color-text-muted);">Emitida a: ${task.razonSocialSnapshot}</span>` : "");
                const statusText = task.status === "Realizada"
                    ? `<span style="color:var(--color-green); font-weight:bold;">Emitida (${task.ref})</span>${snapshotHtml}`
                    : `<span style="color:var(--color-gold);">Pendiente (${new Date(task.date + "T00:00:00").toLocaleDateString("es-AR")})</span>`;
                return `
                    <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); padding:10px; border-radius:var(--radius-sm); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong>${task.desc}</strong> (${task.percent}%)<br>
                            <span style="font-size:0.75rem; color:var(--color-text-muted);">Monto: ${fmt(task.amount)} | Fecha: ${task.date}</span>
                        </div>
                        <div style="text-align:right; font-size:0.85rem;">
                            ${statusText}
                            ${task.status === "Pendiente" ? `<button type="button" class="btn btn-secondary btn-sm" onclick="paymentsModule.deleteInvoiceTask('${orderId}','${ef.id}','${task.id}')" style="color:var(--color-red); margin-left:8px; padding:2px 6px;">&times;</button>` : ""}
                        </div>
                    </div>`;
            }).join("");

        const remaining = 100 - totalPercent;

        const hitosSection = `
            <div style="margin-bottom:8px;">
                <div style="font-size:0.7rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">🧾 Hitos de Facturación (${totalPercent}% programado)</div>
                <div style="max-height:180px; overflow-y:auto; margin-bottom:14px;">${listHtml}</div>
                ${remaining > 0 ? `
                    <form onsubmit="paymentsModule.addInvoiceTask(event,'${orderId}','${ef.id}')" style="background:var(--bg-sidebar); border:1px solid var(--color-border); padding:14px; border-radius:var(--radius-md);">
                        <div style="font-size:0.82rem; font-weight:600; color:var(--color-gold); margin-bottom:10px;">Programar Siguiente Hito</div>
                        <div class="form-row">
                            <div class="form-group" style="margin-bottom:10px;">
                                <label>% a Facturar *</label>
                                <input type="number" id="sched-percent" class="form-control" min="1" max="${remaining}" value="${remaining}" required>
                                <span style="font-size:0.7rem; color:var(--color-text-muted);">Máx: ${remaining}%</span>
                            </div>
                            <div class="form-group" style="margin-bottom:10px;">
                                <label>Fecha *</label>
                                <input type="date" id="sched-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom:10px;">
                            <label>Descripción del Hito *</label>
                            <input type="text" id="sched-desc" class="form-control" value="Factura de saldo (${remaining}%)" required>
                        </div>
                        <div style="display:flex; justify-content:flex-end;">
                            <button type="submit" class="btn btn-gold btn-sm">Añadir Hito</button>
                        </div>
                    </form>
                ` : `<div style="background:rgba(20,160,90,0.1); border:1px solid var(--color-green); padding:10px; border-radius:var(--radius-sm); font-size:0.85rem; text-align:center;">✓ Hitos cubren el 100%.</div>`}
            </div>`;

        const html = `
            <div style="max-height:82vh; overflow-y:auto; padding-right:4px;">
                ${billingSection}
                ${contactSection}
                ${hitosSection}
                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:18px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cerrar</button>
                </div>
            </div>`;

        app.showModal(`Ficha de Facturación — ${ef.razonSocial} (${order.displayId || "#" + order.id.substring(4)})`, html);
    }

    showEnvioOverrideInput() {
        const form = document.getElementById("envio-override-form");
        if (form) form.style.display = form.style.display === "none" ? "block" : "none";
    }

    saveEnvioOverride(orderId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const ef = (order.entidadesFacturacion || []).find(e => e.id === entidadId);
        if (!ef) return;
        const val = parseFloat(document.getElementById("ef-envio-manual")?.value);
        if (isNaN(val) || val < 0) { app.showToast("Ingresá un monto válido", "error"); return; }
        ef.montoEnvio = Math.round(val);
        ef.montoEnvioOverride = true;
        ef.monto = (ef.montoCajas || 0) + ef.montoEnvio;

        // Redistribuir el shipping restante proporcionalmente entre las otras EFs sin override
        const allEfs = order.entidadesFacturacion || [];
        if (allEfs.length > 1) {
            const remaining = Math.max(0, (order.shippingCharged || 0) - ef.montoEnvio);
            const otherEfs = allEfs.filter(e => e.id !== entidadId && !e.montoEnvioOverride);
            const otherCajasTotal = otherEfs.reduce((s, e) => s + (e.cantidadCajas || 0), 0);
            if (otherCajasTotal > 0) {
                let remEnv = remaining;
                otherEfs.forEach((e, i) => {
                    if (i < otherEfs.length - 1) {
                        const envProp = Math.round(remaining * ((e.cantidadCajas || 0) / otherCajasTotal));
                        e.montoEnvio = envProp;
                        remEnv -= envProp;
                    } else {
                        e.montoEnvio = Math.max(0, remEnv);
                    }
                    e.monto = (e.montoCajas || 0) + e.montoEnvio;
                });
            }
        }

        app.logAction(order.id, `Envío de facturación ajustado manualmente para ${ef.razonSocial}: ${ef.montoEnvio}`);
        store.saveData();
        app.showToast("Envío actualizado y redistribuido entre entidades", "success");
        this.openScheduleInvoicesModal(orderId, entidadId);
    }

    resetEnvioOverride(orderId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const ef = (order.entidadesFacturacion || []).find(e => e.id === entidadId);
        if (!ef) return;
        const totalBoxes = order.numberOfBoxes || 1;
        const cajasEf = ef.cantidadCajas || totalBoxes;
        ef.montoEnvioOverride = false;
        ef.montoEnvio = Math.round((order.shippingCharged || 0) * (cajasEf / totalBoxes));
        ef.monto = (ef.montoCajas || 0) + ef.montoEnvio;
        store.saveData();
        app.showToast("Envío restablecido al cálculo proporcional", "success");
        this.openScheduleInvoicesModal(orderId, entidadId);
    }

    saveContactoFacturacion(e, orderId, entidadId) {
        e.preventDefault();
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const ef = (order.entidadesFacturacion || []).find(en => en.id === entidadId);
        if (!ef) return;

        ef.contactoFacturacion = {
            persona: document.getElementById("cf-persona")?.value.trim() || "",
            email:   document.getElementById("cf-email")?.value.trim() || "",
            whatsapp: document.getElementById("cf-whatsapp")?.value.trim() || "",
            medio:   document.getElementById("cf-medio")?.value || "Email"
        };

        app.logAction(order.id, `Contacto de facturación actualizado para ${ef.razonSocial}.`);
        store.saveData();
        app.showToast("Contacto guardado", "success");
        this.openScheduleInvoicesModal(orderId, entidadId);
    }

    copyContactFromLead(orderId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order || !order.leadId) return;
        const lead = (store.leads || []).find(l => l.id === order.leadId);
        if (!lead) { app.showToast("Lead no encontrado", "error"); return; }

        const personaEl   = document.getElementById("cf-persona");
        const emailEl     = document.getElementById("cf-email");
        const whatsappEl  = document.getElementById("cf-whatsapp");

        if (personaEl  && lead.contactName) personaEl.value  = lead.contactName;
        if (emailEl    && lead.email)       emailEl.value    = lead.email;
        if (whatsappEl && lead.phone)       whatsappEl.value = lead.phone;

        app.showToast("Datos copiados desde el Lead", "success");
    }

    addInvoiceTask(e, orderId, entidadId) {
        e.preventDefault();
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const efs = order.entidadesFacturacion || [];
        const ef  = entidadId ? efs.find(e => e.id === entidadId) : efs[0];
        if (!ef) return;
        if (!ef.facturas) ef.facturas = [];

        const percent = parseInt(document.getElementById("sched-percent").value) || 0;
        const date    = document.getElementById("sched-date").value;
        const desc    = document.getElementById("sched-desc").value;
        const amount  = Math.round(((ef.monto || 0) * percent) / 100);

        // Validación backend: no superar 100%
        const totalPct = ef.facturas.reduce((s, t) => s + (t.percent || 0), 0);
        if (totalPct + percent > 100) {
            app.showToast(`Los hitos superarían el 100% (ya programado: ${totalPct}%)`, "error");
            return;
        }

        // Usar UN ÚNICO ID para ef.facturas y scheduledInvoices (evita desincronización)
        const sharedId = `task_${ef.id}_${Date.now()}`;

        ef.facturas.push({
            id: sharedId,
            desc, date, percent, amount, status: "Pendiente", ref: "", entidadId: ef.id
        });

        // Sincronizar legacy con el mismo ID
        if (!order.scheduledInvoices) order.scheduledInvoices = [];
        order.scheduledInvoices.push({ id: sharedId, desc, date, percent, amount, status: "Pendiente", ref: "", entidadId: ef.id });

        app.logAction(order.id, `Hito de facturación del ${percent}% para ${ef.razonSocial} programado al ${date}.`);
        store.saveData();
        app.closeModal();
        app.showToast("Hito agregado con éxito", "success");
        this.openScheduleInvoicesModal(orderId, entidadId);
    }

    deleteInvoiceTask(orderId, entidadId, taskId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const ef = (order.entidadesFacturacion || []).find(e => e.id === entidadId);
        if (ef) ef.facturas = (ef.facturas || []).filter(t => t.id !== taskId);
        order.scheduledInvoices = (order.scheduledInvoices || []).filter(t => t.id !== taskId);
        app.logAction(order.id, "Hito de facturación eliminado.");
        store.saveData();
        app.closeModal();
        app.showToast("Hito eliminado", "info");
        this.openScheduleInvoicesModal(orderId, entidadId);
    }


    // --- REGISTRAR COBRO MANUAL (por entidad de facturación) ---
    openRegisterPaymentModal(orderId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        // Resolver entidad: si se pasa entidadId, usar esa; si no, mostrar selector
        const efs = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
            ? order.entidadesFacturacion
            : [{ id: `ef_${order.id}_leg`, razonSocial: order.clientName, monto: order.total, pagos: order.payments || [] }];

        const ef = entidadId ? efs.find(e => e.id === entidadId) : efs[0];
        if (!ef) return;

        const cobrado  = this._entityCollected(ef);
        const maxAmount = Math.max(0, (ef.monto || 0) - cobrado);

        const html = `
            <form onsubmit="paymentsModule.savePayment(event,'${orderId}','${ef.id}')">
                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); padding:12px; border-radius:var(--radius-sm); margin-bottom:15px; font-size:0.9rem;">
                    <strong>Entidad:</strong> ${esc(ef.razonSocial)} (CUIT: ${esc(ef.cuit || 'S/D')})<br>
                    <strong>Monto asignado (Sin IVA):</strong> ${fmt(ef.monto || 0)}<br>
                    <strong>Cobrado hasta ahora:</strong> ${fmt(cobrado)}<br>
                    <strong>Saldo a cobrar:</strong> <span style="color:var(--color-red); font-weight:700;">${fmt(maxAmount)}</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Monto a Cobrar ($) *</label>
                        <input type="number" id="pay-amount" class="form-control" max="${maxAmount}" min="1" value="${maxAmount}" required>
                    </div>
                    <div class="form-group">
                        <label>Medio de Pago *</label>
                        <select id="pay-method" class="form-control">
                            <option value="Transferencia">Transferencia Bancaria</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Cheque">Cheque</option>
                            <option value="E-Check">E-Check</option>
                            <option value="Tarjeta">Tarjeta</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha de Cobro *</label>
                        <input type="date" id="pay-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label>Referencia / Notas</label>
                        <input type="text" id="pay-notes" class="form-control" placeholder="Ej: Comprobante Banco Nro 9982312">
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Registrar Cobro</button>
                </div>
            </form>`;

        app.showModal(`Cobro — ${ef.razonSocial} (${order.displayId || "#" + order.id.substring(4)})`, html);
    }

    savePayment(e, orderId, entidadId) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById("pay-amount").value);
        const method = document.getElementById("pay-method").value;
        const date   = document.getElementById("pay-date").value;
        const notes  = document.getElementById("pay-notes").value;

        if (isNaN(amount) || amount <= 0) { app.showToast("El monto debe ser mayor a cero.", "error"); return; }

        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const efs = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
            ? order.entidadesFacturacion
            : null;
        const ef  = efs ? efs.find(e => e.id === entidadId) || efs[0] : null;

        const payObj = { id: "pay_" + Date.now(), amount, method, date, notes, entidadId: ef ? ef.id : null };

        if (ef) {
            if (!ef.pagos) ef.pagos = [];
            ef.pagos.push(payObj);
        }

        // Sincronizar order.payments (legado)
        if (!order.payments) order.payments = [];
        order.payments.push(payObj);

        // Recalcular paymentStatus del pedido
        const totalCobrado = (order.entidadesFacturacion || []).reduce((s, e) => s + this._entityCollected(e), 0);
        const totalMonto   = (order.entidadesFacturacion || []).reduce((s, e) => s + (e.monto || 0), 0) || order.total || 0;
        order.paymentStatus = totalCobrado >= totalMonto ? "Pagado" : totalCobrado > 0 ? "Señado" : "Impago";

        app.logAction(order.id, `Cobro registrado — ${ef ? ef.razonSocial : order.clientName}: $${amount.toLocaleString("es-AR")} vía ${method}.`);
        store.saveData();
        app.closeModal();
        app.showToast(`Cobro registrado para "${ef ? ef.razonSocial : order.clientName}".`, "success");
        this.render(document.getElementById("main-content"));
    }

    // --- HISTORIAL DE TRANSACCIONES (por entidad) ---
    viewPaymentsHistory(orderId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        const efs = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
            ? order.entidadesFacturacion
            : [{ id: `ef_${order.id}_leg`, razonSocial: order.clientName, monto: order.total, pagos: order.payments || [], facturas: [] }];

        const ef = entidadId ? efs.find(e => e.id === entidadId) : efs[0];
        const pagos = ef ? (ef.pagos || []) : (order.payments || []);

        let listHtml = pagos.length === 0
            ? `<p style="color:var(--color-text-muted); text-align:center;">No se registraron cobros para esta entidad.</p>`
            : pagos.slice().reverse().map(p => `
                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); padding:10px 12px; border-radius:var(--radius-sm); display:flex; justify-content:space-between; margin-bottom:6px;">
                    <div>
                        <strong>${fmt(p.amount)}</strong> <span style="font-size:0.8rem; color:var(--color-text-muted);">via ${p.method}</span><br>
                        <span style="font-size:0.75rem; color:var(--color-text-muted);">Ref: ${p.notes || 'S/R'}</span>
                    </div>
                    <span style="font-size:0.8rem; color:var(--color-text-muted); align-self:center;">${new Date(p.date + "T00:00:00").toLocaleDateString("es-AR")}</span>
                </div>`).join("");

        const auditListHtml = (order.history || []).slice().reverse().map(h => `
            <div style="font-size:0.8rem; border-left:2px solid var(--color-gold); padding-left:10px; margin-bottom:6px;">
                <strong>${h.user}</strong> — ${new Date(h.date).toLocaleString("es-AR")}<br>
                <span style="color:var(--color-text-muted);">${h.action}</span>
            </div>`).join('');

        const efTitle = ef ? `${ef.razonSocial} — ` : "";
        const html = `
            <h4 style="margin-bottom:10px;">Cobros recibidos${ef ? ` — ${ef.razonSocial}` : ""}</h4>
            <div style="max-height:200px; overflow-y:auto; margin-bottom:18px;">${listHtml}</div>
            <h4 style="margin-bottom:10px;">Historial del Pedido</h4>
            <div style="max-height:180px; overflow-y:auto;">${auditListHtml}</div>
            <div style="display:flex; justify-content:flex-end; margin-top:18px;">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cerrar</button>
            </div>`;

        app.showModal(`Historial — ${efTitle}${order.displayId || "#" + order.id.substring(4)} (${order.clientName})`, html);
    }
    // ─── AGENDA DEL DÍA ──────────────────────────────────────────────────────

    renderAgendaTab(container) {
        const today    = new Date().toISOString().split("T")[0];
        const fmt      = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
        const fmtDate  = (d) => new Date(d + "T00:00:00").toLocaleDateString("es-AR");
        const todayLabel = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

        // Cobros programados para hoy
        const cobrosHoy = [];
        // Cobros vencidos (fecha pasada, pendientes)
        const cobrosVencidos = [];
        // Facturas a emitir hoy
        const facturasHoy = [];

        store.orders.forEach(order => {
            if (order.status === "Cancelado") return;

            // Cobros programados: leer de ef.cobrosProgramados[] (nuevo) y order.scheduledPayments (legacy)
            const _efsAgenda = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
                ? order.entidadesFacturacion : [];
            const _cobrosAgenda = _efsAgenda.length > 0
                ? _efsAgenda.flatMap(ef => (ef.cobrosProgramados || []).map(p => ({ ...p, _efId: ef.id, _efName: ef.razonSocial })))
                : (order.scheduledPayments || []);
            _cobrosAgenda.forEach(p => {
                if (p.status === "Cobrado") return;
                if (p.date === today)    cobrosHoy.push({ order, task: p });
                else if (p.date < today) cobrosVencidos.push({ order, task: p });
            });

            // Leer facturas de ef.facturas (fuente principal); fallback a scheduledInvoices (legacy)
            const _efsFacturas = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
                ? order.entidadesFacturacion : [];
            if (_efsFacturas.length > 0) {
                _efsFacturas.forEach(ef => {
                    (ef.facturas || []).forEach(t => {
                        if (t.status === "Pendiente" && t.date === today)
                            facturasHoy.push({ order, task: { ...t, _efId: ef.id, _efName: ef.razonSocial } });
                    });
                });
            } else {
                (order.scheduledInvoices || []).forEach(t => {
                    if (t.status === "Pendiente" && t.date === today)
                        facturasHoy.push({ order, task: { ...t, _efId: "", _efName: "" } });
                });
            }
        });

        const buildSection = (title, color, icon, items, buildRow) => {
            if (items.length === 0) return `
                <div class="card" style="margin-bottom:16px; padding:14px 16px; opacity:0.6;">
                    <div style="display:flex; align-items:center; gap:8px; color:var(--color-text-muted);">
                        <span>${icon}</span><span style="font-weight:600;">${title}</span>
                        <span style="font-size:0.8rem;">— Sin ítems para hoy</span>
                    </div>
                </div>`;
            return `
                <div class="card" style="margin-bottom:16px; border-left:4px solid ${color};">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                        <span style="font-size:1.1rem;">${icon}</span>
                        <strong style="color:${color};">${title}</strong>
                        <span class="badge" style="background:${color}; color:white; font-size:0.7rem; padding:2px 8px;">${items.length}</span>
                    </div>
                    ${items.map(buildRow).join("")}
                </div>`;
        };

        const rowCobro = ({ order, task }) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:var(--bg-sidebar); border-radius:var(--radius-sm); margin-bottom:6px;">
                <div>
                    <strong>${esc(order.clientName)}</strong>${task._efName && task._efName !== order.clientName ? ` <span style="font-size:0.72rem; color:var(--color-text-muted);">→ ${esc(task._efName)}</span>` : ""}
                    <span style="font-size:0.75rem; color:var(--color-text-muted); margin-left:8px;">${order.displayId || order.id.substring(4)}</span><br>
                    <span style="font-size:0.8rem; color:var(--color-text-muted);">${esc(task.desc)} · ${esc(task.method || "")}</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <strong style="color:var(--color-green);">${fmt(task.amount)}</strong>
                    <button class="btn btn-green btn-sm" onclick="paymentsModule.confirmCollectScheduledPayment('${order.id}','${task.id}','${task._efId || ""}')" style="padding:3px 10px; font-size:0.78rem;">Cobrar</button>
                </div>
            </div>`;

        const rowVencido = ({ order, task }) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:rgba(204,54,54,0.06); border:1px solid rgba(204,54,54,0.2); border-radius:var(--radius-sm); margin-bottom:6px;">
                <div>
                    <strong>${esc(order.clientName)}</strong>
                    <span style="font-size:0.75rem; color:var(--color-text-muted); margin-left:8px;">${order.displayId || order.id.substring(4)}</span><br>
                    <span style="font-size:0.8rem; color:var(--color-red);">Vencido el ${fmtDate(task.date)} — ${esc(task.desc)}</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <strong style="color:var(--color-red);">${fmt(task.amount)}</strong>
                    <button class="btn btn-green btn-sm" onclick="paymentsModule.confirmCollectScheduledPayment('${order.id}','${task.id}','${task._efId || ""}')" style="padding:3px 10px; font-size:0.78rem;">Cobrar</button>
                </div>
            </div>`;

        const rowFactura = ({ order, task }) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:var(--bg-sidebar); border-radius:var(--radius-sm); margin-bottom:6px;">
                <div>
                    <strong>${esc(order.clientName)}</strong>${task._efName && task._efName !== order.clientName ? ` <span style="font-size:0.72rem; color:var(--color-text-muted);">→ ${esc(task._efName)}</span>` : ""}
                    <span style="font-size:0.75rem; color:var(--color-text-muted); margin-left:8px;">${order.displayId || order.id.substring(4)}</span><br>
                    <span style="font-size:0.8rem; color:var(--color-text-muted);">${esc(task.desc)} · ${task.percent}%</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <strong style="color:var(--color-gold);">${fmt(task.amount)}</strong>
                    <button class="btn btn-gold btn-sm" onclick="paymentsModule.openInvoiceTaskDetails('${order.id}','${task.id}','${task._efId || ""}')" style="padding:3px 10px; font-size:0.78rem;">Emitir</button>
                </div>
            </div>`;

        const totalItems = cobrosHoy.length + cobrosVencidos.length + facturasHoy.length;

        container.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                <h3 style="margin:0; font-size:1rem; color:var(--color-blue);">
                    📅 ${todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}
                </h3>
                ${totalItems === 0
                    ? `<span style="color:var(--color-green); font-weight:600; font-size:0.9rem;">✓ No hay tareas financieras pendientes para hoy</span>`
                    : `<span style="color:var(--color-text-muted); font-size:0.85rem;">${totalItems} tarea${totalItems !== 1 ? "s" : ""} pendiente${totalItems !== 1 ? "s" : ""}</span>`}
            </div>
            ${buildSection("Cobros para hoy",       "var(--color-green)", "💰", cobrosHoy,      rowCobro)}
            ${buildSection("Cobros vencidos",        "var(--color-red)",   "⚠️", cobrosVencidos, rowVencido)}
            ${buildSection("Facturas a emitir hoy",  "var(--color-gold)",  "🧾", facturasHoy,    rowFactura)}
        `;
    }

    // ─── PROGRAMACIÓN DE COBROS (por entidad de facturación) ─────────────────

    openSchedulePaymentsModal(orderId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        // Resolver entidad — fallback legacy si no tiene EFs
        const efs = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
            ? order.entidadesFacturacion
            : [{ id: `ef_${order.id}_leg`, razonSocial: order.clientName, cuit: order.cuit, monto: order.total, pagos: order.payments || [], cobrosProgramados: order.scheduledPayments || [] }];

        const ef = entidadId ? efs.find(e => e.id === entidadId) : efs[0];
        if (!ef) return;

        // Migración one-time: scheduledPayments a nivel pedido → ef[0].cobrosProgramados
        if (!entidadId && (order.scheduledPayments || []).length > 0 && !(ef.cobrosProgramados || []).length) {
            ef.cobrosProgramados = order.scheduledPayments;
            order.scheduledPayments = [];
            store.saveData();
        }

        // Auto-persistir estado "Vencido" (fix 5)
        const today = new Date().toISOString().split("T")[0];
        let changed = false;
        (ef.cobrosProgramados || []).forEach(p => {
            if (p.status === "Pendiente" && p.date < today) { p.status = "Vencido"; changed = true; }
        });
        if (changed) store.saveData();

        const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
        const scp = ef.cobrosProgramados || [];
        const totalPct = scp.reduce((s, p) => s + (p.percent || 0), 0);

        const listHtml = scp.length === 0
            ? `<p style="color:var(--color-text-muted); text-align:center; padding:12px 0;">No hay cobros programados para esta entidad.</p>`
            : scp.map(p => {
                const isVencido = p.status === "Vencido";
                const isCobrado = p.status === "Cobrado";
                const statusEl = isCobrado
                    ? `<span style="color:var(--color-green); font-weight:bold;">✓ Cobrado</span>`
                    : isVencido
                        ? `<span style="color:var(--color-red); font-weight:bold;">⚠️ Vencido (${new Date(p.date + "T00:00:00").toLocaleDateString("es-AR")})</span>`
                        : `<span style="color:var(--color-gold);">Pendiente — ${new Date(p.date + "T00:00:00").toLocaleDateString("es-AR")}</span>`;
                const canAct = !isCobrado;
                return `
                    <div style="background:var(--bg-sidebar); border:1px solid ${isVencido ? 'var(--color-red)' : 'var(--color-border)'}; padding:10px; border-radius:var(--radius-sm); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong>${p.desc}</strong> (${p.percent}%)<br>
                            <span style="font-size:0.75rem; color:var(--color-text-muted);">Monto: ${fmt(p.amount)} · ${p.method}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; font-size:0.85rem;">
                            ${statusEl}
                            ${canAct ? `<button type="button" class="btn btn-green btn-sm" onclick="paymentsModule.confirmCollectScheduledPayment('${orderId}','${p.id}','${ef.id}')" style="padding:2px 8px; font-size:0.75rem;">Cobrar</button>` : ""}
                            ${canAct ? `<button type="button" class="btn btn-secondary btn-sm" onclick="paymentsModule.deletePaymentTask('${orderId}','${ef.id}','${p.id}')" style="color:var(--color-red); padding:2px 6px;">&times;</button>` : ""}
                        </div>
                    </div>`;
            }).join("");

        const remaining = 100 - totalPct;

        const addFormHtml = remaining > 0 ? `
            <form onsubmit="paymentsModule.addPaymentTask(event,'${orderId}','${ef.id}')" style="background:var(--bg-sidebar); border:1px solid var(--color-border); padding:14px; border-radius:var(--radius-md); margin-top:8px;">
                <h4 style="margin-bottom:10px; color:var(--color-green);">Programar Siguiente Cobro</h4>
                <div class="form-row">
                    <div class="form-group" style="margin-bottom:10px;">
                        <label>% a Cobrar *</label>
                        <input type="number" id="scp-percent" class="form-control" min="1" max="${remaining}" value="${remaining}" required>
                        <span style="font-size:0.7rem; color:var(--color-text-muted);">Máx disponible: ${remaining}%</span>
                    </div>
                    <div class="form-group" style="margin-bottom:10px;">
                        <label>Fecha Prevista *</label>
                        <input type="date" id="scp-date" class="form-control" value="${new Date().toISOString().split("T")[0]}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="margin-bottom:10px;">
                        <label>Medio de Pago *</label>
                        <select id="scp-method" class="form-control">
                            <option>Transferencia Bancaria</option>
                            <option>eCheq</option>
                            <option>Cheque Físico</option>
                            <option>Efectivo</option>
                            <option>Tarjeta</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:10px;">
                        <label>Descripción *</label>
                        <input type="text" id="scp-desc" class="form-control" value="Cobro de saldo (${remaining}%)" required>
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn btn-green btn-sm">Añadir Cobro Programado</button>
                </div>
            </form>` : `
            <div style="background:rgba(20,160,90,0.1); border:1px solid var(--color-green); padding:10px; border-radius:var(--radius-sm); text-align:center; font-size:0.85rem; margin-top:8px;">
                ✓ El 100% de la entidad tiene cobros programados.
            </div>`;

        const html = `
            <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:14px; font-size:0.88rem;">
                <strong>Entidad:</strong> ${esc(ef.razonSocial)} &nbsp;|&nbsp; <strong>CUIT:</strong> ${esc(ef.cuit || 'S/D')} &nbsp;|&nbsp; <strong>Monto:</strong> ${fmt(ef.monto || 0)}
            </div>
            <h4 style="margin-bottom:8px;">Cobros programados (${totalPct}% de 100%)</h4>
            <div style="max-height:200px; overflow-y:auto; margin-bottom:16px;">${listHtml}</div>
            ${addFormHtml}
            <div style="display:flex; justify-content:flex-end; margin-top:16px;">
                <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cerrar</button>
            </div>`;

        app.showModal(`Cobros Programados — ${ef.razonSocial} (${order.displayId || "#" + order.id.substring(4)})`, html);
    }

    addPaymentTask(e, orderId, entidadId) {
        e.preventDefault();
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const efs = order.entidadesFacturacion && order.entidadesFacturacion.length > 0
            ? order.entidadesFacturacion : null;
        const ef = efs ? (entidadId ? efs.find(e => e.id === entidadId) : efs[0]) : null;
        if (!ef) return;
        if (!ef.cobrosProgramados) ef.cobrosProgramados = [];

        const percent = parseInt(document.getElementById("scp-percent").value) || 0;
        const date    = document.getElementById("scp-date").value;
        const method  = document.getElementById("scp-method").value;
        const desc    = document.getElementById("scp-desc").value;
        const amount  = Math.round(((ef.monto || 0) * percent) / 100);

        // Validación backend: no superar 100%
        const totalPctCobros = ef.cobrosProgramados.reduce((s, t) => s + (t.percent || 0), 0);
        if (totalPctCobros + percent > 100) {
            app.showToast(`Los cobros superarían el 100% (ya programado: ${totalPctCobros}%)`, "error");
            return;
        }

        ef.cobrosProgramados.push({
            id: `scp_${ef.id}_${Date.now()}`,
            desc, date, percent, amount, method, status: "Pendiente", notes: ""
        });

        app.logAction(order.id, `Cobro programado del ${percent}% para ${ef.razonSocial} (${method}) al ${date}.`);
        store.saveData();
        app.closeModal();
        app.showToast("Cobro programado agregado", "success");
        this.openSchedulePaymentsModal(orderId, entidadId);
    }

    deletePaymentTask(orderId, entidadId, taskId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const ef = (order.entidadesFacturacion || []).find(e => e.id === entidadId);
        if (ef) ef.cobrosProgramados = (ef.cobrosProgramados || []).filter(p => p.id !== taskId);
        // fallback legacy
        order.scheduledPayments = (order.scheduledPayments || []).filter(p => p.id !== taskId);
        app.logAction(order.id, "Cobro programado eliminado.");
        store.saveData();
        app.closeModal();
        app.showToast("Cobro eliminado", "info");
        this.openSchedulePaymentsModal(orderId, entidadId);
    }

    // Muestra la confirmación antes de registrar el cobro
    confirmCollectScheduledPayment(orderId, taskId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const ef = entidadId ? (order.entidadesFacturacion || []).find(e => e.id === entidadId) : null;
        const task = ef
            ? (ef.cobrosProgramados || []).find(p => p.id === taskId)
            : (order.scheduledPayments || []).find(p => p.id === taskId);
        if (!task || task.status === "Cobrado") return;

        const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

        const html = `
            <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); padding:14px; border-radius:var(--radius-sm); margin-bottom:18px; font-size:0.9rem; line-height:1.7;">
                <strong>Cliente:</strong> ${esc(order.clientName)}${ef && ef.razonSocial !== order.clientName ? ` → ${esc(ef.razonSocial)}` : ""}<br>
                <strong>Cobro:</strong> ${esc(task.desc)} (${task.percent}%)<br>
                <strong>Monto:</strong> ${fmt(task.amount)} (sin IVA)<br>
                <strong>Medio:</strong> ${esc(task.method)}<br>
                <strong>Fecha Pactada:</strong> ${new Date(task.date + "T00:00:00").toLocaleDateString("es-AR")}
            </div>
            <p style="font-size:0.9rem; margin-bottom:18px;">
                ¿Confirmás que este cobro fue recibido? Se registrará en el historial de caja del pedido.
            </p>
            <div class="form-group" style="margin-bottom:16px;">
                <label style="font-size:0.85rem; font-weight:600;">Fecha de Cobro Real *</label>
                <input type="date" id="collect-date" class="form-control" value="${new Date().toISOString().split("T")[0]}">
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                <button class="btn btn-green" onclick="paymentsModule.collectScheduledPayment('${orderId}','${taskId}','${entidadId || ""}')">✓ Sí, confirmar cobro</button>
            </div>`;
        app.showModal("Confirmar Cobro Recibido", html);
    }

    // Registra el cobro en ef.pagos[] (y legacy order.payments[]) y marca la tarea como Cobrada
    collectScheduledPayment(orderId, taskId, entidadId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const ef = entidadId ? (order.entidadesFacturacion || []).find(e => e.id === entidadId) : null;
        const task = ef
            ? (ef.cobrosProgramados || []).find(p => p.id === taskId)
            : (order.scheduledPayments || []).find(p => p.id === taskId);
        if (!task) return;

        const collectDate = document.getElementById("collect-date")?.value || new Date().toISOString().split("T")[0];

        const payObj = {
            id:       "pay_" + Date.now(),
            amount:   task.amount,
            method:   task.method,
            date:     collectDate,
            notes:    `Cobro programado — ${task.desc}`,
            entidadId: ef ? ef.id : null
        };

        // 1. Escribir en ef.pagos[] → impacta en KPIs del Control de Cobros (fix 3)
        if (ef) {
            if (!ef.pagos) ef.pagos = [];
            ef.pagos.push(payObj);
        }

        // 2. Sincronizar legacy order.payments[]
        if (!order.payments) order.payments = [];
        order.payments.push(payObj);

        // 3. Marcar hito como Cobrado
        task.status = "Cobrado";

        // 4. Recalcular paymentStatus del pedido
        const totalCobrado = (order.entidadesFacturacion || []).reduce((s, e) => s + this._entityCollected(e), 0)
            || order.payments.reduce((s, p) => s + p.amount, 0);
        const totalMonto = (order.entidadesFacturacion || []).reduce((s, e) => s + (e.monto || 0), 0) || order.total || 0;
        order.paymentStatus = totalCobrado >= totalMonto ? "Pagado" : totalCobrado > 0 ? "Señado" : "Impago";

        app.logAction(order.id, `Cobro programado confirmado: ${task.desc} — $${task.amount.toLocaleString("es-AR")} vía ${task.method}${ef ? ` (${ef.razonSocial})` : ""}.`);
        store.saveData();
        app.closeModal();
        app.showToast(`Cobro de ${ef ? ef.razonSocial : order.clientName} registrado correctamente`, "success");
        this.render(document.getElementById("main-content"));
    }

    prevMonth() {
        this.currentCalendarMonth--;
        if (this.currentCalendarMonth < 0) {
            this.currentCalendarMonth = 11;
            this.currentCalendarYear--;
        }
        this.renderActiveTab();
    }

    nextMonth() {
        this.currentCalendarMonth++;
        if (this.currentCalendarMonth > 11) {
            this.currentCalendarMonth = 0;
            this.currentCalendarYear++;
        }
        this.renderActiveTab();
    }
}

// Ambito global
window.paymentsModule = new PaymentsModule();
