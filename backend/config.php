<?php
declare(strict_types=1);

/* Укажите пароль MySQL XAMPP, если он задан. */
const DB_HOST = '127.0.0.1';
const DB_NAME = 'onepoint_laptops';
const DB_USER = 'root';
const DB_PASS = '';

function db(): PDO {
    static $pdo;
    if (!$pdo) {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
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
