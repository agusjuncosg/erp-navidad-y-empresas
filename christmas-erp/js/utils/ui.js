// Utilidades de UI compartidas: sistema de toasts y modal global

// Escapa HTML para prevenir XSS al inyectar strings de usuario en innerHTML
function esc(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}
window.esc = esc;

const ui = (() => {

    // ─── TOASTS ──────────────────────────────────────────────────────────────

    function showToast(message, type = "info") {
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;

        const icons = {
            success: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
            error:   `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
            info:    `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
        };

        toast.innerHTML = `${icons[type] ?? icons.info}<div>${message}</div>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = "slideIn 0.3s reverse forwards";
            setTimeout(() => { if (toast.parentNode) container.removeChild(toast); }, 300);
        }, 4000);
    }

    // ─── MODAL ───────────────────────────────────────────────────────────────

    function showModal(title, htmlContent, onOpenCallback = null) {
        document.getElementById("modal-title").innerText = title;
        const modalBody = document.getElementById("modal-body");
        modalBody.innerHTML = htmlContent;
        document.getElementById("modal-overlay").classList.add("active");
        if (onOpenCallback) onOpenCallback(modalBody);
    }

    function closeModal() {
        document.getElementById("modal-overlay").classList.remove("active");
        const modal = document.getElementById("global-modal");
        if (modal) {
            modal.classList.remove("modal-lg");
            modal.classList.remove("modal-fullscreen");
        }
    }

    return { showToast, showModal, closeModal };
})();

window.ui = ui;
