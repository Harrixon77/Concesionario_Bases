<?php
// backend/api/empleados.php
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
                $query = "SELECT e.*, 
                          (SELECT COUNT(*) FROM usuario u WHERE u.id_empleado = e.id_empleado) as tiene_usuario
                          FROM empleado e
                          ORDER BY e.id_empleado DESC";
                $stmt = $db->prepare($query);
                $stmt->execute();
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            $db->beginTransaction();
            
            try {
                // Guardar empleado
                if ($data->id_empleado) {
                    $query = "UPDATE empleado SET 
                              cedula = :cedula, nombre = :nombre, apellido = :apellido,
                              cargo = :cargo, correo = :correo, fecha_ingreso = :fecha_ingreso,
                              activo = :activo, id_ciudad = 1
                              WHERE id_empleado = :id";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':id', $data->id_empleado);
                } else {
                    $query = "INSERT INTO empleado (cedula, nombre, apellido, cargo, correo, fecha_ingreso, activo, id_ciudad)
                            VALUES (:cedula, :nombre, :apellido, :cargo, :correo, :fecha_ingreso, :activo, 1)";
                    $stmt = $db->prepare($query);
                }
                
                $stmt->bindParam(':cedula', $data->cedula);
                $stmt->bindParam(':nombre', $data->nombre);
                $stmt->bindParam(':apellido', $data->apellido);
                $stmt->bindParam(':cargo', $data->cargo);
                $stmt->bindParam(':correo', $data->correo);
                $stmt->bindParam(':fecha_ingreso', $data->fecha_ingreso);
                $stmt->bindParam(':activo', $data->activo);
                $stmt->execute();
                
                $id_empleado = $data->id_empleado ? $data->id_empleado : $db->lastInsertId();
                
                // Crear usuario si se proporcionaron credenciales
                if (!empty($data->username) && !empty($data->password) && !empty($data->rol)) {
                    $check = $db->prepare("SELECT id_usuario FROM usuario WHERE username = :username");
                    $check->bindParam(':username', $data->username);
                    $check->execute();
                    
                    if ($check->rowCount() == 0) {
                        $userQuery = "INSERT INTO usuario (id_empleado, username, password_hash, rol, activo)
                                    VALUES (:id_empleado, :username, SHA2(:password, 256), :rol, 1)";
                        $userStmt = $db->prepare($userQuery);
                        $userStmt->bindParam(':id_empleado', $id_empleado);
                        $userStmt->bindParam(':username', $data->username);
                        $userStmt->bindParam(':password', $data->password);
                        $userStmt->bindParam(':rol', $data->rol);
                        $userStmt->execute();
                    }
                }
                
                $db->commit();
                echo json_encode(['success' => true, 'message' => 'Empleado guardado']);
                
            } catch(Exception $e) {
                $db->rollBack();
                echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
            }
            break;
            
        case 'DELETE':
            if ($action === 'delete') {
                $data = json_decode(file_get_contents("php://input"));
                
                // Primero verificar si tiene usuario
                $check = $db->prepare("SELECT id_usuario FROM usuario WHERE id_empleado = :id");
                $check->bindParam(':id', $data->id_empleado);
                $check->execute();
                
                if ($check->rowCount() > 0) {
                    echo json_encode(['success' => false, 'message' => 'Elimine primero el usuario asociado']);
                    exit;
                }
                
                $query = "DELETE FROM empleado WHERE id_empleado = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $data->id_empleado);
                
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Empleado eliminado']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error al eliminar']);
                }
            }
            break;
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>