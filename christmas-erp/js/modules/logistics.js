// Módulo de Logística y Distribución (NAVIDAD Y EMPRESAS)
// 3 pestañas: Lista de Entregas (con toggle zona), Calendario (con toggle zona), Datos Pendientes

class LogisticsModule {
    constructor() {
        this.activeTab = "lista"; // "lista", "calendario", "pending_info"
        this.zoneFilter = "todas"; // "todas", "cordoba", "provincias"
        const currentDate = new Date();
        this.currentCalendarYear = currentDate.getFullYear();
        this.currentCalendarMonth = currentDate.getMonth();
    }

    isCba(order) {
        return order.deliveryLocation &&
            (order.deliveryLocation.toLowerCase().includes("córdoba") || order.deliveryLocation.toLowerCase().includes("cordoba"));
    }

    isCbaLoc(loc) {
        return loc && (loc.toLowerCase().includes("córdoba") || loc.toLowerCase().includes("cordoba"));
    }

    // Construye lista plana de pares { order, entrega } para lista y calendario
    _buildPairs(statusFilter) {
        const pairs = [];
        store.orders
            .filter(o => statusFilter ? statusFilter(o) : true)
            .forEach(order => {
                const entregas = order.entregas && order.entregas.length > 0
                    ? order.entregas
                    : [{ id: `ent_${order.id}_leg`, cantidadCajas: order.numberOfBoxes, direccion: order.deliveryAddress || "", localidad: order.deliveryLocation || "", provincia: "", fechaEntrega: order.deliveryDate || "", chofer: order.assignedDriver || "", costoEnvio: 0, status: order.status === "Despachado" ? "Despachada" : order.status === "Entregado" ? "Entregada" : "Pendiente", remito: order.signedRemitoPhoto || "", fotoEntrega: "" }];
                entregas.forEach(entrega => pairs.push({ order, entrega }));
            });
        return pairs;
    }

    _filterPairsByZone(pairs) {
        if (this.zoneFilter === "cordoba")    return pairs.filter(p => this.isCbaLoc(p.entrega.localidad) || (!p.entrega.localidad && this.isCba(p.order)));
        if (this.zoneFilter === "provincias") return pairs.filter(p => !this.isCbaLoc(p.entrega.localidad) && !((!p.entrega.localidad) && this.isCba(p.order)));
        return pairs;
    }

    render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Logística, Entregas y Distribución</h2>
                    <p>Gestión de despachos, calendarios y hojas de armado.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary btn-sm" id="btn-group-deliveries-log">+ Crear Hoja de Ruta</button>
                </div>
            </div>

            <div class="tab-container">
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'lista' ? 'active' : ''}" id="tab-log-lista">Lista de Entregas</div>
                    <div class="tab ${this.activeTab === 'calendario' ? 'active' : ''}" id="tab-log-calendario">Calendario</div>
                    <div class="tab ${this.activeTab === 'pending_info' ? 'active' : ''}" id="tab-log-pending">Datos Pendientes</div>
                </div>
            </div>

            <div id="logistics-content-area-new"></div>
        `;

        document.getElementById("tab-log-lista").addEventListener("click", () => this.switchTab("lista"));
        document.getElementById("tab-log-calendario").addEventListener("click", () => this.switchTab("calendario"));
        document.getElementById("tab-log-pending").addEventListener("click", () => this.switchTab("pending_info"));
        document.getElementById("btn-group-deliveries-log").addEventListener("click", () => this.openGroupDeliveriesModal());

        this.renderActiveTab();
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        this.renderActiveTab();
    }

    // Renderiza el toggle de zona encima del contenido
    renderZoneToggle() {
        return `
            <div style="display:flex; gap:6px; margin-bottom:16px; align-items:center;">
                <span style="font-size:0.82rem; color:var(--color-text-muted); margin-right:4px;">Zona:</span>
                <button class="btn btn-sm ${this.zoneFilter === 'todas' ? 'btn-primary' : 'btn-secondary'}" onclick="logisticsModule.setZone('todas')" style="padding:4px 12px; font-size:0.8rem;">Todas</button>
                <button class="btn btn-sm ${this.zoneFilter === 'cordoba' ? 'btn-gold' : 'btn-secondary'}" onclick="logisticsModule.setZone('cordoba')" style="padding:4px 12px; font-size:0.8rem;">Córdoba Capital</button>
                <button class="btn btn-sm ${this.zoneFilter === 'provincias' ? 'btn-primary' : 'btn-secondary'}" onclick="logisticsModule.setZone('provincias')" style="padding:4px 12px; font-size:0.8rem; background:${this.zoneFilter === 'provincias' ? 'var(--color-purple)' : ''};">Otras Provincias</button>
            </div>
        `;
    }

    setZone(zone) {
        this.zoneFilter = zone;
        this.renderActiveTab();
    }

    filterByZone(orders) {
        if (this.zoneFilter === "cordoba") return orders.filter(o => this.isCba(o));
        if (this.zoneFilter === "provincias") return orders.filter(o => !this.isCba(o));
        return orders;
    }

    renderActiveTab() {
        const area = document.getElementById("logistics-content-area-new");

        const statusFilter = o => o.status !== "Presupuesto Enviado" && o.status !== "Cancelado" && o.status !== "Cerrado";
        const allPairs = this._buildPairs(statusFilter);
        const filteredPairs = this._filterPairsByZone(allPairs);

        if (this.activeTab === "lista") {
            area.innerHTML = this.renderZoneToggle();
            const listContainer = document.createElement("div");
            area.appendChild(listContainer);
            this.renderListContent(listContainer, filteredPairs);
        } else if (this.activeTab === "calendario") {
            area.innerHTML = this.renderZoneToggle();
            const calContainer = document.createElement("div");
            area.appendChild(calContainer);
            const calPairs = this.zoneFilter === "todas"
                ? allPairs.filter(p => this.isCbaLoc(p.entrega.localidad) || (!p.entrega.localidad && this.isCba(p.order)))
                : filteredPairs;
            const zone = this.zoneFilter === "provincias" ? "provincias" : "cordoba";
            this.renderCalendarTab(calContainer, calPairs, zone);
        } else {
            this.renderPendingInfoTab(area, allPairs);
        }
    }

    // Lista de entregas — una fila por entrega (unidad mínima indivisible)
    renderListContent(container, pairs) {
        const sorted = [...pairs].sort((a, b) => {
            const da = a.entrega.fechaEntrega || "9999-99-99";
            const db = b.entrega.fechaEntrega || "9999-99-99";
            return da.localeCompare(db);
        });

        if (sorted.length === 0) {
            container.innerHTML = `<div class="card" style="text-align:center; padding:40px;"><h3>No hay entregas para el filtro seleccionado</h3></div>`;
            return;
        }

        const rows = sorted.map(({ order, entrega }) => {
            const derived     = store.deriveOrderStatus(order);
            const dispId      = order.displayId || ("#" + order.id.substring(4));
            const isCba       = this.isCbaLoc(entrega.localidad) || (!entrega.localidad && this.isCba(order));
            const totalEnt    = (order.entregas || []).length;
            const isMulti     = totalEnt > 1;

            const fechaStr    = entrega.fechaEntrega
                ? new Date(entrega.fechaEntrega + "T00:00:00").toLocaleDateString("es-AR", { weekday:"short", day:"2-digit", month:"2-digit", year:"numeric" })
                : "—";

            const zoneBadge   = isCba
                ? `<span class="badge" style="background:rgba(230,160,20,0.15);color:var(--color-gold);border:1px solid var(--color-gold);font-size:0.62rem;">CBA</span>`
                : `<span class="badge" style="background:rgba(150,80,220,0.1);color:#9b59b6;border:1px solid #9b59b6;font-size:0.62rem;">PROV</span>`;
            const multiBadge  = isMulti
                ? `<span class="badge" style="background:rgba(4,197,175,0.1);color:var(--color-teal,#04c5af);border:1px solid var(--color-teal,#04c5af);font-size:0.6rem;margin-left:3px;">${totalEnt} dest</span>`
                : "";
            const infoBadge   = (!entrega.fechaEntrega || !entrega.direccion || !entrega.localidad)
                ? `<span class="badge" style="background:var(--color-red);color:white;font-size:0.62rem;padding:1px 5px;">⚠️ PENDIENTE</span>`
                : "";

            // Estado por entrega
            let statusBadge;
            if (entrega.status === "Entregada") {
                statusBadge = `<span class="badge" style="background:var(--color-green);color:white;font-weight:600;">Entregada ✓</span>`;
            } else if (entrega.status === "Despachada") {
                statusBadge = `<span class="badge" style="background:var(--color-gold);color:black;font-weight:600;">En Ruta</span>`;
            } else {
                // Pendiente — mostrar estado derivado de armado
                if (derived === "Listo para Despacho" || derived === "Entrega Parcial") {
                    statusBadge = `<span class="badge" style="background:#2980b9;color:white;font-weight:600;">Lista p/ Despacho</span>`;
                } else if (derived === "Armado Parcial" || derived === "En Producción") {
                    const arm = (order.armado || {}).cajasArmadas || 0;
                    statusBadge = `<span class="badge" style="background:var(--color-gold);color:black;">Armando ${arm}/${order.numberOfBoxes}</span>`;
                } else {
                    statusBadge = `<span class="badge" style="background:var(--color-text-muted);color:white;">Confirmado</span>`;
                }
            }

            // Acciones por entrega
            const canDespachar = (derived === "Listo para Despacho" || derived === "Entrega Parcial") && entrega.status === "Pendiente";
            const isEnRuta     = entrega.status === "Despachada";
            const isEntregada  = entrega.status === "Entregada";

            const btnDespachar  = canDespachar
                ? `<button class="btn btn-primary btn-sm" onclick="logisticsModule.despacharEntrega('${order.id}','${entrega.id}')" style="padding:2px 6px;font-size:0.73rem;">Despachar</button>`
                : "";
            const btnEntregado  = isEnRuta
                ? `<button class="btn btn-primary btn-sm" style="background:var(--color-green);padding:2px 6px;font-size:0.73rem;" onclick="logisticsModule.openUploadRemitoModal('${order.id}','${entrega.id}')">Entregado</button>`
                : "";
            const btnVerRemito  = (isEntregada || entrega.remito)
                ? `<button class="btn btn-secondary btn-sm" onclick="logisticsModule.viewEntregaRemito('${order.id}','${entrega.id}')" style="color:var(--color-green);padding:2px 6px;font-size:0.73rem;">Ver Firma</button>`
                : "";
            const btnRemito     = `<button class="btn btn-secondary btn-sm" onclick="logisticsModule.printRemito('${order.id}')" style="padding:2px 6px;font-size:0.73rem;">Remito</button>`;
            const btnHoja       = `<button class="btn btn-gold btn-sm" onclick="logisticsModule.printHojaArmado('${order.id}')" style="padding:2px 6px;font-size:0.73rem;">Armado</button>`;

            return `<tr style="border-bottom:1px solid var(--color-border);">
                <td style="padding:6px 10px;white-space:nowrap;font-size:0.82rem;">${fechaStr}</td>
                <td style="padding:6px 10px;font-weight:600;font-size:0.83rem;">${dispId} ${zoneBadge}${multiBadge}</td>
                <td style="padding:6px 10px;font-size:0.8rem;color:var(--color-text-muted);">${esc(entrega.chofer || order.assignedDriver || '') || '<em>Sin asignar</em>'}</td>
                <td style="padding:6px 10px;">
                    <strong>${esc(order.clientName)}</strong> ${infoBadge}
                    <br><span style="font-size:0.73rem;color:var(--color-text-muted);">CUIT: ${esc(order.cuit || 'S/D')}</span>
                </td>
                <td style="padding:6px 10px;">
                    ${esc(entrega.direccion) || '<span style="color:var(--color-red);">Falta dirección</span>'}
                    <br><span style="font-size:0.73rem;color:var(--color-text-muted);font-weight:600;">${esc(entrega.localidad || 'Falta localidad')}${entrega.provincia ? ', ' + esc(entrega.provincia) : ''}</span>
                </td>
                <td style="padding:6px 10px;text-align:center;font-weight:bold;">${entrega.cantidadCajas}</td>
                <td style="padding:6px 10px;white-space:nowrap;">${statusBadge}</td>
                <td style="padding:6px 10px;text-align:right;">
                    <div style="display:inline-flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
                        ${btnHoja}${btnRemito}${btnDespachar}${btnEntregado}${btnVerRemito}
                    </div>
                </td>
            </tr>`;
        }).join("");

        container.innerHTML = `
            <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
                <button class="btn btn-secondary btn-sm" onclick="logisticsModule.exportListToExcel()" style="display:flex;align-items:center;gap:6px;">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Exportar a Excel
                </button>
            </div>
            <div class="table-container">
                <table style="width:100%;border-collapse:collapse;font-size:0.84rem;">
                    <thead>
                        <tr style="background:rgba(0,0,0,0.04);border-bottom:2px solid var(--color-border);text-align:left;">
                            <th style="padding:7px 10px;white-space:nowrap;">Fecha Entrega</th>
                            <th style="padding:7px 10px;">Pedido</th>
                            <th style="padding:7px 10px;">Reparto</th>
                            <th style="padding:7px 10px;">Cliente</th>
                            <th style="padding:7px 10px;">Destino</th>
                            <th style="padding:7px 10px;text-align:center;width:70px;">Cajas</th>
                            <th style="padding:7px 10px;white-space:nowrap;">Estado</th>
                            <th style="padding:7px 10px;text-align:right;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

        this._lastFilteredPairs = sorted;
    }

    exportListToExcel() {
        const data = (this._lastFilteredPairs || []).map(({ order, entrega }) => ({
            "Fecha":       entrega.fechaEntrega ? new Date(entrega.fechaEntrega + "T00:00:00").toLocaleDateString("es-AR") : "Sin fecha",
            "Pedido":      order.displayId || order.id.substring(4),
            "Zona":        this.isCbaLoc(entrega.localidad) ? "Córdoba Capital" : "Otras Provincias",
            "Reparto":     entrega.chofer || order.assignedDriver || "Sin asignar",
            "Cliente":     order.clientName,
            "CUIT":        order.cuit || "S/D",
            "Dirección":   entrega.direccion || "Sin dirección",
            "Localidad":   entrega.localidad || "Sin localidad",
            "Provincia":   entrega.provincia || "",
            "Cajas":       entrega.cantidadCajas,
            "Estado Entrega": entrega.status,
            "Estado Pedido":  store.deriveOrderStatus(order),
        }));

        if (data.length === 0) { app.showToast("No hay entregas para exportar", "error"); return; }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Entregas");
        XLSX.writeFile(wb, `Entregas_${new Date().toISOString().slice(0, 10)}.xlsx`);
        app.showToast("Exportación completada", "success");
    }

    // Alias legados
    renderListTab(container, orders) { this.renderListContent(container, this._buildPairs()); }
    filterByZone(orders) { return orders; } // reemplazado por _filterPairsByZone

    // Despacha una entrega individual
    despacharEntrega(orderId, entregaId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const entrega = (order.entregas || []).find(e => e.id === entregaId);
        if (!entrega) return;

        entrega.status = "Despachada";
        app.logAction(order.id, `Entrega ${entregaId} despachada → ${entrega.localidad || entrega.direccion}.`);
        store.saveData();
        app.showToast(`Entrega despachada (${entrega.cantidadCajas} cajas → ${entrega.localidad || entrega.direccion})`, "success");
        this.renderActiveTab();
    }

    // Alias legacy para código que aún llame despacharPedido con un solo arg
    despacharPedido(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const entrega = (order.entregas || [])[0];
        if (entrega) this.despacharEntrega(orderId, entrega.id);
        else {
            order.status = "Despachado";
            store.saveData();
            this.renderActiveTab();
        }
    }

    openUploadRemitoModal(orderId, entregaId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const entrega = entregaId
            ? (order.entregas || []).find(e => e.id === entregaId)
            : (order.entregas || [])[0];
        if (!entrega) return;

        const html = `
            <p style="font-size:0.9rem; color:var(--color-text-muted); margin-bottom:14px;">
                Destino: <strong>${entrega.direccion || 'S/D'}, ${entrega.localidad || 'S/D'}</strong> — ${entrega.cantidadCajas} cajas
            </p>
            <form onsubmit="logisticsModule.saveRemitoFirmado(event,'${orderId}','${entrega.id}')">
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="font-weight:600; display:block; margin-bottom:4px;">Foto del remito firmado *</label>
                    <input type="file" id="remito-file-input" class="form-control" accept="image/*" required>
                </div>
                <div class="form-group" style="margin-bottom:16px;">
                    <label style="font-weight:600; display:block; margin-bottom:4px;">Observaciones de entrega</label>
                    <textarea id="remito-obs-input" class="form-control" rows="2" placeholder="Ej: Recibió Ana García en portería"></textarea>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary" style="background:var(--color-green);">Confirmar Entrega</button>
                </div>
            </form>`;

        app.showModal(`Confirmar Entrega — ${order.displayId || order.id} (${order.clientName})`, html);
    }

    saveRemitoFirmado(e, orderId, entregaId) {
        e.preventDefault();
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const entrega = (order.entregas || []).find(en => en.id === entregaId);
        if (!entrega) return;

        const file = document.getElementById("remito-file-input").files[0];
        const obs  = document.getElementById("remito-obs-input").value.trim();

        if (!file) { app.showToast("Seleccioná una foto del remito", "error"); return; }
        if (file.size > 3 * 1024 * 1024) { app.showToast("Foto demasiado grande (máx 3 MB)", "error"); return; }

        const reader = new FileReader();
        reader.onload = (ev) => {
            entrega.remito = ev.target.result;
            entrega.fotoEntrega = ev.target.result;
            entrega.status = "Entregada";
            if (obs) entrega.obsEntrega = obs;

            // Sincronizar campo legacy si es entrega única
            if ((order.entregas || []).length === 1) {
                order.signedRemitoPhoto = ev.target.result;
                order.status = "Entregado";
            }

            const todasEntregadas = (order.entregas || []).every(en => en.status === "Entregada");
            if (todasEntregadas) order.status = "Entregado";

            app.logAction(order.id, `Entrega ${entregaId} confirmada con remito firmado.${obs ? " Obs: " + obs : ""}`);
            store.saveData();
            app.closeModal();
            app.showToast("Entrega confirmada. Remito guardado.", "success");
            this.renderActiveTab();
        };
        reader.readAsDataURL(file);
    }

    viewEntregaRemito(orderId, entregaId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const entrega = (order.entregas || []).find(e => e.id === entregaId);
        if (!entrega || !entrega.remito) { app.showToast("No hay remito guardado", "error"); return; }
        app.showModal(`Remito Firmado — ${order.clientName}`,
            `<img src="${entrega.remito}" style="max-width:100%; border-radius:6px;" />`);
    }

    // Alias legacy
    viewSignedRemito(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const entrega = (order.entregas || []).find(e => e.remito);
        if (entrega) this.viewEntregaRemito(orderId, entrega.id);
        else if (order.signedRemitoPhoto) {
            app.showModal(`Remito — ${order.clientName}`, `<img src="${order.signedRemitoPhoto}" style="max-width:100%;" />`);
        }
    }


    renderCalendarTab(container, pairs, zone) {
        const year = this.currentCalendarYear;
        const month = this.currentCalendarMonth;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let startDayOfWeek = new Date(year, month, 1).getDay();
        if (startDayOfWeek === 0) startDayOfWeek = 7;

        let daysHtml = "";
        for (let i = 1; i < startDayOfWeek; i++) {
            daysHtml += `<div class="calendar-day-card other-month"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayPairs = pairs.filter(p => p.entrega.fechaEntrega === dateStr);

            let badgesHtml = "";
            dayPairs.forEach(({ order, entrega }) => {
                const sem = salesModule.getSemaforoColor(order);
                let badgeClass = entrega.status === "Entregada" ? "green" : (sem === "rojo" ? "red" : "gold");
                const label = `${order.displayId || "#" + order.id.substring(4)} ${order.clientName.substring(0, 9)} (${entrega.cantidadCajas}c)`;
                badgesHtml += `
                    <div class="calendar-day-badge ${badgeClass}"
                         onclick="logisticsModule.despacharEntrega && logisticsModule.printHojaArmado('${order.id}')"
                         title="${order.clientName} — ${entrega.cantidadCajas} cajas → ${entrega.localidad || entrega.direccion} [${entrega.status}]"
                         style="${entrega.status === 'Entregada' ? 'opacity:0.65;' : ''}">
                        ${label}
                    </div>`;
            });

            daysHtml += `
                <div class="calendar-day-card ${dayPairs.length > 0 ? 'active-day' : ''}">
                    <div class="calendar-day-number">${day}</div>
                    <div style="display:flex; flex-direction:column; gap:3px; overflow:hidden;">
                        ${badgesHtml}
                    </div>
                </div>
            `;
        }

        const monthName = new Date(year, month).toLocaleDateString("es-AR", { month: 'long', year: 'numeric' });

        // Entregas sin fecha programada
        const pendingPairs = pairs.filter(p => !p.entrega.fechaEntrega);
        let pendingHtml = "";
        if (pendingPairs.length > 0) {
            pendingHtml = `
                <div style="margin-top:20px; border:2px solid var(--color-red); border-radius:var(--radius-md); padding:15px; background:rgba(220,53,69,0.03);">
                    <h4 style="color:var(--color-red); margin-top:0; margin-bottom:10px;">
                        ⚠️ Entregas sin fecha programada (${zone === 'cordoba' ? 'Córdoba Capital' : 'Otras Localidades / Provincias'})
                    </h4>
                    <div style="display:flex; flex-direction:column; gap:8px;">
            `;
            pendingPairs.forEach(({ order, entrega }) => {
                pendingHtml += `
                    <div style="background:var(--bg-card); border:1px solid var(--color-border); padding:8px 12px; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
                        <div>
                            <strong>${order.displayId || "#" + order.id.substring(4)} - ${esc(order.clientName)}</strong>
                            <br><span style="font-size:0.75rem; color:var(--color-text-muted);">Destino: ${esc(entrega.localidad || entrega.direccion || 'Sin definir')}</span>
                        </div>
                        <div style="text-align:right;">
                            <strong>${entrega.cantidadCajas} cajas</strong>
                            <br><span class="badge" style="background:var(--color-red); color:white; font-size:0.65rem; padding:1px 4px; margin-top:3px;">⚠️ SIN FECHA</span>
                        </div>
                    </div>
                `;
            });
            pendingHtml += `</div></div>`;
        }

        container.innerHTML = `
            <div class="card">
                <div class="calendar-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" onclick="logisticsModule.prevMonth()">&larr; Anterior</button>
                        <button class="btn btn-secondary btn-sm" onclick="logisticsModule.nextMonth()">Siguiente &rarr;</button>
                    </div>
                    <h3 style="margin: 0; text-transform: uppercase;">📅 ${monthName} (${zone === 'cordoba' ? 'Córdoba' : 'Provincias'})</h3>
                    <div style="font-size:0.85rem; color:var(--color-text-muted);">
                        <span class="semaforo" style="margin-right:10px;"><span class="semaforo-dot verde"></span> Todo Listo</span>
                        <span class="semaforo" style="margin-right:10px;"><span class="semaforo-dot amarillo"></span> Parcial</span>
                        <span class="semaforo" style="margin-right:10px;"><span class="semaforo-dot rojo"></span> FALTANTE / BLOQUEADO</span>
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
            ${pendingHtml}
        `;
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


    // --- ENTREGAS CON DATOS LOGÍSTICOS PENDIENTES ---
    renderPendingInfoTab(container, allPairs) {
        // Entregas que faltan Dirección, Localidad o Fecha — excluyendo las ya entregadas
        const pending = allPairs.filter(p =>
            p.entrega.status !== "Entregada" &&
            (!p.entrega.fechaEntrega || !p.entrega.direccion || !p.entrega.localidad)
        );

        if (pending.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align:center; padding:40px; color:var(--color-green);">
                    <h3>✓ Todo en orden</h3>
                    <p style="color:var(--color-text-muted); margin-top:10px;">Todas las entregas tienen sus datos logísticos completos.</p>
                </div>
            `;
            return;
        }

        let rowsHtml = "";
        pending.forEach(({ order, entrega }) => {
            const uid = `${order.id}__${entrega.id}`;
            rowsHtml += `
                <tr>
                    <td style="font-size:0.82rem;"><strong>${order.displayId || "#" + order.id.substring(4)}</strong><br><span style="color:var(--color-text-muted);">${esc(order.clientName)}</span></td>
                    <td style="text-align:center;font-weight:bold;">${entrega.cantidadCajas}</td>
                    <td>
                        <input type="date" id="pi-date-${uid}" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${entrega.fechaEntrega || ''}">
                    </td>
                    <td>
                        <input type="text" id="pi-loc-${uid}" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${entrega.localidad || ''}" placeholder="Ej: Córdoba Capital">
                    </td>
                    <td>
                        <input type="text" id="pi-addr-${uid}" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${entrega.direccion || ''}" placeholder="Ej: Belgrano 250">
                    </td>
                    <td>
                        <input type="text" id="pi-chofer-${uid}" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${entrega.chofer || ''}" placeholder="Chofer / Transporte">
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="logisticsModule.savePendingEntregaInfo('${order.id}','${entrega.id}')">Guardar</button>
                    </td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div class="card">
                <div class="card-title">Entregas con Información Pendiente</div>
                <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:15px;">Completá los datos de cada entrega para que aparezcan en producción y calendario.</p>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Pedido / Cliente</th>
                                <th style="text-align:center;">Cajas</th>
                                <th>Fecha Entrega</th>
                                <th>Localidad</th>
                                <th>Dirección</th>
                                <th>Chofer / Transporte</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    savePendingEntregaInfo(orderId, entregaId) {
        const uid = `${orderId}__${entregaId}`;
        const date   = document.getElementById(`pi-date-${uid}`)?.value || "";
        const loc    = document.getElementById(`pi-loc-${uid}`)?.value.trim() || "";
        const addr   = document.getElementById(`pi-addr-${uid}`)?.value.trim() || "";
        const chofer = document.getElementById(`pi-chofer-${uid}`)?.value.trim() || "";

        if (!date || !loc || !addr) {
            app.showToast("Completá fecha, localidad y dirección para guardar", "error");
            return;
        }

        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const entrega = (order.entregas || []).find(e => e.id === entregaId);
        if (!entrega) return;

        entrega.fechaEntrega = date;
        entrega.localidad = loc;
        entrega.direccion = addr;
        if (chofer) entrega.chofer = chofer;

        // Sincronizar legacy si es la única entrega
        if ((order.entregas || []).length === 1) {
            order.deliveryDate = date;
            order.deliveryLocation = loc;
            order.deliveryAddress = addr;
            if (chofer) order.assignedDriver = chofer;
        }

        app.logAction(order.id, `Entrega ${entregaId}: datos logísticos completados → ${addr}, ${loc} | Fecha: ${date}.`);
        store.saveData();
        app.showToast("Datos guardados correctamente.", "success");
        this.renderActiveTab();
    }

    // Alias legacy
    savePendingInfo(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const entrega = (order.entregas || [])[0];
        if (entrega) this.savePendingEntregaInfo(orderId, entrega.id);
    }


    // --- HOJA DE ARMADO HORIZONTAL (APtext) ---
    printHojaArmado(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        // Desglosar insumos del combo para armar el cuadro
        const recipeItems = [];
        let index = 1;
        
        // Sumamos cantidades para consolidar si hay duplicados
        const consolidado = {};
        order.boxRecipe.forEach(item => {
            if (!consolidado[item.id]) {
                consolidado[item.id] = { name: item.name, qty: 0, brand: item.brand || "" };
            }
            consolidado[item.id].qty += item.qty;
        });

        // Contar el total de ítems colocados en la caja unitaria
        let totalItemsInSingleBox = 0;
        
        Object.values(consolidado).forEach(item => {
            totalItemsInSingleBox += item.qty;
            recipeItems.push(`
                <tr>
                    <td style="text-align: center; font-weight: bold; font-size: 1.1rem; width: 80px;">${item.qty}</td>
                    <td style="font-size: 1.05rem;">${item.name}</td>
                    <td style="text-align: center; font-size: 1rem; width: 180px;">${item.brand.toUpperCase()}</td>
                </tr>
            `);
        });

        const printZone = document.getElementById("remito-print-zone");

        // Armado parcial: mostrar solo cajas pendientes
        const cajasArmadas = (order.armado || {}).cajasArmadas || 0;
        const cajasPendientes = Math.max(0, order.numberOfBoxes - cajasArmadas);
        const esArmadoParcial = cajasArmadas > 0 && cajasArmadas < order.numberOfBoxes;

        // Construir sección de destinos (una línea por entrega o fallback al pedido)
        const entregas = order.entregas || [];
        let destinosHtml;
        if (entregas.length > 1) {
            // Múltiples destinos: listar cada entrega con sus datos
            destinosHtml = entregas.map((ent, i) => {
                const fEnt = ent.fechaEntrega ? new Date(ent.fechaEntrega).toLocaleDateString("es-AR", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "S/D";
                return `<div style="margin-bottom:4px;"><strong>Destino ${i + 1} (${ent.cantidadCajas} cajas):</strong> ${ent.direccion || "Sin Dirección"}, ${ent.localidad || ""} (${ent.provincia || ""}) — Fecha: ${fEnt.toUpperCase()}</div>`;
            }).join("");
        } else {
            const primeraEntrega = entregas[0];
            const dir = primeraEntrega?.direccion || order.deliveryAddress || "Sin Dirección";
            const loc = primeraEntrega?.localidad || order.deliveryLocation || "Sin Localidad";
            const fecha = primeraEntrega?.fechaEntrega || order.deliveryDate;
            const fFmt = fecha ? new Date(fecha).toLocaleDateString("es-AR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "S/D";
            destinosHtml = `<div><strong>LUGAR DE ENTREGA:</strong> ${dir} (${loc})<br><span style="font-size:1.1rem; display:block; margin-top:6px;"><strong>FECHA:</strong> ${fFmt.toUpperCase()}</span></div>`;
        }

        // En armado parcial los consumos por caja se calculan sobre las pendientes
        const cajasParaCalculo = esArmadoParcial ? cajasPendientes : order.numberOfBoxes;

        const cajasHeader = esArmadoParcial
            ? `<span class="cant-label" style="color:#e67e22; font-size:0.7rem; font-weight:800; text-transform:uppercase;">ARMADO PARCIAL</span>
               <span class="cant-num" style="color:#e67e22;">${cajasPendientes}</span>
               <span class="cant-label" style="margin-top:4px; font-size:0.7rem;">restan de ${order.numberOfBoxes} totales</span>`
            : `<span class="cant-label">CANT. CAJAS</span>
               <span class="cant-num">${order.numberOfBoxes}</span>`;

        const templateHtml = `
            <div class="hoja-armado-container">
                <div class="ha-grid-header">
                    <div>
                        <div class="ha-title">${esc(order.clientName)}</div>
                        ${esArmadoParcial ? `<div style="background:#fff3cd; border:2px solid #e67e22; border-radius:4px; padding:6px 12px; font-weight:800; font-size:0.95rem; margin-top:6px; margin-bottom:4px; color:#c0392b;">⚠️ ARMADO PARCIAL — Restan ${cajasPendientes} de ${order.numberOfBoxes} cajas</div>` : ""}
                        <div class="ha-info-row" style="margin-top: 15px; font-size:${entregas.length > 1 ? '0.88rem' : '1rem'};">
                            ${destinosHtml}
                        </div>
                    </div>
                    <div class="ha-box-cant">
                        ${cajasHeader}
                    </div>
                </div>

                <table class="ha-table">
                    <thead>
                        <tr>
                            <th style="width: 10%; text-align: center;">CANT</th>
                            <th style="width: 65%;">PRODUCTOS</th>
                            <th style="width: 25%; text-align: center;">CATEGORIA / MARCA</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recipeItems.join('')}
                        <tr style="background-color:#f0f0f0;">
                            <td style="text-align: center; font-weight: bold; font-size: 1.15rem;">${totalItemsInSingleBox}</td>
                            <td colspan="2" style="font-weight: bold; font-size: 1.1rem;">PRODUCTOS TOTAL (EN 1 CAJA)</td>
                        </tr>
                        <tr style="background-color:#1a1a2e; color:white;">
                            <td style="text-align: center; font-weight: bold; font-size: 1.3rem;">${totalItemsInSingleBox * cajasParaCalculo}</td>
                            <td colspan="2" style="font-weight: bold; font-size: 1.1rem;">
                                TOTAL ÍTEMS A PREPARAR${esArmadoParcial ? ` (${cajasParaCalculo} cajas pendientes)` : ` (${cajasParaCalculo} cajas)`}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 20px;">
                    <div style="border: 2px solid black; padding: 10px; min-height: 120px; font-size:0.95rem;">
                        <strong>OBSERVACIONES:</strong><br>
                        <div style="margin-top: 8px; font-family: monospace; white-space: pre-wrap;">${order.history[0] ? 'Presupuesto original: Sin IVA. CUIT: ' + (order.cuit || 'S/D') : ''}</div>
                    </div>
                    <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: center; border: 2px dashed #777; padding: 10px; text-align: center;">
                        <div style="border-top: 1px solid black; width: 80%; margin-top: 60px; font-weight: bold; font-size: 0.9rem;">
                            ENCARGADO DE ARMADO
                        </div>
                    </div>
                </div>
            </div>
        `;

        printZone.innerHTML = templateHtml;

        // Modal de previsualización
        const previewHtml = `
            <div style="background: #f0f0f0; border: 1px solid var(--color-border); padding: 20px; border-radius: var(--radius-md); max-height: 480px; overflow-y: auto;">
                ${templateHtml}
            </div>
            <div style="display:flex; justify-content: flex-end; gap:10px; margin-top:20px;">
                <button class="btn btn-secondary" onclick="logisticsModule.closeArmadoPrint()">Cerrar Previsualización</button>
                <button class="btn btn-primary" onclick="logisticsModule.triggerArmadoPrint()">🖨️ Imprimir Hoja de Armado (Apaisada)</button>
            </div>
        `;
        app.showModal(`Previsualizar Hoja de Armado - Pedido #${order.id.substring(4)}`, previewHtml);
    }

    closeArmadoPrint() {
        // Remover estilos de impresión horizontal y cerrar modal
        document.getElementById("armado-landscape-style")?.remove();
        app.closeModal();
    }

    triggerArmadoPrint() {
        // Inyectar regla CSS para forzar impresión horizontal (landscape)
        let style = document.getElementById("armado-landscape-style");
        if (!style) {
            style = document.createElement("style");
            style.id = "armado-landscape-style";
            style.innerHTML = `@media print { @page { size: landscape; margin: 0.5cm; } }`;
            document.head.appendChild(style);
        }
        window.print();
    }


    // --- REMITOS DUPLICADOS ---
    printRemito(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        let itemsHtml = "";
        let index = 1;
        
        // Sumar receta unitaria de cajas * cantidad de cajas
        order.boxRecipe.forEach(item => {
            const qtyTotal = item.qty * order.numberOfBoxes;
            itemsHtml += `
                <tr>
                    <td>${index++}</td>
                    <td><strong>${item.name}</strong> [${item.brand}]</td>
                    <td>${qtyTotal} u.</td>
                </tr>
            `;
        });

        const dateStr = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("es-AR") : "S/D";
        const printZone = document.getElementById("remito-print-zone");
        
        const remitoTemplateHtml = `
            <div class="remito-container">
                <!-- COPIA CLIENTE -->
                <div class="remito-copia">
                    <div class="remito-tag">COPIA CLIENTE</div>
                    <div class="remito-header">
                        <div class="remito-title">
                            <h2>NAVIDAD Y EMPRESAS</h2>
                            <p>Propuestas Navideñas Premium | Precios Netos Sin IVA</p>
                        </div>
                        <div class="remito-info">
                            <strong>REMITO Nº: ${order.id.substring(4)}</strong><br>
                            Fecha: ${dateStr}<br>
                            Conductor: ${order.assignedDriver || "Flete Interno"}
                        </div>
                    </div>
                    <div class="remito-client-data">
                        <strong>CLIENTE:</strong> ${esc(order.clientName)} (CUIT: ${esc(order.cuit || 'S/D')})<br>
                        <strong>DIRECCIÓN ENTREGA:</strong> ${esc(order.deliveryAddress || 'A convenir')} (${esc(order.deliveryLocation || 'S/D')})<br>
                        <strong>VOLUMEN:</strong> ${order.numberOfBoxes} Cajas Navideñas
                    </div>
                    <table class="remito-table">
                        <thead>
                            <tr>
                                <th style="width: 8%">Item</th>
                                <th style="width: 80%">Detalle Insumos Consolidados Recibidos (Sin IVA)</th>
                                <th style="width: 12%">Cant.</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div class="remito-signatures">
                        <div class="signature-line">Firma y Aclaración Chofer</div>
                        <div class="signature-line">Firma y Aclaración Receptor</div>
                    </div>
                </div>

                <div style="border-top: 2px dashed black; margin: 20px 0;"></div>

                <!-- COPIA EMPRESA -->
                <div class="remito-copia">
                    <div class="remito-tag">COPIA CONTROL EMPRESA</div>
                    <div class="remito-header">
                        <div class="remito-title">
                            <h2>NAVIDAD Y EMPRESAS</h2>
                            <p>Propuestas Navideñas Premium | Precios Netos Sin IVA</p>
                        </div>
                        <div class="remito-info">
                            <strong>REMITO Nº: ${order.id.substring(4)}</strong><br>
                            Fecha: ${dateStr}<br>
                            Conductor: ${order.assignedDriver || "Flete Interno"}
                        </div>
                    </div>
                    <div class="remito-client-data">
                        <strong>CLIENTE:</strong> ${esc(order.clientName)} (CUIT: ${esc(order.cuit || 'S/D')})<br>
                        <strong>DIRECCIÓN ENTREGA:</strong> ${esc(order.deliveryAddress || 'A convenir')} (${esc(order.deliveryLocation || 'S/D')})<br>
                        <strong>VOLUMEN:</strong> ${order.numberOfBoxes} Cajas Navideñas
                    </div>
                    <table class="remito-table">
                        <thead>
                            <tr>
                                <th style="width: 8%">Item</th>
                                <th style="width: 80%">Detalle Insumos Consolidados Recibidos (Sin IVA)</th>
                                <th style="width: 12%">Cant.</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div class="remito-signatures">
                        <div class="signature-line">Firma y Aclaración Chofer</div>
                        <div class="signature-line">Firma y Aclaración Receptor</div>
                    </div>
                </div>
            </div>
        `;

        printZone.innerHTML = remitoTemplateHtml;

        const modalPreviewHtml = `
            <div style="background: #f0f0f0; border: 1px solid var(--color-border); padding: 20px; border-radius: var(--radius-md); max-height: 500px; overflow-y: auto;">
                ${remitoTemplateHtml}
            </div>
            <div style="display:flex; justify-content: flex-end; gap:10px; margin-top:20px;">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cerrar Previsualización</button>
                <button class="btn btn-primary" onclick="window.print()">🖨️ Mandar a Imprimir Remito</button>
            </div>
        `;
        app.showModal(`Remito Doble Copia - Pedido #${order.id.substring(4)}`, modalPreviewHtml);
    }


    // --- HOJA DE RUTA GRUPAL ---
    openGroupDeliveriesModal() {
        const pendingGroup = store.orders.filter(o => 
            o.status !== "Presupuesto Enviado" && o.status !== "Cancelado" && !o.assignedDriver
        );

        let listHtml = "";
        pendingGroup.forEach(order => {
            const isCba = order.deliveryLocation && (order.deliveryLocation.toLowerCase().includes("córdoba") || order.deliveryLocation.toLowerCase().includes("cordoba"));
            const zoneText = isCba ? "Córdoba Capital" : "Interior/Provincia";

            listHtml += `
                <div style="display:flex; align-items:center; gap:10px; background:var(--bg-sidebar); border: 1px solid var(--color-border); padding:10px; border-radius:var(--radius-sm); margin-bottom:8px;">
                    <input type="checkbox" class="delivery-group-chk-log" value="${order.id}" style="width:20px; height:20px; accent-color:var(--color-gold);">
                    <div style="flex-grow:1; font-size:0.85rem;">
                        <strong>${esc(order.clientName)}</strong> (${esc(order.deliveryLocation || 'Sin localidad')})<br>
                        Dirección: ${esc(order.deliveryAddress || 'Sin dirección')} | Entrega: ${order.deliveryDate || 'Sin fecha'} | <strong>${order.numberOfBoxes} cajas</strong>
                    </div>
                    <span class="badge lead" style="font-size:0.7rem;">${zoneText}</span>
                </div>
            `;
        });

        const html = `
            <form onsubmit="logisticsModule.saveGroupedDeliveries(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Transportista / Chofer Asignado *</label>
                        <input type="text" id="route-driver-log" class="form-control" placeholder="Ej: Camión Flete Oscar o Expreso CATA" required>
                    </div>
                    <div class="form-group">
                        <label>Nombre de la Hoja de Ruta / Zona *</label>
                        <input type="text" id="route-name-log" class="form-control" placeholder="Ej: Reparto Zona Norte" required>
                    </div>
                </div>

                <h4 style="margin-top: 15px; margin-bottom: 10px;">Selecciona los pedidos a agrupar:</h4>
                <div style="max-height: 250px; overflow-y:auto; margin-bottom: 20px;">
                    ${listHtml || '<p style="color:var(--color-text-muted); text-align:center;">No hay pedidos de venta pendientes de asignación logística.</p>'}
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary" ${pendingGroup.length === 0 ? 'disabled' : ''}>Crear Ruta y Asignar</button>
                </div>
            </form>
        `;

        app.showModal("Agrupar Envíos y Crear Hoja de Ruta", html);
    }

    saveGroupedDeliveries(e) {
        e.preventDefault();
        const driver = document.getElementById("route-driver-log").value;
        const routeName = document.getElementById("route-name-log").value;
        
        const chks = document.querySelectorAll(".delivery-group-chk-log:checked");
        const orderIds = Array.from(chks).map(c => c.value);

        if (orderIds.length === 0) {
            app.showToast("Debe seleccionar al menos un pedido para agrupar", "error");
            return;
        }

        orderIds.forEach(id => {
            const order = store.orders.find(o => o.id === id);
            if (order) {
                order.assignedDriver = `${driver} [${routeName}]`;
                app.logAction(order.id, `Asignado a chofer: ${driver} (${routeName}).`);
            }
        });

        store.saveData();
        app.closeModal();
        app.showToast(`Hoja de ruta creada. ${orderIds.length} pedidos asignados.`, "success");
        this.renderActiveTab();
    }

    // --- CARGAR REMITO FIRMADO ---
    openUploadRemitoModal(orderId) {
        const html = `
            <form onsubmit="logisticsModule.saveSignedRemito(event, '${orderId}')">
                <p style="margin-bottom:15px;">Seleccione la foto del remito firmado por el cliente para dar por cerrada la entrega.</p>
                <div class="form-group">
                    <label>Archivo de Remito Firmado (Foto)</label>
                    <input type="file" id="signed-remito-file-log" class="form-control" accept="image/*" required>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Registrar Entrega</button>
                </div>
            </form>
        `;
        app.showModal("Subir Remito Firmado - Cierre de Entrega", html);
    }

    saveSignedRemito(e, orderId) {
        e.preventDefault();
        const fileInput = document.getElementById("signed-remito-file-log");
        const file = fileInput.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const order = store.orders.find(o => o.id === orderId);
                if (order) {
                    order.signedRemitoPhoto = event.target.result;
                    order.status = "Entregado";
                    
                    app.logAction(order.id, "Remito firmado subido. El pedido fue marcado como Entregado.");
                    store.saveData();
                    app.closeModal();
                    
                    if (order.paymentStatus !== "Pagado") {
                        app.showToast(`¡Pedido #${orderId.substring(4)} entregado! Atención: Mantiene un saldo pendiente sin cobrar.`, "error");
                    } else {
                        app.showToast(`¡Pedido #${orderId.substring(4)} entregado y cerrado con éxito!`, "success");
                    }
                    this.renderActiveTab();
                }
            };
            reader.readAsDataURL(file);
        }
    }

    viewSignedRemito(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (order && order.signedRemitoPhoto) {
            const html = `
                <div style="text-align:center;">
                    <img src="${order.signedRemitoPhoto}" style="max-width:100%; max-height:450px; border:1px solid #ccc; border-radius:var(--radius-sm);">
                </div>
                <div style="display:flex; justify-content:flex-end; margin-top:20px;">
                    <button class="btn btn-secondary" onclick="app.closeModal()">Cerrar</button>
                </div>
            `;
            app.showModal(`Remito Firmado Digitalizado - Pedido #${order.id.substring(4)}`, html);
        }
    }
}

// Ámbito global
window.logisticsModule = new LogisticsModule();
