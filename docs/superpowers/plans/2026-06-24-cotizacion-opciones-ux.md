# Mejora UX Opciones Cotización — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el botón "+ Agregar Opción" por un botón prominente "Guardar Opción →" en el panel de acciones, y rediseñar las pestañas de opciones para mostrar nombre + total con indicador visual de pestaña activa.

**Architecture:** Un solo archivo modificado (`sales.js`). Tres métodos afectados: `renderOptionsTabs()` (rediseño de tabs y remoción del botón de agregar), `openQuoteModal()` (agregar botón "Guardar Opción →" en el HTML), y `updateBuilderTotals()` (actualizar `opt.total` en memoria y re-renderizar tabs para mantener totales al día).

**Tech Stack:** Vanilla JS, HTML inline en strings de template, CSS variables del design system existente.

---

## Archivos

| Archivo | Cambio |
|---|---|
| `christmas-erp/js/modules/sales.js` | Único archivo modificado. Tres cambios en tres métodos. |

---

### Task 1: Actualizar `renderOptionsTabs()` — tabs con nombre+total y sin botón de agregar

**Files:**
- Modify: `christmas-erp/js/modules/sales.js` → método `renderOptionsTabs()` (línea ~1480)

**Contexto:** Actualmente las tabs solo muestran el nombre y tienen el botón "+ Agregar Opción" al final. El nuevo diseño muestra `Nombre · $Total` en cada tab, la activa tiene borde inferior azul de 3px, y el botón de agregar se elimina de aquí (irá al panel derecho en Task 2).

El total de cada opción viene de `opt.total` en `this.builderOptions[idx]`. Para la opción activa, este valor se actualiza en Task 3.

- [ ] **Reemplazar el método `renderOptionsTabs()`** en `sales.js`:

Buscar el método completo (desde `renderOptionsTabs() {` hasta su llave de cierre `}`, ~línea 1480–1514) y reemplazarlo con:

```javascript
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
```

- [ ] **Verificar** que el método anterior tenía también el botón "+ Agregar Opción" al final del `html +=`. Confirmá que ese bloque fue eliminado (no debe existir ningún `+ Agregar` dentro de `renderOptionsTabs`).

- [ ] **Commit parcial:**
```bash
git add christmas-erp/js/modules/sales.js
git commit -m "feat: rediseño tabs opciones cotización con nombre+total"
```

---

### Task 2: Agregar botón "Guardar Opción →" en el HTML del modal

**Files:**
- Modify: `christmas-erp/js/modules/sales.js` → método `openQuoteModal()`, sección de acciones (~línea 1437)

**Contexto:** El área de acciones del panel derecho tiene actualmente este bloque:

```html
<div style="display:flex; gap: 8px; justify-content:flex-end;">
    <button type="button" class="btn btn-primary btn-sm" onclick="salesModule.saveBuilderOrder('${order ? order.id : ''}')" ...>
        ${isEditing ? 'Guardar Cambios' : 'Generar Presupuesto'}
    </button>
    ...
    <button type="button" class="btn btn-secondary btn-sm" onclick="app.closeModal()" ...>Cerrar</button>
</div>
```

Hay que agregar el botón "Guardar Opción →" ANTES de ese bloque de acciones (como elemento separado), con visibilidad condicional controlada por JS en `renderOptionsTabs()`.

- [ ] **Localizar** en `openQuoteModal()` la línea que dice `<div style="display:flex; gap: 8px; justify-content:flex-end;">` dentro de la sección "Resumen y Acciones" (~línea 1437).

- [ ] **Agregar antes de ese div** el siguiente bloque (dentro del template string HTML del modal):

```html
<!-- Botón Guardar Opción -->
<div id="btn-save-option-container" style="display:flex; justify-content:flex-start;">
    <button type="button" class="btn btn-primary btn-sm" onclick="salesModule.addOption()"
            style="padding: 7px 16px; font-size: 0.8rem; font-weight:600; background:var(--color-blue);">
        Guardar Opción →
    </button>
</div>
```

- [ ] **Agregar lógica de visibilidad** al final de `renderOptionsTabs()` (dentro del método actualizado en Task 1), después de la línea del `countText`:

```javascript
const saveOptBtn = document.getElementById("btn-save-option-container");
if (saveOptBtn) {
    saveOptBtn.style.display = this.builderOptions.length < 5 ? "flex" : "none";
}
```

- [ ] **Probar manualmente** en el navegador:
  - Abrir "Nueva Cotización"
  - El botón "Guardar Opción →" debe aparecer debajo de los totales, antes de "Generar Presupuesto"
  - Al hacer clic debe guardar la opción actual y crear "Opción 2" vacía con foco en el campo nombre
  - Con 5 opciones creadas el botón debe desaparecer

- [ ] **Commit:**
```bash
git add christmas-erp/js/modules/sales.js
git commit -m "feat: agregar botón Guardar Opción en modal cotización"
```

---

### Task 3: Mantener totales de tabs actualizados en tiempo real

**Files:**
- Modify: `christmas-erp/js/modules/sales.js` → método `updateBuilderTotals()` (~línea 2435)

**Contexto:** Las tabs ahora muestran `opt.total` de `this.builderOptions[idx]`. Pero `updateBuilderTotals()` actualmente solo actualiza el DOM (el elemento `txt-total-sale-boxes`) — no actualiza `this.builderOptions[this.activeOptionIndex].total`. Esto significa que mientras el usuario edita precio/cajas, la tab activa mostraría un total desactualizado.

La solución: al final de `updateBuilderTotals()`, actualizar `opt.total` y llamar a `renderOptionsTabs()`.

- [ ] **Localizar** en `updateBuilderTotals()` la línea donde se calcula `totalVenta` (~línea 2466):

```javascript
const totalVenta = subtotalVenta - discountAmount + shippingCost;
```

- [ ] **Agregar justo después** (antes de las líneas que actualizan el DOM):

```javascript
// Mantener opt.total sincronizado para mostrarlo en la tab
const activeOpt = this.builderOptions[this.activeOptionIndex];
if (activeOpt) activeOpt.total = totalVenta;
```

- [ ] **Agregar al final de `updateBuilderTotals()`**, antes del cierre `}` del método, la llamada para re-renderizar las tabs:

```javascript
// Re-renderizar tabs para reflejar totales actualizados
this.renderOptionsTabs();
```

- [ ] **Probar manualmente:**
  - Abrir "Nueva Cotización", poner precio 1000 y cantidad 10
  - La tab "Opción Estándar" debe mostrar "Opción Estándar · $10.000"
  - Cambiar precio a 2000 → la tab debe actualizarse a "Opción Estándar · $20.000"
  - Crear segunda opción con "Guardar Opción →", configurarla, volver a la primera → el total de la segunda tab debe mostrarse correctamente

- [ ] **Commit final:**
```bash
git add christmas-erp/js/modules/sales.js
git commit -m "feat: sincronizar totales en tabs de opciones cotización"
```

---

### Task 4: Deploy

- [ ] **Push a main:**
```bash
git push origin main
```

- [ ] **Verificar en Vercel** que el deploy se complete (normalmente ~1 min después del push).

- [ ] **Probar en producción** en https://erp-navidad-y-empresas.vercel.app:
  - Pedidos / Ventas → Nueva Cotización
  - Verificar botón "Guardar Opción →" visible
  - Verificar tabs con nombre + total
  - Verificar tab activa con borde azul inferior
  - Verificar que al guardar una opción aparece la segunda vacía con foco en nombre
  - Verificar que con 5 opciones el botón desaparece
