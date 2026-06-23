// Módulo de Tablero Central: Panel de Guerra y Calculadora de Compras Consolidadas

class DashboardModule {
    constructor() {
        this.activeTab = "operativo";
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        const mainContent = document.getElementById("main-content");
        this.render(mainContent);
    }

    render(container) {
        container.innerHTML = `
            <div class="tabs-navigation" style="display:flex; border-bottom: 2px solid var(--color-border); margin-bottom:20px; gap:20px; flex-shrink:0;">
                <button class="tab-btn ${this.activeTab === 'operativo' ? 'active' : ''}" onclick="dashboardModule.switchTab('operativo')" style="background:none; border:none; border-bottom: 3px solid ${this.activeTab === 'operativo' ? 'var(--color-blue)' : 'transparent'}; font-family:inherit; font-size:0.95rem; padding:10px 5px; font-weight:600; cursor:pointer; color: ${this.activeTab === 'operativo' ? 'var(--color-blue)' : 'var(--color-text-muted)'}; display:flex; align-items:center; gap:6px;">
                    📈 Tablero Operativo
                </button>
                <button class="tab-btn ${this.activeTab === 'rentabilidad' ? 'active' : ''}" onclick="dashboardModule.switchTab('rentabilidad')" style="background:none; border:none; border-bottom: 3px solid ${this.activeTab === 'rentabilidad' ? 'var(--color-blue)' : 'transparent'}; font-family:inherit; font-size:0.95rem; padding:10px 5px; font-weight:600; cursor:pointer; color: ${this.activeTab === 'rentabilidad' ? 'var(--color-blue)' : 'var(--color-text-muted)'}; display:flex; align-items:center; gap:6px;">
                    💰 Rentabilidad Financiera
                </button>
            </div>
            <div id="tab-content"></div>
        `;

        const tabContent = document.getElementById("tab-content");

        if (this.activeTab === "operativo") {
            this.renderOperativo(tabContent);
        } else {
            this.renderRentabilidad(tabContent);
        }
    }

    renderOperativo(container) {
        let totalOrders = 0;
        let blockedOrders = 0;
        let readyToAssemble = 0;      // estado derivado "Confirmado" (0 cajas armadas)
        let armadoParcial = 0;        // estado derivado "Armado Parcial"
        let entregasPendientes = 0;   // entregas individuales no despachadas ni entregadas
        let entregasEnRuta = 0;       // entregas individuales "Despachada"

        let totalCajasRequired = 0;
        let totalCajasAssembled = 0;  // suma real de cajasArmadas
        let totalShippingCost = 0;

        let alertDeliveredWithDebt = 0;
        let alertConfirmedNoAdvance = 0;
        let alertArmadoParcialList = []; // para mostrar en alertas

        store.orders.forEach(order => {
            if (order.status === "Cancelado" || order.status === "Presupuesto Enviado") return;
            totalOrders++;

            const derived = store.deriveOrderStatus(order);
            const semColor = window.salesModule ? window.salesModule.getSemaforoColor(order) : "verde";
            if (semColor === "rojo") blockedOrders++;

            if (derived === "Confirmado") readyToAssemble++;
            if (derived === "Armado Parcial") {
                armadoParcial++;
                alertArmadoParcialList.push({ order, derived });
            }

            // Cajas reales armadas
            const cajasArmadas = (order.armado || {}).cajasArmadas || 0;
            totalCajasRequired += order.numberOfBoxes || 0;
            totalCajasAssembled += cajasArmadas;

            // Contar entregas individuales
            (order.entregas || []).forEach(e => {
                if (e.status === "Pendiente") entregasPendientes++;
                if (e.status === "Despachada") entregasEnRuta++;
            });

            totalShippingCost += (order.shippingRealCost || 0);

            // Alertas financieras
            if (derived === "Entregado" && order.paymentStatus !== "Pagado") alertDeliveredWithDebt++;

            const totalCobrado = (order.entidadesFacturacion || []).reduce((s, ef) => s + (ef.pagos || []).reduce((a, p) => a + p.amount, 0), 0)
                || (order.payments || []).reduce((s, p) => s + p.amount, 0);
            if (derived === "Confirmado" && totalCobrado === 0) alertConfirmedNoAdvance++;
        });

        const assemblyPercent = totalCajasRequired > 0 ? Math.round((totalCajasAssembled / totalCajasRequired) * 100) : 0;
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        // Construir bloque de alertas
        const hasAlerts = alertDeliveredWithDebt > 0 || alertConfirmedNoAdvance > 0 || armadoParcial > 0;
        const alertBlock = hasAlerts ? `
            <div class="card" style="background:rgba(220,30,50,0.08); border:1px solid var(--color-red); margin-bottom:24px;">
                <h3 style="color:var(--color-red); font-size:1rem; display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                    ⚠️ Alertas Operativas y Financieras
                </h3>
                <ul style="padding-left:20px; font-size:0.88rem; line-height:1.9;">
                    ${alertDeliveredWithDebt > 0 ? `<li>Hay <strong>${alertDeliveredWithDebt} pedido(s) entregado(s)</strong> con saldo pendiente de pago.</li>` : ""}
                    ${alertConfirmedNoAdvance > 0 ? `<li>Hay <strong>${alertConfirmedNoAdvance} pedido(s) confirmado(s)</strong> sin seña/anticipo registrado.</li>` : ""}
                    ${armadoParcial > 0 ? `<li>Hay <strong>${armadoParcial} pedido(s) con armado parcial</strong> — producción en curso:
                        <ul style="margin-top:4px;">
                            ${alertArmadoParcialList.map(({ order }) => {
                                const a = (order.armado || {}).cajasArmadas || 0;
                                const t = order.numberOfBoxes || 0;
                                return `<li style="font-size:0.82rem;">${esc(order.clientName)} — <strong>${a}/${t} cajas</strong> armadas</li>`;
                            }).join("")}
                        </ul>
                    </li>` : ""}
                </ul>
            </div>` : "";

        container.innerHTML = `
            <div class="page-header" style="margin-top:0;">
                <div class="page-title">
                    <h2>Panel de Guerra Operativo</h2>
                    <p>Estado global del negocio, cuellos de botella en producción y abastecimiento crítico.</p>
                </div>
            </div>

            <!-- KPIs Operativos -->
            <div class="kpi-container">
                <div class="kpi-card" style="border-left:4px solid var(--color-red);">
                    <div class="kpi-icon red">🚨</div>
                    <div class="kpi-info">
                        <h4>Pedidos Bloqueados</h4>
                        <div class="value">${blockedOrders}</div>
                    </div>
                </div>
                <div class="kpi-card" style="border-left:4px solid var(--color-gold);">
                    <div class="kpi-icon yellow">📦</div>
                    <div class="kpi-info">
                        <h4>Listos para Armar</h4>
                        <div class="value">${readyToAssemble}</div>
                        ${armadoParcial > 0 ? `<div style="font-size:0.72rem; color:var(--color-gold); font-weight:600; margin-top:2px;">${armadoParcial} armado parcial</div>` : ""}
                    </div>
                </div>
                <div class="kpi-card" style="border-left:4px solid var(--color-blue);">
                    <div class="kpi-icon blue">🚛</div>
                    <div class="kpi-info">
                        <h4>Entregas Pendientes</h4>
                        <div class="value">${entregasPendientes}</div>
                        ${entregasEnRuta > 0 ? `<div style="font-size:0.72rem; color:var(--color-gold); font-weight:600; margin-top:2px;">${entregasEnRuta} en ruta</div>` : ""}
                    </div>
                </div>
                <div class="kpi-card" style="border-left:4px solid var(--color-green);">
                    <div class="kpi-icon green">💰</div>
                    <div class="kpi-info">
                        <h4>Gasto Real Envíos</h4>
                        <div class="value">${fmt(totalShippingCost)}</div>
                    </div>
                </div>
            </div>

            ${alertBlock}

            <!-- Recordatorios de Hoy -->
            ${this.renderRemindersBlock()}

            <!-- Fila Central: Progreso de Armado y Compras Consolidadas -->
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px;">
                
                <!-- Progreso de Producción -->
                <div class="card" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
                    <h3 class="card-title" style="width:100%; text-align:left;">Progreso de Armado</h3>
                    
                    <div style="position:relative; width: 150px; height: 150px; margin: 20px 0;">
                        <svg width="150" height="150" class="progress-ring">
                            <circle stroke="var(--color-border)" stroke-width="12" fill="transparent" r="60" cx="75" cy="75"/>
                            <circle stroke="var(--color-green)" stroke-width="12" fill="transparent" r="60" cx="75" cy="75"
                                    stroke-dasharray="376.8" stroke-dashoffset="${376.8 - (376.8 * assemblyPercent / 100)}"
                                    style="transition: stroke-dashoffset 0.5s ease;"/>
                        </svg>
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:1.6rem; font-weight:700;">
                            ${assemblyPercent}%
                        </div>
                    </div>
                    
                    <div style="font-size:0.95rem; color:var(--color-text-muted);">
                        Cajas Armadas: <strong>${totalCajasAssembled}</strong> de <strong>${totalCajasRequired}</strong> requeridas.
                    </div>
                </div>

                <!-- Calculadora de Compras Consolidadas -->
                <div class="card">
                    <div class="card-title">
                        <span>📋 Calculadora de Compras Consolidadas (Proveedor)</span>
                        <button class="btn btn-gold btn-sm" onclick="dashboardModule.downloadPurchaseList()" id="btn-dl-purchase">Descargar Lista</button>
                    </div>
                    <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:15px;">
                        Detalle acumulado de insumos requeridos para pedidos activos frente al stock disponible en depósito.
                    </p>
                    <div class="table-container" style="max-height: 220px; overflow-y:auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Insumo</th>
                                    <th>Stock Físico</th>
                                    <th>Comprometido</th>
                                    <th>Faltante (Comprar)</th>
                                </tr>
                            </thead>
                            <tbody id="purchase-table-tbody">
                                <!-- Filas de compras -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.renderPurchaseCalculator();
    }

    renderRentabilidad(container) {
        // Calcular estadísticas financieras globales (excluyendo cancelados)
        const activeOrders = store.orders.filter(o => o.status !== "Cancelado");

        let totalRevenue = 0;
        let totalCostInsumos = 0;
        let totalShippingReal = 0;
        let totalShippingCharged = 0;
        let totalNetMargin = 0;

        activeOrders.forEach(o => {
            const rev = o.total || 0;
            const cost = o.costEst || 0;
            const shipReal = o.shippingRealCost || 0;
            const shipCharged = o.shippingCharged || 0;
            
            totalRevenue += rev;
            totalCostInsumos += cost;
            totalShippingReal += shipReal;
            totalShippingCharged += shipCharged;
            totalNetMargin += (rev - cost - shipReal);
        });

        const totalCosts = totalCostInsumos + totalShippingReal;
        const totalProfitPercent = totalRevenue > 0 ? (totalNetMargin / totalRevenue) * 100 : 0;

        // Agrupación por cliente
        const clientsMap = {};
        activeOrders.forEach(o => {
            const name = o.clientName || "Sin Nombre";
            if (!clientsMap[name]) {
                clientsMap[name] = { name, ops: 0, revenue: 0, costEst: 0, shippingReal: 0, shippingCharged: 0, marginReal: 0 };
            }
            const rev = o.total || 0;
            const cost = o.costEst || 0;
            const shipReal = o.shippingRealCost || 0;
            const shipCharged = o.shippingCharged || 0;
            const margin = rev - cost - shipReal;

            clientsMap[name].ops++;
            clientsMap[name].revenue += rev;
            clientsMap[name].costEst += cost;
            clientsMap[name].shippingReal += shipReal;
            clientsMap[name].shippingCharged += shipCharged;
            clientsMap[name].marginReal += margin;
        });

        // Agrupación por vendedor
        const sellersMap = {};
        activeOrders.forEach(o => {
            const name = o.salesperson || "Sin Vendedor";
            if (!sellersMap[name]) {
                sellersMap[name] = { name, ops: 0, revenue: 0, costEst: 0, shippingReal: 0, shippingCharged: 0, marginReal: 0 };
            }
            const rev = o.total || 0;
            const cost = o.costEst || 0;
            const shipReal = o.shippingRealCost || 0;
            const shipCharged = o.shippingCharged || 0;
            const margin = rev - cost - shipReal;

            sellersMap[name].ops++;
            sellersMap[name].revenue += rev;
            sellersMap[name].costEst += cost;
            sellersMap[name].shippingReal += shipReal;
            sellersMap[name].shippingCharged += shipCharged;
            sellersMap[name].marginReal += margin;
        });

        // Formateadores rápidos
        const fmt = val => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

        container.innerHTML = `
            <div class="page-header" style="margin-top:0;">
                <div class="page-title">
                    <h2>Análisis de Rentabilidad Financiera</h2>
                    <p>Rentabilidad neta considerando costos de productos e impacto del flete (Precios Netos Sin IVA).</p>
                </div>
            </div>

            <!-- KPIs Financieros -->
            <div class="kpi-container" style="margin-bottom:24px;">
                <div class="kpi-card" style="border-left: 4px solid var(--color-blue);">
                    <div class="kpi-icon blue">💼</div>
                    <div class="kpi-info">
                        <h4>Ingresos Totales (Ventas)</h4>
                        <div class="value" style="font-size:1.3rem;">${fmt(totalRevenue)}</div>
                        <p style="font-size:0.75rem; color:var(--color-text-muted); margin:0;">Incluye envío cobrado</p>
                    </div>
                </div>
                <div class="kpi-card" style="border-left: 4px solid var(--color-red);">
                    <div class="kpi-icon red">📉</div>
                    <div class="kpi-info">
                        <h4>Costos Totales</h4>
                        <div class="value" style="font-size:1.3rem;">${fmt(totalCosts)}</div>
                        <p style="font-size:0.75rem; color:var(--color-text-muted); margin:0;">Prod: ${fmt(totalCostInsumos)} + Envío: ${fmt(totalShippingReal)}</p>
                    </div>
                </div>
                <div class="kpi-card" style="border-left: 4px solid var(--color-green);">
                    <div class="kpi-icon green">📊</div>
                    <div class="kpi-info">
                        <h4>Rentabilidad Neta (Margen)</h4>
                        <div class="value" style="font-size:1.3rem; color:var(--color-green);">${fmt(totalNetMargin)}</div>
                        <p style="font-size:0.75rem; color:var(--color-text-muted); margin:0;">Rent. Promedio: <strong>${totalProfitPercent.toFixed(1)}%</strong></p>
                    </div>
                </div>
                <div class="kpi-card" style="border-left: 4px solid var(--color-gold);">
                    <div class="kpi-icon yellow">🚛</div>
                    <div class="kpi-info">
                        <h4>Recupero Logístico</h4>
                        <div class="value" style="font-size:1.3rem;">${totalShippingReal > 0 ? ((totalShippingCharged / totalShippingReal) * 100).toFixed(0) + '%' : '100%'}</div>
                        <p style="font-size:0.75rem; color:var(--color-text-muted); margin:0;">Cobrado: ${fmt(totalShippingCharged)} / Real: ${fmt(totalShippingReal)}</p>
                    </div>
                </div>
            </div>

            <!-- Grilla Principal: Ventas Detalladas -->
            <div class="card" style="margin-bottom:24px;">
                <div class="card-title">Desglose de Rentabilidad por Operación</div>
                <div class="table-container" style="max-height: 350px; overflow-y:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                        <thead>
                            <tr style="position:sticky; top:0; z-index:10; background:rgba(0,0,0,0.05); text-align:left; border-bottom:2px solid var(--color-border);">
                                <th style="padding:8px;">Operación</th>
                                <th style="padding:8px;">Cliente</th>
                                <th style="padding:8px;">Vendedor</th>
                                <th style="padding:8px; text-align:center;">Cajas</th>
                                <th style="padding:8px; text-align:right;">Venta Total</th>
                                <th style="padding:8px; text-align:right;">Costo Insumos</th>
                                <th style="padding:8px; text-align:right;">Costo Envío Real</th>
                                <th style="padding:8px; text-align:right;">Envío Cobrado</th>
                                <th style="padding:8px; text-align:right;">Margen Neto</th>
                                <th style="padding:8px; text-align:center;">Rent. %</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activeOrders.map(o => {
                                const rev = o.total || 0;
                                const cost = o.costEst || 0;
                                const shipReal = o.shippingRealCost || 0;
                                const shipCharged = o.shippingCharged || 0;
                                const margin = rev - cost - shipReal;
                                const percent = rev > 0 ? (margin / rev) * 100 : 0;
                                return `
                                    <tr style="border-bottom:1px solid var(--color-border);">
                                        <td style="padding:8px;"><strong>#${o.id.substring(4)}</strong><br><span style="font-size:0.7rem; color:var(--color-text-muted);">${o.date}</span></td>
                                        <td style="padding:8px;">${esc(o.clientName)}</td>
                                        <td style="padding:8px;">${esc(o.salesperson || 'Sin Asignar')}</td>
                                        <td style="padding:8px; text-align:center;">${o.numberOfBoxes} u.</td>
                                        <td style="padding:8px; text-align:right; font-weight:600;">${fmt(rev)}</td>
                                        <td style="padding:8px; text-align:right; color:var(--color-text-muted);">${fmt(cost)}</td>
                                        <td style="padding:8px; text-align:right; color:var(--color-red);">${fmt(shipReal)}</td>
                                        <td style="padding:8px; text-align:right; color:var(--color-green);">${fmt(shipCharged)}</td>
                                        <td style="padding:8px; text-align:right; font-weight:700; color:${margin >= 0 ? 'var(--color-green)' : 'var(--color-red)'};">${fmt(margin)}</td>
                                        <td style="padding:8px; text-align:center; font-weight:600; color:${margin >= 0 ? 'var(--color-green)' : 'var(--color-red)'};">${percent.toFixed(1)}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Fila Inferior: Agrupación por Clientes y Rendimiento de Vendedores -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px;">
                
                <!-- Rentabilidad por Cliente -->
                <div class="card">
                    <div class="card-title">Acumulado por Cliente (Empresa)</div>
                    <div class="table-container" style="max-height: 280px; overflow-y:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <thead>
                                <tr style="border-bottom:2px solid var(--color-border); text-align:left;">
                                    <th style="padding:8px;">Cliente</th>
                                    <th style="padding:8px; text-align:center;">Ops</th>
                                    <th style="padding:8px; text-align:right;">Facturación</th>
                                    <th style="padding:8px; text-align:right;">Envío Real</th>
                                    <th style="padding:8px; text-align:right;">Margen Neto</th>
                                    <th style="padding:8px; text-align:center;">Rent. %</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.values(clientsMap).sort((a,b) => b.marginReal - a.marginReal).map(c => {
                                    const percent = c.revenue > 0 ? (c.marginReal / c.revenue) * 100 : 0;
                                    return `
                                        <tr style="border-bottom:1px solid var(--color-border);">
                                            <td style="padding:8px;"><strong>${c.name}</strong></td>
                                            <td style="padding:8px; text-align:center;">${c.ops}</td>
                                            <td style="padding:8px; text-align:right;">${fmt(c.revenue)}</td>
                                            <td style="padding:8px; text-align:right; color:var(--color-red);">${fmt(c.shippingReal)}</td>
                                            <td style="padding:8px; text-align:right; font-weight:700; color:var(--color-green);">${fmt(c.marginReal)}</td>
                                            <td style="padding:8px; text-align:center; font-weight:600;">${percent.toFixed(0)}%</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Rendimiento por Vendedor -->
                <div class="card">
                    <div class="card-title">Rendimiento Comercial y Rentabilidad</div>
                    <div class="table-container" style="max-height: 280px; overflow-y:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <thead>
                                <tr style="border-bottom:2px solid var(--color-border); text-align:left;">
                                    <th style="padding:8px;">Vendedor</th>
                                    <th style="padding:8px; text-align:center;">Ventas</th>
                                    <th style="padding:8px; text-align:right;">Total Ventas</th>
                                    <th style="padding:8px; text-align:right;">Margen Neto</th>
                                    <th style="padding:8px; text-align:center;">Rent. %</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.values(sellersMap).sort((a,b) => b.marginReal - a.marginReal).map(s => {
                                    const percent = s.revenue > 0 ? (s.marginReal / s.revenue) * 100 : 0;
                                    return `
                                        <tr style="border-bottom:1px solid var(--color-border);">
                                            <td style="padding:8px;"><strong>${s.name}</strong></td>
                                            <td style="padding:8px; text-align:center;">${s.ops}</td>
                                            <td style="padding:8px; text-align:right;">${fmt(s.revenue)}</td>
                                            <td style="padding:8px; text-align:right; font-weight:700; color:var(--color-green);">${fmt(s.marginReal)}</td>
                                            <td style="padding:8px; text-align:center; font-weight:600; color:var(--color-blue);">${percent.toFixed(1)}%</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Calcula el plan de compras basado en stock físico real.
    // El stock se descuenta físicamente al confirmar cada venta (salesModule.executeOrderConfirmation),
    // por lo que un stock negativo indica directamente la cantidad a comprar.
    calculateConsolidatedPurchases() {
        const purchaseList = [];
        store.products.forEach(prod => {
            if (prod.stock < 0) {
                purchaseList.push({
                    id: prod.id,
                    name: prod.name,
                    brand: prod.brand || "",
                    stock: prod.stock,           // ya negativo
                    committed: Math.abs(prod.stock),
                    buyQty: Math.abs(prod.stock) // cuánto hay que comprar para nivelar a 0
                });
            }
        });
        // Ordenar por mayor déficit primero
        purchaseList.sort((a, b) => a.stock - b.stock);
        return purchaseList;
    }

    renderPurchaseCalculator() {
        const tbody = document.getElementById("purchase-table-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        const purchaseList = this.calculateConsolidatedPurchases();

        if (purchaseList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-green); font-weight:600; padding:30px;">✓ Todo abastecido. No hay insumos faltantes según la demanda actual.</td></tr>`;
            const btn = document.getElementById("btn-dl-purchase");
            if (btn) btn.style.display = "none";
            return;
        }

        const btn = document.getElementById("btn-dl-purchase");
        if (btn) btn.style.display = "inline-flex";

        tbody.innerHTML = purchaseList.map(item => `
                <tr>
                    <td><strong>${esc(item.name)}</strong><br><span style="font-size:0.75rem; color:var(--color-text-muted);">${item.brand ? esc(item.brand) : 'Sin Marca'}</span></td>
                    <td>${item.stock} u.</td>
                    <td style="color:var(--color-blue);">${item.committed} u.</td>
                    <td><strong style="color:var(--color-red); font-size:1rem;">${item.buyQty} u.</strong></td>
                </tr>
            `).join("");
    }

    downloadPurchaseList() {
        const purchaseList = this.calculateConsolidatedPurchases();
        if (purchaseList.length === 0) return;

        let csvContent = "\uFEFF"; // UTF-8 BOM
        csvContent += "CONSOLIDADO DE COMPRAS A PROVEEDOR - NAVIDAD Y EMPRESAS\n";
        csvContent += `Fecha Reporte:;${new Date().toLocaleDateString("es-AR")}\n\n`;
        csvContent += "INSUMO;MARCA;STOCK ACTUAL;COMPROMETIDO;CANTIDAD A COMPRAR\n";

        purchaseList.forEach(item => {
            csvContent += `"${item.name}";"${item.brand || ''}";${item.stock};${item.committed};${item.buyQty}\n`;
        });

        // Descarga
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Consolidado_Compras_Proveedores.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        app.showToast("Lista de compras a proveedor descargada", "success");
    }

    // ─── BLOQUE RECORDATORIOS DE HOY ────────────────────────────────────────────
    renderRemindersBlock() {
        const today = new Date().toISOString().split('T')[0];
        const items = [];

        store.leads.forEach(lead => {
            if (lead.status === "Descartado" || !lead.reminders) return;
            lead.reminders.forEach(rem => {
                if (!rem.done && rem.date <= today) {
                    items.push({ leadId: lead.id, clientName: lead.clientName, text: rem.text, date: rem.date, id: rem.id, overdue: rem.date < today });
                }
            });
        });

        if (items.length === 0) return "";

        items.sort((a, b) => a.date.localeCompare(b.date));

        const rows = items.map(item => {
            const dateLabel = item.date < today ? `<span style="color:var(--color-red); font-weight:700;">VENCIDO — ${new Date(item.date + "T00:00:00").toLocaleDateString("es-AR")}</span>` : `<span style="color:var(--color-gold);">HOY</span>`;
            return `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid var(--color-border); gap:10px;">
                <div>
                    <strong style="font-size:0.85rem;">${esc(item.clientName)}</strong>
                    <span style="font-size:0.8rem; color:var(--color-text-muted); margin-left:8px;">"${esc(item.text)}"</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                    ${dateLabel}
                    <button class="btn btn-secondary btn-sm" onclick="dashboardModule.markReminderDone('${item.leadId}','${item.id}')" style="padding:2px 8px; font-size:0.75rem;">✓ Listo</button>
                    <button class="btn btn-gold btn-sm" onclick="app.navigate('crm')" style="padding:2px 8px; font-size:0.75rem;">Ver Lead</button>
                </div>
            </div>`;
        }).join("");

        return `
            <div class="card" style="background:rgba(230,160,20,0.06); border:1px solid rgba(230,160,20,0.3); margin-bottom:24px;">
                <h3 style="color:var(--color-gold); font-size:1rem; display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                    🔔 Recordatorios de Hoy / Vencidos <span style="background:var(--color-red); color:white; border-radius:12px; padding:2px 8px; font-size:0.8rem;">${items.length}</span>
                </h3>
                <div>${rows}</div>
            </div>
        `;
    }

    markReminderDone(leadId, reminderId) {
        const lead = store.leads.find(l => l.id === leadId);
        if (lead && lead.reminders) {
            const rem = lead.reminders.find(r => r.id === reminderId);
            if (rem) {
                rem.done = true;
                store.saveData();
                app.showToast("Recordatorio marcado como completado.", "success");
                this.render(document.getElementById("main-content"));
            }
        }
    }
}

// Ámbito global
window.dashboardModule = new DashboardModule();
