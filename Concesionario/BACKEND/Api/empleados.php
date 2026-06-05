<?php
// BACKEND/Api/empleados.php
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

        case 'all':
            $stmt = $db->query("
                SELECT e.*,
                       ci.nombre AS ciudad,
                       CASE WHEN u.id_usuario IS NOT NULL THEN 1 ELSE 0 END AS tiene_usuario
                FROM empleado e
                JOIN ciudad ci ON e.id_ciudad = ci.id_ciudad
                LEFT JOIN usuario u ON e.id_empleado = u.id_empleado
                ORDER BY e.nombre
            ");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'save':
            $d = json_decode(file_get_contents("php://input"), true);

            if ($d['id_empleado']) {
                // Actualizar
                $stmt = $db->prepare("
                    UPDATE empleado SET cedula=?, nombre=?, apellido=?, cargo=?,
                    correo=?, fecha_ingreso=?, activo=?
                    WHERE id_empleado=?
                ");
                $stmt->execute([
                    $d['cedula'], $d['nombre'], $d['apellido'], $d['cargo'],
                    $d['correo'], $d['fecha_ingreso'], $d['activo'], $d['id_empleado']
                ]);
                $idEmpleado = $d['id_empleado'];
                $msg = 'Empleado actualizado correctamente';
            } else {
                // Crear nuevo
                $stmt = $db->prepare("
                    INSERT INTO empleado (cedula, nombre, apellido, cargo, id_ciudad, correo, fecha_ingreso, activo)
                    VALUES (?, ?, ?, ?, 1, ?, ?, ?)
                ");
                $stmt->execute([
                    $d['cedula'], $d['nombre'], $d['apellido'], $d['cargo'],
                    $d['correo'], $d['fecha_ingreso'], $d['activo'] ?? 1
                ]);
                $idEmpleado = $db->lastInsertId();
                $msg = 'Empleado registrado correctamente';
            }

            // Si viene username y password, crear usuario también
            if (!empty($d['username']) && !empty($d['password']) && !empty($d['rol'])) {
                $checkUser = $db->prepare("SELECT id_usuario FROM usuario WHERE id_empleado = ?");
                $checkUser->execute([$idEmpleado]);
                if (!$checkUser->fetch()) {
                    $db->prepare("
                        INSERT INTO usuario (id_empleado, username, password_hash, rol, activo)
                        VALUES (?, ?, SHA2(?, 256), ?, 1)
                    ")->execute([$idEmpleado, $d['username'], $d['password'], $d['rol']]);
                }
            }

            echo json_encode(['success' => true, 'message' => $msg]);
            break;

        case 'delete':
            $d = json_decode(file_get_contents("php://input"), true);
            // Verificar si tiene ventas
            $check = $db->prepare("SELECT COUNT(*) FROM venta WHERE id_empleado = ?");
            $check->execute([$d['id_empleado']]);
            if ($check->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'No se puede eliminar: tiene ventas registradas']);
                break;
            }
            $db->prepare("DELETE FROM usuario  WHERE id_empleado = ?")->execute([$d['id_empleado']]);
            $db->prepare("DELETE FROM empleado WHERE id_empleado = ?")->execute([$d['id_empleado']]);
            echo json_encode(['success' => true, 'message' => 'Empleado eliminado correctamente']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>