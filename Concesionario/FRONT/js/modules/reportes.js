// FRONT/js/modules/reportes.js

const reportesModule = {
    init(container) {
        this.container = container;
        this.render();
    },

    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h4><i class="fas fa-chart-bar"></i> Reportes</h4>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">Fecha Inicio</label>
                            <input type="date" id="fechaInicio" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Fecha Fin</label>
                            <input type="date" id="fechaFin" class="form-control">
                        </div>
                        <div class="col-md-4 d-flex align-items-end">
                            <button class="btn btn-primary w-100" onclick="reportesModule.generarReporte()">
                                <i class="fas fa-search"></i> Generar Reporte
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID Venta</th><th>Fecha</th><th>Cliente</th>
                                    <th>Moto</th><th>Cantidad</th><th>Subtotal</th><th>Forma Pago</th>
                                </tr>
                            </thead>
                            <tbody id="reportesTableBody">
                                <tr><td colspan="7" class="text-center text-muted">
                                    Seleccione un rango de fechas y genere el reporte
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="reporteTotal" class="text-end fw-bold mt-2"></div>
                </div>
            </div>
        `;
    },

    async generarReporte() {
        const inicio = document.getElementById('fechaInicio').value;
        const fin    = document.getElementById('fechaFin').value;
        if (!inicio || !fin) { alert('Seleccione ambas fechas'); return; }

        const tbody = document.getElementById('reportesTableBody');
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">
            <i class="fas fa-spinner fa-spin"></i> Generando...</td></tr>`;

        try {
            const response = await API.request(
                `reportes.php?action=ventas&inicio=${inicio}&fin=${fin}`
            );
            if (response.success && response.data.length > 0) {
                let total = 0;
                tbody.innerHTML = response.data.map(r => {
                    total += parseFloat(r.subtotal);
                    return `<tr>
                        <td>${r.id_venta}</td>
                        <td>${new Date(r.fecha_venta).toLocaleDateString('es-CO')}</td>
                        <td>${r.cliente}</td>
                        <td>${r.moto_vendida}</td>
                        <td>${r.cantidad}</td>
                        <td>$${parseInt(r.subtotal).toLocaleString('es-CO')}</td>
                        <td>${r.forma_pago}</td>
                    </tr>`;
                }).join('');
                document.getElementById('reporteTotal').textContent =
                    `Total: $${total.toLocaleString('es-CO')}`;
            } else {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">
                    No hay ventas en ese período</td></tr>`;
                document.getElementById('reporteTotal').textContent = '';
            }
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">
                Error al generar el reporte</td></tr>`;
        }
    }
};