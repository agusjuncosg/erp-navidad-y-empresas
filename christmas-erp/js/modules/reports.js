// Módulo de Reportes y Exportaciones XLSX (NAVIDAD Y EMPRESAS)
// Requiere SheetJS (XLSX) cargado en index.html
// Todos los montos son PRECIOS NETOS SIN IVA

window.ERP_Reports = {

    // ─── Utilidades ──────────────────────────────────────────────────────────
    _styleHeaders(ws, numCols) {
        for (let col = 0; col < numCols; col++) {
            const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
            if (cell) cell.s = { font: { bold: true } };
        }
    },

    _download(wb, filename) {
        const today = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `${filename}_${today}.xlsx`);
        if (window.app) app.showToast(`Reporte exportado: ${filename}.xlsx`, "success");
    },

    _fmt(n) { return Math.round(n || 0); },

    // Suma cobrado desde entidadesFacturacion (con fallback a order.payments)
    _cobradoOrder(o) {
        const efs = o.entidadesFacturacion;
        if (efs && efs.length > 0) {
            return efs.reduce((s, ef) => s + (ef.pagos || []).reduce((a, p) => a + (p.amount || 0), 0), 0);
        }
        return (o.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
    },

    // ─── REPORTE 1: RENTABILIDAD POR OPERACIÓN ───────────────────────────────
    // Atribución al clientName del pedido (no a la entidad de facturación)
    exportRentabilidad() {
        const headers = [
            "ID Pedido", "Cliente", "Vendedor", "Fecha Alta", "Cajas",
            "Total Venta Neto ($)", "Costo Estimado ($)", "Margen Bruto ($)", "Margen (%)",
            "Cobrado ($)", "Saldo Pendiente ($)",
            "Estado Operativo", "Costo Logística ($)",
            "# Destinos de Entrega", "# Entidades Facturación"
        ];

        const rows = store.orders
            .filter(o => o.status !== "Cancelado" && o.status !== "Presupuesto Enviado")
            .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
            .map(o => {
                const collected = this._cobradoOrder(o);
                const margin    = (o.total || 0) - (o.costEst || 0);
                const marginPct = o.total > 0 ? Math.round((margin / o.total) * 100) : 0;
                const derived   = store.deriveOrderStatus(o);
                return [
                    o.displayId || o.id.substring(4),
                    o.clientName,
                    o.salesperson || "",
                    o.date || "",
                    o.numberOfBoxes || 0,
                    this._fmt(o.total),
                    this._fmt(o.costEst),
                    this._fmt(margin),
                    marginPct,
                    this._fmt(collected),
                    this._fmt((o.total || 0) - collected),
                    derived,
                    this._fmt(o.shippingRealCost),
                    (o.entregas || []).length,
                    (o.entidadesFacturacion || []).length
                ];
            });

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws["!cols"] = [
            {wch:14},{wch:32},{wch:18},{wch:12},{wch:10},
            {wch:20},{wch:20},{wch:18},{wch:12},
            {wch:16},{wch:18},{wch:24},{wch:18},{wch:14},{wch:18}
        ];
        this._styleHeaders(ws, headers.length);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rentabilidad por Operación");
        this._download(wb, "Rentabilidad_por_Operacion");
    },

    // ─── REPORTE 2: ACUMULADO POR CLIENTE ────────────────────────────────────
    // Atribución al clientName (no a entidad de facturación). Cobrado = suma de pagos reales.
    exportAcumuladoCliente() {
        const byClient = {};

        store.orders.filter(o => o.status !== "Cancelado").forEach(o => {
            const key = o.clientName;
            if (!byClient[key]) {
                byClient[key] = {
                    cuit: o.cuit || "",
                    pedidos: 0, cajas: 0,
                    totalVendido: 0, cobrado: 0,
                    entregasTotal: 0, entregasCompletadas: 0,
                    ultimaFecha: "", ultimoEstado: "", ultimoId: ""
                };
            }
            const c = byClient[key];
            c.pedidos++;
            c.cajas      += o.numberOfBoxes || 0;
            c.totalVendido += o.total || 0;
            c.cobrado    += this._cobradoOrder(o);
            c.entregasTotal += (o.entregas || []).length;
            c.entregasCompletadas += (o.entregas || []).filter(e => e.status === "Entregada").length;
            if (!c.ultimaFecha || (o.date || "") > c.ultimaFecha) {
                c.ultimaFecha  = o.date || "";
                c.ultimoEstado = store.deriveOrderStatus(o);
                c.ultimoId     = o.displayId || o.id.substring(4);
            }
            if (!c.cuit && o.cuit) c.cuit = o.cuit;
        });

        const headers = [
            "Cliente", "CUIT",
            "# Pedidos", "# Cajas Totales",
            "Total Vendido ($)", "Total Cobrado ($)", "Saldo Pendiente ($)",
            "# Entregas Totales", "# Entregas Completadas",
            "Último Pedido (ID)", "Fecha Último Pedido", "Estado Operativo"
        ];

        const rows = Object.entries(byClient)
            .sort((a, b) => b[1].totalVendido - a[1].totalVendido)
            .map(([name, c]) => [
                name, c.cuit,
                c.pedidos, c.cajas,
                this._fmt(c.totalVendido),
                this._fmt(c.cobrado),
                this._fmt(c.totalVendido - c.cobrado),
                c.entregasTotal, c.entregasCompletadas,
                c.ultimoId, c.ultimaFecha, c.ultimoEstado
            ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws["!cols"] = [
            {wch:32},{wch:18},
            {wch:12},{wch:16},
            {wch:20},{wch:20},{wch:20},
            {wch:18},{wch:22},
            {wch:16},{wch:14},{wch:24}
        ];
        this._styleHeaders(ws, headers.length);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Acumulado por Cliente");
        this._download(wb, "Acumulado_por_Cliente");
    },

    // ─── REPORTE 3: COLA DE ARMADO ASISTIDA ──────────────────────────────────
    // Una fila por entrega. Progreso real de armado desde order.armado.cajasArmadas
    exportColaArmado() {
        const ACTIVE_DERIVED = ["Confirmado", "Armado Parcial", "En Producción", "Listo para Despacho", "Entrega Parcial"];
        const headers = [
            "ID Pedido", "Cliente", "CUIT",
            "Cajas Totales", "Cajas Armadas", "% Armado",
            "Estado Operativo",
            "# Entrega", "Cajas Entrega", "Estado Entrega",
            "Zona", "Localidad / Provincia", "Dirección de Entrega",
            "Fecha Comprometida", "Transportista / Chofer",
            "Info Completa"
        ];

        const rows = [];
        store.orders
            .filter(o => {
                const derived = store.deriveOrderStatus(o);
                return ACTIVE_DERIVED.includes(derived);
            })
            .sort((a, b) => {
                const pa = { "Armado Parcial": 0, "En Producción": 1, "Confirmado": 2, "Listo para Despacho": 3, "Entrega Parcial": 4 };
                const dA = store.deriveOrderStatus(a), dB = store.deriveOrderStatus(b);
                const diff = (pa[dA] ?? 9) - (pa[dB] ?? 9);
                if (diff !== 0) return diff;
                return (a.deliveryDate || "9999").localeCompare(b.deliveryDate || "9999");
            })
            .forEach(o => {
                const derived = store.deriveOrderStatus(o);
                const cajasArmadas = (o.armado || {}).cajasArmadas || 0;
                const total = o.numberOfBoxes || 0;
                const pct = total > 0 ? Math.round(cajasArmadas / total * 100) : 0;
                const entregas = o.entregas && o.entregas.length > 0
                    ? o.entregas
                    : [{ id: "leg", cantidadCajas: total, localidad: o.deliveryLocation || "", direccion: o.deliveryAddress || "", fechaEntrega: o.deliveryDate || "", chofer: o.assignedDriver || "", status: "Pendiente" }];

                entregas.forEach((e, idx) => {
                    const isCba = e.localidad && (e.localidad.toLowerCase().includes("córdoba") || e.localidad.toLowerCase().includes("cordoba"));
                    const infoOk = (e.fechaEntrega && e.direccion && e.localidad)
                        ? "Sí"
                        : "NO — Falta: " + [!e.fechaEntrega && "fecha", !e.direccion && "dirección", !e.localidad && "localidad"].filter(Boolean).join(", ");
                    rows.push([
                        o.displayId || o.id.substring(4),
                        o.clientName, o.cuit || "",
                        total, cajasArmadas, `${pct}%`,
                        derived,
                        idx + 1, e.cantidadCajas, e.status,
                        isCba ? "Córdoba Capital" : "Interior / Provincias",
                        e.localidad || "", e.direccion || "",
                        e.fechaEntrega || "",
                        e.chofer || o.assignedDriver || "Sin asignar",
                        infoOk
                    ]);
                });
            });

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws["!cols"] = [
            {wch:14},{wch:32},{wch:18},
            {wch:14},{wch:14},{wch:10},
            {wch:24},
            {wch:10},{wch:14},{wch:18},
            {wch:20},{wch:24},{wch:34},
            {wch:14},{wch:26},{wch:28}
        ];
        this._styleHeaders(ws, headers.length);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Cola de Armado");
        this._download(wb, "Cola_de_Armado");
    },

    // ─── REPORTE 4: RENDIMIENTO COMERCIAL ────────────────────────────────────
    // Tasa de conversión, margen y cajas vendidas agrupadas por vendedor
    exportRendimientoComercial() {
        const bySalesperson = {};

        store.orders.filter(o => o.status !== "Cancelado").forEach(o => {
            const sp = o.salesperson || "Sin Asignar";
            if (!bySalesperson[sp]) {
                bySalesperson[sp] = { cotizaciones: 0, ventas: 0, totalCotizado: 0, totalVendido: 0, totalCosto: 0, cajas: 0 };
            }
            const s = bySalesperson[sp];
            s.cotizaciones++;
            s.totalCotizado += o.total || 0;
            const derived = store.deriveOrderStatus(o);
            if (derived !== "Presupuesto Enviado") {
                s.ventas++;
                s.totalVendido += o.total || 0;
                s.totalCosto   += o.costEst || 0;
                s.cajas        += o.numberOfBoxes || 0;
            }
        });

        const headers = [
            "Vendedor",
            "# Cotizaciones Emitidas", "# Ventas Confirmadas", "Tasa de Conversión (%)",
            "Total Cotizado ($)", "Total Vendido ($)",
            "Costo Total Estimado ($)", "Margen Total ($)", "Margen Promedio (%)",
            "Cajas Vendidas Totales", "Promedio Cajas / Venta"
        ];

        const rows = Object.entries(bySalesperson)
            .sort((a, b) => b[1].totalVendido - a[1].totalVendido)
            .map(([sp, s]) => {
                const conversion = s.cotizaciones > 0
                    ? Math.round((s.ventas / s.cotizaciones) * 100) : 0;
                const margenTotal = s.totalVendido - s.totalCosto;
                const margenPct = s.totalVendido > 0
                    ? Math.round((margenTotal / s.totalVendido) * 100) : 0;
                const avgCajas = s.ventas > 0 ? Math.round(s.cajas / s.ventas) : 0;
                return [
                    sp,
                    s.cotizaciones, s.ventas, conversion,
                    this._fmt(s.totalCotizado), this._fmt(s.totalVendido),
                    this._fmt(s.totalCosto), this._fmt(margenTotal), margenPct,
                    s.cajas, avgCajas
                ];
            });

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws["!cols"] = [
            {wch:22},{wch:22},{wch:22},{wch:18},
            {wch:20},{wch:20},
            {wch:24},{wch:20},{wch:18},
            {wch:20},{wch:22}
        ];
        this._styleHeaders(ws, headers.length);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rendimiento Comercial");
        this._download(wb, "Rendimiento_Comercial");
    },

    // ─── EXPORTAR LEADS con filtro ────────────────────────────────────────────
    // filtro: "todos" | "por-cotizar" | "cotizado" | "retargeting" | "confirmado"
    // vendedorFiltro: string (vacío = todos)
    exportLeads(filtro, vendedorFiltro) {
        const getCol = (lead) => window.salesModule ? salesModule.getLeadColumn(lead) : "por-cotizar";

        let leads = store.leads.filter(l => l.status !== "Descartado");

        // Filtro por columna kanban
        if (filtro && filtro !== "todos") {
            leads = leads.filter(l => getCol(l) === filtro);
        }

        // Filtro por vendedor: busca en el pedido vinculado
        if (vendedorFiltro && vendedorFiltro !== "") {
            leads = leads.filter(l => {
                const linked = store.orders.find(o => o.leadId === l.id && o.status !== "Cancelado");
                return linked && linked.salesperson === vendedorFiltro;
            });
        }

        const headers = [
            "Empresa / Cliente", "Contacto", "Teléfono", "Email",
            "Canal de Entrada", "Estado CRM", "Cajas Estimadas",
            "Fecha Alta", "Pedido Vinculado", "Estado Pedido",
            "Recordatorios Pendientes", "Última Nota / Interacción"
        ];

        const rows = leads.map(lead => {
            const linkedOrder = store.orders.find(o => o.leadId === lead.id && o.status !== "Cancelado");
            const pendingRem = (lead.reminders || []).filter(r => !r.done).length;
            const lastNote = Array.isArray(lead.notes) && lead.notes.length > 0
                ? lead.notes[lead.notes.length - 1].text.substring(0, 120)
                : "";
            return [
                lead.clientName,
                lead.contactName || "",
                lead.phone || "",
                lead.email || "",
                lead.source || "",
                getCol(lead),
                lead.estimatedBoxes || 0,
                lead.date ? lead.date.split("T")[0] : "",
                linkedOrder ? (linkedOrder.displayId || linkedOrder.id.substring(4)) : "",
                linkedOrder ? linkedOrder.status : "",
                pendingRem,
                lastNote
            ];
        });

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws["!cols"] = [
            {wch:32},{wch:22},{wch:18},{wch:28},
            {wch:28},{wch:18},{wch:16},{wch:14},
            {wch:16},{wch:22},{wch:22},{wch:55}
        ];
        this._styleHeaders(ws, headers.length);

        const wb = XLSX.utils.book_new();
        const labelMap = {
            "todos": "Todos", "por-cotizar": "Por Cotizar",
            "cotizado": "Cotizados", "retargeting": "Retargeting", "confirmado": "Confirmados"
        };
        const label = labelMap[filtro] || filtro || "Todos";
        XLSX.utils.book_append_sheet(wb, ws, ("Leads - " + label).substring(0, 31));
        this._download(wb, "Leads_" + label.replace(/ /g, "_"));
    },

    // ─── REPORTE 5: DETALLE DE ENTREGAS ──────────────────────────────────────
    // Una fila por entrega, con estado individual, chofer y remito
    exportEntregas() {
        const headers = [
            "ID Pedido", "Cliente", "CUIT",
            "# Entrega", "Cajas Entrega",
            "Zona", "Localidad", "Dirección",
            "Fecha Comprometida", "Chofer / Transporte",
            "Estado Entrega", "Estado Pedido (Derivado)",
            "Remito Firmado"
        ];

        const rows = [];
        store.orders
            .filter(o => o.status !== "Cancelado" && o.status !== "Presupuesto Enviado")
            .sort((a, b) => {
                const fe = (o) => ((o.entregas || [])[0] || {}).fechaEntrega || o.deliveryDate || "9999";
                return fe(a).localeCompare(fe(b));
            })
            .forEach(o => {
                const derived = store.deriveOrderStatus(o);
                const entregas = o.entregas && o.entregas.length > 0
                    ? o.entregas
                    : [{ cantidadCajas: o.numberOfBoxes, localidad: o.deliveryLocation || "", direccion: o.deliveryAddress || "", fechaEntrega: o.deliveryDate || "", chofer: o.assignedDriver || "", status: "Pendiente", remito: o.signedRemitoPhoto ? "Sí" : "" }];

                entregas.forEach((e, idx) => {
                    const isCba = e.localidad && (e.localidad.toLowerCase().includes("córdoba") || e.localidad.toLowerCase().includes("cordoba"));
                    rows.push([
                        o.displayId || o.id.substring(4),
                        o.clientName, o.cuit || "",
                        idx + 1, e.cantidadCajas,
                        isCba ? "Córdoba Capital" : "Interior / Provincias",
                        e.localidad || "", e.direccion || "",
                        e.fechaEntrega || "",
                        e.chofer || o.assignedDriver || "Sin asignar",
                        e.status,
                        derived,
                        e.remito ? "Sí" : "No"
                    ]);
                });
            });

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws["!cols"] = [
            {wch:14},{wch:32},{wch:18},
            {wch:10},{wch:14},
            {wch:20},{wch:24},{wch:34},
            {wch:14},{wch:26},
            {wch:18},{wch:24},{wch:14}
        ];
        this._styleHeaders(ws, headers.length);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Detalle de Entregas");
        this._download(wb, "Detalle_Entregas");
    },

    // ─── Modal central de Reportes ────────────────────────────────────────────
    openReportesModal() {
        const html = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:8px;">

                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:8px; padding:16px;">
                    <div style="font-weight:700; font-size:0.95rem; margin-bottom:5px; color:var(--color-blue);">📊 Rentabilidad por Operación</div>
                    <p style="font-size:0.8rem; color:var(--color-text-muted); margin:0 0 12px 0;">Margen, costo y saldo por cada pedido confirmado.</p>
                    <button class="btn btn-primary btn-sm" style="width:100%;" onclick="ERP_Reports.exportRentabilidad(); app.closeModal();">⬇ Descargar</button>
                </div>

                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:8px; padding:16px;">
                    <div style="font-weight:700; font-size:0.95rem; margin-bottom:5px; color:var(--color-blue);">🏢 Acumulado por Cliente</div>
                    <p style="font-size:0.8rem; color:var(--color-text-muted); margin:0 0 12px 0;">Totales por empresa: pedidos, cajas, vendido y cobrado.</p>
                    <button class="btn btn-primary btn-sm" style="width:100%;" onclick="ERP_Reports.exportAcumuladoCliente(); app.closeModal();">⬇ Descargar</button>
                </div>

                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:8px; padding:16px;">
                    <div style="font-weight:700; font-size:0.95rem; margin-bottom:5px; color:var(--color-gold);">🏭 Cola de Armado Activa</div>
                    <p style="font-size:0.8rem; color:var(--color-text-muted); margin:0 0 12px 0;">Pedidos en producción con destino y estado logístico.</p>
                    <button class="btn btn-gold btn-sm" style="width:100%;" onclick="ERP_Reports.exportColaArmado(); app.closeModal();">⬇ Descargar</button>
                </div>

                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:8px; padding:16px;">
                    <div style="font-weight:700; font-size:0.95rem; margin-bottom:5px; color:var(--color-green);">📈 Rendimiento Comercial</div>
                    <p style="font-size:0.8rem; color:var(--color-text-muted); margin:0 0 12px 0;">Conversión, margen y cajas por vendedor.</p>
                    <button class="btn btn-green btn-sm" style="width:100%;" onclick="ERP_Reports.exportRendimientoComercial(); app.closeModal();">⬇ Descargar</button>
                </div>

                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:8px; padding:16px; grid-column:1/-1;">
                    <div style="font-weight:700; font-size:0.95rem; margin-bottom:5px; color:#9b59b6;">🚛 Detalle de Entregas</div>
                    <p style="font-size:0.8rem; color:var(--color-text-muted); margin:0 0 12px 0;">Una fila por entrega individual: destino, chofer, estado y remito firmado.</p>
                    <button class="btn btn-sm" style="width:100%; background:#9b59b6; color:white;" onclick="ERP_Reports.exportEntregas(); app.closeModal();">⬇ Descargar</button>
                </div>

            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:4px;">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cerrar</button>
            </div>
        `;
        app.showModal("Exportar Reportes Excel", html, null);
    },

    // ─── Modal exportación de Leads ───────────────────────────────────────────
    openLeadsExportModal() {
        // Armar opciones de vendedores desde los pedidos vinculados a leads
        const vendedores = [...new Set(
            store.orders
                .filter(o => o.salesperson && o.leadId)
                .map(o => o.salesperson)
        )].sort();

        const vendedorOpts = `<option value="">Todos los vendedores</option>` +
            vendedores.map(v => `<option value="${v}">${v}</option>`).join("");

        const html = `
            <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:20px;">
                Seleccioná el filtro de leads a exportar. El archivo incluye contacto, canal, estado CRM, recordatorios y última nota de cada lead.
            </p>

            <div class="form-row" style="margin-bottom:20px;">
                <div class="form-group">
                    <label>Estado CRM</label>
                    <select id="leads-export-col" class="form-control">
                        <option value="todos">Todos los Leads</option>
                        <option value="por-cotizar">Por Cotizar</option>
                        <option value="cotizado">Cotizados</option>
                        <option value="retargeting">Retargeting (Vencidos)</option>
                        <option value="confirmado">Confirmados</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Vendedor Asignado (pedido vinculado)</label>
                    <select id="leads-export-vendedor" class="form-control">
                        ${vendedorOpts}
                    </select>
                </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="
                    const col = document.getElementById('leads-export-col').value;
                    const vend = document.getElementById('leads-export-vendedor').value;
                    ERP_Reports.exportLeads(col, vend);
                    app.closeModal();
                ">⬇ Exportar Excel</button>
            </div>
        `;
        app.showModal("Exportar Leads a Excel", html, null);
    }
};
