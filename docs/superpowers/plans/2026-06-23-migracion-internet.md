# Migración a Internet — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el ERP de localStorage a Supabase (Postgres + Auth) y desplegarlo en Netlify para 5 usuarios.

**Architecture:** El frontend vanilla JS se sirve estático desde Netlify. Al bootear, verifica sesión con Supabase Auth; si no hay sesión, muestra pantalla de login. Una vez autenticado, `store.init()` carga todos los datos desde Supabase y los mantiene en memoria. `store.saveData()` hace upsert async a Supabase (fire-and-forget). Los módulos no cambian.

**Tech Stack:** Supabase JS v2 (CDN), Supabase Auth (email+password), PostgreSQL (JSONB), Netlify (static deploy)

---

## File Structure

| Archivo | Acción | Qué hace |
|---|---|---|
| `christmas-erp/js/core/supabase-client.js` | **CREAR** | Init del cliente Supabase (URL + anon key) |
| `christmas-erp/js/core/auth.js` | **CREAR** | Login / logout / checkSession |
| `christmas-erp/index.html` | **MODIFICAR** | Agrega scripts CDN, login overlay, loading screen |
| `christmas-erp/js/core/store.js` | **MODIFICAR** | Reemplaza loadData/saveData con Supabase |
| `christmas-erp/js/core/app.js` | **MODIFICAR** | Boot async: espera auth → store.init() → init() |
| `supabase/migrations/001_initial_schema.sql` | **CREAR** | SQL de tablas + RLS |
| `netlify.toml` | **CREAR** | Config SPA redirect |

---

## Task 1: Crear proyecto Supabase y tablas

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Crear proyecto en Supabase**

  Ir a https://supabase.com → New Project.
  - Nombre: `navidad-y-empresas-erp`
  - Password: (guardar en lugar seguro)
  - Región: South America (São Paulo)

  Esperar ~2 minutos a que el proyecto esté listo.

- [ ] **Step 2: Escribir el SQL del schema**

  Crear el archivo:

```sql
-- Esquema ERP Navidad y Empresas
-- Cada tabla tiene: id TEXT PRIMARY KEY + data JSONB (record completo)
-- Esto permite upsert directo de los objetos JS existentes sin transformación.

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS combos (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Activar RLS en todas las tablas
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees      ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance     ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config     ENABLE ROW LEVEL SECURITY;

-- Política: cualquier usuario autenticado puede leer y escribir todo
CREATE POLICY "authenticated_full_access" ON products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON orders
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON leads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON purchases
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON employees
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON attendance
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON combos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON providers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON app_config
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

- [ ] **Step 3: Ejecutar el SQL en Supabase**

  En el dashboard de Supabase: SQL Editor → New query → pegar el contenido de `001_initial_schema.sql` → Run.

  Verificar: en Table Editor deben aparecer las 10 tablas.

- [ ] **Step 4: Crear los 5 usuarios**

  En el dashboard: Authentication → Users → Invite User (o Add User).

  Crear estos usuarios (o los que correspondan):
  - agusjuncos98@gmail.com (Agustín — admin)
  - (los otros 4 con sus emails reales)

  Importante: en Authentication → Settings → desactivar "Enable email confirmations" para que el login funcione sin confirmar el mail.

- [ ] **Step 5: Anotar las credenciales**

  En el dashboard: Settings → API.
  Copiar:
  - `Project URL` → será `SUPABASE_URL`
  - `anon public` key → será `SUPABASE_ANON_KEY`

  Guardarlos; se usan en el Task 2.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/001_initial_schema.sql
git commit -m "feat: add Supabase schema with RLS"
```

---

## Task 2: Crear supabase-client.js

**Files:**
- Create: `christmas-erp/js/core/supabase-client.js`

- [ ] **Step 1: Crear el archivo**

  Reemplazar los valores de URL y KEY con los del Step 5 del Task 1:

```javascript
// Cliente Supabase — única fuente del cliente en toda la app.
// SUPABASE_URL y SUPABASE_ANON_KEY se obtienen del dashboard de Supabase → Settings → API.

const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});
```

- [ ] **Step 2: Verificar en consola del browser**

  Abrir `christmas-erp/index.html` en el browser (después de agregar los scripts en Task 4).
  En la consola ejecutar:
  ```javascript
  console.log(typeof supabaseClient); // debe imprimir "object"
  ```

- [ ] **Step 3: Commit**

```bash
git add christmas-erp/js/core/supabase-client.js
git commit -m "feat: add Supabase client init"
```

---

## Task 3: Crear auth.js

**Files:**
- Create: `christmas-erp/js/core/auth.js`

- [ ] **Step 1: Crear el archivo**

```javascript
// Autenticación con Supabase Auth.
// Expone: auth.checkSession(), auth.showLoginScreen(), auth.logout()

const auth = (() => {

    async function checkSession() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session;
    }

    async function _doLogin(email, password) {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        return error;
    }

    async function logout() {
        await supabaseClient.auth.signOut();
        window.location.reload();
    }

    function showLoginScreen() {
        return new Promise((resolve) => {
            const overlay = document.getElementById('login-overlay');
            const btnLogin = document.getElementById('btn-login');
            const inputEmail = document.getElementById('login-email');
            const inputPassword = document.getElementById('login-password');
            const errorEl = document.getElementById('login-error');
            const btnText = document.getElementById('btn-login-text');
            const spinner = document.getElementById('btn-login-spinner');

            overlay.style.display = 'flex';

            // Permitir submit con Enter en el campo password
            inputPassword.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') btnLogin.click();
            });

            btnLogin.addEventListener('click', async () => {
                const email = inputEmail.value.trim();
                const password = inputPassword.value;

                if (!email || !password) {
                    errorEl.textContent = 'Completá email y contraseña.';
                    return;
                }

                // Loading state
                btnLogin.disabled = true;
                btnText.style.display = 'none';
                spinner.style.display = 'inline';
                errorEl.textContent = '';

                const error = await _doLogin(email, password);

                if (error) {
                    btnLogin.disabled = false;
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    errorEl.textContent = 'Email o contraseña incorrectos.';
                } else {
                    overlay.style.display = 'none';
                    resolve();
                }
            });
        });
    }

    return { checkSession, showLoginScreen, logout };
})();

window.auth = auth;
```

- [ ] **Step 2: Commit**

```bash
git add christmas-erp/js/core/auth.js
git commit -m "feat: add Supabase auth module"
```

---

## Task 4: Modificar index.html

**Files:**
- Modify: `christmas-erp/index.html`

- [ ] **Step 1: Leer el index.html actual para conocer la estructura**

  Revisar dónde están los `<script>` tags al final del body.

- [ ] **Step 2: Agregar el CDN de Supabase JS como primer script**

  Agregar antes de cualquier otro `<script>`:

```html
<!-- Supabase JS v2 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/core/supabase-client.js"></script>
<script src="js/core/auth.js"></script>
```

  Estos tres scripts deben cargarse ANTES de `store.js` y `app.js`.

- [ ] **Step 3: Agregar el login overlay al body (antes del sidebar/layout principal)**

  Insertar inmediatamente después de `<body>`:

```html
<!-- Login Overlay -->
<div id="login-overlay" style="display:none; position:fixed; inset:0; background:var(--bg-secondary); z-index:9999; align-items:center; justify-content:center;">
    <div style="background:var(--bg-primary); border:1px solid var(--border); border-radius:12px; padding:40px; width:360px; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
        <div style="text-align:center; margin-bottom:32px;">
            <img src="img/logo.png" alt="Navidad y Empresas" style="height:48px; margin-bottom:16px; display:block; margin-left:auto; margin-right:auto;">
            <h2 style="margin:0; font-size:1.2rem;">ERP — Navidad y Empresas</h2>
            <p style="margin:8px 0 0; color:var(--text-secondary); font-size:0.9rem;">Ingresá con tu cuenta</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
            <input id="login-email" type="email" placeholder="Email" autocomplete="email"
                style="padding:10px 14px; border:1px solid var(--border); border-radius:6px; background:var(--bg-secondary); color:var(--text-primary); font-size:1rem;">
            <input id="login-password" type="password" placeholder="Contraseña" autocomplete="current-password"
                style="padding:10px 14px; border:1px solid var(--border); border-radius:6px; background:var(--bg-secondary); color:var(--text-primary); font-size:1rem;">
            <p id="login-error" style="color:var(--danger, #e53e3e); font-size:0.85rem; min-height:1.2em; margin:0;"></p>
            <button id="btn-login"
                style="padding:12px; background:var(--accent); color:white; border:none; border-radius:6px; font-size:1rem; cursor:pointer; font-weight:600;">
                <span id="btn-login-text">Ingresar</span>
                <span id="btn-login-spinner" style="display:none;">Cargando...</span>
            </button>
        </div>
    </div>
</div>

<!-- App Loading Screen -->
<div id="app-loading" style="display:flex; position:fixed; inset:0; background:var(--bg-secondary); z-index:9998; align-items:center; justify-content:center; flex-direction:column; gap:16px;">
    <img src="img/logo.png" alt="" style="height:48px; opacity:0.7;">
    <p style="color:var(--text-secondary); font-size:0.95rem;">Cargando ERP...</p>
</div>
```

- [ ] **Step 4: Agregar botón de logout en el sidebar**

  En el sidebar del HTML, al final de la lista de navegación, agregar:

```html
<div style="margin-top:auto; padding:16px;">
    <button onclick="auth.logout()"
        style="width:100%; padding:8px; background:transparent; border:1px solid var(--border); border-radius:6px; color:var(--text-secondary); cursor:pointer; font-size:0.85rem;">
        Cerrar sesión
    </button>
</div>
```

- [ ] **Step 5: Verificar que los scripts siguen en orden correcto**

  El orden al final del body debe ser:
  1. `supabase.js` (CDN)
  2. `supabase-client.js`
  3. `auth.js`
  4. `ui.js`
  5. `logo.js`
  6. Módulos de negocio (dashboard, sales, inventory, etc.)
  7. `store.js`
  8. `app.js`

- [ ] **Step 6: Commit**

```bash
git add christmas-erp/index.html
git commit -m "feat: add login overlay and app loading screen to index.html"
```

---

## Task 5: Reescribir store.js (loadData y saveData)

**Files:**
- Modify: `christmas-erp/js/core/store.js`

Este es el cambio más importante. El store mantiene su interfaz pública idéntica — solo cambia la implementación de `loadData()` y `saveData()`.

- [ ] **Step 1: Quitar la llamada a loadData() del constructor**

  Encontrar en `store.js`:
  ```javascript
  class ChristmasERPStore {
      constructor() {
          this.loadData();
      }
  ```

  Reemplazar por:
  ```javascript
  class ChristmasERPStore {
      constructor() {
          // Los datos se cargan de forma async via store.init()
          // llamado desde app._boot() después de verificar la sesión.
      }
  ```

- [ ] **Step 2: Agregar el método async init()**

  Agregar después del constructor (antes de `loadData()`):

```javascript
    async init() {
        try {
            const [
                { data: products },
                { data: orders },
                { data: leads },
                { data: purchases },
                { data: expenses },
                { data: employees },
                { data: attendance },
                { data: combos },
                { data: providers },
                { data: config }
            ] = await Promise.all([
                supabaseClient.from('products').select('data'),
                supabaseClient.from('orders').select('data'),
                supabaseClient.from('leads').select('data'),
                supabaseClient.from('purchases').select('data'),
                supabaseClient.from('expenses').select('data'),
                supabaseClient.from('employees').select('data'),
                supabaseClient.from('attendance').select('data'),
                supabaseClient.from('combos').select('data'),
                supabaseClient.from('providers').select('data'),
                supabaseClient.from('app_config').select('key, value')
            ]);

            if (products && products.length > 0) {
                this.products = products.map(r => r.data);
            } else {
                this.products = JSON.parse(JSON.stringify(INITIAL_CATALOG));
            }

            if (orders && orders.length > 0) {
                this.orders = orders.map(r => r.data);
            } else {
                this.orders = [];
            }

            if (leads && leads.length > 0) {
                this.leads = leads.map(r => r.data);
            } else {
                this.leads = JSON.parse(JSON.stringify(INITIAL_LEADS));
            }

            if (purchases && purchases.length > 0) {
                this.purchases = purchases.map(r => r.data);
            } else {
                this.purchases = [];
            }

            if (expenses && expenses.length > 0) {
                this.expenses = expenses.map(r => r.data);
            } else {
                this.expenses = [];
            }

            if (employees && employees.length > 0) {
                this.employees = employees.map(r => r.data);
            } else {
                this.employees = JSON.parse(JSON.stringify(INITIAL_EMPLOYEES));
            }

            if (attendance && attendance.length > 0) {
                this.attendance = attendance.map(r => r.data);
            } else {
                this.attendance = JSON.parse(JSON.stringify(INITIAL_ATTENDANCE));
            }

            if (combos && combos.length > 0) {
                this.combos = combos.map(r => r.data);
            } else {
                this.combos = JSON.parse(JSON.stringify(INITIAL_COMBOS));
            }

            if (providers && providers.length > 0) {
                this.providers = providers.map(r => r.data);
            } else {
                this.providers = JSON.parse(JSON.stringify(INITIAL_PROVIDERS));
            }

            // app_config tiene key/value separados
            const configMap = {};
            if (config) config.forEach(r => { configMap[r.key] = r.value; });
            this.settings = configMap.settings || JSON.parse(JSON.stringify(DEFAULT_GLOBAL_SETTINGS));
            this.nextOrderNumber = configMap.nextOrderNumber ?? 1;

            // Aplicar las mismas migraciones que tenía loadData()
            this._applyMigrations();

        } catch (e) {
            console.error('Error cargando datos de Supabase:', e);
            // Fallback: usar defaults para no dejar la app rota
            this.resetToDefaults();
        }
    }
```

- [ ] **Step 3: Extraer las migraciones a _applyMigrations()**

  Agregar este método (contiene la lógica que estaba dentro del `try` de `loadData()`):

```javascript
    _applyMigrations() {
        // Migración: attendance paymentStatus
        (this.attendance || []).forEach(att => {
            if (!att.paymentStatus) att.paymentStatus = 'Pendiente';
        });

        // Migración: leads notes string → array
        (this.leads || []).forEach(lead => {
            if (typeof lead.notes === 'string') {
                const txt = lead.notes.trim();
                lead.notes = txt ? [{ date: lead.date || new Date().toISOString(), user: 'Sistema', text: txt }] : [];
            } else if (!Array.isArray(lead.notes)) {
                lead.notes = [];
            }
        });

        // Migración: orders displayId
        (this.orders || []).forEach((order, idx) => {
            if (!order.displayId) {
                const year = order.date ? order.date.substring(0, 4) : new Date().getFullYear();
                order.displayId = `P-${year}-${String(idx + 1).padStart(3, '0')}`;
            }
            if (order.status === 'Terminado / Listo') order.status = 'Listo para Despacho';
            if (!order.armado) order.armado = { cajasArmadas: 0, fotoArmado: null, sesiones: [] };
            if (!order.entidadesFacturacion || order.entidadesFacturacion.length === 0) {
                order.entidadesFacturacion = [{
                    id: `ef_${order.id}_1`,
                    razonSocial: order.clientName || '',
                    cuit: order.cuit || '',
                    cantidadCajas: order.numberOfBoxes || 0,
                    monto: order.total || 0,
                    pagos: order.payments ? JSON.parse(JSON.stringify(order.payments)) : [],
                    facturas: order.scheduledInvoices ? JSON.parse(JSON.stringify(order.scheduledInvoices)) : []
                }];
            }
            if (!order.entregas || order.entregas.length === 0) {
                order.entregas = [{
                    id: `ent_${order.id}_1`,
                    cantidadCajas: order.numberOfBoxes || 0,
                    direccion: order.deliveryAddress || '',
                    localidad: order.deliveryLocation || '',
                    provincia: '',
                    fechaEntrega: order.deliveryDate || '',
                    chofer: order.assignedDriver || '',
                    costoEnvio: order.shippingRealCost || order.internalShippingCost || 0,
                    status: ChristmasERPStore._legacyDeliveryStatus(order.status),
                    remito: order.signedRemitoPhoto || '',
                    fotoEntrega: ''
                }];
            }
            if (order.shippingRealCost === undefined) order.shippingRealCost = order.internalShippingCost || 0;
            if (order.shippingCharged === undefined) order.shippingCharged = order.internalShippingCost || 0;
            if (order.shippingBonificado === undefined) order.shippingBonificado = 0;
            if (order.shippingZone === undefined) order.shippingZone = order.deliveryLocation ? 'Manual' : '';
            if (order.shippingCalcMode === undefined) order.shippingCalcMode = 'manual';
        });

        // Migración: employees
        const normalGlobal = (this.settings || {}).valorHoraNormal || 2500;
        const extraGlobal = (this.settings || {}).valorHoraExtra || 3750;
        (this.employees || []).forEach(emp => {
            if (emp.isCustomRate === undefined) {
                emp.isCustomRate = (emp.hourlyRate !== normalGlobal || emp.extraHourlyRate !== extraGlobal);
            }
            if (!emp.status) emp.status = 'Activo';
        });

        // Migración: nextOrderNumber
        if (!this.nextOrderNumber || this.nextOrderNumber < 1) {
            this.nextOrderNumber = (this.orders || []).length + 1;
        }

        // Migración: confirmar stockDescontado en órdenes ya confirmadas
        const CONFIRMED_STATUSES = ['Confirmado', 'En Producción', 'Armado Parcial',
            'Listo para Despacho', 'Entrega Parcial', 'Entregado', 'Cerrado'];
        (this.orders || []).forEach(o => {
            if (o.stockDescontado === undefined && CONFIRMED_STATUSES.includes(o.status)) {
                o.stockDescontado = true;
            }
        });
    }
```

- [ ] **Step 4: Reemplazar saveData() con la versión Supabase**

  Encontrar el método `saveData()` actual (línea ~2648 en store.js) y reemplazarlo completo:

```javascript
    saveData() {
        // Fire-and-forget: los módulos llaman saveData() de forma síncrona,
        // el upsert a Supabase se hace en background.
        this._persistToSupabase().catch(e => {
            console.error('Error al guardar en Supabase:', e);
        });
    }

    async _persistToSupabase() {
        const toRows = (arr) => (arr || []).map(item => ({ id: item.id, data: item }));

        await Promise.all([
            supabaseClient.from('products').upsert(toRows(this.products)),
            supabaseClient.from('orders').upsert(toRows(this.orders)),
            supabaseClient.from('leads').upsert(toRows(this.leads)),
            supabaseClient.from('purchases').upsert(toRows(this.purchases)),
            supabaseClient.from('expenses').upsert(toRows(this.expenses)),
            supabaseClient.from('employees').upsert(toRows(this.employees)),
            supabaseClient.from('attendance').upsert(toRows(this.attendance)),
            supabaseClient.from('combos').upsert(toRows(this.combos)),
            supabaseClient.from('providers').upsert(toRows(this.providers)),
            supabaseClient.from('app_config').upsert([
                { key: 'settings', value: this.settings },
                { key: 'nextOrderNumber', value: this.nextOrderNumber }
            ])
        ]);
    }
```

- [ ] **Step 5: Remover la línea de localStorage al final del archivo**

  Al final del archivo encontrar y eliminar:
  ```javascript
  localStorage.removeItem("christmas_erp_data")
  ```
  y en loadData(), ya no es necesario ese método — se puede dejar vacío o eliminar (el nuevo código usa `init()`).

- [ ] **Step 6: Verificar que resetToDefaults() sigue funcionando**

  `resetToDefaults()` actualmente llama `this.saveData()` al final — con el nuevo `saveData()` eso es correcto. No hay que cambiar nada ahí.

- [ ] **Step 7: Commit**

```bash
git add christmas-erp/js/core/store.js
git commit -m "feat: migrate store.js from localStorage to Supabase"
```

---

## Task 6: Modificar app.js para boot async

**Files:**
- Modify: `christmas-erp/js/core/app.js`

- [ ] **Step 1: Agregar el método _boot() y cambiar el constructor**

  Encontrar en `app.js`:
  ```javascript
  constructor() {
      this.activeView  = "dashboard";
      this.currentUser = "Agustín";
      this.currentRole = "Administrador";

      document.addEventListener("DOMContentLoaded", () => this.init());
  }
  ```

  Reemplazar por:
  ```javascript
  constructor() {
      this.activeView  = "dashboard";
      this.currentUser = "Agustín";
      this.currentRole = "Administrador";

      document.addEventListener("DOMContentLoaded", () => this._boot());
  }

  async _boot() {
      // 1. Verificar si hay sesión activa
      let session = await auth.checkSession();

      // 2. Si no hay sesión, mostrar login y esperar
      if (!session) {
          document.getElementById('app-loading').style.display = 'none';
          await auth.showLoginScreen();
          document.getElementById('app-loading').style.display = 'flex';
      }

      // 3. Cargar datos desde Supabase
      await store.init();

      // 4. Ocultar loading y arrancar el router
      document.getElementById('app-loading').style.display = 'none';
      this.init();
  }
  ```

- [ ] **Step 2: Verificar que init() no cambia**

  El método `init()` existente queda exactamente igual — solo se llama desde `_boot()` en vez de desde el constructor.

- [ ] **Step 3: Commit**

```bash
git add christmas-erp/js/core/app.js
git commit -m "feat: async boot with Supabase auth and store.init()"
```

---

## Task 7: Crear netlify.toml

**Files:**
- Create: `netlify.toml`

- [ ] **Step 1: Crear el archivo en la raíz del proyecto**

```toml
[build]
  publish = "christmas-erp"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

  Esto le dice a Netlify:
  - La carpeta a servir es `christmas-erp/`
  - Todas las rutas desconocidas redirigen a `index.html` (necesario para SPAs)

- [ ] **Step 2: Commit**

```bash
git add netlify.toml
git commit -m "feat: add Netlify config for SPA deploy"
```

---

## Task 8: Testing manual — verificar que todo funciona localmente

**Files:** (ninguno — solo verificación)

- [ ] **Step 1: Abrir index.html en el browser**

  Abrir `christmas-erp/index.html` en Chrome (o cualquier browser moderno).

  Esperado: aparecer el login overlay con el logo y los campos de email/contraseña.

- [ ] **Step 2: Verificar login con un usuario creado en Supabase**

  Ingresar con email y contraseña de uno de los usuarios creados en Task 1, Step 4.

  Esperado:
  - El spinner aparece brevemente
  - El login overlay desaparece
  - Aparece la pantalla de carga "Cargando ERP..."
  - La app carga el dashboard

- [ ] **Step 3: Verificar carga de datos en consola**

  Abrir DevTools → Console. No debe haber errores rojos.

  Ejecutar en consola:
  ```javascript
  console.log(store.products.length); // debe ser > 0 (el catálogo por defecto)
  console.log(store.orders.length);   // debe ser 0 (arrancamos desde cero)
  ```

- [ ] **Step 4: Crear un producto nuevo desde Inventario y verificar en Supabase**

  En la app: ir a Inventario → crear un producto de prueba.

  En el dashboard de Supabase → Table Editor → products: debe aparecer el nuevo producto.

  Verificar que el campo `data` contiene el JSON completo del producto.

- [ ] **Step 5: Crear un pedido de prueba y verificar en Supabase**

  En la app: ir a Pedidos → crear un pedido de prueba.

  En el dashboard de Supabase → Table Editor → orders: debe aparecer el pedido.

- [ ] **Step 6: Verificar con segundo usuario (sesión diferente)**

  Abrir el mismo `index.html` en una ventana de incógnito.

  Login con un segundo usuario.

  Verificar que ve los mismos datos que el primer usuario (productos, pedidos creados en Step 4 y 5).

  Si los datos se ven en ambas sesiones → la persistencia compartida está funcionando.

- [ ] **Step 7: Verificar logout**

  Hacer click en el botón "Cerrar sesión" del sidebar.

  Esperado: la página se recarga y muestra el login overlay nuevamente.

---

## Task 9: Deploy a Netlify

**Files:** (ninguno — proceso externo)

- [ ] **Step 1: Crear repo en GitHub (si no existe)**

  Si el proyecto no está en GitHub todavía:
  ```bash
  git init
  git remote add origin https://github.com/TU_USUARIO/erp-navidad-y-empresas.git
  git push -u origin main
  ```

- [ ] **Step 2: Conectar Netlify a GitHub**

  Ir a https://netlify.com → Add new site → Import an existing project → GitHub.

  Seleccionar el repo. Netlify detecta el `netlify.toml` automáticamente.

  Deploy settings:
  - Branch: `main`
  - Build command: (vacío — no hay build step)
  - Publish directory: `christmas-erp` (lo toma del netlify.toml)

  Click "Deploy site".

- [ ] **Step 3: Configurar variables de entorno en Netlify (opcional)**

  Si se quieren ocultar las credenciales de Supabase del código fuente:

  Site settings → Environment variables → Add variable:
  - `SUPABASE_URL` = https://TU_PROYECTO.supabase.co
  - `SUPABASE_ANON_KEY` = TU_ANON_KEY

  Nota: en un proyecto vanilla JS sin build step, las variables de entorno de Netlify no se inyectan automáticamente en el JS del browser. Para esta versión, las credenciales van directas en `supabase-client.js` (la anon key es pública por diseño — Supabase usa RLS para la seguridad, no la key).

- [ ] **Step 4: Agregar dominio de Supabase a CORS**

  En el dashboard de Supabase → Authentication → URL Configuration:
  - Site URL: `https://TU_SITIO.netlify.app`
  - Redirect URLs: `https://TU_SITIO.netlify.app`

- [ ] **Step 5: Verificar la URL de producción**

  Abrir la URL de Netlify (ej: `https://navidad-erp.netlify.app`).

  Verificar que el login funciona y que los datos del Step 8 se ven correctamente.

- [ ] **Step 6: Prueba con todos los usuarios**

  Que cada uno de los 5 usuarios haga login desde su dispositivo y verifique que puede:
  - Ver los datos existentes
  - Crear un registro de prueba
  - Ver el registro de los demás

---

## Checklist de spec coverage

| Requisito del diseño | Task que lo implementa |
|---|---|
| Frontend vanilla JS en Netlify | Task 7 + Task 9 |
| Supabase como backend | Task 1 |
| Auth email + password | Task 3 + Task 4 |
| 5 usuarios creados manualmente | Task 1, Step 4 |
| RLS: acceso total a autenticados | Task 1, Step 2 |
| Sin roles diferenciados | RLS con `auth.role() = 'authenticated'` — Task 1 |
| store.js → Supabase (misma interfaz) | Task 5 |
| Boot async con loading screen | Task 4 + Task 6 |
| Arrancar desde cero (sin migrar datos) | `init()` usa defaults cuando las tablas están vacías |
| Botón logout | Task 4, Step 4 |
