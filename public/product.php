<?php
/**
 * OnePoint.kz - Dynamic Product Handler & Fallback for ps.kz Apache Hosting
 * 
 * This file handles dynamic product requests when a product was added in the admin panel
 * after the static build was generated. It fetches product data from the API, renders
 * a fully styled, responsive, SEO-optimized page matching Next.js design, and caches it
 * statically on disk for maximum performance.
 */

declare(strict_types=1);

$rawUri = $_SERVER['REQUEST_URI'] ?? '';
$slug = $_GET['slug'] ?? '';

if (empty($slug)) {
    if (preg_match('#^/product/([^/?#]+)#i', $rawUri, $matches)) {
        $slug = $matches[1];
    }
}

$slug = trim(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)$slug));

if (empty($slug)) {
    header('Location: /catalog', true, 301);
    exit;
}

$apiUrl = 'https://api.onepoint.kz/api/products.php?slug=' . urlencode($slug) . '&_t=' . time();

$ctx = stream_context_create([
    'http' => [
        'timeout' => 6,
        'header' => "Accept: application/json\r\nUser-Agent: OnePoint-Dynamic-SSR/1.0\r\n"
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
    ]
]);

$response = @file_get_contents($apiUrl, false, $ctx);
$data = $response ? json_decode($response, true) : null;
$product = $data['product'] ?? null;

if (!$product) {
    http_response_code(404);
    if (file_exists(__DIR__ . '/404.html')) {
        include __DIR__ . '/404.html';
    } elseif (file_exists(__DIR__ . '/404/index.html')) {
        include __DIR__ . '/404/index.html';
    } else {
        echo '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>404 — Товар не найден | OnePoint</title></head><body style="font-family:sans-serif;text-align:center;padding:80px 20px;"><h1>Товар не найден</h1><p>Возможно, товар был перемещен или снят с продажи.</p><p><a href="/catalog" style="color:#ff5a1f;font-weight:bold;">Перейти в каталог</a></p></body></html>';
    }
    exit;
}

// Extract product data
$id = (int)($product['id'] ?? 0);
$name = htmlspecialchars($product['name'] ?? 'Ноутбук', ENT_QUOTES, 'UTF-8');
$brand = htmlspecialchars($product['brand'] ?? 'Ноутбуки', ENT_QUOTES, 'UTF-8');
$series = htmlspecialchars($product['series'] ?? '', ENT_QUOTES, 'UTF-8');
$model = htmlspecialchars($product['model'] ?? $name, ENT_QUOTES, 'UTF-8');
$sku = htmlspecialchars($product['sku'] ?? ('OP-' . $id), ENT_QUOTES, 'UTF-8');
$categoryName = htmlspecialchars($product['category'] ?? 'Ноутбуки', ENT_QUOTES, 'UTF-8');
$categorySlug = htmlspecialchars($product['category_slug'] ?? 'gaming', ENT_QUOTES, 'UTF-8');
$price = (float)($product['price'] ?? 0);
$oldPrice = !empty($product['old_price']) ? (float)$product['old_price'] : 0;
$inStock = !empty($product['in_stock']);
$isNew = !empty($product['is_new']);
$isHit = !empty($product['is_hit']);
$isSale = !empty($product['is_sale']);
$isUpcoming = !empty($product['is_upcoming']);

$discountPercent = ($oldPrice > $price && $oldPrice > 0) ? (int)round((($oldPrice - $price) / $oldPrice) * 100) : 0;
$saving = ($oldPrice > $price) ? ($oldPrice - $price) : 0;

$formattedPrice = number_format($price, 0, '', ' ') . ' ₸';
$formattedOldPrice = $oldPrice > 0 ? number_format($oldPrice, 0, '', ' ') . ' ₸' : '';
$formattedSaving = $saving > 0 ? number_format($saving, 0, '', ' ') . ' ₸' : '';

function formatImgUrl($url) {
    if (empty($url)) return '';
    $url = trim((string)$url);
    if (preg_match('#^(https?:|data:|blob:)#i', $url)) return $url;
    return 'https://api.onepoint.kz/' . ltrim($url, '/');
}

$mainImage = formatImgUrl($product['image_url'] ?? '');
$gallery = [];
if (!empty($product['gallery']) && is_array($product['gallery'])) {
    foreach ($product['gallery'] as $g) {
        $u = formatImgUrl($g['image_url'] ?? ($g['url'] ?? ''));
        if ($u && !in_array($u, $gallery, true)) $gallery[] = $u;
    }
}
if ($mainImage && !in_array($mainImage, $gallery, true)) {
    array_unshift($gallery, $mainImage);
}
if (empty($gallery) && $mainImage) {
    $gallery = [$mainImage];
}

$seoTitle = htmlspecialchars($product['meta_title'] ?: ($name . ' — купить в Алматы, цены | OnePoint.kz'), ENT_QUOTES, 'UTF-8');
$seoDesc = htmlspecialchars($product['meta_description'] ?: ($product['short_description'] ?: "Купить {$name} в интернет-магазине OnePoint.kz. Официальная гарантия 1 год, видео-проверка перед отправкой, доставка по Алматы и всему Казахстану."), ENT_QUOTES, 'UTF-8');
$productUrl = 'https://onepoint.kz/product/' . urlencode($slug);
$firstImage = !empty($gallery[0]) ? $gallery[0] : 'https://onepoint.kz/icon.svg';

$waLink = 'https://wa.me/77075511979?text=' . urlencode("Здравствуйте! Хочу заказать: {$product['name']} за {$formattedPrice}");

// Specs list
$specs = [
    ['Бренд', $brand],
    ['Серия', $series ?: '—'],
    ['Модель', $model ?: '—'],
    ['Партномер', $sku ?: '—'],
    ['Состояние', !empty($product['product_condition']) ? $product['product_condition'] : (!empty($product['condition']) ? $product['condition'] : ($isNew ? 'Новый, запечатанный' : 'Отличное'))],
    ['Гарантия', !empty($product['warranty']) ? $product['warranty'] : '12 месяцев'],
    ['Процессор', !empty($product['processor']) ? $product['processor'] : '—'],
    ['Видеокарта', !empty($product['gpu']) ? $product['gpu'] : '—'],
    ['Оперативная память', !empty($product['ram']) ? $product['ram'] : '—'],
    ['Накопитель', !empty($product['storage']) ? $product['storage'] : '—'],
    ['Диагональ экрана', !empty($product['display_size']) ? $product['display_size'] : (!empty($product['display']) ? $product['display'] : '—')],
    ['Разрешение', !empty($product['resolution']) ? $product['resolution'] : '—'],
    ['Частота обновления', !empty($product['refresh_rate']) ? $product['refresh_rate'] : '—'],
    ['Тип матрицы', !empty($product['matrix_type']) ? $product['matrix_type'] : '—'],
    ['Операционная система', !empty($product['os']) ? $product['os'] : 'Windows 11'],
    ['Цвет', !empty($product['color']) ? $product['color'] : '—'],
    ['Вес', !empty($product['weight']) ? $product['weight'] : '—'],
    ['Аккумулятор', !empty($product['battery']) ? $product['battery'] : '—'],
    ['Wi-Fi', !empty($product['wifi']) ? $product['wifi'] : '—'],
    ['Bluetooth', !empty($product['bluetooth']) ? $product['bluetooth'] : '—'],
    ['Веб-камера', !empty($product['camera']) ? $product['camera'] : '—'],
    ['Разъёмы', !empty($product['ports']) ? $product['ports'] : '—'],
    ['Размеры', !empty($product['dimensions']) ? $product['dimensions'] : '—'],
    ['Клавиатура', !empty($product['keyboard']) ? $product['keyboard'] : '—'],
];

if (!empty($product['dynamic_characteristics']) && is_array($product['dynamic_characteristics'])) {
    foreach ($product['dynamic_characteristics'] as $dc) {
        if (!empty($dc['name']) && !empty($dc['value'])) {
            $specs[] = [$dc['name'], $dc['value']];
        }
    }
}

// Schema.org JSON-LD
$schemaOrg = [
    '@context' => 'https://schema.org/',
    '@type' => 'Product',
    'name' => $product['name'] ?? '',
    'image' => $gallery,
    'description' => $product['short_description'] ?: ("Ноутбук " . ($product['name'] ?? '')),
    'sku' => $sku,
    'brand' => [
        '@type' => 'Brand',
        'name' => $product['brand'] ?? 'OnePoint'
    ],
    'offers' => [
        '@type' => 'Offer',
        'url' => $productUrl,
        'priceCurrency' => 'KZT',
        'price' => $price,
        'priceValidUntil' => date('Y-m-d', strtotime('+1 year')),
        'itemCondition' => 'https://schema.org/NewCondition',
        'availability' => $inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller' => [
            '@type' => 'Organization',
            'name' => 'OnePoint.kz'
        ]
    ]
];

ob_start();
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title><?= $seoTitle ?></title>
  <meta name="description" content="<?= $seoDesc ?>">
  <link rel="canonical" href="<?= $productUrl ?>">
  
  <meta property="og:type" content="product">
  <meta property="og:title" content="<?= $seoTitle ?>">
  <meta property="og:description" content="<?= $seoDesc ?>">
  <meta property="og:url" content="<?= $productUrl ?>">
  <meta property="og:image" content="<?= htmlspecialchars($firstImage, ENT_QUOTES, 'UTF-8') ?>">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= $seoTitle ?>">
  <meta name="twitter:description" content="<?= $seoDesc ?>">
  <meta name="twitter:image" content="<?= htmlspecialchars($firstImage, ENT_QUOTES, 'UTF-8') ?>">

  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <script type="application/ld+json">
  <?= json_encode($schemaOrg, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) ?>
  </script>

  <style>
    :root {
      --bg: #ffffff;
      --surface: #F6F6F8;
      --surface-2: #EFEFF2;
      --border: #E8E8EC;
      --text: #0B0B0D;
      --text-muted: #6B6B72;
      --text-soft: #9C9CA3;
      --accent: #FF5A1F;
      --accent-hover: #E64A12;
      --accent-tint: #FFF0E8;
      --accent-tint-2: #FFE3D3;
      --dark: #0D0D11;
      --dark-2: #17171D;
      --dark-3: #1F1F27;
      --success: #1AA35C;
      --success-tint: #E8F7EF;
      --warn: #C98A00;
      --font: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --radius-lg: 20px;
      --radius-md: 16px;
      --radius-sm: 12px;
      --container: 1320px;
    }
    
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      overflow-x: hidden;
      width: 100%;
      max-width: 100%;
      min-width: 320px;
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
    ul { list-style: none; }

    .wrap {
      max-width: var(--container);
      margin: 0 auto;
      padding: 0 32px;
      width: 100%;
    }
    @media (max-width: 768px) {
      .wrap { padding: 0 16px; }
    }

    /* Announcement */
    .announce {
      background: var(--dark);
      color: #fff;
      text-align: center;
      font-size: 13px;
      font-weight: 500;
      padding: 9px 12px;
      letter-spacing: .01em;
    }
    .announce-mobile { display: none; }
    @media(max-width: 680px) {
      .announce-desktop { display: none; }
      .announce-mobile { display: inline; font-size: 11.5px; line-height: 1.35; }
    }

    /* Header */
    .site-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255,255,255,.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
      gap: 16px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 9px;
      font-weight: 800;
      font-size: 22px;
      letter-spacing: -.02em;
      color: var(--text);
      flex-shrink: 0;
    }
    .logo .dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 4px var(--accent-tint);
    }
    .nav-main {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-shrink: 0;
    }
    .nav-main a {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--text);
      transition: color .2s;
      padding: 6px 0;
    }
    .nav-main a:hover { color: var(--accent); }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn-icon-header {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--surface);
      border: 1.5px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
      transition: all .2s;
    }
    .btn-icon-header:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .btn-wa-header-round {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #25D366;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(37,211,102,.35);
      transition: all .2s;
    }
    .btn-wa-header-round:hover {
      transform: scale(1.05);
    }
    .btn-phone-header-desktop {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 100px;
      background: var(--surface);
      color: var(--text);
      font-weight: 700;
      font-size: 13.5px;
      border: 1.5px solid var(--border);
    }
    .hamburger {
      display: none;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1.5px solid var(--border);
      background: #fff;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    /* Category Strip */
    .cat-strip {
      border-bottom: 1px solid var(--border);
      background: #fff;
    }
    .cat-strip .wrap {
      display: flex;
      gap: 16px;
      padding: 12px 32px;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .cat-strip .wrap::-webkit-scrollbar { display: none; }
    .cat-link {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
      transition: color .2s;
    }
    .cat-link:hover, .cat-link.active {
      color: var(--text);
      font-weight: 700;
    }

    /* Mobile Nav Drawer */
    .mobile-nav-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.5);
      z-index: 200;
      opacity: 0;
      visibility: hidden;
      transition: all .3s;
    }
    .mobile-nav-overlay.open { opacity: 1; visibility: visible; }
    .mobile-nav-panel {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 300px;
      max-width: 85vw;
      background: #fff;
      z-index: 201;
      transform: translateX(-100%);
      transition: transform .35s cubic-bezier(.2,.8,.2,1);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .mobile-nav-panel.open { transform: translateX(0); }
    .mobile-nav-header {
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .mobile-nav-links {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .mobile-nav-links a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      color: var(--text);
    }
    .mobile-nav-links a:hover {
      background: var(--surface);
      color: var(--accent);
    }

    @media(max-width: 960px) {
      .nav-main { display: none; }
      .hamburger { display: flex; }
      .btn-phone-header-desktop { display: none; }
      .cat-strip .wrap { padding: 10px 16px; gap: 14px; }
    }

    /* Product Grid */
    .product-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 48px;
      align-items: flex-start;
      margin-top: 32px;
    }
    @media(max-width: 960px) {
      .product-detail-grid {
        grid-template-columns: 1fr;
        gap: 28px;
        margin-top: 20px;
      }
    }

    /* ============ GALLERY ============ */
    .gallery-container {
      position: sticky;
      top: 88px;
      width: 100%;
    }
    @media(max-width: 960px) {
      .gallery-container {
        position: relative;
        top: 0;
      }
    }

    /* Main Product Image Stage */
    .gallery-main {
      width: 100%;
      height: 420px;
      background: #ffffff;
      border: 1.5px solid var(--border);
      border-radius: 24px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      user-select: none;
      touch-action: pan-y;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    @media(max-width: 680px) {
      .gallery-main {
        height: 340px;
        border-radius: 20px;
      }
    }
    .gallery-main img {
      max-width: 90%;
      max-height: 90%;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
      margin: auto;
      transition: opacity .2s ease;
    }
    .gallery-counter {
      position: absolute;
      bottom: 14px;
      right: 14px;
      background: rgba(0,0,0,0.72);
      color: #fff;
      backdrop-filter: blur(6px);
      padding: 5px 14px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: .02em;
      z-index: 2;
      pointer-events: none;
    }

    /* Thumbnails 4-Column Grid (exact match with reference) */
    .gallery-thumbs-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 14px;
    }
    .thumb-card-btn {
      width: 100%;
      aspect-ratio: 1 / 1;
      border: 1.5px solid var(--border);
      border-radius: 14px;
      background: #ffffff;
      padding: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      transition: border-color .2s, transform .2s, box-shadow .2s;
      outline: none;
    }
    .thumb-card-btn.active {
      border: 2.5px solid var(--accent);
      box-shadow: 0 4px 14px rgba(255,90,31,0.25);
    }
    .thumb-card-btn img {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
      margin: auto;
      pointer-events: none;
      border-radius: 8px;
    }

    /* Badges */
    .badges-row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 12.5px;
      font-weight: 800;
    }
    .badge-new { background: var(--success); color: #fff; }
    .badge-hit { background: var(--dark); color: #fff; }
    .badge-sale {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 4px 12px -2px rgba(255,90,31,.4);
    }
    .badge-upcoming { background: #8b5cf6; color: #fff; }

    /* Product Title & Info */
    .product-brand {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-soft);
      text-transform: uppercase;
      letter-spacing: .06em;
      margin-bottom: 8px;
    }
    .product-title {
      font-size: 28px;
      font-weight: 900;
      line-height: 1.25;
      letter-spacing: -.02em;
      margin-bottom: 20px;
      color: var(--text);
    }
    @media(max-width: 680px) {
      .product-title {
        font-size: 22px;
        line-height: 1.3;
        margin-bottom: 16px;
      }
    }

    /* Price Box */
    .price-box {
      background: var(--surface);
      border-radius: var(--radius-lg);
      padding: 24px;
      border: 1px solid var(--border);
      margin-bottom: 24px;
    }
    @media(max-width: 680px) {
      .price-box {
        padding: 20px;
        border-radius: 18px;
        margin-bottom: 20px;
      }
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .price-current {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -.02em;
      color: var(--text);
    }
    @media(max-width: 680px) {
      .price-current { font-size: 28px; }
    }
    .price-old {
      font-size: 16px;
      color: var(--text-soft);
      text-decoration: line-through;
    }
    .price-saving {
      font-size: 13px;
      color: var(--success);
      font-weight: 700;
      margin-top: 4px;
    }
    .stock-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14.5px;
      font-weight: 700;
      margin-top: 14px;
      color: var(--success);
    }
    .stock-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 0 3px var(--success-tint);
    }

    /* CTAs */
    .actions-row {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .btn-wa-order {
      width: 100%;
      background: #25D366;
      color: #ffffff !important;
      padding: 16px 24px;
      border-radius: 16px;
      font-size: 15px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 10px 24px -6px rgba(37,211,102,.45);
      transition: background .2s, transform .2s;
      text-decoration: none;
    }
    .btn-wa-order svg {
      width: 22px;
      height: 22px;
      fill: #ffffff;
      flex-shrink: 0;
    }
    .btn-wa-order span {
      color: #ffffff !important;
      font-weight: 800;
    }
    .btn-wa-order:hover {
      background: #1ebe5a;
      transform: translateY(-2px);
    }
    .btn-call {
      width: 100%;
      background: #fff;
      color: var(--text) !important;
      border: 1.5px solid var(--border);
      padding: 16px 20px;
      border-radius: 16px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all .2s;
    }
    .btn-call:hover {
      border-color: var(--text);
      background: var(--surface);
      transform: translateY(-2px);
    }

    /* Trust row (exact match) */
    .trust-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }
    .trust-item {
      font-size: 13.5px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    .trust-item svg {
      width: 18px;
      height: 18px;
      color: var(--accent);
      flex-shrink: 0;
    }

    /* Tabs & Specs */
    .tabs-nav {
      display: flex;
      gap: 16px;
      border-bottom: 2px solid var(--border);
      margin-top: 48px;
      margin-bottom: 24px;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .tabs-nav::-webkit-scrollbar { display: none; }
    .tab-btn {
      background: none;
      border: none;
      padding: 14px 16px;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      white-space: nowrap;
      transition: color .2s, border-color .2s;
    }
    .tab-btn.active {
      color: var(--accent);
      border-color: var(--accent);
    }
    
    .spec-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .spec-table tr:nth-child(even) { background: var(--surface); }
    .spec-table td {
      padding: 14px 18px;
      font-size: 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    .spec-table td:first-child {
      color: var(--text-muted);
      width: 38%;
      font-weight: 600;
    }
    .spec-table td:last-child {
      font-weight: 600;
      color: var(--text);
      word-break: break-word;
    }
    @media(max-width: 680px) {
      .spec-table td {
        padding: 11px 13px;
        font-size: 13px;
      }
      .spec-table td:first-child {
        width: 44%;
      }
    }

    /* Description & Equipment card */
    .card-block {
      background: var(--surface);
      border-radius: var(--radius-lg);
      padding: 32px;
      border: 1px solid var(--border);
      line-height: 1.7;
    }
    @media(max-width: 680px) {
      .card-block {
        padding: 20px 18px;
        border-radius: var(--radius-md);
      }
    }
    .card-block h3 {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 16px;
    }

    /* Lightbox */
    .lightbox-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.94);
      backdrop-filter: blur(10px);
      z-index: 99999;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .lightbox-modal.open { display: flex; }
    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 24px;
      background: rgba(255,255,255,0.18);
      border: none;
      color: #fff;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
    }
    .lightbox-img-wrap {
      position: relative;
      max-width: 92vw;
      max-height: 78vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox-img-wrap img {
      max-width: 100%;
      max-height: 78vh;
      object-fit: contain;
      border-radius: 16px;
    }
    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.22);
      border: none;
      color: #fff;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 28px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox-prev { left: 20px; }
    .lightbox-next { right: 20px; }

    /* Lead Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(4px);
    }
    .modal-overlay.open { display: flex; }
    .modal-box {
      background: #fff;
      border-radius: 24px;
      padding: 36px;
      max-width: 440px;
      width: 100%;
      position: relative;
      box-shadow: 0 24px 60px rgba(0,0,0,0.2);
    }
    @media(max-width: 680px) {
      .modal-box { padding: 28px 20px; border-radius: 20px; }
    }
    .modal-close {
      position: absolute;
      top: 18px;
      right: 18px;
      background: var(--surface);
      border: none;
      font-size: 20px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      color: var(--text-soft);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-input {
      width: 100%;
      padding: 14px 18px;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      font-size: 15px;
      margin-bottom: 12px;
      outline: none;
      font-family: inherit;
    }
    .modal-input:focus { border-color: var(--accent); }
    .btn-submit {
      width: 100%;
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 16px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
    }
    .btn-submit:hover { background: var(--accent-hover); }

    /* Floating CTA Buttons on Mobile (exact match with screenshot) */
    .floating-wa-btn {
      position: fixed;
      left: 18px;
      bottom: 22px;
      z-index: 999;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #25d366;
      color: #ffffff !important;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px -4px rgba(37, 211, 102, 0.55);
      text-decoration: none;
      transition: transform .2s;
    }
    .floating-call-btn {
      position: fixed;
      right: 18px;
      bottom: 22px;
      z-index: 999;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #121316;
      color: #ffffff !important;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.45);
      cursor: pointer;
      transition: transform .2s;
    }

    /* Footer */
    footer {
      background: var(--dark);
      color: rgba(255,255,255,.65);
      padding: 64px 0 32px;
      margin-top: 80px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
      gap: 40px;
      margin-bottom: 48px;
    }
    @media(max-width: 960px) {
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    }
    @media(max-width: 580px) {
      .footer-grid { grid-template-columns: 1fr; gap: 28px; }
    }
    .footer-col h4 {
      font-size: 14.5px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #fff;
      letter-spacing: .02em;
    }
    .footer-col ul {
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 14px;
    }
    .footer-col a:hover { color: #fff; }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 24px;
      font-size: 13px;
      color: rgba(255,255,255,0.45);
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-bottom a:hover { color: #fff; }
  </style>
</head>
<body>

  <!-- Announcement -->
  <div class="announce">
    <span class="announce-desktop">ONEPOINT.KZ | Новые запечатанные ноутбуки с гарантией 1 год · Видео-проверка · Бесплатная подготовка (Windows / Office)</span>
    <span class="announce-mobile">Новые запечатанные ноутбуки с гарантией 1 год · Бесплатная подготовка (Win / Office)</span>
  </div>

  <!-- Header -->
  <header class="site-header">
    <div class="wrap header-row">
      <button class="hamburger" onclick="toggleMobileNav(true)" aria-label="Меню">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
          <path d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round"/>
        </svg>
      </button>

      <a href="/" class="logo">
        <span class="dot"></span>
        OnePoint
      </a>

      <nav class="nav-main">
        <a href="/catalog">Каталог</a>
        <a href="/bestsellers">Хиты</a>
        <a href="/promotions">Акции</a>
        <a href="/new-arrivals">Новинки</a>
        <a href="/contacts">Контакты</a>
        <a href="/favorites">Избранное</a>
      </nav>

      <div class="header-actions">
        <a href="/favorites" class="btn-icon-header" title="Избранное">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>
          </svg>
        </a>
        <a href="tel:+77075511979" class="btn-icon-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/>
          </svg>
        </a>
        <a href="https://wa.me/77075511979?text=Здравствуйте!%20Хочу%20проконсультироваться%20по%20ноутбукам." target="_blank" rel="noopener noreferrer" class="btn-wa-header-round">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Category Strip -->
    <div class="cat-strip">
      <div class="wrap">
        <a href="/catalog" class="cat-link active">Все</a>
        <a href="/catalog?cat=gaming" class="cat-link">Игровые</a>
        <a href="/catalog?cat=office" class="cat-link">Для работы</a>
        <a href="/catalog?cat=ultrabook" class="cat-link">Ультрабуки</a>
        <a href="/catalog?cat=macbook" class="cat-link">MacBook</a>
        <a href="/catalog?cat=designer" class="cat-link">Для дизайна</a>
        <a href="/catalog?cat=rtx" class="cat-link">RTX 50xx</a>
        <a href="/catalog?cat=oled" class="cat-link">OLED</a>
        <a href="/delivery" class="cat-link">Доставка</a>
      </div>
    </div>
  </header>

  <!-- Mobile Nav Overlay & Panel -->
  <div class="mobile-nav-overlay" id="mobileNavOverlay" onclick="toggleMobileNav(false)"></div>
  <div class="mobile-nav-panel" id="mobileNavPanel">
    <div class="mobile-nav-header">
      <a href="/" class="logo" onclick="toggleMobileNav(false)">
        <span class="dot"></span>
        OnePoint
      </a>
      <button class="modal-close" style="position:static;" onclick="toggleMobileNav(false)">✕</button>
    </div>
    <div class="mobile-nav-links">
      <a href="/catalog" onclick="toggleMobileNav(false)">Каталог</a>
      <a href="/bestsellers" onclick="toggleMobileNav(false)">Хиты продаж</a>
      <a href="/promotions" onclick="toggleMobileNav(false)">Акции</a>
      <a href="/new-arrivals" onclick="toggleMobileNav(false)">Новинки</a>
      <a href="/favorites" onclick="toggleMobileNav(false)">Избранное</a>
      <a href="/delivery" onclick="toggleMobileNav(false)">Доставка и оплата</a>
      <a href="/guarantee" onclick="toggleMobileNav(false)">Гарантия</a>
      <a href="/about" onclick="toggleMobileNav(false)">О компании</a>
      <a href="/contacts" onclick="toggleMobileNav(false)">Контакты</a>
      <a href="/faq" onclick="toggleMobileNav(false)">FAQ (Вопросы)</a>
      
      <div style="margin-top: 16px; padding: 0 4px;">
        <a href="https://wa.me/77075511979" target="_blank" rel="noopener noreferrer" style="background:#25D366; color:#fff !important; justify-content:center; border-radius:12px; font-weight:700;">
          WhatsApp консультация
        </a>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="wrap" style="padding-top: 16px; padding-bottom: 80px;">
    <div class="product-detail-grid">
      
      <!-- Gallery Column -->
      <div class="gallery-container">
        <div class="gallery-main" id="galleryMain" onclick="openLightbox()">
          <img id="mainImgElem" src="<?= htmlspecialchars($firstImage, ENT_QUOTES, 'UTF-8') ?>" alt="<?= $name ?>">
          <?php if (count($gallery) > 1): ?>
          <span class="gallery-counter" id="galleryCounter">1 / <?= count($gallery) ?></span>
          <?php endif; ?>
        </div>
        
        <?php if (count($gallery) > 1): ?>
        <div class="gallery-thumbs-grid">
          <?php foreach ($gallery as $idx => $img): ?>
          <button class="thumb-card-btn <?= $idx === 0 ? 'active' : '' ?>" onclick="switchPhoto(<?= $idx ?>)" aria-label="Фото <?= $idx + 1 ?>">
            <img src="<?= htmlspecialchars($img, ENT_QUOTES, 'UTF-8') ?>" alt="<?= $name ?> <?= $idx + 1 ?>">
          </button>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>
      </div>

      <!-- Info Column -->
      <div>
        <div class="badges-row">
          <?php if ($isNew): ?><span class="badge badge-new">Новинка</span><?php endif; ?>
          <?php if ($isHit): ?><span class="badge badge-hit">Хит продаж</span><?php endif; ?>
          <?php if ($isSale || $discountPercent > 0): ?><span class="badge badge-sale">🔥 Скидка <?= $discountPercent > 0 ? "-{$discountPercent}%" : '' ?></span><?php endif; ?>
          <?php if ($isUpcoming): ?><span class="badge badge-upcoming">Скоро в продаже</span><?php endif; ?>
        </div>

        <div class="product-brand"><?= $brand ?> <?= $series ? "· $series" : "" ?></div>
        <h1 class="product-title"><?= $name ?></h1>

        <div class="price-box">
          <div class="price-row">
            <div class="price-current" id="livePrice"><?= $formattedPrice ?></div>
            <?php if ($formattedOldPrice): ?>
            <div class="price-old"><?= $formattedOldPrice ?></div>
            <?php endif; ?>
          </div>
          <?php if ($formattedSaving): ?>
          <div class="price-saving">Экономия <?= $formattedSaving ?></div>
          <?php endif; ?>

          <div class="stock-status">
            <span class="stock-dot"></span>
            <span><?= $inStock ? 'В наличии — готов к быстрой отгрузке' : 'Под заказ' ?></span>
          </div>
        </div>

        <div class="actions-row">
          <a href="<?= $waLink ?>" target="_blank" rel="noopener noreferrer" class="btn-wa-order">
            <svg viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            <span>Заказать через WhatsApp</span>
          </a>
          <button class="btn-call" onclick="openLeadModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/>
            </svg>
            <span>Заказать звонок</span>
          </button>
        </div>

        <div class="trust-list">
          <div class="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>
            Гарантия 1 год
          </div>
          <div class="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/></svg>
            Бесплатная доставка по Алматы. По Казахстану отправим (СДЭК / inDrive)
          </div>
          <div class="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
            Проверка перед отправкой
          </div>
          <div class="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/></svg>
            Экспертная консультация
          </div>
        </div>
      </div>

    </div>

    <!-- Specs & Details Tabs -->
    <div class="tabs-nav">
      <button class="tab-btn active" onclick="switchTab('specs', this)">Характеристики</button>
      <button class="tab-btn" onclick="switchTab('desc', this)">Описание</button>
      <button class="tab-btn" onclick="switchTab('equip', this)">Комплектация</button>
    </div>

    <div id="tab-specs">
      <table class="spec-table">
        <tbody>
          <?php foreach ($specs as [$k, $v]): ?>
          <tr>
            <td><?= htmlspecialchars($k, ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8') ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>

    <div id="tab-desc" style="display:none;">
      <div class="card-block">
        <h3>Полное описание</h3>
        <div style="font-size: 15px; color: var(--text);">
          <?= !empty($product['description']) ? $product['description'] : nl2br(htmlspecialchars($product['short_description'] ?: "Оригинальный ноутбук {$name} от мирового производителя {$brand}. Идеально подходит для повседневных, профессиональных и игровых задач. Официальная гарантия 12 месяцев.", ENT_QUOTES, 'UTF-8')) ?>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px;">
          <span style="background:#fff; border:1px solid var(--border); padding:8px 16px; border-radius:100px; font-size:13px; font-weight:700;">100% Оригинал</span>
          <span style="background:#fff; border:1px solid var(--border); padding:8px 16px; border-radius:100px; font-size:13px; font-weight:700;">Заводская пломба</span>
          <span style="background:#fff; border:1px solid var(--border); padding:8px 16px; border-radius:100px; font-size:13px; font-weight:700;">Гарантия 1 год</span>
        </div>
      </div>
    </div>

    <div id="tab-equip" style="display:none;">
      <div class="card-block">
        <h3>Что входит в комплект</h3>
        <?php 
        $equipList = !empty($product['equipment']) 
            ? array_filter(array_map('trim', explode("\n", $product['equipment'])))
            : [
                "Ноутбук {$name}",
                "Оригинальный блок питания и кабель",
                "Гарантийный талон на 1 год и чек",
                "Фирменная заводская упаковка с демпферами"
              ];
        ?>
        <ul style="display: flex; flex-direction: column; gap: 14px; padding: 0;">
          <?php foreach ($equipList as $item): ?>
          <li style="display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 600;">
            <span style="width:24px; height:24px; border-radius:50%; background:var(--success-tint); color:var(--success); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; flex-shrink:0;">✓</span>
            <span><?= htmlspecialchars($item, ENT_QUOTES, 'UTF-8') ?></span>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>

    <?php if (!empty($product['why_buy_text'])): ?>
    <div class="card-block" style="margin-top: 32px;">
      <h3>Почему стоит купить этот ноутбук:</h3>
      <div style="font-size: 15px; color: var(--text);"><?= $product['why_buy_text'] ?></div>
    </div>
    <?php endif; ?>

  </main>

  <!-- Lightbox Modal -->
  <div class="lightbox-modal" id="lightboxModal" onclick="closeLightbox(event)">
    <button class="lightbox-close" onclick="closeLightbox()">✕</button>
    <div class="lightbox-img-wrap" onclick="event.stopPropagation()">
      <img id="lightboxImg" src="<?= htmlspecialchars($firstImage, ENT_QUOTES, 'UTF-8') ?>" alt="<?= $name ?>">
    </div>
    <?php if (count($gallery) > 1): ?>
    <button class="lightbox-nav lightbox-prev" onclick="lightboxNav(-1, event)">‹</button>
    <button class="lightbox-nav lightbox-next" onclick="lightboxNav(1, event)">›</button>
    <?php endif; ?>
  </div>

  <!-- Lead Modal -->
  <div class="modal-overlay" id="leadModal" onclick="closeLeadModal(event)">
    <div class="modal-box" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeLeadModal()">✕</button>
      <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">Заказать звонок</h3>
      <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">Оставьте контакты, и наш специалист свяжется с вами по поводу <b><?= $name ?></b>.</p>
      
      <form id="leadForm" onsubmit="sendLead(event)">
        <input type="text" id="leadName" class="modal-input" placeholder="Ваше имя" required>
        <input type="tel" id="leadPhone" class="modal-input" placeholder="+7 (700) 000-00-00" required>
        <button type="submit" id="leadSubmit" class="btn-submit">Отправить заявку</button>
      </form>
      <div id="leadSuccess" style="display:none; color: var(--success); font-weight: 700; text-align: center; margin-top: 14px; font-size: 15px;">
        ✓ Спасибо! Мы свяжемся с вами в течение 10 минут.
      </div>
    </div>
  </div>

  <!-- Floating Mobile CTA Buttons -->
  <a href="<?= $waLink ?>" target="_blank" rel="noopener noreferrer" class="floating-wa-btn" title="Написать в WhatsApp">
    <svg viewBox="0 0 24 24" fill="#ffffff" width="24" height="24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  </a>

  <button class="floating-call-btn" onclick="openLeadModal()" title="Заказать звонок">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="22" height="22">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/>
    </svg>
  </button>

  <!-- Footer -->
  <footer>
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-col">
          <a href="/" class="logo" style="color:#fff; margin-bottom: 14px;">
            <span class="dot"></span> OnePoint
          </a>
          <p style="font-size: 13.5px; line-height: 1.65; color: rgba(255,255,255,0.65);">
            Магазин новых оригинальных ноутбуков в Алматы с быстрой доставкой по всему Казахстану.
          </p>
        </div>
        <div class="footer-col">
          <h4>Каталог</h4>
          <ul>
            <li><a href="/catalog?cat=gaming">Игровые ноутбуки</a></li>
            <li><a href="/catalog?cat=office">Ноутбуки для работы</a></li>
            <li><a href="/catalog?cat=ultrabook">Ультрабуки</a></li>
            <li><a href="/promotions">Акции и скидки</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Информация</h4>
          <ul>
            <li><a href="/about">О компании</a></li>
            <li><a href="/contacts">Контакты</a></li>
            <li><a href="/delivery">Доставка и оплата</a></li>
            <li><a href="/guarantee">Гарантия 1 год</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Контакты</h4>
          <ul>
            <li><a href="tel:+77075511979">+7 (707) 551-19-79</a></li>
            <li><a href="mailto:info@onepoint.kz">info@onepoint.kz</a></li>
            <li>г. Алматы, пр. Абылай хана 3, ТЦ Алтын-Тараз</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 OnePoint.kz. Все права защищены.</span>
        <a href="/privacy">Политика конфиденциальности</a>
      </div>
    </div>
  </footer>

  <script>
    const gallery = <?= json_encode($gallery, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
    let currentPhotoIdx = 0;

    function switchPhoto(index) {
      if (!gallery[index]) return;
      currentPhotoIdx = index;
      const img = document.getElementById('mainImgElem');
      if (img) img.src = gallery[index];
      
      const counter = document.getElementById('galleryCounter');
      if (counter) counter.textContent = (index + 1) + ' / ' + gallery.length;

      document.querySelectorAll('.thumb-card-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
      });
    }

    let touchStartX = 0;
    let touchEndX = 0;
    const galleryMain = document.getElementById('galleryMain');

    if (galleryMain) {
      galleryMain.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      galleryMain.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }

    function handleSwipe() {
      if (gallery.length <= 1) return;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          const next = (currentPhotoIdx + 1) % gallery.length;
          switchPhoto(next);
        } else {
          const prev = (currentPhotoIdx - 1 + gallery.length) % gallery.length;
          switchPhoto(prev);
        }
      }
    }

    function openLightbox() {
      const modal = document.getElementById('lightboxModal');
      const img = document.getElementById('lightboxImg');
      if (modal && img && gallery[currentPhotoIdx]) {
        img.src = gallery[currentPhotoIdx];
        modal.classList.add('open');
      }
    }

    function closeLightbox(e) {
      if (!e || e.target.id === 'lightboxModal' || e.target.classList.contains('lightbox-close')) {
        const modal = document.getElementById('lightboxModal');
        if (modal) modal.classList.remove('open');
      }
    }

    function lightboxNav(dir, e) {
      if (e) e.stopPropagation();
      currentPhotoIdx = (currentPhotoIdx + dir + gallery.length) % gallery.length;
      switchPhoto(currentPhotoIdx);
      const img = document.getElementById('lightboxImg');
      if (img && gallery[currentPhotoIdx]) {
        img.src = gallery[currentPhotoIdx];
      }
    }

    function switchTab(tabId, elem) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      if (elem) elem.classList.add('active');
      ['specs', 'desc', 'equip'].forEach(id => {
        const el = document.getElementById('tab-' + id);
        if (el) el.style.display = (id === tabId) ? 'block' : 'none';
      });
    }

    function toggleMobileNav(open) {
      const overlay = document.getElementById('mobileNavOverlay');
      const panel = document.getElementById('mobileNavPanel');
      if (overlay && panel) {
        if (open) {
          overlay.classList.add('open');
          panel.classList.add('open');
          document.body.style.overflow = 'hidden';
        } else {
          overlay.classList.remove('open');
          panel.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    }

    function openLeadModal() {
      const modal = document.getElementById('leadModal');
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeLeadModal(e) {
      if (!e || e.target.id === 'leadModal' || e.target.classList.contains('modal-close')) {
        const modal = document.getElementById('leadModal');
        if (modal) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    }

    async function sendLead(e) {
      e.preventDefault();
      const btn = document.getElementById('leadSubmit');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Отправка...';
      }
      
      const payload = {
        type: 'callback',
        name: document.getElementById('leadName').value,
        phone: document.getElementById('leadPhone').value,
        productId: <?= $id ?>,
        productName: '<?= addslashes($name) ?>',
        price: <?= $price ?>
      };

      try {
        await fetch('https://api.onepoint.kz/api/lead.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        document.getElementById('leadForm').style.display = 'none';
        document.getElementById('leadSuccess').style.display = 'block';
      } catch (err) {
        alert('Ошибка при отправке. Пожалуйста, напишите нам в WhatsApp: +7 (707) 551-19-79');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Отправить заявку';
        }
      }
    }

    fetch('https://api.onepoint.kz/api/products.php?slug=<?= urlencode($slug) ?>&_t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        if (data && data.product && data.product.price) {
          const lp = document.getElementById('livePrice');
          if (lp) lp.textContent = Number(data.product.price).toLocaleString('ru-KZ') + ' ₸';
        }
      })
      .catch(() => {});
  </script>
</body>
</html>
<?php
$html = ob_get_clean();

try {
    $dir = __DIR__ . '/product/' . $slug;
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    if (is_dir($dir) && is_writable($dir)) {
        @file_put_contents($dir . '/index.html', $html);
    }
} catch (Throwable $e) {}

echo $html;
