// FRONT/js/modules/clientes.js

const clientesModule = {
    clientesData: [],

    init(container) {
        this.container = container;
        this.render();
        this.loadClientes();  // Carga datos reales de la BD
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
                            <form id="clienteForm">
                                <input type="hidden" id="clienteId">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Cédula *</label>
                                        <input type="number" class="form-control" id="cedula"
                                               required min="10000000" max="1299999999">
                                        <small class="text-muted">Formato: 10-13 dígitos</small>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Teléfono *</label>
                                        <input type="tel" class="form-control" id="telefono" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Nombre *</label>
                                        <input type="text" class="form-control" id="nombre" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Apellido *</label>
                                        <input type="text" class="form-control" id="apellido" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Correo *</label>
                                        <input type="email" class="form-control" id="correo" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Fecha de Nacimiento *</label>
                                        <input type="date" class="form-control" id="fechaNacimiento" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Ciudad *</label>
                                    <select class="form-control" id="idCiudad" required>
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

    // Carga clientes REALES desde la BD
    async loadClientes(search = '') {
        try {
            const response = await API.getClientes(search);
            if (response.success) {
                this.clientesData = response.data;
                this.renderTable();
                document.getElementById('pageInfo').textContent =
                    `Total: ${this.clientesData.length} clientes`;
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            this.showError('Error al cargar los clientes');
        }
    },

    renderTable() {
        const tbody = document.getElementById('clientesTableBody');
        if (!tbody) return;

        if (this.clientesData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">
                <i class="fas fa-inbox"></i> No hay clientes registrados</td></tr>`;
            return;
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
            </tr>
        `).join('');
    },

    search() {
        const term = document.getElementById('searchCliente').value.trim();
        this.loadClientes(term);
    },

    showForm(clienteId = null) {
        const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
        document.getElementById('clienteForm').reset();
        document.getElementById('clienteId').value = '';
        document.getElementById('activo').checked = true;

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
        const form = document.getElementById('clienteForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const id = document.getElementById('clienteId').value;
        const clienteData = {
            id_cliente:       id || null,
            cedula:           parseInt(document.getElementById('cedula').value),
            nombre:           document.getElementById('nombre').value,
            apellido:         document.getElementById('apellido').value,
            correo:           document.getElementById('correo').value,
            telefono:         document.getElementById('telefono').value,
            fecha_nacimiento: document.getElementById('fechaNacimiento').value,
            id_ciudad:        parseInt(document.getElementById('idCiudad').value),
            activo:           document.getElementById('activo').checked ? 1 : 0
        };

        try {
            // Si tiene ID → actualizar, si no → crear nuevo
            const response = id
                ? await API.updateCliente(clienteData)
                : await API.saveCliente(clienteData);

            if (response.success) {
                this.showToast(response.message, 'success');
                bootstrap.Modal.getInstance(document.getElementById('clienteModal')).hide();
                this.loadClientes();
            } else {
                this.showToast(response.message, 'error');
            }
        } catch (error) {
            this.showToast('Error al guardar el cliente', 'error');
        }
    },

    editCliente(id) { this.showForm(id); },

    deleteCliente(id) {
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
        document.getElementById('confirmDeleteBtn').onclick = async () => {
            const response = await API.deleteCliente(id);
            if (response.success) {
                this.showToast('Cliente eliminado correctamente', 'success');
                modal.hide();
                this.loadClientes();
            } else {
                this.showToast(response.message, 'error');
            }
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
                position: 'top-end', showConfirmButton: false, timer: 3000 });
        } else { alert(message); }
    },

    showError(message) {
        const tbody = document.getElementById('clientesTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">
            <i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
    }
};