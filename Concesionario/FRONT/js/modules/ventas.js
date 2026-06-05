// FRONT/js/modules/ventas.js

const ventasModule = {
    selectedMotos: [],
    currentCliente: null,
    motosData: [],
    clientesData: [],

    init(container) {
        this.container = container;
        this.render();
        this.loadMotos();
        this.loadClientes();
        this.loadVentasRecientes();
    },

    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h4><i class="fas fa-shopping-cart"></i> Registro de Ventas</h4>
                </div>
                <div class="card-body">

                    <!-- Cliente -->
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="fas fa-user"></i> Datos del Cliente</h5>
                            <button class="btn btn-success btn-sm" onclick="ventasModule.showNuevoClienteModal()">
                                <i class="fas fa-plus"></i> Nuevo Cliente
                            </button>
                        </div>
                        <div class="card-body">
                            <select id="clienteSelect" class="form-control"
                                    onchange="ventasModule.selectCliente()">
                                <option value="">Seleccione un cliente...</option>
                            </select>
                            <div id="clienteInfo" class="mt-3"></div>
                        </div>
                    </div>

                    <!-- Motos -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-motorcycle"></i> Agregar Motos</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <select id="motoSelect" class="form-control">
                                        <option value="">Seleccione una moto...</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <input type="number" id="cantidad" class="form-control"
                                           min="1" value="1">
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-primary w-100" onclick="ventasModule.addMoto()">
                                        <i class="fas fa-plus"></i> Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Detalle -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-list"></i> Detalle de Venta</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Moto</th><th>Precio Unitario</th>
                                            <th>Cantidad</th><th>Subtotal</th><th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="ventaItemsBody">
                                        <tr><td colspan="5" class="text-center text-muted">
                                            No hay motos agregadas</td></tr>
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-info">
                                            <td colspan="3" class="text-end fw-bold">TOTAL:</td>
                                            <td colspan="2"><strong id="totalVenta">$0</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <label class="form-label">Forma de Pago</label>
                                    <select id="formaPago" class="form-control">
                                        <option value="CONTADO">CONTADO</option>
                                        <option value="CREDITO">CRÉDITO</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Observaciones</label>
                                    <textarea id="observaciones" class="form-control" rows="2"
                                              placeholder="Notas adicionales..."></textarea>
                                </div>
                            </div>

                            <button class="btn btn-success btn-lg w-100 mt-3"
                                    onclick="ventasModule.registrarVenta()"
                                    id="btnRegistrarVenta" disabled>
                                <i class="fas fa-check-circle"></i> Registrar Venta
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ventas recientes -->
            <div class="card mt-4">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-history"></i> Ventas Recientes</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th><th>Fecha</th><th>Cliente</th>
                                    <th>Forma Pago</th><th>Total</th><th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="ventasRecientesBody">
                                <tr><td colspan="6" class="text-center">Cargando...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal Nuevo Cliente (propio de ventas) -->
            <div class="modal fade" id="nuevoClienteVentaModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-user-plus"></i> Registrar Nuevo Cliente
                            </h5>
                            <button type="button" class="btn-close btn-close-white"
                                    data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Cédula *</label>
                                    <input type="number" class="form-control" id="vnCedula"
                                           min="10000000" max="1299999999" placeholder="1010101014">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Teléfono *</label>
                                    <input type="tel" class="form-control" id="vnTelefono"
                                           placeholder="3001234567">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Nombre *</label>
                                    <input type="text" class="form-control" id="vnNombre">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Apellido *</label>
                                    <input type="text" class="form-control" id="vnApellido">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Correo *</label>
                                    <input type="email" class="form-control" id="vnCorreo">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Fecha Nacimiento *</label>
                                    <input type="date" class="form-control" id="vnFecha">
                                </div>
                            </div>
                            <small class="text-muted mt-2 d-block">
                                <i class="fas fa-map-marker-alt"></i> Ciudad: Bogotá (única disponible)
                            </small>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary"
                                    data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success"
                                    onclick="ventasModule.guardarNuevoCliente()">
                                <i class="fas fa-save"></i> Guardar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ── Cargar motos desde BD ──
    async loadMotos() {
        try {
            const res = await API.request('motos.php?action=all');
            if (res.success) {
                this.motosData = res.data;
                const select   = document.getElementById('motoSelect');
                if (!select) return;
                select.innerHTML = '<option value="">Seleccione una moto...</option>' +
                    res.data.map(m => `
                        <option value="${m.id_moto}"
                                data-precio="${m.precio_base}"
                                data-stock="${m.stock_disponible ?? 99}">
                            ${m.marca} ${m.modelo} ${m.anio} —
                            $${parseInt(m.precio_base).toLocaleString('es-CO')}
                            (Stock: ${m.stock_disponible ?? '?'})
                        </option>`).join('');
            }
        } catch (e) { console.error('Error motos:', e); }
    },

    // ── Cargar clientes desde BD ──
    async loadClientes() {
        try {
            const res = await API.getClientes();
            if (res.success) {
                this.clientesData = res.data;
                const select      = document.getElementById('clienteSelect');
                if (!select) return;
                select.innerHTML = '<option value="">Seleccione un cliente...</option>' +
                    res.data.map(c => `
                        <option value="${c.id_cliente}">
                            ${c.nombre} ${c.apellido} — CC: ${c.cedula}
                        </option>`).join('');
            }
        } catch (e) { console.error('Error clientes:', e); }
    },

    selectCliente() {
        const id  = document.getElementById('clienteSelect').value;
        const div = document.getElementById('clienteInfo');
        if (id) {
            const c = this.clientesData.find(x => x.id_cliente == id);
            this.currentCliente = id;
            div.innerHTML = `<div class="alert alert-success py-2">
                <i class="fas fa-check-circle"></i>
                <strong>${c ? c.nombre + ' ' + c.apellido : 'Cliente'}</strong>
                seleccionado correctamente
            </div>`;
        } else {
            this.currentCliente = null;
            div.innerHTML = '';
        }
        this.updateBtn();
    },

    // ── Modal nuevo cliente propio ──
    showNuevoClienteModal() {
        ['vnCedula','vnTelefono','vnNombre','vnApellido','vnCorreo','vnFecha']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        new bootstrap.Modal(document.getElementById('nuevoClienteVentaModal')).show();
    },

    async guardarNuevoCliente() {
        const data = {
            cedula:           parseInt(document.getElementById('vnCedula').value),
            nombre:           document.getElementById('vnNombre').value.trim(),
            apellido:         document.getElementById('vnApellido').value.trim(),
            correo:           document.getElementById('vnCorreo').value.trim(),
            telefono:         document.getElementById('vnTelefono').value.trim(),
            fecha_nacimiento: document.getElementById('vnFecha').value,
            id_ciudad:        1,
            activo:           1
        };

        if (!data.cedula || !data.nombre || !data.apellido || !data.correo ||
            !data.telefono || !data.fecha_nacimiento) {
            alert('Completa todos los campos'); return;
        }

        try {
            const res = await API.saveCliente(data);
            if (res.success) {
                bootstrap.Modal.getInstance(
                    document.getElementById('nuevoClienteVentaModal')).hide();
                this.toast('Cliente registrado correctamente', 'success');
                await this.loadClientes();
                // Seleccionar el cliente recién creado
                const select = document.getElementById('clienteSelect');
                const ultima = select.options[select.options.length - 1];
                if (ultima) {
                    select.value = ultima.value;
                    this.selectCliente();
                }
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert('Error al guardar el cliente');
        }
    },

    addMoto() {
        const sel      = document.getElementById('motoSelect');
        const cantidad = parseInt(document.getElementById('cantidad').value);
        const id       = sel.value;
        if (!id) { this.toast('Seleccione una moto', 'warning'); return; }
        if (isNaN(cantidad) || cantidad < 1) { this.toast('Cantidad inválida', 'warning'); return; }

        const opt    = sel.options[sel.selectedIndex];
        const precio = parseFloat(opt.dataset.precio);
        const stock  = parseInt(opt.dataset.stock);
        const nombre = opt.text.split(' —')[0];

        if (cantidad > stock) {
            this.toast(`Stock insuficiente. Disponible: ${stock}`, 'error'); return;
        }

        const idx = this.selectedMotos.findIndex(m => m.id_moto == id);
        if (idx >= 0) {
            const nueva = this.selectedMotos[idx].cantidad + cantidad;
            if (nueva > stock) { this.toast(`Stock máximo: ${stock}`, 'error'); return; }
            this.selectedMotos[idx].cantidad = nueva;
            this.selectedMotos[idx].subtotal = nueva * precio;
        } else {
            this.selectedMotos.push({
                id_moto: id, nombre, precio, cantidad,
                subtotal: cantidad * precio
            });
        }

        this.renderItems();
        this.updateBtn();
        sel.value = '';
        document.getElementById('cantidad').value = '1';
        this.toast('Moto agregada al carrito', 'success');
    },

    renderItems() {
        const tbody = document.getElementById('ventaItemsBody');
        if (!tbody) return;
        if (this.selectedMotos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">
                No hay motos agregadas</td></tr>`;
            document.getElementById('totalVenta').textContent = '$0';
            return;
        }
        let total = 0;
        tbody.innerHTML = this.selectedMotos.map((item, i) => {
            total += item.subtotal;
            return `<tr>
                <td>${item.nombre}</td>
                <td>$${parseInt(item.precio).toLocaleString('es-CO')}</td>
                <td>
                    <input type="number" class="form-control form-control-sm"
                           style="width:80px" value="${item.cantidad}" min="1"
                           onchange="ventasModule.updateCantidad(${i}, this.value)">
                </td>
                <td>$${parseInt(item.subtotal).toLocaleString('es-CO')}</td>
                <td>
                    <button class="btn btn-danger btn-sm"
                            onclick="ventasModule.removeMoto(${i})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
        document.getElementById('totalVenta').textContent =
            `$${parseInt(total).toLocaleString('es-CO')}`;
    },

    updateCantidad(i, val) {
        val = parseInt(val);
        if (isNaN(val) || val < 1) val = 1;
        this.selectedMotos[i].cantidad = val;
        this.selectedMotos[i].subtotal = val * this.selectedMotos[i].precio;
        this.renderItems();
    },

    removeMoto(i) {
        this.selectedMotos.splice(i, 1);
        this.renderItems();
        this.updateBtn();
    },

    updateBtn() {
        const btn = document.getElementById('btnRegistrarVenta');
        if (btn) btn.disabled = !(this.currentCliente && this.selectedMotos.length > 0);
    },

    async registrarVenta() {
        if (!this.currentCliente || this.selectedMotos.length === 0) return;

        const user  = JSON.parse(sessionStorage.getItem('user') || '{}');
        const total = this.selectedMotos.reduce((s, i) => s + i.subtotal, 0);

        if (!confirm(`¿Confirmar venta por $${parseInt(total).toLocaleString('es-CO')}?`)) return;

        try {
            const res = await API.request('ventas.php?action=registrar', 'POST', {
                id_cliente:    this.currentCliente,
                id_empleado:   user.id || 1,
                forma_pago:    document.getElementById('formaPago').value,
                observaciones: document.getElementById('observaciones').value,
                items: this.selectedMotos.map(m => ({
                    id_moto:         m.id_moto,
                    cantidad:        m.cantidad,
                    precio_unitario: m.precio
                }))
            });

            if (res.success) {
                this.toast('¡Venta registrada exitosamente!', 'success');
                this.selectedMotos  = [];
                this.currentCliente = null;
                this.renderItems();
                document.getElementById('clienteSelect').value   = '';
                document.getElementById('clienteInfo').innerHTML  = '';
                document.getElementById('observaciones').value    = '';
                this.updateBtn();
                this.loadMotos();
                this.loadVentasRecientes();
            } else {
                this.toast(res.message, 'error');
            }
        } catch (e) {
            this.toast('Error al registrar la venta', 'error');
        }
    },

    async loadVentasRecientes() {
        try {
            const res   = await API.getVentasRecientes();
            const tbody = document.getElementById('ventasRecientesBody');
            if (!tbody) return;
            if (res.success && res.data.length > 0) {
                tbody.innerHTML = res.data.map(v => `
                    <tr>
                        <td>${v.id_venta}</td>
                        <td>${new Date(v.fecha_venta).toLocaleDateString('es-CO')}</td>
                        <td>${v.cliente}</td>
                        <td>${v.forma_pago}</td>
                        <td>$${parseInt(v.total).toLocaleString('es-CO')}</td>
                        <td><span class="badge ${
                            v.estado === 'COMPLETADA' ? 'bg-success' :
                            v.estado === 'ANULADA'    ? 'bg-danger'  : 'bg-warning text-dark'
                        }">${v.estado}</span></td>
                    </tr>`).join('');
            } else {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">
                    No hay ventas recientes</td></tr>`;
            }
        } catch (e) { console.error('Error ventas recientes:', e); }
    },

    toast(msg, type) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Aviso',
                text: msg, icon: type, toast: true,
                position: 'top-end', showConfirmButton: false, timer: 3000
            });
        } else { alert(msg); }
    }
};