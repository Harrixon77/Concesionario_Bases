// FRONT/js/modules/reportes.js

const reportesModule = {
    _tipoActual: 'ventas',
    _ultimosDatos: [],

    init(container) {
        this.container = container;
        this.render();
        this.setFechasDefault();
    },

    render() {
        this.container.innerHTML = `
            <!-- Tabs de tipo de reporte -->
            <ul class="nav nav-tabs mb-3" id="reportesTabs">
                <li class="nav-item">
                    <a class="nav-link active" href="#" onclick="reportesModule.setTipo('ventas', this)">
                        <i class="fas fa-shopping-cart"></i> Ventas
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="reportesModule.setTipo('inventario', this)">
                        <i class="fas fa-boxes"></i> Inventario
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="reportesModule.setTipo('motos', this)">
                        <i class="fas fa-motorcycle"></i> Motos más Vendidas
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="reportesModule.setTipo('clientes', this)">
                        <i class="fas fa-users"></i> Clientes
                    </a>
                </li>
            </ul>

            <!-- Panel de filtros -->
            <div class="card mb-3">
                <div class="card-body py-2">
                    <div class="row g-2 align-items-end">
                        <div class="col-md-3" id="filtroFechaInicioWrap">
                            <label class="form-label small mb-1">Fecha Inicio</label>
                            <input type="date" id="fechaInicio" class="form-control form-control-sm">
                        </div>
                        <div class="col-md-3" id="filtroFechaFinWrap">
                            <label class="form-label small mb-1">Fecha Fin</label>
                            <input type="date" id="fechaFin" class="form-control form-control-sm">
                        </div>
                        <div class="col-md-2" id="filtroFormaPagoWrap" style="display:none;">
                            <label class="form-label small mb-1">Forma de Pago</label>
                            <select id="filtroFormaPago" class="form-select form-select-sm">
                                <option value="">Todas</option>
                                <option value="contado">Contado</option>
                                <option value="credito">Crédito</option>
                                <option value="financiado">Financiado</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-primary btn-sm w-100" onclick="reportesModule.generar()">
                                <i class="fas fa-search"></i> Generar
                            </button>
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-outline-secondary btn-sm w-100" onclick="reportesModule.exportarCSV()"
                                id="btnExportar" disabled>
                                <i class="fas fa-file-csv"></i> Exportar CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tarjetas de resumen -->
            <div class="row g-2 mb-3" id="resumenCards" style="display:none;"></div>

            <!-- Tabla de resultados -->
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center py-2">
                    <h6 class="mb-0" id="reporteTitulo">
                        <i class="fas fa-chart-bar"></i> Resultados
                    </h6>
                    <span class="badge bg-secondary" id="reporteConteo"></span>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover mb-0">
                            <thead class="table-dark" id="reporteThead"></thead>
                            <tbody id="reportesTableBody">
                                <tr><td colspan="7" class="text-center text-muted py-5">
                                    <i class="fas fa-chart-bar fa-3x mb-3 d-block opacity-25"></i>
                                    Seleccione un tipo de reporte y un rango de fechas
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer text-end fw-bold" id="reporteTotal" style="display:none;"></div>
            </div>
        `;
    },

    setFechasDefault() {
        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const fi = document.getElementById('fechaInicio');
        const ff = document.getElementById('fechaFin');
        if (fi) fi.value = primerDiaMes.toISOString().split('T')[0];
        if (ff) ff.value = hoy.toISOString().split('T')[0];
    },

    setTipo(tipo, el) {
        this._tipoActual = tipo;
        // Activar tab
        document.querySelectorAll('#reportesTabs .nav-link').forEach(a => a.classList.remove('active'));
        if (el) el.classList.add('active');

        // Mostrar/ocultar filtros según tipo
        const fechasVisibles = tipo !== 'inventario';
        ['filtroFechaInicioWrap','filtroFechaFinWrap'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = fechasVisibles ? '' : 'none';
        });
        const pagoWrap = document.getElementById('filtroFormaPagoWrap');
        if (pagoWrap) pagoWrap.style.display = tipo === 'ventas' ? '' : 'none';

        // Limpiar tabla y resumen
        document.getElementById('reportesTableBody').innerHTML =
            `<tr><td colspan="9" class="text-center text-muted py-4">
                Presione "Generar" para ver el reporte</td></tr>`;
        document.getElementById('reporteThead').innerHTML = '';
        document.getElementById('resumenCards').style.display = 'none';
        const total = document.getElementById('reporteTotal');
        if (total) total.style.display = 'none';
        document.getElementById('reporteConteo').textContent = '';
        const btnExp = document.getElementById('btnExportar');
        if (btnExp) btnExp.disabled = true;
        return false;
    },

    async generar() {
        const tipo   = this._tipoActual;
        const inicio = document.getElementById('fechaInicio')?.value || '';
        const fin    = document.getElementById('fechaFin')?.value || '';
        const pago   = document.getElementById('filtroFormaPago')?.value || '';

        if (tipo !== 'inventario' && (!inicio || !fin)) {
            alert('Seleccione ambas fechas'); return;
        }
        if (inicio && fin && inicio > fin) {
            alert('La fecha inicio no puede ser mayor a la fecha fin'); return;
        }

        const tbody = document.getElementById('reportesTableBody');
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4">
            <i class="fas fa-spinner fa-spin fa-2x"></i><br>
            <span class="text-muted mt-2 d-block">Generando reporte...</span></td></tr>`;

        try {
            let url = '';
            if (tipo === 'ventas')     url = `reportes.php?action=ventas&inicio=${inicio}&fin=${fin}&forma_pago=${pago}`;
            if (tipo === 'inventario') url = `reportes.php?action=inventario`;
            if (tipo === 'motos')      url = `reportes.php?action=motos_vendidas&inicio=${inicio}&fin=${fin}`;
            if (tipo === 'clientes')   url = `reportes.php?action=clientes&inicio=${inicio}&fin=${fin}`;

            const response = await API.request(url);
            if (response.success) {
                this._ultimosDatos = response.data || [];
                this[`render_${tipo}`](this._ultimosDatos);
                document.getElementById('reporteConteo').textContent =
                    `${this._ultimosDatos.length} registros`;
                const btnExp = document.getElementById('btnExportar');
                if (btnExp) btnExp.disabled = this._ultimosDatos.length === 0;
            } else {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-circle"></i> ${response.message || 'Sin datos'}</td></tr>`;
            }
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">
                <i class="fas fa-exclamation-circle"></i> Error al generar el reporte</td></tr>`;
        }
    },

    // ── Render Ventas ──────────────────────────────────────────────
    render_ventas(data) {
        document.getElementById('reporteTitulo').innerHTML =
            '<i class="fas fa-shopping-cart"></i> Reporte de Ventas';
        document.getElementById('reporteThead').innerHTML = `<tr>
            <th>ID</th><th>Fecha</th><th>Cliente</th><th>Moto</th>
            <th class="text-center">Cant.</th><th class="text-end">Subtotal</th>
            <th>Forma Pago</th><th>Vendedor</th></tr>`;

        const tbody = document.getElementById('reportesTableBody');
        if (!data.length) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">
                No hay ventas en este período</td></tr>`;
            document.getElementById('reporteTotal').style.display = 'none';
            document.getElementById('resumenCards').style.display = 'none';
            return;
        }

        let total = 0;
        const conteo = { contado: 0, credito: 0, financiado: 0 };
        tbody.innerHTML = data.map(r => {
            const sub = parseFloat(r.subtotal) || 0;
            total += sub;
            const fp = (r.forma_pago || '').toLowerCase();
            if (conteo[fp] !== undefined) conteo[fp]++;
            const badgePago = r.forma_pago === 'contado'
                ? 'bg-success' : r.forma_pago === 'credito' ? 'bg-warning text-dark' : 'bg-info text-dark';
            return `<tr>
                <td><small class="text-muted">#${r.id_venta}</small></td>
                <td>${new Date(r.fecha_venta).toLocaleDateString('es-CO')}</td>
                <td>${r.cliente || '-'}</td>
                <td>${r.moto_vendida || '-'}</td>
                <td class="text-center">${r.cantidad}</td>
                <td class="text-end fw-bold">$${sub.toLocaleString('es-CO')}</td>
                <td><span class="badge ${badgePago}">${r.forma_pago || '-'}</span></td>
                <td><small>${r.vendedor || '-'}</small></td>
            </tr>`;
        }).join('');

        const totalEl = document.getElementById('reporteTotal');
        totalEl.innerHTML = `<span class="text-muted me-3">Total de ventas: ${data.length}</span>
            Total: <span class="text-success">$${total.toLocaleString('es-CO')}</span>`;
        totalEl.style.display = '';

        // Resumen
        this.mostrarResumen([
            { label: 'Total Ingresos', valor: `$${total.toLocaleString('es-CO')}`, color: 'success', icon: 'fa-dollar-sign' },
            { label: 'Promedio por Venta', valor: `$${Math.round(total / data.length).toLocaleString('es-CO')}`, color: 'primary', icon: 'fa-chart-line' },
            { label: 'Ventas al Contado', valor: conteo.contado, color: 'info', icon: 'fa-money-bill' },
            { label: 'Ventas a Crédito', valor: conteo.credito + conteo.financiado, color: 'warning', icon: 'fa-credit-card' },
        ]);
    },

    // ── Render Inventario ──────────────────────────────────────────
    render_inventario(data) {
        document.getElementById('reporteTitulo').innerHTML =
            '<i class="fas fa-boxes"></i> Estado del Inventario';
        document.getElementById('reporteThead').innerHTML = `<tr>
            <th>Moto</th><th>Color</th>
            <th class="text-center">Stock Actual</th>
            <th class="text-center">Stock Mínimo</th>
            <th class="text-center">Estado</th>
            <th>Última Actualización</th></tr>`;

        const tbody = document.getElementById('reportesTableBody');
        document.getElementById('reporteTotal').style.display = 'none';

        if (!data.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">
                Sin datos de inventario</td></tr>`;
            document.getElementById('resumenCards').style.display = 'none';
            return;
        }

        const ok   = data.filter(i => i.stock_disponible >  i.stock_minimo).length;
        const bajo = data.filter(i => i.stock_disponible >  0 && i.stock_disponible <= i.stock_minimo).length;
        const sin  = data.filter(i => i.stock_disponible == 0).length;

        tbody.innerHTML = data.map(i => {
            let badge, rowClass = '';
            if (i.stock_disponible == 0) {
                badge = '<span class="badge bg-danger">SIN STOCK</span>'; rowClass = 'table-danger';
            } else if (i.stock_disponible <= i.stock_minimo) {
                badge = '<span class="badge bg-warning text-dark">STOCK BAJO</span>'; rowClass = 'table-warning';
            } else {
                badge = '<span class="badge bg-success">OK</span>';
            }
            return `<tr class="${rowClass}">
                <td><strong>${i.moto || '-'}</strong></td>
                <td>${i.color || '-'}</td>
                <td class="text-center fw-bold">${i.stock_disponible}</td>
                <td class="text-center text-muted">${i.stock_minimo}</td>
                <td class="text-center">${badge}</td>
                <td><small>${i.fecha_actualizacion
                    ? new Date(i.fecha_actualizacion).toLocaleDateString('es-CO') : 'N/A'}</small></td>
            </tr>`;
        }).join('');

        this.mostrarResumen([
            { label: 'Total Modelos', valor: data.length, color: 'secondary', icon: 'fa-motorcycle' },
            { label: 'Stock Normal', valor: ok, color: 'success', icon: 'fa-check-circle' },
            { label: 'Stock Bajo', valor: bajo, color: 'warning', icon: 'fa-exclamation-triangle' },
            { label: 'Sin Stock', valor: sin, color: 'danger', icon: 'fa-times-circle' },
        ]);
    },

    // ── Render Motos Más Vendidas ──────────────────────────────────
    render_motos(data) {
        document.getElementById('reporteTitulo').innerHTML =
            '<i class="fas fa-trophy"></i> Motos Más Vendidas';
        document.getElementById('reporteThead').innerHTML = `<tr>
            <th class="text-center">#</th>
            <th>Moto</th>
            <th>Categoría</th>
            <th class="text-center">Unidades Vendidas</th>
            <th class="text-end">Total Ingresos</th>
            <th class="text-end">Precio Promedio</th></tr>`;

        const tbody = document.getElementById('reportesTableBody');
        document.getElementById('reporteTotal').style.display = 'none';

        if (!data.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">
                No hay ventas en este período</td></tr>`;
            document.getElementById('resumenCards').style.display = 'none';
            return;
        }

        const medallas = ['🥇','🥈','🥉'];
        let totalUnidades = 0, totalIngresos = 0;

        tbody.innerHTML = data.map((m, idx) => {
            const unidades = parseInt(m.total_vendidos) || 0;
            const ingresos = parseFloat(m.total_ingresos) || 0;
            totalUnidades += unidades;
            totalIngresos += ingresos;
            const prefijo = idx < 3 ? `<span title="Top ${idx+1}">${medallas[idx]}</span> ` : `${idx+1}.`;
            return `<tr>
                <td class="text-center">${prefijo}</td>
                <td><strong>${m.moto || m.modelo || '-'}</strong></td>
                <td><span class="badge bg-secondary">${m.categoria || '-'}</span></td>
                <td class="text-center fw-bold">${unidades}</td>
                <td class="text-end">$${ingresos.toLocaleString('es-CO')}</td>
                <td class="text-end text-muted">$${unidades > 0
                    ? Math.round(ingresos / unidades).toLocaleString('es-CO') : '0'}</td>
            </tr>`;
        }).join('');

        this.mostrarResumen([
            { label: 'Modelos Vendidos', valor: data.length, color: 'secondary', icon: 'fa-motorcycle' },
            { label: 'Unidades Totales', valor: totalUnidades, color: 'primary', icon: 'fa-shopping-cart' },
            { label: 'Ingresos Totales', valor: `$${totalIngresos.toLocaleString('es-CO')}`, color: 'success', icon: 'fa-dollar-sign' },
            { label: 'Modelo Top', valor: data[0]?.moto || data[0]?.modelo || '-', color: 'warning', icon: 'fa-trophy' },
        ]);
    },

    // ── Render Clientes ────────────────────────────────────────────
    render_clientes(data) {
        document.getElementById('reporteTitulo').innerHTML =
            '<i class="fas fa-users"></i> Reporte de Clientes';
        document.getElementById('reporteThead').innerHTML = `<tr>
            <th>Cliente</th><th>Documento</th><th>Ciudad</th>
            <th class="text-center">Compras</th>
            <th class="text-end">Total Comprado</th>
            <th>Última Compra</th></tr>`;

        const tbody = document.getElementById('reportesTableBody');
        document.getElementById('reporteTotal').style.display = 'none';

        if (!data.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">
                No hay clientes con compras en este período</td></tr>`;
            document.getElementById('resumenCards').style.display = 'none';
            return;
        }

        let totalComprado = 0;
        tbody.innerHTML = data.map(c => {
            const tc = parseFloat(c.total_comprado) || 0;
            totalComprado += tc;
            return `<tr>
                <td><strong>${c.nombre_completo || c.cliente || '-'}</strong></td>
                <td><small class="text-muted">${c.documento || '-'}</small></td>
                <td>${c.ciudad || '-'}</td>
                <td class="text-center"><span class="badge bg-primary">${c.total_compras || 0}</span></td>
                <td class="text-end fw-bold">$${tc.toLocaleString('es-CO')}</td>
                <td><small>${c.ultima_compra
                    ? new Date(c.ultima_compra).toLocaleDateString('es-CO') : '-'}</small></td>
            </tr>`;
        }).join('');

        const mejor = data.reduce((a, b) =>
            (parseFloat(a.total_comprado) > parseFloat(b.total_comprado)) ? a : b, data[0]);

        this.mostrarResumen([
            { label: 'Clientes Activos', valor: data.length, color: 'primary', icon: 'fa-users' },
            { label: 'Total Facturado', valor: `$${totalComprado.toLocaleString('es-CO')}`, color: 'success', icon: 'fa-dollar-sign' },
            { label: 'Promedio por Cliente', valor: `$${Math.round(totalComprado / data.length).toLocaleString('es-CO')}`, color: 'info', icon: 'fa-chart-pie' },
            { label: 'Mejor Cliente', valor: mejor?.nombre_completo || mejor?.cliente || '-', color: 'warning', icon: 'fa-star' },
        ]);
    },

    // ── Tarjetas Resumen ───────────────────────────────────────────
    mostrarResumen(items) {
        const cont = document.getElementById('resumenCards');
        if (!cont) return;
        cont.innerHTML = items.map(item => `
            <div class="col-md-3 col-6">
                <div class="card border-0 bg-${item.color} ${['warning','info'].includes(item.color) ? 'text-dark' : 'text-white'} h-100">
                    <div class="card-body py-2 d-flex align-items-center gap-2">
                        <i class="fas ${item.icon} fa-lg opacity-75"></i>
                        <div>
                            <div class="fw-bold">${item.valor}</div>
                            <div class="small opacity-75">${item.label}</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        cont.style.display = 'flex';
    },

    // ── Exportar CSV ───────────────────────────────────────────────
    exportarCSV() {
        if (!this._ultimosDatos.length) return;
        const keys = Object.keys(this._ultimosDatos[0]);
        const header = keys.join(',');
        const rows = this._ultimosDatos.map(row =>
            keys.map(k => {
                let val = row[k] ?? '';
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            }).join(',')
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${this._tipoActual}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
};