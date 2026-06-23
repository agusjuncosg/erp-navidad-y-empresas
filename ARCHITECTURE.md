# Arquitectura del ERP — Navidad y Empresas

## Descripción general

SPA (Single Page Application) vanilla JS + HTML + CSS.
Sin frameworks, sin build tools. Se abre directamente en el browser.
Persistencia local via `localStorage`. Sin backend por ahora.

---

## Estructura de carpetas

```
ERP Navidad y Empresas/
│
├── christmas-erp/          ← APP WEB (lo que corre en el browser)
│   ├── index.html          ← Único HTML: shell de la app, sidebar, modal global
│   ├── css/
│   │   └── styles.css      ← Estilos globales + design tokens (variables CSS)
│   ├── img/
│   │   └── logo.png        ← Logo usado dentro de la app
│   └── js/
│       ├── core/           ← Infraestructura del sistema
│       │   ├── store.js    ← Motor de datos: catálogo inicial, estado, localStorage
│       │   └── app.js      ← Router SPA + inicialización + búsqueda global
│       ├── modules/        ← Un archivo por módulo de negocio
│       │   ├── dashboard.js
│       │   ├── sales.js        (CRM / Leads + Pedidos / Ventas)
│       │   ├── inventory.js    (Inventario & Combos)
│       │   ├── purchases.js    (Compras)
│       │   ├── expenses.js     (Gastos — redirige a payments)
│       │   ├── assembly.js     (Cola de Armado)
│       │   ├── logistics.js    (Logística & Envíos)
│       │   ├── payments.js     (Finanzas & Caja)
│       │   ├── employees.js    (Personal & Sueldos)
│       │   ├── reports.js      (Reportes)
│       │   └── settings.js     (Configuración del ERP)
│       └── utils/          ← Utilidades compartidas entre módulos
│           ├── ui.js       ← Sistema de toasts + modal global
│           └── logo.js     ← Lógica de renderizado del logo
│
├── scripts/                ← Herramientas Python (no son parte de la app)
│   ├── read_docx.py        ← Lectura de documentos Word
│   ├── read_xlsx.py        ← Lectura de planillas Excel
│   ├── auditoria_erp.py    ← Auditoría de datos del ERP
│   ├── embed_logo.py       ← Procesamiento de logos
│   ├── generate_store_js.py← Generación de datos para store.js
│   └── convert_logos.py    ← Conversión de formatos de imagen
│
├── data/                   ← Archivos de datos fuente
│   ├── Productos.xlsx       ← Catálogo de productos original
│   └── Productos_Extraidos.txt
│
├── docs/                   ← Documentación del negocio
│   ├── PROCESO CAJAS NAVIDEÑAS.docx
│   ├── HOJA DE ARMADO.pdf
│   ├── Identidad - Navidad y Empresas.pdf
│   └── Auditoria_ERP_Navidad_y_Empresas.docx
│
├── assets/                 ← Logos e imágenes fuente (alta resolución)
│   ├── LOGO NAVIDAD Y EMPRESAS.png
│   └── LOGO GOLOSINAS Y COMESTIBLES.png
│
└── ARCHITECTURE.md         ← Este archivo
```

---

## Cómo funciona la app

### Flujo de carga

```
index.html
  → carga store.js       (datos + localStorage)
  → carga ui.js          (toasts + modal)
  → carga logo.js        (utilidad visual)
  → carga módulos...     (cada módulo se registra como window.xModule)
  → carga app.js         (instancia ChristmasERPApp → llama init())
```

### Patrón de módulo

Cada módulo de negocio sigue este patrón:

```js
const xModule = (() => {
    function render(container) { /* inyecta HTML en el contenedor */ }
    // métodos internos...
    return { render };
})();
window.xModule = xModule;
```

El router en `app.js` llama `window.xModule.render(mainContent)` al navegar.

### Store (fuente de verdad única)

`store.js` expone el objeto global `store` con:
- `store.orders`, `store.leads`, `store.products`, `store.employees`, etc.
- `store.saveData()` — persiste en localStorage
- `store.resetToDefaults()` — restaura datos de fábrica

**Regla:** ningún módulo guarda estado propio. Todo pasa por `store`.

### UI compartida

`ui.js` expone `window.ui` con:
- `ui.showToast(message, type)` — notificaciones flotantes
- `ui.showModal(title, html, callback)` — modal global
- `ui.closeModal()`

Los módulos también pueden llamar `app.showToast()` / `app.showModal()` — estos delegan a `ui.js` por compatibilidad.

---

## Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Vanilla JS sin framework | Simplicidad máxima, cero dependencias, sin build step |
| Un módulo = un archivo | Facilita encontrar código, limita el scope de cambios |
| `store.js` como única fuente de verdad | Preparado para migración futura a API/DB central |
| `ui.js` separado del router | Las utilidades de UI son compartidas; no pertenecen al router |
| `settings.js` como módulo independiente | Configuración es un dominio propio, no lógica del router |

---

## Migración futura (roadmap técnico)

La arquitectura actual está diseñada para escalar hacia:

1. **Backend + base de datos:** `store.js` puede reemplazarse por llamadas a una API REST sin tocar los módulos.
2. **Multiusuario:** el campo `currentUser`/`currentRole` en `app.js` es el punto de extensión para autenticación real.
3. **Bundler/framework:** los módulos IIFE son compatibles con ES Modules con cambios mínimos.
