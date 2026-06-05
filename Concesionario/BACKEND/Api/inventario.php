<?php
// BACKEND/Api/inventario.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

        case 'all':
            $stmt = $db->prepare("
                SELECT i.id_inventario,
                       CONCAT(ma.nombre, ' ', m.modelo, ' ', m.anio) AS moto,
                       m.color,
                       i.stock_disponible,
                       i.stock_minimo,
                       i.fecha_actualizacion,
                       m.id_moto
                FROM inventario i
                JOIN moto m   ON i.id_moto  = m.id_moto
                JOIN marca ma ON m.id_marca = ma.id_marca
                WHERE m.activa = 1
                ORDER BY ma.nombre, m.modelo
            ");
            $stmt->execute();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'alertas':
            $stmt = $db->prepare("
                SELECT i.id_inventario,
                       CONCAT(ma.nombre, ' ', m.modelo, ' ', m.anio) AS moto,
                       m.color,
                       i.stock_disponible,
                       i.stock_minimo,
                       CASE
                           WHEN i.stock_disponible = 0                THEN 'SIN_STOCK'
                           WHEN i.stock_disponible <= i.stock_minimo  THEN 'STOCK_BAJO'
                           ELSE 'OK'
                       END AS estado
                FROM inventario i
                JOIN moto m   ON i.id_moto  = m.id_moto
                JOIN marca ma ON m.id_marca = ma.id_marca
                WHERE i.stock_disponible <= i.stock_minimo
                  AND m.activa = 1
                ORDER BY i.stock_disponible ASC
            ");
            $stmt->execute();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'movimiento':
            $data = json_decode(file_get_contents("php://input"), true);
            $id   = intval($data['id_inventario'] ?? 0);
            $tipo = $data['tipo'] ?? '';
            $cant = intval($data['cantidad'] ?? 0);

            if (!$id || !in_array($tipo, ['entrada', 'salida']) || $cant <= 0) {
                echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
                break;
            }

            if ($tipo === 'salida') {
                $check = $db->prepare("SELECT stock_disponible FROM inventario WHERE id_inventario = ?");
                $check->execute([$id]);
                $actual = $check->fetchColumn();
                if ($actual < $cant) {
                    echo json_encode(['success' => false,
                        'message' => "Stock insuficiente. Disponible: $actual unidades"]);
                    break;
                }
            }

            $op = $tipo === 'entrada' ? '+' : '-';
            $stmt = $db->prepare("
                UPDATE inventario
                SET stock_disponible = stock_disponible $op ?,
                    fecha_actualizacion = NOW()
                WHERE id_inventario = ?
            ");
            $stmt->execute([$cant, $id]);
            echo json_encode(['success' => true,
                'message' => ucfirst($tipo) . ' registrada: ' . $cant . ' unidades']);
            break;

        case 'update':
            $data   = json_decode(file_get_contents("php://input"), true);
            $id     = intval($data['id_inventario'] ?? 0);
            $stock  = intval($data['stock_disponible'] ?? 0);
            $minimo = intval($data['stock_minimo'] ?? 2);

            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID requerido']);
                break;
            }

            $stmt = $db->prepare("
                UPDATE inventario
                SET stock_disponible = ?,
                    stock_minimo = ?,
                    fecha_actualizacion = NOW()
                WHERE id_inventario = ?
            ");
            $stmt->execute([$stock, $minimo, $id]);
            echo json_encode(['success' => true, 'message' => 'Stock actualizado correctamente']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error BD: ' . $e->getMessage()]);
}
?>