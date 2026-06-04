// frontend/js/modules/usuarios.js

const usuariosModule = {
    init(container) {
        this.container = container;
        this.render();
        this.loadUsuarios();
    },
    
    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h4><i class="fas fa-user-shield"></i> Gestión de Usuarios del Sistema</h4>
                    <button class="btn btn-light" onclick="usuariosModule.showForm()">
                        <i class="fas fa-plus"></i> Nuevo Usuario
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Empleado</th>
                                    <th>Username</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Último Acceso</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="usuariosTableBody">
                                <tr><td colspan="7" class="text-center">Cargando...</td><ee
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Modal de usuario -->
            <div class="modal fade" id="usuarioModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-dark text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-user-plus"></i> Registrar Usuario
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="usuarioForm">
                                <input type="hidden" id="usuarioId">
                                
                                <div class="mb-3">
                                    <label>Empleado *</label>
                                    <select class="form-control" id="userIdEmpleado" required>
                                        <option value="">Seleccione un empleado...</option>
                                    </select>
                                    <small class="text-muted">Solo empleados sin usuario asignado</small>
                                </div>
                                
                                <div class="mb-3">
                                    <label>Username *</label>
                                    <input type="text" class="form-control" id="userUsername" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label>Contraseña *</label>
                                    <input type="password" class="form-control" id="userPassword" required>
                                    <small class="text-muted">Mínimo 6 caracteres</small>
                                </div>
                                
                                <div class="mb-3">
                                    <label>Confirmar Contraseña *</label>
                                    <input type="password" class="form-control" id="userConfirmPassword" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label>Rol *</label>
                                    <select class="form-control" id="userRol" required>
                                        <option value="CONSULTA">CONSULTA - Solo lectura</option>
                                        <option value="VENDEDOR">VENDEDOR - Ventas y clientes</option>
                                        <option value="ADMIN">ADMIN - Todo excepto usuarios</option>
                                        <option value="SUPERADMIN">SUPERADMIN - Acceso total</option>
                                    </select>
                                </div>
                                
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="userActivo" checked>
                                    <label class="form-check-label">Usuario Activo</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-dark" onclick="usuariosModule.saveUsuario()">
                                <i class="fas fa-save"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.loadEmpleadosSinUsuario();
    },
    
    async loadUsuarios() {
        try {
            const response = await API.getUsuarios();
            this.renderTable(response);
        } catch (error) {
            console.error('Error:', error);
        }
    },
    
    renderTable(usuarios) {
        const tbody = document.getElementById('usuariosTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = usuarios.map(user => `
            <tr>
                <td>${user.id_usuario}</td>
                <td>${user.empleado_nombre}</td>
                <td>${user.username}</td>
                <td>
                    <span class="badge ${this.getRolBadgeClass(user.rol)}">${user.rol}</span>
                </td>
                <td>
                    ${user.activo ? 
                        '<span class="badge bg-success">Activo</span>' : 
                        '<span class="badge bg-danger">Inactivo</span>'}
                </td>
                <td>${user.ultimo_acceso || 'Nunca'}</td>
                <td class="table-actions">
                    <i class="fas fa-edit text-primary" onclick="usuariosModule.editUsuario(${user.id_usuario})"></i>
                    <i class="fas fa-key text-warning" onclick="usuariosModule.resetPassword(${user.id_usuario})"></i>
                    <i class="fas fa-trash text-danger" onclick="usuariosModule.deleteUsuario(${user.id_usuario})"></i>
                </td>
             </tr>
        `).join('');
    },
    
    getRolBadgeClass(rol) {
        switch(rol) {
            case 'SUPERADMIN': return 'bg-danger';
            case 'ADMIN': return 'bg-warning';
            case 'VENDEDOR': return 'bg-info';
            default: return 'bg-secondary';
        }
    },
    
    async loadEmpleadosSinUsuario() {
        const empleados = await API.getEmpleadosSinUsuario();
        const select = document.getElementById('userIdEmpleado');
        
        select.innerHTML = '<option value="">Seleccione un empleado...</option>' +
            empleados.map(emp => `<option value="${emp.id_empleado}">
                ${emp.nombre} ${emp.apellido} - ${emp.cargo}
            </option>`).join('');
    },
    
    async saveUsuario() {
        const password = document.getElementById('userPassword').value;
        const confirmPassword = document.getElementById('userConfirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        const data = {
            id_usuario: document.getElementById('usuarioId').value || null,
            id_empleado: document.getElementById('userIdEmpleado').value,
            username: document.getElementById('userUsername').value,
            password: password,
            rol: document.getElementById('userRol').value,
            activo: document.getElementById('userActivo').checked ? 1 : 0
        };
        
        const response = await API.saveUsuario(data);
        
        if (response.success) {
            this.showToast('Usuario creado correctamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('usuarioModal')).hide();
            this.loadUsuarios();
        } else {
            this.showToast(response.message, 'error');
        }
    },
    
    showToast(message, type) {
        Swal.fire({
            title: type === 'success' ? 'Éxito' : 'Error',
            text: message,
            icon: type,
            timer: 3000
        });
    }
};