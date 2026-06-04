// FRONT/js/modules/motos.js

const motosModule = {
    motosData: [],

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
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th><th>Marca</th><th>Modelo</th><th>Año</th>
                                    <th>Categoría</th><th>Cilindrada</th><th>Precio</th><th>Color</th>
                                </tr>
                            </thead>
                            <tbody id="motosTableBody">
                                <tr><td colspan="8" class="text-center">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando...
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="motosInfo" class="text-muted mt-2"></div>
                </div>
            </div>
        `;
    },

    async loadMotos() {
        try {
            const response = await API.request('motos.php?action=all');
            if (response.success) {
                this.motosData = response.data;
                this.renderTable();
                document.getElementById('motosInfo').textContent =
                    `Total: ${this.motosData.length} motos`;
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            this.showError('Error al cargar las motos');
        }
    },

    renderTable() {
        const tbody = document.getElementById('motosTableBody');
        if (!tbody) return;
        if (this.motosData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">
                No hay motos registradas</td></tr>`;
            return;
        }
        tbody.innerHTML = this.motosData.map(m => `
            <tr>
                <td>${m.id_moto}</td>
                <td>${m.marca}</td>
                <td>${m.modelo}</td>
                <td>${m.anio}</td>
                <td>${m.categoria}</td>
                <td>${m.cilindrada_cc} cc</td>
                <td>$${parseInt(m.precio_base).toLocaleString('es-CO')}</td>
                <td>${m.color}</td>
            </tr>
        `).join('');
    },

    showError(message) {
        const tbody = document.getElementById('motosTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">
            <i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
    }
}; 