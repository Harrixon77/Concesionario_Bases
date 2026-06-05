// js/config.js
const CONFIG = {
    // Cambiar según tu entorno
    API_URL: 'http://localhost/Concesionario/Concesionario/BACKEND/Api/',
    DB_HOST: 'localhost',
    DB_USER: 'root',
    DB_PASSWORD: '',
    DB_NAME: 'concesionario_motos_prueba'
};

// Roles del sistema
const ROLES = {
    SUPERADMIN: 'SUPERADMIN',
    ADMIN: 'ADMIN',
    VENDEDOR: 'VENDEDOR',
    CONSULTA: 'CONSULTA'
};

// Permisos por rol
const PERMISOS = {
    [ROLES.SUPERADMIN]: [
        'ventas', 'inventario', 'clientes', 'motos', 
        'marcas', 'categorias', 'empleados', 'usuarios', 
        'reportes', 'consultas', 'configuracion'
    ],
    [ROLES.ADMIN]: [
        'ventas', 'inventario', 'clientes', 'motos', 
        'reportes', 'consultas'
    ],
    [ROLES.VENDEDOR]: [
        'ventas', 'clientes', 'consultas'
    ],
    [ROLES.CONSULTA]: [
        'consultas'
    ]
};