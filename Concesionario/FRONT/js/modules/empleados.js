// FRONT/js/modules/empleados.js

const empleadosModule = {
    empleadosData: [],

    // ══════════════════════════════════════════
    // VALIDACIONES
    // ══════════════════════════════════════════
    validarTel(t)    { return /^3\d{9}$/.test(t.replace(/[\s\-]/g,'')); },
    validarCorreo(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c); },
    validarCC(cc)    { return cc >= 10000000 && cc <= 1299999999; },
    soloLetras(t)    { return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(t.trim()); },
    validarFechaIngreso(f) {
        const hoy    = new Date();
        const fecha  = new Date(f);
        const limite = new Date('1990-01-01');
        return fecha <= hoy && fecha >= limite;
    },

    validarFormulario() {
        const cedula   = parseInt(document.getElementById('empCedula').value);
        const nombre   = document.getElementById('empNombre').value.trim();
        const apellido = document.getElementById('empApellido').value.trim();
        const cargo    = document.getElementById('empCargo').value;
        const correo   = document.getElementById('empCorreo').value.trim();
        const fecha    = document.getElementById('empFechaIngreso').value;
        const username = document.getElementById('empUsername').value.trim();
        const password = document.getElementById('empPassword').value;
        const rol      = document.getElementById('empRol').value;

        ['empCedula','empNombre','empApellido','empCargo','empCorreo','empFechaIngreso']
            .forEach(id => document.getElementById(id)
                .classList.remove('is-valid','is-invalid'));

        const err = (id, msg) => {
            document.getElementById(id).classList.add('is-invalid');
            this.showToast(msg, 'error');
            return false;
        };
        const ok = id => document.getElementById(id).classList.add('is-valid');

        // Cédula
        if (!cedula || isNaN(cedula))
            return err('empCedula','La cédula es obligatoria.');
        if (!this.validarCC(cedula))
            return err('empCedula','Cédula inválida. Debe estar entre 10.000.000 y 1.299.999.999.');
        ok('empCedula');

        // Nombre
        if (!nombre)
            return err('empNombre','El nombre es obligatorio.');
        if (!this.soloLetras(nombre))
            return err('empNombre','El nombre solo puede contener letras. Sin números ni símbolos.');
        ok('empNombre');

        // Apellido
        if (!apellido)
            return err('empApellido','El apellido es obligatorio.');
        if (!this.soloLetras(apellido))
            return err('empApellido','El apellido solo puede contener letras. Sin números ni símbolos.');
        ok('empApellido');

        // Cargo
        if (!cargo)
            return err('empCargo','Selecciona un cargo.');
        ok('empCargo');

        // Correo
        if (!correo)
            return err('empCorreo','El correo es obligatorio.');
        if (!this.validarCorreo(correo))
            return err('empCorreo','Correo inválido. Ej: nombre@empresa.com');
        ok('empCorreo');

        // Fecha ingreso
        if (!fecha)
            return err('empFechaIngreso','La fecha de ingreso es obligatoria.');
        if (!this.validarFechaIngreso(fecha))
            return err('empFechaIngreso','La fecha de ingreso no puede ser futura ni anterior a 1990.');
        ok('empFechaIngreso');

        // Si pone username, debe poner también password y rol
        if (username && !password)
            { this.showToast('Si creas usuario debes ingresar una contraseña.','error'); return false; }
        if (username && password.length < 6)
            { this.showToast('La contraseña debe tener al menos 6 caracteres.','error'); return false; }
        if (username && !rol)
            { this.showToast('Si creas usuario debes seleccionar un rol.','error'); return false; }

        return true;
    },

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
                    </div>
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th><th>Cédula</th><th>Nombre</th><th>Cargo</th>
                                    <th>Correo</th><th>Fecha Ingreso</th><th>Estado</th>
                                    <th>Usuario</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="empleadosTableBody">
                                <tr><td colspan="9" class="text-center">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando...
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="empleadosInfo" class="text-muted mt-2 small"></div>
                </div>
            </div>

            <!-- Modal empleado -->
            <div class="modal fade" id="empleadoModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="empleadoModalTitle">
                                <i class="fas fa-user-plus"></i> Registrar Empleado
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="empleadoForm" novalidate>
                                <input type="hidden" id="empleadoId">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Cédula <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control" id="empCedula"
                                               min="10000000" max="1299999999" placeholder="Ej: 1033689077">
                                        <small class="text-muted">Entre 10.000.000 y 1.299.999.999</small>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Cargo <span class="text-danger">*</span></label>
                                        <select class="form-control" id="empCargo">
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
                                        <label class="form-label">Nombre <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="empNombre"
                                               maxlength="80" placeholder="Solo letras">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Apellido <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="empApellido"
                                               maxlength="80" placeholder="Solo letras">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Correo <span class="text-danger">*</span></label>
                                        <input type="email" class="form-control" id="empCorreo"
                                               placeholder="ejemplo@empresa.com">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Fecha Ingreso <span class="text-danger">*</span></label>
                                        <input type="date" class="form-control" id="empFechaIngreso">
                                        <small class="text-muted">No puede ser fecha futura</small>
                                    </div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="empActivo" checked>
                                    <label class="form-check-label">Empleado Activo</label>
                                </div>
                                <hr>
                                <h6><i class="fas fa-user-lock"></i> Credenciales del Sistema (opcional)</h6>
                                <div class="alert alert-info py-2">
                                    <small>Si completas el username, debes ingresar contraseña y rol.</small>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Username</label>
                                        <input type="text" class="form-control" id="empUsername"
                                               placeholder="ej: carlos.ramirez" maxlength="50">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Contraseña</label>
                                        <input type="password" class="form-control" id="empPassword">
                                        <small class="text-muted">Mínimo 6 caracteres</small>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Rol del Sistema</label>
                                    <select class="form-control" id="empRol">
                                        <option value="">Sin usuario</option>
                                        <option value="SUPERADMIN">SUPERADMIN</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="VENDEDOR">VENDEDOR</option>
                                        <option value="CONSULTA">CONSULTA</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="empleadosModule.saveEmpleado()">
                                <i class="fas fa-save"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal eliminar -->
            <div class="modal fade" id="deleteEmpModal" tabindex="-1">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">Confirmar Eliminación</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <p>¿Eliminar este empleado?</p>
                            <p class="fw-bold" id="deleteEmpNombre"></p>
                            <small class="text-danger">Esta acción no se puede deshacer.</small>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger btn-sm" id="confirmDeleteEmpBtn">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async loadEmpleados() {
        try {
            const response = await API.getEmpleados();
            if (response.success) {
                this.empleadosData = response.data;
                this.renderTable(this.empleadosData);
                document.getElementById('empleadosInfo').textContent =
                    `Total: ${this.empleadosData.length} empleados`;
            } else { this.showError(response.message); }
        } catch (error) { this.showError('Error al cargar empleados'); }
    },

    renderTable(data) {
        const tbody = document.getElementById('empleadosTableBody');
        if (!tbody) return;
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">
                No hay empleados registrados</td></tr>`; return;
        }
        tbody.innerHTML = data.map(e => `
            <tr>
                <td>${e.id_empleado}</td>
                <td>${e.cedula}</td>
                <td>${e.nombre} ${e.apellido}</td>
                <td>${e.cargo}</td>
                <td>${e.correo}</td>
                <td>${e.fecha_ingreso ? e.fecha_ingreso.split('T')[0] : ''}</td>
                <td>${e.activo==1
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-danger">Inactivo</span>'}</td>
                <td>${e.tiene_usuario==1
                    ? '<span class="badge bg-info">Sí</span>'
                    : '<span class="badge bg-secondary">No</span>'}</td>
                <td>
                    <i class="fas fa-edit text-primary me-1" style="cursor:pointer"
                       onclick="empleadosModule.editEmpleado(${e.id_empleado})" title="Editar"></i>
                    <i class="fas fa-trash text-danger" style="cursor:pointer"
                       onclick="empleadosModule.deleteEmpleado(${e.id_empleado},'${e.nombre} ${e.apellido}')"
                       title="Eliminar"></i>
                </td>
            </tr>`).join('');
    },

    search() {
        const term = document.getElementById('searchEmpleado').value.toLowerCase();
        this.renderTable(this.empleadosData.filter(e =>
            e.nombre.toLowerCase().includes(term) ||
            e.apellido.toLowerCase().includes(term) ||
            e.cedula.toString().includes(term) ||
            e.cargo.toLowerCase().includes(term)));
    },

    showForm(id = null) {
        document.getElementById('empleadoForm').reset();
        document.getElementById('empleadoId').value = '';
        ['empCedula','empNombre','empApellido','empCargo','empCorreo','empFechaIngreso']
            .forEach(id => document.getElementById(id).classList.remove('is-valid','is-invalid'));
        document.getElementById('empleadoModalTitle').innerHTML =
            '<i class="fas fa-user-plus"></i> Registrar Empleado';
        if (id) this.editEmpleado(id);
        new bootstrap.Modal(document.getElementById('empleadoModal')).show();
    },

    editEmpleado(id) {
        const e = this.empleadosData.find(x => x.id_empleado == id);
        if (!e) return;
        document.getElementById('empleadoModalTitle').innerHTML =
            '<i class="fas fa-user-edit"></i> Editar Empleado';
        document.getElementById('empleadoId').value      = e.id_empleado;
        document.getElementById('empCedula').value       = e.cedula;
        document.getElementById('empNombre').value       = e.nombre;
        document.getElementById('empApellido').value     = e.apellido;
        document.getElementById('empCargo').value        = e.cargo;
        document.getElementById('empCorreo').value       = e.correo;
        document.getElementById('empFechaIngreso').value = e.fecha_ingreso?.split('T')[0];
        document.getElementById('empActivo').checked     = e.activo == 1;
        new bootstrap.Modal(document.getElementById('empleadoModal')).show();
    },

    async saveEmpleado() {
        if (!this.validarFormulario()) return;

        const data = {
            id_empleado:   document.getElementById('empleadoId').value || null,
            cedula:        document.getElementById('empCedula').value,
            nombre:        document.getElementById('empNombre').value.trim(),
            apellido:      document.getElementById('empApellido').value.trim(),
            cargo:         document.getElementById('empCargo').value,
            correo:        document.getElementById('empCorreo').value.trim(),
            fecha_ingreso: document.getElementById('empFechaIngreso').value,
            activo:        document.getElementById('empActivo').checked ? 1 : 0,
            username:      document.getElementById('empUsername').value.trim(),
            password:      document.getElementById('empPassword').value,
            rol:           document.getElementById('empRol').value
        };

        const response = await API.saveEmpleado(data);
        if (response.success) {
            this.showToast(response.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('empleadoModal')).hide();
            this.loadEmpleados();
        } else { this.showToast(response.message, 'error'); }
    },

    deleteEmpleado(id, nombre) {
        document.getElementById('deleteEmpNombre').textContent = nombre;
        const modal = new bootstrap.Modal(document.getElementById('deleteEmpModal'));
        modal.show();
        document.getElementById('confirmDeleteEmpBtn').onclick = async () => {
            const res = await API.request('empleados.php?action=delete','POST',{id_empleado:id});
            if (res.success) {
                this.showToast(res.message,'success'); modal.hide(); this.loadEmpleados();
            } else { this.showToast(res.message,'error'); }
        };
    },

    showToast(message, type) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({ title: type==='success'?'Éxito':'Error',
                text: message, icon: type, timer: 4000,
                showConfirmButton: false, toast: true, position: 'top-end' });
        } else { alert(message); }
    },

    showError(message) {
        const tbody = document.getElementById('empleadosTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">
            <i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
    }
};