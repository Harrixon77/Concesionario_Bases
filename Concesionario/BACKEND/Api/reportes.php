<?php
// BACKEND/Api/reportes.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit();
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        case 'ventas':
            $inicio    = $_GET['inicio']     ?? date('Y-m-01');
            $fin       = $_GET['fin']        ?? date('Y-m-d');
            $formaPago = $_GET['forma_pago'] ?? '';

            $sql = "
                SELECT v.id_venta,
                       v.fecha_venta,
                       CONCAT(c.nombre, ' ', c.apellido)  AS cliente,
                       CONCAT(ma.nombre, ' ', m.modelo)   AS moto_vendida,
                       dv.cantidad,
                       dv.subtotal,
                       v.forma_pago,
                       CONCAT(e.nombre, ' ', e.apellido)  AS vendedor
                FROM venta v
                JOIN detalle_venta dv ON v.id_venta    = dv.id_venta
                JOIN moto m           ON dv.id_moto    = m.id_moto
                JOIN marca ma         ON m.id_marca    = ma.id_marca
                JOIN cliente c        ON v.id_cliente  = c.id_cliente
                JOIN empleado e       ON v.id_empleado = e.id_empleado
                WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
                  AND v.estado = 'COMPLETADA'
            ";
            $params = [$inicio, $fin];

            if ($formaPago) {
                $sql .= " AND v.forma_pago = ?";
                $params[] = $formaPago;
            }
            $sql .= " ORDER BY v.fecha_venta DESC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'inventario':
            $stmt = $db->prepare("
                SELECT i.id_inventario,
                       CONCAT(ma.nombre, ' ', m.modelo, ' ', m.anio) AS moto,
                       m.color,
                       i.stock_disponible,
                       i.stock_minimo,
                       i.fecha_actualizacion,
                       CASE
                           WHEN i.stock_disponible = 0               THEN 'SIN_STOCK'
                           WHEN i.stock_disponible <= i.stock_minimo  THEN 'STOCK_BAJO'
                           ELSE 'OK'
                       END AS estado
                FROM inventario i
                JOIN moto m   ON i.id_moto  = m.id_moto
                JOIN marca ma ON m.id_marca = ma.id_marca
                WHERE m.activa = 1
                ORDER BY i.stock_disponible ASC, ma.nombre
            ");
            $stmt->execute();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'motos_vendidas':
            $inicio = $_GET['inicio'] ?? date('Y-m-01');
            $fin    = $_GET['fin']    ?? date('Y-m-d');

            $stmt = $db->prepare("
                SELECT CONCAT(ma.nombre, ' ', m.modelo, ' ', m.anio) AS moto,
                       cm.nombre                AS categoria,
                       SUM(dv.cantidad)         AS total_vendidos,
                       SUM(dv.subtotal)         AS total_ingresos
                FROM detalle_venta dv
                JOIN venta v        ON dv.id_venta      = v.id_venta
                JOIN moto m         ON dv.id_moto       = m.id_moto
                JOIN marca ma       ON m.id_marca        = ma.id_marca
                JOIN categoria_moto cm ON m.id_categoria = cm.id_categoria
                WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
                  AND v.estado = 'COMPLETADA'
                GROUP BY m.id_moto, ma.nombre, m.modelo, m.anio, cm.nombre
                ORDER BY total_vendidos DESC
                LIMIT 20
            ");
            $stmt->execute([$inicio, $fin]);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'clientes':
            $inicio = $_GET['inicio'] ?? date('Y-m-01');
            $fin    = $_GET['fin']    ?? date('Y-m-d');

            $stmt = $db->prepare("
                SELECT CONCAT(c.nombre, ' ', c.apellido) AS nombre_completo,
                       c.cedula                           AS documento,
                       ci.nombre                          AS ciudad,
                       COUNT(DISTINCT v.id_venta)         AS total_compras,
                       SUM(dv.subtotal)                   AS total_comprado,
                       MAX(v.fecha_venta)                 AS ultima_compra
                FROM cliente c
                JOIN venta v          ON c.id_cliente  = v.id_cliente
                JOIN detalle_venta dv ON v.id_venta    = dv.id_venta
                JOIN ciudad ci        ON c.id_ciudad   = ci.id_ciudad
                WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
                  AND v.estado = 'COMPLETADA'
                GROUP BY c.id_cliente, c.nombre, c.apellido, c.cedula, ci.nombre
                ORDER BY total_comprado DESC
            ");
            $stmt->execute([$inicio, $fin]);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'dashboard':
            $hoy      = date('Y-m-d');
            $mesInicio = date('Y-m-01');

            $s1 = $db->prepare("SELECT COUNT(*) FROM venta WHERE DATE(fecha_venta) = ? AND estado='COMPLETADA'");
            $s1->execute([$hoy]);

            $s2 = $db->prepare("SELECT COUNT(*) FROM cliente WHERE activo = 1");
            $s2->execute();

            $s3 = $db->prepare("SELECT COALESCE(SUM(stock_disponible), 0) FROM inventario");
            $s3->execute();

            $s4 = $db->prepare("SELECT COALESCE(SUM(total), 0) FROM venta WHERE DATE(fecha_venta) BETWEEN ? AND ? AND estado='COMPLETADA'");
            $s4->execute([$mesInicio, $hoy]);

            echo json_encode([
                'success'        => true,
                'ventas_hoy'     => (int)   $s1->fetchColumn(),
                'total_clientes' => (int)   $s2->fetchColumn(),
                'stock_total'    => (int)   $s3->fetchColumn(),
                'ventas_mes'     => (float) $s4->fetchColumn()
            ]);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error BD: ' . $e->getMessage()]);
}
?>