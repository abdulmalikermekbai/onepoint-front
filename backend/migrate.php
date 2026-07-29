<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
try {
    db()->exec('CREATE TABLE IF NOT EXISTS product_images (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, product_id INT UNSIGNED NOT NULL, image_url VARCHAR(500) NOT NULL, alt_text VARCHAR(255) NULL, is_main TINYINT(1) NOT NULL DEFAULT 0, sort_order INT NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, INDEX idx_product_images (product_id, is_main, sort_order))');
    $products = db()->query("SELECT id,image_url FROM products WHERE image_url IS NOT NULL AND image_url != ''")->fetchAll();
    $insert = db()->prepare('INSERT INTO product_images(product_id,image_url,is_main) SELECT ?,?,1 WHERE NOT EXISTS(SELECT 1 FROM product_images WHERE product_id=?)');
    foreach ($products as $product) $insert->execute([$product['id'], $product['image_url'], $product['id']]);
    echo '<h1>Галерея подключена</h1><p><a href="admin/gallery.php">Перейти к управлению фотографиями</a></p>';
} catch (Throwable $e) { http_response_code(500); echo '<pre>'.e($e->getMessage()).'</pre>'; }
