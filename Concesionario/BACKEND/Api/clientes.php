<?php
// BACKEND/Api/clientes.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();
$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        // GET todos los clientes
        case 'all':
            $search = $_GET['search'] ?? '';
            if ($search) {
                $stmt = $db->prepare("
                    SELECT c.*, ci.nombre as ciudad
                    FROM cliente c
                    JOIN ciudad ci ON c.id_ciudad = ci.id_ciudad
                    WHERE c.nombre LIKE ? OR c.apellido LIKE ?
                       OR c.cedula LIKE ? OR c.correo LIKE ?
                    ORDER BY c.id_cliente DESC
                ");
                $s = "%$search%";
                $stmt->execute([$s, $s, $s, $s]);
            } else {
                $stmt = $db->prepare("
                    SELECT c.*, ci.nombre as ciudad
                    FROM cliente c
                    JOIN ciudad ci ON c.id_ciudad = ci.id_ciudad
                    ORDER BY c.id_cliente DESC
                ");
                $stmt->execute();
            }
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        // POST guardar nuevo cliente
        case 'save':
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $db->prepare("
                INSERT INTO cliente (cedula, nombre, apellido, correo, telefono, id_ciudad, fecha_nacimiento, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['cedula'],
                $data['nombre'],
                $data['apellido'],
                $data['correo'],
                $data['telefono'],
                $data['id_ciudad'],
                $data['fecha_nacimiento'],
                $data['activo'] ?? 1
            ]);
            echo json_encode(['success' => true, 'message' => 'Cliente guardado correctamente']);
            break;

        // PUT actualizar cliente
        case 'update':
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $db->prepare("
                UPDATE cliente SET cedula=?, nombre=?, apellido=?, correo=?,
                telefono=?, id_ciudad=?, fecha_nacimiento=?, activo=?
                WHERE id_cliente=?
            ");
            $stmt->execute([
                $data['cedula'], $data['nombre'], $data['apellido'],
                $data['correo'], $data['telefono'], $data['id_ciudad'],
                $data['fecha_nacimiento'], $data['activo'], $data['id_cliente']
            ]);
            echo json_encode(['success' => true, 'message' => 'Cliente actualizado correctamente']);
            break;

        // DELETE eliminar cliente
        case 'delete':
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $db->prepare("DELETE FROM cliente WHERE id_cliente = ?");
            $stmt->execute([$data['id_cliente']]);
            echo json_encode(['success' => true, 'message' => 'Cliente eliminado correctamente']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>