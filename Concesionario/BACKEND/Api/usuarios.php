<?php
// BACKEND/Api/usuarios.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';
$db     = (new Database())->getConnection();
$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        case 'all':
            $stmt = $db->query("
                SELECT u.id_usuario, u.username, u.rol, u.activo, u.ultimo_acceso,
                       CONCAT(e.nombre,' ',e.apellido) AS empleado_nombre,
                       e.cargo
                FROM usuario u
                JOIN empleado e ON u.id_empleado = e.id_empleado
                ORDER BY u.rol, e.nombre
            ");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        // Empleados que aún no tienen usuario asignado
        case 'empleados_sin_usuario':
            $stmt = $db->query("
                SELECT e.id_empleado, e.nombre, e.apellido, e.cargo
                FROM empleado e
                WHERE e.id_empleado NOT IN (SELECT id_empleado FROM usuario)
                AND e.activo = 1
                ORDER BY e.nombre
            ");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'save':
            $d = json_decode(file_get_contents("php://input"), true);
            $password = $d['password'] ?? '';
            $confirmPassword = $d['confirm_password'] ?? $password;

            if (strlen($password) < 6) {
                echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
                break;
            }

            // Verificar username único
            $check = $db->prepare("SELECT id_usuario FROM usuario WHERE username = ? AND id_usuario != ?");
            $check->execute([$d['username'], $d['id_usuario'] ?? 0]);
            if ($check->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Ese username ya está en uso']);
                break;
            }

            if ($d['id_usuario']) {
                $stmt = $db->prepare("
                    UPDATE usuario SET username=?, password_hash=SHA2(?,256), rol=?, activo=?
                    WHERE id_usuario=?
                ");
                $stmt->execute([$d['username'], $password, $d['rol'], $d['activo'], $d['id_usuario']]);
                echo json_encode(['success' => true, 'message' => 'Usuario actualizado correctamente']);
            } else {
                $stmt = $db->prepare("
                    INSERT INTO usuario (id_empleado, username, password_hash, rol, activo)
                    VALUES (?, ?, SHA2(?,256), ?, ?)
                ");
                $stmt->execute([$d['id_empleado'], $d['username'], $password, $d['rol'], $d['activo'] ?? 1]);
                echo json_encode(['success' => true, 'message' => 'Usuario creado correctamente']);
            }
            break;

        case 'change_password':
            $d = json_decode(file_get_contents("php://input"), true);
            if (strlen($d['password'] ?? '') < 6) {
                echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
                break;
            }
            $stmt = $db->prepare("UPDATE usuario SET password_hash=SHA2(?,256) WHERE id_usuario=?");
            $stmt->execute([$d['password'], $d['id_usuario']]);
            echo json_encode(['success' => true, 'message' => 'Contraseña actualizada correctamente']);
            break;

        case 'delete':
            $d = json_decode(file_get_contents("php://input"), true);
            $db->prepare("DELETE FROM usuario WHERE id_usuario = ?")->execute([$d['id_usuario']]);
            echo json_encode(['success' => true, 'message' => 'Usuario eliminado correctamente']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>