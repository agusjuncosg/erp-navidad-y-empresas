// Módulo Comercial: Ventas, Cotizaciones y Propuestas (NAVIDAD Y EMPRESAS)
// Todos los importes se manejan como PRECIOS NETOS SIN IVA

class SalesModule {
    constructor() {
        this.activeTab = "quotes";
        this.activeCategory = "";
        this.catalogSearchQuery = "";
        this.salespersonFilter = "";
        this.crmView = "kanban";       // "kanban" o "lista"
        this.crmSearch = "";           // búsqueda en vista lista
        this.crmStatusFilter = "todos"; // filtro estado en vista lista
        this.crmCanalFilter = "";      // filtro canal en vista lista
        
        this.builderItems = []; // Receta de UNA sola caja en el builder activo
    }

    changeSalespersonFilter(val) {
        this.salespersonFilter = val;
        this.renderActiveTab();
    }

    // ─── PUNTO DE ENTRADA MÓDULO CRM / LEADS (desde sidebar CRM) ─────────────
    renderCRM(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>CRM / Leads</h2>
                    <p><strong>NAVIDAD Y EMPRESAS</strong> — Gestión de prospectos y seguimiento comercial.</p>
                </div>
                <div class="page-actions" style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                    <!-- Toggle vista -->
                    <div style="display:inline-flex; border:1px solid var(--color-border); border-radius:6px; overflow:hidden;">
                        <button id="btn-crm-kanban" class="btn btn-sm ${this.crmView === 'kanban' ? 'btn-primary' : 'btn-secondary'}" onclick="salesModule.setCrmView('kanban')" style="border-radius:0; border:none; padding:6px 14px;">
                            ☰ Kanban
                        </button>
                        <button id="btn-crm-lista" class="btn btn-sm ${this.crmView === 'lista' ? 'btn-primary' : 'btn-secondary'}" onclick="salesModule.setCrmView('lista')" style="border-radius:0; border:none; padding:6px 14px; border-left:1px solid var(--color-border);">
                            ≡ Lista
                        </button>
                    </div>
                    <button class="btn btn-gold btn-sm" id="btn-new-lead-crm">+ Nuevo Lead</button>
                    <button class="btn btn-secondary btn-sm" onclick="ERP_Reports.openLeadsExportModal()">⬇ Exportar Leads</button>
                    <button class="btn btn-secondary btn-sm" onclick="app.navigate('pedidos')" style="">Ver Pedidos →</button>
                </div>
            </div>
            <div id="crm-content-area"></div>
        `;
        document.getElementById("btn-new-lead-crm").addEventListener("click", () => this.openLeadModal());
        this._renderCRMContent(document.getElementById("crm-content-area"));
    }

    setCrmView(view) {
        this.crmView = view;
        const area = document.getElementById("crm-content-area");
        if (area) {
            this._renderCRMContent(area);
            // Actualizar botones del toggle
            const kb = document.getElementById("btn-crm-kanban");
            const ls = document.getElementById("btn-crm-lista");
            if (kb) { kb.className = "btn btn-sm " + (view === "kanban" ? "btn-primary" : "btn-secondary"); kb.style.cssText = "border-radius:0; border:none; padding:6px 14px;"; }
            if (ls) { ls.className = "btn btn-sm " + (view === "lista" ? "btn-primary" : "btn-secondary"); ls.style.cssText = "border-radius:0; border:none; padding:6px 14px; border-left:1px solid var(--color-border);"; }
        }
    }

    _renderCRMContent(container) {
        if (this.crmView === "lista") {
            this.renderLeadsListView(container);
        } else {
            this.renderLeadsTable(container);
        }
    }

    // ─── PUNTO DE ENTRADA MÓDULO PEDIDOS / VENTAS (desde sidebar Pedidos) ────
    renderPedidos(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Pedidos / Ventas <span style="font-size:0.9rem; color:var(--color-gold); font-weight:600;">(NETO SIN IVA)</span></h2>
                    <p><strong>NAVIDAD Y EMPRESAS</strong> — Control de presupuestos, confirmaciones, márgenes y exportación.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary btn-sm" id="btn-new-quote-pedidos">+ Nueva Cotización</button>
                    <button class="btn btn-secondary btn-sm" onclick="salesModule.exportOrdersXLSX()" style="margin-left:8px;">⬇ Exportar Excel</button>
                    <button class="btn btn-secondary btn-sm" onclick="ERP_Reports.openReportesModal()" style="margin-left:8px;">📊 Reportes</button>
                </div>
            </div>
            <div id="pedidos-content-area"></div>
        `;
        document.getElementById("btn-new-quote-pedidos").addEventListener("click", () => this.openQuoteModal());
        this.renderQuotesTable(document.getElementById("pedidos-content-area"));
    }

    // Compatibilidad con rutas antiguas ─────────────────────────────────────
    render(container) { this.renderPedidos(container); }

    switchTab(tabName) {
        this.activeTab = tabName;
    }

    renderActiveTab() {
        // no-op: ahora cada vista se renderiza independientemente
    }

    // ─── EXPORTAR PEDIDOS XLSX ────────────────────────────────────────────────
    exportOrdersXLSX() {
        const headers = [
            "ID Pedido", "Cliente", "CUIT", "Vendedor", "Fecha",
            "Cantidad Cajas", "Total Neto ($)", "Cobrado ($)", "Saldo ($)",
            "Estado", "Estado Pago", "Facturación", "Fecha Entrega", "Localidad"
        ];

        const rows = store.orders.filter(o => o.status !== "Cancelado").map(o => {
            const collected = (o.entidadesFacturacion && o.entidadesFacturacion.length > 0)
                ? o.entidadesFacturacion.reduce((s, ef) => s + (ef.pagos || []).reduce((ps, p) => ps + (p.amount || 0), 0), 0)
                : (o.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
            // Normalizar estado de facturación igual que en Finanzas
            let invLabel = "Pendiente";
            if (o.invoiceStatus && o.invoiceStatus.toLowerCase().includes("total")) invLabel = "Total";
            else if (o.invoiceStatus && o.invoiceStatus.toLowerCase().includes("parcial")) invLabel = "Parcial";

            return [
                o.displayId || o.id.substring(4),
                o.clientName,
                o.cuit || "",
                o.salesperson || "",
                o.date,
                o.numberOfBoxes,
                o.total,
                collected,
                o.total - collected,
                o.status,
                o.paymentStatus,
                invLabel,
                o.deliveryDate || "",
                o.deliveryLocation || ""
            ];
        });

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Anchos de columna
        ws['!cols'] = [
            { wch: 14 }, { wch: 32 }, { wch: 18 }, { wch: 20 }, { wch: 12 },
            { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 12 },
            { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 22 }
        ];

        // Negrita en encabezado
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
            if (cell) cell.s = { font: { bold: true } };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pedidos y Ventas");
        XLSX.writeFile(wb, `Pedidos_NavidadyEmpresas_${new Date().toISOString().split('T')[0]}.xlsx`);
        app.showToast("Pedidos exportados como Excel correctamente.", "success");
    }

    // --- LEADS KANBAN CRM ---
    getLeadColumn(lead) {
        if (lead.status === "Descartado") return "descartado";

        const linkedOrder = store.orders.find(o => o.leadId === lead.id && o.status !== "Cancelado");
        if (!linkedOrder) {
            return "por-cotizar";
        }

        if (linkedOrder.status === "Presupuesto Enviado") {
            const today = new Date().toISOString().split('T')[0];
            if (linkedOrder.validUntil && today > linkedOrder.validUntil) {
                return "retargeting";
            }
            return "cotizado";
        }

        if (["Confirmado", "En Producción", "Listo para Despacho", "Despachado", "Entregado", "Cerrado"].includes(linkedOrder.status)) {
            return "confirmado";
        }

        return "por-cotizar";
    }

    renderLeadsTable(container) {
        const columns = {
            "por-cotizar": { title: "Por Cotizar", color: "var(--color-blue)", cards: [] },
            "cotizado": { title: "Cotizado", color: "var(--color-gold)", cards: [] },
            "retargeting": { title: "Retargeting", color: "var(--color-red)", cards: [] },
            "confirmado": { title: "Confirmado", color: "var(--color-green)", cards: [] }
        };

        // Agrupar leads en columnas
        store.leads.forEach(lead => {
            const colKey = this.getLeadColumn(lead);
            if (columns[colKey]) {
                columns[colKey].cards.push(lead);
            }
        });

        const fmt = (num) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);

        let boardHtml = `<div class="kanban-board">`;

        Object.keys(columns).forEach(colKey => {
            const col = columns[colKey];
            let cardsHtml = "";

            col.cards.forEach(lead => {
                const dateStr = new Date(lead.date).toLocaleDateString("es-AR");
                const linkedOrder = store.orders.find(o => o.leadId === lead.id && o.status !== "Cancelado");
                
                let detailsHtml = "";
                let actionsHtml = "";

                if (colKey === "por-cotizar") {
                    detailsHtml = `
                        <div><strong>Origen:</strong> <span class="badge" style="font-size:0.65rem; background:var(--bg-sidebar); color:var(--color-text-muted);">${lead.source}</span></div>
                        ${lead.estimatedBoxes ? `<div style="color:var(--color-gold); font-weight:600;">Est: ${lead.estimatedBoxes.toLocaleString('es-AR')} cajas</div>` : ''}
                        <div style="font-size:0.7rem; color:var(--color-text-muted); margin-top: 4px;">Ingreso: ${dateStr}</div>
                    `;
                    actionsHtml = `
                        <button class="btn btn-secondary btn-sm" onclick="salesModule.openAddReminderModal('${lead.id}')" style="font-size:0.7rem; padding: 2px 6px;">+ Alerta</button>
                        <button class="btn btn-primary btn-sm" onclick="salesModule.convertLeadToQuote('${lead.id}')" style="font-size:0.7rem; padding: 2px 6px;">Cotizar</button>
                    `;
                } else if (colKey === "cotizado") {
                    const totalQuote = linkedOrder ? fmt(linkedOrder.total) : "$0";
                    const validStr = linkedOrder && linkedOrder.validUntil ? new Date(linkedOrder.validUntil + "T00:00:00").toLocaleDateString("es-AR") : "S/D";
                    detailsHtml = `
                        <div><strong>Presupuesto:</strong> <code>#${linkedOrder.id.substring(4)}</code></div>
                        <div><strong>Total:</strong> <span style="font-weight:600; color:var(--color-blue);">${totalQuote}</span></div>
                        <div style="font-size:0.7rem; color:var(--color-text-muted);">Vence: ${validStr}</div>
                    `;
                    actionsHtml = `
                        <button class="btn btn-secondary btn-sm" onclick="salesModule.openQuoteModal({orderId: '${linkedOrder.id}'})" style="font-size:0.7rem; padding: 2px 6px; width:100%;">Ver Cotización</button>
                    `;
                } else if (colKey === "retargeting") {
                    const totalQuote = linkedOrder ? fmt(linkedOrder.total) : "$0";
                    const expiredStr = linkedOrder && linkedOrder.validUntil ? new Date(linkedOrder.validUntil + "T00:00:00").toLocaleDateString("es-AR") : "S/D";
                    
                    detailsHtml = `
                        <div style="color:var(--color-red); font-weight:600;">⚠️ COTIZACIÓN VENCIDA</div>
                        <div><strong>Presupuesto:</strong> <code>#${linkedOrder.id.substring(4)}</code></div>
                        <div><strong>Monto:</strong> ${totalQuote}</div>
                        <div style="font-size:0.7rem; color:var(--color-text-muted);">Venció el: ${expiredStr}</div>
                        ${Array.isArray(lead.notes) && lead.notes.length > 0 ? `<div style="font-style:italic; font-size:0.7rem; color:var(--color-text-muted); background:#fdfcfb; padding:4px; border:1px solid #eee; border-radius:3px; margin-top:4px; max-height:40px; overflow:hidden; text-overflow:ellipsis;">"${lead.notes[lead.notes.length-1].text}"</div>` : ''}
                    `;
                    actionsHtml = `
                        <button class="btn btn-secondary btn-sm" onclick="salesModule.openAddLeadNoteModal('${lead.id}')" style="font-size:0.65rem; padding: 2px 4px;" title="Registrar Observación">Nota</button>
                        <button class="btn btn-secondary btn-sm" onclick="salesModule.openAddReminderModal('${lead.id}')" style="font-size:0.65rem; padding: 2px 4px;" title="Llamar/Agendar">+ Alerta</button>
                        <button class="btn btn-gold btn-sm" onclick="salesModule.openQuoteModal({orderId: '${linkedOrder.id}'})" style="font-size:0.65rem; padding: 2px 4px;">Recotizar</button>
                        <button class="btn btn-red btn-sm" onclick="salesModule.discardLead('${lead.id}')" style="font-size:0.65rem; padding: 2px 4px;">Descartar</button>
                    `;
                } else if (colKey === "confirmado") {
                    const totalSale = linkedOrder ? fmt(linkedOrder.total) : "$0";
                    const boxes = linkedOrder ? linkedOrder.numberOfBoxes : 0;
                    detailsHtml = `
                        <div><strong>Pedido:</strong> <code>#${linkedOrder.id.substring(4)}</code></div>
                        <div><strong>Cajas:</strong> <strong>${boxes} u.</strong></div>
                        <div><strong>Total Venta:</strong> <strong style="color:var(--color-green);">${totalSale}</strong></div>
                        <div style="margin-top:4px;"><span class="badge processing" style="font-size:0.65rem; padding:1px 5px;">${linkedOrder.status}</span></div>
                    `;
                    actionsHtml = `
                        <button class="btn btn-secondary btn-sm" onclick="salesModule.viewLinkedOrderDetails('${linkedOrder.id}')" style="font-size:0.7rem; padding: 2px 6px; width:100%;">Detalles Pedido</button>
                    `;
                }

                cardsHtml += `
                    <div class="kanban-card">
                        <div class="kanban-card-header">
                            <div class="kanban-card-client">${esc(lead.clientName)}</div>
                        </div>
                        <div class="kanban-card-contact">
                            ${lead.contactName ? `👤 ${esc(lead.contactName)}<br>` : ''}
                            📞 ${esc(lead.phone || lead.email || 'Sin contacto directo')}
                        </div>
                        <div class="kanban-card-meta">
                            ${detailsHtml}
                        </div>
                        <div class="kanban-card-actions">
                            ${actionsHtml}
                        </div>
                    </div>
                `;
            });

            boardHtml += `
                <div class="kanban-column">
                    <div class="kanban-column-header">
                        <span class="kanban-column-title" style="color: ${col.color};">${col.title}</span>
                        <span class="kanban-column-count">${col.cards.length}</span>
                    </div>
                    <div class="kanban-cards-container">
                        ${cardsHtml || '<div style="text-align:center; font-size:0.75rem; color:var(--color-text-muted); padding:20px; border:1px dashed var(--color-border); border-radius:var(--radius-md); background:white;">Columna vacía</div>'}
                    </div>
                </div>
            `;
        });

        boardHtml += `</div>`;
        container.innerHTML = boardHtml;
    }

    openAddLeadNoteModal(leadId) {
        const lead = store.leads.find(l => l.id === leadId);
        if (!lead) return;

        // Construir historial existente
        const notesArr = Array.isArray(lead.notes) ? lead.notes : [];
        const historyHtml = notesArr.length === 0
            ? `<p style="color:var(--color-text-muted); font-size:0.82rem; text-align:center; padding:10px;">Sin interacciones previas.</p>`
            : [...notesArr].reverse().map(n => {
                const dateStr = new Date(n.date).toLocaleDateString("es-AR", { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
                return `<div style="border-left:3px solid var(--color-gold); padding:8px 12px; margin-bottom:8px; background:var(--bg-sidebar); border-radius:0 4px 4px 0;">
                    <div style="font-size:0.72rem; color:var(--color-text-muted); margin-bottom:3px;">${dateStr} — ${n.user}</div>
                    <div style="font-size:0.85rem;">${n.text}</div>
                </div>`;
            }).join("");

        const html = `
            <div style="max-height:200px; overflow-y:auto; margin-bottom:15px; border:1px solid var(--color-border); border-radius:6px; padding:10px;">
                ${historyHtml}
            </div>
            <form onsubmit="salesModule.saveLeadNote(event, '${leadId}')">
                <div class="form-group" style="margin-bottom:15px;">
                    <label style="font-weight:600; margin-bottom:5px; display:block;">Nueva Interacción / Seguimiento</label>
                    <textarea id="lead-new-note" class="form-control" rows="4" required placeholder="Escriba los detalles de la interacción con el cliente..."></textarea>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Agregar al Historial</button>
                </div>
            </form>
        `;
        app.showModal(`Historial de Contacto — ${lead.clientName}`, html);
    }

    saveLeadNote(e, leadId) {
        e.preventDefault();
        const note = document.getElementById("lead-new-note").value.trim();
        const lead = store.leads.find(l => l.id === leadId);
        if (lead) {
            if (!Array.isArray(lead.notes)) lead.notes = [];
            lead.notes.push({
                date: new Date().toISOString(),
                user: `${app.currentUser} (${app.currentRole})`,
                text: note
            });
            store.saveData();
            app.closeModal();
            app.showToast("Interacción registrada en el historial.", "success");
            const main = document.getElementById("main-content");
            if (document.getElementById("crm-content-area")) this.renderCRM(main);
            else if (document.getElementById("sales-content-area")) this.renderActiveTab();
        }
    }

    discardLead(leadId) {
        const lead = store.leads.find(l => l.id === leadId);
        if (lead) {
            if (confirm(`¿Está seguro de descartar al prospecto "${lead.clientName}"? Se ocultará del tablero de CRM activo.`)) {
                lead.status = "Descartado";
                store.saveData();
                app.showToast("Lead descartado correctamente.", "info");
                const main = document.getElementById("main-content");
                if (document.getElementById("crm-content-area")) this.renderCRM(main);
                else this.renderActiveTab();
            }
        }
    }

    viewLinkedOrderDetails(orderId) {
        // Enlazar al modal de auditoría/trazabilidad del pedido existente
        this.openExportModal(orderId);
    }

    openLeadModal() {
        const html = `
            <form id="form-new-lead" onsubmit="salesModule.saveLead(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre de la Empresa o Cliente *</label>
                        <input type="text" id="lead-client-name" class="form-control" placeholder="Ej: Holcim Argentina S.A." required>
                    </div>
                    <div class="form-group">
                        <label>Cantidad Estimada de Cajas (Solo Estimado)</label>
                        <input type="number" id="lead-estimated-boxes" class="form-control" placeholder="Ej: 150" min="0">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre del Contacto</label>
                        <input type="text" id="lead-contact-name" class="form-control" placeholder="Ej: Juan Pérez (Compras)">
                    </div>
                    <div class="form-group">
                        <label>Canal de Entrada</label>
                        <select id="lead-source" class="form-control">
                            <option value="Mail Navidad y Empresas">Mail Navidad y Empresas</option>
                            <option value="Mail Golosinas y Comestibles">Mail Golosinas y Comestibles</option>
                            <option value="WhatsApp Navidad y Empresas">WhatsApp Navidad y Empresas</option>
                            <option value="WhatsApp Golosinas Y Comestibles">WhatsApp Golosinas Y Comestibles</option>
                            <option value="WhatsApp Difusion">WhatsApp Difusion</option>
                            <option value="WhatsApp Carlos E. Juncos">WhatsApp Carlos E. Juncos</option>
                            <option value="WhatsApp Carlitos Juncos">WhatsApp Carlitos Juncos</option>
                            <option value="WhatsApp Agustin Juncos">WhatsApp Agustin Juncos</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="text" id="lead-phone" class="form-control" placeholder="Ej: +54 351 123-4567">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="lead-email" class="form-control" placeholder="Ej: contacto@empresa.com">
                    </div>
                </div>
                <div class="form-group">
                    <label>Notas Iniciales / Pedido de Cotización</label>
                    <textarea id="lead-notes" class="form-control" rows="3" placeholder="Ej: Consultan por 200 cajas navideñas..."></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar Lead</button>
                </div>
            </form>
        `;
        app.showModal("Cargar Nuevo Lead Comercial", html);
    }

    saveLead(e) {
        e.preventDefault();
        const clientName = document.getElementById("lead-client-name").value;
        const estimatedBoxes = parseInt(document.getElementById("lead-estimated-boxes").value) || 0;
        const contactName = document.getElementById("lead-contact-name").value;
        const source = document.getElementById("lead-source").value;
        const phone = document.getElementById("lead-phone").value;
        const email = document.getElementById("lead-email").value;
        const notes = document.getElementById("lead-notes").value;

        const now = new Date().toISOString();
        const notesArr = notes.trim() ? [{ date: now, user: `${app.currentUser} (${app.currentRole})`, text: notes.trim() }] : [];
        const newLead = {
            id: "lead_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
            clientName, estimatedBoxes, contactName, source, phone, email,
            notes: notesArr,
            status: "Contactado",
            date: now,
            reminders: []
        };

        store.leads.push(newLead);
        store.saveData();
        app.closeModal();
        app.showToast("Lead comercial guardado con éxito", "success");
        // Re-renderizar la vista activa
        const main = document.getElementById("main-content");
        if (document.getElementById("crm-content-area")) this.renderCRM(main);
        else if (document.getElementById("sales-content-area")) this.renderActiveTab();
    }

    openAddReminderModal(leadId) {
        const html = `
            <form onsubmit="salesModule.saveReminder(event, '${leadId}')">
                <div class="form-group">
                    <label>Texto de la Alerta / Recordatorio</label>
                    <input type="text" id="rem-text" class="form-control" placeholder="Ej: Llamar por teléfono para definir cajas" required>
                </div>
                <div class="form-group">
                    <label>Fecha de Seguimiento</label>
                    <input type="date" id="rem-date" class="form-control" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Crear Recordatorio</button>
                </div>
            </form>
        `;
        app.showModal("Agregar Recordatorio de Seguimiento", html);
    }

    saveReminder(e, leadId) {
        e.preventDefault();
        const text = document.getElementById("rem-text").value;
        const date = document.getElementById("rem-date").value;
        
        const lead = store.leads.find(l => l.id === leadId);
        if (lead) {
            if (!lead.reminders) lead.reminders = [];
            lead.reminders.push({
                id: "rem_" + Date.now(),
                text,
                date,
                done: false
            });
            store.saveData();
            app.closeModal();
            app.showToast("Alerta comercial programada", "success");
            this.renderActiveTab();
        }
    }

    toggleReminder(leadId, reminderId) {
        const lead = store.leads.find(l => l.id === leadId);
        if (lead && lead.reminders) {
            const reminder = lead.reminders.find(r => r.id === reminderId);
            if (reminder) {
                reminder.done = !reminder.done;
                store.saveData();
                app.showToast("Estado de recordatorio actualizado", "info");
                this.renderActiveTab();
            }
        }
    }

    convertLeadToQuote(leadId) {
        const lead = store.leads.find(l => l.id === leadId);
        if (lead) {
            lead.status = "Cotizado";
            store.saveData();
            // Pasar la última nota del historial como nota inicial
            const lastNote = Array.isArray(lead.notes) && lead.notes.length > 0 ? lead.notes[lead.notes.length - 1].text : "";
            this.openQuoteModal({
                leadId: lead.id,
                clientName: lead.clientName,
                notes: lastNote
            });
        }
    }


    // ─── VISTA LISTA DEL CRM ─────────────────────────────────────────────────
    renderLeadsListView(container) {
        const canales = [...new Set(store.leads.map(l => l.source).filter(Boolean))].sort();
        const canalOpts = `<option value="">Todos los canales</option>` +
            canales.map(c => `<option value="${c}" ${this.crmCanalFilter === c ? 'selected' : ''}>${c}</option>`).join("");

        // Filtrar leads
        let leads = store.leads.filter(l => l.status !== "Descartado");
        if (this.crmSearch) {
            const q = this.crmSearch.toLowerCase();
            leads = leads.filter(l =>
                l.clientName.toLowerCase().includes(q) ||
                (l.contactName || "").toLowerCase().includes(q) ||
                (l.phone || "").includes(q)
            );
        }
        if (this.crmStatusFilter && this.crmStatusFilter !== "todos") {
            leads = leads.filter(l => this.getLeadColumn(l) === this.crmStatusFilter);
        }
        if (this.crmCanalFilter) {
            leads = leads.filter(l => l.source === this.crmCanalFilter);
        }

        // Ordenar: primero los más recientes
        leads.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        const colLabels = {
            "por-cotizar": { text: "Por Cotizar", cls: "lead" },
            "cotizado": { text: "Cotizado", cls: "sent" },
            "retargeting": { text: "Retargeting", cls: "canceled" },
            "confirmado": { text: "Confirmado", cls: "delivered" }
        };

        let rowsHtml = leads.length === 0
            ? `<tr><td colspan="8" style="text-align:center; color:var(--color-text-muted); padding:30px;">No hay leads para los filtros seleccionados.</td></tr>`
            : leads.map(lead => {
                const col = this.getLeadColumn(lead);
                const colInfo = colLabels[col] || { text: col, cls: "lead" };
                const linkedOrder = store.orders.find(o => o.leadId === lead.id && o.status !== "Cancelado");
                const pendingRem = (lead.reminders || []).filter(r => !r.done).length;
                const lastNote = Array.isArray(lead.notes) && lead.notes.length > 0
                    ? `<span style="font-style:italic; color:var(--color-text-muted);">"${lead.notes[lead.notes.length - 1].text.substring(0, 60)}${lead.notes[lead.notes.length-1].text.length > 60 ? '...' : ''}"</span>`
                    : '<span style="color:var(--color-text-muted); font-size:0.75rem;">Sin notas</span>';

                const dateStr = lead.date ? new Date(lead.date).toLocaleDateString("es-AR") : "S/D";
                const orderLink = linkedOrder
                    ? `<span class="badge processing" style="font-size:0.7rem;">${linkedOrder.displayId || linkedOrder.id.substring(4)}</span>`
                    : '<span style="color:var(--color-text-muted); font-size:0.75rem;">—</span>';

                return `<tr style="border-bottom:1px solid var(--color-border);">
                    <td style="padding:8px 10px;">
                        <strong style="font-size:0.9rem;">${esc(lead.clientName)}</strong>
                        ${lead.contactName ? `<br><span style="font-size:0.75rem; color:var(--color-text-muted);">👤 ${esc(lead.contactName)}</span>` : ''}
                    </td>
                    <td style="padding:8px 10px; font-size:0.8rem;">
                        ${esc(lead.phone || lead.email || '') || '<span style="color:var(--color-text-muted);">Sin contacto</span>'}
                    </td>
                    <td style="padding:8px 10px; font-size:0.8rem; color:var(--color-text-muted);">${lead.source || '—'}</td>
                    <td style="padding:8px 10px; text-align:center;">
                        <span class="badge ${colInfo.cls}" style="font-size:0.72rem;">${colInfo.text}</span>
                    </td>
                    <td style="padding:8px 10px; text-align:center; font-weight:600; color:var(--color-gold);">
                        ${lead.estimatedBoxes ? lead.estimatedBoxes.toLocaleString('es-AR') : '—'}
                    </td>
                    <td style="padding:8px 10px; text-align:center; font-size:0.8rem;">${dateStr}</td>
                    <td style="padding:8px 10px; text-align:center;">${orderLink}</td>
                    <td style="padding:8px 10px; font-size:0.8rem;">${lastNote}</td>
                    <td style="padding:8px 10px; text-align:right;">
                        <div style="display:inline-flex; gap:3px; flex-wrap:wrap; justify-content:flex-end;">
                            <button class="btn btn-secondary btn-sm" onclick="salesModule.openAddLeadNoteModal('${lead.id}')" style="padding:2px 6px; font-size:0.72rem;" title="Historial de notas">Nota</button>
                            <button class="btn btn-secondary btn-sm" onclick="salesModule.openAddReminderModal('${lead.id}')" style="padding:2px 6px; font-size:0.72rem;" title="Agregar recordatorio">+ Alerta</button>
                            ${col === "por-cotizar" || col === "retargeting"
                                ? `<button class="btn btn-primary btn-sm" onclick="salesModule.convertLeadToQuote('${lead.id}')" style="padding:2px 6px; font-size:0.72rem;">Cotizar</button>`
                                : linkedOrder
                                    ? `<button class="btn btn-secondary btn-sm" onclick="salesModule.openQuoteModal({orderId:'${linkedOrder.id}'})" style="padding:2px 6px; font-size:0.72rem;">Ver Cotiz.</button>`
                                    : ''}
                            <button class="btn btn-red btn-sm" onclick="salesModule.discardLead('${lead.id}')" style="padding:2px 6px; font-size:0.72rem; color:var(--color-red); background:transparent; border:1px solid var(--color-red);">✕</button>
                        </div>
                    </td>
                </tr>`;
            }).join("");

        container.innerHTML = `
            <!-- Barra de filtros -->
            <div class="card" style="margin-bottom:15px; padding:12px;">
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                    <input type="text" id="crm-list-search" class="form-control" style="flex:1; min-width:200px; padding:7px 10px;"
                        placeholder="🔍 Buscar empresa, contacto, teléfono..."
                        value="${this.crmSearch}"
                        oninput="salesModule.crmSearch=this.value; salesModule._renderCRMContent(document.getElementById('crm-content-area'));">
                    <select id="crm-list-status" class="form-control" style="width:175px; padding:7px 8px;"
                        onchange="salesModule.crmStatusFilter=this.value; salesModule._renderCRMContent(document.getElementById('crm-content-area'));">
                        <option value="todos" ${this.crmStatusFilter === 'todos' ? 'selected' : ''}>Todos los estados</option>
                        <option value="por-cotizar" ${this.crmStatusFilter === 'por-cotizar' ? 'selected' : ''}>Por Cotizar</option>
                        <option value="cotizado" ${this.crmStatusFilter === 'cotizado' ? 'selected' : ''}>Cotizados</option>
                        <option value="retargeting" ${this.crmStatusFilter === 'retargeting' ? 'selected' : ''}>Retargeting</option>
                        <option value="confirmado" ${this.crmStatusFilter === 'confirmado' ? 'selected' : ''}>Confirmados</option>
                    </select>
                    <select id="crm-list-canal" class="form-control" style="width:220px; padding:7px 8px;"
                        onchange="salesModule.crmCanalFilter=this.value; salesModule._renderCRMContent(document.getElementById('crm-content-area'));">
                        ${canalOpts}
                    </select>
                    <span style="font-size:0.82rem; color:var(--color-text-muted);">${leads.length} leads</span>
                </div>
            </div>

            <!-- Tabla -->
            <div class="card">
                <div class="table-container">
                    <table style="font-size:0.85rem;">
                        <thead>
                            <tr>
                                <th>Empresa / Cliente</th>
                                <th>Contacto / Teléfono</th>
                                <th>Canal</th>
                                <th style="text-align:center;">Estado CRM</th>
                                <th style="text-align:center;">Cajas Est.</th>
                                <th style="text-align:center;">Fecha Alta</th>
                                <th style="text-align:center;">Pedido</th>
                                <th>Última Nota</th>
                                <th style="text-align:right; width:200px;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // --- PRESUPUESTOS Y PEDIDOS ---
    renderQuotesTable(container) {
        if (store.orders.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <h3>No hay presupuestos ni pedidos registrados</h3>
                    <p style="color: var(--color-text-muted); margin-top: 10px;">Presiona "+ Nueva Cotización" para empezar.</p>
                </div>
            `;
            return;
        }

        // Filtrar cotizaciones por vendedor asignado
        let filteredOrders = store.orders;
        if (this.salespersonFilter) {
            filteredOrders = filteredOrders.filter(o => o.salesperson === this.salespersonFilter);
        }

        let rowsHtml = "";
        filteredOrders.forEach(order => {
            const formattedTotal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(order.total);
            const dateStr = new Date(order.date).toLocaleDateString("es-AR");
            
            // Verificar Vencimiento (10 días)
            let isExpired = false;
            let expiryWarningHtml = "";
            if (order.status === "Presupuesto Enviado" && order.validUntil) {
                const today = new Date();
                const expiryDate = new Date(order.validUntil);
                if (today > expiryDate) {
                    isExpired = true;
                    expiryWarningHtml = `<br><span style="color: var(--color-red); font-size: 0.75rem; font-weight: 600;">⚠️ Expirado</span>`;
                }
            }

            const semaforoColor = this.getSemaforoColor(order);
            const semaforoHtml = `
                <div class="semaforo" title="Semáforo del Pedido">
                    <span class="semaforo-dot ${semaforoColor}"></span>
                    <span style="font-size: 0.75rem; text-transform: uppercase;">${semaforoColor}</span>
                </div>
            `;

            let badgeClass = "lead";
            if (order.status === "Presupuesto Enviado") badgeClass = "sent";
            else if (order.status === "Confirmado") badgeClass = "confirmed";
            else if (order.status === "En Producción") badgeClass = "processing";
            else if (order.status === "Listo para Despacho") badgeClass = "finished";
            else if (order.status === "Despachado") badgeClass = "sent";
            else if (order.status === "Entregado" || order.status === "Cerrado") badgeClass = "delivered";

            rowsHtml += `
                <tr>
                    <td><strong>${order.displayId || order.id.substring(4)}</strong></td>
                    <td>
                        <strong>${esc(order.clientName)}</strong><br>
                        <span style="font-size: 0.8rem; color: var(--color-text-muted);">
                            CUIT: ${esc(order.cuit || 'No cargado')} | Emisión: ${dateStr}<br>
                            Vendedor: <strong>${esc(order.salesperson || 'Sin asignar')}</strong>
                        </span>
                    </td>
                    <td>${formattedTotal} (Neto)${expiryWarningHtml}</td>
                    <td>${semaforoHtml}</td>
                    <td><span class="badge ${badgeClass}">${order.status}</span></td>
                    <td style="font-size: 0.8rem;">
                        <strong>Cant: ${order.numberOfBoxes} cajas</strong><br>
                        ${(() => {
                            const efs = order.entidadesFacturacion || [];
                            const ents = order.entregas || [];
                            const efLabel = efs.length > 1
                                ? `<span style="color:var(--color-gold); font-weight:600;">Split fact: ${efs.length} entidades</span>`
                                : `Factura: ${esc(efs[0]?.razonSocial || order.clientName)}`;
                            const entLabel = ents.length > 1
                                ? `<span style="color:var(--color-gold); font-weight:600;">Split entrega: ${ents.length} destinos</span>`
                                : `Destino: ${esc(ents[0]?.localidad || order.deliveryLocation || '') || '<span style="color:var(--color-text-muted);">Opcional</span>'}`;
                            const fechaLabel = ents.length > 1
                                ? `${ents.filter(e => e.fechaEntrega).length}/${ents.length} fechas cargadas`
                                : `Fecha: ${ents[0]?.fechaEntrega ? new Date(ents[0].fechaEntrega + 'T00:00:00').toLocaleDateString('es-AR') : '<span style="color:var(--color-text-muted);">Opcional</span>'}`;
                            return `${efLabel}<br>${entLabel}<br>${fechaLabel}`;
                        })()}
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px; flex-wrap:wrap;">
                            <button class="btn btn-secondary btn-sm" onclick="salesModule.openQuoteModal({orderId: '${order.id}'})">Editar</button>
                            <button class="btn btn-gold btn-sm" onclick="salesModule.openExportModal('${order.id}')" title="Exportar Propuesta (Excel/PDF)">Exportar</button>
                            ${order.status !== "Presupuesto Enviado" && order.status !== "Cancelado"
                                ? `<button class="btn btn-secondary btn-sm" onclick="salesModule.openBillingDeliveryModal('${order.id}')" title="Configurar facturación y entregas" style="background:var(--color-blue); color:white; border-color:var(--color-blue);">📋 Fact/Ent</button>`
                                : ''}
                            ${order.status === "Presupuesto Enviado" ?
                              `<button class="btn btn-primary btn-sm" onclick="salesModule.confirmOrderFromList('${order.id}', ${isExpired})">Confirmar</button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });

        container.innerHTML = `
            <!-- Barra de Filtro de Vendedor -->
            <div class="card" style="margin-bottom: 15px; padding: 12px;">
                <div style="display:flex; gap: 15px; align-items: flex-end; flex-wrap: wrap;">
                    <div class="form-group" style="margin-bottom: 0; min-width: 200px;">
                        <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; display: block;">Filtrar por Vendedor:</label>
                        <select id="filter-salesperson" class="form-control" style="padding: 6px 10px; font-size: 0.85rem;" onchange="salesModule.changeSalespersonFilter(this.value)">
                            <option value="">-- Todos los Vendedores --</option>
                            <option value="Carlos E. Juncos" ${this.salespersonFilter === 'Carlos E. Juncos' ? 'selected' : ''}>Carlos E. Juncos</option>
                            <option value="Carlitos Juncos" ${this.salespersonFilter === 'Carlitos Juncos' ? 'selected' : ''}>Carlitos Juncos</option>
                            <option value="Trinidad Juncos" ${this.salespersonFilter === 'Trinidad Juncos' ? 'selected' : ''}>Trinidad Juncos</option>
                            <option value="Agustín Juncos" ${this.salespersonFilter === 'Agustín Juncos' ? 'selected' : ''}>Agustín Juncos</option>
                            <option value="Víctor Zárate" ${this.salespersonFilter === 'Víctor Zárate' ? 'selected' : ''}>Víctor Zárate</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente / CUIT / Vendedor</th>
                                <th>Total Neto (Sin IVA)</th>
                                <th>Semáforo</th>
                                <th>Estado</th>
                                <th>Cajas / Distribución</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="7" style="text-align:center; color:var(--color-text-muted); padding:20px;">No se encontraron cotizaciones para el filtro seleccionado.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getSemaforoColor(order) {
        if (order.status === "Cerrado" || order.status === "Entregado") return "verde";
        
        // Rojo: Falta CUIT (para confirmados), falta pago inicial (seña) o stock crítico comprometido negativo
        if (order.status !== "Presupuesto Enviado") {
            if (!order.cuit) return "rojo"; // Falta CUIT obligatorio al confirmar
        }
        
        if (order.status === "Confirmado" && order.paymentStatus === "Impago") {
            return "rojo"; 
        }

        // Verificar stock físico negativo (producto sobrecomprometido)
        let hasNegativeStock = false;
        if (order.boxRecipe && Array.isArray(order.boxRecipe)) {
            order.boxRecipe.forEach(item => {
                if (item.type === "product") {
                    const prod = store.products.find(p => p.id === item.id);
                    if (prod && prod.stock < 0) hasNegativeStock = true;
                } else if (item.type === "combo") {
                    const combo = store.combos.find(c => c.id === item.id);
                    if (combo) {
                        combo.items.forEach(ci => {
                            const prod = store.products.find(p => p.id === ci.prodId);
                            if (prod && prod.stock < 0) hasNegativeStock = true;
                        });
                    }
                }
            });
        }

        if (hasNegativeStock) return "rojo";

        // Amarillo si faltan datos de entrega secundarios en logística confirmada
        if (order.status !== "Presupuesto Enviado" && (!order.deliveryDate || !order.deliveryAddress || !order.deliveryLocation)) {
            return "amarillo"; 
        }

        return "verde";
    }

    confirmOrderFromList(orderId, isExpired) {
        if (isExpired) {
            app.showToast("Este presupuesto está vencido. Debes editarlo y presionar 'Actualizar Precios' primero.", "error");
            return;
        }
        this.openConfirmationModal(orderId);
    }

    openConfirmationModal(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) {
            app.showToast("Pedido no encontrado", "error");
            return;
        }

        // Si por alguna razón no tiene options, inicializar con la actual
        if (!order.options || order.options.length === 0) {
            order.options = [{
                name: "Opción 1",
                numberOfBoxes: order.numberOfBoxes || 1,
                boxRecipe: JSON.parse(JSON.stringify(order.boxRecipe)),
                unitPrice: order.total / (order.numberOfBoxes || 1),
                costUnit: order.costEst / (order.numberOfBoxes || 1),
                marginPercent: order.costEst ? (((order.total / order.numberOfBoxes) / (order.costEst / order.numberOfBoxes)) - 1) * 100 : 40,
                total: order.total,
                costEst: order.costEst,
                margin: order.margin
            }];
            store.saveData();
        }

        let optionsHtml = "";
        order.options.forEach((opt, idx) => {
            const formattedTotal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(opt.total);
            const formattedUnit = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(opt.unitPrice || (opt.total / opt.numberOfBoxes));
            optionsHtml += `
                <div style="margin-bottom:10px; display:flex; align-items:center; gap:10px; background:var(--bg-sidebar); border:1px solid var(--color-border); padding:12px; border-radius:var(--radius-sm);">
                    <input type="radio" name="confirm-select-option" id="opt-chk-${idx}" value="${idx}" ${idx === 0 ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--color-gold); cursor:pointer;">
                    <label for="opt-chk-${idx}" style="flex-grow:1; cursor:pointer; font-size:0.9rem;">
                        <strong>${opt.name}</strong><br>
                        <span style="font-size:0.8rem; color:var(--color-text-muted);">
                            ${opt.numberOfBoxes} cajas &times; ${formattedUnit} (Unit.) = <strong>${formattedTotal}</strong>
                        </span>
                    </label>
                </div>
            `;
        });

        const html = `
            <form onsubmit="salesModule.executeOrderConfirmation(event, '${order.id}')">
                <div class="form-group" style="margin-bottom:15px;">
                    <label style="font-weight:600;">CUIT de la Empresa o Cliente (Obligatorio) *</label>
                    <input type="text" id="confirm-cuit" class="form-control" placeholder="Ej: 30-71458930-4" value="${order.cuit || ''}" required>
                </div>
                
                <h4 style="margin-top:20px; margin-bottom:10px;">Seleccione la opción elegida por el cliente:</h4>
                <div style="max-height:220px; overflow-y:auto; margin-bottom:20px;">
                    ${optionsHtml}
                </div>
                
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Confirmar Venta</button>
                </div>
            </form>
        `;

        app.showModal(`Confirmar Venta - Pedido #${order.id.substring(4)}`, html);
    }

    // Calcula qué productos quedarán con stock negativo al confirmar esta venta.
    // El stock físico ya refleja los descuentos de todas las ventas confirmadas anteriormente.
    // Si la venta ya fue confirmada antes (re-confirmación), su propio stock ya está descontado
    // y hay que "devolverlo" virtualmente para calcular el impacto real del nuevo compromiso.
    checkStockWithCommitted(chosenOpt, excludeOrderId) {
        const currentOrder = store.orders.find(o => o.id === excludeOrderId);
        // Si es re-confirmación, el stock de este pedido ya fue descontado → sumarlo de vuelta para evaluar el nuevo impacto
        const currentOldFlat = (currentOrder && currentOrder.stockDescontado)
            ? store.expandRecipe(currentOrder.boxRecipe, currentOrder.numberOfBoxes)
            : {};

        const newRequired = store.expandRecipe(chosenOpt.boxRecipe, chosenOpt.numberOfBoxes);

        const shortages = [];
        Object.entries(newRequired).forEach(([prodId, reqQty]) => {
            const prod = store.products.find(p => p.id === prodId);
            if (prod) {
                // Stock efectivo: físico + lo que este pedido ya tenía descontado (re-conf.)
                const alreadyDeducted = currentOldFlat[prodId] || 0;
                const effectiveStock = prod.stock + alreadyDeducted;
                if (effectiveStock < reqQty) {
                    shortages.push({
                        name: prod.name, code: prod.code,
                        available: effectiveStock, required: reqQty
                    });
                }
            }
        });
        return shortages;
    }

    checkOrderStock(chosenOpt) {
        const required = {}; // prodId -> quantity
        
        chosenOpt.boxRecipe.forEach(item => {
            const qtyInBox = item.qty || 1;
            if (item.type === "product") {
                required[item.id] = (required[item.id] || 0) + (qtyInBox * chosenOpt.numberOfBoxes);
            } else if (item.type === "combo") {
                const combo = store.combos.find(c => c.id === item.id);
                if (combo && combo.items) {
                    combo.items.forEach(ci => {
                        required[ci.prodId] = (required[ci.prodId] || 0) + (ci.qty * qtyInBox * chosenOpt.numberOfBoxes);
                    });
                }
            }
        });
        
        const shortages = []; // array of { name, code, available, required }
        
        for (const [prodId, reqQty] of Object.entries(required)) {
            const prod = store.products.find(p => p.id === prodId);
            if (prod) {
                if (prod.stock < reqQty) {
                    shortages.push({
                        name: prod.name,
                        code: prod.code,
                        available: prod.stock,
                        required: reqQty
                    });
                }
            }
        }
        return shortages;
    }

    executeOrderConfirmation(e, orderId) {
        e.preventDefault();
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const cuit = document.getElementById("confirm-cuit").value.trim();
        if (!cuit) {
            app.showToast("El CUIT es un campo obligatorio.", "error");
            return;
        }

        const selectedRadio = document.querySelector('input[name="confirm-select-option"]:checked');
        if (!selectedRadio) {
            app.showToast("Debe seleccionar una opción.", "error");
            return;
        }

        const selectedIndex = parseInt(selectedRadio.value);
        const chosenOpt = order.options[selectedIndex];
        if (!chosenOpt) return;

        // Validar Stock — calcular déficit proyectado considerando TODAS las órdenes confirmadas y en producción
        const shortages = this.checkStockWithCommitted(chosenOpt, orderId);
        if (shortages.length > 0) {
            let warnMsg = `⚠️ Esta venta genera los siguientes faltantes proyectados:\n\n`;
            shortages.forEach(s => {
                warnMsg += `• ${s.name}: necesitás ${s.required}, stock disponible ${s.available}  →  déficit: -${s.required - s.available} u.\n`;
            });
            warnMsg += `\nPodés confirmar igualmente. El sistema registrará los faltantes para que los cubras con compras.\n\n¿Confirmar venta con faltantes?`;
            if (!confirm(warnMsg)) return;
        }

        // Capturar estado anterior ANTES de actualizar (necesario para re-confirmaciones)
        const _hadStockDescontado = !!order.stockDescontado;
        const _oldBoxRecipe = JSON.parse(JSON.stringify(order.boxRecipe || []));
        const _oldNumberOfBoxes = order.numberOfBoxes || chosenOpt.numberOfBoxes;

        // Establecer como campos primarios de la orden
        order.cuit = cuit;
        order.status = "Confirmado";
        order.paymentStatus = "Impago";
        order.numberOfBoxes = chosenOpt.numberOfBoxes;
        order.boxRecipe = JSON.parse(JSON.stringify(chosenOpt.boxRecipe));
        order.items = this.expandRecipeToItemsList(chosenOpt.boxRecipe);
        order.total = chosenOpt.total;
        order.costEst = chosenOpt.costEst;
        order.margin = chosenOpt.margin;

        // Generar Tarea de Facturación automática (100% de la opción elegida)
        order.scheduledInvoices = [{
            id: "task_" + order.id.substring(4) + "_1",
            desc: `Factura inicial (100% de la venta - ${chosenOpt.name})`,
            date: new Date().toISOString().split('T')[0],
            percent: 100,
            amount: order.total,
            status: "Pendiente",
            ref: ""
        }];

        // Inicializar entidadesFacturacion con el cliente principal
        const initFact = [{
            id: `ef_${order.id}_1`,
            razonSocial: order.clientName,
            cuit: cuit,
            cantidadCajas: chosenOpt.numberOfBoxes,
            monto: order.total,
            pagos: [],
            facturas: JSON.parse(JSON.stringify(order.scheduledInvoices))
        }];
        // Inicializar entregas con los datos actuales del pedido
        const initEnt = [{
            id: `ent_${order.id}_1`,
            cantidadCajas: chosenOpt.numberOfBoxes,
            direccion: order.deliveryAddress || "",
            localidad: order.deliveryLocation || "",
            provincia: order.deliveryProvince || "Córdoba",
            fechaEntrega: order.deliveryDate || "",
            chofer: order.assignedDriver || "",
            costoEnvio: order.shippingRealCost || 0,
            status: "Pendiente",
            remito: "",
            fotoEntrega: ""
        }];
        // Solo reemplazar si no había datos previos
        if (!order.entidadesFacturacion || order.entidadesFacturacion.length === 0) {
            order.entidadesFacturacion = initFact;
        } else {
            const newBoxes = chosenOpt.numberOfBoxes;
            const oldBoxes = _oldNumberOfBoxes || newBoxes;
            const newUnitPricePuro = Math.round((order.total - (order.shippingCharged || 0)) / (newBoxes || 1));
            const newShipping = order.shippingCharged || 0;

            if (order.entidadesFacturacion.length === 1) {
                // Una sola entidad: asignar todo
                const ef0 = order.entidadesFacturacion[0];
                ef0.cuit = cuit;
                ef0.cantidadCajas = newBoxes;
                ef0.montoCajas = order.total - newShipping;
                ef0.montoEnvio = ef0.montoEnvioOverride ? (ef0.montoEnvio || 0) : newShipping;
                ef0.montoEnvioOverride = ef0.montoEnvioOverride || false;
                ef0.monto = order.total;
            } else {
                // Múltiples entidades: rescalar proporcional y recalcular montos
                let remaining = newBoxes;
                order.entidadesFacturacion.forEach((ef, i) => {
                    if (i < order.entidadesFacturacion.length - 1) {
                        const newCajas = Math.max(1, Math.round((ef.cantidadCajas || 0) * newBoxes / oldBoxes));
                        ef.cantidadCajas = newCajas;
                        remaining -= newCajas;
                    } else {
                        // Última absorbe el redondeo
                        ef.cantidadCajas = Math.max(1, remaining);
                    }
                    ef.montoCajas = Math.round(ef.cantidadCajas * newUnitPricePuro);
                    ef.montoEnvio = ef.montoEnvioOverride
                        ? (ef.montoEnvio || 0)
                        : Math.round(newShipping * (ef.cantidadCajas / newBoxes));
                    ef.monto = ef.montoCajas + ef.montoEnvio;
                });
                app.showToast("Múltiples entidades de facturación rescaladas proporcionalmente. Revisá los montos en 'Facturación y Entregas'.", "info");
            }
        }
        if (!order.entregas || order.entregas.length === 0) {
            order.entregas = initEnt;
        } else {
            const newBoxes = chosenOpt.numberOfBoxes;
            const oldBoxes = _oldNumberOfBoxes || newBoxes;
            if (order.entregas.length === 1) {
                order.entregas[0].cantidadCajas = newBoxes;
            } else {
                // Múltiples entregas: rescalar proporcional
                let remaining = newBoxes;
                order.entregas.forEach((ent, i) => {
                    if (i < order.entregas.length - 1) {
                        const newCajas = Math.max(1, Math.round((ent.cantidadCajas || 0) * newBoxes / oldBoxes));
                        ent.cantidadCajas = newCajas;
                        remaining -= newCajas;
                    } else {
                        ent.cantidadCajas = Math.max(1, remaining);
                    }
                });
            }
        }

        // --- DESCUENTO DE STOCK (al confirmar, no al armar) ---
        // Si es re-confirmación, devolver primero el stock del compromiso anterior
        if (_hadStockDescontado) {
            const oldFlat = store.expandRecipe(_oldBoxRecipe, _oldNumberOfBoxes);
            for (const [prodId, qty] of Object.entries(oldFlat)) {
                const prod = store.products.find(p => p.id === prodId);
                if (prod) prod.stock += qty;
            }
        }
        // Descontar stock del nuevo compromiso — se permite stock negativo
        const newFlat = store.expandRecipe(order.boxRecipe, order.numberOfBoxes);
        const faltantesStock = [];
        for (const [prodId, qty] of Object.entries(newFlat)) {
            const prod = store.products.find(p => p.id === prodId);
            if (prod) {
                prod.stock -= qty;
                if (prod.stock < 0) {
                    faltantesStock.push({ name: prod.name, deficit: Math.abs(prod.stock) });
                }
            }
        }
        order.stockDescontado = true;

        app.logAction(order.id, `Pedido confirmado. Opción elegida: ${chosenOpt.name}. CUIT: ${cuit}. Stock descontado al confirmar.`);
        store.saveData();

        app.closeModal();
        if (faltantesStock.length > 0) {
            const lista = faltantesStock.slice(0, 4).map(f => `${f.name} (faltan ${f.deficit} u.)`).join(" | ");
            const sufijo = faltantesStock.length > 4 ? ` y ${faltantesStock.length - 4} más` : "";
            app.showToast(`⚠ Stock negativo: ${lista}${sufijo}. Revisá el Plan de Compras.`, "warning");
        } else {
            app.showToast(`¡Pedido confirmado! Opción '${chosenOpt.name}' activa. Configurá facturación y entregas si es necesario.`, "success");
        }
        this.renderActiveTab();
    }


    // --- MODAL DE COTIZACIÓN EXPANDIDA ---
    openQuoteModal(config = {}) {
        let order = null;
        let isEditing = false;
        let oldOrderCopy = null;

        if (this.editingOrderId) {
            order = store.orders.find(o => o.id === this.editingOrderId);
            if (order) {
                isEditing = true;
                oldOrderCopy = JSON.parse(JSON.stringify(order));
            }
        }
        if (config.orderId) {
            order = store.orders.find(o => o.id === config.orderId);
            isEditing = true;
        }

        this.activeCategory = "";
        this.catalogSearchQuery = "";
        this.activeOptionIndex = 0;
        
        // Cargar opciones en memoria para manipulación temporal
        if (isEditing && order && order.options && order.options.length > 0) {
            this.builderOptions = JSON.parse(JSON.stringify(order.options));
            this.builderOptions.forEach(opt => {
                if (opt.shippingAddress === undefined) opt.shippingAddress = order.deliveryAddress || "";
                if (opt.shippingLocation === undefined) opt.shippingLocation = order.deliveryLocation || "";
                if (opt.shippingProvince === undefined) opt.shippingProvince = order.deliveryProvince || "Córdoba";
            });
        } else {
            const tempRecipe = isEditing ? JSON.parse(JSON.stringify(order.boxRecipe)) : [];
            this.builderOptions = [{
                name: "Opción Estándar",
                boxRecipe: tempRecipe,
                unitPrice: isEditing ? (order.total / (order.numberOfBoxes || 1)) : 0,
                costUnit: isEditing ? (order.costEst / (order.numberOfBoxes || 1)) : 0,
                marginPercent: isEditing ? (order.costEst ? (((order.total / order.numberOfBoxes) / (order.costEst / order.numberOfBoxes)) - 1) * 100 : 40) : 40,
                total: isEditing ? order.total : 0,
                costEst: isEditing ? (order.costEst || 0) : 0,
                margin: isEditing ? (order.margin || 0) : 0,
                numberOfBoxes: isEditing ? (order.numberOfBoxes || 50) : 50,
                discountPercent: order && order.options && order.options[0] ? order.options[0].discountPercent || 0 : 0,
                discountName: order && order.options && order.options[0] ? order.options[0].discountName || "Descuento Comercial" : "Descuento Comercial",
                shippingRealCost: isEditing ? order.shippingRealCost || 0 : 0,
                shippingCharged: isEditing ? order.shippingCharged || 0 : 0,
                shippingBonificado: isEditing ? order.shippingBonificado || 0 : 0,
                shippingZone: isEditing ? order.shippingZone || "" : "",
                shippingCalcMode: isEditing ? order.shippingCalcMode || "manual" : "manual",
                shippingAddress: isEditing ? order.shippingAddress || order.deliveryAddress || "" : "",
                shippingLocation: isEditing ? order.shippingLocation || order.deliveryLocation || "" : "",
                shippingProvince: isEditing ? order.shippingProvince || order.deliveryProvince || "Córdoba" : "Córdoba"
            }];
        }

        const clientVal = order ? (order.clientName || "") : "";
        const cuitVal = order ? (order.cuit || "") : "";
        const addressVal = order ? (order.deliveryAddress || "") : "";
        const locationVal = order ? (order.deliveryLocation || "") : "";
        const deliveryDateVal = order ? (order.deliveryDate || "") : "";
        const leadIdVal = order ? (order.leadId || "") : (config.leadId || "");
        const salespersonVal = order ? (order.salesperson || "") : "";
        
        // Lógica de validez (10 días)
        const dateVal = order ? order.date : new Date().toISOString().split('T')[0];
        const statusVal = order ? order.status : "Presupuesto Enviado";
        let validUntilVal = order ? order.validUntil : "";
        if (!validUntilVal) {
            const d = new Date(dateVal);
            d.setDate(d.getDate() + 10);
            validUntilVal = d.toISOString().split('T')[0];
        }

        const opt = this.builderOptions[this.activeOptionIndex];
        const discountPercentVal = opt.discountPercent || 0;
        const discountNameVal = opt.discountName || "Descuento Comercial";
        this.builderItems = JSON.parse(JSON.stringify(opt.boxRecipe)); // Cargar items
        const initialBoxPrice = opt.unitPrice || Math.round(this.calculateUnitBoxPrice());
        const qtyBoxesVal = opt.numberOfBoxes;

        // HTML del modal expandido
        const html = `
            <div class="quote-builder-fullscreen" style="display: flex; flex-direction: column; height: calc(100vh - 80px); max-height: calc(100vh - 80px);">

                <!-- SECCIÓN ÚNICA: Receta (Left) y Formulario/Totales/Acciones (Right) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 15px 0; flex: 1; min-height: 0;">
                    <!-- Left: Composición de la Caja -->
                    <div class="quote-summary" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-sidebar); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-border); padding-bottom:6px; margin-bottom:8px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <h3 style="margin:0; font-size:0.95rem; color:var(--color-blue); font-weight:700;">Composición de la Caja</h3>
                                <button type="button" onclick="salesModule.openProductSelector()"
                                        style="background:var(--color-red); color:white; border:none; padding:4px 10px; border-radius:4px; font-size:0.73rem; font-weight:700; cursor:pointer; white-space:nowrap;">
                                    + Seleccionar Artículos
                                </button>
                            </div>
                            <!-- Pestañas de múltiples opciones -->
                            <div style="display:flex; gap:6px; flex-wrap:wrap;" id="builder-options-container">
                                <!-- Inyectado dinámicamente -->
                            </div>
                        </div>

                        <div style="flex-grow: 1; overflow-y: auto; border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:6px; background:white;">
                            <table style="width:100%; font-size:0.75rem;" id="table-builder-recipe">
                                <thead>
                                    <tr style="border-bottom: 1px solid var(--color-border); text-align: left; font-weight: bold; background: rgba(0,0,0,0.02);">
                                        <th style="width:25px; text-align:center; padding: 4px;">Orden</th>
                                        <th style="padding: 4px; width: 30%;">Detalle Insumo</th>
                                        <th style="width:75px; text-align:right; padding: 4px;">Costo</th>
                                        <th style="width:85px; text-align:center; padding: 4px;">Margen</th>
                                        <th style="width:75px; text-align:right; padding: 4px;">Precio</th>
                                        <th style="width:50px; text-align:center; padding: 4px;">Cant</th>
                                        <th style="width:85px; text-align:right; padding: 4px;">Subtotal</th>
                                        <th style="width:30px; text-align:center; padding: 4px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="recipe-items-tbody">
                                    <!-- Receta de 1 caja -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Right: Configuración, Totales y Acciones -->
                    <div class="quote-summary" style="height: 100%; display: flex; flex-direction: column; background: var(--bg-sidebar); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px; overflow-y: auto;">
                        <!-- Formulario de datos -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex-grow: 1; min-height: 0; overflow-y: auto;">
                            <!-- Columna Form Izquierda -->
                            <div>
                                <div class="form-group" style="margin-bottom:6px;">
                                    <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Nombre de la Opción *</label>
                                    <input type="text" id="builder-option-name-input" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${opt.name}" oninput="salesModule.changeActiveOptionName(this.value)">
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Precio Unitario ($) *</label>
                                        <input type="number" id="builder-unit-price-input" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${initialBoxPrice}" min="0">
                                    </div>
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Cant. Cajas *</label>
                                        <input type="number" id="builder-number-boxes" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${qtyBoxesVal}" min="1">
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 6px;">
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Logística y Envío *</label>
                                        <button type="button" id="btn-logistics-config" class="btn btn-secondary btn-sm" style="width: 100%; text-align: left; padding: 4px 8px; font-size: 0.75rem; display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid var(--color-border); height: 28px;" onclick="salesModule.openLogisticsModal()">
                                            <span id="txt-logistics-status" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:110px;">⚠️ Sin Calcular</span>
                                            <span>⚙️</span>
                                        </button>
                                    </div>
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Descuento %</label>
                                        <input type="number" id="builder-discount-percent" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${discountPercentVal}" min="0" max="100" step="0.5">
                                    </div>
                                </div>

                                <div class="form-group" style="margin-bottom:6px;">
                                    <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Nombre del Descuento</label>
                                    <input type="text" id="builder-discount-name" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${discountNameVal}">
                                </div>
                                
                                <div class="form-group" style="display:none !important;">
                                    <label>Costo de Fabricación Unitario (Caja)</label>
                                    <div id="builder-unit-cost">$ 0</div>
                                </div>
                            </div>

                            <!-- Columna Form Derecha -->
                            <div>
                                <div class="form-group" style="margin-bottom:6px;">
                                    <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Cliente *</label>
                                    <input type="text" id="builder-client-name" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${clientVal}" required>
                                    <input type="hidden" id="builder-lead-id" value="${leadIdVal}">
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Fecha Emisión *</label>
                                        <input type="date" id="quote-date" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${dateVal}" required>
                                    </div>
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Validez Oferta *</label>
                                        <input type="date" id="quote-valid-until" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${validUntilVal}" required>
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Estado *</label>
                                        <select id="quote-status" class="form-control" style="padding:4px 8px; font-size:0.75rem;">
                                            <option value="Presupuesto Enviado" ${statusVal === 'Presupuesto Enviado' ? 'selected' : ''}>Presupuesto Enviado</option>
                                            <option value="Confirmado" ${statusVal === 'Confirmado' ? 'selected' : ''}>Confirmado (Venta)</option>
                                            <option value="En Producción" ${statusVal === 'En Producción' ? 'selected' : ''}>En Producción</option>
                                            <option value="Listo para Despacho" ${statusVal === 'Listo para Despacho' ? 'selected' : ''}>Listo para Despacho</option>
                                            <option value="Despachado" ${statusVal === 'Despachado' ? 'selected' : ''}>Despachado</option>
                                            <option value="Entregado" ${statusVal === 'Entregado' ? 'selected' : ''}>Entregado</option>
                                            <option value="Cerrado" ${statusVal === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
                                            <option value="Cancelado" ${statusVal === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                                        </select>
                                    </div>
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Fecha Entrega</label>
                                        <input type="date" id="builder-delivery-date" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${deliveryDateVal}">
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 6px;">
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Vendedor Responsable *</label>
                                        <select id="builder-salesperson" class="form-control" style="padding:4px 8px; font-size:0.75rem;" required>
                                            <option value="">-- Seleccione Vendedor --</option>
                                            <option value="Carlos E. Juncos" ${salespersonVal === 'Carlos E. Juncos' ? 'selected' : ''}>Carlos E. Juncos</option>
                                            <option value="Carlitos Juncos" ${salespersonVal === 'Carlitos Juncos' ? 'selected' : ''}>Carlitos Juncos</option>
                                            <option value="Trinidad Juncos" ${salespersonVal === 'Trinidad Juncos' ? 'selected' : ''}>Trinidad Juncos</option>
                                            <option value="Agustín Juncos" ${salespersonVal === 'Agustín Juncos' ? 'selected' : ''}>Agustín Juncos</option>
                                            <option value="Víctor Zárate" ${salespersonVal === 'Víctor Zárate' ? 'selected' : ''}>Víctor Zárate</option>
                                        </select>
                                    </div>
                                    <div class="form-group" style="margin-bottom:6px;">
                                        <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">CUIT</label>
                                        <input type="text" id="builder-cuit" class="form-control" style="padding:4px 8px; font-size:0.75rem;" value="${cuitVal}" placeholder="30-XXXXXXX-X">
                                    </div>
                                </div>

                                <div class="form-group" style="margin-bottom:6px;">
                                    <label style="margin-bottom: 2px; font-size: 0.75rem; font-weight: 600;">Dirección / Localidad / Prov.</label>
                                    <div style="display: flex; gap: 4px;">
                                        <input type="text" id="builder-delivery-address" class="form-control" style="padding:4px 8px; font-size:0.75rem; flex: 1.8;" value="${addressVal}" placeholder="Dirección">
                                        <input type="text" id="builder-delivery-location" class="form-control" style="padding:4px 8px; font-size:0.75rem; flex: 1.2;" value="${locationVal}" placeholder="Localidad">
                                        <select id="builder-delivery-province" class="form-control" style="padding:4px 8px; font-size:0.75rem; flex: 1;">
                                            <option value="Córdoba" ${order && order.deliveryProvince === 'Córdoba' ? 'selected' : ''}>Córdoba</option>
                                            <option value="Buenos Aires" ${order && order.deliveryProvince === 'Buenos Aires' ? 'selected' : ''}>Buenos Aires</option>
                                            <option value="CABA" ${order && order.deliveryProvince === 'CABA' ? 'selected' : ''}>CABA</option>
                                            <option value="Santa Fe" ${order && order.deliveryProvince === 'Santa Fe' ? 'selected' : ''}>Santa Fe</option>
                                            <option value="Mendoza" ${order && order.deliveryProvince === 'Mendoza' ? 'selected' : ''}>Mendoza</option>
                                            <option value="Otro" ${order && (order.deliveryProvince !== 'Córdoba' && order.deliveryProvince !== 'Buenos Aires' && order.deliveryProvince !== 'CABA' && order.deliveryProvince !== 'Santa Fe' && order.deliveryProvince !== 'Mendoza') ? 'selected' : ''}>Otro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Resumen y Acciones -->
                        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px;">
                            <!-- Descuento y Totales -->
                            <div style="background:rgba(0,0,0,0.03); padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); font-size:0.8rem; display: flex; gap: 20px; align-items:center;">
                                <div style="display:flex; gap:6px;">
                                    <span>Subtotal:</span>
                                    <strong id="txt-subtotal-sale-boxes">$ 0</strong>
                                </div>
                                <div id="row-builder-discount" style="display:none; gap:6px; color: var(--color-red);">
                                    <span id="txt-discount-label">Descuento (0%):</span>
                                    <strong id="txt-discount-amount">-$ 0</strong>
                                </div>
                                <div style="display:flex; gap:8px; font-size:1rem; flex-grow:1; justify-content:flex-end;">
                                    <span style="color:var(--color-blue); font-weight:700;">PRECIO VENTA TOTAL OP:</span>
                                    <strong id="txt-total-sale-boxes" style="color:var(--color-gold); font-weight:800;">$ 0</strong>
                                </div>
                                
                                <div style="display:none !important; justify-content:space-between;">
                                    <span>Costo Insumos Total Op:</span>
                                    <span id="txt-total-cost-boxes">$ 0</span>
                                </div>
                                <div style="display:none !important; justify-content:space-between;">
                                    <span>Margen Op:</span>
                                    <span id="txt-total-margin">$ 0</span>
                                </div>
                            </div>

                            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; font-weight:bold; color:var(--color-text-muted);">
                                <span>Opciones de cotización: <span id="txt-total-options-count">1</span></span>
                            </div>

                            <div style="display:flex; gap: 8px; justify-content:flex-end;">
                                <button type="button" class="btn btn-primary btn-sm" onclick="salesModule.saveBuilderOrder('${order ? order.id : ''}')" style="padding: 8px 16px; font-size: 0.8rem; font-weight:600;">
                                    ${isEditing ? 'Guardar Cambios' : 'Generar Presupuesto'}
                                </button>
                                ${isEditing && order.status === 'Presupuesto Enviado' ? `
                                    <button type="button" class="btn btn-gold btn-sm" onclick="salesModule.confirmOrderFromBuilder('${order.id}')" style="padding: 8px 16px; font-size: 0.8rem; font-weight:600;">
                                        Confirmar Venta
                                    </button>
                                ` : ''}
                                <button type="button" class="btn btn-secondary btn-sm" onclick="app.closeModal()" style="padding: 8px 16px; font-size: 0.8rem; font-weight:600;">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Abrir modal gigante
        app.showModal(isEditing ? `Editar Presupuesto / Pedido #${order.id.substring(4)}` : "Nueva Cotización de Cajas", html, (body) => {
            // Asignar clase para hacerlo ventana pantalla completa
            document.getElementById("global-modal").classList.add("modal-fullscreen");
            
            // Renderizar pestañas de opciones iniciales
            this.renderOptionsTabs();
            // Renderizar pestañas y receta inicial
            this.renderRecipeItems();

            // Enlazar campos editables
            const priceInput          = document.getElementById("builder-unit-price-input");
            const boxesInput          = document.getElementById("builder-number-boxes");
            const discountPercentInput = document.getElementById("builder-discount-percent");
            const discountNameInput   = document.getElementById("builder-discount-name");

            priceInput.addEventListener("input",          () => this.updateBuilderTotals());
            boxesInput.addEventListener("input",          () => this.updateBuilderTotals());
            discountPercentInput.addEventListener("input", () => this.updateBuilderTotals());
            discountNameInput.addEventListener("input",    () => this.updateBuilderTotals());

            // Refrescar inicialmente
            this.updateBuilderTotals();
        });
    }

    renderOptionsTabs() {
        const container = document.getElementById("builder-options-container");
        if (!container) return;

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);

        let html = "";
        this.builderOptions.forEach((opt, idx) => {
            const isActive = idx === this.activeOptionIndex;
            const borderStyle = isActive
                ? "border-bottom: 3px solid var(--color-blue); background: var(--bg-primary);"
                : "border-bottom: 3px solid transparent; background: var(--bg-secondary);";
            html += `
                <div style="position:relative; display:inline-flex; align-items:center; margin-right:6px; margin-bottom:6px;">
                    <button type="button"
                            onclick="salesModule.switchOption(${idx})"
                            style="padding: 5px 12px; font-size:0.78rem; font-weight:${isActive ? '700' : '500'}; cursor:pointer; border:1px solid var(--color-border); border-radius:6px 6px 0 0; color:${isActive ? 'var(--color-blue)' : 'var(--color-text-muted)'}; ${borderStyle} white-space:nowrap;">
                        ${opt.name}${opt.total ? ' · ' + fmt(opt.total) : ''}
                    </button>
                    ${this.builderOptions.length > 1 ? `
                        <button type="button" onclick="salesModule.deleteOption(${idx})"
                                style="position:absolute; top:-6px; right:-6px; background:var(--color-red); color:white; border:none; border-radius:50%; width:14px; height:14px; font-size:8px; line-height:14px; text-align:center; cursor:pointer; padding:0; font-weight:bold;">
                            &times;
                        </button>
                    ` : ''}
                </div>
            `;
        });
        container.innerHTML = html;

        const countText = document.getElementById("txt-total-options-count");
        if (countText) countText.innerText = this.builderOptions.length;
    }

    addOption() {
        this.saveActiveOptionData();
        
        const newIndex = this.builderOptions.length;
        this.builderOptions.push({
            name: "Opción " + (newIndex + 1),
            boxRecipe: [],
            numberOfBoxes: 1,
            unitPrice: 0,
            marginPercent: 40,
            costUnit: 0,
            total: 0,
            costEst: 0,
            margin: 0
        });
        
        this.activeOptionIndex = newIndex;
        this.loadActiveOptionData();
        this.renderOptionsTabs();
        this.renderRecipeItems();
        this.updateBuilderTotals();
        
        // Foco en el nombre de la opción
        setTimeout(() => {
            const nameInput = document.getElementById("builder-option-name-input");
            if (nameInput) {
                nameInput.focus();
                nameInput.select();
            }
        }, 100);
    }

    switchOption(idx) {
        if (idx === this.activeOptionIndex) return;
        this.saveActiveOptionData();
        this.activeOptionIndex = idx;
        this.loadActiveOptionData();
        this.renderOptionsTabs();
        this.renderRecipeItems();
        this.updateBuilderTotals();
    }

    deleteOption(idx) {
        if (this.builderOptions.length <= 1) return;
        if (!confirm("¿Está seguro de eliminar esta opción de caja de la cotización?")) return;
        
        this.builderOptions.splice(idx, 1);
        if (this.activeOptionIndex >= this.builderOptions.length) {
            this.activeOptionIndex = this.builderOptions.length - 1;
        }
        this.loadActiveOptionData();
        this.renderOptionsTabs();
        this.renderRecipeItems();
        this.updateBuilderTotals();
    }

    saveActiveOptionData() {
        const opt = this.builderOptions[this.activeOptionIndex];
        if (!opt) return;
        
        opt.boxRecipe = JSON.parse(JSON.stringify(this.builderItems));
        
        const nameInput = document.getElementById("builder-option-name-input");
        const boxesInput = document.getElementById("builder-number-boxes");
        const priceInput = document.getElementById("builder-unit-price-input");
        const discountPercentEl = document.getElementById("builder-discount-percent");
        const discountNameEl = document.getElementById("builder-discount-name");
        
        if (nameInput) opt.name = nameInput.value;
        opt.numberOfBoxes = boxesInput ? parseInt(boxesInput.value) || 1 : 1;
        opt.unitPrice = priceInput ? parseFloat(priceInput.value) || 0 : 0;
        opt.discountPercent = discountPercentEl ? parseFloat(discountPercentEl.value) || 0 : 0;
        opt.discountName = discountNameEl ? discountNameEl.value.trim() : "Descuento Comercial";
        
        const addressEl = document.getElementById("builder-delivery-address");
        const locationEl = document.getElementById("builder-delivery-location");
        const provinceEl = document.getElementById("builder-delivery-province");
        if (addressEl) opt.shippingAddress = addressEl.value.trim();
        if (locationEl) opt.shippingLocation = locationEl.value.trim();
        if (provinceEl) opt.shippingProvince = provinceEl.value;
        
        const costUnit = this.calculateUnitBoxCost();
        opt.costUnit = costUnit;
        opt.marginPercent = costUnit ? (((opt.unitPrice / costUnit) - 1) * 100) : 40;
        
        const subtotal = opt.unitPrice * opt.numberOfBoxes;
        const discAmount = Math.round(subtotal * (opt.discountPercent / 100));
        opt.total = subtotal - discAmount + (opt.shippingCharged || 0);
        opt.costEst = costUnit * opt.numberOfBoxes;
        opt.margin = opt.total - opt.costEst;
    }

    loadActiveOptionData() {
        const opt = this.builderOptions[this.activeOptionIndex];
        if (!opt) return;
        
        this.builderItems = JSON.parse(JSON.stringify(opt.boxRecipe));
        
        const nameInput = document.getElementById("builder-option-name-input");
        if (nameInput) nameInput.value = opt.name;
        
        const boxesInput = document.getElementById("builder-number-boxes");
        if (boxesInput) boxesInput.value = opt.numberOfBoxes;
        
        const priceInput = document.getElementById("builder-unit-price-input");
        if (priceInput) priceInput.value = opt.unitPrice;
        
        const discountPercentEl = document.getElementById("builder-discount-percent");
        if (discountPercentEl) discountPercentEl.value = opt.discountPercent || 0;

        const discountNameEl = document.getElementById("builder-discount-name");
        if (discountNameEl) discountNameEl.value = opt.discountName || "Descuento Comercial";
    }

    changeActiveOptionName(val) {
        const opt = this.builderOptions[this.activeOptionIndex];
        if (opt) {
            opt.name = val;
            this.renderOptionsTabs();
        }
    }

    moveRecipeItem(index, direction) {
        const targetIndex = index + direction;
        if (targetIndex >= 0 && targetIndex < this.builderItems.length) {
            const temp = this.builderItems[index];
            this.builderItems[index] = this.builderItems[targetIndex];
            this.builderItems[targetIndex] = temp;
            
            this.renderRecipeItems();
            this.updateBuilderTotals();
        }
    }

    renderCategoriesList() {
        const list = document.getElementById("builder-category-list");
        if (!list) return;

        const categories = [...new Set(store.products.map(p => p.category))].sort();

        let html = `
            <button type="button" class="category-btn ${this.activeCategory === 'TODOS' ? 'active' : ''}"
                    onclick="salesModule.setBuilderCategory('TODOS')">
                TODOS
            </button>
        `;

        categories.forEach(cat => {
            html += `
                <button type="button" class="category-btn ${this.activeCategory === cat ? 'active' : ''}"
                        onclick="salesModule.setBuilderCategory('${cat}')">
                    ${cat}
                </button>
            `;
        });

        if (store.combos.length > 0) {
            html += `
                <div style="border-top:1px solid var(--color-border); margin:8px 0; padding-top:8px;">
                    <button type="button" class="category-btn ${this.activeCategory === '__COMBOS__' ? 'active' : ''}"
                            onclick="salesModule.setBuilderCategory('__COMBOS__')"
                            style="background:rgba(181,156,117,0.12); color:var(--color-gold); font-weight:700;">
                        📦 COMBOS
                    </button>
                </div>`;
        }

        list.innerHTML = html;
    }

    setBuilderCategory(catName) {
        this.activeCategory = catName;
        this.renderCategoriesList();
        this.renderCatalogProducts();
    }

    searchCatalog() {
        this.catalogSearchQuery = document.getElementById("builder-catalog-search").value;
        this.renderCatalogProducts();
    }

    renderCatalogProducts() {
        const grid = document.getElementById("builder-product-grid");
        if (!grid) return;
        grid.style.display = "block";
        grid.innerHTML = "";

        const categoryLabel = document.getElementById("builder-active-category-label");
        if (categoryLabel) categoryLabel.innerText = this.activeCategory === '__COMBOS__' ? 'COMBOS' : (this.activeCategory || 'TODOS');

        // Vista especial: lista de combos disponibles
        if (this.activeCategory === '__COMBOS__') {
            this._renderCombosInCatalog(grid);
            return;
        }

        let filtered = store.products;
        
        // Filtrar por categoría (solo si no es TODOS, y no hay búsqueda query activa)
        if (this.activeCategory && this.activeCategory !== 'TODOS' && !this.catalogSearchQuery) {
            filtered = filtered.filter(p => p.category === this.activeCategory);
        }
        
        if (this.catalogSearchQuery) {
            const q = this.catalogSearchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(q) || 
                (p.brand && p.brand.toLowerCase().includes(q)) ||
                (p.code && p.code.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="text-align:center; padding:40px; color:var(--color-text-muted);">No se encontraron productos.</div>`;
            return;
        }

        // Obtener la cantidad de cajas de la opción activa para el semáforo relativo al lote
        const boxesInput = document.getElementById("builder-number-boxes");
        const currentBoxesCount = boxesInput ? (parseInt(boxesInput.value) || 0) : 0;

        let html = `
            <div class="table-container" style="height: 100%; max-height: calc(100vh - 430px); overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; table-layout: fixed;">
                    <thead>
                        <tr style="background: rgba(0,0,0,0.05); border-bottom: 2px solid var(--color-border); text-align: left; font-weight: bold; position: sticky; top: 0; z-index: 10;">
                            <th style="padding: 8px 10px; width: 68%;">Artículo</th>
                            <th style="padding: 8px 10px; text-align: right; width: 14%;">Precio Sug.</th>
                            <th style="padding: 8px 10px; text-align: center; width: 10%;">Stock</th>
                            <th style="padding: 8px 10px; text-align: center; width: 8%;"></th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Renderizar los primeros 150 para no saturar la vista
        filtered.slice(0, 150).forEach(p => {
            const priceVal = p.price || p.cost * 1.4;
            const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(priceVal);
            
            // Semáforo dinámico de stock (basado en stock físico)
            let stockColor = "var(--color-green)"; // Verde por defecto (suficiente)
            if (p.stock <= 0) {
                stockColor = "var(--color-red)"; // Rojo (faltante)
            } else if (currentBoxesCount > 0 && p.stock < currentBoxesCount) {
                stockColor = "var(--color-gold)"; // Amarillo (bajo relativo al lote)
            } else if (p.stock < 50) {
                stockColor = "var(--color-gold)"; // Amarillo (bajo en general)
            }

            html += `
                <tr style="border-bottom: 1px solid var(--color-border);" class="catalog-row">
                    <td style="padding: 8px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.name}">
                        <span class="catalog-code-badge product-hover-code">${p.code}</span>
                        <strong>${p.name}</strong>
                    </td>
                    <td style="padding: 8px 10px; text-align: right; font-weight: 600;">${formattedPrice}</td>
                    <td style="padding: 8px 10px; text-align: center; font-weight: 700; color:${stockColor};">${p.stock}</td>
                    <td style="padding: 8px 10px; text-align: center;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="salesModule.addCatalogItemToRecipe('${p.id}')" style="padding: 3px 8px; font-size: 0.75rem; font-weight:600;">+</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
        grid.innerHTML = html;
    }

    // ─── SELECTOR DE ARTÍCULOS (overlay pantalla completa) ───────────────────

    openProductSelector() {
        this.saveActiveOptionData();

        // Estado persistente de selección — se mantiene a través de búsquedas y re-renders
        this._selectorSelectedIds = new Set(
            this.builderItems.filter(i => i.type === "product").map(i => i.id)
        );

        const overlay = document.createElement("div");
        overlay.id = "product-selector-overlay";
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg-main); z-index:10000; display:flex; flex-direction:column;";

        overlay.innerHTML = `
            <div style="display:flex; align-items:center; gap:16px; padding:12px 24px; background:var(--bg-sidebar); border-bottom:2px solid var(--color-border); flex-shrink:0;">
                <button type="button" onclick="salesModule.closeProductSelector()"
                        style="background:transparent; border:1px solid var(--color-border); padding:6px 14px; border-radius:6px; font-size:0.85rem; cursor:pointer; color:var(--color-text);">
                    ← Volver
                </button>
                <h2 style="margin:0; font-size:1rem; font-weight:700; color:var(--color-blue); flex:1;">Seleccionar Artículos</h2>
                <input type="text" id="selector-search" placeholder="🔍 Buscar por nombre o marca..."
                       oninput="salesModule.filterSelector(this.value)"
                       style="padding:7px 12px; border:1px solid var(--color-border); border-radius:6px; font-size:0.85rem; width:280px; outline:none; background:white;">
                <button type="button" onclick="salesModule.loadSelectedProducts()"
                        style="background:var(--color-red); color:white; border:none; padding:8px 20px; border-radius:6px; font-size:0.88rem; font-weight:700; cursor:pointer; white-space:nowrap;">
                    Cargar Artículos (<span id="selector-count">0</span>)
                </button>
            </div>
            <!-- Encabezado de columnas fijo -->
        <div style="display:flex; align-items:center; gap:14px; padding:6px 24px 6px 24px;
                    background:var(--bg-sidebar); border-bottom:1px solid var(--color-border);
                    font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;
                    color:var(--color-text-muted); flex-shrink:0;">
            <span style="width:16px; flex-shrink:0;"></span>
            <span style="flex:1;">Artículo</span>
            <span style="min-width:120px;">Marca</span>
            <span style="min-width:90px; text-align:right;">Costo unit.</span>
            <span style="min-width:90px; text-align:right;">Stock físico</span>
        </div>
        <div id="selector-product-list" style="flex:1; overflow-y:auto; padding:20px 24px;"></div>
        `;

        document.body.appendChild(overlay);
        this._renderSelectorProducts("");
    }

    closeProductSelector() {
        document.getElementById("product-selector-overlay")?.remove();
    }

    filterSelector(query) {
        // Guardar el estado actual de los checkboxes visibles antes de re-renderizar
        document.querySelectorAll(".selector-product-chk").forEach(chk => {
            if (chk.checked) {
                this._selectorSelectedIds.add(chk.value);
            } else {
                this._selectorSelectedIds.delete(chk.value);
            }
        });
        this._renderSelectorProducts(query);
    }

    _renderSelectorProducts(query, preSelectedIds = null) {
        // Usar el Set persistente si no se pasa uno explícito
        if (preSelectedIds === null) preSelectedIds = this._selectorSelectedIds ?? new Set();
        const listEl = document.getElementById("selector-product-list");
        if (!listEl) return;

        const q = (query || "").toLowerCase().trim();
        let filtered = store.products;
        if (q) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.brand    || "").toLowerCase().includes(q) ||
                (p.category || "").toLowerCase().includes(q)
            );
        }

        // Agrupar por categoría
        const grouped = {};
        filtered.forEach(p => {
            const cat = p.category || "Sin Categoría";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(p);
        });

        const sortedCats = Object.keys(grouped).sort();

        if (sortedCats.length === 0 && store.combos.length === 0) {
            listEl.innerHTML = `<div style="text-align:center; padding:60px; color:var(--color-text-muted); font-size:0.9rem;">Sin resultados para "${query}"</div>`;
            return;
        }

        const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
        const maxW = "860px";

        let html = `<div style="max-width:${maxW}; margin:0 auto;">`;

        // Sección COMBOS al inicio (solo si no hay búsqueda activa o coincide)
        const combosToShow = store.combos.filter(c =>
            !q || c.name.toLowerCase().includes(q)
        );
        if (combosToShow.length > 0) {
            html += `
                <div style="margin-bottom:32px;">
                    <h3 style="font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em;
                               color:var(--color-gold); border-bottom:2px solid var(--color-gold);
                               padding-bottom:6px; margin:0 0 10px 0;">
                        📦 COMBOS PREDEFINIDOS
                    </h3>
                    <div style="display:flex; flex-direction:column; gap:3px;">`;
            combosToShow.forEach(combo => {
                const cost = combo.items.reduce((s, ci) => {
                    const p = store.products.find(x => x.id === ci.prodId);
                    return s + (p ? p.cost * ci.qty : 0);
                }, 0);
                const itemCount = combo.items.reduce((s, ci) => s + ci.qty, 0);
                html += `
                    <div style="display:flex; align-items:center; gap:14px; padding:9px 14px; border-radius:6px;
                                border:1px solid var(--color-border); background:var(--bg-card);">
                        <span style="flex:1; font-size:0.875rem; font-weight:500;">${combo.name}</span>
                        <span style="font-size:0.78rem; color:var(--color-text-muted);">${itemCount} insumos</span>
                        <span style="font-size:0.875rem; font-weight:700; min-width:90px; text-align:right;">${fmt(cost)}</span>
                        <button type="button" onclick="salesModule.openComboPricingModal('${combo.id}')"
                                style="background:var(--color-gold); color:white; border:none; padding:5px 12px;
                                       border-radius:5px; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap;">
                            Configurar y Agregar
                        </button>
                    </div>`;
            });
            html += `    </div>
                </div>`;
        }
        sortedCats.forEach(cat => {
            html += `
                <div style="margin-bottom:32px;">
                    <h3 style="font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em;
                               color:var(--color-text-muted); border-bottom:2px solid var(--color-border);
                               padding-bottom:6px; margin:0 0 10px 0;">
                        ${cat}
                    </h3>
                    <div style="display:flex; flex-direction:column; gap:3px;">`;

            grouped[cat].forEach(p => {
                const checked = preSelectedIds.has(p.id) ? "checked" : "";
                const stock = p.stock ?? 0;
                const stockColor = stock < 0 ? 'var(--color-red)' : stock === 0 ? 'var(--color-text-muted)' : 'var(--color-green)';
                const stockLabel = stock < 0 ? `${stock} u. ⚠` : stock === 0 ? '0 u.' : `${stock} u.`;
                html += `
                    <label style="display:flex; align-items:center; gap:14px; padding:9px 14px; border-radius:6px;
                                  cursor:pointer; border:1px solid transparent; background:var(--bg-card);
                                  transition:border-color 0.12s;"
                           onmouseover="this.style.borderColor='var(--color-border)'"
                           onmouseout="this.style.borderColor='transparent'">
                        <input type="checkbox" value="${p.id}" class="selector-product-chk" ${checked}
                               style="width:16px; height:16px; accent-color:var(--color-red); cursor:pointer; flex-shrink:0;"
                               onchange="salesModule._updateSelectorCount()">
                        <span style="flex:1; font-size:0.875rem; font-weight:500; color:var(--color-text);">${p.name}</span>
                        <span style="font-size:0.78rem; color:var(--color-text-muted); min-width:120px;">${p.brand || ""}</span>
                        <span style="font-size:0.875rem; font-weight:700; color:var(--color-text); min-width:90px; text-align:right;">${fmt(p.cost)}</span>
                        <span style="font-size:0.82rem; font-weight:700; min-width:90px; text-align:right; color:${stockColor};">${stockLabel}</span>
                    </label>`;
            });

            html += `    </div>
                </div>`;
        });
        html += `</div>`;

        listEl.innerHTML = html;
        this._updateSelectorCount();
    }

    _updateSelectorCount() {
        // Sincronizar el Set persistente con los checkboxes visibles
        document.querySelectorAll(".selector-product-chk").forEach(chk => {
            if (chk.checked) {
                this._selectorSelectedIds.add(chk.value);
            } else {
                this._selectorSelectedIds.delete(chk.value);
            }
        });
        const el = document.getElementById("selector-count");
        if (el) el.innerText = this._selectorSelectedIds.size;
    }

    loadSelectedProducts() {
        // Sincronizar checkboxes visibles al Set antes de cargar
        document.querySelectorAll(".selector-product-chk").forEach(chk => {
            if (chk.checked) this._selectorSelectedIds.add(chk.value);
            else              this._selectorSelectedIds.delete(chk.value);
        });
        const checkedIds = this._selectorSelectedIds ?? new Set();

        // Eliminar de la receta los productos que se desmarcaron
        this.builderItems = this.builderItems.filter(item => {
            if (item.type !== "product") return true;
            return checkedIds.has(item.id);
        });

        // Agregar los productos nuevamente marcados que no estaban en la receta
        checkedIds.forEach(prodId => {
            const alreadyIn = this.builderItems.some(i => i.id === prodId && i.type === "product");
            if (alreadyIn) return;
            const prod = store.products.find(p => p.id === prodId);
            if (!prod) return;
            const defaultMargin = prod.price && prod.cost ? Math.round(((prod.price / prod.cost) - 1) * 100) : 40;
            this.builderItems.push({
                type: "product", id: prod.id, name: prod.name,
                qty: 1, cost: prod.cost,
                price: prod.price || Math.round(prod.cost * 1.4),
                margin: defaultMargin
            });
        });

        this.closeProductSelector();
        this.renderRecipeItems();
        this.triggerRecipeRecalculation();
        ui.showToast(`${checkedIds.size} artículo${checkedIds.size !== 1 ? "s" : ""} cargado${checkedIds.size !== 1 ? "s" : ""} en la receta`, "success");
    }

    // ─────────────────────────────────────────────────────────────────────────

    addCatalogItemToRecipe(prodId) {
        const prod = store.products.find(p => p.id === prodId);
        if (prod) {
            const existing = this.builderItems.find(item => item.id === prodId);
            if (existing) {
                existing.qty++;
            } else {
                const defaultMargin = prod.price ? Math.round(((prod.price / prod.cost) - 1) * 100) : 40;
                this.builderItems.push({
                    type: "product",
                    id: prod.id,
                    name: prod.name,
                    qty: 1,
                    price: prod.price || Math.round(prod.cost * 1.4),
                    cost: prod.cost,
                    margin: defaultMargin
                });
            }
            app.showToast("Insumo añadido a la receta", "success");
            this.renderRecipeItems();
            this.triggerRecipeRecalculation();
        }
    }

    // Renderiza los combos disponibles en el panel izquierdo del cotizador
    _renderCombosInCatalog(grid) {
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        if (store.combos.length === 0) {
            grid.innerHTML = `<div style="text-align:center; padding:40px; color:var(--color-text-muted);">No hay combos definidos todavía.<br>Creá uno en Inventario → Combos.</div>`;
            return;
        }

        let rows = "";
        store.combos.forEach(combo => {
            const totalCost = combo.items.reduce((sum, ci) => {
                const prod = store.products.find(p => p.id === ci.prodId);
                return sum + (prod ? prod.cost * ci.qty : 0);
            }, 0);
            const itemCount = combo.items.reduce((sum, ci) => sum + ci.qty, 0);

            rows += `<tr style="border-bottom:1px solid var(--color-border);">
                <td style="padding:8px 10px;">
                    <strong>${combo.name}</strong>
                    <br><span style="font-size:0.75rem; color:var(--color-text-muted);">${itemCount} insumos · Costo: ${fmt(totalCost)} (sin IVA)</span>
                </td>
                <td style="padding:8px 10px; text-align:center;">
                    <button type="button" class="btn btn-gold btn-sm" onclick="salesModule.openComboPricingModal('${combo.id}')"
                            style="padding:3px 10px; font-size:0.75rem; font-weight:600;">+ Agregar</button>
                </td>
            </tr>`;
        });

        grid.innerHTML = `
            <div class="table-container" style="height:100%; max-height:calc(100vh - 430px); overflow-y:auto; border:1px solid var(--color-border); border-radius:var(--radius-sm);">
                <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                    <thead>
                        <tr style="background:var(--bg-sidebar); border-bottom:2px solid var(--color-border); text-align:left; font-weight:bold; position:sticky; top:0; z-index:10;">
                            <th style="padding:8px 10px;">Combo</th>
                            <th style="padding:8px 10px; text-align:center; width:110px;">Acción</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    }

    // Muestra el formulario de precio del combo inline dentro del panel del catálogo.
    // No usa el modal global porque el cotizador ya corre dentro de él.
    openComboPricingModal(comboId) {
        const combo = store.combos.find(c => c.id === comboId);
        if (!combo) return;

        const totalCost = combo.items.reduce((sum, ci) => {
            const prod = store.products.find(p => p.id === ci.prodId);
            return sum + (prod ? prod.cost * ci.qty : 0);
        }, 0);

        if (totalCost === 0) {
            ui.showToast("El combo no tiene costos definidos. Revisá los insumos en Inventario.", "error");
            return;
        }

        this._comboPricing = { mode: "margen", totalCost, comboId };

        const fmt               = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
        const defaultMargin     = 40;
        const defaultFinalPrice = Math.round(totalCost * (1 + defaultMargin / 100));

        // Usar el overlay del selector si está abierto, sino el panel del catálogo legacy
        const grid = document.getElementById("selector-product-list") || document.getElementById("builder-product-grid");
        if (!grid) return;
        this._comboPricing.targetElId = grid.id;

        grid.innerHTML = `
            <div style="padding:16px; display:flex; flex-direction:column; gap:14px;">

                <!-- Encabezado -->
                <div style="display:flex; align-items:center; gap:10px;">
                    <button class="btn btn-secondary btn-sm" onclick="salesModule.cancelComboPricing()" style="padding:4px 10px;">← Volver</button>
                    <strong style="font-size:0.9rem;">${combo.name}</strong>
                </div>

                <!-- Costo base -->
                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:10px 14px; font-size:0.85rem;">
                    Costo total (sin IVA): <strong>${fmt(totalCost)}</strong>
                </div>

                <!-- Toggle de modo -->
                <div style="display:flex; border-radius:8px; overflow:hidden; border:2px solid #cc3636;">
                    <button id="btn-cp-margen"
                            onclick="salesModule.setComboPricingMode('margen')"
                            style="flex:1; background:#cc3636; color:#ffffff; border:none; padding:9px 12px; font-size:0.85rem; font-weight:700; cursor:pointer; line-height:1.2;">
                        Por Margen %
                    </button>
                    <button id="btn-cp-precio"
                            onclick="salesModule.setComboPricingMode('precioFinal')"
                            style="flex:1; background:#f4f1eb; color:#2d2720; border:none; border-left:2px solid #cc3636; padding:9px 12px; font-size:0.85rem; font-weight:600; cursor:pointer; line-height:1.2;">
                        Por Precio Final
                    </button>
                </div>

                <!-- Input dinámico según modo -->
                <div id="combo-pricing-input-area"></div>

                <!-- Preview -->
                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:10px 14px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; text-align:center;">
                    <div>
                        <div style="font-size:0.68rem; color:var(--color-text-muted); margin-bottom:2px;">PRECIO FINAL</div>
                        <div id="cp-preview-price" style="font-size:0.95rem; font-weight:700; color:var(--color-gold);">${fmt(defaultFinalPrice)}</div>
                    </div>
                    <div>
                        <div style="font-size:0.68rem; color:var(--color-text-muted); margin-bottom:2px;">MARGEN EQUIV.</div>
                        <div id="cp-preview-margin" style="font-size:0.95rem; font-weight:700; color:var(--color-green);">${defaultMargin}%</div>
                    </div>
                    <div>
                        <div style="font-size:0.68rem; color:var(--color-text-muted); margin-bottom:2px;">FACTOR</div>
                        <div id="cp-preview-factor" style="font-size:0.95rem; font-weight:700;">×${(1 + defaultMargin / 100).toFixed(2)}</div>
                    </div>
                </div>

                <button class="btn btn-primary" onclick="salesModule.confirmComboPricing()" style="width:100%; padding:10px; font-size:0.9rem; font-weight:600;">
                    Cargar al cotizador
                </button>
            </div>
        `;

        this._updateComboPricingInputArea(defaultMargin, defaultFinalPrice);
    }

    // Restaura la vista anterior sin aplicar cambios
    cancelComboPricing() {
        const targetId = this._comboPricing?.targetElId;
        this._comboPricing = null;
        if (targetId === "selector-product-list") {
            this._renderSelectorProducts("");
        } else {
            this._renderCombosInCatalog(document.getElementById("builder-product-grid"));
        }
    }

    // Cambia el modo (margen ↔ precio final) leyendo el preview actual para pre-llenar el input
    setComboPricingMode(mode) {
        this._comboPricing.mode = mode;

        const btnMargen = document.getElementById("btn-cp-margen");
        const btnPrecio = document.getElementById("btn-cp-precio");
        const activeStyle   = "flex:1; background:#cc3636; color:#ffffff; border:none; padding:9px 12px; font-size:0.85rem; font-weight:700; cursor:pointer; line-height:1.2;";
        const inactiveStyle = "flex:1; background:#f4f1eb; color:#2d2720; border:none; padding:9px 12px; font-size:0.85rem; font-weight:600; cursor:pointer; line-height:1.2;";
        if (btnMargen) { btnMargen.className = ""; btnMargen.style.cssText = mode === "margen"      ? activeStyle : inactiveStyle; }
        if (btnPrecio) { btnPrecio.className = ""; btnPrecio.style.cssText = (mode === "precioFinal" ? activeStyle : inactiveStyle) + " border-left:2px solid #cc3636;"; }

        const { totalCost }   = this._comboPricing;
        const previewMarginEl = document.getElementById("cp-preview-margin");
        const previewPriceEl  = document.getElementById("cp-preview-price");
        const currentMargin   = parseFloat(previewMarginEl?.innerText) || 40;
        const currentPrice    = parseFloat(previewPriceEl?.innerText?.replace(/\D/g, "")) || Math.round(totalCost * 1.4);

        this._updateComboPricingInputArea(currentMargin, currentPrice);
    }

    _updateComboPricingInputArea(margin, finalPrice) {
        const area = document.getElementById("combo-pricing-input-area");
        if (!area) return;
        const { mode } = this._comboPricing;

        if (mode === "margen") {
            area.innerHTML = `
                <div class="form-group" style="margin:0;">
                    <label style="font-size:0.78rem; font-weight:600;">Margen de ganancia (%)</label>
                    <input type="number" id="combo-pricing-value" class="form-control" value="${margin}"
                           min="0" step="0.5" style="font-size:1rem; padding:8px 10px;"
                           oninput="salesModule.onComboPricingInput()">
                </div>`;
        } else {
            area.innerHTML = `
                <div class="form-group" style="margin:0;">
                    <label style="font-size:0.78rem; font-weight:600;">Precio final de venta (sin IVA) $</label>
                    <input type="number" id="combo-pricing-value" class="form-control" value="${finalPrice}"
                           min="1" step="1" style="font-size:1rem; padding:8px 10px;"
                           oninput="salesModule.onComboPricingInput()">
                </div>`;
        }
        this.onComboPricingInput();
    }

    // Recalcula el preview en tiempo real
    onComboPricingInput() {
        if (!this._comboPricing) return;
        const { mode, totalCost } = this._comboPricing;
        const val = parseFloat(document.getElementById("combo-pricing-value")?.value) || 0;
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        let factor, margin, finalPrice;
        if (mode === "margen") {
            factor     = 1 + val / 100;
            margin     = val;
            finalPrice = Math.round(totalCost * factor);
        } else {
            finalPrice = val;
            factor     = val > 0 ? val / totalCost : 0;
            margin     = Math.round((factor - 1) * 100);
        }

        const priceEl  = document.getElementById("cp-preview-price");
        const marginEl = document.getElementById("cp-preview-margin");
        const factorEl = document.getElementById("cp-preview-factor");
        if (priceEl)  priceEl.innerText  = fmt(finalPrice);
        if (marginEl) { marginEl.innerText = `${margin}%`; marginEl.style.color = margin < 20 ? "var(--color-red)" : margin < 35 ? "var(--color-gold)" : "var(--color-green)"; }
        if (factorEl) factorEl.innerText  = `×${factor.toFixed(2)}`;
    }

    // Lee el input, valida y llama a addComboToRecipe con el factor calculado
    confirmComboPricing() {
        if (!this._comboPricing) return;
        const { mode, totalCost, comboId } = this._comboPricing;
        const val = parseFloat(document.getElementById("combo-pricing-value")?.value) || 0;

        if (mode === "margen"     && val < 0)  { ui.showToast("El margen no puede ser negativo", "error"); return; }
        if (mode === "precioFinal" && val <= 0) { ui.showToast("El precio final debe ser mayor a cero", "error"); return; }

        const factor           = mode === "margen" ? (1 + val / 100) : (val / totalCost);
        const targetTotalPrice = mode === "precioFinal" ? val : null;

        const targetId = this._comboPricing.targetElId;
        this._comboPricing = null;
        this.addComboToRecipe(comboId, factor, targetTotalPrice);

        // Si vino desde el overlay selector, cerrarlo; si no, restaurar catálogo de combos
        if (targetId === "selector-product-list") {
            this.closeProductSelector();
        } else {
            const grid = document.getElementById("builder-product-grid");
            if (grid) this._renderCombosInCatalog(grid);
        }
    }

    // Expande el combo en la opción activa aplicando el factor calculado.
    // Si se pasa targetTotalPrice, el último ítem absorbe la diferencia de redondeo (Opción A).
    addComboToRecipe(comboId, factor, targetTotalPrice = null) {
        const combo = store.combos.find(c => c.id === comboId);
        if (!combo) return;

        // 1. Construir items con precios calculados por factor
        const newItems = [];
        combo.items.forEach(ci => {
            const prod = store.products.find(p => p.id === ci.prodId);
            if (!prod) return;
            const price  = Math.round(prod.cost * factor);
            const margin = Math.round((factor - 1) * 100);
            newItems.push({ type: "product", id: prod.id, name: prod.name, qty: ci.qty, cost: prod.cost, price, margin });
        });

        // 2. Ajuste de redondeo en el último ítem (Opción A) — solo en modo precio final
        if (targetTotalPrice !== null && newItems.length > 0) {
            const sumBeforeAdj = newItems.reduce((s, i) => s + i.price * i.qty, 0);
            const diff         = targetTotalPrice - sumBeforeAdj;
            if (diff !== 0) {
                const last   = newItems[newItems.length - 1];
                last.price   = Math.round(last.price + diff / last.qty);
                last.margin  = last.cost > 0 ? Math.round(((last.price / last.cost) - 1) * 100) : last.margin;
            }
        }

        // 3. Reemplazar receta y nombre de la opción activa
        this.builderItems = newItems;
        const opt = this.builderOptions[this.activeOptionIndex];
        if (opt) opt.name = combo.name;
        const nameInput = document.getElementById("builder-option-name-input");
        if (nameInput) nameInput.value = combo.name;

        app.showToast(`Combo "${combo.name}" cargado al cotizador`, "success");
        this.renderRecipeItems();
        this.triggerRecipeRecalculation();
    }

    removeRecipeItem(index) {
        this.builderItems.splice(index, 1);
        this.renderRecipeItems();
        this.triggerRecipeRecalculation();
    }

    changeRecipeQty(index, qty) {
        if (qty < 1) return;
        this.builderItems[index].qty = qty;
        
        const marginVal = this.builderItems[index].margin !== undefined ? this.builderItems[index].margin : 40;
        const price = Math.round(this.builderItems[index].cost * (1 + marginVal / 100));
        const subtotal = price * qty;
        
        const subtotalCell = document.getElementById(`recipe-item-subtotal-${index}`);
        if (subtotalCell) subtotalCell.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(subtotal);
        
        const boxPrice = this.calculateUnitBoxPrice();
        const priceInput = document.getElementById("builder-unit-price-input");
        if (priceInput) priceInput.value = boxPrice;

        this.updateBuilderTotals();
    }

    changeRecipeItemMargin(index, margin) {
        if (this.builderItems[index]) {
            this.builderItems[index].margin = isNaN(margin) ? 0 : margin;
            const price = Math.round(this.builderItems[index].cost * (1 + this.builderItems[index].margin / 100));
            this.builderItems[index].price = price;
            
            // Recalcular subtotal de la fila
            const subtotal = price * this.builderItems[index].qty;
            
            // Actualizar celdas del DOM
            const priceCell = document.getElementById(`recipe-item-price-${index}`);
            if (priceCell) priceCell.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
            
            const subtotalCell = document.getElementById(`recipe-item-subtotal-${index}`);
            if (subtotalCell) subtotalCell.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(subtotal);
            
            // Recalcular precio sugerido de la caja
            const boxPrice = this.calculateUnitBoxPrice();
            const priceInput = document.getElementById("builder-unit-price-input");
            if (priceInput) priceInput.value = boxPrice;

            this.updateBuilderTotals();
        }
    }

    triggerRecipeRecalculation() {
        const price = this.calculateUnitBoxPrice();
        const priceInput = document.getElementById("builder-unit-price-input");
        if (priceInput) priceInput.value = price;

        this.updateBuilderTotals();
    }

    renderRecipeItems() {
        const tbody = document.getElementById("recipe-items-tbody");
        tbody.innerHTML = "";

        if (this.builderItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--color-text-muted); padding:20px;">Caja vacía. Agrega insumos de la izquierda.</td></tr>`;
            return;
        }

        this.builderItems.forEach((item, index) => {
            const marginVal = item.margin !== undefined ? item.margin : 40;
            const priceVal = item.cost * (1 + marginVal / 100);
            item.price = Math.round(priceVal); // Mantener en sincronía

            const costFormatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(item.cost);
            const priceFormatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(item.price);
            const subtotalFormatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(item.price * item.qty);
            
            // Botones de reordenamiento
            const upBtn = index > 0 ? `<button type="button" class="btn btn-secondary btn-sm" onclick="salesModule.moveRecipeItem(${index}, -1)" style="padding:1px 4px; font-size:0.65rem; border:none; background:transparent;">▲</button>` : '';
            const downBtn = index < this.builderItems.length - 1 ? `<button type="button" class="btn btn-secondary btn-sm" onclick="salesModule.moveRecipeItem(${index}, 1)" style="padding:1px 4px; font-size:0.65rem; border:none; background:transparent;">▼</button>` : '';

            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid var(--color-border);">
                    <td style="padding:4px 0; text-align:center; display:flex; flex-direction:column; align-items:center; gap:2px;">
                        ${upBtn}
                        ${downBtn}
                    </td>
                    <td style="padding:4px; max-width: 140px; white-space: normal; word-break: break-word;"><strong>${item.name}</strong></td>
                    <td style="padding:4px; text-align:right;">${costFormatted}</td>
                    <td style="padding:4px; text-align:center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                            <input type="number" class="form-control" style="width: 50px; padding: 2px 4px; font-size:0.75rem; text-align:center;" value="${marginVal}" min="-100" step="1" 
                                   oninput="salesModule.changeRecipeItemMargin(${index}, parseFloat(this.value))">
                            <span style="font-size:0.75rem;">%</span>
                        </div>
                    </td>
                    <td style="padding:4px; text-align:right;" id="recipe-item-price-${index}">${priceFormatted}</td>
                    <td style="padding:4px;">
                        <input type="number" class="form-control" style="width: 45px; padding: 2px 4px; font-size:0.75rem; text-align:center;" value="${item.qty}" min="1" 
                               oninput="salesModule.changeRecipeQty(${index}, parseInt(this.value))">
                    </td>
                    <td style="padding:4px; text-align:right; font-weight:600; color:var(--color-text);" id="recipe-item-subtotal-${index}">${subtotalFormatted}</td>
                    <td style="padding:4px; text-align:right;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="salesModule.removeRecipeItem(${index})" style="color: var(--color-red); padding: 2px 6px; border:none; background:transparent; font-size:1.15rem;">&times;</button>
                    </td>
                </tr>
            `;
        });
    }

    calculateUnitBoxCost() {
        let boxCost = 0;
        this.builderItems.forEach(item => {
            boxCost += (item.cost * item.qty);
        });
        return boxCost;
    }

    calculateUnitBoxPrice() {
        let boxPrice = 0;
        this.builderItems.forEach(item => {
            const marginVal = item.margin !== undefined ? item.margin : 40;
            const itemPrice = Math.round(item.cost * (1 + marginVal / 100));
            boxPrice += (itemPrice * item.qty);
        });
        return Math.round(boxPrice);
    }

    updateBuilderTotals() {
        const costUnit = this.calculateUnitBoxCost();
        const costEl = document.getElementById("builder-unit-cost");
        if (costEl) costEl.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(costUnit);

        const priceUnit = parseFloat(document.getElementById("builder-unit-price-input").value) || 0;
        const numBoxes = parseInt(document.getElementById("builder-number-boxes").value) || 1;

        // Descuento
        const discountPercentEl = document.getElementById("builder-discount-percent");
        const discountPercent = discountPercentEl ? parseFloat(discountPercentEl.value) || 0 : 0;
        
        const discountNameEl = document.getElementById("builder-discount-name");
        const discountName = discountNameEl ? discountNameEl.value.trim() : "Descuento Comercial";

        const opt = this.builderOptions[this.activeOptionIndex];
        const shippingCost = opt ? opt.shippingCharged || 0 : 0;
        
        // Actualizar texto del botón de logística
        const btnStatus = document.getElementById("txt-logistics-status");
        if (btnStatus && opt) {
            if (opt.shippingZone) {
                btnStatus.innerText = `${opt.shippingZone} - $${Math.round(opt.shippingCharged).toLocaleString('es-AR')}`;
                btnStatus.title = `${opt.shippingZone} - Cobrado: $${Math.round(opt.shippingCharged).toLocaleString('es-AR')}`;
            } else {
                btnStatus.innerText = `⚠️ Sin Calcular`;
            }
        }

        const subtotalVenta = (priceUnit * numBoxes);
        const discountAmount = Math.round(subtotalVenta * (discountPercent / 100));
        const totalVenta = subtotalVenta - discountAmount + shippingCost;
        
        const totalCosto = costUnit * numBoxes;
        const totalMargen = totalVenta - totalCosto;

        const subtotalEl = document.getElementById("txt-subtotal-sale-boxes");
        if (subtotalEl) subtotalEl.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(subtotalVenta);

        const discountRowEl = document.getElementById("row-builder-discount");
        if (discountRowEl) {
            if (discountPercent > 0) {
                discountRowEl.style.display = "flex";
                document.getElementById("txt-discount-label").innerText = `${discountName} (${discountPercent}%):`;
                document.getElementById("txt-discount-amount").innerText = `-${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(discountAmount)}`;
            } else {
                discountRowEl.style.display = "none";
            }
        }

        const costTotalEl = document.getElementById("txt-total-cost-boxes");
        if (costTotalEl) costTotalEl.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalCosto);
        
        const saleTotalEl = document.getElementById("txt-total-sale-boxes");
        if (saleTotalEl) saleTotalEl.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalVenta);
        
        const marginTotalEl = document.getElementById("txt-total-margin");
        if (marginTotalEl) marginTotalEl.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalMargen);
    }

    saveBuilderOrder(orderId = "") {
        this.saveActiveOptionData();

        // VALIDACIÓN LOGÍSTICA OBLIGATORIA
        const activeOpt = this.builderOptions[this.activeOptionIndex];
        const addressVal = document.getElementById("builder-delivery-address")?.value.trim() || "";
        const locationVal = document.getElementById("builder-delivery-location")?.value.trim() || "";
        const provinceVal = document.getElementById("builder-delivery-province")?.value || "";
        const boxesVal = parseInt(document.getElementById("builder-number-boxes")?.value) || 0;

        if (!activeOpt.shippingZone || 
            activeOpt.shippingAddress !== addressVal || 
            activeOpt.shippingLocation !== locationVal || 
            activeOpt.shippingProvince !== provinceVal ||
            activeOpt.numberOfBoxes !== boxesVal) {
            
            app.showToast("Debe calcular/configurar el costo logístico de la opción actual antes de guardar.", "warning");
            this.openLogisticsModal(null, () => {
                this.saveBuilderOrder(orderId);
            });
            return;
        }

        const clientNameEl = document.getElementById("builder-client-name");
        const cuitEl = document.getElementById("builder-cuit");
        const dateEl = document.getElementById("quote-date");
        const validUntilEl = document.getElementById("quote-valid-until");
        const deliveryLocationEl = document.getElementById("builder-delivery-location");
        const deliveryAddressEl = document.getElementById("builder-delivery-address");
        const deliveryProvinceEl = document.getElementById("builder-delivery-province");
        const deliveryDateEl = document.getElementById("builder-delivery-date");
        const statusEl = document.getElementById("quote-status");
        const leadIdEl = document.getElementById("builder-lead-id");
        const salespersonEl = document.getElementById("builder-salesperson");

        const clientName = clientNameEl ? clientNameEl.value : "";
        const cuit = cuitEl ? cuitEl.value : "";
        const date = dateEl ? dateEl.value : "";
        const validUntil = validUntilEl ? validUntilEl.value : "";
        const deliveryLocation = deliveryLocationEl ? deliveryLocationEl.value : "";
        const deliveryAddress = deliveryAddressEl ? deliveryAddressEl.value : "";
        const deliveryProvince = deliveryProvinceEl ? deliveryProvinceEl.value : "Córdoba";
        const deliveryDate = deliveryDateEl ? deliveryDateEl.value : "";
        const status = statusEl ? statusEl.value : "Presupuesto Enviado";
        const leadId = leadIdEl ? leadIdEl.value : "";
        const salesperson = salespersonEl ? salespersonEl.value : "";

        if (!clientName) {
            app.showToast("El Nombre del Cliente es obligatorio.", "error");
            return;
        }

        if (!salesperson) {
            app.showToast("El Vendedor Responsable es obligatorio.", "error");
            return;
        }

        if (status === "Confirmado" && !cuit) {
            app.showToast("Para guardar como venta 'Confirmada', el CUIT es un campo obligatorio.", "error");
            return;
        }

        // Validar que cada opción tenga productos
        let invalidOption = false;
        this.builderOptions.forEach(opt => {
            if (opt.boxRecipe.length === 0) {
                invalidOption = true;
            }
        });
        if (invalidOption) {
            app.showToast("Cada opción de caja debe contener al menos un producto.", "error");
            return;
        }

        // Obtener datos de la opción activa para establecer como campos principales de la orden
        const total = activeOpt.total;
        const costEst = activeOpt.costEst;
        const margin = activeOpt.margin;
        const numberOfBoxes = activeOpt.numberOfBoxes;
        const boxRecipe = activeOpt.boxRecipe;

        if (orderId) {
            const order = store.orders.find(o => o.id === orderId);
            if (order) {
                let logText = `Presupuesto editado (Opciones: ${this.builderOptions.length}). Opción Activa: ${activeOpt.name}, Cajas: ${numberOfBoxes}`;
                if (order.status !== status) logText += `, Estado cambió a ${status}`;
                if (cuit && order.cuit !== cuit) logText += `, CUIT asignado: ${cuit}`;

                order.clientName = clientName;
                order.cuit = cuit;
                order.date = date;
                order.validUntil = validUntil;
                order.deliveryLocation = deliveryLocation;
                order.deliveryAddress = deliveryAddress;
                order.deliveryProvince = deliveryProvince;
                order.deliveryDate = deliveryDate;
                order.status = status;
                order.salesperson = salesperson;
                
                // Copiar campos logísticos
                order.shippingRealCost = activeOpt.shippingRealCost || 0;
                order.shippingCharged = activeOpt.shippingCharged || 0;
                order.shippingBonificado = activeOpt.shippingBonificado || 0;
                order.shippingZone = activeOpt.shippingZone || "";
                order.shippingCalcMode = activeOpt.shippingCalcMode || "manual";
                order.shippingAddress = activeOpt.shippingAddress || deliveryAddress;
                order.shippingLocation = activeOpt.shippingLocation || deliveryLocation;
                order.shippingProvince = activeOpt.shippingProvince || deliveryProvince;
                
                // Guardar la estructura de múltiples opciones
                order.options = JSON.parse(JSON.stringify(this.builderOptions));
                
                // Mirror del activo para compatibilidad de los otros módulos
                order.numberOfBoxes = numberOfBoxes;
                order.boxRecipe = JSON.parse(JSON.stringify(boxRecipe));
                order.items = this.expandRecipeToItemsList(boxRecipe);
                order.total = total;
                order.costEst = costEst;
                order.margin = margin;

                if (status === "Confirmado" && (!order.scheduledInvoices || order.scheduledInvoices.length === 0)) {
                    order.scheduledInvoices = [{
                        id: "task_" + order.id.substring(4) + "_1",
                        desc: `Factura inicial (100% de la venta - ${activeOpt.name})`,
                        date: new Date().toISOString().split('T')[0],
                        percent: 100,
                        amount: total,
                        status: "Pendiente",
                        ref: ""
                    }];
                }

                app.logAction(order.id, logText);
                app.showToast("Cotización guardada correctamente.", "success");
            }
        } else {
            const newOrderId = "ord_" + Date.now();
            const newDisplayId = store.generateOrderDisplayId(date);
            const initScheduledInvoices = status === "Confirmado" ? [{
                id: "task_" + newOrderId.substring(4) + "_1",
                desc: `Factura inicial (100% de la venta - ${activeOpt.name})`,
                date: new Date().toISOString().split('T')[0],
                percent: 100,
                amount: total,
                status: "Pendiente",
                ref: ""
            }] : [];

            const newOrder = {
                id: newOrderId,
                displayId: newDisplayId,
                leadId,
                clientName,
                cuit,
                date,
                validUntil,
                numberOfBoxes,
                options: JSON.parse(JSON.stringify(this.builderOptions)),
                boxRecipe: JSON.parse(JSON.stringify(boxRecipe)),
                items: this.expandRecipeToItemsList(boxRecipe),
                total,
                costEst,
                margin,
                status,
                deliveryDate,
                deliveryAddress,
                deliveryLocation,
                deliveryProvince,
                assignedDriver: "",
                invoiceStatus: "No Facturado",
                paymentStatus: "Impago",
                payments: [],
                assemblyStatus: "Pendiente",
                assemblyPhoto: "",
                signedRemitoPhoto: "",
                salesperson,
                shippingRealCost: activeOpt.shippingRealCost || 0,
                shippingCharged: activeOpt.shippingCharged || 0,
                shippingBonificado: activeOpt.shippingBonificado || 0,
                shippingZone: activeOpt.shippingZone || "",
                shippingCalcMode: activeOpt.shippingCalcMode || "manual",
                shippingAddress: activeOpt.shippingAddress || deliveryAddress,
                shippingLocation: activeOpt.shippingLocation || deliveryLocation,
                shippingProvince: activeOpt.shippingProvince || deliveryProvince,
                scheduledInvoices: initScheduledInvoices,
                // Nuevos campos: armado, facturación y entregas
                armado: { cajasArmadas: 0, fotoArmado: null, sesiones: [] },
                entidadesFacturacion: [{
                    id: `ef_${newOrderId}_1`,
                    razonSocial: clientName,
                    cuit: cuit,
                    cantidadCajas: numberOfBoxes,
                    montoCajas: total - (activeOpt.shippingCharged || 0),
                    montoEnvio: activeOpt.shippingCharged || 0,
                    montoEnvioOverride: false,
                    monto: total,
                    pagos: [],
                    facturas: JSON.parse(JSON.stringify(initScheduledInvoices)),
                    cobrosProgramados: [],
                    contactoFacturacion: {}
                }],
                entregas: [{
                    id: `ent_${newOrderId}_1`,
                    cantidadCajas: numberOfBoxes,
                    direccion: deliveryAddress,
                    localidad: deliveryLocation,
                    provincia: deliveryProvince || "Córdoba",
                    fechaEntrega: deliveryDate,
                    chofer: "",
                    costoEnvio: activeOpt.shippingRealCost || 0,
                    status: "Pendiente",
                    remito: "",
                    fotoEntrega: ""
                }],
                history: [
                    { date: new Date().toISOString(), user: `${app.currentUser} (${app.currentRole})`, action: "Creación del presupuesto con múltiples opciones." }
                ]
            };
            store.orders.push(newOrder);
            app.showToast("Presupuesto guardado con éxito", "success");
        }

        store.saveData();
        
        const globalModal = document.getElementById("global-modal");
        if (globalModal) {
            globalModal.classList.remove("modal-lg");
        }
        app.closeModal();
        this.renderActiveTab();
    }

    expandRecipeToItemsList(recipe) {
        // Compatibilidad con otros módulos que esperan la lista total multiplicada
        // o esperan el listado de ítems plano
        return recipe.map(item => ({
            type: "product",
            id: item.id,
            name: item.name,
            qty: item.qty, // Mantenemos unitario, los módulos multiplicarán por order.numberOfBoxes
            price: item.price,
            cost: item.cost
        }));
    }

    confirmOrderFromBuilder(orderId) {
        this.saveActiveOptionData();
        this.saveBuilderOrder(orderId);
        setTimeout(() => {
            this.openConfirmationModal(orderId);
        }, 150);
    }


    // ─── MODAL FACTURACIÓN Y ENTREGAS ────────────────────────────────────────
    openBillingDeliveryModal(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
        const total = order.numberOfBoxes || 0;

        const provinces = ["Córdoba","Buenos Aires","CABA","Santa Fe","Mendoza","Salta","Entre Ríos","Tucumán","Misiones","Chaco","Corrientes","Santiago del Estero","San Juan","Jujuy","Río Negro","Neuquén","Formosa","Chubut","San Luis","Catamarca","La Rioja","La Pampa","Santa Cruz","Tierra del Fuego"];
        const provinceOpts = provinces.map(p => `<option value="${p}">${p}</option>`).join("");

        const unitPricePuro = Math.round((order.total - (order.shippingCharged || 0)) / (order.numberOfBoxes || 1));
        const shippingCharged = order.shippingCharged || 0;
        const fmtN = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);

        const buildEntidadRow = (ef, idx) => {
            const cajasEf = ef.cantidadCajas || 0;
            const montoCajasEf = Math.round(cajasEf * unitPricePuro);
            const montoEnvioEf = ef.montoEnvioOverride ? (ef.montoEnvio || 0) : Math.round(shippingCharged * (cajasEf / (order.numberOfBoxes || 1)));
            const totalEf = montoCajasEf + montoEnvioEf;
            return `
            <div class="ef-row" data-ef-id="${ef.id}" style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:10px; margin-bottom:8px;">
                <div style="display:grid; grid-template-columns:2fr 1.4fr 0.8fr 0.9fr 0.9fr 1fr auto; gap:8px; align-items:end;">
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Razón Social</label>
                        <input type="text" class="form-control ef-razon" style="font-size:0.8rem; padding:5px 8px;" value="${ef.razonSocial || ''}" placeholder="Nombre legal de la empresa">
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">CUIT</label>
                        <input type="text" class="form-control ef-cuit" style="font-size:0.8rem; padding:5px 8px;" value="${ef.cuit || ''}" placeholder="30-XXXXXXX-X">
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Cajas</label>
                        <input type="number" class="form-control ef-cajas" style="font-size:0.8rem; padding:5px 8px;" value="${cajasEf}" min="1" oninput="salesModule._updateBillingValidation('${orderId}'); salesModule._recalcEfAmounts('${orderId}')">
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px; color:var(--color-text-muted);">Subtotal cajas</label>
                        <div class="ef-montocajas" style="font-size:0.8rem; padding:5px 8px; background:var(--bg-main); border:1px solid var(--color-border); border-radius:4px; color:var(--color-text-muted);">${fmtN(montoCajasEf)}</div>
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px; color:var(--color-text-muted);">Envío</label>
                        <div class="ef-montoenvio" style="font-size:0.8rem; padding:5px 8px; background:var(--bg-main); border:1px solid var(--color-border); border-radius:4px; color:var(--color-text-muted);">${fmtN(montoEnvioEf)}</div>
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Total entidad</label>
                        <div class="ef-total" style="font-size:0.8rem; padding:5px 8px; background:var(--bg-main); border:1px solid var(--color-border); border-radius:4px; font-weight:600;">${fmtN(totalEf)}</div>
                    </div>
                    <button type="button" onclick="salesModule._removeBillingRow(this)" style="background:var(--color-red); color:white; border:none; border-radius:4px; padding:4px 8px; font-size:0.75rem; cursor:pointer; white-space:nowrap; align-self:end;">&times; Quitar</button>
                </div>
            </div>`;
        };

        const buildEntregaRow = (ent, idx) => `
            <div class="ent-row" data-ent-id="${ent.id}" style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:10px; margin-bottom:8px;">
                <div style="display:grid; grid-template-columns:0.8fr 1.2fr 1fr 1fr 0.9fr 0.8fr auto; gap:8px; align-items:end;">
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Cajas</label>
                        <input type="number" class="form-control ent-cajas" style="font-size:0.8rem; padding:5px 8px;" value="${ent.cantidadCajas || 0}" min="1" oninput="salesModule._updateDeliveryValidation('${orderId}')">
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Dirección</label>
                        <input type="text" class="form-control ent-dir" style="font-size:0.8rem; padding:5px 8px;" value="${ent.direccion || ''}" placeholder="Calle y número">
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Localidad</label>
                        <input type="text" class="form-control ent-loc" style="font-size:0.8rem; padding:5px 8px;" value="${ent.localidad || ''}" placeholder="Ciudad">
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Provincia</label>
                        <select class="form-control ent-prov" style="font-size:0.8rem; padding:5px 8px;">
                            ${provinces.map(p => `<option value="${p}" ${ent.provincia === p ? 'selected' : ''}>${p}</option>`).join("")}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Fecha Entrega</label>
                        <input type="date" class="form-control ent-fecha" style="font-size:0.8rem; padding:5px 8px;" value="${ent.fechaEntrega || ''}">
                    </div>
                    <div>
                        <label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Costo Envío</label>
                        <input type="number" class="form-control ent-costo" style="font-size:0.8rem; padding:5px 8px;" value="${ent.costoEnvio || 0}" min="0">
                    </div>
                    <button type="button" onclick="salesModule._removeDeliveryRow(this)" style="background:var(--color-red); color:white; border:none; border-radius:4px; padding:4px 8px; font-size:0.75rem; cursor:pointer; white-space:nowrap; align-self:end;">&times; Quitar</button>
                </div>
            </div>`;

        const efRows = (order.entidadesFacturacion || []).map((ef, i) => buildEntidadRow(ef, i)).join("");
        const entRows = (order.entregas || []).map((ent, i) => buildEntregaRow(ent, i)).join("");

        const html = `
            <div style="font-size:0.82rem; color:var(--color-text-muted); margin-bottom:16px;">
                Pedido: <strong>${order.displayId || order.id}</strong> —
                Cliente: <strong>${esc(order.clientName)}</strong> —
                Total cajas: <strong>${total}</strong> —
                Total venta: <strong>${fmt(order.total)}</strong>
                ${shippingCharged > 0 ? `— Envío cobrado: <strong style="color:var(--color-gold);">${fmtN(shippingCharged)}</strong>` : '— <span style="color:var(--color-green);">Envío bonificado</span>'}
            </div>

            <!-- FACTURACIÓN -->
            <div style="margin-bottom:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4 style="margin:0; color:var(--color-blue); font-size:0.95rem;">Entidades de Facturación</h4>
                    <button type="button" onclick="salesModule._addBillingRow('${orderId}')" class="btn btn-secondary btn-sm">+ Agregar Entidad</button>
                </div>
                <div id="ef-rows-container">${efRows}</div>
                <div id="ef-validation" style="font-size:0.8rem; font-weight:600; padding:6px 10px; border-radius:4px; display:none;"></div>
            </div>

            <!-- ENTREGAS -->
            <div style="margin-bottom:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4 style="margin:0; color:var(--color-blue); font-size:0.95rem;">Entregas</h4>
                    <button type="button" onclick="salesModule._addDeliveryRow('${orderId}')" class="btn btn-secondary btn-sm">+ Agregar Entrega</button>
                </div>
                <div id="ent-rows-container">${entRows}</div>
                <div id="ent-validation" style="font-size:0.8rem; font-weight:600; padding:6px 10px; border-radius:4px; display:none;"></div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
                <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="salesModule.saveBillingDelivery('${orderId}')">Guardar Cambios</button>
            </div>
        `;

        app.showModal(`Facturación y Entregas — ${order.displayId || order.id}`, html, () => {
            this._updateBillingValidation(orderId);
            this._updateDeliveryValidation(orderId);
        });
    }

    _addBillingRow(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const newId = `ef_${orderId}_${Date.now()}`;
        const row = document.createElement("div");
        row.className = "ef-row";
        row.dataset.efId = newId;
        row.style.cssText = "background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:10px; margin-bottom:8px;";
        row.innerHTML = `
            <div style="display:grid; grid-template-columns:2fr 1.4fr 0.8fr 0.9fr 0.9fr 1fr auto; gap:8px; align-items:end;">
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Razón Social</label>
                    <input type="text" class="form-control ef-razon" style="font-size:0.8rem; padding:5px 8px;" placeholder="Nombre legal de la empresa"></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">CUIT</label>
                    <input type="text" class="form-control ef-cuit" style="font-size:0.8rem; padding:5px 8px;" placeholder="30-XXXXXXX-X"></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Cajas</label>
                    <input type="number" class="form-control ef-cajas" style="font-size:0.8rem; padding:5px 8px;" value="0" min="1" oninput="salesModule._updateBillingValidation('${orderId}'); salesModule._recalcEfAmounts('${orderId}')"></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px; color:var(--color-text-muted);">Subtotal cajas</label>
                    <div class="ef-montocajas" style="font-size:0.8rem; padding:5px 8px; background:var(--bg-main); border:1px solid var(--color-border); border-radius:4px; color:var(--color-text-muted);">$0</div></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px; color:var(--color-text-muted);">Envío</label>
                    <div class="ef-montoenvio" style="font-size:0.8rem; padding:5px 8px; background:var(--bg-main); border:1px solid var(--color-border); border-radius:4px; color:var(--color-text-muted);">$0</div></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Total entidad</label>
                    <div class="ef-total" style="font-size:0.8rem; padding:5px 8px; background:var(--bg-main); border:1px solid var(--color-border); border-radius:4px; font-weight:600;">$0</div></div>
                <button type="button" onclick="salesModule._removeBillingRow(this)" style="background:var(--color-red); color:white; border:none; border-radius:4px; padding:4px 8px; font-size:0.75rem; cursor:pointer; white-space:nowrap; align-self:end;">&times; Quitar</button>
            </div>`;
        document.getElementById("ef-rows-container").appendChild(row);
        this._updateBillingValidation(orderId);
        this._recalcEfAmounts(orderId);
    }

    _recalcEfAmounts(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const unitPricePuro = Math.round((order.total - (order.shippingCharged || 0)) / (order.numberOfBoxes || 1));
        const shippingCharged = order.shippingCharged || 0;
        const totalBoxes = order.numberOfBoxes || 1;
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);
        document.querySelectorAll("#ef-rows-container .ef-row").forEach(row => {
            const cajas = parseInt(row.querySelector(".ef-cajas")?.value) || 0;
            const montoCajas = Math.round(cajas * unitPricePuro);
            const montoEnvio = Math.round(shippingCharged * (cajas / totalBoxes));
            const totalEf = montoCajas + montoEnvio;
            const mcEl = row.querySelector(".ef-montocajas");
            const meEl = row.querySelector(".ef-montoenvio");
            const totEl = row.querySelector(".ef-total");
            if (mcEl) mcEl.textContent = fmt(montoCajas);
            if (meEl) meEl.textContent = fmt(montoEnvio);
            if (totEl) totEl.textContent = fmt(totalEf);
        });
    }

    _removeBillingRow(btn) {
        const row = btn.closest(".ef-row");
        if (!row) return;
        const container = document.getElementById("ef-rows-container");
        if (container && container.querySelectorAll(".ef-row").length <= 1) {
            app.showToast("Debe haber al menos una entidad de facturación.", "warning");
            return;
        }
        row.remove();
    }

    _addDeliveryRow(orderId) {
        const provinces = ["Córdoba","Buenos Aires","CABA","Santa Fe","Mendoza","Salta","Entre Ríos","Tucumán","Misiones","Chaco","Corrientes","Santiago del Estero","San Juan","Jujuy","Río Negro","Neuquén","Formosa","Chubut","San Luis","Catamarca","La Rioja","La Pampa","Santa Cruz","Tierra del Fuego"];
        const newId = `ent_${orderId}_${Date.now()}`;
        const row = document.createElement("div");
        row.className = "ent-row";
        row.dataset.entId = newId;
        row.style.cssText = "background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:10px; margin-bottom:8px;";
        row.innerHTML = `
            <div style="display:grid; grid-template-columns:0.8fr 1.2fr 1fr 1fr 0.9fr 0.8fr auto; gap:8px; align-items:end;">
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Cajas</label>
                    <input type="number" class="form-control ent-cajas" style="font-size:0.8rem; padding:5px 8px;" value="0" min="1" oninput="salesModule._updateDeliveryValidation('${orderId}')"></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Dirección</label>
                    <input type="text" class="form-control ent-dir" style="font-size:0.8rem; padding:5px 8px;" placeholder="Calle y número"></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Localidad</label>
                    <input type="text" class="form-control ent-loc" style="font-size:0.8rem; padding:5px 8px;" placeholder="Ciudad"></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Provincia</label>
                    <select class="form-control ent-prov" style="font-size:0.8rem; padding:5px 8px;">
                        ${provinces.map(p => `<option value="${p}">${p}</option>`).join("")}
                    </select></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Fecha Entrega</label>
                    <input type="date" class="form-control ent-fecha" style="font-size:0.8rem; padding:5px 8px;"></div>
                <div><label style="font-size:0.72rem; font-weight:600; display:block; margin-bottom:3px;">Costo Envío</label>
                    <input type="number" class="form-control ent-costo" style="font-size:0.8rem; padding:5px 8px;" value="0" min="0"></div>
                <button type="button" onclick="salesModule._removeDeliveryRow(this)" style="background:var(--color-red); color:white; border:none; border-radius:4px; padding:4px 8px; font-size:0.75rem; cursor:pointer; white-space:nowrap; align-self:end;">&times; Quitar</button>
            </div>`;
        document.getElementById("ent-rows-container").appendChild(row);
        this._updateDeliveryValidation(orderId);
    }

    _removeDeliveryRow(btn) {
        const row = btn.closest(".ent-row");
        if (!row) return;
        const container = document.getElementById("ent-rows-container");
        if (container && container.querySelectorAll(".ent-row").length <= 1) {
            app.showToast("Debe haber al menos una entrega.", "warning");
            return;
        }
        row.remove();
    }

    _updateBillingValidation(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const total = order.numberOfBoxes || 0;
        const rows = document.querySelectorAll("#ef-rows-container .ef-row");
        const sumCajas = Array.from(rows).reduce((s, row) => s + (parseInt(row.querySelector(".ef-cajas")?.value) || 0), 0);
        const el = document.getElementById("ef-validation");
        if (!el) return;
        el.style.display = "block";
        if (sumCajas === total) {
            el.style.background = "#e6f9f0"; el.style.color = "var(--color-green)"; el.style.border = "1px solid var(--color-green)";
            el.textContent = `✓ Total correcto: ${sumCajas} / ${total} cajas`;
        } else {
            el.style.background = "#fff3f3"; el.style.color = "var(--color-red)"; el.style.border = "1px solid var(--color-red)";
            el.textContent = `⚠ Suma incorrecta: ${sumCajas} / ${total} cajas — diferencia: ${sumCajas - total > 0 ? '+' : ''}${sumCajas - total}`;
        }
    }

    _updateDeliveryValidation(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const total = order.numberOfBoxes || 0;
        const rows = document.querySelectorAll("#ent-rows-container .ent-row");
        const sumCajas = Array.from(rows).reduce((s, row) => s + (parseInt(row.querySelector(".ent-cajas")?.value) || 0), 0);
        const el = document.getElementById("ent-validation");
        if (!el) return;
        el.style.display = "block";
        if (sumCajas === total) {
            el.style.background = "#e6f9f0"; el.style.color = "var(--color-green)"; el.style.border = "1px solid var(--color-green)";
            el.textContent = `✓ Total correcto: ${sumCajas} / ${total} cajas`;
        } else {
            el.style.background = "#fff3f3"; el.style.color = "var(--color-red)"; el.style.border = "1px solid var(--color-red)";
            el.textContent = `⚠ Suma incorrecta: ${sumCajas} / ${total} cajas — diferencia: ${sumCajas - total > 0 ? '+' : ''}${sumCajas - total}`;
        }
    }

    saveBillingDelivery(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;

        const total = order.numberOfBoxes || 0;

        // Leer entidades de facturación — montos calculados automáticamente desde cajas
        const efRows = document.querySelectorAll("#ef-rows-container .ef-row");
        const unitPricePuro = Math.round((order.total - (order.shippingCharged || 0)) / (order.numberOfBoxes || 1));
        const shippingCharged = order.shippingCharged || 0;
        const newEntidades = Array.from(efRows).map(row => {
            const existingEf = (order.entidadesFacturacion || []).find(ef => ef.id === row.dataset.efId) || {};
            const cantidadCajas = parseInt(row.querySelector(".ef-cajas")?.value) || 0;
            const montoCajas = Math.round(cantidadCajas * unitPricePuro);
            // Si el usuario tenía un override manual, preservarlo; sino proporcional automático
            const montoEnvioOverride = existingEf.montoEnvioOverride || false;
            const montoEnvio = montoEnvioOverride
                ? (existingEf.montoEnvio || 0)
                : Math.round(shippingCharged * (cantidadCajas / (order.numberOfBoxes || 1)));
            return {
                id: row.dataset.efId || `ef_${orderId}_${Date.now()}`,
                razonSocial: row.querySelector(".ef-razon")?.value.trim() || "",
                cuit: row.querySelector(".ef-cuit")?.value.trim() || "",
                cantidadCajas,
                montoCajas,
                montoEnvio,
                montoEnvioOverride,
                monto: montoCajas + montoEnvio,
                pagos: existingEf.pagos || [],
                facturas: existingEf.facturas || [],
                cobrosProgramados: existingEf.cobrosProgramados || [],
                contactoFacturacion: existingEf.contactoFacturacion || {}
            };
        });

        // Leer entregas
        const entRows = document.querySelectorAll("#ent-rows-container .ent-row");
        const newEntregas = Array.from(entRows).map(row => {
            const existing = (order.entregas || []).find(e => e.id === row.dataset.entId) || {};
            return {
                id: row.dataset.entId || `ent_${orderId}_${Date.now()}`,
                cantidadCajas: parseInt(row.querySelector(".ent-cajas")?.value) || 0,
                direccion: row.querySelector(".ent-dir")?.value.trim() || "",
                localidad: row.querySelector(".ent-loc")?.value.trim() || "",
                provincia: row.querySelector(".ent-prov")?.value || "Córdoba",
                fechaEntrega: row.querySelector(".ent-fecha")?.value || "",
                chofer: existing.chofer || "",
                costoEnvio: parseFloat(row.querySelector(".ent-costo")?.value) || 0,
                status: existing.status || "Pendiente",
                remito: existing.remito || "",
                fotoEntrega: existing.fotoEntrega || ""
            };
        });

        // Validar sumas
        const sumEf = newEntidades.reduce((s, e) => s + e.cantidadCajas, 0);
        const sumEnt = newEntregas.reduce((s, e) => s + e.cantidadCajas, 0);

        if (sumEf !== total) {
            app.showToast(`La suma de cajas en facturación (${sumEf}) no coincide con el total del pedido (${total}).`, "error");
            return;
        }
        if (sumEnt !== total) {
            app.showToast(`La suma de cajas en entregas (${sumEnt}) no coincide con el total del pedido (${total}).`, "error");
            return;
        }

        order.entidadesFacturacion = newEntidades;
        order.entregas = newEntregas;

        // Sincronizar campos legacy con la primera entrega (compatibilidad otros módulos)
        if (newEntregas.length === 1) {
            order.deliveryAddress = newEntregas[0].direccion;
            order.deliveryLocation = newEntregas[0].localidad;
            order.deliveryDate = newEntregas[0].fechaEntrega;
        }

        app.logAction(order.id, `Facturación y entregas actualizadas. ${newEntidades.length} entidad(es), ${newEntregas.length} entrega(s).`);
        store.saveData();
        app.closeModal();
        app.showToast("Facturación y entregas guardadas.", "success");
        this.renderQuotesTable(document.getElementById("pedidos-content-area") || document.getElementById("main-content"));
    }

    // --- MODAL DE SELECCIÓN DE EXPORTACIÓN (EXCEL / PDF) CON BRANDING ---
    openExportModal(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) {
            app.showToast("Cotización no encontrada", "error");
            return;
        }

        const html = `
            <form onsubmit="salesModule.executeExport(event, '${order.id}')">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="font-weight: 600;">Seleccione la Identidad de Marca:</label>
                    <select id="export-brand" class="form-control" style="padding: 6px 10px;">
                        <option value="navidad">Navidad y Empresas (Poppins / Azul y Verde)</option>
                        <option value="golosinas">Golosinas y Comestibles (Baloo Tamma 2 / Violeta y Teal)</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 600;">Seleccione el Formato:</label>
                    <select id="export-format" class="form-control" style="padding: 6px 10px;">
                        <option value="excel">Microsoft Excel (.xls)</option>
                        <option value="pdf">Propuesta Comercial Imprimible (PDF)</option>
                    </select>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Generar Propuesta</button>
                </div>
            </form>
        `;

        app.showModal(`Exportar Propuesta Comercial - Cotización #${order.id.substring(4)}`, html);
    }

    executeExport(e, orderId) {
        e.preventDefault();
        const brand = document.getElementById("export-brand").value;
        const format = document.getElementById("export-format").value;

        app.closeModal();

        if (format === "excel") {
            this.exportQuoteToExcel(orderId, brand);
        } else {
            this.exportQuoteToPDF(orderId, brand);
        }
    }

    // --- EXPORTACIÓN DE PROPUESTA COMERCIAL EXCEL MULTI-OPCIÓN CON BRANDING DUAL ---
    exportQuoteToExcel(orderId, brand) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) {
            app.showToast("Pedido no encontrado", "error");
            return;
        }

        // Interceptar si no está calculado el costo logístico
        if (!order.shippingZone) {
            app.showToast("Costo logístico no calculado. Interceptando exportación...", "warning");
            this.openLogisticsModal({ orderId: orderId, optionIndex: 0 }, () => {
                this.exportQuoteToExcel(orderId, brand);
            });
            return;
        }

        const dateStr = new Date(order.date).toLocaleDateString("es-AR");
        const validStr = new Date(order.validUntil).toLocaleDateString("es-AR");

        // Configuración de branding
        let primaryColor, secondaryColor, fontFamily, brandTitle, logoSource;
        if (brand === "golosinas") {
            primaryColor = "#320a5a"; // violeta
            secondaryColor = "#005550"; // dark teal
            fontFamily = "'Baloo Tamma 2', Arial, sans-serif";
            brandTitle = "GOLOSINAS Y COMESTIBLES";
            logoSource = window.LOGO_GOLOSINAS_Y_COMESTIBLES;
        } else {
            primaryColor = "#011b52"; // azul
            secondaryColor = "#2f7968"; // verde
            fontFamily = "'Poppins', Arial, sans-serif";
            brandTitle = "NAVIDAD Y EMPRESAS";
            logoSource = window.LOGO_NAVIDAD_Y_EMPRESAS;
        }

        // Si por alguna razón no tiene options, inicializar con la actual
        const optionsList = order.options && order.options.length > 0 ? order.options : [{
            name: "Opción 1",
            numberOfBoxes: order.numberOfBoxes || 1,
            boxRecipe: JSON.parse(JSON.stringify(order.boxRecipe)),
            unitPrice: order.total / (order.numberOfBoxes || 1),
            costUnit: order.costEst / (order.numberOfBoxes || 1),
            total: order.total,
            costEst: order.costEst,
            margin: order.margin,
            shippingRealCost: order.shippingRealCost || 0,
            shippingCharged: order.shippingCharged || 0,
            shippingBonificado: order.shippingBonificado || 0,
            shippingZone: order.shippingZone || "",
            shippingCalcMode: order.shippingCalcMode || "manual"
        }];

        // Renderizar secuencialmente todas las opciones
        let optionsTablesHtml = "";
        optionsList.forEach((opt, optIdx) => {
            let itemsHtml = "";
            let idx = 1;
            opt.boxRecipe.forEach(item => {
                const itemPriceTotal = (item.price || item.cost * 1.4) * item.qty;
                itemsHtml += `
                    <tr>
                        <td style="border: 1px solid #e6dfd3; padding: 8px; text-align: center; background-color: #ffffff;">${idx++}</td>
                        <td colspan="2" style="border: 1px solid #e6dfd3; padding: 8px; background-color: #ffffff;"><strong>${item.name}</strong></td>
                        <td class="integer" style="border: 1px solid #e6dfd3; padding: 8px; text-align: center; mso-number-format:'#\\,##0'; background-color: #ffffff;">${item.qty}</td>
                        <td class="currency" style="border: 1px solid #e6dfd3; padding: 8px; text-align: right; mso-number-format:'\\$#,##0'; background-color: #ffffff;">${Math.round(item.price || item.cost * 1.4)}</td>
                        <td class="currency" style="border: 1px solid #e6dfd3; padding: 8px; text-align: right; mso-number-format:'\\$#,##0'; background-color: #ffffff;">${Math.round(itemPriceTotal)}</td>
                    </tr>
                `;
            });

            const discountPercent = opt.discountPercent || 0;
            const subtotalVenta = opt.unitPrice * opt.numberOfBoxes;
            const discountAmount = Math.round(subtotalVenta * (discountPercent / 100));
            const shippingCharged = opt.shippingCharged || 0;
            const finalTotal = subtotalVenta - discountAmount + shippingCharged;
            
            let discountRowsExcel = "";
            if (discountPercent > 0) {
                discountRowsExcel = `
                <tr>
                    <td colspan="3" style="border: 1px solid #e6dfd3; background-color: #ffffff;"></td>
                    <td colspan="2" style="font-weight: bold; background-color: #f4f1eb; text-align: right; border: 1px solid #e6dfd3;">Subtotal (Sin IVA):</td>
                    <td class="currency" style="font-weight: bold; border: 1px solid #e6dfd3; mso-number-format:'\\$#,##0'; background-color: #ffffff;">${Math.round(subtotalVenta)}</td>
                </tr>
                <tr>
                    <td colspan="3" style="border: 1px solid #e6dfd3; background-color: #ffffff;"></td>
                    <td colspan="2" style="font-weight: bold; color: #cc0000; background-color: #f4f1eb; text-align: right; border: 1px solid #e6dfd3;">${opt.discountName || 'Descuento'} (${discountPercent}%):</td>
                    <td class="currency" style="font-weight: bold; color: #cc0000; border: 1px solid #e6dfd3; mso-number-format:'-\\$#,##0'; background-color: #ffffff;">${Math.round(discountAmount)}</td>
                </tr>
                `;
            } else {
                discountRowsExcel = `
                <tr>
                    <td colspan="3" style="border: 1px solid #e6dfd3; background-color: #ffffff;"></td>
                    <td colspan="2" style="font-weight: bold; background-color: #f4f1eb; text-align: right; border: 1px solid #e6dfd3;">Subtotal (Sin IVA):</td>
                    <td class="currency" style="font-weight: bold; border: 1px solid #e6dfd3; mso-number-format:'\\$#,##0'; background-color: #ffffff;">${Math.round(subtotalVenta)}</td>
                </tr>
                `;
            }

            if (shippingCharged > 0) {
                discountRowsExcel += `
                <tr>
                    <td colspan="3" style="border: 1px solid #e6dfd3; background-color: #ffffff;"></td>
                    <td colspan="2" style="font-weight: bold; background-color: #f4f1eb; text-align: right; border: 1px solid #e6dfd3;">Envío / Entrega:</td>
                    <td class="currency" style="font-weight: bold; border: 1px solid #e6dfd3; mso-number-format:'\\$#,##0'; background-color: #ffffff;">${Math.round(shippingCharged)}</td>
                </tr>
                `;
            }

            discountRowsExcel += `
            <tr>
                <td colspan="3" style="border: 1px solid #e6dfd3; background-color: #ffffff;"></td>
                <td colspan="2" style="font-weight: bold; background-color: #e2efda; text-align: right; border: 1px solid #e6dfd3;">Total Opción (Sin IVA):</td>
                <td class="currency" style="font-weight: bold; color: ${primaryColor}; border: 1px solid #e6dfd3; mso-number-format:'\\$#,##0'; background-color: #e2efda;">${Math.round(finalTotal)}</td>
            </tr>
            `;

            optionsTablesHtml += `
                <!-- OPCION ${optIdx + 1}: ${opt.name} -->
                <tr><td colspan="6" style="height: 15px; background-color: #ffffff;"></td></tr>
                <tr>
                    <td colspan="6" style="padding: 8px; font-family: ${fontFamily}; font-size: 11pt; background-color: ${secondaryColor}; color: #FFFFFF; font-weight: bold;">OPCIÓN ${optIdx + 1}: ${opt.name.toUpperCase()} (${opt.numberOfBoxes} Cajas)</td>
                </tr>
                <tr class="table-header" style="font-weight: bold; text-align: center;">
                    <td style="width: 40px; border: 1px solid #e6dfd3; background-color: ${primaryColor}; color: #FFFFFF;">Ítem</td>
                    <td colspan="2" style="width: 420px; border: 1px solid #e6dfd3; background-color: ${primaryColor}; color: #FFFFFF;">Descripción Insumo</td>
                    <td style="width: 70px; border: 1px solid #e6dfd3; background-color: ${primaryColor}; color: #FFFFFF;">Cant</td>
                    <td style="width: 120px; border: 1px solid #e6dfd3; background-color: ${primaryColor}; color: #FFFFFF;">Precio Unit. (Sin IVA)</td>
                    <td style="width: 120px; border: 1px solid #e6dfd3; background-color: ${primaryColor}; color: #FFFFFF;">Total Ítem (Sin IVA)</td>
                </tr>
                ${itemsHtml}
                
                <tr>
                    <td colspan="3" rowspan="2" valign="top" style="border: 1px solid #e6dfd3; padding: 8px; background-color: #ffffff; font-size: 8.5pt; color: #6e6559;">
                        <strong>Aclaración Impositiva (Opción ${optIdx + 1}):</strong><br>
                        Todos los precios unitarios y totales expresados en esta opción son netos y no incluyen el Impuesto al Valor Agregado (IVA).
                    </td>
                    <td colspan="2" style="font-weight: bold; background-color: #f4f1eb; text-align: right; border: 1px solid #e6dfd3;">Precio Venta Unitario (Caja - Sin IVA):</td>
                    <td class="currency" style="font-weight: bold; color: ${primaryColor}; border: 1px solid #e6dfd3; mso-number-format:'\\$#,##0'; background-color: #ffffff;">${Math.round(opt.unitPrice)}</td>
                </tr>
                <tr>
                    <td colspan="2" style="font-weight: bold; background-color: #f4f1eb; text-align: right; border: 1px solid #e6dfd3;">Cantidad de Cajas Presupuestadas:</td>
                    <td class="center" style="font-weight: bold; border: 1px solid #e6dfd3; mso-number-format:'#,##0'; background-color: #ffffff;">${opt.numberOfBoxes}</td>
                </tr>
                ${discountRowsExcel}
                <tr><td colspan="6" style="height: 15px; background-color: #ffffff;"></td></tr>
            `;
        });

        // Notas al pie configurables
        const footnotesText = store.settings.notasAlPie.replace(/\n/g, "<br>");
        const boundary = "----=_NextPart_NavidadYEmpresas";
        
        let base64Logo = "";
        if (logoSource && logoSource.includes("base64,")) {
            base64Logo = logoSource.split("base64,")[1];
        } else {
            base64Logo = logoSource || "";
        }

        const mhtmlHeader = [
            'MIME-Version: 1.0',
            `Content-Type: multipart/related; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/html; charset="utf-8"',
            'Content-Transfer-Encoding: 8bit',
            ''
        ].join('\r\n');

        const htmlBody = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: ${fontFamily}; color: #2d2720; background-color: #ffffff; }
                    .header-title { font-size: 16pt; font-weight: bold; color: ${primaryColor}; vertical-align: middle; }
                    .table-header { background-color: ${primaryColor}; color: #FFFFFF; font-weight: bold; text-align: center; }
                    .currency { mso-number-format: "\\$#,##0"; text-align: right; }
                    .integer { mso-number-format: "#,##0"; text-align: center; }
                    .center { text-align: center; }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <td colspan="1" style="height: 65px; vertical-align: middle; text-align: center; background-color: ${primaryColor};">
                            <img src="cid:logo_img" width="50" height="50" style="display:block;" />
                        </td>
                        <td colspan="5" class="header-title" align="left" valign="middle" style="height: 65px; padding-left: 10px; font-family: ${fontFamily}; background-color: ${primaryColor}; color: #FFFFFF;">
                            ${brandTitle}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="6" align="center" style="color: #b59c75; font-weight: bold; font-size: 11pt; font-family: ${fontFamily}; background-color: #ffffff;">
                            Propuesta Comercial de Cajas Corporativas (Precios Netos Sin IVA)
                        </td>
                    </tr>
                    
                    <tr><td colspan="6" style="height: 10px; background-color: #ffffff;"></td></tr>
                    
                    <tr style="font-weight: bold;">
                        <td colspan="6" style="padding: 6px; font-family: ${fontFamily}; background-color: ${primaryColor}; color: #FFFFFF; text-align: center;">DATOS COMERCIALES DEL PRESUPUESTO</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; background-color: #f4f1eb; border: 1px solid #e6dfd3;">Cliente:</td>
                        <td colspan="2" style="border: 1px solid #e6dfd3; background-color: #ffffff;">${esc(order.clientName)}</td>
                        <td style="font-weight: bold; background-color: #f4f1eb; border: 1px solid #e6dfd3;">Presupuesto ID:</td>
                        <td colspan="2" style="border: 1px solid #e6dfd3; background-color: #ffffff;">#${order.id.substring(4)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; background-color: #f4f1eb; border: 1px solid #e6dfd3;">CUIT Cliente:</td>
                        <td colspan="2" style="border: 1px solid #e6dfd3; background-color: #ffffff;">${esc(order.cuit || 'S/D')}</td>
                        <td style="font-weight: bold; background-color: #f4f1eb; border: 1px solid #e6dfd3;">Fecha Emisión:</td>
                        <td colspan="2" style="border: 1px solid #e6dfd3; background-color: #ffffff;">${dateStr}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; background-color: #f4f1eb; border: 1px solid #e6dfd3;">Localidad / Destino:</td>
                        <td colspan="2" style="border: 1px solid #e6dfd3; background-color: #ffffff;">${esc(order.deliveryLocation || 'A convenir')}</td>
                        <td style="font-weight: bold; background-color: #f4f1eb; border: 1px solid #e6dfd3;">Validez Oferta:</td>
                        <td colspan="2" style="border: 1px solid #e6dfd3; background-color: #ffffff;">${validStr} (10 días corridos)</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; background-color: #f4f1eb; border: 1px solid #e6dfd3;">Dirección Entrega:</td>
                        <td colspan="2" style="border: 1px solid #e6dfd3; background-color: #ffffff;">${esc(order.deliveryAddress || 'A convenir')}</td>
                        <td style="font-weight: bold; background-color: #f4f1eb; border: 1px solid #e6dfd3;">Fecha Entrega:</td>
                        <td colspan="2" style="border: 1px solid #e6dfd3; background-color: #ffffff;">${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("es-AR") : 'A convenir'}</td>
                    </tr>
                    
                    ${optionsTablesHtml}
                    
                    <tr>
                        <td colspan="6" style="border: 1px solid #e6dfd3; padding: 12px; font-size: 9.5pt; line-height: 1.5; font-family: ${fontFamily}; background-color: #f4f1eb;">
                            <strong style="color: ${primaryColor};">CONDICIONES COMERCIALES Y ENTREGAS</strong><br><br>
                            ${footnotesText}
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const mhtmlPartLogo = [
            `--${boundary}`,
            'Content-Type: image/png',
            'Content-Transfer-Encoding: base64',
            'Content-ID: <logo_img>',
            '',
            base64Logo,
            `--${boundary}--`
        ].join('\r\n');

        const mhtmlContent = [mhtmlHeader, htmlBody, mhtmlPartLogo].join('\r\n');

        const blob = new Blob([mhtmlContent], { type: "message/rfc822;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Propuesta_${brand.toUpperCase()}_${order.clientName.replace(/[^a-zA-Z0-9]/g, "_")}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        app.showToast("Propuesta comercial Excel generada correctamente", "success");
    }

    // --- EXPORTACIÓN DE PROPUESTA COMERCIAL PDF (DISEÑO IMPRIMIBLE DUAL) ---
    exportQuoteToPDF(orderId, brand) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) {
            app.showToast("Pedido no encontrado", "error");
            return;
        }

        // Interceptar si no está calculado el costo logístico
        if (!order.shippingZone) {
            app.showToast("Costo logístico no calculado. Interceptando exportación...", "warning");
            this.openLogisticsModal({ orderId: orderId, optionIndex: 0 }, () => {
                this.exportQuoteToPDF(orderId, brand);
            });
            return;
        }

        const dateStr = new Date(order.date).toLocaleDateString("es-AR");
        const validStr = new Date(order.validUntil).toLocaleDateString("es-AR");

        // Configuración de branding
        let primaryColor, secondaryColor, fontFamily, brandTitle, logoSource;
        if (brand === "golosinas") {
            primaryColor = "#320a5a";
            secondaryColor = "#005550";
            fontFamily = "'Baloo Tamma 2', 'Poppins', sans-serif";
            brandTitle = "Golosinas y Comestibles";
            logoSource = window.LOGO_GOLOSINAS_Y_COMESTIBLES;
        } else {
            primaryColor = "#011b52";
            secondaryColor = "#2f7968";
            fontFamily = "'Poppins', sans-serif";
            brandTitle = "Navidad y Empresas";
            logoSource = window.LOGO_NAVIDAD_Y_EMPRESAS;
        }

        // Si por alguna razón no tiene options, inicializar con la actual
        const optionsList = order.options && order.options.length > 0 ? order.options : [{
            name: "Opción 1",
            numberOfBoxes: order.numberOfBoxes || 1,
            boxRecipe: JSON.parse(JSON.stringify(order.boxRecipe)),
            unitPrice: order.total / (order.numberOfBoxes || 1),
            costUnit: order.costEst / (order.numberOfBoxes || 1),
            total: order.total,
            costEst: order.costEst,
            margin: order.margin,
            shippingRealCost: order.shippingRealCost || 0,
            shippingCharged: order.shippingCharged || 0,
            shippingBonificado: order.shippingBonificado || 0,
            shippingZone: order.shippingZone || "",
            shippingCalcMode: order.shippingCalcMode || "manual"
        }];

        const footnotesText = store.settings.notasAlPie.replace(/\n/g, "<br>");

        // Generar HTML para cada opción
        let optionsHtml = "";
        optionsList.forEach((opt, optIdx) => {
            let itemsHtml = "";
            opt.boxRecipe.forEach(item => {
                const subtotal = (item.price || item.cost * 1.4) * item.qty;
                itemsHtml += `
                    <tr>
                        <td style="border: 1px solid #cccccc; padding: 6px; font-size:0.8rem;"><strong>${item.name}</strong></td>
                        <td style="border: 1px solid #cccccc; padding: 6px; text-align: center; width: 60px; font-size:0.8rem;">${item.qty}</td>
                        <td style="border: 1px solid #cccccc; padding: 6px; text-align: right; width: 100px; font-size:0.8rem;">$${Math.round(item.price || item.cost * 1.4).toLocaleString('es-AR')}</td>
                        <td style="border: 1px solid #cccccc; padding: 6px; text-align: right; width: 120px; font-size:0.8rem; font-weight: 600;">$${Math.round(subtotal).toLocaleString('es-AR')}</td>
                    </tr>
                `;
            });

            const discountPercent = opt.discountPercent || 0;
            const subtotalVenta = opt.unitPrice * opt.numberOfBoxes;
            const discountAmount = Math.round(subtotalVenta * (discountPercent / 100));
            const shippingCharged = opt.shippingCharged || 0;
            const finalTotal = subtotalVenta - discountAmount + shippingCharged;
            
            let discountHtmlPDF = "";
            discountHtmlPDF += `
            <div style="margin-top: 10px; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; font-size: 0.8rem;">
                <div style="text-align: right; color: #555;">
                    Subtotal (Sin IVA): <strong>$${Math.round(subtotalVenta).toLocaleString('es-AR')}</strong>
                </div>
            `;

            if (discountPercent > 0) {
                discountHtmlPDF += `
                <div style="text-align: right; color: #cc0000;">
                    ${opt.discountName || 'Descuento'} (${discountPercent}%): <strong>-$${Math.round(discountAmount).toLocaleString('es-AR')}</strong>
                </div>
                `;
            }

            if (shippingCharged > 0) {
                discountHtmlPDF += `
                <div style="text-align: right; color: #555;">
                    Envío / Entrega: <strong>$${Math.round(shippingCharged).toLocaleString('es-AR')}</strong>
                </div>
                `;
            }

            discountHtmlPDF += `
                <div style="background: #e2efda; border: 1px solid #b8c9b3; padding: 6px 12px; border-radius: 4px; text-align: right; font-weight: bold; margin-top: 5px;">
                    Total Opción (Sin IVA): <span style="font-size: 0.95rem; color: ${primaryColor};">$${Math.round(finalTotal).toLocaleString('es-AR')}</span>
                </div>
            </div>
            `;

            optionsHtml += `
                <div style="margin-bottom: 25px; page-break-inside: avoid;">
                    <div style="background: ${primaryColor}; color: white; padding: 8px 12px; font-weight: 700; border-radius: 4px; font-size: 0.9rem; margin-bottom: 10px; font-family: ${fontFamily}; text-transform: uppercase;">
                        Opción ${optIdx + 1}: ${opt.name} (${opt.numberOfBoxes} Cajas)
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 12px; background: white;">
                        <thead>
                            <tr style="background: #f0f0f0; color: #333; font-weight: bold;">
                                <th style="border: 1px solid #cccccc; padding: 6px; text-align: left;">Descripción Insumo</th>
                                <th style="border: 1px solid #cccccc; padding: 6px; text-align: center; width: 60px;">Cant.</th>
                                <th style="border: 1px solid #cccccc; padding: 6px; text-align: right; width: 100px;">Unitario</th>
                                <th style="border: 1px solid #cccccc; padding: 6px; text-align: right; width: 120px;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 15px; font-size: 0.8rem;">
                        <div style="background: #f4f1eb; border: 1px solid #cccccc; padding: 6px 12px; border-radius: 4px; text-align: right;">
                            Precio Unitario de la Caja (Sin IVA): <strong style="font-size: 0.9rem; color: ${secondaryColor};">$${Math.round(opt.unitPrice).toLocaleString('es-AR')}</strong>
                        </div>
                        <div style="background: #e6dfd3; border: 1px solid #cccccc; padding: 6px 12px; border-radius: 4px; text-align: right;">
                            Cantidad de Cajas Presupuestadas: <strong style="font-size: 0.9rem; color: ${primaryColor};">${opt.numberOfBoxes.toLocaleString('es-AR')}</strong>
                        </div>
                    </div>
                    ${discountHtmlPDF}
                </div>
            `;
        });

        const templateHtml = `
            <div class="proposal-pdf-container" style="font-family: ${fontFamily}; color: #2d2720; padding: 25px; background: white; border: 1px solid #cccccc; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid ${primaryColor}; padding-bottom: 15px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${logoSource}" style="max-height: 55px; max-width: 150px; object-fit: contain;" />
                        <div>
                            <h1 style="font-family: ${fontFamily}; font-size: 1.4rem; font-weight: 800; color: ${primaryColor}; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">${brandTitle.toUpperCase()}</h1>
                            <span style="font-size: 0.75rem; color: #7c7468; font-weight: 600;">Propuestas Corporativas Premium (Precios Netos Sin IVA)</span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="font-size: 1rem; color: ${primaryColor}; margin: 0; font-weight: 700;">PRESUPUESTO #${order.id.substring(4)}</h2>
                        <span style="font-size: 0.75rem; color: #7c7468;">Emisión: ${dateStr}</span>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #fdfcfb; border: 1px solid #e6dfd3; padding: 12px; border-radius: 6px; margin-bottom: 25px; font-size: 0.8rem; line-height: 1.5;">
                    <div>
                        <strong>Cliente:</strong> ${esc(order.clientName)}<br>
                        <strong>CUIT:</strong> ${esc(order.cuit || 'S/D')}<br>
                        <strong>Dirección de Entrega:</strong> ${esc(order.deliveryAddress || 'A convenir')}<br>
                    </div>
                    <div>
                        <strong>Fecha de Emisión:</strong> ${dateStr}<br>
                        <strong>Validez de Oferta:</strong> ${validStr} (10 días corridos)<br>
                        <strong>Localidad / Destino:</strong> ${esc(order.deliveryLocation || 'A convenir')}<br>
                    </div>
                </div>
                
                ${optionsHtml}
                
                <div style="margin-top: 30px; border: 1px solid #e6dfd3; background: #fdfcfb; padding: 12px; border-radius: 6px; font-size: 0.75rem; page-break-inside: avoid; line-height: 1.6;">
                    <h4 style="color: ${primaryColor}; margin-top: 0; margin-bottom: 6px; border-bottom: 1px solid #e6dfd3; padding-bottom: 4px; font-weight: bold; text-transform: uppercase;">CONDICIONES COMERCIALES</h4>
                    <div style="color: #2d2720;">${footnotesText}</div>
                </div>
            </div>
        `;

        const printZone = document.getElementById("remito-print-zone");
        if (printZone) {
            printZone.innerHTML = templateHtml;
        }

        const previewHtml = `
            <div style="background: #f0f0f0; border: 1px solid var(--color-border); padding: 20px; border-radius: var(--radius-md); max-height: 480px; overflow-y: auto;">
                ${templateHtml}
            </div>
            <div style="display:flex; justify-content: flex-end; gap:10px; margin-top:20px;">
                <button class="btn btn-secondary" onclick="salesModule.closeProposalPrint()">Cerrar Previsualización</button>
                <button class="btn btn-primary" onclick="salesModule.triggerProposalPrint()">🖨️ Mandar a Imprimir / Guardar como PDF</button>
            </div>
        `;
        app.showModal(`Previsualizar Propuesta Comercial (${brandTitle})`, previewHtml);
    }

    closeProposalPrint() {
        document.getElementById("proposal-portrait-style")?.remove();
        app.closeModal();
    }

    triggerProposalPrint() {
        let style = document.getElementById("proposal-portrait-style");
        if (!style) {
            style = document.createElement("style");
            style.id = "proposal-portrait-style";
            style.innerHTML = `@media print { @page { size: portrait; margin: 1cm; } }`;
            document.head.appendChild(style);
        }
        window.print();
    }

    // --- NUEVO SISTEMA DE LOGÍSTICA DE ENTREGAS ---
    calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    openSecondaryModal(htmlContent) {
        let secondaryOverlay = document.getElementById("secondary-modal-overlay");
        if (!secondaryOverlay) {
            secondaryOverlay = document.createElement("div");
            secondaryOverlay.id = "secondary-modal-overlay";
            secondaryOverlay.className = "modal-overlay";
            secondaryOverlay.style.zIndex = "2000";
            secondaryOverlay.style.background = "rgba(0,0,0,0.6)";
            secondaryOverlay.innerHTML = `
                <div class="modal" id="secondary-modal" style="max-width: 700px; width: 90%;">
                    <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-border); padding-bottom:12px;">
                        <h2 id="secondary-modal-title" style="margin:0; font-size:1.2rem; color:var(--color-blue); font-weight:700;">Gestor de Costos Logísticos</h2>
                        <button class="close-modal" onclick="salesModule.closeSecondaryModal()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--color-text-muted);">&times;</button>
                    </div>
                    <div class="modal-body" id="secondary-modal-body" style="padding: 16px 0 0 0;">
                        <!-- content -->
                    </div>
                </div>
            `;
            document.body.appendChild(secondaryOverlay);
        }
        
        document.getElementById("secondary-modal-body").innerHTML = htmlContent;
        secondaryOverlay.style.display = "flex";
        secondaryOverlay.classList.add("active");
    }

    closeSecondaryModal() {
        const secondaryOverlay = document.getElementById("secondary-modal-overlay");
        if (secondaryOverlay) {
            secondaryOverlay.classList.remove("active");
            secondaryOverlay.style.display = "none";
        }
    }

    openLogisticsModal(config = null, onSuccessCallback = null) {
        // config can contain { orderId, optionIndex }
        this.logisticsSuccessCallback = onSuccessCallback;
        this.logisticsConfig = config;

        let opt = null;
        let clientName = "";
        let boxesCount = 0;
        let addressVal = "";
        let locationVal = "";
        let provinceVal = "Córdoba";

        if (config && config.orderId) {
            const order = store.orders.find(o => o.id === config.orderId);
            if (order) {
                opt = order.options[config.optionIndex || 0];
                clientName = order.clientName || "";
                boxesCount = opt.numberOfBoxes || order.numberOfBoxes || 0;
                addressVal = order.deliveryAddress || "";
                locationVal = order.deliveryLocation || "";
                provinceVal = order.deliveryProvince || "Córdoba";
            }
        } else {
            // Builder mode
            opt = this.builderOptions[this.activeOptionIndex];
            clientName = document.getElementById("builder-client-name")?.value || "";
            boxesCount = parseInt(document.getElementById("builder-number-boxes")?.value) || opt.numberOfBoxes || 0;
            addressVal = document.getElementById("builder-delivery-address")?.value || opt.shippingAddress || "";
            locationVal = document.getElementById("builder-delivery-location")?.value || opt.shippingLocation || "";
            provinceVal = document.getElementById("builder-delivery-province")?.value || opt.shippingProvince || "Córdoba";
        }

        if (!opt) {
            app.showToast("No se pudo cargar la opción de cotización activa.", "error");
            return;
        }

        this.currentLogisticsOption = opt;
        this.currentLogisticsBoxes = boxesCount;

        const html = `
            <div style="font-family:'Poppins', sans-serif; color:#2d2720; font-size:0.85rem;">
                <!-- Info banner -->
                <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:12px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>Destinatario:</strong> <span id="logistics-info-client">${clientName || 'Cliente Temporal'}</span><br>
                        <strong>Dirección actual:</strong> <span id="logistics-info-address">${addressVal || '(Vacío)'}, ${locationVal || '(Vacío)'} (${provinceVal})</span><br>
                        <strong>Cantidad de cajas:</strong> <span id="logistics-info-boxes">${boxesCount} unidades</span>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-weight:700; color:var(--color-blue); font-size:1.1rem;" id="logistics-info-boxes-badge">${boxesCount} cajas</span>
                    </div>
                </div>

                <!-- Fields to Edit Address for geocoding -->
                <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:12px; margin-bottom:15px;">
                    <h4 style="margin:0 0 10px 0; color:var(--color-blue); font-size:0.9rem; font-weight:600;">Dirección para Geocodificación</h4>
                    <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:10px; margin-bottom:10px;">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.75rem; font-weight:600; margin-bottom:2px; display:block;">Dirección</label>
                            <input type="text" id="logistics-address-input" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${addressVal}">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.75rem; font-weight:600; margin-bottom:2px; display:block;">Localidad/Ciudad</label>
                            <input type="text" id="logistics-location-input" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${locationVal}">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.75rem; font-weight:600; margin-bottom:2px; display:block;">Provincia</label>
                            <select id="logistics-province-input" class="form-control" style="font-size:0.8rem; padding:4px 8px;">
                                <option value="Córdoba" ${provinceVal === 'Córdoba' ? 'selected' : ''}>Córdoba</option>
                                <option value="Buenos Aires" ${provinceVal === 'Buenos Aires' ? 'selected' : ''}>Buenos Aires</option>
                                <option value="CABA" ${provinceVal === 'CABA' ? 'selected' : ''}>CABA</option>
                                <option value="Santa Fe" ${provinceVal === 'Santa Fe' ? 'selected' : ''}>Santa Fe</option>
                                <option value="Mendoza" ${provinceVal === 'Mendoza' ? 'selected' : ''}>Mendoza</option>
                                <option value="Otro" ${(provinceVal !== 'Córdoba' && provinceVal !== 'Buenos Aires' && provinceVal !== 'CABA' && provinceVal !== 'Santa Fe' && provinceVal !== 'Mendoza') ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="salesModule.runGeocoding()" style="padding: 6px 12px; font-weight:600;">
                            ⚡ Calcular Automático (OSM)
                        </button>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <input type="checkbox" id="logistics-manual-mode" ${opt.shippingCalcMode === 'manual' || !opt.shippingZone ? 'checked' : ''} onchange="salesModule.toggleLogisticsManualMode(this.checked)">
                            <label for="logistics-manual-mode" style="font-size:0.8rem; font-weight:600; margin:0; cursor:pointer;">Habilitar Carga Manual</label>
                        </div>
                    </div>
                </div>

                <!-- Output of calculation / Manual inputs -->
                <div id="logistics-calculation-pane" style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:12px; margin-bottom:15px; background:#fff;">
                    <h4 style="margin:0 0 10px 0; color:var(--color-blue); font-size:0.9rem; font-weight:600;">Detalle de Costo Real</h4>
                    
                    <!-- Auto Calculation Status -->
                    <div id="logistics-status-message" style="margin-bottom:10px; font-style:italic; color:var(--color-text-muted);">
                        ${opt.shippingZone ? 'Datos logísticos cargados previamente.' : 'Presione "Calcular Automático" o active "Carga Manual" para configurar.'}
                    </div>

                    <div id="logistics-auto-details" style="${opt.shippingCalcMode === 'auto' ? 'display:block;' : 'display:none;'} background:rgba(0,0,0,0.01); padding:8px; border-radius:4px; border:1px dashed var(--color-border); margin-bottom:10px; font-size:0.75rem;">
                        <!-- Coords and zone details -->
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.75rem; font-weight:600; margin-bottom:2px; display:block;">Zona de Envío</label>
                            <select id="logistics-zone-select" class="form-control" style="font-size:0.8rem; padding:4px 8px;" ${opt.shippingCalcMode === 'manual' || !opt.shippingZone ? '' : 'disabled'} onchange="salesModule.handleZoneSelectChange()">
                                <option value="">-- No clasificado --</option>
                                <option value="Cordoba Capital" ${opt.shippingZone === 'Cordoba Capital' ? 'selected' : ''}>Córdoba Capital</option>
                                <option value="CABA" ${opt.shippingZone === 'CABA' ? 'selected' : ''}>CABA</option>
                                <option value="AMBA 30" ${opt.shippingZone === 'AMBA 30' ? 'selected' : ''}>AMBA hasta 30km</option>
                                <option value="AMBA 60" ${opt.shippingZone === 'AMBA 60' ? 'selected' : ''}>AMBA hasta 60km</option>
                                <option value="Manual" ${opt.shippingZone === 'Manual' ? 'selected' : ''}>Interior / Otro (Manual)</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.75rem; font-weight:600; margin-bottom:2px; display:block;">Costo Real Logístico ($) *</label>
                            <input type="number" id="logistics-real-cost-input" class="form-control" style="font-size:0.8rem; padding:4px 8px; font-weight:700; color:var(--color-blue);" value="${opt.shippingRealCost || 0}" ${opt.shippingCalcMode === 'manual' || !opt.shippingZone ? '' : 'disabled'} oninput="salesModule.handleManualRealCostChange()">
                        </div>
                    </div>
                </div>

                <!-- Commercial decision -->
                <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:12px; margin-bottom:15px; background:var(--bg-sidebar);">
                    <h4 style="margin:0 0 10px 0; color:var(--color-blue); font-size:0.9rem; font-weight:600;">Decisión Comercial de Facturación</h4>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="radio" id="billing-opt-a" name="billing-option" value="A" ${!opt.shippingZone || (opt.shippingCharged === opt.shippingRealCost && opt.shippingRealCost > 0) ? 'checked' : ''} onchange="salesModule.updateLogisticsBilling()">
                            <label for="billing-opt-a" style="cursor:pointer; font-weight:600; margin:0;">Opción A: Cobrar costo de envío completo al cliente</label>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="radio" id="billing-opt-b" name="billing-option" value="B" ${opt.shippingZone && opt.shippingCharged === 0 ? 'checked' : ''} onchange="salesModule.updateLogisticsBilling()">
                            <label for="billing-opt-b" style="cursor:pointer; font-weight:600; margin:0;">Opción B: Bonificar envío completo (cliente paga $0)</label>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="radio" id="billing-opt-c" name="billing-option" value="C" ${opt.shippingZone && opt.shippingCharged > 0 && opt.shippingCharged !== opt.shippingRealCost ? 'checked' : ''} onchange="salesModule.updateLogisticsBilling()">
                            <label for="billing-opt-c" style="cursor:pointer; font-weight:600; margin:0;">Opción C: Cobrar un monto parcial de envío al cliente</label>
                        </div>
                    </div>

                    <div id="logistics-charged-row" style="${opt.shippingZone && opt.shippingCharged > 0 && opt.shippingCharged !== opt.shippingRealCost ? 'display:block;' : 'display:none;'} margin-bottom:10px;">
                        <div class="form-group" style="margin:0; max-width:250px;">
                            <label style="font-size:0.75rem; font-weight:600; margin-bottom:2px; display:block;">Monto a Cobrar ($)</label>
                            <input type="number" id="logistics-charged-input" class="form-control" style="font-size:0.8rem; padding:4px 8px; font-weight:700;" value="${opt.shippingCharged || 0}" oninput="salesModule.recalcLogisticsBillingOnly()">
                        </div>
                    </div>

                    <!-- Profitability summary banner inside modal -->
                    <div style="background:#fff; border:1px solid var(--color-border); padding:8px 12px; border-radius:4px; font-size:0.8rem; display:flex; justify-content:space-between; margin-top:10px;">
                        <div>
                            Cobrado al Cliente: <strong id="lbl-logistics-charged">$ 0</strong>
                        </div>
                        <div>
                            Bonificado (Gasto Empresa): <strong id="lbl-logistics-bonificado" style="color:var(--color-red);">$ 0</strong>
                        </div>
                        <div>
                            Costo Real: <strong id="lbl-logistics-real">$ 0</strong>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" class="btn btn-secondary" onclick="salesModule.closeSecondaryModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="salesModule.confirmLogisticsSelection()" style="font-weight:600;">Confirmar Logística</button>
                </div>
            </div>
        `;

        this.openSecondaryModal(html);

        // Disparar recálculo de facturación inicial basado en valores previos
        this.updateLogisticsBilling();
    }

    toggleLogisticsManualMode(isManual) {
        const zoneSelect = document.getElementById("logistics-zone-select");
        const realCostInput = document.getElementById("logistics-real-cost-input");
        const statusMsg = document.getElementById("logistics-status-message");
        const autoDetails = document.getElementById("logistics-auto-details");

        if (isManual) {
            zoneSelect.removeAttribute("disabled");
            realCostInput.removeAttribute("disabled");
            statusMsg.innerHTML = "📝 Carga manual activada. Por favor, seleccione la zona y configure el costo real.";
            autoDetails.style.display = "none";
        } else {
            zoneSelect.setAttribute("disabled", "true");
            realCostInput.setAttribute("disabled", "true");
            statusMsg.innerHTML = "Presione 'Calcular Automático' para geocodificar.";
            // Si ya tenía cálculo automático, podríamos restaurarlo. Si no, poner en 0.
            realCostInput.value = 0;
            zoneSelect.value = "";
            this.recalcLogisticsBillingOnly();
        }
    }

    async runGeocoding() {
        const address = document.getElementById("logistics-address-input").value.trim();
        const location = document.getElementById("logistics-location-input").value.trim();
        const province = document.getElementById("logistics-province-input").value;
        const statusMsg = document.getElementById("logistics-status-message");
        const autoDetails = document.getElementById("logistics-auto-details");
        const zoneSelect = document.getElementById("logistics-zone-select");
        const realCostInput = document.getElementById("logistics-real-cost-input");

        if (!address || !location) {
            app.showToast("La dirección y la localidad son obligatorias para calcular automáticamente.", "error");
            return;
        }

        statusMsg.innerHTML = "⏳ Geocodificando dirección en OpenStreetMap...";
        statusMsg.style.color = "var(--color-blue)";
        autoDetails.style.display = "none";

        try {
            const query = `${address}, ${location}, ${province}, Argentina`;
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'NavidadYEmpresasERP/1.0'
                }
            });
            if (!response.ok) {
                throw new Error(`Error de servidor (${response.status})`);
            }
            const data = await response.json();
            if (!data || data.length === 0) {
                throw new Error("No se pudo geolocalizar la dirección. Verifique la ortografía o intente con una dirección más general.");
            }

            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const displayName = data[0].display_name;

            // Calcular distancias Haversine
            // Plaza San Martín (Córdoba): Lat -31.4135, Lon -64.1810
            // Obelisco (Buenos Aires): Lat -34.6037, Lon -58.3816
            const distCba = this.calculateHaversineDistance(lat, lon, -31.4135, -64.1810);
            const distBaires = this.calculateHaversineDistance(lat, lon, -34.6037, -58.3816);

            let zone = "";
            let zoneLabel = "";
            if (distCba <= 20) {
                zone = "Cordoba Capital";
                zoneLabel = "Córdoba Capital";
            } else if (distBaires <= 15) {
                zone = "CABA";
                zoneLabel = "CABA";
            } else if (distBaires <= 35) {
                zone = "AMBA 30";
                zoneLabel = "AMBA hasta 30km";
            } else if (distBaires <= 65) {
                zone = "AMBA 60";
                zoneLabel = "AMBA hasta 60km";
            }

            if (!zone) {
                throw new Error(`Coordenadas obtenidas [${lat.toFixed(4)}, ${lon.toFixed(4)}] quedan fuera del radio de cobertura automática (Cba: ${distCba.toFixed(1)}km, BA: ${distBaires.toFixed(1)}km). Active carga manual.`);
            }

            // Desmarcar checkbox de manual para usar automático
            document.getElementById("logistics-manual-mode").checked = false;
            zoneSelect.setAttribute("disabled", "true");
            realCostInput.setAttribute("disabled", "true");

            // Calcular costos
            const costoCbaBaires = store.settings.costoCbaBaires || 1512000;
            const capacidadCamion = store.settings.capacidadCamion || 3200;
            const cajasPorPallet = store.settings.cajasPorPallet || 115;
            const cajas = this.currentLogisticsBoxes;

            let bultoTipo = cajas <= 23 ? "Base" : "Pallet";
            let bultoCount = cajas <= 23 ? 1 : Math.ceil(cajas / cajasPorPallet);

            let fleteCost = 0;
            let distCost = 0;
            let breakdownText = "";

            if (zone === "Cordoba Capital") {
                fleteCost = 0;
                const tarifaBase = store.settings.tarifaBaseCbaCap || 25000;
                if (bultoTipo === "Base") {
                    distCost = tarifaBase;
                    breakdownText = `1 Base * $${tarifaBase.toLocaleString('es-AR')} (Tarifa Base Córdoba Cap)`;
                } else {
                    const tarifaPallet = 5 * tarifaBase;
                    distCost = bultoCount * tarifaPallet;
                    breakdownText = `${bultoCount} Pallets * $${tarifaPallet.toLocaleString('es-AR')} (Tarifa Pallet Córdoba Cap = 5 * Base)`;
                }
            } else {
                // Buenos Aires CABA/AMBA
                fleteCost = cajas * (costoCbaBaires / capacidadCamion);
                let tarifaBase = 0;
                let tarifaPallet = 0;

                if (zone === "CABA") {
                    tarifaBase = store.settings.tarifaBaseCaba || 39570;
                    tarifaPallet = store.settings.tarifaPalletCaba || 52800;
                } else if (zone === "AMBA 30") {
                    tarifaBase = store.settings.tarifaBaseAmba30 || 50000;
                    tarifaPallet = store.settings.tarifaPalletAmba30 || 64300;
                } else if (zone === "AMBA 60") {
                    tarifaBase = store.settings.tarifaBaseAmba60 || 56475;
                    tarifaPallet = store.settings.tarifaPalletAmba60 || 70000;
                }

                if (bultoTipo === "Base") {
                    distCost = tarifaBase;
                    breakdownText = `1 Base * $${tarifaBase.toLocaleString('es-AR')} (Tarifa Distribución Base)`;
                } else {
                    distCost = bultoCount * tarifaPallet;
                    breakdownText = `${bultoCount} Pallets * $${tarifaPallet.toLocaleString('es-AR')} (Tarifa Distribución Pallet)`;
                }
            }

            const realCost = Math.round(fleteCost + distCost);

            // Cargar en DOM
            zoneSelect.value = zone;
            realCostInput.value = realCost;

            // Actualizar banner de geocodificación
            autoDetails.style.display = "block";
            autoDetails.innerHTML = `
                <strong>Resuelto por OSM:</strong> ${displayName}<br>
                <strong>Coordenadas:</strong> Lat ${lat.toFixed(5)}, Lon ${lon.toFixed(5)}<br>
                <strong>Zona:</strong> ${zoneLabel} (Distancia Cba: ${distCba.toFixed(1)} km, Baires: ${distBaires.toFixed(1)} km)<br>
                <strong>Bultos:</strong> ${bultoCount} ${bultoTipo === 'Base' ? 'Base (Bandeja cajas sueltas)' : 'Pallet(s)'}<br>
                <strong>Desglose Costo Real:</strong><br>
                &bull; Flete Córdoba ➔ BA: $${Math.round(fleteCost).toLocaleString('es-AR')} (${cajas} cajas * $${Math.round(costoCbaBaires/capacidadCamion).toLocaleString('es-AR')} c/u)<br>
                &bull; Distribución Local: $${Math.round(distCost).toLocaleString('es-AR')} (${breakdownText})
            `;

            statusMsg.innerHTML = "✅ Ubicación geocodificada y costo calculado con éxito.";
            statusMsg.style.color = "var(--color-green)";

            // Guardar variables de cálculo automático temporalmente en el objeto del modal
            this.currentLogisticsCoords = { lat, lon, displayName };
            this.currentLogisticsCalcMode = "auto";

            this.updateLogisticsBilling();

        } catch (err) {
            console.error("Geocoding error", err);
            statusMsg.innerHTML = `❌ Error: ${err.message}`;
            statusMsg.style.color = "var(--color-red)";
            // Activar manual automáticamente
            document.getElementById("logistics-manual-mode").checked = true;
            this.toggleLogisticsManualMode(true);
            zoneSelect.value = "Manual";
            this.recalcLogisticsBillingOnly();
        }
    }

    handleZoneSelectChange() {
        this.currentLogisticsCalcMode = "manual";
        this.recalcLogisticsBillingOnly();
    }

    handleManualRealCostChange() {
        this.currentLogisticsCalcMode = "manual";
        this.recalcLogisticsBillingOnly();
    }

    updateLogisticsBilling() {
        const radioA = document.getElementById("billing-opt-a");
        const radioB = document.getElementById("billing-opt-b");
        const radioC = document.getElementById("billing-opt-c");
        const chargedRow = document.getElementById("logistics-charged-row");
        const chargedInput = document.getElementById("logistics-charged-input");
        const realCostVal = parseFloat(document.getElementById("logistics-real-cost-input").value) || 0;

        if (radioA && radioA.checked) {
            chargedRow.style.display = "none";
            chargedInput.value = realCostVal;
        } else if (radioB && radioB.checked) {
            chargedRow.style.display = "none";
            chargedInput.value = 0;
        } else if (radioC && radioC.checked) {
            chargedRow.style.display = "block";
            // Si estaba en A o B, podemos inicializar con un valor parcial o el que ya tenía
            if (parseFloat(chargedInput.value) === realCostVal || parseFloat(chargedInput.value) === 0) {
                chargedInput.value = Math.round(realCostVal * 0.5); // 50% de valor sugerido
            }
        }

        this.recalcLogisticsBillingOnly();
    }

    recalcLogisticsBillingOnly() {
        const realCostVal = parseFloat(document.getElementById("logistics-real-cost-input").value) || 0;
        const chargedInput = document.getElementById("logistics-charged-input");

        const radioA = document.getElementById("billing-opt-a");
        const radioB = document.getElementById("billing-opt-b");

        let chargedVal = 0;
        if (radioA && radioA.checked) {
            chargedVal = realCostVal;
            if (chargedInput) chargedInput.value = realCostVal;
        } else if (radioB && radioB.checked) {
            chargedVal = 0;
            if (chargedInput) chargedInput.value = 0;
        } else {
            chargedVal = parseFloat(chargedInput ? chargedInput.value : 0) || 0;
        }

        const bonificadoVal = Math.max(0, realCostVal - chargedVal);

        document.getElementById("lbl-logistics-real").innerText = `$${Math.round(realCostVal).toLocaleString('es-AR')}`;
        document.getElementById("lbl-logistics-charged").innerText = `$${Math.round(chargedVal).toLocaleString('es-AR')}`;
        document.getElementById("lbl-logistics-bonificado").innerText = `$${Math.round(bonificadoVal).toLocaleString('es-AR')}`;
    }

    confirmLogisticsSelection() {
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
        }

        const radioA = document.getElementById("billing-opt-a");
        const radioB = document.getElementById("billing-opt-b");
        const chargedInput = document.getElementById("logistics-charged-input");

        let charged = 0;
        if (radioA && radioA.checked) {
            charged = realCost;
        } else if (radioB && radioB.checked) {
            charged = 0;
        } else {
            charged = parseFloat(chargedInput ? chargedInput.value : 0) || 0;
        }

        const bonificado = realCost - charged;

        // Guardar en la opción activa
        const opt = this.currentLogisticsOption;
        opt.shippingRealCost = realCost;
        opt.shippingCharged = charged;
        opt.shippingBonificado = bonificado;
        opt.shippingZone = zone;
        opt.shippingCalcMode = calcMode;
        opt.shippingAddress = address;
        opt.shippingLocation = location;
        opt.shippingProvince = province;

        // Si estamos en el builder modal, actualizar campos de dirección de la UI
        const builderAddress = document.getElementById("builder-delivery-address");
        const builderLocation = document.getElementById("builder-delivery-location");
        const builderProvince = document.getElementById("builder-delivery-province");

        if (builderAddress) builderAddress.value = address;
        if (builderLocation) builderLocation.value = location;
        if (builderProvince) builderProvince.value = province;

        app.showToast("Logística configurada correctamente para esta opción.", "success");
        this.closeSecondaryModal();

        // Si hay un callback configurado, dispararlo
        if (this.logisticsSuccessCallback) {
            this.logisticsSuccessCallback();
            this.logisticsSuccessCallback = null;
        }

        // Recalcular totales del builder
        this.updateBuilderTotals();
    }
}

// Ámbito global
window.salesModule = new SalesModule();
