# Diseño: Rediseño visual de botones en Control de Cobros

**Fecha:** 2026-06-24  
**Módulo:** Finanzas & Caja → Control de Cobros  
**Archivo principal:** `christmas-erp/js/modules/payments.js`

---

## Problema

Los botones actuales en la columna "Acciones" del Control de Cobros son confusos:
- "Cobrar" (verde) registra el monto total directamente, sin mostrar los cobros programados
- "💰 Cobros" y "🧾 Ficha" no comunican claramente su función
- Los cuatro botones están en una sola fila sin jerarquía visual

## Solución

### Layout

Dos filas de botones por entidad, alineadas a la derecha:

1. **Fila superior:** botón "Registrar cobro" (verde, prominente) — solo visible cuando `deuda > 0`
2. **Fila inferior:** tres botones secundarios más pequeños — "Plan de cobros", "Plan de facturación", "Historial"

### Comportamiento de cada botón

| Botón | Función | Condición de visibilidad |
|---|---|---|
| Registrar cobro | `openSchedulePaymentsModal(orderId, efId)` | Solo cuando `deuda > 0` |
| Plan de cobros | `openSchedulePaymentsModal(orderId, efId)` | Siempre |
| Plan de facturación | `openScheduleInvoicesModal(orderId, efId)` | Siempre |
| Historial | `viewPaymentsHistory(orderId, efId)` | Siempre |

"Registrar cobro" y "Plan de cobros" abren el mismo modal (`openSchedulePaymentsModal`). La diferencia es la jerarquía visual: el primero es acceso rápido al cobro, el segundo es gestión del plan. El modal ya muestra los cobros programados con botón "Cobrar" en cada cuota.

### HTML del bloque de acciones (reemplaza el actual)

```html
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
```

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `christmas-erp/js/modules/payments.js` | `renderControlTab()`: reemplazar el bloque `<div style="display:flex; gap:4px; justify-content:flex-end; flex-wrap:wrap;">` (~línea 291–296) con el nuevo bloque de dos filas. |

---

## Fuera de alcance

- No se modifica la lógica de ningún modal
- No se modifica `openRegisterPaymentModal` (queda en el código pero deja de usarse desde esta tabla)
- No se cambia ninguna otra sección del módulo (Agenda del Día, Calendario, etc.)
