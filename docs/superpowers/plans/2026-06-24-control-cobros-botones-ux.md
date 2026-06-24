# Rediseño Botones Control de Cobros — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el bloque de botones de acción en la tabla Control de Cobros por un layout de dos filas: "Registrar cobro" (verde, prominente) arriba y tres botones secundarios ("Plan de cobros", "Plan de facturación", "Historial") abajo.

**Architecture:** Un solo cambio en `renderControlTab()` dentro de `payments.js`. Se reemplaza el div de botones en línea por un div apilado en dos filas. "Registrar cobro" llama a `openSchedulePaymentsModal` en lugar del anterior `openRegisterPaymentModal`. Sin cambios de lógica.

**Tech Stack:** Vanilla JS, HTML como strings de template, CSS inline.

---

## Archivos

| Archivo | Cambio |
|---|---|
| `christmas-erp/js/modules/payments.js` | Reemplazar bloque de botones en `renderControlTab()` (~línea 291–296) |

---

### Task 1: Reemplazar bloque de botones en `renderControlTab()`

**Files:**
- Modify: `christmas-erp/js/modules/payments.js` → método `renderControlTab()`, bloque de acciones (~línea 291–296)

**Contexto:** Dentro de `renderControlTab()`, cada fila de la tabla tiene una celda `<td>` con un div de botones. El bloque actual es:

```html
<td style="padding:6px 10px; text-align:right;">
    <div style="display:flex; gap:4px; justify-content:flex-end; flex-wrap:wrap;">
        ${deuda > 0 ? `<button class="btn btn-green btn-sm" onclick="paymentsModule.openRegisterPaymentModal('${order.id}','${ef.id}')" style="padding:2px 6px; font-size:0.73rem;">Cobrar</button>` : ""}
        <button class="btn btn-secondary btn-sm" onclick="paymentsModule.openSchedulePaymentsModal('${order.id}','${ef.id}')" style="padding:2px 6px; font-size:0.73rem;">💰 Cobros</button>
        <button class="btn btn-secondary btn-sm" onclick="paymentsModule.openScheduleInvoicesModal('${order.id}','${ef.id}')" style="padding:2px 6px; font-size:0.73rem;">🧾 Ficha</button>
        <button class="btn btn-secondary btn-sm" onclick="paymentsModule.viewPaymentsHistory('${order.id}','${ef.id}')" style="padding:2px 6px; font-size:0.73rem;">Historial</button>
    </div>
</td>
```

- [ ] **Localizar** el bloque exacto en `christmas-erp/js/modules/payments.js`. Buscá la cadena `openRegisterPaymentModal` dentro de `renderControlTab()` — está alrededor de la línea 292.

- [ ] **Reemplazar** el `<td>` completo con el siguiente bloque:

```javascript
<td style="padding:6px 10px; text-align:right;">
    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
        ${deuda > 0 ? `
            <button class="btn btn-green btn-sm"
                    onclick="paymentsModule.openSchedulePaymentsModal('${order.id}','${ef.id}')"
                    style="padding:3px 10px; font-size:0.73rem; font-weight:600;">
                Registrar cobro
            </button>
        ` : ''}
        <div style="display:flex; gap:4px;">
            <button class="btn btn-secondary btn-sm"
                    onclick="paymentsModule.openSchedulePaymentsModal('${order.id}','${ef.id}')"
                    style="padding:2px 6px; font-size:0.7rem;">
                Plan de cobros
            </button>
            <button class="btn btn-secondary btn-sm"
                    onclick="paymentsModule.openScheduleInvoicesModal('${order.id}','${ef.id}')"
                    style="padding:2px 6px; font-size:0.7rem;">
                Plan de facturación
            </button>
            <button class="btn btn-secondary btn-sm"
                    onclick="paymentsModule.viewPaymentsHistory('${order.id}','${ef.id}')"
                    style="padding:2px 6px; font-size:0.7rem;">
                Historial
            </button>
        </div>
    </div>
</td>
```

- [ ] **Verificar** que no quede ninguna referencia a `openRegisterPaymentModal` ni a los emojis `💰` o `🧾` dentro de `renderControlTab()`.

- [ ] **Commit:**

```bash
git add christmas-erp/js/modules/payments.js
git commit -m "feat: rediseño botones Control de Cobros con layout apilado"
```

---

### Task 2: Deploy

- [ ] **Push a main:**

```bash
git push origin main
```

- [ ] **Verificar en Vercel** que el deploy se complete (~1 min).

- [ ] **Probar en producción** en https://erp-navidad-y-empresas.vercel.app:
  - Finanzas & Caja → Control de Cobros
  - Filas con saldo pendiente: verificar que "Registrar cobro" (verde) aparece arriba y los tres botones secundarios abajo
  - Filas sin saldo: verificar que solo aparecen los tres botones secundarios
  - Tocar "Registrar cobro": debe abrir el modal de cobros programados (no el de registro directo)
  - Tocar "Plan de cobros": debe abrir el mismo modal de cobros programados
  - Tocar "Plan de facturación": debe abrir el modal de facturas
  - Tocar "Historial": debe abrir el historial de pagos
