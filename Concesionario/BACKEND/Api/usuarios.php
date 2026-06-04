<?php
// backend/api/usuarios.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if ($action === 'all') {
                $query = "SELECT u.*, CONCAT(e.nombre, ' ', e.apellido) as empleado_nombre 
                          FROM usuario u
                          JOIN empleado e ON u.id_empleado = e.id_empleado
                          ORDER BY u.id_usuario DESC";
                $stmt = $db->prepare($query);
                $stmt->execute();
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            elseif ($action === 'empleados_sin_usuario') {
                $query = "SELECT e.* FROM empleado e 
                          LEFT JOIN usuario u ON e.id_empleado = u.id_empleado
                          WHERE u.id_usuario IS NULL AND e.activo = 1";
                $stmt = $db->prepare($query);
                $stmt->execute();
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            if ($action === 'save') {
                // Verificar si ya existe el username
                $check = $db->prepare("SELECT id_usuario FROM usuario WHERE username = :username");
                $check->bindParam(':username', $data->username);
                $check->execute();
                
                if ($check->rowCount() > 0) {
                    echo json_encode(['success' => false, 'message' => 'El username ya existe']);
                    exit;
                }
                
                $query = "INSERT INTO usuario (id_empleado, username, password_hash, rol, activo)
                          VALUES (:id_empleado, :username, SHA2(:password, 256), :rol, :activo)";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id_empleado', $data->id_empleado);
                $stmt->bindParam(':username', $data->username);
                $stmt->bindParam(':password', $data->password);
                $stmt->bindParam(':rol', $data->rol);
                $stmt->bindParam(':activo', $data->activo);
                
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Usuario creado']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error al crear usuario']);
                }
            }
            elseif ($action === 'change_password') {
                $query = "UPDATE usuario SET password_hash = SHA2(:password, 256) WHERE id_usuario = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':password', $data->password);
                $stmt->bindParam(':id', $data->id_usuario);
                
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Contraseña actualizada']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error al cambiar contraseña']);
                }
            }
            break;
            
        case 'DELETE':
            if ($action === 'delete') {
                $data = json_decode(file_get_contents("php://input"));
                $query = "DELETE FROM usuario WHERE id_usuario = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $data->id_usuario);
                
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Usuario eliminado']);
                } else {
                    echo json_encode(['success' false, 'message' => 'Error al eliminar']);
                }
            }
            break;
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>