// FRONT/js/modules/clientes.js

const clientesModule = {
    clientesData: [],

    init(container) {
        this.container = container;
        this.render();
        this.loadClientes();
    },

    // ══════════════════════════════════════════
    // VALIDACIONES
    // ══════════════════════════════════════════
    validarTel(t)    { return /^3\d{9}$/.test(t.replace(/[\s\-]/g,'')); },
    validarCorreo(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c); },
    validarCC(cc)    { return cc >= 10000000 && cc <= 1299999999; },
    soloLetras(t)    { return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(t.trim()); },
    validarEdad(f) {
        const hoy = new Date(), nac = new Date(f);
        if (nac >= hoy) return -1; // fecha futura
        let edad = hoy.getFullYear() - nac.getFullYear();
        if (hoy.getMonth() < nac.getMonth() ||
           (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
        return edad;
    },

    validarFormulario() {
        const cedula   = parseInt(document.getElementById('cedula').value);
        const nombre   = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const correo   = document.getElementById('correo').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const fecha    = document.getElementById('fechaNacimiento').value;

        // Limpiar estados
        ['cedula','nombre','apellido','correo','telefono','fechaNacimiento']
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
            return err('cedula', 'La cédula es obligatoria.');
        if (!this.validarCC(cedula))
            return err('cedula', 'Cédula inválida. Debe estar entre 10.000.000 y 1.299.999.999.');
        ok('cedula');

        // Nombre
        if (!nombre)
            return err('nombre', 'El nombre es obligatorio.');
        if (nombre.length < 2)
            return err('nombre', 'El nombre debe tener al menos 2 caracteres.');
        if (!this.soloLetras(nombre))
            return err('nombre', 'El nombre solo puede contener letras. Sin números ni símbolos.');
        ok('nombre');

        // Apellido
        if (!apellido)
            return err('apellido', 'El apellido es obligatorio.');
        if (apellido.length < 2)
            return err('apellido', 'El apellido debe tener al menos 2 caracteres.');
        if (!this.soloLetras(apellido))
            return err('apellido', 'El apellido solo puede contener letras. Sin números ni símbolos.');
        ok('apellido');

        // Correo
        if (!correo)
            return err('correo', 'El correo es obligatorio.');
        if (!this.validarCorreo(correo))
            return err('correo', 'Correo inválido. Ej: nombre@gmail.com');
        ok('correo');

        // Teléfono
        if (!telefono)
            return err('telefono', 'El teléfono es obligatorio.');
        if (!this.validarTel(telefono))
            return err('telefono', 'Teléfono inválido. Debe tener 10 dígitos y empezar por 3. Ej: 3001234567');
        ok('telefono');

        // Fecha nacimiento
        if (!fecha)
            return err('fechaNacimiento', 'La fecha de nacimiento es obligatoria.');
        const edad = this.validarEdad(fecha);
        if (edad === -1)
            return err('fechaNacimiento', 'La fecha de nacimiento no puede ser en el futuro.');
        if (edad < 18)
            return err('fechaNacimiento', `Debes tener al menos 18 años. Actualmente tienes ${edad} año${edad===1?'':'s'}.`);
        if (edad > 100)
            return err('fechaNacimiento', 'Verifica la fecha de nacimiento.');
        ok('fechaNacimiento');

        return true;
    },

    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h4><i class="fas fa-users"></i> Gestión de Clientes</h4>
                    <button class="btn btn-primary" onclick="clientesModule.showForm()">
                        <i class="fas fa-plus"></i> Nuevo Cliente
                    </button>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <input type="text" id="searchCliente" class="form-control"
                                   placeholder="Buscar por nombre, cédula o correo...">
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-secondary w-100" onclick="clientesModule.search()">
                                <i class="fas fa-search"></i> Buscar
                            </button>
                        </div>
                        <div class="col-md-6 text-end">
                            <button class="btn btn-success" onclick="clientesModule.exportExcel()">
                                <i class="fas fa-file-excel"></i> Exportar Excel
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th><th>Cédula</th><th>Nombre Completo</th>
                                    <th>Correo</th><th>Teléfono</th><th>Fecha Nac.</th>
                                    <th>Estado</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="clientesTableBody">
                                <tr><td colspan="8" class="text-center">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando...
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="pageInfo" class="text-muted mt-2"></div>
                </div>
            </div>

            <!-- Modal cliente -->
            <div class="modal fade" id="clienteModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="clienteModalTitle">
                                <i class="fas fa-user-plus"></i> Registrar Cliente
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="clienteForm" novalidate>
                                <input type="hidden" id="clienteId">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Cédula <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control" id="cedula"
                                               min="10000000" max="1299999999"
                                               placeholder="Ej: 1033689077">
                                        <small class="text-muted">Entre 10.000.000 y 1.299.999.999</small>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Teléfono <span class="text-danger">*</span></label>
                                        <input type="tel" class="form-control" id="telefono"
                                               maxlength="10" placeholder="Ej: 3001234567"
                                               oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,10)">
                                        <small class="text-muted">10 dígitos, empieza por 3</small>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Nombre <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="nombre"
                                               maxlength="80" placeholder="Solo letras">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Apellido <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="apellido"
                                               maxlength="80" placeholder="Solo letras">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Correo <span class="text-danger">*</span></label>
                                        <input type="email" class="form-control" id="correo"
                                               placeholder="ejemplo@correo.com">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Fecha de Nacimiento <span class="text-danger">*</span></label>
                                        <input type="date" class="form-control" id="fechaNacimiento">
                                        <small class="text-muted">Debe ser mayor de 18 años</small>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Ciudad <span class="text-danger">*</span></label>
                                    <select class="form-control" id="idCiudad">
                                        <option value="1">Bogotá</option>
                                    </select>
                                    <small class="text-muted">Solo Bogotá está disponible</small>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="activo" checked>
                                    <label class="form-check-label">Cliente Activo</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" onclick="clientesModule.saveCliente()">
                                <i class="fas fa-save"></i> Guardar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal eliminar -->
            <div class="modal fade" id="deleteModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">Confirmar Eliminación</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>¿Está seguro que desea eliminar este cliente?</p>
                            <p class="text-danger"><small>Esta acción no se puede deshacer.</small></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('searchCliente').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.search();
        });
    },

    async loadClientes(search = '') {
        try {
            const response = await API.getClientes(search);
            if (response.success) {
                this.clientesData = response.data;
                this.renderTable();
                document.getElementById('pageInfo').textContent =
                    `Total: ${this.clientesData.length} clientes`;
            } else { this.showError(response.message); }
        } catch (error) { this.showError('Error al cargar los clientes'); }
    },

    renderTable() {
        const tbody = document.getElementById('clientesTableBody');
        if (!tbody) return;
        if (this.clientesData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">
                <i class="fas fa-inbox"></i> No hay clientes registrados</td></tr>`; return;
        }
        tbody.innerHTML = this.clientesData.map(c => `
            <tr>
                <td>${c.id_cliente}</td>
                <td>${c.cedula}</td>
                <td>${c.nombre} ${c.apellido}</td>
                <td>${c.correo}</td>
                <td>${c.telefono}</td>
                <td>${this.formatDate(c.fecha_nacimiento)}</td>
                <td>${c.activo == 1
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-danger">Inactivo</span>'}</td>
                <td>
                    <i class="fas fa-edit text-primary me-2" style="cursor:pointer"
                       onclick="clientesModule.editCliente(${c.id_cliente})" title="Editar"></i>
                    <i class="fas fa-trash text-danger" style="cursor:pointer"
                       onclick="clientesModule.deleteCliente(${c.id_cliente})" title="Eliminar"></i>
                </td>
            </tr>`).join('');
    },

    search() { this.loadClientes(document.getElementById('searchCliente').value.trim()); },

    showForm(clienteId = null) {
        const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
        document.getElementById('clienteForm').reset();
        document.getElementById('clienteId').value = '';
        document.getElementById('activo').checked = true;
        ['cedula','nombre','apellido','correo','telefono','fechaNacimiento']
            .forEach(id => document.getElementById(id).classList.remove('is-valid','is-invalid'));

        if (clienteId) {
            document.getElementById('clienteModalTitle').innerHTML =
                '<i class="fas fa-user-edit"></i> Editar Cliente';
            const c = this.clientesData.find(x => x.id_cliente == clienteId);
            if (c) {
                document.getElementById('clienteId').value       = c.id_cliente;
                document.getElementById('cedula').value          = c.cedula;
                document.getElementById('nombre').value          = c.nombre;
                document.getElementById('apellido').value        = c.apellido;
                document.getElementById('correo').value          = c.correo;
                document.getElementById('telefono').value        = c.telefono;
                document.getElementById('fechaNacimiento').value = c.fecha_nacimiento?.split('T')[0];
                document.getElementById('idCiudad').value        = c.id_ciudad;
                document.getElementById('activo').checked        = c.activo == 1;
            }
        } else {
            document.getElementById('clienteModalTitle').innerHTML =
                '<i class="fas fa-user-plus"></i> Nuevo Cliente';
        }
        modal.show();
    },

    async saveCliente() {
        if (!this.validarFormulario()) return;

        const id = document.getElementById('clienteId').value;
        const clienteData = {
            id_cliente:       id || null,
            cedula:           parseInt(document.getElementById('cedula').value),
            nombre:           document.getElementById('nombre').value.trim(),
            apellido:         document.getElementById('apellido').value.trim(),
            correo:           document.getElementById('correo').value.trim(),
            telefono:         document.getElementById('telefono').value.trim(),
            fecha_nacimiento: document.getElementById('fechaNacimiento').value,
            id_ciudad:        parseInt(document.getElementById('idCiudad').value),
            activo:           document.getElementById('activo').checked ? 1 : 0
        };

        try {
            const response = id
                ? await API.updateCliente(clienteData)
                : await API.saveCliente(clienteData);

            if (response.success) {
                this.showToast(response.message, 'success');
                bootstrap.Modal.getInstance(document.getElementById('clienteModal')).hide();
                this.loadClientes();
            } else { this.showToast(response.message, 'error'); }
        } catch (error) { this.showToast('Error al guardar el cliente', 'error'); }
    },

    editCliente(id) { this.showForm(id); },

    deleteCliente(id) {
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
        document.getElementById('confirmDeleteBtn').onclick = async () => {
            const response = await API.deleteCliente(id);
            if (response.success) {
                this.showToast('Cliente eliminado correctamente', 'success');
                modal.hide(); this.loadClientes();
            } else { this.showToast(response.message, 'error'); }
        };
    },

    exportExcel() {
        const headers = ['Cédula','Nombre','Apellido','Correo','Teléfono','Fecha Nacimiento'];
        const data = this.clientesData.map(c =>
            [c.cedula, c.nombre, c.apellido, c.correo, c.telefono, c.fecha_nacimiento]);
        let csv = headers.join(',') + '\n';
        data.forEach(row => { csv += row.map(v => `"${v}"`).join(',') + '\n'; });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    },

    formatDate(d) {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('es-CO');
    },

    showToast(message, type = 'success') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({ title: type === 'success' ? 'Éxito' : 'Error',
                text: message, icon: type, toast: true,
                position: 'top-end', showConfirmButton: false, timer: 4000 });
        } else { alert(message); }
    },

    showError(message) {
        const tbody = document.getElementById('clientesTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">
            <i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
    }
};