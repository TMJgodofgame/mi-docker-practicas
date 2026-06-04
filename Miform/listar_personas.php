<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$host = getenv('DB_HOST') ?: 'db-web';
$dbname = getenv('DB_NAME') ?: 'web';
$user = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';

function responder(bool $ok, array $personas = [], string $mensaje = ''): void
{
    echo json_encode([
        'ok' => $ok,
        'mensaje' => $mensaje,
        'personas' => $personas,
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
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        responder(false, [], 'Método no permitido');
    }

    $conexion = conectar($host, $dbname, $user, $password);

    $stmt = $conexion->query(
        'SELECT id, nombre, apellidos, altura, peso
         FROM personas
         ORDER BY id DESC'
    );

    $personas = $stmt->fetchAll();

    responder(true, $personas);
} catch (Throwable $e) {
    error_log('[listar_personas.php] ' . $e->getMessage());
    http_response_code(500);
    responder(false, [], 'Error al consultar la base de datos');
}