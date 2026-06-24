# Diseño: Mejora UX de Opciones en Nueva Cotización

**Fecha:** 2026-06-24  
**Módulo:** Pedidos / Ventas → Nueva Cotización  
**Archivo principal:** `christmas-erp/js/modules/sales.js`

---

## Problema

Al crear una cotización con múltiples opciones (ej: económica / estándar / premium), el flujo actual no tiene un botón explícito de "guardar opción". El botón "+ Agregar Opción" es pequeño, dorado, mezclado entre las pestañas, y no comunica claramente que al tocarlo se guarda la opción actual. Las pestañas tampoco muestran contexto (solo el nombre, sin precio).

## Solución

### 1. Botón "Guardar Opción →"

- **Reemplaza** el botón "+ Agregar Opción" dentro de `renderOptionsTabs()`
- **Ubicación:** panel derecho del modal, justo encima de los botones finales ("Generar Presupuesto" / "Cerrar")
- **Comportamiento:** idéntico al `addOption()` actual — llama a `saveActiveOptionData()`, crea nueva opción vacía, cambia a ella, hace foco en el campo "Nombre de la Opción"
- **Visibilidad:** solo se muestra cuando hay menos de 5 opciones
- **Color:** azul primario (`btn-primary`) para diferenciarlo del botón "Generar Presupuesto" (también primario pero más grande y al final)
- **Label:** "Guardar Opción →" — el texto comunica tanto la acción (guardar) como la consecuencia (ir a la siguiente)

### 2. Pestañas de opciones rediseñadas

- **Contenido:** cada tab muestra `[Nombre] · $[Total]` — ej: `Opción Estándar · $48.000`
- **Tamaño:** padding ligeramente mayor, font-size 0.78rem en lugar de 0.75rem
- **Tab activa:** borde inferior grueso (3px, color primario) además del color de fondo, para distinguirla claramente
- **Botón ✕:** permanece igual (esquina superior, rojo, elimina la opción con confirm)
- **Posición:** misma ubicación actual (arriba a la derecha del panel de composición)
- **Actualización:** el total en cada tab se recalcula al cambiar de opción (via `renderOptionsTabs()` llamado desde `updateBuilderTotals()`)

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `christmas-erp/js/modules/sales.js` | `renderOptionsTabs()`: rediseño de tabs con nombre+total y borde activo. Mover botón "+ Agregar" fuera de esta función. `openQuoteModal()`: agregar botón "Guardar Opción →" en el HTML del panel derecho, antes de los botones finales. |

---

## Comportamiento por caso

| Situación | Resultado |
|---|---|
| 1 opción (inicio) | Botón "Guardar Opción →" visible. Tab muestra nombre + total $0 |
| Hacer clic en "Guardar Opción →" | Guarda opción actual, crea Opción 2 vacía, foco en nombre |
| 4 opciones | Botón "Guardar Opción →" visible |
| 5 opciones | Botón "Guardar Opción →" oculto (límite alcanzado) |
| Eliminar una opción | Tab desaparece; se activa la anterior |

---

## Fuera de alcance

- No se cambia el layout general del modal
- No se cambia el flujo de guardado final ("Generar Presupuesto")
- No se agrega validación de opciones incompletas
