// FRONT/js/modules/motos.js

const motosModule = {
    motosData: [],
    editingId: null,

    init(container) {
        this.container = container;
        this.render();
        this.loadMotos();
    },

    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h4><i class="fas fa-motorcycle"></i> Catálogo de Motos</h4>
                    <button class="btn btn-success btn-sm" onclick="motosModule.openModal()">
                        <i class="fas fa-plus"></i> Nueva Moto
                    </button>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <input type="text" id="buscadorMotos" class="form-control"
                                placeholder="Buscar por marca, modelo o categoría..."
                                oninput="motosModule.filtrar()">
                        </div>
                        <div class="col-md-3">
                            <select id="filtroCategoria" class="form-select" onchange="motosModule.filtrar()">
                                <option value="">Todas las categorías</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover align-middle">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th><th>Marca</th><th>Modelo</th><th>Año</th>
                                    <th>Categoría</th><th>Cilindrada</th><th>Precio Base</th>
                                    <th>Color</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="motosTableBody">
                                <tr><td colspan="9" class="text-center">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando...
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="motosInfo" class="text-muted mt-2 small"></div>
                </div>
            </div>

            <!-- Modal Moto -->
            <div class="modal fade" id="motoModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-dark text-white">
                            <h5 class="modal-title" id="motoModalTitle">
                                <i class="fas fa-motorcycle"></i> Nueva Moto
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Marca *</label>
                                    <input type="text" id="motoMarca" class="form-control" placeholder="Ej: Honda, Yamaha...">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Modelo *</label>
                                    <input type="text" id="motoModelo" class="form-control" placeholder="Ej: CB500, MT-07...">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Año *</label>
                                    <input type="number" id="motoAnio" class="form-control" min="1990" max="2030" placeholder="2024">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Categoría *</label>
                                    <select id="motoCategoria" class="form-select">
                                        <option value="">Seleccionar...</option>
                                        <option value="Sport">Sport</option>
                                        <option value="Naked">Naked</option>
                                        <option value="Adventure">Adventure</option>
                                        <option value="Touring">Touring</option>
                                        <option value="Scooter">Scooter</option>
                                        <option value="Enduro">Enduro</option>
                                        <option value="Custom">Custom</option>
                                        <option value="Eléctrica">Eléctrica</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Cilindrada (cc) *</label>
                                    <input type="number" id="motoCilindrada" class="form-control" min="50" placeholder="500">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Precio Base (COP) *</label>
                                    <div class="input-group">
                                        <span class="input-group-text">$</span>
                                        <input type="number" id="motoPrecio" class="form-control" min="0" step="100000" placeholder="15000000">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Color *</label>
                                    <input type="text" id="motoColor" class="form-control" placeholder="Ej: Rojo, Negro mate...">
                                </div>
                                <div class="col-12">
                                    <label class="form-label fw-bold">Descripción</label>
                                    <textarea id="motoDescripcion" class="form-control" rows="2"
                                        placeholder="Características adicionales..."></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" onclick="motosModule.guardar()">
                                <i class="fas fa-save"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Confirmar Eliminación -->
            <div class="modal fade" id="deleteMotoModal" tabindex="-1">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title"><i class="fas fa-trash"></i> Eliminar Moto</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <p>¿Seguro que desea eliminar esta moto?</p>
                            <p class="fw-bold" id="deleteMotoNombre"></p>
                            <small class="text-muted">Esta acción no se puede deshacer.</small>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger btn-sm" onclick="motosModule.confirmarEliminar()">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async loadMotos() {
        try {
            const response = await API.request('motos.php?action=all');
            if (response.success) {
                this.motosData = response.data;
                this.renderTable(this.motosData);
                this.poblarFiltroCategoria();
                document.getElementById('motosInfo').textContent =
                    `Total: ${this.motosData.length} motos registradas`;
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            this.showError('Error al cargar las motos');
        }
    },

    poblarFiltroCategoria() {
        const categorias = [...new Set(this.motosData.map(m => m.categoria).filter(Boolean))].sort();
        const select = document.getElementById('filtroCategoria');
        if (!select) return;
        categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });
    },

    filtrar() {
        const texto = (document.getElementById('buscadorMotos')?.value || '').toLowerCase();
        const categoria = document.getElementById('filtroCategoria')?.value || '';
        const filtradas = this.motosData.filter(m => {
            const coincideTexto = !texto ||
                m.marca.toLowerCase().includes(texto) ||
                m.modelo.toLowerCase().includes(texto) ||
                (m.categoria || '').toLowerCase().includes(texto);
            const coincideCategoria = !categoria || m.categoria === categoria;
            return coincideTexto && coincideCategoria;
        });
        this.renderTable(filtradas);
        document.getElementById('motosInfo').textContent =
            `Mostrando ${filtradas.length} de ${this.motosData.length} motos`;
    },

    renderTable(data) {
        const tbody = document.getElementById('motosTableBody');
        if (!tbody) return;
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">
                <i class="fas fa-motorcycle fa-2x mb-2 d-block opacity-25"></i>
                No hay motos registradas</td></tr>`;
            return;
        }
        tbody.innerHTML = data.map(m => `
            <tr>
                <td><small class="text-muted">${m.id_moto}</small></td>
                <td><strong>${m.marca}</strong></td>
                <td>${m.modelo}</td>
                <td>${m.anio}</td>
                <td><span class="badge bg-secondary">${m.categoria || '-'}</span></td>
                <td>${m.cilindrada_cc} cc</td>
                <td class="text-end">$${parseInt(m.precio_base).toLocaleString('es-CO')}</td>
                <td>${m.color}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm me-1" title="Editar"
                        onclick="motosModule.openModal(${m.id_moto})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" title="Eliminar"
                        onclick="motosModule.eliminar(${m.id_moto}, '${m.marca} ${m.modelo}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    openModal(id = null) {
        this.editingId = id;
        const titulo = document.getElementById('motoModalTitle');
        if (titulo) titulo.innerHTML = id
            ? '<i class="fas fa-edit"></i> Editar Moto'
            : '<i class="fas fa-plus"></i> Nueva Moto';

        // Limpiar campos
        ['motoMarca','motoModelo','motoAnio','motoCategoria',
         'motoCilindrada','motoPrecio','motoColor','motoDescripcion']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

        if (id) {
            const moto = this.motosData.find(m => m.id_moto == id);
            if (moto) {
                document.getElementById('motoMarca').value       = moto.marca || '';
                document.getElementById('motoModelo').value      = moto.modelo || '';
                document.getElementById('motoAnio').value        = moto.anio || '';
                document.getElementById('motoCategoria').value   = moto.categoria || '';
                document.getElementById('motoCilindrada').value  = moto.cilindrada_cc || '';
                document.getElementById('motoPrecio').value      = moto.precio_base || '';
                document.getElementById('motoColor').value       = moto.color || '';
                document.getElementById('motoDescripcion').value = moto.descripcion || '';
            }
        }

        new bootstrap.Modal(document.getElementById('motoModal')).show();
    },

    async guardar() {
        const marca      = document.getElementById('motoMarca').value.trim();
        const modelo     = document.getElementById('motoModelo').value.trim();
        const anio       = document.getElementById('motoAnio').value;
        const categoria  = document.getElementById('motoCategoria').value;
        const cilindrada = document.getElementById('motoCilindrada').value;
        const precio     = document.getElementById('motoPrecio').value;
        const color      = document.getElementById('motoColor').value.trim();
        const descripcion = document.getElementById('motoDescripcion').value.trim();

        if (!marca || !modelo || !anio || !categoria || !cilindrada || !precio || !color) {
            alert('Complete todos los campos obligatorios (*)');
            return;
        }

        const payload = { marca, modelo, anio, categoria,
            cilindrada_cc: cilindrada, precio_base: precio, color, descripcion };

        try {
            let response;
            if (this.editingId) {
                response = await API.request('motos.php?action=update', 'POST',
                    { id_moto: this.editingId, ...payload });
            } else {
                response = await API.request('motos.php?action=create', 'POST', payload);
            }

            if (response.success) {
                bootstrap.Modal.getInstance(document.getElementById('motoModal')).hide();
                await this.loadMotos();
                this.mostrarAlerta(this.editingId ? 'Moto actualizada correctamente' : 'Moto registrada correctamente', 'success');
            } else {
                alert(response.message || 'Error al guardar');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    },

    eliminar(id, nombre) {
        this._deleteId = id;
        document.getElementById('deleteMotoNombre').textContent = nombre;
        new bootstrap.Modal(document.getElementById('deleteMotoModal')).show();
    },

    async confirmarEliminar() {
        try {
            const response = await API.request('motos.php?action=delete', 'POST',
                { id_moto: this._deleteId });
            if (response.success) {
                bootstrap.Modal.getInstance(document.getElementById('deleteMotoModal')).hide();
                await this.loadMotos();
                this.mostrarAlerta('Moto eliminada correctamente', 'danger');
            } else {
                alert(response.message || 'No se pudo eliminar');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    },

    mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alerta.style.zIndex = 9999;
        alerta.innerHTML = `${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(alerta);
        setTimeout(() => alerta.remove(), 3500);
    },

    showError(message) {
        const tbody = document.getElementById('motosTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">
            <i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
    }
};