<?php
// BACKEND/Api/motos.php
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

        // GET - todas las motos con marca y categoría
        case 'all':
            $stmt = $db->query("
                SELECT m.id_moto, m.modelo, m.anio, m.cilindrada_cc, i.stock_disponible,
                       m.precio_base, m.color, m.activa,
                       ma.nombre AS marca,
                       ca.nombre AS categoria
                FROM moto m
                LEFT JOIN inventario i ON m.id_moto = i.id_moto
                JOIN marca ma         ON m.id_marca      = ma.id_marca
                JOIN categoria_moto ca ON m.id_categoria = ca.id_categoria
                ORDER BY ma.nombre, m.modelo
            ");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        // POST - crear nueva moto
        case 'create':
            $d = json_decode(file_get_contents("php://input"), true);

            // Buscar o crear la marca
            $stmtMarca = $db->prepare("SELECT id_marca FROM marca WHERE nombre = ?");
            $stmtMarca->execute([$d['marca']]);
            $marca = $stmtMarca->fetch(PDO::FETCH_ASSOC);
            if (!$marca) {
                $db->prepare("INSERT INTO marca (nombre, pais_origen) VALUES (?, 'No especificado')")
                   ->execute([$d['marca']]);
                $idMarca = $db->lastInsertId();
            } else {
                $idMarca = $marca['id_marca'];
            }

            // Buscar o crear la categoría
            $stmtCat = $db->prepare("SELECT id_categoria FROM categoria_moto WHERE nombre = ?");
            $stmtCat->execute([$d['categoria']]);
            $cat = $stmtCat->fetch(PDO::FETCH_ASSOC);
            if (!$cat) {
                $db->prepare("INSERT INTO categoria_moto (nombre) VALUES (?)")->execute([$d['categoria']]);
                $idCat = $db->lastInsertId();
            } else {
                $idCat = $cat['id_categoria'];
            }

            // Insertar moto
            $stmt = $db->prepare("
                INSERT INTO moto (id_marca, id_categoria, modelo, anio, cilindrada_cc, precio_base, color)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$idMarca, $idCat, $d['modelo'], $d['anio'],
                            $d['cilindrada_cc'], $d['precio_base'], $d['color']]);

            $idMoto = $db->lastInsertId();

            // Crear registro en inventario con stock 0
            $db->prepare("INSERT INTO inventario (id_moto, stock_disponible, stock_minimo) VALUES (?, 0, 2)")
               ->execute([$idMoto]);

            echo json_encode(['success' => true, 'message' => 'Moto registrada correctamente']);
            break;

        // POST - actualizar moto
        case 'update':
            $d = json_decode(file_get_contents("php://input"), true);

            // Buscar o crear marca
            $stmtMarca = $db->prepare("SELECT id_marca FROM marca WHERE nombre = ?");
            $stmtMarca->execute([$d['marca']]);
            $marca = $stmtMarca->fetch(PDO::FETCH_ASSOC);
            if (!$marca) {
                $db->prepare("INSERT INTO marca (nombre, pais_origen) VALUES (?, 'No especificado')")
                   ->execute([$d['marca']]);
                $idMarca = $db->lastInsertId();
            } else {
                $idMarca = $marca['id_marca'];
            }

            // Buscar o crear categoría
            $stmtCat = $db->prepare("SELECT id_categoria FROM categoria_moto WHERE nombre = ?");
            $stmtCat->execute([$d['categoria']]);
            $cat = $stmtCat->fetch(PDO::FETCH_ASSOC);
            if (!$cat) {
                $db->prepare("INSERT INTO categoria_moto (nombre) VALUES (?)")->execute([$d['categoria']]);
                $idCat = $db->lastInsertId();
            } else {
                $idCat = $cat['id_categoria'];
            }

            $stmt = $db->prepare("
                UPDATE moto SET id_marca=?, id_categoria=?, modelo=?, anio=?,
                cilindrada_cc=?, precio_base=?, color=?
                WHERE id_moto=?
            ");
            $stmt->execute([$idMarca, $idCat, $d['modelo'], $d['anio'],
                            $d['cilindrada_cc'], $d['precio_base'], $d['color'], $d['id_moto']]);

            echo json_encode(['success' => true, 'message' => 'Moto actualizada correctamente']);
            break;

        // POST - eliminar moto
        case 'delete':
            $d = json_decode(file_get_contents("php://input"), true);

            // Verificar si tiene ventas
            $check = $db->prepare("SELECT COUNT(*) FROM detalle_venta WHERE id_moto = ?");
            $check->execute([$d['id_moto']]);
            if ($check->fetchColumn() > 0) {
                echo json_encode(['success' => false,
                    'message' => 'No se puede eliminar: esta moto tiene ventas registradas']);
                break;
            }

            // Eliminar inventario primero (FK)
            $db->prepare("DELETE FROM inventario WHERE id_moto = ?")->execute([$d['id_moto']]);
            $db->prepare("DELETE FROM moto WHERE id_moto = ?")->execute([$d['id_moto']]);

            echo json_encode(['success' => true, 'message' => 'Moto eliminada correctamente']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>