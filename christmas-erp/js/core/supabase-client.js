// Cliente Supabase — única fuente del cliente en toda la app.
// SUPABASE_URL y SUPABASE_ANON_KEY se obtienen del dashboard de Supabase → Settings → API.
// Reemplazar los valores de placeholder con los reales antes de hacer deploy.

const SUPABASE_URL = 'https://morhmbcqpvfsrnwoxmyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcmhtYmNxcHZmc3Jud294bXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzkwOTgsImV4cCI6MjA5NzgxNTA5OH0.G0RAGA0MTXPOtklMymOsvU1ERFvC0IrVioasr0PYMS8';

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});
