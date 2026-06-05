// FRONT/js/modules/usuarios.js

const usuariosModule = {
    usuariosData: [],

    init(container) {
        this.container = container;
        this.render();
        this.loadUsuarios();
    },

    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h4><i class="fas fa-user-shield"></i> Gestión de Usuarios</h4>
                    <button class="btn btn-light" onclick="usuariosModule.showForm()">
                        <i class="fas fa-plus"></i> Nuevo Usuario
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th><th>Empleado</th><th>Username</th>
                                    <th>Rol</th><th>Estado</th><th>Último Acceso</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="usuariosTableBody">
                                <tr><td colspan="7" class="text-center">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando...
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="usuariosInfo" class="text-muted mt-2 small"></div>
                </div>
            </div>

            <!-- Modal usuario -->
            <div class="modal fade" id="usuarioModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-dark text-white">
                            <h5 class="modal-title" id="usuarioModalTitle">
                                <i class="fas fa-user-plus"></i> Nuevo Usuario
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="usuarioForm">
                                <input type="hidden" id="usuarioId">
                                <div class="mb-3">
                                    <label class="form-label">Empleado *</label>
                                    <select class="form-control" id="userIdEmpleado" required>
                                        <option value="">Seleccione un empleado...</option>
                                    </select>
                                    <small class="text-muted">Solo empleados sin usuario asignado</small>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Username *</label>
                                    <input type="text" class="form-control" id="userUsername" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Contraseña *</label>
                                    <input type="password" class="form-control" id="userPassword" required>
                                    <small class="text-muted">Mínimo 6 caracteres</small>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Confirmar Contraseña *</label>
                                    <input type="password" class="form-control" id="userConfirmPassword" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Rol *</label>
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
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-dark" onclick="usuariosModule.saveUsuario()">
                                <i class="fas fa-save"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal cambiar contraseña -->
            <div class="modal fade" id="passModal" tabindex="-1">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title"><i class="fas fa-key"></i> Cambiar Contraseña</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="passUserId">
                            <div class="mb-3">
                                <label class="form-label">Nueva Contraseña</label>
                                <input type="password" class="form-control" id="newPass">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-warning btn-sm" onclick="usuariosModule.changePassword()">
                                Cambiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async loadUsuarios() {
        try {
            const response = await API.getUsuarios();
            // ✅ Lee response.data correctamente
            if (response.success) {
                this.usuariosData = response.data;
                this.renderTable(this.usuariosData);
                document.getElementById('usuariosInfo').textContent =
                    `Total: ${this.usuariosData.length} usuarios`;
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            this.showError('Error al cargar usuarios');
        }
    },

    renderTable(data) {
        const tbody = document.getElementById('usuariosTableBody');
        if (!tbody) return;
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">
                No hay usuarios registrados</td></tr>`;
            return;
        }
        tbody.innerHTML = data.map(u => `
            <tr>
                <td>${u.id_usuario}</td>
                <td>${u.empleado_nombre} <small class="text-muted">(${u.cargo})</small></td>
                <td><strong>${u.username}</strong></td>
                <td><span class="badge ${this.rolBadge(u.rol)}">${u.rol}</span></td>
                <td>${u.activo == 1
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-danger">Inactivo</span>'}</td>
                <td><small>${u.ultimo_acceso ? u.ultimo_acceso : 'Nunca'}</small></td>
                <td>
                    <i class="fas fa-key text-warning me-1" style="cursor:pointer"
                       onclick="usuariosModule.resetPassword(${u.id_usuario})" title="Cambiar contraseña"></i>
                    <i class="fas fa-trash text-danger" style="cursor:pointer"
                       onclick="usuariosModule.deleteUsuario(${u.id_usuario})" title="Eliminar"></i>
                </td>
            </tr>
        `).join('');
    },

    rolBadge(rol) {
        return { SUPERADMIN: 'bg-danger', ADMIN: 'bg-warning text-dark',
                 VENDEDOR: 'bg-info text-dark', CONSULTA: 'bg-secondary' }[rol] || 'bg-secondary';
    },

    async showForm() {
        document.getElementById('usuarioForm').reset();
        document.getElementById('usuarioId').value = '';
        document.getElementById('usuarioModalTitle').innerHTML =
            '<i class="fas fa-user-plus"></i> Nuevo Usuario';

        // Cargar empleados sin usuario
        try {
            const res = await API.getEmpleadosSinUsuario();
            const select = document.getElementById('userIdEmpleado');
            // ✅ Lee res.data
            const lista = res.success ? res.data : [];
            select.innerHTML = '<option value="">Seleccione un empleado...</option>' +
                lista.map(e => `<option value="${e.id_empleado}">${e.nombre} ${e.apellido} - ${e.cargo}</option>`).join('');
        } catch (e) {}

        new bootstrap.Modal(document.getElementById('usuarioModal')).show();
    },

    async saveUsuario() {
        const pass    = document.getElementById('userPassword').value;
        const confirm = document.getElementById('userConfirmPassword').value;

        if (pass !== confirm) { this.showToast('Las contraseñas no coinciden', 'error'); return; }
        if (pass.length < 6)  { this.showToast('Mínimo 6 caracteres', 'error'); return; }

        const data = {
            id_usuario:  document.getElementById('usuarioId').value || null,
            id_empleado: document.getElementById('userIdEmpleado').value,
            username:    document.getElementById('userUsername').value,
            password:    pass,
            rol:         document.getElementById('userRol').value,
            activo:      document.getElementById('userActivo').checked ? 1 : 0
        };

        const response = await API.saveUsuario(data);
        if (response.success) {
            this.showToast(response.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('usuarioModal')).hide();
            this.loadUsuarios();
        } else {
            this.showToast(response.message, 'error');
        }
    },

    resetPassword(id) {
        document.getElementById('passUserId').value = id;
        document.getElementById('newPass').value = '';
        new bootstrap.Modal(document.getElementById('passModal')).show();
    },

    async changePassword() {
        const id   = document.getElementById('passUserId').value;
        const pass = document.getElementById('newPass').value;
        const res  = await API.changePassword({ id_usuario: id, password: pass });
        if (res.success) {
            this.showToast(res.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('passModal')).hide();
        } else {
            this.showToast(res.message, 'error');
        }
    },

    async deleteUsuario(id) {
        if (!confirm('¿Eliminar este usuario?')) return;
        const res = await API.deleteUsuario(id);
        if (res.success) {
            this.showToast(res.message, 'success');
            this.loadUsuarios();
        } else {
            this.showToast(res.message, 'error');
        }
    },

    showToast(message, type) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({ title: type === 'success' ? 'Éxito' : 'Error',
                text: message, icon: type, timer: 3000, showConfirmButton: false,
                toast: true, position: 'top-end' });
        } else { alert(message); }
    },

    showError(message) {
        const tbody = document.getElementById('usuariosTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">
            <i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
    }
};