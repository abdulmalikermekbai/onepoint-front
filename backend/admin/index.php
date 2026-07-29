<?php
require __DIR__ . '/../config.php';
admin_required();
$pdo = db();
$page = $_GET['page'] ?? 'dashboard';

/* ── helpers ── */
function nav(string $key, string $label, string $page): string {
    return '<a class="' . ($key === $page ? 'active' : '') . '" href="?page=' . $key . '">' . $label . '</a>';
}

function translitSlug(string $text): string {
    $map = [
        'а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'yo','ж'=>'zh',
        'з'=>'z','и'=>'i','й'=>'y','к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o',
        'п'=>'p','р'=>'r','с'=>'s','т'=>'t','у'=>'u','ф'=>'f','х'=>'kh','ц'=>'ts',
        'ч'=>'ch','ш'=>'sh','щ'=>'sch','ъ'=>'','ы'=>'y','ь'=>'','э'=>'e','ю'=>'yu',
        'я'=>'ya','А'=>'a','Б'=>'b','В'=>'v','Г'=>'g','Д'=>'d','Е'=>'e','Ё'=>'yo',
        'Ж'=>'zh','З'=>'z','И'=>'i','Й'=>'y','К'=>'k','Л'=>'l','М'=>'m','Н'=>'n',
        'О'=>'o','П'=>'p','Р'=>'r','С'=>'s','Т'=>'t','У'=>'u','Ф'=>'f','Х'=>'kh',
        'Ц'=>'ts','Ч'=>'ch','Ш'=>'sh','Щ'=>'sch','Ъ'=>'','Ы'=>'y','Ь'=>'','Э'=>'e',
        'Ю'=>'yu','Я'=>'ya',
    ];
    $text = strtr($text, $map);
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-') ?: 'product-' . time();
}

/* ── logout ── */
if (isset($_GET['logout'])) { session_destroy(); header('Location: login.php'); exit; }

/* ── POST handlers ── */
$_postError = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    /* password */
    if (($_POST['action'] ?? '') === 'password') {
        if (strlen($_POST['password'] ?? '') >= 10)
            $pdo->prepare('UPDATE admins SET password_hash=? WHERE id=?')
                ->execute([password_hash($_POST['password'], PASSWORD_DEFAULT), $_SESSION['admin']]);
        $page = 'password';
    }

    /* delete */
    if (($_POST['action'] ?? '') === 'delete') {
        try {
            $table = $_POST['table'];
            if (in_array($table, ['products','reviews','promotions','brands','categories','product_related'], true))
                $pdo->prepare("DELETE FROM `$table` WHERE id=?")->execute([(int)$_POST['id']]);
        } catch (Throwable $e) {
            header('Location: ?page=' . $page . '&error=' . urlencode($e->getMessage())); exit;
        }
    }

    /* product */
    if (($_POST['action'] ?? '') === 'product') {
        try {
            $f = $_POST;
            $name = trim($f['name'] ?? '');
            $editId = !empty($f['id']) && is_numeric($f['id']) ? (int)$f['id'] : null;

            // Auto slug with uniqueness check
            $slug = trim($f['slug'] ?? '');
            if ($slug === '' && $name !== '') {
                $slug = translitSlug($name);
            }
            // Ensure slug is unique (skip current product on edit)
            $checkSlug = $pdo->prepare('SELECT id FROM products WHERE slug=?' . ($editId ? ' AND id!=?' : ''));
            $checkSlug->execute($editId ? [$slug, $editId] : [$slug]);
            if ($checkSlug->fetchColumn()) {
                $slug = $slug . '-' . substr(md5(uniqid()), 0, 6);
            }
            $f['slug'] = $slug;

            // Auto SKU
            $sku = trim($f['sku'] ?? '');
            if ($sku === '') {
                $sku = 'OP-' . strtoupper(substr(md5(uniqid((string)mt_rand(), true)), 0, 8));
            }
            $f['sku'] = $sku;

            // Image upload
            if (!empty($_FILES['image_file']['name'])) {
                $uploaded = upload_product_image($_FILES['image_file']);
                if ($uploaded) $f['image_url'] = $uploaded;
            }

            // Keep existing image_url if editing and field was left blank
            if ($editId && empty($f['image_url'])) {
                $existingImg = $pdo->prepare('SELECT image_url FROM products WHERE id=?');
                $existingImg->execute([$editId]);
                $f['image_url'] = $existingImg->fetchColumn() ?: null;
            }

            $cols = ['name','slug','sku','brand_id','category_id','short_description','description',
                     'price','old_price','in_stock','is_new','is_hit','is_sale','is_active',
                     'image_url','processor','gpu','ram','storage','display_size',
                     'resolution','refresh_rate','matrix_type','warranty'];
            $values = [];
            foreach ($cols as $c) {
                if ($c === 'in_stock' || strpos($c, 'is_') === 0) {
                    $values[] = isset($f[$c]) ? 1 : 0;
                } else {
                    $values[] = (isset($f[$c]) && $f[$c] !== '') ? $f[$c] : null;
                }
            }

            if ($editId) {
                $set = implode(',', array_map(fn($c) => "$c=?", $cols));
                $values[] = $editId;
                $pdo->prepare("UPDATE products SET $set WHERE id=?")->execute($values);
                $savedId = $editId;
            } else {
                $pdo->prepare('INSERT INTO products(' . implode(',', $cols) . ') VALUES(' . rtrim(str_repeat('?,', count($cols)), ',') . ')')->execute($values);
                $savedId = (int)$pdo->lastInsertId();
            }

            // Sync main image into product_images table
            if (!empty($f['image_url'])) {
                try {
                    $chk = $pdo->prepare('SELECT COUNT(*) FROM product_images WHERE product_id=? AND image_url=?');
                    $chk->execute([$savedId, $f['image_url']]);
                    if (!$chk->fetchColumn()) {
                        $pdo->prepare('INSERT INTO product_images(product_id, image_url, is_main, sort_order) VALUES(?, ?, 1, 0)')->execute([$savedId, $f['image_url']]);
                    }
                } catch (Throwable $eImg) {}
            }

            // Save related products
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS product_related (
                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    product_id INT UNSIGNED NOT NULL,
                    related_id INT UNSIGNED NOT NULL,
                    UNIQUE KEY uq_rel (product_id, related_id)
                )");
                $pdo->prepare("DELETE FROM product_related WHERE product_id=?")->execute([$savedId]);
                if (!empty($_POST['related_ids'])) {
                    foreach ($_POST['related_ids'] as $rid) {
                        $rid = (int)$rid;
                        if ($rid && $rid !== $savedId) {
                            $pdo->prepare("INSERT IGNORE INTO product_related(product_id, related_id) VALUES(?,?)")->execute([$savedId, $rid]);
                        }
                    }
                }
            } catch (Throwable $re) { /* ignore related products errors */ }

            $page = 'products';
            header('Location: ?page=products&saved=1'); exit;

        } catch (Throwable $e) {
            $editParam = !empty($_POST['id']) && is_numeric($_POST['id']) ? $_POST['id'] : 'new';
            header('Location: ?page=products&edit=' . urlencode($editParam) . '&error=' . urlencode('Ошибка БД: ' . $e->getMessage())); exit;
        }
    }

    /* review */
    if (($_POST['action'] ?? '') === 'review') {
        $pid = !empty($_POST['product_id']) ? (int)$_POST['product_id'] : null;
        if (!empty($_POST['rev_id'])) {
            $pdo->prepare('UPDATE reviews SET product_id=?,author_name=?,initials=?,rating=?,body=?,source=?,is_approved=? WHERE id=?')
                ->execute([$pid, $_POST['author_name'], $_POST['initials'], $_POST['rating'], $_POST['body'], $_POST['source'], isset($_POST['is_approved']) ? 1 : 0, (int)$_POST['rev_id']]);
        } else {
            $pdo->prepare('INSERT INTO reviews(product_id,author_name,initials,rating,body,source,is_approved) VALUES(?,?,?,?,?,?,?)')
                ->execute([$pid, $_POST['author_name'], $_POST['initials'], $_POST['rating'], $_POST['body'], $_POST['source'], isset($_POST['is_approved']) ? 1 : 0]);
        }
        $page = 'reviews';
    }

    /* promotion */
    if (($_POST['action'] ?? '') === 'promotion') {
        $cols = ['title','description','badge','button_text','button_url','color','sort_order','is_active'];
        $v = [];
        foreach ($cols as $c) $v[] = $c === 'is_active' ? (isset($_POST[$c]) ? 1 : 0) : ($_POST[$c] ?? null);
        if (!empty($_POST['id']) && is_numeric($_POST['id'])) {
            $v[] = $_POST['id'];
            $pdo->prepare('UPDATE promotions SET ' . implode(',', array_map(fn($c) => "$c=?", $cols)) . ' WHERE id=?')->execute($v);
        } else {
            $pdo->prepare('INSERT INTO promotions(' . implode(',', $cols) . ') VALUES(' . rtrim(str_repeat('?,', count($cols)), ',') . ')')->execute($v);
        }
        $page = 'promotions';
    }

    /* brand */
    if (($_POST['action'] ?? '') === 'brand') {
        $bname = trim($_POST['name'] ?? '');
        $bslug = trim($_POST['bslug'] ?? '') ?: translitSlug($bname);
        $active = isset($_POST['is_active']) ? 1 : 0;
        if (!empty($_POST['id']) && is_numeric($_POST['id'])) {
            $pdo->prepare('UPDATE brands SET name=?,slug=?,is_active=? WHERE id=?')->execute([$bname, $bslug, $active, (int)$_POST['id']]);
        } else {
            $pdo->prepare('INSERT INTO brands(name,slug,is_active) VALUES(?,?,?)')->execute([$bname, $bslug, $active]);
        }
        $page = 'brands';
    }

    /* category */
    if (($_POST['action'] ?? '') === 'category') {
        $cname = trim($_POST['name'] ?? '');
        $cslug = trim($_POST['cslug'] ?? '') ?: translitSlug($cname);
        $sort  = (int)($_POST['sort_order'] ?? 0);
        $active = isset($_POST['is_active']) ? 1 : 0;
        if (!empty($_POST['id']) && is_numeric($_POST['id'])) {
            $pdo->prepare('UPDATE categories SET name=?,slug=?,sort_order=?,is_active=? WHERE id=?')->execute([$cname, $cslug, $sort, $active, (int)$_POST['id']]);
        } else {
            $pdo->prepare('INSERT INTO categories(name,slug,sort_order,is_active) VALUES(?,?,?,?)')->execute([$cname, $cslug, $sort, $active]);
        }
        $page = 'categories';
    }

    header('Location: ?page=' . $page . '&saved=1'); exit;
}

/* ── dashboard counts ── */
$counts = [
    'products'   => $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn(),
    'reviews'    => $pdo->query('SELECT COUNT(*) FROM reviews')->fetchColumn(),
    'leads'      => $pdo->query('SELECT COUNT(*) FROM leads')->fetchColumn(),
    'promotions' => $pdo->query('SELECT COUNT(*) FROM promotions')->fetchColumn(),
    'brands'     => $pdo->query('SELECT COUNT(*) FROM brands')->fetchColumn(),
    'categories' => $pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn(),
];

// Ensure product_related table exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS product_related (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id INT UNSIGNED NOT NULL,
        related_id INT UNSIGNED NOT NULL,
        UNIQUE KEY uq_rel (product_id, related_id),
        CONSTRAINT fk_pr_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_pr_related FOREIGN KEY (related_id) REFERENCES products(id) ON DELETE CASCADE
    )");
} catch (PDOException $e) { /* ignore if exists */ }

?><!doctype html>
<html lang="ru">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OnePoint Admin</title>
<style>
:root{--a:#ff5a1f;--d:#15161d;--l:#f5f6f8}
*{box-sizing:border-box}
body{font:15px system-ui;margin:0;background:var(--l);color:#191a20}
.side{position:fixed;width:230px;inset:0 auto 0 0;background:var(--d);color:#fff;padding:25px 14px;overflow-y:auto}
.side h2{padding:0 12px;margin:0 0 18px;font-size:17px}
.side .nav-group{font-size:11px;text-transform:uppercase;color:#6d6e76;padding:14px 12px 4px;letter-spacing:.06em}
.side a{display:block;color:#c6c7ce;padding:10px 12px;border-radius:9px;text-decoration:none}
.side a.active,.side a:hover{background:#282a34;color:#fff}
.main{margin-left:230px;padding:34px;max-width:1500px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:16px}
.card,form.box{background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 10px #0000000a}
.num{font-size:30px;font-weight:800;color:var(--a)}
.toolbar{display:flex;gap:12px;justify-content:space-between;align-items:center;margin:22px 0}
.btn,button[type=submit]{background:var(--a);color:#fff;border:0;border-radius:8px;padding:10px 16px;text-decoration:none;font-weight:700;cursor:pointer;font:inherit;display:inline-block}
.btn-sm{padding:6px 10px;font-size:13px}
.ghost{background:#fff;color:#222;border:1px solid #ddd;border-radius:8px;padding:8px 12px;text-decoration:none;font:inherit;cursor:pointer;display:inline-block}
.danger{background:#c5221f;color:#fff;border:0;border-radius:8px;padding:8px 12px;font:inherit;cursor:pointer}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px #0000000a}
th,td{padding:12px 14px;text-align:left;border-bottom:1px solid #eee;vertical-align:middle}
th{font-size:11px;color:#6d6e76;text-transform:uppercase;background:#fafafa}
input[type=text],input[type=number],input[type=password],input[type=file],input:not([type]),textarea,select{width:100%;padding:10px;border:1px solid #d9dae0;border-radius:7px;margin:4px 0 12px;font:inherit;background:#fff;box-shadow:none;outline:none}
input[type=text]:focus,input[type=number]:focus,input[type=password]:focus,input:not([type]):focus,textarea:focus,select:focus{border-color:var(--a);box-shadow:0 0 0 3px rgba(255,90,31,0.15)}
input[type=file]{padding:7px}
textarea{min-height:90px;resize:vertical}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.checks{display:flex;gap:16px;flex-wrap:wrap;margin:10px 0 16px}
.checks label{display:flex;gap:6px;align-items:center;cursor:pointer}
.checks input[type=checkbox]{width:auto;margin:0;accent-color:var(--a)}
.notice{background:#e8f7ef;padding:12px 16px;border-radius:8px;color:#167242;margin-bottom:16px}
.error-msg{background:#fce8e6;padding:12px 16px;border-radius:8px;color:#c5221f;margin-bottom:16px}
label>span{display:block;font-weight:600;font-size:13px;color:#444;margin-bottom:2px}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
.badge-green{background:#e8f7ef;color:#167242}
.badge-gray{background:#eee;color:#666}
.badge-orange{background:#fff3e0;color:#e65100}
.related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;max-height:260px;overflow-y:auto;border:1px solid #ddd;border-radius:8px;padding:10px;background:#fafafa}
.related-grid label{display:flex;gap:8px;align-items:flex-start;padding:6px;border-radius:6px;cursor:pointer}
.related-grid label:hover{background:#f0f0f0}
.related-grid input{width:auto;margin:3px 0 0;flex-shrink:0}
@media(max-width:860px){
  .side{position:static;width:auto;display:flex;flex-wrap:wrap;gap:4px;padding:12px}
  .side .nav-group{display:none}
  .side h2{width:100%;margin-bottom:6px}
  .main{margin:0;padding:16px}
  .cards,.grid,.grid2{grid-template-columns:1fr}
  .hide-sm{display:none}
  table{font-size:12px}
  th,td{padding:8px}
}
</style>
<body>
<aside class="side">
  <h2>● OnePoint</h2>
  <div class="nav-group">Главное</div>
  <?= nav('dashboard','Обзор',$page) ?>
  <?= nav('products','Ноутбуки',$page) ?>
  <div class="nav-group">Каталог</div>
  <?= nav('brands','Бренды',$page) ?>
  <?= nav('categories','Категории',$page) ?>
  <div class="nav-group">Контент</div>
  <?= nav('reviews','Отзывы',$page) ?>
  <?= nav('promotions','Акции',$page) ?>
  <?= nav('leads','Заявки',$page) ?>
  <div class="nav-group">Аккаунт</div>
  <?= nav('password','Пароль',$page) ?>
  <a href="?logout=1">Выйти</a>
</aside>
<main class="main">
<div class="top">
  <h1><?= ['dashboard'=>'Обзор','products'=>'Ноутбуки','reviews'=>'Отзывы','promotions'=>'Акции','leads'=>'Заявки','password'=>'Пароль','brands'=>'Бренды','categories'=>'Категории'][$page] ?? 'Админка' ?></h1>
</div>
<?php if (isset($_GET['saved'])): ?>
  <p class="notice">✓ Успешно сохранено</p>
<?php endif; ?>
<?php if (isset($_GET['error'])): ?>
  <p class="error-msg"><?= e($_GET['error']) ?></p>
<?php endif; ?>

<?php /* ════════ DASHBOARD ════════ */ if ($page === 'dashboard'): ?>
<div class="cards">
  <?php foreach (['products'=>['Ноутбуки','#ff5a1f'],'brands'=>['Бренды','#4f46e5'],'categories'=>['Категории','#0891b2'],'reviews'=>['Отзывы','#059669'],'promotions'=>['Акции','#d97706'],'leads'=>['Заявки','#dc2626']] as $k=>[$t,$color]): ?>
  <a href="?page=<?=$k?>" style="text-decoration:none">
    <div class="card">
      <div class="num" style="color:<?=$color?>"><?= $counts[$k] ?></div>
      <div style="color:#666;font-size:13px;margin-top:4px"><?= $t ?></div>
    </div>
  </a>
  <?php endforeach ?>
</div>
<div class="card" style="margin-top:20px">
  <b>Как пользоваться</b>
  <p style="color:#555">Добавьте сначала <a href="?page=brands">Бренды</a> и <a href="?page=categories">Категории</a>, затем создавайте <a href="?page=products">Ноутбуки</a>. Привяжите отзывы к товарам через раздел <a href="?page=reviews">Отзывы</a>.</p>
</div>

<?php /* ════════ PRODUCTS ════════ */ elseif ($page === 'products'):
  $editId = $_GET['edit'] ?? null;
  $p = [];
  if ($editId && $editId !== 'new') {
      $st = $pdo->prepare('SELECT * FROM products WHERE id=?');
      $st->execute([$editId]);
      $p = $st->fetch() ?: [];
  }
  $brands = $pdo->query('SELECT * FROM brands WHERE is_active=1 ORDER BY name')->fetchAll();
  $cats   = $pdo->query('SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order,name')->fetchAll();
  $allProducts = $pdo->query('SELECT id,name FROM products ORDER BY name')->fetchAll();

  // Related product IDs for current product
  $relatedIds = [];
  if (!empty($p['id'])) {
      $rst = $pdo->prepare("SELECT related_id FROM product_related WHERE product_id=?");
      $rst->execute([$p['id']]);
      $relatedIds = array_column($rst->fetchAll(), 'related_id');
  }
?>
<div class="toolbar">
  <a class="btn" href="?page=products&edit=new">+ Добавить ноутбук</a>
  <span style="color:#666">Всего: <?= $counts['products'] ?></span>
</div>
<?php if ($editId !== null): ?>
<form class="box" method="post" enctype="multipart/form-data">
  <input type="hidden" name="action" value="product">
  <input type="hidden" name="id" value="<?= e($p['id'] ?? '') ?>">
  <h3 style="margin-top:0"><?= empty($p['id']) ? 'Новый ноутбук' : 'Редактировать: '.e($p['name']) ?></h3>

  <div class="grid">
    <label><span>Название *</span><input name="name" required value="<?= e($p['name'] ?? '') ?>"></label>
    <label><span>Бренд</span>
      <select name="brand_id">
        <option value="">— не выбрано —</option>
        <?php foreach ($brands as $b): ?>
        <option value="<?= $b['id'] ?>" <?= ($p['brand_id'] ?? '') == $b['id'] ? 'selected' : '' ?>><?= e($b['name']) ?></option>
        <?php endforeach ?>
      </select>
    </label>
    <label><span>Категория</span>
      <select name="category_id">
        <option value="">— не выбрано —</option>
        <?php foreach ($cats as $c): ?>
        <option value="<?= $c['id'] ?>" <?= ($p['category_id'] ?? '') == $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
        <?php endforeach ?>
      </select>
    </label>
    <label><span>Цена, ₸ *</span><input name="price" type="number" required value="<?= e($p['price'] ?? '') ?>"></label>
    <label><span>Старая цена, ₸</span><input name="old_price" type="number" value="<?= e($p['old_price'] ?? '') ?>"></label>
    <label><span>Загрузить фото (файл)</span><input name="image_file" type="file" accept="image/jpeg,image/png,image/webp"></label>
    <label><span>Фото (URL)</span><input name="image_url" placeholder="Или укажите ссылку" value="<?= e($p['image_url'] ?? '') ?>">
      <?php if (!empty($p['image_url'])): ?><img src="<?= e($p['image_url']) ?>" style="height:50px;margin-top:4px;border-radius:6px"><?php endif ?>
    </label>
    <label><span>Процессор</span><input name="processor" value="<?= e($p['processor'] ?? '') ?>"></label>
    <label><span>Видеокарта</span><input name="gpu" value="<?= e($p['gpu'] ?? '') ?>"></label>
    <label><span>ОЗУ</span><input name="ram" value="<?= e($p['ram'] ?? '') ?>"></label>
    <label><span>SSD/HDD</span><input name="storage" value="<?= e($p['storage'] ?? '') ?>"></label>
    <label><span>Диагональ экрана</span><input name="display_size" value="<?= e($p['display_size'] ?? '') ?>"></label>
    <label><span>Разрешение</span><input name="resolution" value="<?= e($p['resolution'] ?? '') ?>"></label>
    <label><span>Частота обновления</span><input name="refresh_rate" value="<?= e($p['refresh_rate'] ?? '') ?>"></label>
    <label><span>Тип матрицы</span><input name="matrix_type" value="<?= e($p['matrix_type'] ?? '') ?>"></label>
    <label><span>Гарантия</span><input name="warranty" value="<?= e($p['warranty'] ?? '') ?>"></label>
  </div>

  <label><span>Краткое описание</span><textarea name="short_description"><?= e($p['short_description'] ?? '') ?></textarea></label>
  <label><span>Полное описание</span><textarea name="description" style="min-height:130px"><?= e($p['description'] ?? '') ?></textarea></label>

  <div class="checks">
    <?php foreach (['in_stock'=>'В наличии','is_hit'=>'Хит продаж','is_sale'=>'Акция','is_new'=>'Новинка','is_active'=>'Показывать на сайте'] as $k=>$t): ?>
    <label><input type="checkbox" name="<?= $k ?>" <?= ($p[$k] ?? 1) ? 'checked' : '' ?>><?= $t ?></label>
    <?php endforeach ?>
  </div>

  <?php if (!empty($allProducts)): ?>
  <div style="margin-top:10px">
    <span style="font-weight:600;font-size:13px;color:#444;display:block;margin-bottom:6px">Сопутствующие товары</span>
    <div class="related-grid">
      <?php foreach ($allProducts as $rp): if (($rp['id'] ?? 0) == ($p['id'] ?? -1)) continue; ?>
      <label>
        <input type="checkbox" name="related_ids[]" value="<?= $rp['id'] ?>" <?= in_array($rp['id'], $relatedIds) ? 'checked' : '' ?>>
        <span style="font-size:13px"><?= e($rp['name']) ?></span>
      </label>
      <?php endforeach ?>
    </div>
  </div>
  <?php endif ?>

  <p style="margin-top:20px;display:flex;gap:12px;align-items:center">
    <button type="submit">Сохранить</button>
    <a class="ghost" href="?page=products">Отмена</a>
    <?php if (!empty($p['id'])): ?>
    <a class="ghost btn-sm" href="gallery.php?product_id=<?= $p['id'] ?>" target="_blank">🖼 Галерея фото</a>
    <?php endif ?>
  </p>
</form>
<?php endif ?>

<table>
  <tr><th>Ноутбук</th><th>Цена</th><th class="hide-sm">Статус</th><th class="hide-sm">Категория</th><th></th></tr>
  <?php
  $rows = $pdo->query('SELECT p.*,b.name brand,c.name cat FROM products p LEFT JOIN brands b ON b.id=p.brand_id LEFT JOIN categories c ON c.id=p.category_id ORDER BY p.id DESC')->fetchAll();
  foreach ($rows as $r): ?>
  <tr>
    <td>
      <b><?= e($r['name']) ?></b>
      <?php if ($r['image_url']): ?><br><img src="<?= e($r['image_url']) ?>" style="height:36px;margin-top:4px;border-radius:4px"><?php endif ?>
      <br><small style="color:#888"><?= e($r['brand'] ?? '') ?></small>
    </td>
    <td><?= number_format((float)$r['price'], 0, '.', ' ') ?> ₸</td>
    <td class="hide-sm">
      <?php if ($r['is_active']): ?><span class="badge badge-green">Активен</span><?php else: ?><span class="badge badge-gray">Скрыт</span><?php endif ?>
      <?php if ($r['is_hit']): ?> <span class="badge badge-orange">Хит</span><?php endif ?>
      <?php if ($r['is_sale']): ?> <span class="badge badge-orange">Акция</span><?php endif ?>
      <?php if ($r['is_new']): ?> <span class="badge badge-green">Новинка</span><?php endif ?>
    </td>
    <td class="hide-sm"><?= e($r['cat'] ?? '—') ?></td>
    <td style="white-space:nowrap">
      <a class="btn btn-sm" href="?page=products&edit=<?= $r['id'] ?>">Изменить</a>
      <a class="ghost btn-sm" href="gallery.php?product_id=<?= $r['id'] ?>" target="_blank">Галерея</a>
      <form method="post" style="display:inline" onsubmit="return confirm('Удалить ноутбук?')">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="table" value="products">
        <input type="hidden" name="id" value="<?= $r['id'] ?>">
        <button class="danger btn-sm" type="submit">Удалить</button>
      </form>
    </td>
  </tr>
  <?php endforeach ?>
</table>

<?php /* ════════ BRANDS ════════ */ elseif ($page === 'brands'):
  $editId = $_GET['edit'] ?? null;
  $b = [];
  if ($editId && $editId !== 'new') {
      $st = $pdo->prepare('SELECT * FROM brands WHERE id=?');
      $st->execute([$editId]);
      $b = $st->fetch() ?: [];
  }
?>
<div class="toolbar">
  <a class="btn" href="?page=brands&edit=new">+ Добавить бренд</a>
  <span style="color:#666">Всего: <?= $counts['brands'] ?></span>
</div>
<?php if ($editId !== null): ?>
<form class="box" method="post" style="max-width:480px">
  <input type="hidden" name="action" value="brand">
  <input type="hidden" name="id" value="<?= e($b['id'] ?? '') ?>">
  <h3 style="margin-top:0"><?= empty($b['id']) ? 'Новый бренд' : 'Редактировать бренд' ?></h3>
  <label><span>Название *</span><input name="name" required value="<?= e($b['name'] ?? '') ?>"></label>
  <label><span>URL-slug (авто-генерируется)</span><input name="bslug" placeholder="например: lenovo" value="<?= e($b['slug'] ?? '') ?>"></label>
  <div class="checks"><label><input type="checkbox" name="is_active" <?= ($b['is_active'] ?? 1) ? 'checked' : '' ?>>Активен</label></div>
  <p><button type="submit">Сохранить</button> <a class="ghost" href="?page=brands">Отмена</a></p>
</form>
<?php endif ?>
<table>
  <tr><th>Название</th><th>Slug</th><th>Статус</th><th></th></tr>
  <?php foreach ($pdo->query('SELECT * FROM brands ORDER BY name')->fetchAll() as $r): ?>
  <tr>
    <td><b><?= e($r['name']) ?></b></td>
    <td><code><?= e($r['slug']) ?></code></td>
    <td><?= $r['is_active'] ? '<span class="badge badge-green">Активен</span>' : '<span class="badge badge-gray">Скрыт</span>' ?></td>
    <td>
      <a class="btn btn-sm" href="?page=brands&edit=<?= $r['id'] ?>">Изменить</a>
      <form method="post" style="display:inline" onsubmit="return confirm('Удалить бренд?')">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="table" value="brands">
        <input type="hidden" name="id" value="<?= $r['id'] ?>">
        <button class="danger btn-sm" type="submit">Удалить</button>
      </form>
    </td>
  </tr>
  <?php endforeach ?>
</table>

<?php /* ════════ CATEGORIES ════════ */ elseif ($page === 'categories'):
  $editId = $_GET['edit'] ?? null;
  $ct = [];
  if ($editId && $editId !== 'new') {
      $st = $pdo->prepare('SELECT * FROM categories WHERE id=?');
      $st->execute([$editId]);
      $ct = $st->fetch() ?: [];
  }
?>
<div class="toolbar">
  <a class="btn" href="?page=categories&edit=new">+ Добавить категорию</a>
  <span style="color:#666">Всего: <?= $counts['categories'] ?></span>
</div>
<?php if ($editId !== null): ?>
<form class="box" method="post" style="max-width:480px">
  <input type="hidden" name="action" value="category">
  <input type="hidden" name="id" value="<?= e($ct['id'] ?? '') ?>">
  <h3 style="margin-top:0"><?= empty($ct['id']) ? 'Новая категория' : 'Редактировать категорию' ?></h3>
  <label><span>Название *</span><input name="name" required value="<?= e($ct['name'] ?? '') ?>"></label>
  <label><span>URL-slug (авто-генерируется)</span><input name="cslug" placeholder="например: gaming" value="<?= e($ct['slug'] ?? '') ?>"></label>
  <label><span>Порядок сортировки</span><input name="sort_order" type="number" value="<?= e($ct['sort_order'] ?? 0) ?>"></label>
  <div class="checks"><label><input type="checkbox" name="is_active" <?= ($ct['is_active'] ?? 1) ? 'checked' : '' ?>>Активна</label></div>
  <p><button type="submit">Сохранить</button> <a class="ghost" href="?page=categories">Отмена</a></p>
</form>
<?php endif ?>
<table>
  <tr><th>Название</th><th>Slug</th><th>Порядок</th><th>Статус</th><th></th></tr>
  <?php foreach ($pdo->query('SELECT * FROM categories ORDER BY sort_order,name')->fetchAll() as $r): ?>
  <tr>
    <td><b><?= e($r['name']) ?></b></td>
    <td><code><?= e($r['slug']) ?></code></td>
    <td><?= $r['sort_order'] ?></td>
    <td><?= $r['is_active'] ? '<span class="badge badge-green">Активна</span>' : '<span class="badge badge-gray">Скрыта</span>' ?></td>
    <td>
      <a class="btn btn-sm" href="?page=categories&edit=<?= $r['id'] ?>">Изменить</a>
      <form method="post" style="display:inline" onsubmit="return confirm('Удалить категорию?')">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="table" value="categories">
        <input type="hidden" name="id" value="<?= $r['id'] ?>">
        <button class="danger btn-sm" type="submit">Удалить</button>
      </form>
    </td>
  </tr>
  <?php endforeach ?>
</table>

<?php /* ════════ REVIEWS ════════ */ elseif ($page === 'reviews'):
  $addMode = isset($_GET['add']) || isset($_GET['edit_rev']);
  $rv = [];
  if (isset($_GET['edit_rev'])) {
      $st = $pdo->prepare('SELECT * FROM reviews WHERE id=?');
      $st->execute([$_GET['edit_rev']]);
      $rv = $st->fetch() ?: [];
  }
  $allProducts = $pdo->query('SELECT id,name FROM products WHERE is_active=1 ORDER BY name')->fetchAll();
?>
<div class="toolbar">
  <a class="btn" href="?page=reviews&add=1">+ Добавить отзыв</a>
  <span style="color:#666">Всего: <?= $counts['reviews'] ?></span>
</div>
<?php if ($addMode): ?>
<form class="box" method="post">
  <input type="hidden" name="action" value="review">
  <input type="hidden" name="rev_id" value="<?= e($rv['id'] ?? '') ?>">
  <h3 style="margin-top:0"><?= empty($rv['id']) ? 'Новый отзыв' : 'Редактировать отзыв' ?></h3>
  <div class="grid">
    <label><span>Товар (необязательно)</span>
      <select name="product_id">
        <option value="">— Общий отзыв о магазине —</option>
        <?php foreach ($allProducts as $pr): ?>
        <option value="<?= $pr['id'] ?>" <?= ($rv['product_id'] ?? '') == $pr['id'] ? 'selected' : '' ?>><?= e($pr['name']) ?></option>
        <?php endforeach ?>
      </select>
    </label>
    <label><span>Автор *</span><input name="author_name" required value="<?= e($rv['author_name'] ?? '') ?>"></label>
    <label><span>Инициалы</span><input name="initials" placeholder="А.Б." value="<?= e($rv['initials'] ?? '') ?>"></label>
  </div>
  <div class="grid2">
    <label><span>Оценка</span>
      <select name="rating">
        <?php for ($i = 5; $i >= 1; $i--): ?>
        <option <?= ($rv['rating'] ?? 5) == $i ? 'selected' : '' ?>><?= $i ?></option>
        <?php endfor ?>
      </select>
    </label>
    <label><span>Источник</span><input name="source" value="<?= e($rv['source'] ?? 'site') ?>"></label>
  </div>
  <label><span>Текст отзыва *</span><textarea name="body" required><?= e($rv['body'] ?? '') ?></textarea></label>
  <div class="checks"><label><input type="checkbox" name="is_approved" <?= ($rv['is_approved'] ?? 1) ? 'checked' : '' ?>>Показывать на сайте</label></div>
  <p><button type="submit">Сохранить</button> <a class="ghost" href="?page=reviews">Отмена</a></p>
</form>
<?php endif ?>
<table>
  <tr><th>Автор</th><th>Товар</th><th>Отзыв</th><th>Оценка</th><th>Статус</th><th></th></tr>
  <?php
  $rows = $pdo->query('SELECT r.*,p.name pname FROM reviews r LEFT JOIN products p ON p.id=r.product_id ORDER BY r.id DESC')->fetchAll();
  foreach ($rows as $r): ?>
  <tr>
    <td><b><?= e($r['author_name']) ?></b><br><small><?= e($r['initials'] ?? '') ?></small></td>
    <td><small><?= e($r['pname'] ?? '— магазин —') ?></small></td>
    <td><?= mb_substr(e($r['body']), 0, 80) ?>…</td>
    <td>★ <?= $r['rating'] ?></td>
    <td><?= $r['is_approved'] ? '<span class="badge badge-green">Видно</span>' : '<span class="badge badge-gray">Скрыто</span>' ?></td>
    <td style="white-space:nowrap">
      <a class="btn btn-sm" href="?page=reviews&edit_rev=<?= $r['id'] ?>">Изменить</a>
      <form method="post" style="display:inline" onsubmit="return confirm('Удалить отзыв?')">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="table" value="reviews">
        <input type="hidden" name="id" value="<?= $r['id'] ?>">
        <button class="danger btn-sm" type="submit">Удалить</button>
      </form>
    </td>
  </tr>
  <?php endforeach ?>
</table>

<?php /* ════════ PROMOTIONS ════════ */ elseif ($page === 'promotions'):
  $editId = $_GET['edit'] ?? null;
  $x = [];
  if ($editId && $editId !== 'new') {
      $st = $pdo->prepare('SELECT * FROM promotions WHERE id=?');
      $st->execute([$editId]);
      $x = $st->fetch() ?: [];
  }
?>
<div class="toolbar">
  <a class="btn" href="?page=promotions&edit=new">+ Добавить акцию</a>
  <span style="color:#666">Всего: <?= $counts['promotions'] ?></span>
</div>
<?php if ($editId !== null): ?>
<form class="box" method="post">
  <input type="hidden" name="action" value="promotion">
  <input type="hidden" name="id" value="<?= e($x['id'] ?? '') ?>">
  <h3 style="margin-top:0"><?= empty($x['id']) ? 'Новая акция' : 'Редактировать акцию' ?></h3>
  <div class="grid">
    <label><span>Заголовок *</span><input name="title" required value="<?= e($x['title'] ?? '') ?>"></label>
    <label><span>Бейдж (короткий тег)</span><input name="badge" placeholder="Горячее предложение" value="<?= e($x['badge'] ?? '') ?>"></label>
    <label><span>Цвет</span>
      <select name="color">
        <?php foreach (['orange'=>'Оранжевый','dark'=>'Тёмный','blue'=>'Синий'] as $val=>$label): ?>
        <option value="<?= $val ?>" <?= ($x['color'] ?? 'orange') === $val ? 'selected' : '' ?>><?= $label ?></option>
        <?php endforeach ?>
      </select>
    </label>
    <label><span>Текст кнопки</span><input name="button_text" value="<?= e($x['button_text'] ?? '') ?>"></label>
    <label><span>Ссылка кнопки</span><input name="button_url" value="<?= e($x['button_url'] ?? '') ?>"></label>
    <label><span>Порядок</span><input name="sort_order" type="number" value="<?= e($x['sort_order'] ?? 0) ?>"></label>
  </div>
  <label><span>Описание</span><textarea name="description"><?= e($x['description'] ?? '') ?></textarea></label>
  <div class="checks"><label><input type="checkbox" name="is_active" <?= ($x['is_active'] ?? 1) ? 'checked' : '' ?>>Показывать</label></div>
  <p><button type="submit">Сохранить</button> <a class="ghost" href="?page=promotions">Отмена</a></p>
</form>
<?php endif ?>
<table>
  <tr><th>Акция</th><th>Описание</th><th>Цвет</th><th>Статус</th><th></th></tr>
  <?php foreach ($pdo->query('SELECT * FROM promotions ORDER BY sort_order,id')->fetchAll() as $r): ?>
  <tr>
    <td><b><?= e($r['title']) ?></b><br><small><?= e($r['badge']) ?></small></td>
    <td><?= mb_substr(e($r['description'] ?? ''), 0, 80) ?></td>
    <td><?= e($r['color']) ?></td>
    <td><?= $r['is_active'] ? '<span class="badge badge-green">Активна</span>' : '<span class="badge badge-gray">Скрыта</span>' ?></td>
    <td>
      <a class="btn btn-sm" href="?page=promotions&edit=<?= $r['id'] ?>">Изменить</a>
      <form method="post" style="display:inline" onsubmit="return confirm('Удалить акцию?')">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="table" value="promotions">
        <input type="hidden" name="id" value="<?= $r['id'] ?>">
        <button class="danger btn-sm" type="submit">Удалить</button>
      </form>
    </td>
  </tr>
  <?php endforeach ?>
</table>

<?php /* ════════ LEADS ════════ */ elseif ($page === 'leads'):
  $rows = $pdo->query('SELECT * FROM leads ORDER BY id DESC')->fetchAll();
?>
<table>
  <tr><th>Дата</th><th>Клиент</th><th>Контакты</th><th>Сообщение</th><th>Статус</th></tr>
  <?php foreach ($rows as $r): ?>
  <tr>
    <td><?= e($r['created_at']) ?></td>
    <td><?= e($r['name']) ?></td>
    <td><?= e($r['phone']) ?><br><small><?= e($r['email']) ?></small></td>
    <td><?= e($r['message']) ?></td>
    <td>
      <?php $st = $r['status'];
      $cls = $st === 'new' ? 'badge-orange' : ($st === 'done' ? 'badge-green' : 'badge-gray');
      $lbl = $st === 'new' ? 'Новая' : ($st === 'done' ? 'Готово' : 'В работе'); ?>
      <span class="badge <?= $cls ?>"><?= $lbl ?></span>
    </td>
  </tr>
  <?php endforeach ?>
</table>

<?php /* ════════ PASSWORD ════════ */ elseif ($page === 'password'): ?>
<form class="box" method="post" style="max-width:480px">
  <input type="hidden" name="action" value="password">
  <label><span>Новый пароль (минимум 10 символов)</span><input name="password" type="password" minlength="10" required></label>
  <button type="submit">Сменить пароль</button>
</form>
<?php endif ?>
</main>
</body>
</html>
