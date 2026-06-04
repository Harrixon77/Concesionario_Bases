<?php
// BACKEND/Api/tienda.php
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

        // Motos disponibles para la tienda (solo con stock > 0)
        case 'motos':
            $stmt = $db->query("
                SELECT m.id_moto, m.modelo, m.anio, m.cilindrada_cc,
                       m.precio_base, m.color,
                       ma.nombre AS marca,
                       ca.nombre AS categoria,
                       i.stock_disponible
                FROM moto m
                JOIN marca ma        ON m.id_marca      = ma.id_marca
                JOIN categoria_moto ca ON m.id_categoria = ca.id_categoria
                JOIN inventario i    ON m.id_moto        = i.id_moto
                WHERE m.activa = 1 AND i.stock_disponible > 0
                ORDER BY ma.nombre, m.modelo
            ");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        // Login de cliente (por correo + contraseña)
        case 'login':
            $data     = json_decode(file_get_contents("php://input"), true);
            $correo   = trim($data['correo']   ?? '');
            $password = trim($data['password'] ?? '');

            if (!$correo || !$password) {
                echo json_encode(['success' => false, 'message' => 'Completa todos los campos']);
                break;
            }

            $stmt = $db->prepare("
                SELECT id_cliente, cedula, nombre, apellido, correo, telefono
                FROM cliente
                WHERE correo = ? AND password_hash = SHA2(?, 256) AND activo = 1
            ");
            $stmt->execute([$correo, $password]);
            $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($cliente) {
                echo json_encode(['success' => true, 'cliente' => $cliente]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Correo o contraseña incorrectos']);
            }
            break;

        // Registro de nuevo cliente desde la tienda
        case 'registro':
            $data = json_decode(file_get_contents("php://input"), true);

            // Validar cédula colombiana
            if ($data['cedula'] < 10000000 || $data['cedula'] > 1299999999) {
                echo json_encode(['success' => false, 'message' => 'Cédula inválida']);
                break;
            }

            // Verificar si ya existe
            $check = $db->prepare("SELECT id_cliente FROM cliente WHERE cedula = ? OR correo = ?");
            $check->execute([$data['cedula'], $data['correo']]);
            if ($check->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Ya existe un cliente con esa cédula o correo']);
                break;
            }

            // Insertar con password hasheada
            $stmt = $db->prepare("
                INSERT INTO cliente
                    (cedula, nombre, apellido, correo, telefono, id_ciudad, fecha_nacimiento, password_hash, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, SHA2(?, 256), 1)
            ");
            $stmt->execute([
                $data['cedula'],
                $data['nombre'],
                $data['apellido'],
                $data['correo'],
                $data['telefono'],
                $data['id_ciudad'] ?? 1,
                $data['fecha_nacimiento'],
                $data['password']
            ]);

            $nuevoId = $db->lastInsertId();
            echo json_encode([
                'success' => true,
                'message' => 'Cuenta creada correctamente',
                'cliente' => [
                    'id_cliente' => $nuevoId,
                    'cedula'     => $data['cedula'],
                    'nombre'     => $data['nombre'],
                    'apellido'   => $data['apellido'],
                    'correo'     => $data['correo'],
                    'telefono'   => $data['telefono']
                ]
            ]);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>