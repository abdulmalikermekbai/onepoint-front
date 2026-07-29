<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

try {
    $pdo = db();

    // 1. Create tables
    $sqlFile = __DIR__ . '/database.sql';
    if (file_exists($sqlFile)) {
        $sqlContent = file_get_contents($sqlFile);
        $queries = array_filter(array_map('trim', explode(';', $sqlContent)));
        foreach ($queries as $q) {
            if (!empty($q)) {
                try { $pdo->exec($q); } catch (Throwable $t) {}
            }
        }
    }

    // 2. Additional tables
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

    // 3. Admin user
    $chkAdmin = $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
    if (!$chkAdmin) {
        $pdo->prepare('INSERT INTO admins(login,password_hash) VALUES(?,?)')
            ->execute(['admin', password_hash('change-me-now', PASSWORD_DEFAULT)]);
    }

    // 4. Default Brands & Categories if empty
    if (!$pdo->query('SELECT COUNT(*) FROM brands')->fetchColumn()) {
        $pdo->exec("INSERT INTO brands (name, slug) VALUES 
            ('Lenovo', 'lenovo'), ('ASUS', 'asus'), ('Apple', 'apple'), 
            ('HP', 'hp'), ('Dell', 'dell'), ('Acer', 'acer')");
    }

    if (!$pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn()) {
        $pdo->exec("INSERT INTO categories (name, slug, sort_order) VALUES 
            ('Игровые ноутбуки', 'gaming', 1),
            ('Ультрабуки', 'ultrabooks', 2),
            ('Для работы и учебы', 'work', 3),
            ('MacBook', 'macbook', 4)");
    }

    if (!$pdo->query('SELECT COUNT(*) FROM promotions')->fetchColumn()) {
        $pdo->exec("INSERT IGNORE INTO promotions (title,description,badge,button_text,button_url,color,sort_order) VALUES 
            ('Скидки на популярные модели','Выгодные цены на ноутбуки из наличия','СКИДКИ','Смотреть каталог','/catalog','orange',1),
            ('Подарок к ноутбуку','Подберём полезный аксессуар при покупке выбранных моделей','ПОДАРОК','Выбрать ноутбук','/catalog','dark',2),
            ('Бесплатная доставка','Доставка по Казахстану при заказе от 200 000 ₸','ДОСТАВКА','Подробнее','/delivery','blue',3)");
    }

    echo '<h1 style="color:#059669;font-family:sans-serif">✅ База данных успешно инициализирована!</h1>';
    echo '<p style="font-family:sans-serif">Все таблицы созданы и проверены. Вы можете перейти в админ-панель:</p>';
    echo '<p style="font-family:sans-serif"><a href="admin/login.php" style="background:#ff5a1f;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Открыть админку</a></p>';
    echo '<p style="font-family:sans-serif;color:#666">Логин: <b>admin</b> | Пароль: <b>change-me-now</b></p>';

} catch (Throwable $e) {
    http_response_code(500);
    echo '<h1 style="color:#dc2626;font-family:sans-serif">Ошибка инициализации</h1>';
    echo '<pre style="background:#fef2f2;padding:16px;border-radius:8px;color:#991b1b">' . htmlspecialchars($e->getMessage()) . '</pre>';
}

