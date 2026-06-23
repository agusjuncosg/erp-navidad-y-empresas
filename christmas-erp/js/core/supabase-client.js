// Cliente Supabase — única fuente del cliente en toda la app.
// SUPABASE_URL y SUPABASE_ANON_KEY se obtienen del dashboard de Supabase → Settings → API.
// Reemplazar los valores de placeholder con los reales antes de hacer deploy.

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});
