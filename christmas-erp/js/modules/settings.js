// Módulo de Configuración del ERP
// Gestiona la vista y persistencia de parámetros globales del sistema.

const settingsModule = (() => {

    function render(container) {
        const s = store.settings;
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Configuración del ERP</h2>
                    <p>Definición de notas comerciales de las propuestas y parámetros de jornales del personal.</p>
                </div>
            </div>

            <div class="card" style="margin-bottom: 24px;">
                <div class="card-title">Aclaraciones y Notas Comerciales al Pie de Cotizaciones (Sin IVA)</div>
                <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:12px;">Texto libre que se adjunta automáticamente al generar PDFs, propuestas impresas y exportaciones de Excel.</p>
                <div class="form-group">
                    <textarea id="setting-notes" class="form-control" rows="14" style="font-family: monospace; font-size:0.85rem; line-height:1.4; background-color:#ffffff;">${s.notasAlPie}</textarea>
                </div>
            </div>

            <div class="card" style="margin-bottom: 24px;">
                <div class="card-title">Liquidación de Personal: Parámetros del Depósito (Precios Netos Sin IVA)</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Jornada Laboral Diaria Normal (Horas)</label>
                        <input type="number" id="setting-jornada" class="form-control" step="0.5" value="${s.jornadaNormal}">
                    </div>
                    <div class="form-group">
                        <label>Costo de Hora Normal ($)</label>
                        <input type="number" id="setting-val-normal" class="form-control" value="${s.valorHoraNormal || 2500}">
                    </div>
                    <div class="form-group">
                        <label>Costo de Hora Extra ($)</label>
                        <input type="number" id="setting-val-extra" class="form-control" value="${s.valorHoraExtra || 3750}">
                    </div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 24px;">
                <div class="card-title">Parámetros de Costos de Logística e Impositivos (Sin IVA)</div>
                <div class="form-row" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label>Costo Flete Córdoba ➔ BA ($)</label>
                        <input type="number" id="setting-costo-cba-ba" class="form-control" value="${s.costoCbaBaires || 1512000}">
                    </div>
                    <div class="form-group">
                        <label>Capacidad Camión (Cajas)</label>
                        <input type="number" id="setting-cap-camion" class="form-control" value="${s.capacidadCamion || 3200}">
                    </div>
                    <div class="form-group">
                        <label>Cajas por Pallet</label>
                        <input type="number" id="setting-cajas-pallet" class="form-control" value="${s.cajasPorPallet || 115}">
                    </div>
                </div>
                <div class="form-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label>CABA - Tarifa Base ($)</label>
                        <input type="number" id="setting-tbase-caba" class="form-control" value="${s.tarifaBaseCaba || 39570}">
                    </div>
                    <div class="form-group">
                        <label>CABA - Tarifa Pallet ($)</label>
                        <input type="number" id="setting-tpallet-caba" class="form-control" value="${s.tarifaPalletCaba || 52800}">
                    </div>
                </div>
                <div class="form-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label>AMBA hasta 30km - Tarifa Base ($)</label>
                        <input type="number" id="setting-tbase-amba30" class="form-control" value="${s.tarifaBaseAmba30 || 50000}">
                    </div>
                    <div class="form-group">
                        <label>AMBA hasta 30km - Tarifa Pallet ($)</label>
                        <input type="number" id="setting-tpallet-amba30" class="form-control" value="${s.tarifaPalletAmba30 || 64300}">
                    </div>
                </div>
                <div class="form-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label>AMBA hasta 60km - Tarifa Base ($)</label>
                        <input type="number" id="setting-tbase-amba60" class="form-control" value="${s.tarifaBaseAmba60 || 56475}">
                    </div>
                    <div class="form-group">
                        <label>AMBA hasta 60km - Tarifa Pallet ($)</label>
                        <input type="number" id="setting-tpallet-amba60" class="form-control" value="${s.tarifaPalletAmba60 || 70000}">
                    </div>
                </div>
                <div class="form-row" style="display:grid; grid-template-columns: 1fr; gap:16px; margin-bottom: 0;">
                    <div class="form-group">
                        <label>Córdoba Capital - Tarifa Base ($)</label>
                        <input type="number" id="setting-tbase-cbacap" class="form-control" value="${s.tarifaBaseCbaCap || 25000}">
                    </div>
                </div>
            </div>

            <div style="display:flex; justify-content: flex-end; gap:12px;">
                <button class="btn btn-primary" onclick="settingsModule.save()">Guardar Configuración</button>
            </div>
        `;
    }

    function save() {
        const get = (id, fallback = 0) => parseFloat(document.getElementById(id)?.value) || fallback;

        store.settings.notasAlPie         = document.getElementById("setting-notes").value;
        store.settings.jornadaNormal      = get("setting-jornada", 8);
        store.settings.valorHoraNormal    = get("setting-val-normal", 2500);
        store.settings.valorHoraExtra     = get("setting-val-extra", 3750);
        store.settings.costoCbaBaires     = get("setting-costo-cba-ba", 1512000);
        store.settings.capacidadCamion    = parseInt(document.getElementById("setting-cap-camion")?.value) || 3200;
        store.settings.cajasPorPallet     = parseInt(document.getElementById("setting-cajas-pallet")?.value) || 115;
        store.settings.tarifaBaseCaba     = get("setting-tbase-caba", 39570);
        store.settings.tarifaPalletCaba   = get("setting-tpallet-caba", 52800);
        store.settings.tarifaBaseAmba30   = get("setting-tbase-amba30", 50000);
        store.settings.tarifaPalletAmba30 = get("setting-tpallet-amba30", 64300);
        store.settings.tarifaBaseAmba60   = get("setting-tbase-amba60", 56475);
        store.settings.tarifaPalletAmba60 = get("setting-tpallet-amba60", 70000);
        store.settings.tarifaBaseCbaCap   = get("setting-tbase-cbacap", 25000);

        // Sincronizar tarifas horarias en empleados sin tarifa personalizada
        const { valorHoraNormal, valorHoraExtra } = store.settings;
        store.employees.forEach(emp => {
            if (!emp.isCustomRate) {
                emp.hourlyRate      = valorHoraNormal;
                emp.extraHourlyRate = valorHoraExtra;
            }
        });

        store.saveData();
        ui.showToast("Configuración guardada correctamente", "success");
        app.renderCurrentView();
    }

    return { render, save };
})();

window.settingsModule = settingsModule;
