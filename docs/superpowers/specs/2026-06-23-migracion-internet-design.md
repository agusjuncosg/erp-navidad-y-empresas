# Migración del ERP a Internet — Diseño

**Fecha:** 2026-06-23  
**Estado:** Aprobado

---

## Resumen

Migrar el ERP de Navidad y Empresas de una SPA local (localStorage) a una aplicación web accesible desde internet, con datos centralizados en una base de datos real y autenticación por email/password.

---

## Contexto

El ERP actual es una SPA vanilla JS + HTML + CSS sin backend. Los datos viven en `localStorage` de cada browser. La arquitectura ya fue diseñada anticipando esta migración: `store.js` es la única capa que toca persistencia, y los módulos de negocio no saben cómo se guardan los datos.

**Usuarios:** 5 personas (el dueño + 4 colaboradores). Sin diferenciación de roles — todos tienen acceso completo.  
**Datos existentes:** Se arranca desde cero, sin migración de datos.  
**Costo aceptado:** Sin restricción.

---

## Arquitectura

```
Browser (vanilla JS) ──fetch()──► Supabase (API REST + Auth) ──SQL──► PostgreSQL
```

**Frontend:** El HTML/CSS/JS existente se sirve desde Netlify o Vercel (deploy estático, HTTPS automático, dominio propio opcional).

**Backend:** Supabase — Postgres gestionado con API REST auto-generada y Auth incluido. Sin servidor Node propio que mantener.

**No hay servidor de aplicación.** Supabase es el backend completo.

---

## Qué cambia en el código

| Componente | Cambio |
|---|---|
| `index.html` | Agrega 1 script tag (cliente Supabase) + pantalla de login |
| `store.js` | Reemplazado: localStorage → llamadas fetch a Supabase API |
| Todos los módulos | Sin cambios |
| `app.js`, `ui.js`, CSS | Sin cambios |

La interfaz pública del store (`store.orders`, `store.products`, `store.saveData()`, etc.) se mantiene igual para que los módulos no se enteren del cambio.

---

## Base de Datos (PostgreSQL en Supabase)

### Tablas

| Tabla | Campos principales |
|---|---|
| `products` | id, code, name, brand, category, cost, price, stock, created_at |
| `orders` | id, order_number, client_name, status, items (JSON), total, created_at |
| `leads` | id, name, company, phone, email, status, notes, created_at |
| `purchases` | id, supplier, items (JSON), total, status, created_at |
| `payments` | id, type, category, amount, description, date, created_at |
| `employees` | id, name, role, salary, start_date, created_at |
| `assembly_queue` | id, order_id (FK → orders), status, assigned_to, notes, created_at |
| `logistics` | id, order_id (FK → orders), carrier, tracking, status, delivery_date |

### Autenticación y acceso

- **Auth:** Supabase Auth con email + password. Los 5 usuarios se crean manualmente desde el dashboard de Supabase. No hay registro público.
- **Row Level Security (RLS):** Política única — cualquier usuario autenticado puede leer y escribir todas las tablas. Sin roles diferenciados.

---

## Plan de implementación

### Fase 1 — Setup de Supabase + login (~2-3 días)
- Crear proyecto en Supabase
- Definir y crear todas las tablas con RLS activado
- Crear los 5 usuarios en Supabase Auth
- Agregar pantalla de login al ERP (intercepta el boot de `app.js` si no hay sesión activa)
- Agregar cliente JS de Supabase (`supabase-js` via CDN)

### Fase 2 — Reemplazar store.js (~3-5 días)
- Reescribir `store.js` para que cada `store.saveData()` haga un upsert a Supabase
- Reescribir la carga inicial: en vez de leer localStorage, hacer fetch de todas las tablas al iniciar
- Mantener la interfaz pública idéntica para no romper ningún módulo
- Probar módulo por módulo que las operaciones CRUD funcionan correctamente

### Fase 3 — Deploy a producción (~1-2 días)
- Configurar proyecto en Netlify (o Vercel) conectado a la carpeta `christmas-erp/`
- Configurar variables de entorno: `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- Prueba end-to-end con los 5 usuarios reales
- Verificar que los datos son compartidos entre dispositivos

### Fase 4 — Post-lanzamiento (ongoing)
- Backups automáticos (incluidos en Supabase Pro)
- Dominio propio si se desea
- Ajustes de UX según feedback del equipo

---

## Costos

| Servicio | Costo |
|---|---|
| Supabase Pro | ~$25 USD/mes |
| Netlify/Vercel (frontend) | Gratis |
| Dominio propio (opcional) | ~$15 USD/año |

---

## Tiempo total estimado

**1-2 semanas** para tener el sistema funcionando en producción con los 5 usuarios.

---

## Decisiones tomadas

| Decisión | Motivo |
|---|---|
| Supabase sobre Railway+Node | Cero backend que escribir — la API la genera Supabase automáticamente |
| Sin roles en el sistema | Requerimiento explícito — simplifica auth y RLS |
| Arrancar desde cero | Los datos de localStorage no se migran — decisión del dueño |
| Mantener vanilla JS | No introducir un framework innecesario cuando el frontend ya funciona |
