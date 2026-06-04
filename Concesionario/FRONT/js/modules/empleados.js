// frontend/js/modules/empleados.js

const empleadosModule = {
    currentPage: 1,
    itemsPerPage: 10,
    empleadosData: [],
    
    init(container) {
        this.container = container;
        this.render();
        this.loadEmpleados();
    },
    
    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4><i class="fas fa-user-tie"></i> Gestión de Empleados</h4>
                    <button class="btn btn-light" onclick="empleadosModule.showForm()">
                        <i class="fas fa-plus"></i> Nuevo Empleado
                    </button>
                </div>
                <div class="card-body">
                    <!-- Filtros -->
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <input type="text" id="searchEmpleado" class="form-control" 
                                   placeholder="Buscar empleado...">
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-secondary" onclick="empleadosModule.search()">
                                <i class="fas fa-search"></i> Buscar
                            </button>
                        </div>
                        <div class="col-md-6 text-end">
                            <button class="btn btn-success" onclick="empleadosModule.exportExcel()">
                                <i class="fas fa-file-excel"></i> Exportar
                            </button>
                        </div>
                    </div>
                    
                    <!-- Tabla de empleados -->
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Cédula</th>
                                    <th>Nombre</th>
                                    <th>Cargo</th>
                                    <th>Correo</th>
                                    <th>Fecha Ingreso</th>
                                    <th>Estado</th>
                                    <th>Usuario</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="empleadosTableBody">
                                <tr><td colspan="9" class="text-center">Cargando...</td><ee
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Paginación -->
                    <div id="pagination" class="mt-3"></div>
                </div>
            </div>
            
            <!-- Modal de empleado -->
            <div class="modal fade" id="empleadoModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-user-plus"></i> Registrar Empleado
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="empleadoForm">
                                <input type="hidden" id="empleadoId">
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Cédula *</label>
                                        <input type="number" class="form-control" id="empCedula" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Cargo *</label>
                                        <select class="form-control" id="empCargo" required>
                                            <option value="">Seleccione...</option>
                                            <option value="Gerente">Gerente</option>
                                            <option value="Vendedor">Vendedor</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Auxiliar">Auxiliar</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Nombre *</label>
                                        <input type="text" class="form-control" id="empNombre" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Apellido *</label>
                                        <input type="text" class="form-control" id="empApellido" required>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Correo *</label>
                                        <input type="email" class="form-control" id="empCorreo" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Fecha Ingreso *</label>
                                        <input type="date" class="form-control" id="empFechaIngreso" required>
                                    </div>
                                </div>
                                
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="empActivo" checked>
                                    <label class="form-check-label">Empleado Activo</label>
                                </div>
                                
                                <hr>
                                <h5><i class="fas fa-user-lock"></i> Credenciales de Usuario</h5>
                                <div class="alert alert-info">
                                    <small>Si no crea usuario ahora, puede crearlo después desde el módulo de usuarios.</small>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Username</label>
                                        <input type="text" class="form-control" id="username" 
                                               placeholder="usuario.sistema">
                                        <small class="text-muted">Dejar vacío para no crear usuario</small>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Contraseña</label>
                                        <input type="password" class="form-control" id="password">
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        <label class="form-label">Rol del Sistema</label>
                                        <select class="form-control" id="rolUsuario">
                                            <option value="">Sin usuario</option>
                                            <option value="SUPERADMIN">SUPERADMIN</option>
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="VENDEDOR">VENDEDOR</option>
                                            <option value="CONSULTA">CONSULTA</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" onclick="empleadosModule.saveEmpleado()">
                                <i class="fas fa-save"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal de cambio de contraseña -->
            <div class="modal fade" id="passwordModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title">
                                <i class="fas fa-key"></i> Cambiar Contraseña
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="passwordForm">
                                <input type="hidden" id="passwordUserId">
                                <div class="mb-3">
                                    <label>Nueva Contraseña</label>
                                    <input type="password" class="form-control" id="newPassword" required>
                                </div>
                                <div class="mb-3">
                                    <label>Confirmar Contraseña</label>
                                    <input type="password" class="form-control" id="confirmPassword" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-warning" onclick="empleadosModule.changePassword()">
                                Cambiar Contraseña
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async loadEmpleados() {
        try {
            const response = await API.getEmpleados();
            this.empleadosData = response;
            this.renderTable();
        } catch (error) {
            console.error('Error:', error);
            this.showError('Error al cargar empleados');
        }
    },
    
    renderTable() {
        const tbody = document.getElementById('empleadosTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.empleadosData.map(emp => `
            <tr>
                <td>${emp.id_empleado}</td>
                <td>${emp.cedula}</td>
                <td>${emp.nombre} ${emp.apellido}</td>
                <td>${emp.cargo}</td>
                <td>${emp.correo}</td>
                <td>${emp.fecha_ingreso}</td>
                <td>
                    ${emp.activo ? 
                        '<span class="badge bg-success">Activo</span>' : 
                        '<span class="badge bg-danger">Inactivo</span>'}
                 </td>
                <td>
                    ${emp.tiene_usuario ? 
                        '<span class="badge bg-info">Sí</span>' : 
                        '<span class="badge bg-secondary">No</span>'}
                 </td>
                <td class="table-actions">
                    <i class="fas fa-edit text-primary" onclick="empleadosModule.editEmpleado(${emp.id_empleado})"></i>
                    <i class="fas fa-key text-warning" onclick="empleadosModule.showPasswordModal(${emp.id_empleado})"></i>
                    <i class="fas fa-trash text-danger" onclick="empleadosModule.deleteEmpleado(${emp.id_empleado})"></i>
                    ${!emp.tiene_usuario ? 
                        `<i class="fas fa-user-plus text-success" onclick="empleadosModule.createUser(${emp.id_empleado})"></i>` : 
                        ''}
                </td>
             </tr>
        `).join('');
    },
    
    async saveEmpleado() {
        const data = {
            id_empleado: document.getElementById('empleadoId').value || null,
            cedula: document.getElementById('empCedula').value,
            nombre: document.getElementById('empNombre').value,
            apellido: document.getElementById('empApellido').value,
            cargo: document.getElementById('empCargo').value,
            correo: document.getElementById('empCorreo').value,
            fecha_ingreso: document.getElementById('empFechaIngreso').value,
            activo: document.getElementById('empActivo').checked ? 1 : 0,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            rol: document.getElementById('rolUsuario').value
        };
        
        const response = await API.saveEmpleado(data);
        
        if (response.success) {
            this.showToast('Empleado guardado correctamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('empleadoModal')).hide();
            this.loadEmpleados();
        } else {
            this.showToast(response.message, 'error');
        }
    },
    
    showForm(id = null) {
        const modal = new bootstrap.Modal(document.getElementById('empleadoModal'));
        document.getElementById('empleadoForm').reset();
        document.getElementById('empleadoId').value = '';
        
        if (id) {
            this.loadEmpleadoData(id);
        }
        
        modal.show();
    },
    
    async loadEmpleadoData(id) {
        const empleado = this.empleadosData.find(e => e.id_empleado == id);
        if (empleado) {
            document.getElementById('empleadoId').value = empleado.id_empleado;
            document.getElementById('empCedula').value = empleado.cedula;
            document.getElementById('empNombre').value = empleado.nombre;
            document.getElementById('empApellido').value = empleado.apellido;
            document.getElementById('empCargo').value = empleado.cargo;
            document.getElementById('empCorreo').value = empleado.correo;
            document.getElementById('empFechaIngreso').value = empleado.fecha_ingreso;
            document.getElementById('empActivo').checked = empleado.activo == 1;
        }
    },
    
    showToast(message, type) {
        Swal.fire({
            title: type === 'success' ? 'Éxito' : 'Error',
            text: message,
            icon: type,
            timer: 3000,
            showConfirmButton: false
        });
    },
    
    showError(message) {
        const tbody = document.getElementById('empleadosTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-danger">${message}</td></tr>`;
        }
    }
};