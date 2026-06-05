<?php
// BACKEND/Api/consultas.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = $data['sql'] ?? '';
    
    if (empty($sql)) {
        echo json_encode(['success' => false, 'message' => 'No se proporcionó consulta SQL']);
        exit();
    }
    
    // Ejecutar la consulta
    $stmt = $db->prepare($sql);
    $stmt->execute();
    
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $resultados,
        'count' => count($resultados)
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en la consulta: ' . $e->getMessage()
    ]);
}
?>