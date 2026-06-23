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
