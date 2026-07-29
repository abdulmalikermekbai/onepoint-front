<?php
require __DIR__ . '/../config.php'; admin_required(); $pdo = db(); $message = ''; $error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $path = upload_product_image($_FILES['image_file'] ?? []);
        if (!$path) throw new RuntimeException('Выберите изображение.');
        $pdo->prepare('UPDATE products SET image_url=? WHERE id=?')->execute([$path, (int)$_POST['product_id']]);
        $message = 'Изображение загружено и привязано к товару.';
    } catch (Throwable $e) { $error = $e->getMessage(); }
}
$products = $pdo->query('SELECT id,name,image_url FROM products ORDER BY name')->fetchAll();
?><!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Загрузка изображения</title><style>body{font:16px system-ui;background:#f5f6f8;margin:0;color:#191a20}.box{width:min(680px,calc(100% - 32px));margin:50px auto;background:#fff;padding:30px;border-radius:16px}select,input{width:100%;box-sizing:border-box;padding:12px;margin:8px 0 18px;border:1px solid #ddd;border-radius:8px}button,a{background:#ff5a1f;color:#fff;border:0;padding:12px 16px;border-radius:8px;text-decoration:none;font-weight:700}.ok{color:#167242}.err{color:#b52d17}.hint{color:#6b6b72;font-size:14px}</style><main class="box"><a href="index.php?page=products">← К товарам</a><h1>Загрузить изображение</h1><?php if($message):?><p class="ok"><?=e($message)?></p><?php endif?><?php if($error):?><p class="err"><?=e($error)?></p><?php endif?><form method="post" enctype="multipart/form-data"><label>Ноутбук<select name="product_id" required><?php foreach($products as $p):?><option value="<?=$p['id']?>"><?=e($p['name'])?></option><?php endforeach?></select></label><label>Файл изображения<input type="file" name="image_file" accept="image/jpeg,image/png,image/webp" required></label><p class="hint">JPG, PNG или WebP, максимум 5 МБ. Загруженное изображение заменит прежнее.</p><button>Загрузить</button></form></main></html>
