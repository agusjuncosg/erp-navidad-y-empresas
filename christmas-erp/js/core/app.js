// Enrutador y controlador principal de la SPA (NAVIDAD Y EMPRESAS ERP)
// Responsabilidad: inicialización, navegación entre vistas y búsqueda global.
// UI utilities → js/utils/ui.js
// Configuración  → js/modules/settings.js

class ChristmasERPApp {
    constructor() {
        this.activeView  = "dashboard";
        this.currentUser = "Agustín";
        this.currentRole = "Administrador";

        document.addEventListener("DOMContentLoaded", () => this.init());
    }

    // ─── INICIALIZACIÓN ──────────────────────────────────────────────────────

    init() {
        this._bindNavLinks();
        this._bindRoleSelector();
        this._bindModal();
        this._bindHashChange();

        this.checkExpiredQuotes();

        const initialHash = window.location.hash.substring(1) || "dashboard";
        this.navigate(initialHash);
    }

    _bindNavLinks() {
        document.querySelectorAll(".nav-item").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                this.navigate(link.getAttribute("href").substring(1));
            });
        });
    }

    _bindRoleSelector() {
        const roleSelect = document.getElementById("user-role-select");
        roleSelect.value = this.currentRole;
        roleSelect.addEventListener("change", (e) => {
            this.currentRole = e.target.value;
            ui.showToast(`Rol cambiado a: ${this.currentRole}`, "info");
            this.renderCurrentView();
        });
    }

    _bindModal() {
        document.getElementById("btn-close-modal").addEventListener("click", () => ui.closeModal());
        document.getElementById("modal-overlay").addEventListener("click", (e) => {
            if (e.target.id === "modal-overlay") ui.closeModal();
        });
    }

    _bindHashChange() {
        window.addEventListener("hashchange", () => {
            const hash = window.location.hash.substring(1) || "dashboard";
            this.navigate(hash, false);
        });
    }

    // ─── NAVEGACIÓN ──────────────────────────────────────────────────────────

    navigate(viewName, updateHash = true) {
        this.activeView = viewName;

        document.querySelectorAll(".nav-item").forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${viewName}`);
        });

        if (updateHash) window.location.hash = viewName;
        this.renderCurrentView();
    }

    renderCurrentView() {
        const main = document.getElementById("main-content");
        main.innerHTML = "";

        const routes = {
            dashboard: () => window.dashboardModule?.render(main),
            crm:       () => window.salesModule?.renderCRM(main),
            sales:     () => window.salesModule?.renderCRM(main),
            pedidos:   () => window.salesModule?.renderPedidos(main),
            inventory: () => window.inventoryModule?.render(main),
            assembly:  () => window.assemblyModule?.render(main),
            logistics: () => window.logisticsModule?.render(main),
            finanzas:  () => window.paymentsModule?.render(main),
            payments:  () => window.paymentsModule?.render(main),
            expenses:  () => { if (window.paymentsModule) { window.paymentsModule.activeTab = "gastos"; window.paymentsModule.render(main); } },
            purchases: () => window.purchasesModule?.render(main),
            personal:  () => window.employeesModule?.render(main),
            employees: () => window.employeesModule?.render(main),
            settings:  () => window.settingsModule?.render(main),
        };

        const handler = routes[this.activeView];
        if (handler) {
            handler();
        } else {
            main.innerHTML = `<h2>Vista no encontrada</h2><p>La sección "${this.activeView}" no está implementada todavía.</p>`;
        }
    }

    // ─── BUSCADOR GLOBAL ─────────────────────────────────────────────────────

    handleGlobalSearch(query) {
        const resultsEl = document.getElementById("global-search-results");
        if (!resultsEl) return;
        const q = query.trim().toLowerCase();
        if (q.length < 2) { resultsEl.innerHTML = ""; return; }

        const results = [];

        store.leads.forEach(lead => {
            if (lead.status === "Descartado") return;
            if (lead.clientName.toLowerCase().includes(q) || (lead.contactName || "").toLowerCase().includes(q)) {
                results.push({ type: "🎯 Lead", label: lead.clientName, sub: lead.status, action: `app.navigate('crm')` });
            }
        });

        store.orders.forEach(order => {
            if (order.status === "Cancelado") return;
            const dispId = order.displayId || order.id;
            if (order.clientName.toLowerCase().includes(q) || dispId.toLowerCase().includes(q) || (order.cuit || "").includes(q)) {
                results.push({ type: "📋 Pedido", label: order.clientName, sub: `${dispId} — ${order.status}`, action: `app.navigate('pedidos')` });
            }
        });

        if (results.length === 0) {
            resultsEl.innerHTML = `<div class="search-no-results">Sin resultados para "${query}"</div>`;
            return;
        }

        resultsEl.innerHTML = results.slice(0, 8).map(r => `
            <div class="search-result-item" onclick="${r.action}; document.getElementById('global-search-input').value=''; document.getElementById('global-search-results').style.display='none';">
                <span class="search-result-type">${esc(r.type)}</span>
                <span class="search-result-label">${esc(r.label)}</span>
                <span class="search-result-sub">${esc(r.sub)}</span>
            </div>
        `).join("");
    }

    // ─── AUDITORÍA ───────────────────────────────────────────────────────────

    logAction(orderId, actionText) {
        const order = store.orders.find(o => o.id === orderId);
        if (!order) return;
        order.history.push({
            date:   new Date().toISOString(),
            user:   `${this.currentUser} (${this.currentRole})`,
            action: actionText,
        });
        store.saveData();
    }

    // ─── ALERTAS ─────────────────────────────────────────────────────────────

    checkExpiredQuotes() {
        const today = new Date();
        let expiredCount = 0;

        store.orders.forEach(order => {
            if (order.status === "Presupuesto Enviado" && order.validUntil) {
                if (today > new Date(order.validUntil)) expiredCount++;
            }
        });

        if (expiredCount > 0) {
            setTimeout(() => {
                ui.showToast(`Hay ${expiredCount} presupuesto(s) vencido(s). Requieren actualización de precios antes de confirmarse.`, "error");
            }, 1000);
        }
    }

    // ─── DELEGACIÓN A ui.js (compatibilidad con módulos existentes) ──────────
    // Los módulos llaman app.showToast() y app.showModal() — se delega a ui.js
    // para no romper las referencias existentes mientras se migran gradualmente.

    showToast(message, type)               { return ui.showToast(message, type); }
    showModal(title, html, callback)       { return ui.showModal(title, html, callback); }
    closeModal()                           { return ui.closeModal(); }
}

window.app = new ChristmasERPApp();
