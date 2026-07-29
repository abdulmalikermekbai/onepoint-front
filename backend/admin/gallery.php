<?php
require __DIR__ . '/../config.php';
admin_required();
$pdo = db();
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = (int)($_POST['product_id'] ?? 0);
        $action = $_POST['action'] ?? '';

        if ($action === 'upload') {
            $files = $_FILES['images'] ?? [];
            $total = count($files['name'] ?? []);
            if (!$id || !$total) throw new RuntimeException('Выберите товар и хотя бы один файл.');

            $next = (int)$pdo->query('SELECT COALESCE(MAX(sort_order),0)+1 FROM product_images WHERE product_id=' . $id)->fetchColumn();
            $add = $pdo->prepare('INSERT INTO product_images(product_id,image_url,is_main,sort_order) VALUES(?,?,?,?)');

            for ($i = 0; $i < $total; $i++) {
                if (empty($files['name'][$i])) continue;
                $file = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];
                $url = upload_product_image($file);
                if ($url) {
                    $hasMain = (bool)$pdo->query('SELECT COUNT(*) FROM product_images WHERE product_id=' . $id . ' AND is_main=1')->fetchColumn();
                    $add->execute([$id, $url, !$hasMain ? 1 : 0, $next++]);
                }
            }

            // Sync main image in products table
            $main = $pdo->query('SELECT image_url FROM product_images WHERE product_id=' . $id . ' ORDER BY is_main DESC, sort_order, id LIMIT 1')->fetchColumn();
            if ($main) {
                $pdo->prepare('UPDATE products SET image_url=? WHERE id=?')->execute([$main, $id]);
            }

            $message = 'Фотографии успешно загружены.';
        }

        if ($action === 'main') {
            $image = (int)$_POST['image_id'];
            $pdo->prepare('UPDATE product_images SET is_main=0 WHERE product_id=?')->execute([$id]);
            $pdo->prepare('UPDATE product_images SET is_main=1 WHERE id=? AND product_id=?')->execute([$image, $id]);
            $url = $pdo->query('SELECT image_url FROM product_images WHERE id=' . $image)->fetchColumn();
            $pdo->prepare('UPDATE products SET image_url=? WHERE id=?')->execute([$url, $id]);
            $message = 'Главная фотография установлена.';
        }

        if ($action === 'delete') {
            $image = (int)$_POST['image_id'];
            $pdo->prepare('DELETE FROM product_images WHERE id=? AND product_id=?')->execute([$image, $id]);
            $main = $pdo->query('SELECT image_url FROM product_images WHERE product_id=' . $id . ' ORDER BY is_main DESC, sort_order, id LIMIT 1')->fetchColumn();
            $pdo->prepare('UPDATE products SET image_url=? WHERE id=?')->execute([$main ?: null, $id]);
            $message = 'Фотография удалена.';
        }
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

$products = $pdo->query('SELECT id,name FROM products ORDER BY name')->fetchAll();
$selected = (int)($_GET['product_id'] ?? $_POST['product_id'] ?? ($products[0]['id'] ?? 0));
$images = [];

if ($selected) {
    $s = $pdo->prepare('SELECT * FROM product_images WHERE product_id=? ORDER BY is_main DESC, sort_order, id');
    $s->execute([$selected]);
    $images = $s->fetchAll();
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Галерея товара — OnePoint Admin</title>
  <style>
    :root {
      --primary: #ff5a1f;
      --bg: #f5f6f8;
      --card-bg: #ffffff;
      --text: #17181d;
      --text-muted: #6b6c74;
      --border: #e2e4e9;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      margin: 0;
      color: var(--text);
      padding: 24px 16px;
    }
    .box {
      max-width: 1100px;
      margin: 0 auto;
      background: var(--card-bg);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    h1 { margin: 0; font-size: 24px; font-weight: 800; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: #fff;
      border: 0;
      border-radius: 10px;
      padding: 10px 18px;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: opacity .2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-ghost {
      background: #fff;
      color: var(--text);
      border: 1.5px solid var(--border);
    }
    .btn-ghost:hover { background: #f8f9fa; }
    select, input[type="file"] {
      width: 100%;
      padding: 12px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      font-size: 15px;
      background: #fff;
      outline: none;
    }
    .dropzone {
      border: 2px dashed var(--primary);
      border-radius: 16px;
      background: rgba(255, 90, 31, 0.03);
      padding: 32px 20px;
      text-align: center;
      cursor: pointer;
      transition: all .2s;
      margin: 20px 0;
    }
    .dropzone:hover, .dropzone.dragover {
      background: rgba(255, 90, 31, 0.08);
      border-color: #e04810;
    }
    .dropzone-icon {
      font-size: 40px;
      margin-bottom: 8px;
    }
    .preview-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
    .preview-item {
      width: 90px;
      height: 90px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid var(--border);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
      margin-top: 32px;
    }
    .photo-card {
      border: 2px solid var(--border);
      border-radius: 16px;
      padding: 14px;
      background: #fff;
      position: relative;
      transition: all .2s;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .photo-card.is-main {
      border-color: var(--primary);
      box-shadow: 0 4px 16px rgba(255, 90, 31, 0.15);
    }
    .photo-card img {
      width: 100%;
      height: 170px;
      object-fit: contain;
      background: #f8f9fa;
      border-radius: 10px;
    }
    .main-badge {
      position: absolute;
      top: 22px;
      left: 22px;
      background: var(--primary);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 100px;
      text-transform: uppercase;
    }
    .actions-row {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }
    .actions-row form { flex: 1; }
    .actions-row button { width: 100%; font-size: 12.5px; padding: 8px; }
    .alert-success { background: #e6f4ea; color: #137333; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; }
    .alert-error { background: #fce8e6; color: #c5221f; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; }
  </style>
</head>
<body>

<main class="box">
  <div class="header-row">
    <a href="index.php?page=products" class="btn btn-ghost">← К списку товаров</a>
    <h1>🖼️ Загрузка и управление галереей</h1>
  </div>

  <?php if ($message): ?>
    <div class="alert-success"><?= e($message) ?></div>
  <?php endif; ?>
  <?php if ($error): ?>
    <div class="alert-error"><?= e($error) ?></div>
  <?php endif; ?>

  <form method="get" style="margin-bottom: 24px;">
    <label style="font-weight: 700; display: block; margin-bottom: 8px;">Выберите ноутбук:</label>
    <select name="product_id" onchange="this.form.submit()">
      <?php foreach ($products as $p): ?>
        <option value="<?= $p['id'] ?>" <?= $p['id'] === $selected ? 'selected' : '' ?>>
          <?= e($p['name']) ?>
        </option>
      <?php endforeach; ?>
    </select>
  </form>

  <form method="post" enctype="multipart/form-data" id="uploadForm">
    <input type="hidden" name="action" value="upload">
    <input type="hidden" name="product_id" value="<?= $selected ?>">

    <div class="dropzone" id="dropzone">
      <div class="dropzone-icon">📁</div>
      <div style="font-weight: 800; font-size: 17px; margin-bottom: 4px;">
        Перетащите сюда изображения или нажмите для выбора
      </div>
      <div style="color: var(--text-muted); font-size: 13.5px;">
        Поддерживаются JPG, PNG и WebP до 5 МБ каждый. Можно выбрать сразу несколько файлов.
      </div>
      <input type="file" name="images[]" id="fileInput" accept="image/jpeg,image/png,image/webp" multiple style="display: none;">
    </div>

    <div class="preview-grid" id="previewGrid"></div>

    <button type="submit" className="btn" style="margin-top: 16px;" id="submitBtn">
      Загрузить выбранные фото
    </button>
  </form>

  <h2 style="font-size: 20px; font-weight: 800; margin-top: 40px; margin-bottom: 16px;">
    Загруженные фотографии (<?= count($images) ?>)
  </h2>

  <?php if (empty($images)): ?>
    <div style="text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg); border-radius: 14px;">
      У этого товара пока нет загруженных фотографий. Воспользуйтесь формой выше.
    </div>
  <?php else: ?>
    <section class="grid">
      <?php foreach ($images as $image): ?>
        <article class="photo-card <?= $image['is_main'] ? 'is-main' : '' ?>">
          <?php if ($image['is_main']): ?>
            <span class="main-badge">Главная</span>
          <?php endif; ?>

          <img src="<?= e($image['image_url']) ?>" alt="Фото товара" loading="lazy">

          <div class="actions-row">
            <?php if (!$image['is_main']): ?>
              <form method="post">
                <input type="hidden" name="action" value="main">
                <input type="hidden" name="product_id" value="<?= $selected ?>">
                <input type="hidden" name="image_id" value="<?= $image['id'] ?>">
                <button class="btn btn-ghost">Сделать главной</button>
              </form>
            <?php endif; ?>

            <form method="post" onsubmit="return confirm('Удалить эту фотографию?');">
              <input type="hidden" name="action" value="delete">
              <input type="hidden" name="product_id" value="<?= $selected ?>">
              <input type="hidden" name="image_id" value="<?= $image['id'] ?>">
              <button class="btn btn-ghost" style="color: #c5221f;">Удалить</button>
            </form>
          </div>
        </article>
      <?php endforeach; ?>
    </section>
  <?php endif; ?>
</main>

<script>
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewGrid = document.getElementById('previewGrid');

  dropzone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    fileInput.files = files;
    handleFiles(files);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  function handleFiles(files) {
    previewGrid.innerHTML = '';
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-item';
        previewGrid.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
</script>

</body>
</html>
