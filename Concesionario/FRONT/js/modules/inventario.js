// FRONT/js/modules/inventario.js

const inventarioModule = {
    inventarioData: [],

    init(container) {
        this.container = container;
        this.render();
        this.loadInventario();
    },

    render() {
        this.container.innerHTML = `
            <div class="row g-3 mb-3">
                <!-- Tarjetas resumen -->
                <div class="col-md-4">
                    <div class="card border-0 bg-success text-white">
                        <div class="card-body d-flex align-items-center gap-3">
                            <i class="fas fa-check-circle fa-2x opacity-75"></i>
                            <div>
                                <div class="fs-4 fw-bold" id="stockOkCount">-</div>
                                <div class="small">Stock Normal</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-0 bg-warning text-dark">
                        <div class="card-body d-flex align-items-center gap-3">
                            <i class="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                            <div>
                                <div class="fs-4 fw-bold" id="stockBajoCount">-</div>
                                <div class="small">Stock Bajo</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-0 bg-danger text-white">
                        <div class="card-body d-flex align-items-center gap-3">
                            <i class="fas fa-times-circle fa-2x opacity-75"></i>
                            <div>
                                <div class="fs-4 fw-bold" id="sinStockCount">-</div>
                                <div class="small">Sin Stock</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h4 class="mb-0"><i class="fas fa-boxes"></i> Inventario de Motos</h4>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary btn-sm" onclick="inventarioModule.loadInventario()">
                            <i class="fas fa-sync-alt"></i> Actualizar
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="inventarioModule.openAjusteModal()">
                            <i class="fas fa-sliders-h"></i> Ajuste de Stock
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <input type="text" id="buscadorInventario" class="form-control form-control-sm"
                                placeholder="Buscar moto o color..."
                                oninput="inventarioModule.filtrar()">
                        </div>
                        <div class="col-md-3">
                            <select id="filtroEstadoInv" class="form-select form-select-sm" onchange="inventarioModule.filtrar()">
                                <option value="">Todos los estados</option>
                                <option value="ok">Stock Normal</option>
                                <option value="bajo">Stock Bajo</option>
                                <option value="sin">Sin Stock</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover align-middle">
                            <thead class="table-dark">
                                <tr>
                                    <th>Moto</th>
                                    <th>Color</th>
                                    <th class="text-center">Stock Disponible</th>
                                    <th class="text-center">Stock Mínimo</th>
                                    <th class="text-center">Estado</th>
                                    <th>Última Actualización</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="inventarioTableBody">
                                <tr><td colspan="7" class="text-center py-4">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando inventario...
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="inventarioInfo" class="text-muted small mt-1"></div>
                </div>
            </div>

            <!-- Modal: Movimiento individual (Entrada / Salida) -->
            <div class="modal fade" id="movimientoModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header" id="movimientoModalHeader">
                            <h5 class="modal-title" id="movimientoModalTitle">Movimiento de Stock</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Moto</label>
                                <input type="text" id="movMoto" class="form-control" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Tipo de Movimiento</label>
                                <select id="movTipo" class="form-select">
                                    <option value="entrada">📦 Entrada (recepción de unidades)</option>
                                    <option value="salida">📤 Salida (ajuste manual)</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Cantidad *</label>
                                <input type="number" id="movCantidad" class="form-control" min="1" placeholder="0">
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Motivo / Observación</label>
                                <textarea id="movMotivo" class="form-control" rows="2"
                                    placeholder="Ej: Recepción factura #123, devolución, ajuste..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="inventarioModule.guardarMovimiento()">
                                <i class="fas fa-save"></i> Registrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal: Ajuste de Stock Mínimo -->
            <div class="modal fade" id="ajusteModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-dark text-white">
                            <h5 class="modal-title"><i class="fas fa-sliders-h"></i> Ajuste de Stock</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Moto *</label>
                                <select id="ajusteMotoId" class="form-select">
                                    <option value="">Seleccionar moto...</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Nuevo Stock Disponible *</label>
                                <input type="number" id="ajusteStock" class="form-control" min="0" placeholder="0">
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Stock Mínimo *</label>
                                <input type="number" id="ajusteMinimo" class="form-control" min="0" placeholder="2">
                            </div>
                            <div class="alert alert-info small">
                                <i class="fas fa-info-circle"></i>
                                Use este formulario para establecer o corregir el stock directamente.
                                Para movimientos de entrada/salida use los botones en la tabla.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" onclick="inventarioModule.guardarAjuste()">
                                <i class="fas fa-save"></i> Guardar Ajuste
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async loadInventario() {
        try {
            const response = await API.request('inventario.php?action=all');
            if (response.success) {
                this.inventarioData = response.data;
                this.renderTable(this.inventarioData);
                this.actualizarContadores(this.inventarioData);
                const info = document.getElementById('inventarioInfo');
                if (info) info.textContent = `${this.inventarioData.length} registros en inventario`;
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            this.showError('Error al cargar el inventario');
        }
    },

    actualizarContadores(data) {
        const ok   = data.filter(i => i.stock_disponible > i.stock_minimo).length;
        const bajo = data.filter(i => i.stock_disponible > 0 && i.stock_disponible <= i.stock_minimo).length;
        const sin  = data.filter(i => i.stock_disponible == 0).length;
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('stockOkCount', ok);
        setEl('stockBajoCount', bajo);
        setEl('sinStockCount', sin);
    },

    filtrar() {
        const texto  = (document.getElementById('buscadorInventario')?.value || '').toLowerCase();
        const estado = document.getElementById('filtroEstadoInv')?.value || '';
        const filtrados = this.inventarioData.filter(i => {
            const coincideTexto = !texto ||
                (i.moto || '').toLowerCase().includes(texto) ||
                (i.color || '').toLowerCase().includes(texto);
            let coincideEstado = true;
            if (estado === 'ok')   coincideEstado = i.stock_disponible > i.stock_minimo;
            if (estado === 'bajo') coincideEstado = i.stock_disponible > 0 && i.stock_disponible <= i.stock_minimo;
            if (estado === 'sin')  coincideEstado = i.stock_disponible == 0;
            return coincideTexto && coincideEstado;
        });
        this.renderTable(filtrados);
        const info = document.getElementById('inventarioInfo');
        if (info) info.textContent = `Mostrando ${filtrados.length} de ${this.inventarioData.length} registros`;
    },

    renderTable(data) {
        const tbody = document.getElementById('inventarioTableBody');
        if (!tbody) return;
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">
                <i class="fas fa-boxes fa-2x mb-2 d-block opacity-25"></i>
                Sin registros de inventario</td></tr>`;
            return;
        }
        tbody.innerHTML = data.map(i => {
            let badge, rowClass = '';
            if (i.stock_disponible == 0) {
                badge = '<span class="badge bg-danger">SIN STOCK</span>';
                rowClass = 'table-danger';
            } else if (i.stock_disponible <= i.stock_minimo) {
                badge = '<span class="badge bg-warning text-dark">STOCK BAJO</span>';
                rowClass = 'table-warning';
            } else {
                badge = '<span class="badge bg-success">OK</span>';
            }
            const fecha = i.fecha_actualizacion
                ? new Date(i.fecha_actualizacion).toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' })
                : 'N/A';
            return `
                <tr class="${rowClass}">
                    <td><strong>${i.moto || '-'}</strong></td>
                    <td>${i.color || '-'}</td>
                    <td class="text-center fw-bold">${i.stock_disponible}</td>
                    <td class="text-center text-muted">${i.stock_minimo}</td>
                    <td class="text-center">${badge}</td>
                    <td><small>${fecha}</small></td>
                    <td class="text-center">
                        <button class="btn btn-outline-success btn-sm me-1" title="Entrada de stock"
                            onclick="inventarioModule.openMovimiento(${i.id_inventario ?? i.id}, '${(i.moto||'').replace(/'/g,"\\'")} - ${i.color}', 'entrada')">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-outline-warning btn-sm" title="Salida de stock"
                            onclick="inventarioModule.openMovimiento(${i.id_inventario ?? i.id}, '${(i.moto||'').replace(/'/g,"\\'")} - ${i.color}', 'salida')">
                            <i class="fas fa-minus"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openMovimiento(idInventario, nombre, tipo) {
        this._movInventarioId = idInventario;
        const header = document.getElementById('movimientoModalHeader');
        const titulo = document.getElementById('movimientoModalTitle');
        if (tipo === 'entrada') {
            if (header) header.className = 'modal-header bg-success text-white';
            if (titulo) titulo.innerHTML = '<i class="fas fa-plus"></i> Entrada de Stock';
        } else {
            if (header) header.className = 'modal-header bg-warning text-dark';
            if (titulo) titulo.innerHTML = '<i class="fas fa-minus"></i> Salida de Stock';
        }
        const movMoto = document.getElementById('movMoto');
        const movTipo = document.getElementById('movTipo');
        const movCantidad = document.getElementById('movCantidad');
        const movMotivo = document.getElementById('movMotivo');
        if (movMoto) movMoto.value = nombre;
        if (movTipo) movTipo.value = tipo;
        if (movCantidad) movCantidad.value = '';
        if (movMotivo) movMotivo.value = '';
        new bootstrap.Modal(document.getElementById('movimientoModal')).show();
    },

    async guardarMovimiento() {
        const tipo     = document.getElementById('movTipo').value;
        const cantidad = parseInt(document.getElementById('movCantidad').value);
        const motivo   = document.getElementById('movMotivo').value.trim();

        if (!cantidad || cantidad < 1) { alert('Ingrese una cantidad válida mayor a 0'); return; }

        try {
            const response = await API.request('inventario.php?action=movimiento', 'POST', {
                id_inventario: this._movInventarioId,
                tipo,
                cantidad,
                motivo
            });
            if (response.success) {
                bootstrap.Modal.getInstance(document.getElementById('movimientoModal')).hide();
                await this.loadInventario();
                this.mostrarAlerta(
                    tipo === 'entrada' ? `+${cantidad} unidades registradas` : `-${cantidad} unidades descontadas`,
                    tipo === 'entrada' ? 'success' : 'warning'
                );
            } else {
                alert(response.message || 'Error al registrar movimiento');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    },

    openAjusteModal() {
        // Poblar select con motos del inventario
        const select = document.getElementById('ajusteMotoId');
        if (select) {
            select.innerHTML = '<option value="">Seleccionar moto...</option>' +
                this.inventarioData.map(i =>
                    `<option value="${i.id_inventario ?? i.id}">${i.moto} - ${i.color}</option>`
                ).join('');
        }
        const ajusteStock  = document.getElementById('ajusteStock');
        const ajusteMinimo = document.getElementById('ajusteMinimo');
        if (ajusteStock)  ajusteStock.value  = '';
        if (ajusteMinimo) ajusteMinimo.value = '';

        // Al cambiar la moto, prellenar con valores actuales
        if (select) {
            select.onchange = () => {
                const id = select.value;
                const item = this.inventarioData.find(i => (i.id_inventario ?? i.id) == id);
                if (item) {
                    if (ajusteStock)  ajusteStock.value  = item.stock_disponible;
                    if (ajusteMinimo) ajusteMinimo.value = item.stock_minimo;
                }
            };
        }
        new bootstrap.Modal(document.getElementById('ajusteModal')).show();
    },

    async guardarAjuste() {
        const idInventario = document.getElementById('ajusteMotoId').value;
        const stock        = document.getElementById('ajusteStock').value;
        const minimo       = document.getElementById('ajusteMinimo').value;

        if (!idInventario) { alert('Seleccione una moto'); return; }
        if (stock === '' || minimo === '') { alert('Complete todos los campos'); return; }

        try {
            const response = await API.request('inventario.php?action=update', 'POST', {
                id_inventario: idInventario,
                stock_disponible: parseInt(stock),
                stock_minimo: parseInt(minimo)
            });
            if (response.success) {
                bootstrap.Modal.getInstance(document.getElementById('ajusteModal')).hide();
                await this.loadInventario();
                this.mostrarAlerta('Stock ajustado correctamente', 'success');
            } else {
                alert(response.message || 'Error al ajustar stock');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    },

    mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alerta.style.zIndex = 9999;
        alerta.innerHTML = `<i class="fas fa-check-circle me-2"></i>${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(alerta);
        setTimeout(() => alerta.remove(), 3500);
    },

    showError(message) {
        const tbody = document.getElementById('inventarioTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">
            <i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
    }
};