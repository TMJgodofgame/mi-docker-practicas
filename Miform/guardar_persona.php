<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$host = getenv('DB_HOST') ?: 'db-web';
$dbname = getenv('DB_NAME') ?: 'web';
$user = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';

function responder(bool $ok, string $mensaje, int $statusCode = 200): void
{
    http_response_code($statusCode);

    echo json_encode([
        'ok' => $ok,
        'mensaje' => $mensaje,
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

function conectar(string $host, string $dbname, string $user, string $password): PDO
{
    return new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(false, 'Método no permitido', 405);
    }

    $nombre = trim((string)($_POST['nombre'] ?? ''));
    $apellidos = trim((string)($_POST['apellidos'] ?? ''));
    $alturaRaw = trim(str_replace(',', '.', (string)($_POST['altura'] ?? '')));
    $pesoRaw = trim(str_replace(',', '.', (string)($_POST['peso'] ?? '')));

    if ($nombre === '' || $apellidos === '' || $alturaRaw === '' || $pesoRaw === '') {
        responder(false, 'Todos los campos son obligatorios', 400);
    }

    if (mb_strlen($nombre) > 50) {
        responder(false, 'El nombre no puede superar 50 caracteres', 400);
    }

    if (mb_strlen($apellidos) > 50) {
        responder(false, 'Los apellidos no pueden superar 50 caracteres', 400);
    }

    if (!is_numeric($alturaRaw)) {
        responder(false, 'La altura debe ser un número válido', 400);
    }

    if (!is_numeric($pesoRaw)) {
        responder(false, 'El peso debe ser un número válido', 400);
    }

    $altura = (float)$alturaRaw;
    $peso = (float)$pesoRaw;

    if ($altura <= 0 || $altura > 9.99) {
        responder(false, 'La altura debe estar entre 0.01 y 9.99', 400);
    }

    if ($peso <= 0 || $peso > 999.99) {
        responder(false, 'El peso debe estar entre 0.01 y 999.99', 400);
    }

    $conexion = conectar($host, $dbname, $user, $password);

    $sql = 'INSERT INTO personas (nombre, apellidos, altura, peso)
            VALUES (:nombre, :apellidos, :altura, :peso)';

    $stmt = $conexion->prepare($sql);
    $stmt->execute([
        ':nombre' => $nombre,
        ':apellidos' => $apellidos,
        ':altura' => number_format($altura, 2, '.', ''),
        ':peso' => number_format($peso, 2, '.', ''),
    ]);

    responder(true, 'Persona guardada correctamente');
} catch (Throwable $e) {
    error_log('[guardar_persona.php] ' . $e->getMessage());
    responder(false, 'Error al guardar en la base de datos', 500);
}