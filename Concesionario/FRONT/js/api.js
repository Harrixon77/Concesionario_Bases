// FRONT/js/api.js

const BASE = 'http://localhost/Concesionario/Concesionario/BACKEND/Api';

class API {
    static async request(endpoint, method = 'GET', data = null) {
        const url = `${BASE}/${endpoint}`;
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) options.body = JSON.stringify(data);

        try {
            const response = await fetch(url, options);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    // AUTH
    static async login(username, password) {
        return this.request('login.php', 'POST', { username, password });
    }

    // CLIENTES
    static async getClientes(search = '') {
        const endpoint = search
            ? `clientes.php?action=all&search=${search}`
            : 'clientes.php?action=all';
        return this.request(endpoint);
    }
    static async saveCliente(data)   { return this.request('clientes.php?action=save',   'POST',   data); }
    static async updateCliente(data) { return this.request('clientes.php?action=update', 'PUT',    data); }
    static async deleteCliente(id)   { return this.request('clientes.php?action=delete', 'DELETE', { id_cliente: id }); }

    // VENTAS
    static async registrarVenta(data)  { return this.request('ventas.php?action=registrar', 'POST', data); }
    static async getVentasRecientes()  { return this.request('ventas.php?action=recientes'); }

    // EMPLEADOS
    static async getEmpleados()        { return this.request('empleados.php?action=all'); }
    static async saveEmpleado(data)    { return this.request('empleados.php?action=save', 'POST', data); }

    // USUARIOS
    static async getUsuarios()              { return this.request('usuarios.php?action=all'); }
    static async getEmpleadosSinUsuario()   { return this.request('usuarios.php?action=empleados_sin_usuario'); }
    static async saveUsuario(data)          { return this.request('usuarios.php?action=save',            'POST',   data); }
    static async changePassword(data)       { return this.request('usuarios.php?action=change_password', 'POST',   data); }
    static async deleteUsuario(id)          { return this.request('usuarios.php?action=delete',          'DELETE', { id_usuario: id }); }
}