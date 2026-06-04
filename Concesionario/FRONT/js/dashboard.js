// js/dashboard.js
// Este archivo controla la interfaz principal después del login

class Dashboard {
    constructor() {
        this.currentModule = null;
        this.init();
    }

    init() {
        console.log('Dashboard inicializado');
        this.setupSidebar();
        this.setupSidebarToggle();
        this.updateUserInfo();
        this.updateDateTime();
        this.loadModule('dashboard');
    }

    setupSidebar() {
        const user = authManager.currentUser;
        if (!user) {
            console.error('No hay usuario logueado');
            return;
        }
        
        console.log('Configurando sidebar para rol:', user.rol);
        
        // Mostrar/ocultar módulos según permisos
        const permissions = PERMISOS[user.rol] || [];
        
        document.querySelectorAll('[data-module]').forEach(item => {
            const module = item.getAttribute('data-module');
            if (permissions.includes(module)) {
                item.style.display = 'block';
                console.log(`Módulo ${module} visible para ${user.rol}`);
            } else {
                item.style.display = 'none';
                console.log(`Módulo ${module} oculto para ${user.rol}`);
            }
        });

        // Agregar event listeners a los enlaces del menú
        document.querySelectorAll('[data-module] a').forEach(link => {
            // Remover listeners anteriores para evitar duplicados
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            newLink.addEventListener('click', (e) => {
                e.preventDefault();
                const parentItem = newLink.closest('[data-module]');
                const module = parentItem.getAttribute('data-module');
                console.log('Cargando módulo:', module);
                this.loadModule(module);
                
                // Actualizar clase activa
                document.querySelectorAll('[data-module] .nav-link').forEach(nav => {
                    nav.classList.remove('active');
                });
                newLink.classList.add('active');
            });
        });
    }

    setupSidebarToggle() {
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarCollapse) {
            sidebarCollapse.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    }

    updateUserInfo() {
        const user = authManager.currentUser;
        if (user) {
            const userNameSpan = document.getElementById('userName');
            const userRoleSpan = document.getElementById('userRole');
            
            if (userNameSpan) {
                userNameSpan.textContent = user.nombre || user.username;
            }
            if (userRoleSpan) {
                userRoleSpan.textContent = `Rol: ${user.rol}`;
            }
        }
    }

    updateDateTime() {
        const update = () => {
            const now = new Date();
            const dateTimeStr = now.toLocaleString('es-CO', {
                dateStyle: 'full',
                timeStyle: 'medium'
            });
            const dateTimeElem = document.getElementById('currentDateTime');
            if (dateTimeElem) {
                dateTimeElem.textContent = dateTimeStr;
            }
        };
        update();
        setInterval(update, 1000);
    }

    loadModule(moduleName) {
        this.currentModule = moduleName;
        const contentDiv = document.getElementById('mainContent');
        
        if (!contentDiv) {
            console.error('No se encontró el contenedor mainContent');
            return;
        }
        
        // Verificar permisos antes de cargar
        const user = authManager.currentUser;
        const permissions = PERMISOS[user?.rol] || [];
        
        if (!permissions.includes(moduleName) && moduleName !== 'dashboard') {
            contentDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    No tiene permisos para acceder a este módulo.
                </div>
            `;
            return;
        }
        
        // Cargar el módulo correspondiente
        switch(moduleName) {
            case 'dashboard':
                this.loadDashboard(contentDiv);
                break;
            case 'ventas':
                if (typeof ventasModule !== 'undefined' && ventasModule.init) {
                    ventasModule.init(contentDiv);
                } else {
                    this.showModuleError(contentDiv, 'ventas');
                }
                break;
            case 'inventario':
                if (typeof inventarioModule !== 'undefined' && inventarioModule.init) {
                    inventarioModule.init(contentDiv);
                } else {
                    this.showModuleError(contentDiv, 'inventario');
                }
                break;
            case 'clientes':
                if (typeof clientesModule !== 'undefined' && clientesModule.init) {
                    clientesModule.init(contentDiv);
                } else {
                    this.showModuleError(contentDiv, 'clientes');
                }
                break;
            case 'motos':
                if (typeof motosModule !== 'undefined' && motosModule.init) {
                    motosModule.init(contentDiv);
                } else {
                    this.showModuleError(contentDiv, 'motos');
                }
                break;
            case 'empleados':
                if (typeof empleadosModule !== 'undefined' && empleadosModule.init) {
                    empleadosModule.init(contentDiv);
                } else {
                    this.showModuleError(contentDiv, 'empleados');
                }
                break;
            case 'usuarios':
                if (typeof usuariosModule !== 'undefined' && usuariosModule.init) {
                    usuariosModule.init(contentDiv);
                } else {
                    this.showModuleError(contentDiv, 'usuarios');
                }
                break;
            case 'reportes':
                if (typeof reportesModule !== 'undefined' && reportesModule.init) {
                    reportesModule.init(contentDiv);
                } else {
                    this.showModuleError(contentDiv, 'reportes');
                }
                break;
            case 'consultas':
                if (typeof consultasModule !== 'undefined' && consultasModule.init) {
                    consultasModule.init(contentDiv);
                } else {
                    this.showModuleError(contentDiv, 'consultas');
                }
                break;
            default:
                this.loadDashboard(contentDiv);
        }
    }
    
    showModuleError(container, moduleName) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-circle"></i>
                El módulo ${moduleName} está en desarrollo.
                <br><small>Por favor, asegúrese de que el archivo modules/${moduleName}.js esté cargado correctamente.</small>
            </div>
        `;
    }

    loadDashboard(container) {
        container.innerHTML = `
            <div class="row">
                <div class="col-md-3 mb-3">
                    <div class="card card-stats bg-primary text-white">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-8">
                                    <h6 class="card-title">Ventas Hoy</h6>
                                    <h2 id="ventasHoy">0</h2>
                                </div>
                                <div class="col-4 text-end">
                                    <i class="fas fa-chart-line fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card card-stats bg-success text-white">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-8">
                                    <h6 class="card-title">Clientes Registrados</h6>
                                    <h2 id="totalClientes">0</h2>
                                </div>
                                <div class="col-4 text-end">
                                    <i class="fas fa-users fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card card-stats bg-warning text-dark">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-8">
                                    <h6 class="card-title">Motos en Stock</h6>
                                    <h2 id="stockTotal">0</h2>
                                </div>
                                <div class="col-4 text-end">
                                    <i class="fas fa-motorcycle fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card card-stats bg-info text-white">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-8">
                                    <h6 class="card-title">Ventas del Mes</h6>
                                    <h2 id="ventasMes">$0</h2>
                                </div>
                                <div class="col-4 text-end">
                                    <i class="fas fa-dollar-sign fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-history"></i> Últimas Ventas</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-hover" id="ultimasVentasTable">
                                    <thead>
                                        <tr><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Total</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="4" class="text-center">
                                            <i class="fas fa-spinner fa-spin"></i> Cargando...
                                        </td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-exclamation-triangle"></i> Alertas de Stock</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-hover" id="stockBajoTable">
                                    <thead>
                                        <tr><th>Moto</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="4" class="text-center">
                                            <i class="fas fa-spinner fa-spin"></i> Cargando...
                                        </td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-trophy"></i> Ranking de Vendedores</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-hover" id="rankingVendedoresTable">
                                    <thead>
                                        <tr><th>Vendedor</th><th>Total Ventas</th><th>Monto Vendido</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="3" class="text-center">
                                            <i class="fas fa-spinner fa-spin"></i> Cargando...
                                        </td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            // Cargar datos usando las vistas de la BD
            // v_ventas_completas, v_stock_alertas, v_ranking_vendedores
            
            // Simular carga de datos (reemplazar con llamadas reales a la API)
            setTimeout(() => {
                // Ventas hoy
                const ventasHoyElem = document.getElementById('ventasHoy');
                if (ventasHoyElem) ventasHoyElem.textContent = '8';
                
                // Total clientes
                const totalClientesElem = document.getElementById('totalClientes');
                if (totalClientesElem) totalClientesElem.textContent = '4';
                
                // Stock total
                const stockTotalElem = document.getElementById('stockTotal');
                if (stockTotalElem) stockTotalElem.textContent = '77';
                
                // Ventas mes
                const ventasMesElem = document.getElementById('ventasMes');
                if (ventasMesElem) ventasMesElem.textContent = '$125,000,000';
                
                // Últimas ventas
                const ultimasVentasTbody = document.querySelector('#ultimasVentasTable tbody');
                if (ultimasVentasTbody) {
                    ultimasVentasTbody.innerHTML = `
                        <tr><td>2024-01-15</td><td>Juan Pérez</td><td>Carlos Ramírez</td><td>$7,900,000</td></tr>
                        <tr><td>2024-01-14</td><td>María López</td><td>Luisa Torres</td><td>$22,000,000</td></tr>
                        <tr><td>2024-01-13</td><td>Pedro Castillo</td><td>Andrés Gómez</td><td>$5,800,000</td></tr>
                    `;
                }
                
                // Stock bajo
                const stockBajoTbody = document.querySelector('#stockBajoTable tbody');
                if (stockBajoTbody) {
                    stockBajoTbody.innerHTML = `
                        <tr><td>Yamaha YZF-R3</td><td>4</td><td>1</td><td><span class="badge bg-warning">Stock bajo</span></td></tr>
                        <tr><td>Bajaj Dominar 400</td><td>3</td><td>1</td><td><span class="badge bg-warning">Stock bajo</span></td></tr>
                        <tr><td>Yamaha XTZ 250</td><td>5</td><td>1</td><td><span class="badge bg-warning">Stock bajo</span></td></tr>
                    `;
                }
                
                // Ranking vendedores
                const rankingTbody = document.querySelector('#rankingVendedoresTable tbody');
                if (rankingTbody) {
                    rankingTbody.innerHTML = `
                        <tr><td>Carlos Ramírez</td><td>15</td><td>$150,000,000</td></tr>
                        <tr><td>Luisa Torres</td><td>12</td><td>$120,000,000</td></tr>
                        <tr><td>Andrés Gómez</td><td>8</td><td>$80,000,000</td></tr>
                    `;
                }
            }, 500);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
}

// Inicializar el dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que authManager esté disponible
    if (typeof authManager !== 'undefined' && authManager.currentUser) {
        window.dashboard = new Dashboard();
    } else {
        console.error('AuthManager no disponible o usuario no logueado');
        // Redirigir a login si no hay usuario
        if (!sessionStorage.getItem('user')) {
            window.location.href = 'login.html';
        }
    }
});