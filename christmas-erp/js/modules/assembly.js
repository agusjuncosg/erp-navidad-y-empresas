// Módulo de Cola de Armado y Producción (NAVIDAD Y EMPRESAS)
// Todos los montos se computan como PRECIOS NETOS SIN IVA
// Asistencia y Liquidación de Sueldos se gestionan desde Personal & Sueldos

class AssemblyModule {
    constructor() {}

    render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Cola de Armado y Producción</h2>
                    <p><strong>NAVIDAD Y EMPRESAS</strong> — Gestión del depósito y control de producción.</p>
                </div>
            </div>
            <div id="assembly-content-area-new"></div>
        `;
        this.renderQueueTab(document.getElementById("assembly-content-area-new"));
    }

    renderActiveTab() {
        const area = document.getElementById("assembly-content-area-new");
        if (area) this.renderQueueTab(area);
    }

    // --- COLA DE ARMADO (LOGÍSTICA INICIAL) ---
    renderQueueTab(container) {
        // Filtrar por estado derivado: solo pedidos activos en producción o listos
        const ACTIVE_DERIVED = ["Confirmado", "Armado Parcial", "Listo para Despacho", "En Producción", "Entrega Parcial"];
        let ordersToArm = store.orders.filter(o => {
            const derived = store.deriveOrderStatus(o);
            return ACTIVE_DERIVED.includes(derived);
        });

        // Orden inteligente: parcialmente armados primero, luego por zona y fecha
        ordersToArm.sort((a, b) => {
            const dA = store.deriveOrderStatus(a);
            const dB = store.deriveOrderStatus(b);
            const priority = { "Armado Parcial": 0, "En Producción": 1, "Confirmado": 2, "Listo para Despacho": 3, "Entrega Parcial": 4 };
            if ((priority[dA] ?? 9) !== (priority[dB] ?? 9)) return (priority[dA] ?? 9) - (priority[dB] ?? 9);

            const firstDeliveryDate = (o) => {
                const ents = (o.entregas || []).filter(e => e.fechaEntrega);
                if (ents.length > 0) return ents.map(e => e.fechaEntrega).sort()[0];
                return o.deliveryDate || "";
            };
            const dA2 = firstDeliveryDate(a), dB2 = firstDeliveryDate(b);
            if (!dA2 && dB2) return 1;
            if (dA2 && !dB2) return -1;
            return dA2.localeCompare(dB2);
        });

        let rowsHtml = "";
        ordersToArm.forEach(order => {
            const derived = store.deriveOrderStatus(order);
            const armado = order.armado || { cajasArmadas: 0, fotoArmado: null, sesiones: [] };
            const cajasArmadas = armado.cajasArmadas || 0;
            const total = order.numberOfBoxes || 0;
            const pendientes = total - cajasArmadas;

            // Zona: tomar primera entrega
            const primeraEntrega = (order.entregas || [])[0];
            const loc = primeraEntrega?.localidad || order.deliveryLocation || "";
            const isCba = loc.toLowerCase().includes("córdoba") || loc.toLowerCase().includes("cordoba");
            const entregasCount = (order.entregas || []).length;
            const destBadge = isCba
                ? `<span class="badge" style="background:rgba(230,160,20,0.1); color:var(--color-gold); border:1px solid var(--color-gold); font-size:0.7rem;">CÓRDOBA</span>`
                : `<span class="badge" style="background:rgba(180,80,240,0.1); color:#9b59b6; border:1px solid #9b59b6; font-size:0.7rem;">PROVINCIAS</span>`;
            const splitBadge = entregasCount > 1
                ? `<span class="badge" style="background:rgba(4,197,175,0.1); color:var(--color-teal, #04c5af); border:1px solid var(--color-teal, #04c5af); font-size:0.65rem; margin-left:4px;">${entregasCount} destinos</span>`
                : "";

            const fechaLabel = (() => {
                const ents = (order.entregas || []).filter(e => e.fechaEntrega);
                if (ents.length === 0) return '<span style="color:var(--color-red); font-weight:bold;">Sin Programar</span>';
                if (ents.length === 1) return new Date(ents[0].fechaEntrega + "T00:00:00").toLocaleDateString("es-AR");
                const min = ents.map(e => e.fechaEntrega).sort()[0];
                return `${new Date(min + "T00:00:00").toLocaleDateString("es-AR")} (+${ents.length - 1})`;
            })();

            // Progreso de armado
            const pct = total > 0 ? Math.min(100, Math.round(cajasArmadas / total * 100)) : 0;
            const progressHtml = cajasArmadas > 0 ? `
                <div style="margin-top:4px;">
                    <div style="font-size:0.72rem; font-weight:600; color:${cajasArmadas >= total ? 'var(--color-green)' : 'var(--color-gold)'};">
                        ${cajasArmadas} / ${total} cajas armadas
                    </div>
                    <div style="background:#e0e0e0; border-radius:4px; height:5px; margin-top:2px; width:120px;">
                        <div style="background:${cajasArmadas >= total ? 'var(--color-green)' : 'var(--color-gold)'}; height:5px; border-radius:4px; width:${pct}%;"></div>
                    </div>
                </div>` : "";

            // Estado badge
            let statusHtml;
            const fotos = armado.fotos || (armado.fotoArmado ? [{ url: armado.fotoArmado, label: 'Pallet 1' }] : []);
            if (derived === "Listo para Despacho") {
                statusHtml = fotos.length > 0
                    ? `<span class="badge" style="background:var(--color-green); color:white; font-weight:600;">Listo ✓ (${fotos.length} foto${fotos.length > 1 ? 's' : ''})</span>`
                    : '<span class="badge" style="background:var(--color-green); color:white; font-weight:600;">Listo</span>';
            } else if (derived === "Armado Parcial") {
                statusHtml = `<span class="badge" style="background:var(--color-gold); color:black; font-weight:600;">Parcial ${pct}%</span>`;
            } else if (derived === "En Producción") {
                statusHtml = '<span class="badge" style="background:var(--color-gold); color:black; font-weight:600;">En Depósito</span>';
            } else {
                statusHtml = '<span class="badge" style="background:var(--color-text-muted); color:white;">Pendiente</span>';
            }

            // Botones de acción
            let btnAction;
            if (derived === "Listo para Despacho") {
                const fotoBtn = `<button class="btn btn-primary btn-sm" onclick="assemblyModule.openFotosModal('${order.id}')" style="padding:2px 6px; font-size:0.75rem;">📷 Fotos${fotos.length > 0 ? ' (' + fotos.length + ')' : ''}</button>`;
                btnAction = `
                    <div style="display:inline-flex; gap:4px; align-items:center;">
                        <button class="btn btn-gold btn-sm" onclick="logisticsModule.printHojaArmado('${order.id}')" style="padding:2px 6px; font-size:0.75rem;">Hoja</button>
                        ${fotoBtn}
                    </div>`;
            } else if (derived === "En Producción") {
                // Ya iniciado — mostrar "Finalizar Armado"
                btnAction = `
                    <div style="display:inline-flex; gap:4px;">
                        <button class="btn btn-gold btn-sm" onclick="logisticsModule.printHojaArmado('${order.id}')" style="padding:2px 6px; font-size:0.75rem;">Hoja</button>
                        <button class="btn btn-primary btn-sm" onclick="assemblyModule.openFinalizarModal('${order.id}')" style="padding:2px 6px; font-size:0.75rem; background-color:var(--color-green); color:white;">✔ Finalizar Armado</button>
                    </div>`;
            } else if (derived === "Armado Parcial") {
                // Parcial — mostrar "Continuar Armado"
                btnAction = `
                    <div style="display:inline-flex; gap:4px;">
                        <button class="btn btn-gold btn-sm" onclick="logisticsModule.printHojaArmado('${order.id}')" style="padding:2px 6px; font-size:0.75rem;">Hoja (${pendientes})</button>
                        <button class="btn btn-primary btn-sm" onclick="assemblyModule.openFinalizarModal('${order.id}')" style="padding:2px 6px; font-size:0.75rem; background-color:var(--color-green); color:white;">↩ Continuar Armado</button>
                    </div>`;
            } else {
                btnAction = `<button class="btn btn-primary btn-sm" onclick="assemblyModule.initAssembly('${order.id}')" style="padding:2px 6px; font-size:0.75rem;">Iniciar Armado</button>`;
            }

            const isPendingInfo = (order.entregas || []).some(e => !e.fechaEntrega || !e.direccion || !e.localidad);
            const pendingBadge = isPendingInfo ? `<span class="badge" style="background:var(--color-red); color:white; font-size:0.7rem; padding:2px 6px; margin-left:6px;">⚠️ INFO PENDIENTE</span>` : "";

            rowsHtml += `
                <tr style="border-bottom:1px solid var(--color-border);">
                    <td style="padding:6px 10px; font-weight:600;">${order.displayId || '#' + order.id.substring(4)}</td>
                    <td style="padding:6px 10px;">
                        <strong>${esc(order.clientName)}</strong>${pendingBadge}
                        <br><span style="font-size:0.75rem; color:var(--color-text-muted);">CUIT: ${esc(order.cuit || 'S/D')}</span>
                    </td>
                    <td style="padding:6px 10px;">
                        ${destBadge}${splitBadge}
                        <br><span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:500;">${loc || 'Sin localidad'}</span>
                    </td>
                    <td style="padding:6px 10px; font-weight:600;">${fechaLabel}</td>
                    <td style="padding:6px 10px; text-align:center; font-weight:bold; font-size:0.95rem;">
                        ${total}
                        ${progressHtml}
                    </td>
                    <td style="padding:6px 10px; text-align:center;">${statusHtml}</td>
                    <td style="padding:6px 10px; text-align:right;">${btnAction}</td>
                </tr>`;
        });

        container.innerHTML = `
            <div class="card" style="padding:15px;">
                <div class="card-title">Cola de Armado Asistida (Producción Activa)</div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width:90px;">Pedido</th>
                                <th>Cliente</th>
                                <th>Zona / Destino</th>
                                <th>Fecha Comprometida</th>
                                <th style="text-align:center; width:120px;">Cajas / Progreso</th>
                                <th style="text-align:center; width:120px;">Estado</th>
                                <th style="text-align:right; width:220px;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--color-text-muted);">No hay ventas activas en producción.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Inicia el armado: descuenta stock, marca "En Producción". Sin pedir cantidad.
    initAssembly(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        // Guard contra doble click o re-inicio de un pedido ya en producción
        const derived = store.deriveOrderStatus(order);
        if (derived === "En Producción" || derived === "Armado Parcial") {
            app.showToast("Este pedido ya está en producción.", "warning");
            return;
        }
        if (!order.armado) order.armado = { cajasArmadas: 0, fotoArmado: null, fotos: [], sesiones: [] };
        order.status = "En Producción";
        order.assemblyStatus = "En Proceso";
        app.logAction(order.id, "Armado iniciado.");
        store.saveData();
        app.showToast(`Pedido en producción. Stock descontado. Presioná "Finalizar Armado" cuando termines.`, "success");
        this.renderActiveTab();
    }

    // Alias para compatibilidad
    selectOrder(orderId) { this.initAssembly(orderId); }

    // Modal de finalización: pregunta si se armó todo o parcial
    openFinalizarModal(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        if (!order.armado) order.armado = { cajasArmadas: 0, fotoArmado: null, fotos: [], sesiones: [] };

        const cajasArmadas = order.armado.cajasArmadas || 0;
        const total = order.numberOfBoxes || 0;
        const pendientes = total - cajasArmadas;
        const esContinuacion = cajasArmadas > 0;

        const historialHtml = (order.armado.sesiones || []).length === 0 ? "" : `
            <div style="margin-bottom:14px; background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:6px; padding:10px;">
                <div style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); margin-bottom:6px; text-transform:uppercase;">Sesiones anteriores</div>
                ${order.armado.sesiones.slice().reverse().map(s => `
                    <div style="font-size:0.78rem; padding:3px 0; border-bottom:1px solid var(--color-border);">
                        ${new Date(s.fecha).toLocaleDateString("es-AR")} — <strong>${s.cajasEnSesion} cajas</strong>
                        ${s.operario ? `<span style="color:var(--color-text-muted);"> (${s.operario})</span>` : ""}
                    </div>`).join("")}
            </div>`;

        const html = `
            <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:6px; padding:12px 16px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.85rem; font-weight:600;">Total del pedido:</span>
                    <span style="font-size:1rem; font-weight:800;">${total} cajas</span>
                </div>
                ${esContinuacion ? `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                    <span style="font-size:0.85rem; font-weight:600; color:var(--color-gold);">Ya armadas:</span>
                    <span style="font-size:1rem; font-weight:800; color:var(--color-gold);">${cajasArmadas} cajas</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                    <span style="font-size:0.85rem; font-weight:600; color:var(--color-red);">Pendientes:</span>
                    <span style="font-size:1rem; font-weight:800; color:var(--color-red);">${pendientes} cajas</span>
                </div>` : ""}
            </div>
            ${historialHtml}
            <p style="font-weight:700; font-size:0.95rem; margin-bottom:14px;">¿Se armó la totalidad ${esContinuacion ? 'de las cajas pendientes' : 'del pedido'}?</p>
            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <button class="btn btn-primary" style="flex:1; padding:12px; font-size:1rem; background:var(--color-green); color:white;"
                    onclick="assemblyModule.finalizarArmado('${orderId}', true)">
                    ✅ Sí, todo armado
                </button>
                <button class="btn btn-secondary" style="flex:1; padding:12px; font-size:1rem; border:2px solid var(--color-gold); color:var(--color-gold); background:transparent;"
                    onclick="assemblyModule._mostrarInputParcial('${orderId}')">
                    ⚠️ No, fue parcial
                </button>
            </div>
            <div id="partial-input-area" style="display:none; border-top:1px solid var(--color-border); padding-top:16px;">
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="font-weight:600; display:block; margin-bottom:4px;">
                        ¿Cuántas cajas se armaron efectivamente?
                        <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:400;"> (máx: ${pendientes})</span>
                    </label>
                    <input type="number" id="finalizar-cajas-input" class="form-control" min="1" max="${pendientes}"
                           placeholder="0" style="font-size:1.2rem; padding:10px 14px; text-align:center; font-weight:700;">
                </div>
                <div class="form-group" style="margin-bottom:16px;">
                    <label style="font-weight:600; display:block; margin-bottom:4px;">Operario responsable</label>
                    <input type="text" id="finalizar-operario-input" class="form-control"
                           value="${app.currentUser || ''}" placeholder="Nombre del operario">
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="button" class="btn btn-gold" onclick="assemblyModule.finalizarArmado('${orderId}', false)">Registrar Armado Parcial</button>
                </div>
            </div>`;

        const titulo = esContinuacion
            ? `Continuar Armado — ${order.displayId || order.id} (${order.clientName})`
            : `Finalizar Armado — ${order.displayId || order.id} (${order.clientName})`;
        app.showModal(titulo, html);
    }

    // Muestra el input de cajas parciales dentro del modal
    _mostrarInputParcial(orderId) {
        document.getElementById("partial-input-area").style.display = "block";
        document.getElementById("finalizar-cajas-input")?.focus();
    }

    // Procesa la finalización: completo o parcial
    finalizarArmado(orderId, completo) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        if (!order.armado) order.armado = { cajasArmadas: 0, fotoArmado: null, fotos: [], sesiones: [] };

        const total = order.numberOfBoxes || 0;
        const prevArmadas = order.armado.cajasArmadas || 0;
        const pendientes = total - prevArmadas;

        let cajasEnSesion;
        let operario = "";

        if (completo) {
            cajasEnSesion = pendientes; // Asume todas las pendientes
        } else {
            cajasEnSesion = parseInt(document.getElementById("finalizar-cajas-input")?.value) || 0;
            operario = document.getElementById("finalizar-operario-input")?.value?.trim() || "";
            if (cajasEnSesion <= 0 || cajasEnSesion > pendientes) {
                app.showToast(`Cantidad inválida. Ingresá entre 1 y ${pendientes} cajas.`, "error");
                return;
            }
        }

        order.armado.sesiones.push({
            id: `ses_${Date.now()}`,
            fecha: new Date().toISOString(),
            cajasEnSesion,
            operario,
            completo
        });
        order.armado.cajasArmadas = prevArmadas + cajasEnSesion;
        const nuevasArmadas = order.armado.cajasArmadas;

        app.logAction(order.id, `Armado ${completo ? 'completo' : 'parcial'}: ${cajasEnSesion} cajas (total acumulado: ${nuevasArmadas}/${total}).`);
        store.saveData();
        app.closeModal();

        if (nuevasArmadas >= total) {
            app.showToast(`¡Armado completo! ${total}/${total} cajas. Podés subir las fotos de los pallets.`, "success");
            this.renderActiveTab();
            setTimeout(() => this.openFotosModal(orderId), 300);
        } else {
            app.showToast(`Armado parcial registrado: ${nuevasArmadas}/${total} cajas. Quedan ${total - nuevasArmadas} pendientes.`, "info");
            this.renderActiveTab();
        }
    }

    // Alias legacy — mantiene compatibilidad con llamadas externas
    openAssemblySessionModal(orderId) { this.openFinalizarModal(orderId); }
    saveAssemblySession(e, orderId) { e.preventDefault(); this.finalizarArmado(orderId, false); }

    // Abre el modal de gestión de fotos de pallets (múltiples)
    openFotosModal(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        if (!order.armado) order.armado = { cajasArmadas: order.numberOfBoxes, fotos: [], sesiones: [] };
        if (!order.armado.fotos) {
            // Migrar foto legacy a array
            order.armado.fotos = order.armado.fotoArmado
                ? [{ id: 'foto_leg', url: order.armado.fotoArmado, label: 'Pallet 1', fecha: new Date().toISOString() }]
                : [];
        }
        this._renderFotosModal(orderId);
    }

    _renderFotosModal(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        const fotos = order.armado.fotos || [];

        const fotosHtml = fotos.length === 0
            ? `<p style="color:var(--color-text-muted); text-align:center; padding:20px 0;">Sin fotos cargadas aún.</p>`
            : fotos.map((f, i) => `
                <div style="display:flex; align-items:center; gap:10px; padding:8px; background:var(--bg-sidebar); border-radius:6px; margin-bottom:8px;">
                    <img src="${f.url}" style="width:60px; height:60px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="window.open('${f.url}')">
                    <div style="flex:1;">
                        <div style="font-weight:600; font-size:0.85rem;">${f.label || 'Pallet ' + (i + 1)}</div>
                        <div style="font-size:0.75rem; color:var(--color-text-muted);">${f.fecha ? new Date(f.fecha).toLocaleString('es-AR') : ''}</div>
                    </div>
                    <button class="btn btn-sm" onclick="assemblyModule._deleteFoto('${orderId}', '${f.id}')" style="background:var(--color-red); color:white; padding:3px 8px; font-size:0.75rem;">🗑</button>
                </div>`).join('');

        const html = `
            <div style="margin-bottom:16px;">
                <div style="font-weight:600; margin-bottom:10px;">Fotos cargadas (${fotos.length})</div>
                ${fotosHtml}
            </div>
            <div style="border-top:1px solid var(--color-border); padding-top:14px;">
                <div style="font-weight:600; margin-bottom:8px; font-size:0.9rem;">+ Agregar foto de pallet</div>
                <div class="form-group" style="margin-bottom:10px;">
                    <label style="font-size:0.82rem; font-weight:600;">Descripción (opcional)</label>
                    <input type="text" id="foto-label-input" placeholder="Ej: Pallet A, Zona norte..." style="width:100%; padding:6px 10px; border:1px solid var(--color-border); border-radius:var(--radius-sm); font-size:0.85rem; margin-top:4px;">
                </div>
                <button class="btn btn-primary" onclick="assemblyModule._addFotoArmado('${orderId}')" style="width:100%;">📷 Seleccionar foto</button>
            </div>
            <div style="margin-top:12px; text-align:right;">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cerrar</button>
            </div>`;

        app.showModal(`Fotos de Pallets — ${order.displayId || order.id} (${order.clientName})`, html);
    }

    _addFotoArmado(orderId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                app.showToast("La foto supera 2 MB. Comprimila antes de subir.", "error");
                return;
            }
            const label = document.getElementById("foto-label-input")?.value?.trim()
                || `Pallet ${(order.armado.fotos || []).length + 1}`;
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (!order.armado.fotos) order.armado.fotos = [];
                const foto = { id: 'foto_' + Date.now(), url: ev.target.result, label, fecha: new Date().toISOString() };
                order.armado.fotos.push(foto);
                // Compatibilidad legacy: primera foto en fotoArmado
                order.armado.fotoArmado = order.armado.fotos[0].url;
                order.assemblyPhoto = order.armado.fotoArmado;
                order.assemblyStatus = "Terminado";
                app.logAction(order.id, `Foto de pallet cargada: "${label}" (total: ${order.armado.fotos.length}).`);
                store.saveData();
                app.showToast(`Foto "${label}" guardada.`, "success");
                this._renderFotosModal(orderId); // re-renderiza el modal con la nueva foto
                this.renderActiveTab();
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    _deleteFoto(orderId, fotoId) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order || !order.armado?.fotos) return;
        order.armado.fotos = order.armado.fotos.filter(f => f.id !== fotoId);
        // Sincronizar legacy
        order.armado.fotoArmado = order.armado.fotos.length > 0 ? order.armado.fotos[0].url : null;
        order.assemblyPhoto = order.armado.fotoArmado;
        app.logAction(order.id, `Foto eliminada. Quedan ${order.armado.fotos.length} fotos.`);
        store.saveData();
        app.showToast("Foto eliminada.", "info");
        this._renderFotosModal(orderId);
        this.renderActiveTab();
    }

    // Alias legacy — ahora abre el modal de fotos
    uploadAssemblyPhoto(orderId) {
        this.openFotosModal(orderId);
    }

    // Nota: el descuento de stock se realiza al confirmar la venta (salesModule.executeOrderConfirmation).
    // Este módulo ya no gestiona movimientos de stock.

    // Devuelve las cajas pendientes de armar (para la Hoja de Armado inteligente)
    getPendingBoxes(order) {
        const cajasArmadas = (order.armado || {}).cajasArmadas || 0;
        return Math.max(0, (order.numberOfBoxes || 0) - cajasArmadas);
    }

    // Alias legacy — ya no se usa directamente pero se mantiene por si algún módulo lo llama
    completeAssembly(orderId) {
        this.openAssemblySessionModal(orderId);
    }


    // --- TAB 2: PLANILLA DE ASISTENCIA DIARIO ---
    initializeAttendanceForDate(dateStr) {
        let hasChanges = false;
        store.employees.forEach(emp => {
            if (emp.status === "Inactivo") return; // Ignorar empleados inactivos
            const hasRecord = store.attendance.some(a => a.date === dateStr && a.employeeId === emp.id);
            if (!hasRecord) {
                store.attendance.push({
                    id: "att_" + Date.now() + "_" + emp.id + "_" + Math.floor(Math.random()*100),
                    date: dateStr,
                    employeeId: emp.id,
                    clockIn: "00:00",
                    clockOut: "00:00",
                    hours: 0.0,
                    normalHours: 0.0,
                    extraHours: 0.0,
                    status: "Ausente",
                    paymentStatus: "Pendiente",
                    totalPay: 0
                });
                hasChanges = true;
            }
        });

        if (hasChanges) {
            store.saveData();
        }
    }

    renderAttendanceTab(container) {
        const dateStr = this.selectedAttendanceDate;
        this.initializeAttendanceForDate(dateStr);

        // Obtener fechas únicas registradas en el historial (ordenadas desc)
        const uniqueDates = [...new Set(store.attendance.map(a => a.date))].sort().reverse();

        // Armar lista de fechas del historial
        let historyDatesHtml = "";
        uniqueDates.forEach(d => {
            const isActive = d === dateStr;
            const formatted = new Date(d + "T00:00:00").toLocaleDateString("es-AR", { day: 'numeric', month: 'short', year: 'numeric' });
            historyDatesHtml += `
                <button type="button" class="btn ${isActive ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="assemblyModule.loadAttendanceDate('${d}')" 
                        style="width: 100%; text-align: left; padding: 6px 10px; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span>📅 ${formatted}</span>
                    ${isActive ? '<span>➔</span>' : ''}
                </button>
            `;
        });

        let records = store.attendance.filter(a => a.date === dateStr);

        let rowsHtml = "";
        records.forEach(rec => {
            const emp = store.employees.find(e => e.id === rec.employeeId);
            if (!emp) return;

            const isLiquidado = rec.paymentStatus === "Liquidado";
            const disabledStatus = isLiquidado ? 'disabled' : '';
            const disabledClock = (isLiquidado || rec.status !== 'Presente') ? 'disabled' : '';
            const nameSuffix = emp.status === "Inactivo" ? " <span style='color:var(--color-red); font-size:0.75rem;'>(Inactivo)</span>" : "";
            rowsHtml += `
                <tr>
                    <td><strong>${esc(emp.name)}${nameSuffix}</strong></td>
                    <td>
                        <select class="form-control" style="width:115px; padding:4px; font-size:0.8rem;" ${disabledStatus} onchange="assemblyModule.updateDailyStatus('${rec.id}', this.value)">
                            <option value="Presente" ${rec.status === 'Presente' ? 'selected' : ''}>Presente</option>
                            <option value="Ausente" ${rec.status === 'Ausente' ? 'selected' : ''}>Ausente</option>
                            <option value="Licencia" ${rec.status === 'Licencia' ? 'selected' : ''}>Licencia</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="form-control" style="width:75px; padding:4px; text-align:center; font-size:0.8rem;" value="${rec.clockIn}" 
                               ${disabledClock} onchange="assemblyModule.updateDailyClock('${rec.id}', 'clockIn', this.value)">
                    </td>
                    <td>
                        <input type="text" class="form-control" style="width:75px; padding:4px; text-align:center; font-size:0.8rem;" value="${rec.clockOut}" 
                               ${disabledClock} onchange="assemblyModule.updateDailyClock('${rec.id}', 'clockOut', this.value)">
                    </td>
                    <td>
                        <input type="number" class="form-control" style="width:75px; padding:4px; text-align:center; font-size:0.8rem;" value="${rec.hours}" step="0.5" min="0" max="24"
                               ${disabledClock} onchange="assemblyModule.updateDailyHours('${rec.id}', this.value)">
                    </td>
                    <td>${rec.normalHours} hs</td>
                    <td style="color:var(--color-gold); font-weight:600;">${rec.extraHours} hs</td>
                    <td><strong>$${rec.totalPay.toLocaleString('es-AR')}</strong></td>
                </tr>
            `;
        });

        // Sumar horas y jornales del día
        const totalHoursDay = records.reduce((acc, r) => acc + (r.status === 'Presente' ? r.hours : 0), 0);
        const totalPayDay = records.reduce((acc, r) => acc + (r.status === 'Presente' ? r.totalPay : 0), 0);

        container.innerHTML = `
            <div style="display: flex; gap: 15px; align-items: flex-start;">
                
                <!-- Columna Izquierda: Historial -->
                <div style="width: 220px; flex-shrink: 0; background: var(--bg-card); border: 1px solid var(--color-border); padding: 15px; border-radius: var(--radius-md); max-height: 550px; overflow-y: auto;">
                    <h4 style="margin-top:0; margin-bottom:12px; font-size:0.9rem; color:var(--color-gold); text-transform: uppercase;">Historial de Fechas</h4>
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        ${historyDatesHtml || '<span style="color:var(--color-text-muted); font-size:0.8rem;">Sin fechas registradas</span>'}
                    </div>
                </div>

                <!-- Columna Derecha: Editor -->
                <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 15px;">
                    
                    <div class="card" style="padding:15px;">
                        <div style="display:flex; align-items:center; gap:12px; flex-wrap: wrap;">
                            <label style="font-weight:600; color:var(--color-gold); font-size:0.9rem;">Nueva Fecha de Asistencia:</label>
                            <input type="date" id="attendance-date-select" class="form-control" style="width:180px; padding:6px;" value="${this.getNextDateStr(dateStr)}">
                            <button class="btn btn-primary btn-sm" onclick="assemblyModule.changeAttendanceDate()">Cargar Fecha</button>
                        </div>
                    </div>

                    <div class="card" style="padding:15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 8px; margin-bottom: 15px;">
                            <h3 style="margin: 0; font-size: 1.1rem;">Presentismo Operativo - Día: ${new Date(dateStr + "T00:00:00").toLocaleDateString("es-AR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                            <div style="font-size: 0.85rem; background: var(--bg-sidebar); border: 1px solid var(--color-border); padding: 4px 10px; border-radius: 4px;">
                                Horas Totales: <strong>${totalHoursDay.toFixed(1)} hs</strong> | Jornal del Día: <strong style="color:var(--color-green);">$${totalPayDay.toLocaleString('es-AR')}</strong>
                            </div>
                        </div>
                        <p style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:12px; margin-top:0;">
                            Jornada normal: <strong>${store.settings.jornadaNormal} hs</strong>. Tarifas: Hora Normal $${store.settings.valorHoraNormal} | Hora Extra $${store.settings.valorHoraExtra}.
                        </p>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Operario</th>
                                        <th>Estado</th>
                                        <th>Ingreso</th>
                                        <th>Egreso</th>
                                        <th>Horas Decimales</th>
                                        <th>Hs Normales</th>
                                        <th>Hs Extra</th>
                                        <th>Jornal Diario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }

    loadAttendanceDate(d) {
        this.selectedAttendanceDate = d;
        this.renderActiveTab();
    }

    getNextDateStr(dateStr) {
        try {
            const d = new Date(dateStr + "T00:00:00");
            d.setDate(d.getDate() + 1);
            return d.toISOString().split('T')[0];
        } catch(e) {
            return new Date().toISOString().split('T')[0];
        }
    }

    changeAttendanceDate() {
        const inputDate = document.getElementById("attendance-date-select").value;
        if (!inputDate) return;
        
        // 1. Inicializar la fecha seleccionada en el almacén de datos
        this.initializeAttendanceForDate(inputDate);
        
        // 2. Establecer como la fecha seleccionada del módulo
        this.selectedAttendanceDate = inputDate;
        
        // 3. Re-renderizar la pestaña
        this.renderActiveTab();
        
        app.showToast(`Fecha ${inputDate} cargada e historial actualizado.`, "success");
    }

    updateDailyStatus(recId, status) {
        const rec = store.attendance.find(a => a.id === recId);
        if (rec) {
            if (rec.paymentStatus === "Liquidado") {
                app.showToast("No se puede modificar una asistencia ya liquidada.", "error");
                this.renderActiveTab();
                return;
            }
            rec.status = status;
            if (status !== "Presente") {
                rec.clockIn = "00:00";
                rec.clockOut = "00:00";
                rec.hours = 0.0;
                rec.normalHours = 0.0;
                rec.extraHours = 0.0;
                rec.totalPay = 0;
            } else {
                rec.clockIn = "08:00";
                rec.clockOut = "17:00"; // 08:00 a 17:00 = 8 hs trabajadas reales
                rec.hours = 8.0;
                this.recalculateRecordPay(rec);
            }
            store.saveData();
            this.renderActiveTab();
        }
    }

    updateDailyClock(recId, field, timeVal) {
        const rec = store.attendance.find(a => a.id === recId);
        if (rec) {
            if (rec.paymentStatus === "Liquidado") {
                app.showToast("No se puede modificar una asistencia ya liquidada.", "error");
                this.renderActiveTab();
                return;
            }
            rec[field] = timeVal;
            // Calcular horas basándose en la resta de horas y descontar almuerzo
            try {
                const inArr = rec.clockIn.split(':');
                const outArr = rec.clockOut.split(':');
                if (inArr.length === 2 && outArr.length === 2) {
                    const inHr = parseFloat(inArr[0]) + parseFloat(inArr[1])/60;
                    const outHr = parseFloat(outArr[0]) + parseFloat(outArr[1])/60;
                    let diff = outHr - inHr;
                    if (diff > 0) {
                        // Regla del almuerzo: Si la permanencia es de 7 horas o más, descontar 1 hora.
                        let finalHours = diff >= 7.0 ? (diff - 1.0) : diff;
                        rec.hours = Math.round(finalHours * 10) / 10; // decimal 1 dígito
                        this.recalculateRecordPay(rec);
                    }
                }
            } catch (e) {
                console.error("Error al calcular diferencia de horas", e);
            }
            store.saveData();
            this.renderActiveTab();
        }
    }

    updateDailyHours(recId, hoursVal) {
        const rec = store.attendance.find(a => a.id === recId);
        if (rec) {
            if (rec.paymentStatus === "Liquidado") {
                app.showToast("No se puede modificar una asistencia ya liquidada.", "error");
                this.renderActiveTab();
                return;
            }
            rec.hours = parseFloat(hoursVal) || 0.0;
            this.recalculateRecordPay(rec);
            store.saveData();
            this.renderActiveTab();
        }
    }

    recalculateRecordPay(rec) {
        const emp = store.employees.find(e => e.id === rec.employeeId);
        if (!emp) return;

        const maxRegular = store.settings.jornadaNormal; // Jornada límite
        const hourlyRate = emp.hourlyRate || store.settings.valorHoraNormal;
        const extraRate = emp.extraHourlyRate || store.settings.valorHoraExtra;

        if (rec.hours > maxRegular) {
            rec.normalHours = maxRegular;
            rec.extraHours = rec.hours - maxRegular;
        } else {
            rec.normalHours = rec.hours;
            rec.extraHours = 0.0;
        }

        rec.totalPay = Math.round((rec.normalHours * hourlyRate) + (rec.extraHours * extraRate));
    }


    // --- TAB 3: LIQUIDACIÓN DE SUELDOS (REDISEÑADA) ---
    renderPayrollTab(container) {
        // Asegurar que selectedJournalIds solo contenga jornales válidos y pendientes
        this.selectedJournalIds = this.selectedJournalIds.filter(id => {
            const rec = store.attendance.find(a => a.id === id);
            return rec && rec.paymentStatus === "Pendiente" && rec.status === "Presente";
        });

        // Filtrar jornales según filtros seleccionados
        const allPresentAttendance = store.attendance.filter(rec => rec.status === "Presente");

        // Jornales que coinciden con los filtros para la tabla principal
        let mainFiltered = allPresentAttendance;
        if (this.payrollEmployeeFilter) {
            mainFiltered = mainFiltered.filter(rec => rec.employeeId === this.payrollEmployeeFilter);
        }
        if (this.payrollStatusFilter) {
            mainFiltered = mainFiltered.filter(rec => rec.paymentStatus === this.payrollStatusFilter);
        }

        // Historial de jornales liquidados (para la tabla inferior)
        let liquidatedHistory = allPresentAttendance.filter(rec => rec.paymentStatus === "Liquidado");
        if (this.payrollEmployeeFilter) {
            liquidatedHistory = liquidatedHistory.filter(rec => rec.employeeId === this.payrollEmployeeFilter);
        }
        // Ordenar por fecha descendente
        liquidatedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calcular KPIs de jornales pendientes
        let pendingNormalHours = 0;
        let pendingExtraHours = 0;
        let pendingTotalPay = 0;
        allPresentAttendance.filter(rec => rec.paymentStatus === "Pendiente").forEach(rec => {
            pendingNormalHours += rec.normalHours;
            pendingExtraHours += rec.extraHours;
            pendingTotalPay += rec.totalPay;
        });

        // Calcular total a pagar de la selección grupal
        let selectedPaySum = 0;
        this.selectedJournalIds.forEach(id => {
            const rec = store.attendance.find(a => a.id === id);
            if (rec) selectedPaySum += rec.totalPay;
        });

        // Opciones de operarios para los filtros
        let employeeOptions = `<option value="">-- Todos los Operarios --</option>`;
        store.employees.forEach(emp => {
            const labelSuffix = emp.status === "Inactivo" ? " (Inactivo)" : "";
            employeeOptions += `<option value="${emp.id}" ${this.payrollEmployeeFilter === emp.id ? 'selected' : ''}>${emp.name}${labelSuffix}</option>`;
        });

        // Filas para la tabla principal
        let mainRowsHtml = "";
        if (mainFiltered.length === 0) {
            mainRowsHtml = `<tr><td colspan="9" style="text-align:center; color:var(--color-text-muted); padding:20px;">No se encontraron jornales registrados para los filtros seleccionados.</td></tr>`;
        } else {
            mainFiltered.forEach(rec => {
                const emp = store.employees.find(e => e.id === rec.employeeId);
                if (!emp) return;

                const isChecked = this.selectedJournalIds.includes(rec.id);
                const showCheckbox = rec.paymentStatus === "Pendiente";
                const dateStr = new Date(rec.date).toLocaleDateString("es-AR");

                mainRowsHtml += `
                    <tr>
                        <td style="text-align:center;">
                            ${showCheckbox ? `<input type="checkbox" style="width:16px; height:16px; cursor:pointer;" ${isChecked ? 'checked' : ''} onchange="assemblyModule.toggleJournalSelection('${rec.id}', this.checked)">` : '—'}
                        </td>
                        <td>${dateStr}</td>
                        <td><strong>${emp.name}</strong></td>
                        <td style="text-align:center;">${rec.clockIn} - ${rec.clockOut}</td>
                        <td style="text-align:center;">${rec.hours.toFixed(1)} hs</td>
                        <td style="text-align:center;">${rec.normalHours.toFixed(1)} hs</td>
                        <td style="text-align:center; color:var(--color-gold); font-weight:600;">${rec.extraHours.toFixed(1)} hs</td>
                        <td style="text-align:right; font-weight:600;">$${rec.totalPay.toLocaleString('es-AR')}</td>
                        <td style="text-align:center;">
                            <span class="badge ${rec.paymentStatus === 'Liquidado' ? 'delivered' : 'pending'}">${rec.paymentStatus}</span>
                        </td>
                    </tr>
                `;
            });
        }

        // Filas para la tabla inferior de historial
        let historyRowsHtml = "";
        if (liquidatedHistory.length === 0) {
            historyRowsHtml = `<tr><td colspan="6" style="text-align:center; color:var(--color-text-muted); padding:15px;">No hay jornales liquidados en el historial.</td></tr>`;
        } else {
            // Mostrar los últimos 20 registros liquidados
            liquidatedHistory.slice(0, 20).forEach(rec => {
                const emp = store.employees.find(e => e.id === rec.employeeId);
                if (!emp) return;
                const dateStr = new Date(rec.date).toLocaleDateString("es-AR");
                const nameSuffix = emp.status === "Inactivo" ? " <span style='color:var(--color-red); font-size:0.75rem;'>(Inactivo)</span>" : "";

                historyRowsHtml += `
                    <tr>
                        <td>${dateStr}</td>
                        <td><strong>${emp.name}${nameSuffix}</strong></td>
                        <td style="text-align:center;">${rec.hours.toFixed(1)} hs (Ex: ${rec.extraHours.toFixed(1)})</td>
                        <td style="text-align:right; font-weight:600; color:var(--color-green);">$${rec.totalPay.toLocaleString('es-AR')}</td>
                        <td style="text-align:center;"><span class="badge delivered">${rec.paymentStatus}</span></td>
                        <td style="text-align:center;">
                            <button class="btn btn-secondary btn-sm" onclick="assemblyModule.revertJournal('${rec.id}')" style="color:var(--color-red); padding:2px 8px; font-size:0.75rem;">Revertir</button>
                        </td>
                    </tr>
                `;
            });
        }

        // Verificar si todos los ítems de la tabla principal que son pendientes están marcados
        const pendingVisibleIds = mainFiltered.filter(rec => rec.paymentStatus === "Pendiente").map(rec => rec.id);
        const isAllSelected = pendingVisibleIds.length > 0 && pendingVisibleIds.every(id => this.selectedJournalIds.includes(id));

        container.innerHTML = `
            <!-- KPIs Generales de Pendientes de Pago -->
            <div class="kpi-container" style="margin-bottom:20px;">
                <div class="kpi-card">
                    <div class="kpi-icon blue">⏱️</div>
                    <div class="kpi-info">
                        <h4>Horas Pendientes Totales</h4>
                        <div class="value">${(pendingNormalHours + pendingExtraHours).toFixed(1)} hs</div>
                        <span style="font-size:0.75rem; color:var(--color-text-muted);">Normal: ${pendingNormalHours.toFixed(1)} | Extra: ${pendingExtraHours.toFixed(1)}</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon green">💵</div>
                    <div class="kpi-info">
                        <h4>Monto Pendiente Total</h4>
                        <div class="value" style="color:var(--color-red); font-size:1.6rem;">$${pendingTotalPay.toLocaleString('es-AR')}</div>
                        <span style="font-size:0.75rem; color:var(--color-text-muted);">Jornales pendientes de liquidación</span>
                    </div>
                </div>
            </div>

            <!-- Filtros de Búsqueda -->
            <div class="card" style="margin-bottom:20px; padding:15px;">
                <div class="card-title" style="font-size:0.95rem; margin-bottom:10px;">Filtros de Liquidación</div>
                <div style="display:flex; gap:15px; align-items:center; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:600;">Operario:</label>
                        <select id="payroll-employee-filter" class="form-control" style="width:200px; padding:4px;" onchange="assemblyModule.changePayrollFilters()">
                            ${employeeOptions}
                        </select>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:600;">Estado:</label>
                        <select id="payroll-status-filter" class="form-control" style="width:150px; padding:4px;" onchange="assemblyModule.changePayrollFilters()">
                            <option value="Pendiente" ${this.payrollStatusFilter === 'Pendiente' ? 'selected' : ''}>Pendientes</option>
                            <option value="Liquidado" ${this.payrollStatusFilter === 'Liquidado' ? 'selected' : ''}>Liquidados</option>
                            <option value="" ${this.payrollStatusFilter === '' ? 'selected' : ''}>-- Todos --</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Panel de Selección Grupal -->
            ${this.selectedJournalIds.length > 0 ? `
                <div class="card" style="background:rgba(47, 121, 104, 0.08); border: 2px solid var(--color-green); margin-bottom:20px; padding:15px; display:flex; justify-content:space-between; align-items:center; animation: fadeIn 0.2s ease;">
                    <div>
                        <h4 style="color:var(--color-green); margin:0 0 4px 0;">Liquidación Masiva</h4>
                        <span style="font-size:0.9rem;">
                            Seleccionados: <strong>${this.selectedJournalIds.length}</strong> registros | Total a Liquidar: <strong style="font-size:1.1rem; color:var(--color-green);">$${selectedPaySum.toLocaleString('es-AR')}</strong>
                        </span>
                    </div>
                    <button class="btn btn-green" onclick="assemblyModule.liquidateSelectedJournals()">
                        💰 Pagar / Liquidar Jornales
                    </button>
                </div>
            ` : ''}

            <!-- Tabla Principal -->
            <div class="card" style="margin-bottom:30px;">
                <div class="card-title">Planilla de Jornales del Personal</div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width:40px; text-align:center;">
                                    ${this.payrollStatusFilter === 'Pendiente' || this.payrollStatusFilter === '' ? `
                                        <input type="checkbox" style="width:16px; height:16px; cursor:pointer;" ${isAllSelected ? 'checked' : ''} onchange="assemblyModule.toggleSelectAllJournals(this.checked)">
                                    ` : '—'}
                                </th>
                                <th>Fecha</th>
                                <th>Operario</th>
                                <th style="text-align:center;">Horario</th>
                                <th style="text-align:center;">Hs Totales</th>
                                <th style="text-align:center;">Hs Normales</th>
                                <th style="text-align:center;">Hs Extras</th>
                                <th style="text-align:right;">Subtotal Neto</th>
                                <th style="text-align:center;">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mainRowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Historial de Jornales Liquidados (Sección Inferior de Auditoría) -->
            <div class="card">
                <div class="card-title" style="color:var(--color-text-muted);">Historial Reciente de Jornales Liquidados</div>
                <p style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:12px;">Últimos jornales marcados como Liquidados. Utilice el botón "Revertir" si necesita corregir algún pago.</p>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Operario</th>
                                <th style="text-align:center;">Horas</th>
                                <th style="text-align:right;">Monto Pagado</th>
                                <th style="text-align:center;">Estado</th>
                                <th style="text-align:center;">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historyRowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    changePayrollFilters() {
        this.payrollEmployeeFilter = document.getElementById("payroll-employee-filter").value;
        this.payrollStatusFilter = document.getElementById("payroll-status-filter").value;
        this.selectedJournalIds = []; // resetear selección al cambiar filtros
        this.renderActiveTab();
    }

    toggleSelectAllJournals(checked) {
        // Encontrar todos los jornales pendientes que están actualmente visibles
        const allPresentAttendance = store.attendance.filter(rec => rec.status === "Presente" && rec.paymentStatus === "Pendiente");
        let mainFiltered = allPresentAttendance;
        if (this.payrollEmployeeFilter) {
            mainFiltered = mainFiltered.filter(rec => rec.employeeId === this.payrollEmployeeFilter);
        }
        if (this.payrollStatusFilter) {
            mainFiltered = mainFiltered.filter(rec => rec.paymentStatus === this.payrollStatusFilter);
        }

        const visibleIds = mainFiltered.map(rec => rec.id);

        if (checked) {
            // Añadir todos los visibles si no están ya en la selección
            visibleIds.forEach(id => {
                if (!this.selectedJournalIds.includes(id)) {
                    this.selectedJournalIds.push(id);
                }
            });
        } else {
            // Remover todos los visibles de la selección
            this.selectedJournalIds = this.selectedJournalIds.filter(id => !visibleIds.includes(id));
        }

        this.renderActiveTab();
    }

    toggleJournalSelection(id, checked) {
        if (checked) {
            if (!this.selectedJournalIds.includes(id)) {
                this.selectedJournalIds.push(id);
            }
        } else {
            this.selectedJournalIds = this.selectedJournalIds.filter(x => x !== id);
        }
        this.renderActiveTab();
    }

    liquidateSelectedJournals() {
        if (this.selectedJournalIds.length === 0) return;

        if (confirm(`¿Está seguro de marcar como LIQUIDADOS y PAGADOS los ${this.selectedJournalIds.length} jornales seleccionados?`)) {
            let count = 0;
            this.selectedJournalIds.forEach(id => {
                const rec = store.attendance.find(a => a.id === id);
                if (rec && rec.paymentStatus === "Pendiente") {
                    rec.paymentStatus = "Liquidado";
                    
                    // Registrar el gasto automático
                    const emp = store.employees.find(e => e.id === rec.employeeId);
                    const empName = emp ? emp.name : "Operario Desconocido";
                    
                    if (!store.expenses) store.expenses = [];
                    store.expenses.push({
                        id: "exp_pay_" + rec.id,
                        date: new Date().toISOString().split('T')[0],
                        description: `Pago jornal ${rec.date} - ${empName}`,
                        category: "Sueldos",
                        amount: rec.totalPay,
                        notes: `Liquidado automáticamente por Cola de Armado`,
                        employeeId: rec.employeeId,
                        employeeName: empName,
                        attendanceId: rec.id
                    });
                    
                    count++;
                }
            });
            store.saveData();
            app.showToast(`${count} jornales liquidados y cargados como gastos de Sueldos con éxito.`, "success");
            this.selectedJournalIds = [];
            this.renderActiveTab();
        }
    }

    revertJournal(id) {
        const rec = store.attendance.find(a => a.id === id);
        if (rec) {
            if (confirm(`¿Está seguro de revertir este jornal a PENDIENTE de pago?`)) {
                rec.paymentStatus = "Pendiente";
                
                // Eliminar el gasto automático asociado
                if (store.expenses) {
                    store.expenses = store.expenses.filter(e => e.attendanceId !== id);
                }
                
                store.saveData();
                app.showToast("Jornal revertido a pendiente de pago y gasto de sueldo eliminado.", "info");
                this.renderActiveTab();
            }
        }
    }
}

// Ámbito global
window.assemblyModule = new AssemblyModule();
