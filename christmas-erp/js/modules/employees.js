// Módulo de Personal & Sueldos (NAVIDAD Y EMPRESAS)
// Gestión de operarios, asistencia diaria y liquidación de jornales
// Todos los montos son NETOS SIN IVA

class EmployeesModule {
    constructor() {
        this.activeTab = "listado"; // "listado", "asistencia", "liquidacion"
        this.editingEmployeeId = null;
        this.selectedAttendanceDate = new Date().toISOString().split('T')[0];
        this.payrollEmployeeFilter = "";
        this.payrollStatusFilter = "Pendiente";
        this.selectedJournalIds = [];
    }

    render(container) {
        const total = store.employees.length;
        const active = store.employees.filter(e => e.status !== "Inactivo").length;
        const pendingPay = store.attendance.filter(a => a.status === "Presente" && a.paymentStatus === "Pendiente")
            .reduce((sum, a) => sum + a.totalPay, 0);
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Personal &amp; Sueldos</h2>
                    <p>Administración de operarios, asistencia diaria y liquidación de jornales.</p>
                </div>
            </div>

            <div class="kpi-container">
                <div class="kpi-card">
                    <div class="kpi-icon blue">👥</div>
                    <div class="kpi-info"><h4>Operarios Activos</h4><div class="value">${active}</div></div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon gold">⏱️</div>
                    <div class="kpi-info"><h4>Jornales Pendientes</h4><div class="value" style="font-size:1.3rem;">${fmt(pendingPay)}</div></div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon red">✗</div>
                    <div class="kpi-info"><h4>Inactivos</h4><div class="value">${total - active}</div></div>
                </div>
            </div>

            <div class="tab-container">
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'listado' ? 'active' : ''}" id="tab-emp-listado">Listado de Operarios</div>
                    <div class="tab ${this.activeTab === 'asistencia' ? 'active' : ''}" id="tab-emp-asistencia">Control de Asistencia</div>
                    <div class="tab ${this.activeTab === 'liquidacion' ? 'active' : ''}" id="tab-emp-liquidacion">Liquidación de Sueldos</div>
                </div>
            </div>

            <div id="emp-content-area"></div>
        `;

        document.getElementById("tab-emp-listado").addEventListener("click", () => this.switchTab("listado"));
        document.getElementById("tab-emp-asistencia").addEventListener("click", () => this.switchTab("asistencia"));
        document.getElementById("tab-emp-liquidacion").addEventListener("click", () => this.switchTab("liquidacion"));

        this.renderActiveTab();
    }

    switchTab(tab) { this.activeTab = tab; this.renderActiveTab(); }

    renderActiveTab() {
        const area = document.getElementById("emp-content-area");
        if (!area) return;
        if (this.activeTab === "listado") this.renderListadoTab(area);
        else if (this.activeTab === "asistencia") this.renderAttendanceTab(area);
        else this.renderPayrollTab(area);
    }

    // ─── TAB 1: LISTADO DE OPERARIOS ────────────────────────────────────────────
    renderListadoTab(container) {
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px; align-items: flex-start;">
                <div class="card" id="employee-form-container"></div>
                <div class="card">
                    <div class="card-title">Listado de Operarios</div>
                    <div class="table-container">
                        <table style="font-size:0.85rem;">
                            <thead><tr>
                                <th>Nombre</th><th>Teléfono</th><th>Ingreso</th>
                                <th style="text-align:right;">Hora Normal</th>
                                <th style="text-align:right;">Hora Extra</th>
                                <th style="text-align:center;">Estado</th>
                                <th style="text-align:right; width:140px;">Acciones</th>
                            </tr></thead>
                            <tbody id="employee-list-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        this.renderForm();
        this.renderList();
    }

    renderForm() {
        const formContainer = document.getElementById("employee-form-container");
        if (!formContainer) return;
        let emp = {
            name: "", phone: "",
            entryDate: new Date().toISOString().split('T')[0],
            hourlyRate: store.settings.valorHoraNormal || 2500,
            extraHourlyRate: store.settings.valorHoraExtra || 3750,
            status: "Activo", notes: ""
        };
        if (this.editingEmployeeId) {
            const found = store.employees.find(e => e.id === this.editingEmployeeId);
            if (found) emp = found;
        }
        formContainer.innerHTML = `
            <div class="card-title">${this.editingEmployeeId ? 'Editar Operario' : 'Registrar Nuevo Operario'}</div>
            <form id="form-employee" onsubmit="employeesModule.saveEmployee(event)">
                <div class="form-group"><label>Nombre Completo *</label>
                    <input type="text" id="emp-name" class="form-control" value="${emp.name}" placeholder="Ej: Carlos Gómez" required></div>
                <div class="form-group"><label>Teléfono</label>
                    <input type="text" id="emp-phone" class="form-control" value="${emp.phone || ''}" placeholder="351 123-4567"></div>
                <div class="form-group"><label>Fecha de Ingreso</label>
                    <input type="date" id="emp-entry-date" class="form-control" value="${emp.entryDate || ''}"></div>
                <div class="form-row" style="margin-bottom:12px;">
                    <div class="form-group"><label>Valor Hora Normal ($)</label>
                        <input type="number" id="emp-hourly-rate" class="form-control" value="${emp.hourlyRate}" required></div>
                    <div class="form-group"><label>Valor Hora Extra ($)</label>
                        <input type="number" id="emp-extra-hourly-rate" class="form-control" value="${emp.extraHourlyRate}" required></div>
                </div>
                <div class="form-group"><label>Estado</label>
                    <select id="emp-status" class="form-control">
                        <option value="Activo" ${emp.status !== 'Inactivo' ? 'selected' : ''}>Activo</option>
                        <option value="Inactivo" ${emp.status === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select></div>
                <div class="form-group"><label>Observaciones</label>
                    <textarea id="emp-notes" class="form-control" rows="3">${emp.notes || ''}</textarea></div>
                <div style="display:flex; justify-content:flex-end; gap:10px; border-top:1px solid var(--color-border); padding-top:12px; margin-top:12px;">
                    ${this.editingEmployeeId ? `<button type="button" class="btn btn-secondary btn-sm" onclick="employeesModule.cancelEdit()">Cancelar</button>` : ''}
                    <button type="submit" class="btn btn-primary btn-sm">${this.editingEmployeeId ? 'Guardar Cambios' : 'Registrar Operario'}</button>
                </div>
            </form>
        `;
    }

    renderList() {
        const tbody = document.getElementById("employee-list-tbody");
        if (!tbody) return;
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
        if (store.employees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--color-text-muted); padding:20px;">No hay operarios registrados.</td></tr>`;
            return;
        }
        tbody.innerHTML = store.employees.map(emp => {
            const entryStr = emp.entryDate ? new Date(emp.entryDate + "T00:00:00").toLocaleDateString("es-AR") : "S/D";
            const isActive = emp.status !== "Inactivo";
            const badge = isActive ? `<span class="badge delivered" style="font-size:0.7rem; padding:2px 6px;">Activo</span>` : `<span class="badge canceled" style="font-size:0.7rem; padding:2px 6px;">Inactivo</span>`;
            const customInd = emp.isCustomRate ? ` <span title="Tarifa Personalizada" style="color:var(--color-gold);">⭐</span>` : "";
            return `<tr style="border-bottom:1px solid var(--color-border);">
                <td><strong>${esc(emp.name)}</strong>${customInd}${emp.notes ? `<br><span style="font-size:0.75rem; color:var(--color-text-muted); font-style:italic;">"${esc(emp.notes.substring(0,40))}"</span>` : ''}</td>
                <td>${esc(emp.phone || 'S/D')}</td>
                <td>${entryStr}</td>
                <td style="text-align:right; font-weight:600;">${fmt(emp.hourlyRate)}</td>
                <td style="text-align:right; font-weight:600;">${fmt(emp.extraHourlyRate)}</td>
                <td style="text-align:center;">${badge}</td>
                <td style="text-align:right;">
                    <div style="display:inline-flex; gap:4px;">
                        <button class="btn btn-secondary btn-sm" onclick="employeesModule.editEmployee('${emp.id}')" style="padding:2px 6px; font-size:0.75rem;">Editar</button>
                        <button class="btn ${isActive ? 'btn-gold' : 'btn-green'} btn-sm" onclick="employeesModule.toggleEmployeeStatus('${emp.id}')" style="padding:2px 6px; font-size:0.75rem;">
                            ${isActive ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join("");
    }

    editEmployee(id) { this.editingEmployeeId = id; this.switchTab("listado"); }
    cancelEdit() { this.editingEmployeeId = null; this.renderForm(); }

    toggleEmployeeStatus(id) {
        const emp = store.employees.find(e => e.id === id);
        if (emp) {
            emp.status = emp.status !== "Inactivo" ? "Inactivo" : "Activo";
            store.saveData();
            app.showToast(`"${emp.name}" marcado como ${emp.status.toLowerCase()}`, "success");
            this.render(document.getElementById("main-content"));
        }
    }

    saveEmployee(e) {
        e.preventDefault();
        const name = document.getElementById("emp-name").value.trim();
        const phone = document.getElementById("emp-phone").value.trim();
        const entryDate = document.getElementById("emp-entry-date").value;
        const hourlyRate = parseFloat(document.getElementById("emp-hourly-rate").value) || 0;
        const extraHourlyRate = parseFloat(document.getElementById("emp-extra-hourly-rate").value) || 0;
        const status = document.getElementById("emp-status").value;
        const notes = document.getElementById("emp-notes").value.trim();
        if (!name) { app.showToast("El nombre es obligatorio", "error"); return; }
        const isCustomRate = (hourlyRate !== (store.settings.valorHoraNormal || 2500)) || (extraHourlyRate !== (store.settings.valorHoraExtra || 3750));
        if (this.editingEmployeeId) {
            const emp = store.employees.find(e => e.id === this.editingEmployeeId);
            if (emp) Object.assign(emp, { name, phone, entryDate, hourlyRate, extraHourlyRate, status, notes, isCustomRate });
            app.showToast(`Operario "${name}" actualizado`, "success");
        } else {
            store.employees.push({ id: "emp_" + Date.now(), name, phone, entryDate, hourlyRate, extraHourlyRate, status, notes, isCustomRate });
            app.showToast(`Operario "${name}" registrado`, "success");
        }
        store.saveData();
        this.editingEmployeeId = null;
        this.render(document.getElementById("main-content"));
    }

    // ─── TAB 2: ASISTENCIA ─────────────────────────────────────────────────────
    initializeAttendanceForDate(dateStr) {
        let hasChanges = false;
        store.employees.forEach(emp => {
            if (emp.status === "Inactivo") return;
            const hasRecord = store.attendance.some(a => a.date === dateStr && a.employeeId === emp.id);
            if (!hasRecord) {
                store.attendance.push({
                    id: "att_" + Date.now() + "_" + emp.id + "_" + Math.floor(Math.random()*100),
                    date: dateStr, employeeId: emp.id,
                    clockIn: "00:00", clockOut: "00:00",
                    hours: 0.0, normalHours: 0.0, extraHours: 0.0,
                    status: "Ausente", paymentStatus: "Pendiente", totalPay: 0
                });
                hasChanges = true;
            }
        });
        if (hasChanges) store.saveData();
    }

    renderAttendanceTab(container) {
        const dateStr = this.selectedAttendanceDate;
        this.initializeAttendanceForDate(dateStr);
        const uniqueDates = [...new Set(store.attendance.map(a => a.date))].sort().reverse();
        let historyDatesHtml = uniqueDates.map(d => {
            const isActive = d === dateStr;
            const formatted = new Date(d + "T00:00:00").toLocaleDateString("es-AR", { day: 'numeric', month: 'short', year: 'numeric' });
            return `<button type="button" class="btn ${isActive ? 'btn-primary' : 'btn-secondary'}"
                onclick="employeesModule.loadAttendanceDate('${d}')"
                style="width:100%; text-align:left; padding:6px 10px; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span>📅 ${formatted}</span>${isActive ? '<span>➔</span>' : ''}
            </button>`;
        }).join("") || '<span style="color:var(--color-text-muted); font-size:0.8rem;">Sin fechas</span>';

        const records = store.attendance.filter(a => a.date === dateStr);
        const totalHoursDay = records.reduce((acc, r) => acc + (r.status === 'Presente' ? r.hours : 0), 0);
        const totalPayDay = records.reduce((acc, r) => acc + (r.status === 'Presente' ? r.totalPay : 0), 0);

        let rowsHtml = records.map(rec => {
            const emp = store.employees.find(e => e.id === rec.employeeId);
            if (!emp) return "";
            const isLiquidado = rec.paymentStatus === "Liquidado";
            const dis = isLiquidado ? 'disabled' : '';
            const disClock = (isLiquidado || rec.status !== 'Presente') ? 'disabled' : '';
            const nameSuffix = emp.status === "Inactivo" ? ` <span style="color:var(--color-red); font-size:0.75rem;">(Inactivo)</span>` : "";
            return `<tr>
                <td><strong>${esc(emp.name)}${nameSuffix}</strong></td>
                <td><select class="form-control" style="width:115px; padding:4px; font-size:0.8rem;" ${dis} onchange="employeesModule.updateDailyStatus('${rec.id}', this.value)">
                    <option value="Presente" ${rec.status === 'Presente' ? 'selected' : ''}>Presente</option>
                    <option value="Ausente" ${rec.status === 'Ausente' ? 'selected' : ''}>Ausente</option>
                    <option value="Licencia" ${rec.status === 'Licencia' ? 'selected' : ''}>Licencia</option>
                </select></td>
                <td><input type="text" class="form-control" style="width:75px; padding:4px; text-align:center; font-size:0.8rem;" value="${rec.clockIn}" ${disClock} onchange="employeesModule.updateDailyClock('${rec.id}', 'clockIn', this.value)"></td>
                <td><input type="text" class="form-control" style="width:75px; padding:4px; text-align:center; font-size:0.8rem;" value="${rec.clockOut}" ${disClock} onchange="employeesModule.updateDailyClock('${rec.id}', 'clockOut', this.value)"></td>
                <td><input type="number" class="form-control" style="width:75px; padding:4px; text-align:center; font-size:0.8rem;" value="${rec.hours}" step="0.5" min="0" max="24" ${disClock} onchange="employeesModule.updateDailyHours('${rec.id}', this.value)"></td>
                <td>${rec.normalHours} hs</td>
                <td style="color:var(--color-gold); font-weight:600;">${rec.extraHours} hs</td>
                <td><strong>$${rec.totalPay.toLocaleString('es-AR')}</strong></td>
            </tr>`;
        }).join("");

        const nextDate = this.getNextDateStr(dateStr);

        container.innerHTML = `
            <div style="display:flex; gap:15px; align-items:flex-start;">
                <div style="width:220px; flex-shrink:0; background:var(--bg-card); border:1px solid var(--color-border); padding:15px; border-radius:var(--radius-md); max-height:550px; overflow-y:auto;">
                    <h4 style="margin-top:0; margin-bottom:12px; font-size:0.9rem; color:var(--color-gold); text-transform:uppercase;">Historial de Fechas</h4>
                    <div style="display:flex; flex-direction:column; gap:2px;">${historyDatesHtml}</div>
                </div>
                <div style="flex-grow:1; display:flex; flex-direction:column; gap:15px;">
                    <div class="card" style="padding:15px;">
                        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                            <label style="font-weight:600; color:var(--color-gold); font-size:0.9rem;">Nueva Fecha:</label>
                            <input type="date" id="attendance-date-select" class="form-control" style="width:180px; padding:6px;" value="${nextDate}">
                            <button class="btn btn-primary btn-sm" onclick="employeesModule.changeAttendanceDate()">Cargar Fecha</button>
                        </div>
                    </div>
                    <div class="card" style="padding:15px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-border); padding-bottom:8px; margin-bottom:15px;">
                            <h3 style="margin:0; font-size:1.1rem;">Presentismo — ${new Date(dateStr + "T00:00:00").toLocaleDateString("es-AR", { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</h3>
                            <div style="font-size:0.85rem; background:var(--bg-sidebar); border:1px solid var(--color-border); padding:4px 10px; border-radius:4px;">
                                Horas: <strong>${totalHoursDay.toFixed(1)} hs</strong> | Jornal: <strong style="color:var(--color-green);">$${totalPayDay.toLocaleString('es-AR')}</strong>
                            </div>
                        </div>
                        <p style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:12px; margin-top:0;">
                            Jornada normal: <strong>${store.settings.jornadaNormal} hs</strong>. Hora Normal: $${store.settings.valorHoraNormal} | Hora Extra: $${store.settings.valorHoraExtra}
                        </p>
                        <div class="table-container">
                            <table>
                                <thead><tr>
                                    <th>Operario</th><th>Estado</th><th>Ingreso</th><th>Egreso</th>
                                    <th>Horas Dec.</th><th>Hs Norm.</th><th>Hs Extra</th><th>Jornal</th>
                                </tr></thead>
                                <tbody>${rowsHtml}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadAttendanceDate(d) { this.selectedAttendanceDate = d; this.renderActiveTab(); }

    getNextDateStr(dateStr) {
        try {
            const d = new Date(dateStr + "T00:00:00");
            d.setDate(d.getDate() + 1);
            return d.toISOString().split('T')[0];
        } catch(e) { return new Date().toISOString().split('T')[0]; }
    }

    changeAttendanceDate() {
        const inputDate = document.getElementById("attendance-date-select").value;
        if (!inputDate) return;
        this.initializeAttendanceForDate(inputDate);
        this.selectedAttendanceDate = inputDate;
        this.renderActiveTab();
        app.showToast(`Fecha ${inputDate} cargada.`, "success");
    }

    updateDailyStatus(recId, status) {
        const rec = store.attendance.find(a => a.id === recId);
        if (!rec) return;
        if (rec.paymentStatus === "Liquidado") { app.showToast("No se puede modificar una asistencia ya liquidada.", "error"); this.renderActiveTab(); return; }
        rec.status = status;
        if (status !== "Presente") {
            rec.clockIn = "00:00"; rec.clockOut = "00:00";
            rec.hours = 0.0; rec.normalHours = 0.0; rec.extraHours = 0.0; rec.totalPay = 0;
        } else {
            rec.clockIn = "08:00"; rec.clockOut = "17:00"; rec.hours = 8.0;
            this.recalculateRecordPay(rec);
        }
        store.saveData(); this.renderActiveTab();
    }

    updateDailyClock(recId, field, timeVal) {
        const rec = store.attendance.find(a => a.id === recId);
        if (!rec) return;
        if (rec.paymentStatus === "Liquidado") { app.showToast("No se puede modificar una asistencia ya liquidada.", "error"); this.renderActiveTab(); return; }
        rec[field] = timeVal;
        try {
            const inArr = rec.clockIn.split(':'); const outArr = rec.clockOut.split(':');
            if (inArr.length === 2 && outArr.length === 2) {
                const inHr = parseFloat(inArr[0]) + parseFloat(inArr[1])/60;
                const outHr = parseFloat(outArr[0]) + parseFloat(outArr[1])/60;
                let diff = outHr - inHr;
                if (diff > 0) {
                    let finalHours = diff >= 7.0 ? (diff - 1.0) : diff;
                    rec.hours = Math.round(finalHours * 10) / 10;
                    this.recalculateRecordPay(rec);
                }
            }
        } catch(e) {}
        store.saveData(); this.renderActiveTab();
    }

    updateDailyHours(recId, hoursVal) {
        const rec = store.attendance.find(a => a.id === recId);
        if (!rec) return;
        if (rec.paymentStatus === "Liquidado") { app.showToast("No se puede modificar una asistencia ya liquidada.", "error"); this.renderActiveTab(); return; }
        rec.hours = parseFloat(hoursVal) || 0.0;
        this.recalculateRecordPay(rec);
        store.saveData(); this.renderActiveTab();
    }

    recalculateRecordPay(rec) {
        const emp = store.employees.find(e => e.id === rec.employeeId);
        if (!emp) return;
        const maxRegular = store.settings.jornadaNormal;
        const hourlyRate = emp.hourlyRate || store.settings.valorHoraNormal;
        const extraRate = emp.extraHourlyRate || store.settings.valorHoraExtra;
        if (rec.hours > maxRegular) {
            rec.normalHours = maxRegular; rec.extraHours = rec.hours - maxRegular;
        } else {
            rec.normalHours = rec.hours; rec.extraHours = 0.0;
        }
        rec.totalPay = Math.round((rec.normalHours * hourlyRate) + (rec.extraHours * extraRate));
    }

    // ─── TAB 3: LIQUIDACIÓN ─────────────────────────────────────────────────────
    renderPayrollTab(container) {
        this.selectedJournalIds = this.selectedJournalIds.filter(id => {
            const rec = store.attendance.find(a => a.id === id);
            return rec && rec.paymentStatus === "Pendiente" && rec.status === "Presente";
        });

        const allPresent = store.attendance.filter(rec => rec.status === "Presente");
        let mainFiltered = allPresent;
        if (this.payrollEmployeeFilter) mainFiltered = mainFiltered.filter(r => r.employeeId === this.payrollEmployeeFilter);
        if (this.payrollStatusFilter) mainFiltered = mainFiltered.filter(r => r.paymentStatus === this.payrollStatusFilter);

        let liquidatedHistory = allPresent.filter(r => r.paymentStatus === "Liquidado");
        if (this.payrollEmployeeFilter) liquidatedHistory = liquidatedHistory.filter(r => r.employeeId === this.payrollEmployeeFilter);
        liquidatedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        let pendingNormalHours = 0, pendingExtraHours = 0, pendingTotalPay = 0;
        allPresent.filter(r => r.paymentStatus === "Pendiente").forEach(r => {
            pendingNormalHours += r.normalHours; pendingExtraHours += r.extraHours; pendingTotalPay += r.totalPay;
        });

        let selectedPaySum = this.selectedJournalIds.reduce((sum, id) => {
            const rec = store.attendance.find(a => a.id === id);
            return sum + (rec ? rec.totalPay : 0);
        }, 0);

        const employeeOptions = `<option value="">-- Todos --</option>` +
            store.employees.map(emp => `<option value="${emp.id}" ${this.payrollEmployeeFilter === emp.id ? 'selected' : ''}>${emp.name}${emp.status === 'Inactivo' ? ' (Inactivo)' : ''}</option>`).join("");

        const pendingVisibleIds = mainFiltered.filter(r => r.paymentStatus === "Pendiente").map(r => r.id);
        const isAllSelected = pendingVisibleIds.length > 0 && pendingVisibleIds.every(id => this.selectedJournalIds.includes(id));

        let mainRowsHtml = mainFiltered.length === 0
            ? `<tr><td colspan="9" style="text-align:center; color:var(--color-text-muted); padding:20px;">Sin jornales para los filtros seleccionados.</td></tr>`
            : mainFiltered.map(rec => {
                const emp = store.employees.find(e => e.id === rec.employeeId);
                if (!emp) return "";
                const isChecked = this.selectedJournalIds.includes(rec.id);
                const showCheckbox = rec.paymentStatus === "Pendiente";
                return `<tr>
                    <td style="text-align:center;">${showCheckbox ? `<input type="checkbox" style="width:16px; height:16px; cursor:pointer;" ${isChecked ? 'checked' : ''} onchange="employeesModule.toggleJournalSelection('${rec.id}', this.checked)">` : '—'}</td>
                    <td>${new Date(rec.date).toLocaleDateString("es-AR")}</td>
                    <td><strong>${esc(emp.name)}</strong></td>
                    <td style="text-align:center;">${rec.clockIn} - ${rec.clockOut}</td>
                    <td style="text-align:center;">${rec.hours.toFixed(1)} hs</td>
                    <td style="text-align:center;">${rec.normalHours.toFixed(1)} hs</td>
                    <td style="text-align:center; color:var(--color-gold); font-weight:600;">${rec.extraHours.toFixed(1)} hs</td>
                    <td style="text-align:right; font-weight:600;">$${rec.totalPay.toLocaleString('es-AR')}</td>
                    <td style="text-align:center;"><span class="badge ${rec.paymentStatus === 'Liquidado' ? 'delivered' : 'pending'}">${rec.paymentStatus}</span></td>
                </tr>`;
            }).join("");

        let historyRowsHtml = liquidatedHistory.length === 0
            ? `<tr><td colspan="6" style="text-align:center; color:var(--color-text-muted); padding:15px;">Sin jornales liquidados.</td></tr>`
            : liquidatedHistory.slice(0, 20).map(rec => {
                const emp = store.employees.find(e => e.id === rec.employeeId);
                if (!emp) return "";
                return `<tr>
                    <td>${new Date(rec.date).toLocaleDateString("es-AR")}</td>
                    <td><strong>${esc(emp.name)}</strong></td>
                    <td style="text-align:center;">${rec.hours.toFixed(1)} hs (Ex: ${rec.extraHours.toFixed(1)})</td>
                    <td style="text-align:right; font-weight:600; color:var(--color-green);">$${rec.totalPay.toLocaleString('es-AR')}</td>
                    <td style="text-align:center;"><span class="badge delivered">Liquidado</span></td>
                    <td style="text-align:center;"><button class="btn btn-secondary btn-sm" onclick="employeesModule.revertJournal('${rec.id}')" style="color:var(--color-red); padding:2px 8px; font-size:0.75rem;">Revertir</button></td>
                </tr>`;
            }).join("");

        container.innerHTML = `
            <div class="kpi-container" style="margin-bottom:20px;">
                <div class="kpi-card">
                    <div class="kpi-icon blue">⏱️</div>
                    <div class="kpi-info"><h4>Horas Pendientes</h4><div class="value">${(pendingNormalHours + pendingExtraHours).toFixed(1)} hs</div>
                    <span style="font-size:0.75rem; color:var(--color-text-muted);">Norm: ${pendingNormalHours.toFixed(1)} | Extra: ${pendingExtraHours.toFixed(1)}</span></div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon red">💵</div>
                    <div class="kpi-info"><h4>Monto Pendiente</h4><div class="value" style="color:var(--color-red); font-size:1.5rem;">$${pendingTotalPay.toLocaleString('es-AR')}</div></div>
                </div>
            </div>

            <div class="card" style="margin-bottom:20px; padding:15px;">
                <div class="card-title" style="font-size:0.95rem; margin-bottom:10px;">Filtros</div>
                <div style="display:flex; gap:15px; align-items:center; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:600;">Operario:</label>
                        <select id="payroll-employee-filter" class="form-control" style="width:200px; padding:4px;" onchange="employeesModule.changePayrollFilters()">${employeeOptions}</select>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:600;">Estado:</label>
                        <select id="payroll-status-filter" class="form-control" style="width:150px; padding:4px;" onchange="employeesModule.changePayrollFilters()">
                            <option value="Pendiente" ${this.payrollStatusFilter === 'Pendiente' ? 'selected' : ''}>Pendientes</option>
                            <option value="Liquidado" ${this.payrollStatusFilter === 'Liquidado' ? 'selected' : ''}>Liquidados</option>
                            <option value="" ${this.payrollStatusFilter === '' ? 'selected' : ''}>Todos</option>
                        </select>
                    </div>
                </div>
            </div>

            ${this.selectedJournalIds.length > 0 ? `
                <div class="card" style="background:rgba(47,121,104,0.08); border:2px solid var(--color-green); margin-bottom:20px; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="color:var(--color-green); margin:0 0 4px 0;">Liquidación Masiva</h4>
                        <span style="font-size:0.9rem;">Seleccionados: <strong>${this.selectedJournalIds.length}</strong> | Total: <strong style="font-size:1.1rem; color:var(--color-green);">$${selectedPaySum.toLocaleString('es-AR')}</strong></span>
                    </div>
                    <button class="btn btn-green" onclick="employeesModule.liquidateSelectedJournals()">💰 Pagar / Liquidar Jornales</button>
                </div>
            ` : ''}

            <div class="card" style="margin-bottom:30px;">
                <div class="card-title">Planilla de Jornales</div>
                <div class="table-container">
                    <table>
                        <thead><tr>
                            <th style="width:40px; text-align:center;">
                                ${this.payrollStatusFilter !== 'Liquidado' ? `<input type="checkbox" style="width:16px; height:16px; cursor:pointer;" ${isAllSelected ? 'checked' : ''} onchange="employeesModule.toggleSelectAllJournals(this.checked)">` : '—'}
                            </th>
                            <th>Fecha</th><th>Operario</th><th style="text-align:center;">Horario</th>
                            <th style="text-align:center;">Hs Tot.</th><th style="text-align:center;">Hs Norm.</th>
                            <th style="text-align:center;">Hs Extra</th><th style="text-align:right;">Subtotal</th>
                            <th style="text-align:center;">Estado</th>
                        </tr></thead>
                        <tbody>${mainRowsHtml}</tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-title" style="color:var(--color-text-muted);">Historial de Jornales Liquidados</div>
                <div class="table-container">
                    <table>
                        <thead><tr>
                            <th>Fecha</th><th>Operario</th><th style="text-align:center;">Horas</th>
                            <th style="text-align:right;">Monto</th><th style="text-align:center;">Estado</th><th style="text-align:center;">Acción</th>
                        </tr></thead>
                        <tbody>${historyRowsHtml}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    changePayrollFilters() {
        this.payrollEmployeeFilter = document.getElementById("payroll-employee-filter").value;
        this.payrollStatusFilter = document.getElementById("payroll-status-filter").value;
        this.selectedJournalIds = [];
        this.renderActiveTab();
    }

    toggleSelectAllJournals(checked) {
        const allPending = store.attendance.filter(r => r.status === "Presente" && r.paymentStatus === "Pendiente");
        let filtered = allPending;
        if (this.payrollEmployeeFilter) filtered = filtered.filter(r => r.employeeId === this.payrollEmployeeFilter);
        const visibleIds = filtered.map(r => r.id);
        if (checked) {
            visibleIds.forEach(id => { if (!this.selectedJournalIds.includes(id)) this.selectedJournalIds.push(id); });
        } else {
            this.selectedJournalIds = this.selectedJournalIds.filter(id => !visibleIds.includes(id));
        }
        this.renderActiveTab();
    }

    toggleJournalSelection(id, checked) {
        if (checked) { if (!this.selectedJournalIds.includes(id)) this.selectedJournalIds.push(id); }
        else { this.selectedJournalIds = this.selectedJournalIds.filter(x => x !== id); }
        this.renderActiveTab();
    }

    liquidateSelectedJournals() {
        if (this.selectedJournalIds.length === 0) return;
        if (confirm(`¿Confirmar liquidación de ${this.selectedJournalIds.length} jornal(es)?`)) {
            let count = 0;
            this.selectedJournalIds.forEach(id => {
                const rec = store.attendance.find(a => a.id === id);
                if (rec && rec.paymentStatus === "Pendiente") {
                    rec.paymentStatus = "Liquidado";
                    const emp = store.employees.find(e => e.id === rec.employeeId);
                    const empName = emp ? emp.name : "Operario";
                    if (!store.expenses) store.expenses = [];
                    store.expenses.push({
                        id: "exp_pay_" + rec.id,
                        date: new Date().toISOString().split('T')[0],
                        description: `Jornal ${rec.date} — ${empName}`,
                        category: "Sueldos",
                        amount: rec.totalPay,
                        notes: `Liquidado desde Personal & Sueldos`,
                        employeeId: rec.employeeId,
                        employeeName: empName,
                        attendanceId: rec.id
                    });
                    count++;
                }
            });
            store.saveData();
            app.showToast(`${count} jornal(es) liquidados como Gastos/Sueldos.`, "success");
            this.selectedJournalIds = [];
            this.renderActiveTab();
        }
    }

    revertJournal(id) {
        const rec = store.attendance.find(a => a.id === id);
        if (rec && confirm("¿Revertir este jornal a Pendiente?")) {
            rec.paymentStatus = "Pendiente";
            if (store.expenses) store.expenses = store.expenses.filter(e => e.attendanceId !== id);
            store.saveData();
            app.showToast("Jornal revertido a pendiente.", "info");
            this.renderActiveTab();
        }
    }
}

window.employeesModule = new EmployeesModule();
