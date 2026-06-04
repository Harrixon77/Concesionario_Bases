<?php
// backend/api/ventas.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST':
            if ($action === 'registrar') {
                $data = json_decode(file_get_contents("php://input"));
                
                // Iniciar transacción
                $db->beginTransaction();
                
                try {
                    // Insertar cabecera de venta
                    $query = "INSERT INTO venta (id_cliente, id_empleado, forma_pago, observaciones, estado, fecha_venta)
                              VALUES (:cliente, :empleado, :forma_pago, :observaciones, 'COMPLETADA', NOW())";
                    
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':cliente', $data->id_cliente);
                    $stmt->bindParam(':empleado', $data->id_empleado);
                    $stmt->bindParam(':forma_pago', $data->forma_pago);
                    $stmt->bindParam(':observaciones', $data->observaciones);
                    $stmt->execute();
                    
                    $id_venta = $db->lastInsertId();
                    
                    // Insertar detalles de venta
                    foreach ($data->items as $item) {
                        $query = "INSERT INTO detalle_venta (id_venta, id_moto, cantidad, precio_unitario)
                                  VALUES (:id_venta, :id_moto, :cantidad, :precio)";
                        
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':id_venta', $id_venta);
                        $stmt->bindParam(':id_moto', $item->id_moto);
                        $stmt->bindParam(':cantidad', $item->cantidad);
                        $stmt->bindParam(':precio', $item->precio_unitario);
                        $stmt->execute();
                        
                        // Actualizar inventario (esto debería activar el trigger trg_descontar_inventario)
                        $update = $db->prepare("UPDATE inventario SET stock_disponible = stock_disponible - :cantidad WHERE id_moto = :id_moto");
                        $update->bindParam(':cantidad', $item->cantidad);
                        $update->bindParam(':id_moto', $item->id_moto);
                        $update->execute();
                    }
                    
                    // Actualizar total de la venta
                    $updateTotal = $db->prepare("UPDATE venta SET total = (SELECT SUM(subtotal) FROM detalle_venta WHERE id_venta = :id_venta) WHERE id_venta = :id_venta");
                    $updateTotal->bindParam(':id_venta', $id_venta);
                    $updateTotal->execute();
                    
                    $db->commit();
                    
                    echo json_encode(['success' => true, 'message' => 'Venta registrada', 'id_venta' => $id_venta]);
                    
                } catch(Exception $e) {
                    $db->rollBack();
                    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
                }
            }
            break;
            
        case 'GET':
            if ($action === 'recientes') {
                $query = "SELECT v.*, CONCAT(c.nombre, ' ', c.apellido) as cliente, 
                                 CONCAT(e.nombre, ' ', e.apellido) as vendedor
                          FROM venta v
                          JOIN cliente c ON v.id_cliente = c.id_cliente
                          JOIN empleado e ON v.id_empleado = e.id_empleado
                          WHERE v.estado = 'COMPLETADA'
                          ORDER BY v.fecha_venta DESC
                          LIMIT 10";
                
                $stmt = $db->prepare($query);
                $stmt->execute();
                $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($ventas);
            }
            break;
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>