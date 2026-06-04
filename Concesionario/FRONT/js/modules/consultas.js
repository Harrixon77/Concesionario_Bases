// FRONT/js/modules/consultas.js
// Las 20 consultas SQL del proyecto — se ejecutan desde el backend

const consultasModule = {
    consultas: [
        { id: 1,  nombre: 'Todos los clientes activos',             sql: 'SELECT * FROM cliente WHERE activo = 1' },
        { id: 2,  nombre: 'Motos por marca',                        sql: 'SELECT ma.nombre AS marca, COUNT(*) AS total FROM moto m JOIN marca ma ON m.id_marca = ma.id_marca GROUP BY ma.nombre' },
        { id: 3,  nombre: 'Inventario con alertas',                 sql: 'SELECT * FROM v_stock_alertas' },
        { id: 4,  nombre: 'Ventas completadas',                     sql: "SELECT * FROM v_ventas_completas WHERE estado = 'COMPLETADA'" },
        { id: 5,  nombre: 'Ranking de vendedores',                  sql: 'SELECT * FROM v_ranking_vendedores' },
        { id: 6,  nombre: 'Motos sin stock',                        sql: "SELECT * FROM v_stock_alertas WHERE estado_stock = 'SIN STOCK'" },
        { id: 7,  nombre: 'Clientes con ventas',                    sql: 'SELECT c.cedula, c.nombre, c.apellido, COUNT(v.id_venta) AS ventas FROM cliente c JOIN venta v ON c.id_cliente = v.id_cliente GROUP BY c.id_cliente' },
        { id: 8,  nombre: 'Moto más vendida',                       sql: 'SELECT mo.modelo, ma.nombre AS marca, SUM(dv.cantidad) AS unidades FROM detalle_venta dv JOIN moto mo ON dv.id_moto = mo.id_moto JOIN marca ma ON mo.id_marca = ma.id_marca GROUP BY mo.id_moto ORDER BY unidades DESC LIMIT 1' },
        { id: 9,  nombre: 'Total ventas por forma de pago',         sql: 'SELECT forma_pago, COUNT(*) AS ventas, SUM(total) AS monto FROM venta GROUP BY forma_pago' },
        { id: 10, nombre: 'Motos por categoría',                    sql: 'SELECT ca.nombre AS categoria, COUNT(*) AS total FROM moto m JOIN categoria_moto ca ON m.id_categoria = ca.id_categoria GROUP BY ca.nombre' },
        { id: 11, nombre: 'Empleados activos',                      sql: "SELECT * FROM empleado WHERE activo = 1" },
        { id: 12, nombre: 'Usuarios por rol',                       sql: 'SELECT rol, COUNT(*) AS total FROM usuario GROUP BY rol' },
        { id: 13, nombre: 'Ventas del mes actual',                  sql: 'SELECT * FROM venta WHERE MONTH(fecha_venta) = MONTH(NOW()) AND YEAR(fecha_venta) = YEAR(NOW())' },
        { id: 14, nombre: 'Motos precio mayor a 10 millones',       sql: 'SELECT * FROM moto WHERE precio_base > 10000000 ORDER BY precio_base DESC' },
        { id: 15, nombre: 'Clientes registrados este año',          sql: 'SELECT COUNT(*) AS total FROM cliente WHERE YEAR(fecha_nacimiento) > 1990' },
        { id: 16, nombre: 'Detalle de todas las ventas',            sql: 'SELECT v.id_venta, dv.cantidad, dv.precio_unitario, dv.subtotal, mo.modelo FROM detalle_venta dv JOIN venta v ON dv.id_venta = v.id_venta JOIN moto mo ON dv.id_moto = mo.id_moto' },
        { id: 17, nombre: 'Marcas con motos disponibles',           sql: 'SELECT DISTINCT ma.nombre FROM marca ma JOIN moto m ON ma.id_marca = m.id_marca JOIN inventario i ON m.id_moto = i.id_moto WHERE i.stock_disponible > 0' },
        { id: 18, nombre: 'Promedio precio por categoría',          sql: 'SELECT ca.nombre, AVG(m.precio_base) AS precio_promedio FROM moto m JOIN categoria_moto ca ON m.id_categoria = ca.id_categoria GROUP BY ca.nombre' },
        { id: 19, nombre: 'Ventas anuladas',                        sql: "SELECT * FROM v_ventas_completas WHERE estado = 'ANULADA'" },
        { id: 20, nombre: 'Clientes sin ventas (subconsulta)',       sql: 'SELECT * FROM cliente WHERE id_cliente NOT IN (SELECT id_cliente FROM venta)' },
    ],

    init(container) {
        this.container = container;
        this.render();
    },

    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h4><i class="fas fa-database"></i> Consultas SQL del Proyecto</h4>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <select class="form-control" id="selectConsulta">
                                <option value="">-- Seleccione una consulta --</option>
                                ${this.consultas.map(c =>
                                    `<option value="${c.id}">${c.id}. ${c.nombre}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-primary w-100" onclick="consultasModule.ejecutar()">
                                <i class="fas fa-play"></i> Ejecutar
                            </button>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-muted">SQL:</label>
                        <pre id="sqlPreview" class="bg-dark text-light p-3 rounded"
                             style="font-size:13px">Seleccione una consulta para ver el SQL</pre>
                    </div>
                    <div id="consultaResultado"></div>
                </div>
            </div>
        `;

        document.getElementById('selectConsulta').addEventListener('change', (e) => {
            const c = this.consultas.find(x => x.id == e.target.value);
            document.getElementById('sqlPreview').textContent = c ? c.sql : 'Seleccione una consulta';
        });
    },

    async ejecutar() {
        const id = document.getElementById('selectConsulta').value;
        if (!id) { alert('Seleccione una consulta'); return; }

        const consulta = this.consultas.find(c => c.id == id);
        const div = document.getElementById('consultaResultado');
        div.innerHTML = `<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Ejecutando...</div>`;

        try {
            const response = await API.request('consultas.php', 'POST', { sql: consulta.sql });
            if (response.success && response.data.length > 0) {
                const cols = Object.keys(response.data[0]);
                div.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
                            </thead>
                            <tbody>
                                ${response.data.map(row =>
                                    `<tr>${cols.map(c => `<td>${row[c] ?? ''}</td>`).join('')}</tr>`
                                ).join('')}
                            </tbody>
                        </table>
                        <small class="text-muted">${response.data.length} filas</small>
                    </div>
                `;
            } else {
                div.innerHTML = `<div class="alert alert-info">La consulta no devolvió resultados</div>`;
            }
        } catch (error) {
            div.innerHTML = `<div class="alert alert-danger">Error al ejecutar la consulta</div>`;
        }
    }
};