// Módulo de Inventario: Gestión de Insumos, Stocks y Creador Dinámico de Combos

class InventoryModule {
    constructor() {
        this.activeTab        = "stock"; // "stock" o "combos"
        this.filterCategory   = "";
        this.searchQuery      = "";
        this.editingCombo     = false;   // true mientras el editor de combo está abierto
        this.tempIngredients  = [];      // ingredientes del combo en edición
    }

    render(container) {
        // Obtener categorías únicas del catálogo
        const categories = [...new Set(store.products.map(p => p.category))].sort();
        let catOptions = `<option value="">Todas las Categorías</option>`;
        categories.forEach(cat => {
            catOptions += `<option value="${cat}" ${this.filterCategory === cat ? 'selected' : ''}>${cat}</option>`;
        });

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Inventario de Insumos y Combos</h2>
                    <p>Monitoreo de stock de artículos, alertas de faltantes y armado de combos de cajas.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary btn-sm" id="btn-tab-stock">Ver Insumos</button>
                    <button class="btn btn-primary btn-sm" id="btn-tab-combos">Ver Combos de Cajas</button>
                    <button class="btn btn-gold btn-sm" id="btn-new-product" style="margin-left: 8px;">+ Nuevo Insumo</button>
                    <button class="btn btn-primary btn-sm" id="btn-new-combo" style="margin-left: 8px;">+ Crear Combo</button>
                </div>
            </div>

            <div class="tab-container">
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'stock' ? 'active' : ''}" id="tab-inv-stock">Stock de Insumos</div>
                    <div class="tab ${this.activeTab === 'combos' ? 'active' : ''}" id="tab-inv-combos">Combos (Cajas Navideñas)</div>
                </div>
            </div>

            <div id="inventory-content-area">
                <!-- Inyección dinámica -->
            </div>
        `;

        // Vincular tabs
        document.getElementById("btn-tab-stock").addEventListener("click", () => this.switchTab("stock"));
        document.getElementById("btn-tab-combos").addEventListener("click", () => this.switchTab("combos"));
        document.getElementById("tab-inv-stock").addEventListener("click", () => this.switchTab("stock"));
        document.getElementById("tab-inv-combos").addEventListener("click", () => this.switchTab("combos"));

        // Vincular botones
        document.getElementById("btn-new-product").addEventListener("click", () => this.openNewProductModal());
        document.getElementById("btn-new-combo").addEventListener("click", () => this.startComboBuilder());

        this.renderActiveTab();
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        this.renderActiveTab();
    }

    renderActiveTab() {
        const area = document.getElementById("inventory-content-area");
        if (this.editingCombo) {
            this.renderComboBuilder(area);
        } else if (this.activeTab === "stock") {
            this.renderStockTab(area);
        } else {
            this.renderCombosTab(area);
        }
    }

    // --- INSUMOS Y STOCK ---
    renderStockTab(container) {
        // Filtrar productos
        let filtered = store.products;
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)));
        }
        if (this.filterCategory) {
            filtered = filtered.filter(p => p.category === this.filterCategory);
        }

        const categories = [...new Set(store.products.map(p => p.category))].sort();
        let catOptions = `<option value="">Todas las Categorías</option>`;
        categories.forEach(cat => {
            catOptions += `<option value="${cat}" ${this.filterCategory === cat ? 'selected' : ''}>${cat}</option>`;
        });

        container.innerHTML = `
            <div class="card" style="margin-bottom: 20px;">
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <div style="flex-grow: 1; min-width: 250px;">
                        <input type="text" id="stock-search" class="form-control" placeholder="Buscar por producto o marca..." value="${this.searchQuery}">
                    </div>
                    <div style="width: 250px;">
                        <select id="stock-category-filter" class="form-control">
                            ${catOptions}
                        </select>
                    </div>
                    <button class="btn btn-secondary" onclick="inventoryModule.applyFilters()">Filtrar</button>
                    <button class="btn btn-secondary" onclick="inventoryModule.resetFilters()" style="padding: 10px 14px;">Limpiar</button>
                    <button class="btn btn-secondary" onclick="inventoryModule.exportStockXLSX()" title="Exportar stock a Excel">⬇ Excel</button>
                </div>
            </div>

            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Insumo</th>
                                <th>Categoría</th>
                                <th>Costo Compra</th>
                                <th>Precio Venta</th>
                                <th>Stock Físico</th>
                                <th>Stock Comprometido</th>
                                <th>Acción Rápida</th>
                            </tr>
                        </thead>
                        <tbody id="stock-table-tbody">
                            <!-- Filas de stock -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Eventos de filtros al presionar Enter
        document.getElementById("stock-search").addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.applyFilters();
        });

        this.renderStockRows(filtered);
    }

    renderStockRows(filteredList) {
        const tbody = document.getElementById("stock-table-tbody");

        if (filteredList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted);">Ningún insumo coincide con los filtros.</td></tr>`;
            return;
        }

        const listToRender = filteredList.slice(0, 100);
        const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

        // Pre-computar comprometido para todos los productos en una sola pasada O(n)
        const commitmentMap = {};
        store.orders.forEach(order => {
            if ((order.status === "Confirmado" || order.status === "En Producción") && order.items) {
                order.items.forEach(item => {
                    if (item.type === "product") {
                        commitmentMap[item.id] = (commitmentMap[item.id] || 0) + item.qty;
                    } else if (item.type === "combo") {
                        const combo = store.combos.find(c => c.id === item.id);
                        if (combo) {
                            combo.items.forEach(ci => {
                                commitmentMap[ci.prodId] = (commitmentMap[ci.prodId] || 0) + (ci.qty * item.qty);
                            });
                        }
                    }
                });
            }
        });

        let html = "";
        listToRender.forEach(p => {
            const comprometido = commitmentMap[p.id] || 0;
            let stockCellStyle = "font-weight: 600; text-align: center;";
            if (p.stock < 0) {
                stockCellStyle += " background: rgba(204,54,54,0.12); color: var(--color-red);";
            } else if (p.stock < 10) {
                stockCellStyle += " background: rgba(181,156,117,0.18); color: var(--color-gold);";
            }
            html += `
                <tr>
                    <td><strong>${p.name}</strong><br><span style="font-size: 0.8rem; color: var(--color-text-muted);">${p.brand ? p.brand : 'Sin Marca'}</span></td>
                    <td style="font-size: 0.8rem; color: var(--color-text-muted);">${p.category}</td>
                    <td>${fmt.format(p.cost)}</td>
                    <td>${fmt.format(p.price)}</td>
                    <td style="${stockCellStyle}">${p.stock}</td>
                    <td style="color: var(--color-blue); font-weight: 500;">${comprometido}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <button class="btn btn-secondary btn-sm" onclick="inventoryModule.openEditProductModal('${p.id}')" style="padding:3px 8px; font-size:0.75rem;">Editar</button>
                            <input type="number" id="quick-stock-${p.id}" class="form-control" style="width: 60px; padding: 4px;" value="1" min="1">
                            <button class="btn btn-green btn-sm" onclick="inventoryModule.adjustStock('${p.id}', 1)" title="Sumar Stock">+</button>
                            <button class="btn btn-secondary btn-sm" onclick="inventoryModule.adjustStock('${p.id}', -1)" title="Restar Stock" style="color: var(--color-red);">-</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        if (filteredList.length > 100) {
            html += `<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted); font-style: italic;">Mostrando los primeros 100 artículos. Utilice el buscador para ver otros específicos.</td></tr>`;
        }

        tbody.innerHTML = html;
    }

    applyFilters() {
        this.searchQuery = document.getElementById("stock-search").value;
        this.filterCategory = document.getElementById("stock-category-filter").value;
        this.renderActiveTab();
    }

    resetFilters() {
        this.searchQuery = "";
        this.filterCategory = "";
        this.renderActiveTab();
    }

    adjustStock(prodId, multiplier) {
        const input = document.getElementById(`quick-stock-${prodId}`);
        const qty = parseInt(input.value) || 0;
        
        if (qty <= 0) return;
        
        const prod = store.products.find(p => p.id === prodId);
        if (prod) {
            prod.stock += (qty * multiplier);
            store.saveData();
            app.showToast(`Stock de "${prod.name}" actualizado a ${prod.stock}`, "success");
            this.renderActiveTab();
        }
    }

    openNewProductModal() {
        const categories = [...new Set(store.products.map(p => p.category))].sort();
        let catOptions = "";
        categories.forEach(cat => {
            catOptions += `<option value="${cat}">${cat}</option>`;
        });

        const html = `
            <form onsubmit="inventoryModule.saveProduct(event)">
                <div class="form-group">
                    <label>Nombre del Artículo *</label>
                    <input type="text" id="new-prod-name" class="form-control" placeholder="Ej: PAN DULCE CON MANDORLAS" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Marca *</label>
                        <input type="text" id="new-prod-brand" class="form-control" placeholder="Ej: VALENTE" required>
                    </div>
                    <div class="form-group">
                        <label>Categoría</label>
                        <select id="new-prod-category" class="form-control">
                            ${catOptions}
                            <option value="OTRA">-- OTRA (Nueva) --</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" id="group-new-category" style="display: none;">
                    <label>Nombre de la Nueva Categoría</label>
                    <input type="text" id="new-prod-category-custom" class="form-control" placeholder="Ej: BAZAR Y DECORACIÓN">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Costo de Compra ($) *</label>
                        <input type="number" id="new-prod-cost" class="form-control" placeholder="Costo de proveedor" required>
                    </div>
                    <div class="form-group">
                        <label>Precio de Venta ($) *</label>
                        <input type="number" id="new-prod-price" class="form-control" placeholder="Precio comercial de venta" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Stock Físico Inicial</label>
                    <input type="number" id="new-prod-stock" class="form-control" value="0">
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar Producto</button>
                </div>
            </form>
        `;

        app.showModal("Cargar Nuevo Insumo al Inventario", html, (body) => {
            const selectCat = document.getElementById("new-prod-category");
            const customGroup = document.getElementById("group-new-category");
            selectCat.addEventListener("change", (e) => {
                if (e.target.value === "OTRA") {
                    customGroup.style.display = "block";
                } else {
                    customGroup.style.display = "none";
                }
            });
        });
    }

    saveProduct(e) {
        e.preventDefault();
        const name = document.getElementById("new-prod-name").value;
        const brand = document.getElementById("new-prod-brand").value;
        let category = document.getElementById("new-prod-category").value;
        const cost = parseFloat(document.getElementById("new-prod-cost").value);
        const price = parseFloat(document.getElementById("new-prod-price").value);
        const stock = parseInt(document.getElementById("new-prod-stock").value) || 0;

        if (category === "OTRA") {
            category = document.getElementById("new-prod-category-custom").value || "General";
        }

        const newProd = {
            id: "prod_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
            code: "",
            name,
            brand,
            category,
            cost,
            price,
            stock
        };

        store.products.push(newProd);
        store.saveData();
        app.closeModal();
        app.showToast("Insumo añadido al catálogo", "success");
        this.renderActiveTab();
    }


    // --- EDICIÓN DE PRODUCTO ---

    openEditProductModal(prodId) {
        const p = store.products.find(x => x.id === prodId);
        if (!p) return;

        // Sugerencias de categorías y marcas existentes para datalist
        const categories = [...new Set(store.products.map(x => x.category).filter(Boolean))].sort();
        const brands      = [...new Set(store.products.map(x => x.brand).filter(Boolean))].sort();
        const catOptions  = categories.map(c => `<option value="${c}">`).join("");
        const brandOptions = brands.map(b => `<option value="${b}">`).join("");

        const html = `
            <form onsubmit="inventoryModule.saveEditProduct(event, '${prodId}')">
                <div class="form-group">
                    <label>Nombre del Artículo *</label>
                    <input type="text" id="edit-prod-name" class="form-control" value="${p.name}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Marca</label>
                        <input type="text" id="edit-prod-brand" class="form-control" value="${p.brand || ''}" list="edit-brand-list" placeholder="Ej: Norton, Bonafide">
                        <datalist id="edit-brand-list">${brandOptions}</datalist>
                    </div>
                    <div class="form-group">
                        <label>Categoría</label>
                        <input type="text" id="edit-prod-category" class="form-control" value="${p.category || ''}" list="edit-cat-list" placeholder="Ej: VINOS, PAN DULCES">
                        <datalist id="edit-cat-list">${catOptions}</datalist>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Costo de Compra ($)</label>
                        <input type="number" id="edit-prod-cost" class="form-control" value="${p.cost}" required min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Precio de Venta ($)</label>
                        <input type="number" id="edit-prod-price" class="form-control" value="${p.price}" required min="0" step="0.01">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Stock Físico</label>
                        <input type="number" id="edit-prod-stock" class="form-control" value="${p.stock}">
                    </div>
                    <div class="form-group">
                        <label>Código</label>
                        <input type="text" id="edit-prod-code" class="form-control" value="${p.code || ''}">
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                </div>
            </form>
        `;
        app.showModal(`Editar Artículo — ${p.name}`, html);
    }

    saveEditProduct(e, prodId) {
        e.preventDefault();
        const p = store.products.find(x => x.id === prodId);
        if (!p) return;

        p.name     = document.getElementById("edit-prod-name").value.trim();
        p.brand    = document.getElementById("edit-prod-brand").value.trim();
        p.category = document.getElementById("edit-prod-category").value.trim();
        p.cost     = parseFloat(document.getElementById("edit-prod-cost").value) || 0;
        p.price    = parseFloat(document.getElementById("edit-prod-price").value) || 0;
        p.stock    = parseInt(document.getElementById("edit-prod-stock").value) || 0;
        p.code     = document.getElementById("edit-prod-code").value.trim();

        store.saveData();
        app.closeModal();
        ui.showToast(`"${p.name}" actualizado`, "success");
        this.renderActiveTab();
    }

    // Calcula cuántas unidades de un combo se pueden armar con el stock actual
    calcArmable(combo) {
        if (!combo.items || combo.items.length === 0) return 0;
        let minArmable = Infinity;
        combo.items.forEach(ci => {
            const prod = store.products.find(p => p.id === ci.prodId);
            const armable = prod ? Math.floor(prod.stock / ci.qty) : 0;
            if (armable < minArmable) minArmable = armable;
        });
        return minArmable === Infinity ? 0 : Math.max(0, minArmable);
    }

    exportStockXLSX() {
        const headers = ["Código", "Nombre", "Marca", "Categoría", "Stock Físico", "Costo Neto ($)", "Precio Venta ($)"];
        const rows = store.products.map(p => [
            p.code, p.name, p.brand || "", p.category || "", p.stock, p.cost, p.price
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Ancho de columnas
        ws['!cols'] = [
            { wch: 18 }, { wch: 50 }, { wch: 20 }, { wch: 28 },
            { wch: 14 }, { wch: 16 }, { wch: 16 }
        ];

        // Estilo de encabezado (negrita)
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
            if (cell) cell.s = { font: { bold: true } };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stock de Insumos");
        XLSX.writeFile(wb, `Stock_NavidadyEmpresas_${new Date().toISOString().split('T')[0]}.xlsx`);
        app.showToast("Stock exportado como Excel correctamente.", "success");
    }

    // --- COMBOS (CAJAS PREARMADAS) ---
    renderCombosTab(container) {
        if (store.combos.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <h3>No hay combos navideños creados todavía</h3>
                    <p style="color: var(--color-text-muted); margin-top: 10px;">Presione "+ Crear Combo" para definir tu primera receta de caja navideña.</p>
                </div>
            `;
            return;
        }

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        let combosHtml = "";
        store.combos.forEach(combo => {
            const armable      = this.calcArmable(combo);
            const armableColor = armable === 0 ? 'var(--color-red)' : armable < 10 ? 'var(--color-gold)' : 'var(--color-green)';
            const armableIcon  = armable === 0 ? '⚠️' : armable < 10 ? '⚡' : '✓';

            // Costo calculado en runtime desde los ingredientes actuales
            let totalCost = 0;
            let itemsListHtml = "";
            combo.items.forEach(ci => {
                const prod = store.products.find(p => p.id === ci.prodId);
                if (prod) {
                    totalCost += prod.cost * ci.qty;
                    const stockColor = prod.stock < ci.qty ? 'var(--color-red)' : 'inherit';
                    itemsListHtml += `
                        <li style="font-size:0.825rem; color:var(--color-text-muted); margin-bottom:4px; display:flex; justify-content:space-between;">
                            <span>${ci.qty}x ${prod.name} [${prod.brand || '—'}]</span>
                            <span style="color:${stockColor};">Stock: ${prod.stock}</span>
                        </li>`;
                }
            });

            combosHtml += `
                <div class="card">
                    <div class="card-title">
                        <strong>${combo.name}</strong>
                        <span style="color:var(--color-gold); font-size:1.1rem; font-weight:700;">${fmt(totalCost)}</span>
                    </div>
                    <div style="background:rgba(0,0,0,0.03); border:1px solid ${armable === 0 ? 'var(--color-red)' : 'var(--color-border)'}; border-radius:6px; padding:8px 12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.8rem; color:var(--color-text-muted);">Unidades armables con stock actual:</span>
                        <strong style="color:${armableColor}; font-size:0.95rem;">${armableIcon} ${armable} u.</strong>
                    </div>
                    <div style="margin:12px 0; border-top:1px solid var(--color-border); border-bottom:1px solid var(--color-border); padding:12px 0;">
                        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--color-text-muted); font-weight:600; display:block; margin-bottom:8px;">Receta / Componentes:</span>
                        <ul style="list-style:none; padding-left:0;">${itemsListHtml}</ul>
                    </div>
                    <div style="font-size:0.85rem; color:var(--color-text-muted);">
                        Costo de materiales: <strong style="color:var(--color-text);">${fmt(totalCost)}</strong>
                        &nbsp;·&nbsp; El margen se define al cotizar en Pedidos/Ventas.
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
                        <button class="btn btn-secondary btn-sm" onclick="inventoryModule.deleteCombo('${combo.id}')" style="color:var(--color-red);">Eliminar</button>
                    </div>
                </div>`;
        });

        container.innerHTML = `
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:24px;">
                ${combosHtml}
            </div>`;
    }

    deleteCombo(comboId) {
        if (confirm("¿Estás seguro de que deseas eliminar este combo navideño? Esto no afectará a los pedidos existentes ya cotizados con él.")) {
            store.combos = store.combos.filter(c => c.id !== comboId);
            store.saveData();
            app.showToast("Combo eliminado", "info");
            this.renderActiveTab();
        }
    }

    // --- EDITOR DE COMBO (PANTALLA COMPLETA) ---

    startComboBuilder() {
        this.editingCombo    = true;
        this.tempIngredients = [];
        this.comboSearchQuery = "";
        this.renderActiveTab();
    }

    cancelComboBuilder() {
        this.editingCombo    = false;
        this.tempIngredients = [];
        this.activeTab       = "combos";
        this.render(document.getElementById("main-content"));
    }

    renderComboBuilder(container) {
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        // Agrupar productos por categoría para el selector lateral
        const categories = [...new Set(store.products.map(p => p.category))].sort();
        const catButtons = categories.map(cat => `
            <button type="button" class="category-btn" onclick="inventoryModule.filterComboBuilderCatalog('${cat.replace(/'/g,"\\'")}')">
                ${cat}
            </button>`).join("");

        container.innerHTML = `
            <!-- Header del builder -->
            <div style="display:flex; align-items:center; gap:16px; background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:12px 16px; margin-bottom:16px; flex-shrink:0;">
                <button class="btn btn-secondary btn-sm" onclick="inventoryModule.cancelComboBuilder()">← Volver</button>
                <div style="flex-grow:1;">
                    <label style="font-size:0.75rem; font-weight:600; color:var(--color-text-muted); display:block; margin-bottom:2px;">NOMBRE DEL COMBO *</label>
                    <input type="text" id="combo-name" class="form-control" placeholder="Ej: Caja Navideña Familiar Standard" style="font-size:0.95rem; font-weight:600; padding:6px 10px;">
                </div>
                <div style="text-align:right; min-width:160px;">
                    <div style="font-size:0.75rem; color:var(--color-text-muted);">Costo total del combo</div>
                    <div id="combo-total-cost" style="font-size:1.4rem; font-weight:700; color:var(--color-gold);">${fmt(0)}</div>
                </div>
                <button class="btn btn-primary" onclick="inventoryModule.saveCombo()" style="padding:8px 20px; font-size:0.9rem;">Guardar Combo</button>
            </div>

            <!-- Body: catálogo izquierda / receta derecha -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; min-height:500px;">

                <!-- Panel izquierdo: buscador + catálogo -->
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="combo-catalog-search" class="form-control" placeholder="🔍 Buscar insumo por nombre o marca..." oninput="inventoryModule.filterComboBuilderCatalog()">
                    </div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; max-height:56px; overflow-y:auto;">
                        <button type="button" class="category-btn active" onclick="inventoryModule.filterComboBuilderCatalog('')">TODOS</button>
                        ${catButtons}
                    </div>
                    <div style="border:1px solid var(--color-border); border-radius:var(--radius-sm); overflow:hidden; flex-grow:1;">
                        <div id="combo-catalog-table" style="overflow-y:auto; max-height:460px; background:var(--bg-card);">
                            <!-- Inyectado dinámicamente -->
                        </div>
                    </div>
                </div>

                <!-- Panel derecho: componentes del combo -->
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div style="font-size:0.8rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.04em;">
                        Componentes de la Caja
                    </div>
                    <div style="border:1px solid var(--color-border); border-radius:var(--radius-sm); overflow:hidden; flex-grow:1;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.84rem;">
                            <thead>
                                <tr style="background:rgba(0,0,0,0.04); border-bottom:2px solid var(--color-border); text-align:left; font-weight:600;">
                                    <th style="padding:7px 10px;">Insumo</th>
                                    <th style="padding:7px 10px; text-align:center; width:80px;">Cantidad</th>
                                    <th style="padding:7px 10px; text-align:right;">Costo Unit.</th>
                                    <th style="padding:7px 10px; text-align:right;">Subtotal</th>
                                    <th style="padding:7px 10px; width:36px;"></th>
                                </tr>
                            </thead>
                            <tbody id="combo-ingredients-tbody">
                                <tr><td colspan="5" style="text-align:center; padding:30px; color:var(--color-text-muted);">Agregá insumos desde el catálogo de la izquierda.</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- Resumen -->
                    <div style="background:var(--bg-sidebar); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.85rem; color:var(--color-text-muted);">Costo total del combo:</span>
                        <strong id="combo-summary-cost" style="font-size:1.1rem; color:var(--color-gold);">${fmt(0)}</strong>
                    </div>
                    <div style="font-size:0.78rem; color:var(--color-text-muted); line-height:1.5;">
                        💡 El margen de ganancia se define al cotizar en <strong>Pedidos / Ventas</strong>, no en la receta del combo.
                    </div>
                </div>
            </div>
        `;

        this.renderComboBuilderCatalog();
        this.renderComboIngredients();
    }

    filterComboBuilderCatalog(category) {
        // Actualizar botones de categoría activa
        document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
        event?.target?.classList?.add("active");
        this._comboCatalogCategory = category ?? this._comboCatalogCategory ?? "";
        this.renderComboBuilderCatalog();
    }

    renderComboBuilderCatalog() {
        const tableEl = document.getElementById("combo-catalog-table");
        if (!tableEl) return;

        const query    = (document.getElementById("combo-catalog-search")?.value || "").toLowerCase();
        const category = this._comboCatalogCategory || "";

        let filtered = store.products;
        if (category) filtered = filtered.filter(p => p.category === category);
        if (query)    filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || (p.brand || "").toLowerCase().includes(query));

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        if (filtered.length === 0) {
            tableEl.innerHTML = `<div style="text-align:center; padding:30px; color:var(--color-text-muted);">Sin resultados.</div>`;
            return;
        }

        let rows = "";
        filtered.slice(0, 150).forEach(p => {
            const stockColor = p.stock <= 0 ? "var(--color-red)" : p.stock < 20 ? "var(--color-gold)" : "var(--color-green)";
            rows += `<tr style="border-bottom:1px solid var(--color-border);">
                <td style="padding:6px 10px;">
                    <strong style="font-size:0.83rem;">${p.name}</strong>
                    <br><span style="font-size:0.72rem; color:var(--color-text-muted);">${p.brand || '—'} · Stock: <span style="color:${stockColor}; font-weight:600;">${p.stock}</span></span>
                </td>
                <td style="padding:6px 10px; text-align:right; font-size:0.83rem;">${fmt(p.cost)}</td>
                <td style="padding:6px 10px; text-align:center;">
                    <div style="display:flex; align-items:center; gap:4px;">
                        <input type="number" id="cb-qty-${p.id}" class="form-control" value="1" min="1" style="width:52px; padding:3px 5px; font-size:0.8rem; text-align:center;">
                        <button class="btn btn-primary btn-sm" onclick="inventoryModule.addIngredientToCombo('${p.id}')" style="padding:3px 8px; font-size:0.8rem; font-weight:700;">+</button>
                    </div>
                </td>
            </tr>`;
        });

        tableEl.innerHTML = `
            <table style="width:100%; border-collapse:collapse; font-size:0.83rem;">
                <thead>
                    <tr style="background:rgba(0,0,0,0.04); border-bottom:2px solid var(--color-border); text-align:left; font-weight:600; position:sticky; top:0; z-index:1;">
                        <th style="padding:7px 10px;">Insumo</th>
                        <th style="padding:7px 10px; text-align:right;">Costo</th>
                        <th style="padding:7px 10px; text-align:center; width:120px;">Agregar</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>`;
    }

    addIngredientToCombo(prodId) {
        const qty  = parseInt(document.getElementById(`cb-qty-${prodId}`)?.value) || 1;
        const prod = store.products.find(p => p.id === prodId);
        if (!prod) return;

        const existing = this.tempIngredients.find(i => i.prodId === prodId);
        if (existing) {
            existing.qty += qty;
        } else {
            this.tempIngredients.push({ prodId, name: prod.name, brand: prod.brand || "", qty, cost: prod.cost });
        }
        this.renderComboIngredients();
    }

    removeIngredientFromCombo(index) {
        this.tempIngredients.splice(index, 1);
        this.renderComboIngredients();
    }

    changeIngredientQty(index, qty) {
        if (qty < 1) return;
        this.tempIngredients[index].qty = qty;
        this._updateComboCostDisplay();
    }

    renderComboIngredients() {
        const tbody = document.getElementById("combo-ingredients-tbody");
        if (!tbody) return;

        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

        if (this.tempIngredients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--color-text-muted);">Agregá insumos desde el catálogo de la izquierda.</td></tr>`;
            this._updateComboCostDisplay();
            return;
        }

        tbody.innerHTML = this.tempIngredients.map((item, index) => `
            <tr style="border-bottom:1px solid var(--color-border);">
                <td style="padding:6px 10px;">
                    <strong style="font-size:0.83rem;">${item.name}</strong>
                    <br><span style="font-size:0.72rem; color:var(--color-text-muted);">${item.brand}</span>
                </td>
                <td style="padding:6px 10px; text-align:center;">
                    <input type="number" class="form-control" style="width:60px; padding:3px 5px; font-size:0.82rem; text-align:center;"
                           value="${item.qty}" min="1"
                           onchange="inventoryModule.changeIngredientQty(${index}, parseInt(this.value))">
                </td>
                <td style="padding:6px 10px; text-align:right; font-size:0.83rem;">${fmt(item.cost)}</td>
                <td style="padding:6px 10px; text-align:right; font-weight:600; font-size:0.83rem;">${fmt(item.cost * item.qty)}</td>
                <td style="padding:6px 10px; text-align:center;">
                    <button class="btn btn-secondary btn-sm" onclick="inventoryModule.removeIngredientFromCombo(${index})"
                            style="color:var(--color-red); padding:2px 7px; font-size:0.85rem;">&times;</button>
                </td>
            </tr>`).join("");

        this._updateComboCostDisplay();
    }

    _updateComboCostDisplay() {
        const totalCost = this.tempIngredients.reduce((sum, i) => sum + i.cost * i.qty, 0);
        const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
        const formatted = fmt(totalCost);
        const headerEl  = document.getElementById("combo-total-cost");
        const summaryEl = document.getElementById("combo-summary-cost");
        if (headerEl)  headerEl.innerText  = formatted;
        if (summaryEl) summaryEl.innerText = formatted;
    }

    saveCombo() {
        const name = (document.getElementById("combo-name")?.value || "").trim();

        if (!name) {
            ui.showToast("Ingresá un nombre para el combo", "error");
            return;
        }
        if (this.tempIngredients.length === 0) {
            ui.showToast("Agregá al menos un componente a la receta", "error");
            return;
        }

        store.combos.push({
            id:    "combo_" + Date.now(),
            name,
            // Sin precio: el margen se define en el cotizador, no en la receta
            items: this.tempIngredients.map(i => ({ prodId: i.prodId, qty: i.qty }))
        });
        store.saveData();

        this.editingCombo    = false;
        this.tempIngredients = [];
        this.activeTab       = "combos";
        ui.showToast(`Combo "${name}" creado con éxito`, "success");
        this.render(document.getElementById("main-content"));
    }
}

// Ámbito global
window.inventoryModule = new InventoryModule();
