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

        // Auto-create missing tables / columns on connection to prevent 500 errors
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS product_images (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                product_id INT UNSIGNED NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                alt_text VARCHAR(255) NULL,
                is_main TINYINT(1) NOT NULL DEFAULT 0,
                sort_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_product_images (product_id, is_main, sort_order)
            )");
            $pdo->exec("CREATE TABLE IF NOT EXISTS product_related (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                product_id INT UNSIGNED NOT NULL,
                related_id INT UNSIGNED NOT NULL,
                UNIQUE KEY uq_rel (product_id, related_id)
            )");
        } catch (Throwable $t) { /* ignore auto-migration failure */ }
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
    
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'api.onepoint.kz';
    return $protocol . '://' . $host . '/uploads/products/' . $name;
}
function admin_required(): void {
    session_start();
    if (empty($_SESSION['admin'])) { header('Location: login.php'); exit; }
}
