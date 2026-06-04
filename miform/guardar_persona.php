<?php

header("Content-Type: application/json; charset=utf-8");

$host = "db-web";
$dbname = "web";
$user = "root";
$password = "";

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        echo json_encode([
            "ok" => false,
            "mensaje" => "Método no permitido"
        ]);
        exit;
    }

    $nombre = trim($_POST["nombre"] ?? "");
    $apellidos = trim($_POST["apellidos"] ?? "");
    $altura = $_POST["altura"] ?? "";
    $peso = $_POST["peso"] ?? "";

    if ($nombre === "" || $apellidos === "" || $altura === "" || $peso === "") {
        echo json_encode([
            "ok" => false,
            "mensaje" => "Todos los campos son obligatorios"
        ]);
        exit;
    }

    if (strlen($nombre) > 50) {
        echo json_encode([
            "ok" => false,
            "mensaje" => "El nombre no puede superar 50 caracteres"
        ]);
        exit;
    }

    if (strlen($apellidos) > 50) {
        echo json_encode([
            "ok" => false,
            "mensaje" => "Los apellidos no pueden superar 50 caracteres"
        ]);
        exit;
    }

    if (!is_numeric($altura) || $altura <= 0 || $altura > 9.99) {
        echo json_encode([
            "ok" => false,
            "mensaje" => "Altura inválida"
        ]);
        exit;
    }

    if (!is_numeric($peso) || $peso <= 0 || $peso > 999.99) {
        echo json_encode([
            "ok" => false,
            "mensaje" => "Peso inválido"
        ]);
        exit;
    }

    $conexion = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $sql = "INSERT INTO personas (nombre, apellidos, altura, peso)
            VALUES (:nombre, :apellidos, :altura, :peso)";

    $stmt = $conexion->prepare($sql);

    $stmt->execute([
        ":nombre" => $nombre,
        ":apellidos" => $apellidos,
        ":altura" => $altura,
        ":peso" => $peso
    ]);

    echo json_encode([
        "ok" => true,
        "mensaje" => "Persona guardada correctamente"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error en la base de datos: " . $e->getMessage()
    ]);
}