// js/auth.js
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Verificar si ya hay sesión activa
        const userData = sessionStorage.getItem('user');
        if (userData && window.location.pathname.includes('login.html')) {
            window.location.href = 'dashboard.html';
        } else if (!userData && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        } else if (userData) {
            this.currentUser = JSON.parse(userData);
            this.setupLogout();
        }

        // Setup login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const alertDiv = document.getElementById('alertMessage');

        try {
            const response = await API.login(username, password);
            
            if (response.success) {
                this.currentUser = {
                    id: response.id_empleado,
                    username: username,
                    rol: response.rol,
                    nombre: response.nombre
                };
                sessionStorage.setItem('user', JSON.stringify(this.currentUser));
                window.location.href = 'dashboard.html';
            } else {
                alertDiv.style.display = 'block';
                alertDiv.textContent = response.message || 'Credenciales incorrectas';
            }
        } catch (error) {
            alertDiv.style.display = 'block';
            alertDiv.textContent = 'Error de conexión con el servidor';
        }
    }

    logout() {
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    hasPermission(module) {
        if (!this.currentUser) return false;
        const permissions = PERMISOS[this.currentUser.rol] || [];
        return permissions.includes(module);
    }

    getUserRole() {
        return this.currentUser ? this.currentUser.rol : null;
    }
}

const authManager = new AuthManager();