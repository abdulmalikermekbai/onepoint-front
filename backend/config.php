<?php
declare(strict_types=1);

/* Настройки подключения к БД */
const DB_HOST = '127.0.0.1';
const DB_NAME = 'onepoint_laptops';
const DB_USER = 'onepoint_user';
const DB_PASS = '**jG8E3mcD2ujpwy';

function db(): PDO {
    static $pdo;
    if (!$pdo) {
        $host = getenv('DB_HOST') ?: DB_HOST;
        $name = getenv('DB_NAME') ?: DB_NAME;
        $user = getenv('DB_USER') ?: DB_USER;
        $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : DB_PASS;

        try {
            $pdo = new PDO('mysql:host=' . $host . ';dbname=' . $name . ';charset=utf8mb4', $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            // Fallback for local XAMPP if production user fails locally
            $pdo = new PDO('mysql:host=127.0.0.1;dbname=onepoint_laptops;charset=utf8mb4', 'root', '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        }
    }
    return $pdo;
}
function e(?string $value): string { return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8'); }
function upload_product_image(array $file): ?string {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) return null;
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) throw new RuntimeException('Не удалось загрузить файл.');
    if (($file['size'] ?? 0) > 5 * 1024 * 1024) throw new RuntimeException('Размер изображения не должен превышать 5 МБ.');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($extensions[$mime])) throw new RuntimeException('Можно загрузить только JPG, PNG или WebP.');
    $directory = __DIR__ . '/uploads/products';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) throw new RuntimeException('Не удалось создать папку для изображений.');
    $name = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $name)) throw new RuntimeException('Не удалось сохранить изображение.');
    $script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/backend/admin/upload.php');
    $base = rtrim(dirname(dirname($script)), '/');
    return $base . '/uploads/products/' . $name;
}
function admin_required(): void {
    session_start();
    if (empty($_SESSION['admin'])) { header('Location: login.php'); exit; }
}
