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
            <div class="card">
                <div class="card-header">
                    <h4><i class="fas fa-boxes"></i> Inventario de Motos</h4>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>Moto</th><th>Color</th><th>Stock Disponible</th>
                                    <th>Stock Mínimo</th><th>Estado</th><th>Última Actualización</th>
                                </tr>
                            </thead>
                            <tbody id="inventarioTableBody">
                                <tr><td colspan="6" class="text-center">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando...
                                </td></tr>
                            </tbody>
                        </table>
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
                this.renderTable();
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            this.showError('Error al cargar el inventario');
        }
    },

    renderTable() {
        const tbody = document.getElementById('inventarioTableBody');
        if (!tbody) return;
        if (this.inventarioData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">
                Sin registros de inventario</td></tr>`;
            return;
        }
        tbody.innerHTML = this.inventarioData.map(i => {
            let badge = '';
            if (i.stock_disponible == 0)
                badge = '<span class="badge bg-danger">SIN STOCK</span>';
            else if (i.stock_disponible <= i.stock_minimo)
                badge = '<span class="badge bg-warning text-dark">STOCK BAJO</span>';
            else
                badge = '<span class="badge bg-success">OK</span>';
            return `
                <tr>
                    <td>${i.moto}</td>
                    <td>${i.color}</td>
                    <td>${i.stock_disponible}</td>
                    <td>${i.stock_minimo}</td>
                    <td>${badge}</td>
                    <td>${i.fecha_actualizacion ? new Date(i.fecha_actualizacion).toLocaleDateString('es-CO') : 'N/A'}</td>
                </tr>
            `;
        }).join('');
    },

    showError(message) {
        const tbody = document.getElementById('inventarioTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">
            <i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
    }
};