// Módulo de Compras e Ingreso de Mercadería (NAVIDAD Y EMPRESAS)
// Todos los precios y costos en el sistema se consideran NETOS SIN IVA.

class PurchasesModule {
    constructor() {
        this.activeTab = "history"; // "history" o "new"
        this.newInvoiceItems = []; // Items del subformulario de la factura actual
        this.purchaseSearchQuery = ""; // Buscador de productos en carga de factura
        this.newInvoiceHeader = {
            provider: "",
            invoiceNumber: "",
            date: new Date().toISOString().split('T')[0]
        };
        
        // Filtros del historial
        this.filters = {
            provider: "",
            productId: "",
            dateFrom: "",
            dateTo: ""
        };
    }

    resetNewPurchaseForm() {
        this.newInvoiceItems = [];
        this.purchaseSearchQuery = "";
        this.newInvoiceHeader = {
            provider: "",
            invoiceNumber: "",
            date: new Date().toISOString().split('T')[0]
        };
    }

    render(container) {
        // Calcular estadísticas
        let totalActivePurchases = 0;
        let totalAmountSpent = 0;
        let totalItemsQty = 0;

        store.purchases.forEach(p => {
            if (p.status === "Activa") {
                totalActivePurchases++;
                totalAmountSpent += p.totalAmount;
                p.items.forEach(item => totalItemsQty += item.qty);
            }
        });

        const fmt = (num) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Compras e Ingreso de Mercadería <span style="font-size:0.9rem; color:var(--color-gold); font-weight:600;">(COSTOS NETOS SIN IVA)</span></h2>
                    <p>Carga de facturas de proveedores, ingreso automático de stock físico e historial de auditoría.</p>
                </div>
            </div>

            <div class="kpi-container">
                <div class="kpi-card">
                    <div class="kpi-icon blue">🧾</div>
                    <div class="kpi-info">
                        <h4>Facturas Activas</h4>
                        <div class="value">${totalActivePurchases}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon green">💸</div>
                    <div class="kpi-info">
                        <h4>Total Invertido</h4>
                        <div class="value">${fmt(totalAmountSpent)}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon gold">📦</div>
                    <div class="kpi-info">
                        <h4>Unidades Ingresadas</h4>
                        <div class="value">${totalItemsQty} u.</div>
                    </div>
                </div>
            </div>

            <div class="tab-container">
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'history' ? 'active' : ''}" id="tab-pur-history">Historial de Auditoría</div>
                    <div class="tab ${this.activeTab === 'new' ? 'active' : ''}" id="tab-pur-new">Registrar Nueva Compra</div>
                </div>
            </div>

            <div id="purchases-content-area">
                <!-- Se inyecta dinámicamente -->
            </div>
        `;

        document.getElementById("tab-pur-history").addEventListener("click", () => this.switchTab("history"));
        document.getElementById("tab-pur-new").addEventListener("click", () => this.switchTab("new"));

        this.renderActiveTab();
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        this.renderActiveTab();
    }

    renderActiveTab() {
        const area = document.getElementById("purchases-content-area");
        if (this.activeTab === "history") {
            this.renderHistoryTab(area);
        } else {
            this.renderNewPurchaseTab(area);
        }
    }

    // --- TAB 1: HISTORIAL DE AUDITORÍA ---
    renderHistoryTab(container) {
        const fmt = (num) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);

        // Generar las opciones del selector de productos en los filtros
        let productsOptions = `<option value="">Todos los productos</option>`;
        const sortedProducts = [...store.products].sort((a, b) => a.name.localeCompare(b.name));
        sortedProducts.forEach(prod => {
            productsOptions += `<option value="${prod.id}" ${this.filters.productId === prod.id ? 'selected' : ''}>[${prod.code}] ${prod.name}</option>`;
        });

        // Filtrar las compras
        const filteredPurchases = store.purchases.filter(p => {
            // Filtro de Proveedor
            if (this.filters.provider && !p.provider.toLowerCase().includes(this.filters.provider.toLowerCase())) {
                return false;
            }
            // Filtro de Producto
            if (this.filters.productId) {
                const hasProduct = p.items.some(item => item.productId === this.filters.productId);
                if (!hasProduct) return false;
            }
            // Filtro de Fecha Desde
            if (this.filters.dateFrom && p.date < this.filters.dateFrom) {
                return false;
            }
            // Filtro de Fecha Hasta
            if (this.filters.dateTo && p.date > this.filters.dateTo) {
                return false;
            }
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id));

        let rowsHtml = "";
        filteredPurchases.forEach(p => {
            const statusClass = p.status === "Activa" ? "delivered" : "canceled";
            const itemsText = p.items.map(item => `${item.name} x${item.qty}`).join(", ");
            const itemsSummary = itemsText.length > 50 ? itemsText.substring(0, 47) + "..." : itemsText;

            rowsHtml += `
                <tr>
                    <td><strong>${new Date(p.date + "T00:00:00").toLocaleDateString("es-AR")}</strong></td>
                    <td><strong>${p.provider}</strong></td>
                    <td><code>${p.invoiceNumber}</code></td>
                    <td title="${itemsText}">${itemsSummary}</td>
                    <td style="font-weight:600; color:var(--color-blue);">${fmt(p.totalAmount)}</td>
                    <td style="font-size:0.8rem; color:var(--color-text-muted);">${p.user}</td>
                    <td><span class="badge ${statusClass}">${p.status}</span></td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-secondary btn-sm" onclick="purchasesModule.openPurchaseDetailsModal('${p.id}')">Detalles</button>
                            ${p.status === "Activa" ? 
                                `<button class="btn btn-red btn-sm" onclick="purchasesModule.annulPurchase('${p.id}')">Anular</button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-title">Filtros de Búsqueda</div>
                <div class="form-row" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
                    <div class="form-group">
                        <label>Proveedor</label>
                        <input type="text" id="filter-pur-provider" class="form-control" placeholder="Ej: Distribuidora..." value="${this.filters.provider}">
                    </div>
                    <div class="form-group">
                        <label>Producto Contenido</label>
                        <select id="filter-pur-product" class="form-control">
                            ${productsOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fecha Desde</label>
                        <input type="date" id="filter-pur-date-from" class="form-control" value="${this.filters.dateFrom}">
                    </div>
                    <div class="form-group">
                        <label>Fecha Hasta</label>
                        <input type="date" id="filter-pur-date-to" class="form-control" value="${this.filters.dateTo}">
                    </div>
                </div>
                <div style="display:flex; justify-content: flex-end; gap:8px; margin-top:12px;">
                    <button class="btn btn-secondary btn-sm" onclick="purchasesModule.resetFilters()">Limpiar Filtros</button>
                    <button class="btn btn-primary btn-sm" onclick="purchasesModule.applyFilters()">Aplicar Filtros</button>
                </div>
            </div>

            <div class="card">
                <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Historial de Compras</span>
                    <button class="btn btn-secondary btn-sm" onclick="purchasesModule.exportPurchasesCSV()">⬇ Exportar CSV</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Proveedor</th>
                                <th>N° Factura</th>
                                <th>Productos</th>
                                <th>Monto Total</th>
                                <th>Cargado Por</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="8" style="text-align:center; color:var(--color-text-muted);">No se encontraron compras en el historial.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    applyFilters() {
        this.filters.provider = document.getElementById("filter-pur-provider").value.trim();
        this.filters.productId = document.getElementById("filter-pur-product").value;
        this.filters.dateFrom = document.getElementById("filter-pur-date-from").value;
        this.filters.dateTo = document.getElementById("filter-pur-date-to").value;
        this.renderActiveTab();
    }

    resetFilters() {
        this.filters = {
            provider: "",
            productId: "",
            dateFrom: "",
            dateTo: ""
        };
        this.renderActiveTab();
    }

    // --- TAB 2: REGISTRAR NUEVA COMPRA ---
    renderNewPurchaseTab(container) {
        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap:24px;">
                <!-- Panel Formulario Cabecera de Compra -->
                <div class="card" style="height: fit-content;">
                    <div class="card-title">Datos de Factura de Proveedor</div>
                    <form id="form-new-purchase" onsubmit="event.preventDefault();">
                        <datalist id="providers-datalist">
                            ${(store.providers || []).map(p => `<option value="${p}">`).join("")}
                        </datalist>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label>Proveedor *</label>
                            <input type="text" id="pur-provider" class="form-control" placeholder="Nombre de la empresa proveedora" value="${this.newInvoiceHeader.provider}" list="providers-datalist" required>
                            <div style="margin-top:4px; display:flex; gap:6px; align-items:center;">
                                <span style="font-size:0.75rem; color:var(--color-text-muted);">¿No está en la lista?</span>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="purchasesModule.addNewProvider()" style="padding:2px 8px; font-size:0.72rem;">+ Agregar proveedor</button>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label>N° Factura *</label>
                            <input type="text" id="pur-invoice-number" class="form-control" placeholder="Ej: A-0002-00045234" value="${this.newInvoiceHeader.invoiceNumber}" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label>Fecha de Factura *</label>
                            <input type="date" id="pur-date" class="form-control" value="${this.newInvoiceHeader.date}" required>
                        </div>
                        
                        <div style="border-top: 1px solid var(--color-border); padding-top: 15px; margin-top: 15px;">
                            <div style="font-size:0.9rem; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                <span>Total Neto Factura:</span>
                                <strong style="font-size:1.15rem; color:var(--color-green);" id="invoice-grand-total">$0</strong>
                            </div>
                            <button type="button" class="btn btn-primary" onclick="purchasesModule.savePurchase()" style="width:100%;">
                                Registrar Factura e Ingresar Stock
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="purchasesModule.cancelNewPurchase()" style="width:100%; margin-top:8px;">
                                Cancelar Carga
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Panel Formulario de Ítems / Productos -->
                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div class="card">
                        <div class="card-title" style="margin-bottom:12px;">Catálogo de Productos (Buscar y Agregar)</div>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <input type="text" id="pur-catalog-search" class="form-control" placeholder="🔍 Escriba aquí para buscar por nombre, código o proveedor..." value="${this.purchaseSearchQuery || ''}" style="width: 100%;">
                        </div>
                        <div id="pur-search-results-container" style="max-height: 250px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                            <!-- Se renderiza dinámicamente -->
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title">Detalle de Insumos Cargados en esta Factura</div>
                        <div class="table-container" style="max-height: 280px; overflow-y:auto;">
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width:120px;">Código</th>
                                        <th>Artículo</th>
                                        <th style="width:100px;">Cantidad</th>
                                        <th style="width:140px;">Costo Unitario</th>
                                        <th style="width:120px;">Subtotal</th>
                                        <th style="width:50px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="pur-items-tbody">
                                    <!-- Se inyecta dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Registrar escuchas para conservar datos de cabecera al cambiar de pestaña o agregar items
        document.getElementById("pur-provider").addEventListener("input", (e) => {
            this.newInvoiceHeader.provider = e.target.value;
        });
        document.getElementById("pur-invoice-number").addEventListener("input", (e) => {
            this.newInvoiceHeader.invoiceNumber = e.target.value;
        });
        document.getElementById("pur-date").addEventListener("input", (e) => {
            this.newInvoiceHeader.date = e.target.value;
        });

        // Registrar escucha para el buscador del catálogo
        const searchInput = document.getElementById("pur-catalog-search");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.purchaseSearchQuery = e.target.value;
                this.renderSearchProducts();
            });
        }

        // Renderizar el buscador y la grilla de ítems inicialmente
        this.renderSearchProducts();
        this.renderInvoiceItems();
    }

    renderSearchProducts() {
        const container = document.getElementById("pur-search-results-container");
        if (!container) return;

        let filtered = store.products;
        if (this.purchaseSearchQuery) {
            const q = this.purchaseSearchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(q) || 
                (p.brand && p.brand.toLowerCase().includes(q)) ||
                (p.code && p.code.toLowerCase().includes(q))
            );
        }

        // Ordenar por nombre
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

        if (filtered.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--color-text-muted);">No se encontraron productos.</div>`;
            return;
        }

        let html = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; table-layout: fixed;">
                <thead>
                    <tr style="background: rgba(0,0,0,0.05); border-bottom: 2px solid var(--color-border); text-align: left; font-weight: bold; position: sticky; top: 0; z-index: 10;">
                        <th style="padding: 6px 10px; width: 65%;">Artículo</th>
                        <th style="padding: 6px 10px; text-align: right; width: 20%;">Costo Act.</th>
                        <th style="padding: 6px 10px; text-align: center; width: 15%;"></th>
                    </tr>
                </thead>
                <tbody>
        `;

        filtered.forEach(p => {
            const formattedCost = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p.cost || 0);
            html += `
                <tr style="border-bottom: 1px solid var(--color-border);" class="catalog-row">
                    <td style="padding: 6px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${esc(p.name)}">
                        <span class="catalog-code-badge product-hover-code">${esc(p.code)}</span>
                        <strong>${esc(p.name)}</strong>
                        <span style="font-size:0.7rem; color:var(--color-text-muted); font-weight:normal; margin-left: 6px;">(${esc(p.brand)})</span>
                    </td>
                    <td style="padding: 6px 10px; text-align: right; font-weight: 600;">${formattedCost}</td>
                    <td style="padding: 6px 10px; text-align: center;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="purchasesModule.addCatalogProductToInvoice('${p.id}')" style="padding: 2px 6px; font-size: 0.75rem; font-weight:600;">+ Agregar</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;
        container.innerHTML = html;
    }

    renderInvoiceItems() {
        const tbody = document.getElementById("pur-items-tbody");
        if (!tbody) return;

        let itemsRowsHtml = "";
        let totalInvoice = 0;

        if (this.newInvoiceItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--color-text-muted); padding: 15px;">No ha agregado productos a esta factura todavía.</td></tr>';
            const totalSpan = document.getElementById("invoice-grand-total");
            if (totalSpan) totalSpan.innerText = "$0";
            return;
        }

        this.newInvoiceItems.forEach((item, idx) => {
            const subtotal = item.qty * item.unitCost;
            totalInvoice += subtotal;

            itemsRowsHtml += `
                <tr>
                    <td><code>${esc(item.code)}</code></td>
                    <td><strong>${esc(item.name)}</strong></td>
                    <td>
                        <input type="number" class="form-control" value="${item.qty}" min="1" step="1" 
                            style="width: 75px; padding: 4px 6px; font-size: 0.8rem; text-align: center;" 
                            oninput="purchasesModule.updateItemQty(${idx}, this.value)">
                    </td>
                    <td>
                        <div style="display:flex; align-items:center; gap:4px;">
                            <span style="font-size: 0.8rem; color: var(--color-text-muted);">$</span>
                            <input type="number" class="form-control" value="${item.unitCost}" min="0" step="0.01" 
                                style="width: 95px; padding: 4px 6px; font-size: 0.8rem; text-align: right;" 
                                oninput="purchasesModule.updateItemCost(${idx}, this.value)">
                        </div>
                    </td>
                    <td><strong id="subtotal-item-${idx}">$${subtotal.toLocaleString('es-AR')}</strong></td>
                    <td>
                        <button type="button" class="btn btn-red btn-sm" onclick="purchasesModule.removeInvoiceItem(${idx})" style="padding:2px 8px;">&times;</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = itemsRowsHtml;

        const totalSpan = document.getElementById("invoice-grand-total");
        if (totalSpan) {
            totalSpan.innerText = `$${totalInvoice.toLocaleString('es-AR')}`;
        }
    }

    addCatalogProductToInvoice(productId) {
        const prod = store.products.find(p => p.id === productId);
        if (!prod) return;

        const qty = 1;
        const cost = prod.cost || 0;

        // Comprobar si ya existe en la lista temporal para sumar cantidad
        const existingIdx = this.newInvoiceItems.findIndex(item => item.productId === productId);
        if (existingIdx !== -1) {
            this.newInvoiceItems[existingIdx].qty += qty;
        } else {
            this.newInvoiceItems.push({
                productId: prod.id,
                code: prod.code,
                name: prod.name,
                qty: qty,
                unitCost: cost
            });
        }

        app.showToast(`"${prod.name}" agregado a la factura.`, "success");
        this.renderInvoiceItems();
    }

    updateItemQty(idx, value) {
        const qty = parseInt(value) || 0;
        if (this.newInvoiceItems[idx]) {
            this.newInvoiceItems[idx].qty = qty;
            this.recalculateTotals();
        }
    }

    updateItemCost(idx, value) {
        const cost = parseFloat(value) || 0;
        if (this.newInvoiceItems[idx]) {
            this.newInvoiceItems[idx].unitCost = cost;
            this.recalculateTotals();
        }
    }

    recalculateTotals() {
        let totalInvoice = 0;
        this.newInvoiceItems.forEach((item, idx) => {
            const subtotal = item.qty * item.unitCost;
            totalInvoice += subtotal;
            const subtotalSpan = document.getElementById(`subtotal-item-${idx}`);
            if (subtotalSpan) {
                subtotalSpan.innerText = `$${subtotal.toLocaleString('es-AR')}`;
            }
        });
        const totalSpan = document.getElementById("invoice-grand-total");
        if (totalSpan) {
            totalSpan.innerText = `$${totalInvoice.toLocaleString('es-AR')}`;
        }
    }

    removeInvoiceItem(idx) {
        this.newInvoiceItems.splice(idx, 1);
        this.renderInvoiceItems();
    }

    cancelNewPurchase() {
        if (this.newInvoiceItems.length > 0 && !confirm("¿Está seguro de que desea cancelar la carga de esta factura? Perderá los productos agregados.")) {
            return;
        }
        this.resetNewPurchaseForm();
        this.switchTab("history");
    }

    savePurchase() {
        const provider = document.getElementById("pur-provider").value.trim();
        const invoiceNumber = document.getElementById("pur-invoice-number").value.trim();
        const date = document.getElementById("pur-date").value;

        if (!provider) {
            app.showToast("El nombre del proveedor es obligatorio", "error");
            return;
        }
        if (!invoiceNumber) {
            app.showToast("El número de factura es obligatorio", "error");
            return;
        }
        if (!date) {
            app.showToast("La fecha es obligatoria", "error");
            return;
        }
        if (this.newInvoiceItems.length === 0) {
            app.showToast("Debe agregar al menos un producto a la factura antes de guardar", "error");
            return;
        }

        // Comprobar que no haya cantidades inválidas (cero o menor)
        const hasInvalidQty = this.newInvoiceItems.some(item => item.qty <= 0);
        if (hasInvalidQty) {
            app.showToast("Todas las cantidades deben ser mayores a cero", "error");
            return;
        }

        const grandTotal = this.newInvoiceItems.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);

        // Crear la compra
        const purchase = {
            id: "pur_" + Date.now(),
            provider,
            invoiceNumber,
            date,
            items: [...this.newInvoiceItems],
            totalAmount: grandTotal,
            user: `${app.currentUser} (${app.currentRole})`,
            status: "Activa"
        };

        // 1. Aumentar stock físico
        purchase.items.forEach(item => {
            const product = store.products.find(p => p.id === item.productId);
            if (product) {
                product.stock = (product.stock || 0) + item.qty;
            }
        });

        // 2. Guardar en store primero
        store.purchases.push(purchase);
        store.saveData();

        app.showToast(`Factura registrada. Stock ingresado al almacén.`, "success");
        this.resetNewPurchaseForm();
        this.switchTab("history");

        // 3. Luego de guardar, verificar si hay costos que difieren y preguntar
        const itemsWithDiff = purchase.items.filter(item => {
            const product = store.products.find(p => p.id === item.productId);
            return product && product.cost !== item.unitCost;
        });

        if (itemsWithDiff.length > 0) {
            const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
            let diffList = itemsWithDiff.map(item => {
                const product = store.products.find(p => p.id === item.productId);
                return `• ${item.name}: actual ${fmt(product.cost)} → factura ${fmt(item.unitCost)}`;
            }).join("\n");

            const shouldUpdate = confirm(
                `Los siguientes productos tienen un costo diferente al registrado en la factura:\n\n${diffList}\n\n¿Desea actualizar el costo de estos productos en el catálogo?`
            );
            if (shouldUpdate) {
                itemsWithDiff.forEach(item => {
                    const product = store.products.find(p => p.id === item.productId);
                    if (product) product.cost = item.unitCost;
                });
                store.saveData();
                app.showToast(`Costos actualizados en el catálogo.`, "success");
            }
        }
    }

    // --- ACCIÓN DE ANULAR COMPRA (REVERTIR STOCK) ---
    annulPurchase(purchaseId) {
        const purchase = store.purchases.find(p => p.id === purchaseId);
        if (!purchase) return;

        if (!confirm(`¿Está seguro de que desea ANULAR la factura ${purchase.invoiceNumber} de "${purchase.provider}"? Esta acción RESTARÁ las cantidades ingresadas del stock físico de cada producto y cambiará el estado de la compra a "Anulada".`)) {
            return;
        }

        // Restar el stock físico
        purchase.items.forEach(item => {
            const product = store.products.find(p => p.id === item.productId);
            if (product) {
                product.stock = Math.max(0, (product.stock || 0) - item.qty);
            }
        });

        purchase.status = "Anulada";
        store.saveData();

        app.showToast(`Compra anulada y stock físico actualizado (descontado).`, "info");
        this.renderActiveTab();
    }

    addNewProvider() {
        const name = prompt("Nombre del nuevo proveedor:");
        if (name && name.trim()) {
            const trimmed = name.trim();
            if (!store.providers.includes(trimmed)) {
                store.providers.push(trimmed);
                store.saveData();
                app.showToast(`Proveedor "${trimmed}" agregado a la lista.`, "success");
                // Actualizar el datalist sin re-renderizar todo
                const dl = document.getElementById("providers-datalist");
                if (dl) { const opt = document.createElement("option"); opt.value = trimmed; dl.appendChild(opt); }
                // Autocompletar el campo
                const input = document.getElementById("pur-provider");
                if (input) { input.value = trimmed; this.newInvoiceHeader.provider = trimmed; }
            } else {
                app.showToast("Ese proveedor ya existe en la lista.", "info");
            }
        }
    }

    exportPurchasesCSV() {
        if (!store.purchases || store.purchases.length === 0) { app.showToast("No hay compras para exportar.", "info"); return; }
        const headers = ["Fecha","Proveedor","Factura","Productos","Monto Total","Estado"];
        const rows = store.purchases.map(p => [
            p.date, `"${p.provider.replace(/"/g,'""')}"`, p.invoiceNumber,
            `"${p.items.map(i => `${i.name} x${i.qty}`).join("; ").replace(/"/g,'""')}"`,
            p.totalAmount, p.status
        ]);
        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
        a.download = `compras_navidad_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    }

    // --- MODAL DE DETALLE DE COMPRA ---
    openPurchaseDetailsModal(purchaseId) {
        const p = store.purchases.find(pur => pur.id === purchaseId);
        if (!p) return;

        const fmt = (num) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);

        let rowsHtml = "";
        p.items.forEach(item => {
            const sub = item.qty * item.unitCost;
            rowsHtml += `
                <tr>
                    <td><code>${esc(item.code)}</code></td>
                    <td><strong>${esc(item.name)}</strong></td>
                    <td>${item.qty} u.</td>
                    <td>${fmt(item.unitCost)}</td>
                    <td><strong>${fmt(sub)}</strong></td>
                </tr>
            `;
        });

        const statusClass = p.status === "Activa" ? "delivered" : "canceled";

        const html = `
            <div style="background: var(--bg-sidebar); border: 1px solid var(--color-border); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 20px; font-size: 0.9rem; line-height: 1.6;">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div><strong>Proveedor:</strong> ${p.provider}</div>
                    <div><strong>Estado:</strong> <span class="badge ${statusClass}">${p.status}</span></div>
                    <div><strong>Fecha:</strong> ${new Date(p.date + "T00:00:00").toLocaleDateString("es-AR")}</div>
                    <div><strong>Factura N°:</strong> <code>${p.invoiceNumber}</code></div>
                    <div><strong>Registrado por:</strong> ${p.user}</div>
                    <div><strong>Monto Neto Total:</strong> <strong style="color:var(--color-green);">${fmt(p.totalAmount)}</strong></div>
                </div>
            </div>

            <h4 style="margin-bottom: 10px;">Productos Ingresados</h4>
            <div class="table-container" style="max-height: 250px; overflow-y:auto; margin-bottom:15px;">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Artículo</th>
                            <th>Cantidad</th>
                            <th>Costo Unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top:20px;">
                ${p.status === "Activa" ? 
                    `<button class="btn btn-red" onclick="app.closeModal(); purchasesModule.annulPurchase('${p.id}');">Anular Compra</button>` : ''}
                <button class="btn btn-secondary" onclick="app.closeModal()">Cerrar</button>
            </div>
        `;

        app.showModal(`Detalle de Compra - Factura #${p.invoiceNumber}`, html);
    }
}

// Registrar en el objeto global
window.purchasesModule = new PurchasesModule();
