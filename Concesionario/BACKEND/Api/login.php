<?php
// backend/api/login.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        // Usar el procedimiento almacenado sp_login
        $stmt = $db->prepare("CALL sp_login(:username, :password, @rol, @id_empleado)");
        $stmt->bindParam(':username', $data->username);
        $stmt->bindParam(':password', $data->password);
        $stmt->execute();
        
        // Obtener los valores de salida
        $result = $db->query("SELECT @rol as rol, @id_empleado as id_empleado")->fetch(PDO::FETCH_ASSOC);
        
        if ($result['rol']) {
            // Actualizar último acceso
            $update = $db->prepare("UPDATE usuario SET ultimo_acceso = NOW() WHERE username = :username");
            $update->bindParam(':username', $data->username);
            $update->execute();
            
            echo json_encode([
                'success' => true,
                'rol' => $result['rol'],
                'id_empleado' => $result['id_empleado']
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Usuario o contraseña incorrectos'
            ]);
        }
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error en el servidor: ' . $e->getMessage()
        ]);
    }
}
?>