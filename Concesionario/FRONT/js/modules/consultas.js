// FRONT/js/modules/consultas.js
const consultasModule = {
    consultas: [
        { 
            id: 1,  
            nombre: '1. Todos los clientes activos',             
            sql: 'SELECT id_cliente, cedula, nombre, apellido, correo, telefono FROM cliente WHERE activo = 1 LIMIT 50'
        },
        { 
            id: 2,  
            nombre: '2. Motos por marca',                        
            sql: 'SELECT ma.nombre AS marca, COUNT(*) AS total FROM moto m JOIN marca ma ON m.id_marca = ma.id_marca GROUP BY ma.nombre' 
        },
        { 
            id: 3,  
            nombre: '3. Inventario con alertas (stock bajo)',                 
            sql: 'SELECT m.modelo, ma.nombre AS marca, i.stock_disponible, i.stock_minimo FROM inventario i JOIN moto m ON i.id_moto = m.id_moto JOIN marca ma ON m.id_marca = ma.id_marca WHERE i.stock_disponible <= i.stock_minimo' 
        },
        { 
            id: 4,  
            nombre: '4. Ventas completadas',                     
            sql: "SELECT v.id_venta, v.fecha_venta, CONCAT(c.nombre, ' ', c.apellido) AS cliente, v.total FROM venta v JOIN cliente c ON v.id_cliente = c.id_cliente WHERE v.estado = 'COMPLETADA' ORDER BY v.fecha_venta DESC LIMIT 20" 
        },
        { 
            id: 5,  
            nombre: '5. Ranking de vendedores (por número de ventas)',                  
            sql: 'SELECT e.nombre, e.apellido, COUNT(v.id_venta) AS ventas_realizadas FROM empleado e LEFT JOIN venta v ON e.id_empleado = v.id_empleado GROUP BY e.id_empleado ORDER BY ventas_realizadas DESC' 
        },
        { 
            id: 6,  
            nombre: '6. Motos sin stock',                        
            sql: 'SELECT m.modelo, ma.nombre AS marca FROM moto m JOIN marca ma ON m.id_marca = ma.id_marca JOIN inventario i ON m.id_moto = i.id_moto WHERE i.stock_disponible = 0' 
        },
        { 
            id: 7,  
            nombre: '7. Top 5 clientes con más compras',                    
            sql: 'SELECT c.cedula, c.nombre, c.apellido, COUNT(v.id_venta) AS ventas FROM cliente c JOIN venta v ON c.id_cliente = v.id_cliente GROUP BY c.id_cliente ORDER BY ventas DESC LIMIT 5' 
        },
        { 
            id: 8,  
            nombre: '8. Moto más vendida',                       
            sql: 'SELECT mo.modelo, ma.nombre AS marca, SUM(dv.cantidad) AS unidades FROM detalle_venta dv JOIN moto mo ON dv.id_moto = mo.id_moto JOIN marca ma ON mo.id_marca = ma.id_marca GROUP BY mo.id_moto ORDER BY unidades DESC LIMIT 1' 
        },
        { 
            id: 9,  
            nombre: '9. Total ventas por forma de pago',         
            sql: 'SELECT forma_pago, COUNT(*) AS cantidad_ventas, SUM(total) AS monto_total FROM venta GROUP BY forma_pago' 
        },
        { 
            id: 10, 
            nombre: '10. Motos por categoría',                    
            sql: 'SELECT ca.nombre AS categoria, COUNT(*) AS total FROM moto m JOIN categoria_moto ca ON m.id_categoria = ca.id_categoria GROUP BY ca.nombre' 
        },
        { 
            id: 11, 
            nombre: '11. Empleados activos',                      
            sql: "SELECT id_empleado, nombre, apellido, cargo, correo FROM empleado WHERE activo = 1" 
        },
        { 
            id: 12, 
            nombre: '12. Usuarios por rol',                       
            sql: 'SELECT rol, COUNT(*) AS total FROM usuario GROUP BY rol' 
        },
        { 
            id: 13, 
            nombre: '13. Ventas del mes actual',                  
            sql: 'SELECT v.id_venta, v.fecha_venta, v.total FROM venta v WHERE MONTH(v.fecha_venta) = MONTH(CURDATE()) AND YEAR(v.fecha_venta) = YEAR(CURDATE())' 
        },
        { 
            id: 14, 
            nombre: '14. Motos caras (precio > 10 millones)',       
            sql: 'SELECT m.modelo, ma.nombre AS marca, m.precio_base FROM moto m JOIN marca ma ON m.id_marca = ma.id_marca WHERE m.precio_base > 10000000 ORDER BY m.precio_base DESC' 
        },
        { 
            id: 15, 
            nombre: '15. Clientes mayores de edad ( > 18 años )',   
            sql: 'SELECT cedula, nombre, apellido, fecha_nacimiento FROM cliente WHERE fecha_nacimiento <= DATE_SUB(CURDATE(), INTERVAL 18 YEAR)' 
        },
        { 
            id: 16, 
            nombre: '16. Detalle de últimas 20 ventas',            
            sql: 'SELECT v.id_venta, dv.cantidad, dv.precio_unitario, dv.subtotal, mo.modelo FROM detalle_venta dv JOIN venta v ON dv.id_venta = v.id_venta JOIN moto mo ON dv.id_moto = mo.id_moto ORDER BY v.id_venta DESC LIMIT 20' 
        },
        { 
            id: 17, 
            nombre: '17. Marcas con motos disponibles',           
            sql: 'SELECT DISTINCT ma.nombre FROM marca ma JOIN moto m ON ma.id_marca = m.id_marca JOIN inventario i ON m.id_moto = i.id_moto WHERE i.stock_disponible > 0' 
        },
        { 
            id: 18, 
            nombre: '18. Precio promedio por categoría',          
            sql: 'SELECT ca.nombre, ROUND(AVG(m.precio_base), 0) AS precio_promedio FROM moto m JOIN categoria_moto ca ON m.id_categoria = ca.id_categoria GROUP BY ca.nombre' 
        },
        { 
            id: 19, 
            nombre: '19. Ventas anuladas',                        
            sql: "SELECT v.id_venta, v.fecha_venta, v.total FROM venta v WHERE v.estado = 'ANULADA'" 
        },
        { 
            id: 20, 
            nombre: '20. Clientes que nunca han comprado',      
            sql: 'SELECT c.id_cliente, c.cedula, c.nombre, c.apellido FROM cliente c WHERE c.id_cliente NOT IN (SELECT DISTINCT v.id_cliente FROM venta v WHERE v.estado = "COMPLETADA")' 
        },
    ],

    init(container) {
        this.container = container;
        this.render();
    },

    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h4><i class="fas fa-database"></i> Consultas SQL del Proyecto</h4>
                    <small>20 consultas predefinidas - Solo SUPERADMIN</small>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <label class="form-label fw-bold">Seleccione una consulta</label>
                            <select class="form-control" id="selectConsulta">
                                <option value="">-- Seleccione una consulta --</option>
                                ${this.consultas.map(c =>
                                    `<option value="${c.id}">${c.nombre}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-4 d-flex align-items-end">
                            <button class="btn btn-success w-100" id="btnEjecutarConsulta">
                                <i class="fas fa-play"></i> Ejecutar Consulta
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label text-muted fw-bold">
                            <i class="fas fa-code"></i> Código SQL:
                        </label>
                        <pre id="sqlPreview" class="bg-dark text-light p-3 rounded"
                             style="font-size:13px; overflow-x:auto; max-height:150px;">Seleccione una consulta para ver el SQL</pre>
                    </div>
                    
                    <hr>
                    
                    <div id="consultaResultado">
                        <div class="alert alert-secondary text-center">
                            <i class="fas fa-info-circle"></i> Seleccione una consulta y presione "Ejecutar Consulta"
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        document.getElementById('selectConsulta').addEventListener('change', (e) => {
            const id = parseInt(e.target.value);
            const consulta = this.consultas.find(c => c.id === id);
            if (consulta) {
                document.getElementById('sqlPreview').textContent = consulta.sql;
            } else {
                document.getElementById('sqlPreview').textContent = 'Seleccione una consulta para ver el SQL';
            }
        });

        document.getElementById('btnEjecutarConsulta').addEventListener('click', () => {
            this.ejecutar();
        });
    },

    async ejecutar() {
        const select = document.getElementById('selectConsulta');
        const id = parseInt(select.value);
        
        if (!id) {
            this.mostrarMensaje('⚠️ Por favor, seleccione una consulta primero', 'warning');
            return;
        }

        const consulta = this.consultas.find(c => c.id === id);
        if (!consulta) {
            this.mostrarMensaje('❌ Consulta no encontrada', 'danger');
            return;
        }

        const divResultado = document.getElementById('consultaResultado');
        divResultado.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 text-muted">Ejecutando consulta...</p>
                <small class="text-muted">${consulta.sql.substring(0, 100)}...</small>
            </div>
        `;

        try {
            const response = await API.request('consultas.php', 'POST', { sql: consulta.sql });
            
            console.log('Respuesta del servidor:', response);
            
            if (!response) {
                this.mostrarMensaje('❌ No se recibió respuesta del servidor', 'danger');
                return;
            }
            
            if (response.success === false) {
                this.mostrarMensaje(`❌ Error: ${response.message || 'Error desconocido'}`, 'danger');
                return;
            }
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                this.mostrarTablaResultados(response.data, consulta.nombre);
            } else {
                this.mostrarMensaje(
                    '📭 La consulta no devolvió resultados. Puede que no haya datos en la tabla o la condición no se cumpla.',
                    'info'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje(`❌ Error de conexión: ${error.message || 'Revise que el backend esté corriendo'}`, 'danger');
        }
    },

    mostrarTablaResultados(data, titulo) {
        if (!data || data.length === 0) return;
        
        const columnas = Object.keys(data[0]);
        const divResultado = document.getElementById('consultaResultado');
        
        divResultado.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <strong>${titulo || 'Resultados'}</strong> - ${data.length} registro(s) encontrados
            </div>
            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                <table class="table table-bordered table-hover table-sm">
                    <thead class="table-dark" style="position: sticky; top: 0;">
                        <tr>
                            ${columnas.map(col => `<th>${col}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${columnas.map(col => `<td>${this.formatearValor(row[col])}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="text-muted mt-2">
                <i class="fas fa-info-circle"></i> Total: ${data.length} registro(s) | ${columnas.length} columna(s)
            </div>
        `;
    },

    formatearValor(valor) {
        if (valor === null || valor === undefined) return '<span class="text-muted fst-italic">NULL</span>';
        if (typeof valor === 'number') return valor.toLocaleString('es-CO');
        if (valor instanceof Date || (typeof valor === 'string' && valor.match(/^\d{4}-\d{2}-\d{2}/))) {
            try {
                return new Date(valor).toLocaleDateString('es-CO');
            } catch(e) {
                return valor;
            }
        }
        if (typeof valor === 'string' && valor.length > 100) {
            return valor.substring(0, 100) + '...';
        }
        return valor;
    },

    mostrarMensaje(mensaje, tipo = 'info') {
        const divResultado = document.getElementById('consultaResultado');
        const iconos = {
            success: 'fa-check-circle',
            danger: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        divResultado.innerHTML = `
            <div class="alert alert-${tipo}">
                <i class="fas ${iconos[tipo] || 'fa-info-circle'}"></i>
                ${mensaje}
            </div>
        `;
    }
};