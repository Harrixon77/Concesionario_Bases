// js/modules/ventas.js

const ventasModule = {
    selectedMotos: [],
    currentCliente: null,
    
    init(container) {
        this.container = container;
        this.render();
        this.loadMotos();
        this.loadClientes();
    },
    
    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h4><i class="fas fa-shopping-cart"></i> Registro de Ventas</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <!-- Panel de selección de cliente -->
                        <div class="col-md-12 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-user"></i> Datos del Cliente</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <select id="clienteSelect" class="form-control" onchange="ventasModule.selectCliente()">
                                                <option value="">Seleccione un cliente...</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <button class="btn btn-success w-100" onclick="clientesModule.showForm()">
                                                <i class="fas fa-plus"></i> Nuevo Cliente
                                            </button>
                                        </div>
                                        <div class="col-md-3">
                                            <button class="btn btn-info w-100" onclick="ventasModule.searchCliente()">
                                                <i class="fas fa-search"></i> Buscar Cliente
                                            </button>
                                        </div>
                                    </div>
                                    <div id="clienteInfo" class="mt-3"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Panel de selección de motos -->
                        <div class="col-md-12 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-motorcycle"></i> Agregar Motos</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <select id="motoSelect" class="form-control">
                                                <option value="">Seleccione una moto...</option>
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <input type="number" id="cantidad" class="form-control" placeholder="Cantidad" min="1" value="1">
                                        </div>
                                        <div class="col-md-2">
                                            <button class="btn btn-primary w-100" onclick="ventasModule.addMoto()">
                                                <i class="fas fa-plus"></i> Agregar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tabla de items de la venta -->
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-list"></i> Detalle de Venta</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-bordered" id="ventaItemsTable">
                                            <thead class="table-dark">
                                                <tr>
                                                    <th>Moto</th>
                                                    <th>Precio Unitario</th>
                                                    <th>Cantidad</th>
                                                    <th>Subtotal</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="ventaItemsBody">
                                                <tr>
                                                    <td colspan="5" class="text-center text-muted">
                                                        No hay motos agregadas
                                                    </td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr class="table-info">
                                                    <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
                                                    <td colspan="2">
                                                        <strong id="totalVenta">$0.00</strong>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    
                                    <div class="row mt-3">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Forma de Pago</label>
                                                <select id="formaPago" class="form-control">
                                                    <option value="CONTADO">CONTADO</option>
                                                    <option value="CREDITO">CRÉDITO</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Observaciones</label>
                                                <textarea id="observaciones" class="form-control" rows="2" 
                                                          placeholder="Notas adicionales..."></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="row mt-3">
                                        <div class="col-md-12">
                                            <button class="btn btn-success btn-lg w-100" onclick="ventasModule.registrarVenta()"
                                                    id="btnRegistrarVenta" disabled>
                                                <i class="fas fa-check-circle"></i> Registrar Venta
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Historial de ventas recientes -->
            <div class="card mt-4">
                <div class="card-header">
                    <h5><i class="fas fa-history"></i> Ventas Recientes</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm" id="ventasRecientesTable">
                            <thead>
                                <tr><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Total</th><th>Estado</th></tr>
                            </thead>
                            <tbody>
                                <tr><td colspan="5" class="text-center">Cargando...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    async loadMotos() {
        try {
            // Simular carga de motos desde la BD
            const motos = [
                { id_moto: 1, id_marca: 1, marca: 'Honda', modelo: 'CB 125F', precio_base: 7900000, stock: 10 },
                { id_moto: 2, id_marca: 2, marca: 'Yamaha', modelo: 'YZF-R3', precio_base: 22000000, stock: 4 },
                { id_moto: 3, id_marca: 3, marca: 'AKT', modelo: 'TTX 125', precio_base: 5800000, stock: 15 },
                { id_moto: 4, id_marca: 4, marca: 'Bajaj', modelo: 'Dominar 400', precio_base: 19500000, stock: 3 }
            ];
            
            const motoSelect = document.getElementById('motoSelect');
            motoSelect.innerHTML = '<option value="">Seleccione una moto...</option>' + 
                motos.map(m => `<option value="${m.id_moto}" data-precio="${m.precio_base}" data-stock="${m.stock}">
                    ${m.marca} ${m.modelo} - $${m.precio_base.toLocaleString()} (Stock: ${m.stock})
                </option>`).join('');
                
            this.motosData = motos;
            
        } catch (error) {
            console.error('Error loading motos:', error);
        }
    },
    
    async loadClientes() {
        try {
            const clientes = [
                { id_cliente: 1, nombre: 'Juan', apellido: 'Pérez', cedula: 1010101010 },
                { id_cliente: 2, nombre: 'María', apellido: 'López', cedula: 1010101011 },
                { id_cliente: 3, nombre: 'Pedro', apellido: 'Castillo', cedula: 1010101012 }
            ];
            
            const clienteSelect = document.getElementById('clienteSelect');
            clienteSelect.innerHTML = '<option value="">Seleccione un cliente...</option>' +
                clientes.map(c => `<option value="${c.id_cliente}">
                    ${c.nombre} ${c.apellido} - CC: ${c.cedula}
                </option>`).join('');
                
        } catch (error) {
            console.error('Error loading clientes:', error);
        }
    },
    
    selectCliente() {
        const clienteId = document.getElementById('clienteSelect').value;
        if (clienteId) {
            // Mostrar información del cliente
            const clienteInfo = document.getElementById('clienteInfo');
            clienteInfo.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> Cliente seleccionado correctamente
                </div>
            `;
            this.currentCliente = clienteId;
            this.updateRegistrarButton();
        } else {
            document.getElementById('clienteInfo').innerHTML = '';
            this.currentCliente = null;
            this.updateRegistrarButton();
        }
    },
    
    addMoto() {
        const motoSelect = document.getElementById('motoSelect');
        const cantidadInput = document.getElementById('cantidad');
        
        const motoId = motoSelect.value;
        const cantidad = parseInt(cantidadInput.value);
        
        if (!motoId) {
            this.showToast('Seleccione una moto', 'warning');
            return;
        }
        
        if (isNaN(cantidad) || cantidad < 1) {
            this.showToast('Cantidad inválida', 'warning');
            return;
        }
        
        const moto = this.motosData.find(m => m.id_moto == motoId);
        
        if (cantidad > moto.stock) {
            this.showToast(`Stock insuficiente. Disponible: ${moto.stock}`, 'error');
            return;
        }
        
        // Verificar si ya existe en el carrito
        const existingIndex = this.selectedMotos.findIndex(m => m.id_moto == motoId);
        
        if (existingIndex >= 0) {
            const newCantidad = this.selectedMotos[existingIndex].cantidad + cantidad;
            if (newCantidad > moto.stock) {
                this.showToast(`Stock insuficiente. Disponible: ${moto.stock}`, 'error');
                return;
            }
            this.selectedMotos[existingIndex].cantidad = newCantidad;
            this.selectedMotos[existingIndex].subtotal = newCantidad * moto.precio_base;
        } else {
            this.selectedMotos.push({
                id_moto: moto.id_moto,
                nombre: `${moto.marca} ${moto.modelo}`,
                precio: moto.precio_base,
                cantidad: cantidad,
                subtotal: cantidad * moto.precio_base
            });
        }
        
        this.renderVentaItems();
        this.updateRegistrarButton();
        
        // Resetear selects
        motoSelect.value = '';
        cantidadInput.value = '1';
        
        this.showToast('Moto agregada al carrito', 'success');
    },
    
    renderVentaItems() {
        const tbody = document.getElementById('ventaItemsBody');
        
        if (this.selectedMotos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        No hay motos agregadas
                    </td>
                </tr>
            `;
            document.getElementById('totalVenta').textContent = '$0.00';
            return;
        }
        
        let total = 0;
        tbody.innerHTML = this.selectedMotos.map((item, index) => {
            total += item.subtotal;
            return `
                <tr>
                    <td>${item.nombre}</td>
                    <td>$${item.precio.toLocaleString()}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm" 
                               style="width: 80px; display: inline-block;"
                               value="${item.cantidad}" min="1" 
                               onchange="ventasModule.updateCantidad(${index}, this.value)">
                    </td>
                    <td>$${item.subtotal.toLocaleString()}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="ventasModule.removeMoto(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        document.getElementById('totalVenta').textContent = `$${total.toLocaleString()}`;
    },
    
    updateCantidad(index, newCantidad) {
        newCantidad = parseInt(newCantidad);
        if (isNaN(newCantidad) || newCantidad < 1) {
            newCantidad = 1;
        }
        
        // Verificar stock
        const motoOriginal = this.motosData.find(m => m.id_moto == this.selectedMotos[index].id_moto);
        if (newCantidad > motoOriginal.stock) {
            this.showToast(`Stock máximo: ${motoOriginal.stock}`, 'error');
            return;
        }
        
        this.selectedMotos[index].cantidad = newCantidad;
        this.selectedMotos[index].subtotal = newCantidad * this.selectedMotos[index].precio;
        this.renderVentaItems();
    },
    
    removeMoto(index) {
        this.selectedMotos.splice(index, 1);
        this.renderVentaItems();
        this.updateRegistrarButton();
    },
    
    updateRegistrarButton() {
        const btn = document.getElementById('btnRegistrarVenta');
        if (btn) {
            btn.disabled = !(this.currentCliente && this.selectedMotos.length > 0);
        }
    },
    
    async registrarVenta() {
        if (!this.currentCliente) {
            this.showToast('Debe seleccionar un cliente', 'warning');
            return;
        }
        
        if (this.selectedMotos.length === 0) {
            this.showToast('Debe agregar al menos una moto', 'warning');
            return;
        }
        
        const user = authManager.currentUser;
        
        const ventaData = {
            id_cliente: this.currentCliente,
            id_empleado: user.id,
            forma_pago: document.getElementById('formaPago').value,
            observaciones: document.getElementById('observaciones').value,
            items: this.selectedMotos.map(item => ({
                id_moto: item.id_moto,
                cantidad: item.cantidad,
                precio_unitario: item.precio
            }))
        };
        
        // Confirmar venta
        const total = this.selectedMotos.reduce((sum, item) => sum + item.subtotal, 0);
        
        const confirmacion = confirm(`¿Confirmar venta por $${total.toLocaleString()}?`);
        if (!confirmacion) return;
        
        try {
            // Llamar al procedimiento almacenado sp_registrar_venta
            const response = await API.callProcedure('sp_registrar_venta', ventaData);
            
            this.showToast('Venta registrada exitosamente', 'success');
            
            // Limpiar carrito
            this.selectedMotos = [];
            this.currentCliente = null;
            this.renderVentaItems();
            document.getElementById('clienteSelect').value = '';
            document.getElementById('clienteInfo').innerHTML = '';
            document.getElementById('observaciones').value = '';
            this.updateRegistrarButton();
            
            // Recargar inventario
            this.loadMotos();
            
        } catch (error) {
            console.error('Error registrando venta:', error);
            this.showToast('Error al registrar la venta', 'error');
        }
    },
    
    showToast(message, type) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Aviso',
                text: message,
                icon: type,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
            alert(message);
        }
    }
};