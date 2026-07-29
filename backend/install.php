<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

function scalar(string $block, string $key, string $default = ''): string {
    if (preg_match('/\\b' . preg_quote($key, '/') . ':\\s*"((?:\\\\.|[^"\\\\])*)"/', $block, $m)) return stripcslashes($m[1]);
    if (preg_match("/\\b" . preg_quote($key, '/') . ":\\s*'((?:\\\\\\\\.|[^'\\\\\\\\])*)'/", $block, $m)) return stripcslashes($m[1]);
    if (preg_match('/\\b' . preg_quote($key, '/') . ':\\s*([0-9.]+)/', $block, $m)) return $m[1];
    if (preg_match('/\\b' . preg_quote($key, '/') . ':\\s*(true|false)/', $block, $m)) return $m[1] === 'true' ? '1' : '0';
    return $default;
}
try {
  $root = dirname(__DIR__); $pdo0 = new PDO('mysql:host='.DB_HOST.';charset=utf8mb4', DB_USER, DB_PASS, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
  foreach (array_filter(array_map('trim', preg_split('/;\\s*(?:\\r?\\n|$)/', file_get_contents(__DIR__.'/database.sql')))) as $sql) $pdo0->exec($sql);
  $pdo = db();
  if (!$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn()) $pdo->prepare('INSERT INTO admins(login,password_hash) VALUES(?,?)')->execute(['admin', password_hash('change-me-now', PASSWORD_DEFAULT)]);
  $data = file_get_contents($root.'/src/lib/data.ts');
  preg_match('/export const PRODUCTS = \\[(.*?)\\n\\];/s', $data, $all);
  preg_match_all('/^  \\{\\n    id:.*?^  \\},?$/ms', $all[1] ?? '', $items);
  $insert = $pdo->prepare('INSERT IGNORE INTO products (name,slug,sku,brand_id,category_id,short_description,description,price,old_price,monthly_payment,in_stock,is_new,is_hit,is_sale,rating,review_count,image_url,processor,gpu,ram,storage,display_size,resolution,refresh_rate,matrix_type,weight,color,os,warranty,battery,ports,wifi,bluetooth,camera,dimensions,advantages) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  $brandIds=[];$categoryIds=[];$count=0;
  foreach ($items[0] as $block) {
    $brand=scalar($block,'brand'); $category=scalar($block,'categoryName'); if (!$brand || !$category) continue;
    if (!isset($brandIds[$brand])) { $pdo->prepare('INSERT IGNORE INTO brands(name,slug) VALUES(?,?)')->execute([$brand, strtolower(preg_replace('/[^a-z0-9]+/i','-', $brand))]); $brandIds[$brand]=(int)$pdo->query('SELECT id FROM brands WHERE name='.$pdo->quote($brand))->fetchColumn(); }
    if (!isset($categoryIds[$category])) { $slug=scalar($block,'categorySlug'); $pdo->prepare('INSERT IGNORE INTO categories(name,slug) VALUES(?,?)')->execute([$category,$slug]); $categoryIds[$category]=(int)$pdo->query('SELECT id FROM categories WHERE name='.$pdo->quote($category))->fetchColumn(); }
    preg_match('/images:\\s*\\[\\s*"((?:\\\\.|[^"\\\\])*)"/', $block, $im);
    preg_match('/advantages:\\s*\\[(.*?)\\]/s', $block, $adv); preg_match_all('/"((?:\\\\.|[^"\\\\])+?)"/', $adv[1]??'', $av); $av[1]=array_map('stripcslashes',$av[1]??[]);
    $insert->execute([scalar($block,'name'),scalar($block,'slug'),scalar($block,'sku'),$brandIds[$brand],$categoryIds[$category],scalar($block,'shortDescription'),scalar($block,'description'),scalar($block,'price','0'),scalar($block,'oldPrice')?:null,scalar($block,'monthlyPayment')?:null,scalar($block,'inStock','1'),scalar($block,'isNew'),scalar($block,'isHit'),scalar($block,'isSale'),scalar($block,'rating','5'),scalar($block,'reviewCount','0'),$im[1]??null,scalar($block,'processor'),scalar($block,'gpu'),scalar($block,'ram'),scalar($block,'storage'),scalar($block,'display'),scalar($block,'resolution'),scalar($block,'refreshRate'),scalar($block,'matrixType'),scalar($block,'weight'),scalar($block,'color'),scalar($block,'os'),scalar($block,'warranty'),scalar($block,'battery'),scalar($block,'ports'),scalar($block,'wifi'),scalar($block,'bluetooth'),scalar($block,'camera'),scalar($block,'dimensions'),implode("\n",$av[1]??[])]); $count++;
  }
  preg_match('/export const REVIEWS = \\[(.*?)\\n\\];/s', $data, $reviews); preg_match_all('/\\{\\s*author:.*?\\}/s', $reviews[1]??'', $rows);
  $review=$pdo->prepare('INSERT INTO reviews(author_name,initials,rating,body,source) VALUES(?,?,?,?,?)'); foreach($rows[0] as $r) $review->execute([scalar($r,'author'),scalar($r,'initials'),scalar($r,'rating','5'),scalar($r,'text'),scalar($r,'source','site')]);
  $pdo->exec("INSERT IGNORE INTO promotions(title,description,badge,button_text,button_url,color,sort_order) VALUES ('Скидки на популярные модели','Выгодные цены на ноутбуки из наличия','СКИДКИ','Смотреть каталог','/catalog','orange',1),('Подарок к ноутбуку','Подберём полезный аксессуар при покупке выбранных моделей','ПОДАРОК','Выбрать ноутбук','/catalog','dark',2),('Бесплатная доставка','Доставка по Казахстану при заказе от 200 000 ₸','ДОСТАВКА','Подробнее','/delivery','blue',3)");
  echo '<h1>Готово</h1><p>Импортировано товаров: '. $count .'. <a href="admin/login.php">Открыть админку</a></p><p>Логин: <b>admin</b>, пароль: <b>change-me-now</b>. Смените пароль сразу после входа.</p>';
} catch (Throwable $e) { http_response_code(500); echo '<pre>Ошибка: '.htmlspecialchars($e->getMessage()).'</pre>'; }
