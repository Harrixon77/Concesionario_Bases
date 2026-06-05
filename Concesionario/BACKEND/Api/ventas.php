<?php
// BACKEND/Api/ventas.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';
$db     = (new Database())->getConnection();
$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        // Ventas recientes con datos legibles
        case 'recientes':
            $stmt = $db->query("
                SELECT v.id_venta, v.fecha_venta, v.forma_pago, v.total, v.estado,
                       CONCAT(c.nombre,' ',c.apellido) AS cliente
                FROM venta v
                JOIN cliente c ON v.id_cliente = c.id_cliente
                ORDER BY v.fecha_venta DESC
                LIMIT 20
            ");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        // Registrar venta completa con transacción
        case 'registrar':
            $d = json_decode(file_get_contents("php://input"), true);

            if (empty($d['id_cliente']) || empty($d['items'])) {
                echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
                break;
            }

            $db->beginTransaction();

            // Crear cabecera de venta
            $stmt = $db->prepare("
                INSERT INTO venta (id_cliente, id_empleado, forma_pago, estado, observaciones)
                VALUES (?, ?, ?, 'PENDIENTE', ?)
            ");
            $stmt->execute([
                $d['id_cliente'],
                $d['id_empleado'] ?? 1,
                $d['forma_pago']  ?? 'CONTADO',
                $d['observaciones'] ?? ''
            ]);
            $idVenta = $db->lastInsertId();

            // Insertar cada moto — el trigger descuenta el inventario automáticamente
            $stmtDet = $db->prepare("
                INSERT INTO detalle_venta (id_venta, id_moto, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            ");
            foreach ($d['items'] as $item) {
                $stmtDet->execute([
                    $idVenta,
                    $item['id_moto'],
                    $item['cantidad'],
                    $item['precio_unitario']
                ]);
            }

            // Marcar como completada
            $db->prepare("UPDATE venta SET estado='COMPLETADA' WHERE id_venta=?")
               ->execute([$idVenta]);

            $db->commit();
            echo json_encode([
                'success'  => true,
                'message'  => 'Venta registrada correctamente',
                'id_venta' => $idVenta
            ]);
            break;

        // Anular venta (el trigger restaura el inventario)
        case 'anular':
            $d = json_decode(file_get_contents("php://input"), true);
            $db->prepare("UPDATE venta SET estado='ANULADA' WHERE id_venta=?")
               ->execute([$d['id_venta']]);
            echo json_encode(['success' => true, 'message' => 'Venta anulada correctamente']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (PDOException $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>