<?php
declare(strict_types=1);
require __DIR__ . '/../config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$pdo = db();

/* ── Single product by slug ── */
if (!empty($_GET['slug'])) {
    $st = $pdo->prepare('
        SELECT p.*, b.name AS brand, b.slug AS brand_slug, c.name AS category, c.slug AS category_slug
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.slug = ? AND p.is_active = 1
        LIMIT 1
    ');
    $st->execute([$_GET['slug']]);
    $product = $st->fetch();
    if (!$product) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit; }

    // Gallery images
    $imgs = $pdo->prepare('SELECT image_url, alt_text, is_main FROM product_images WHERE product_id=? ORDER BY is_main DESC, sort_order ASC');
    $imgs->execute([$product['id']]);
    $product['gallery'] = $imgs->fetchAll();

    // Reviews for this product
    $rev = $pdo->prepare('SELECT author_name, initials, rating, body, source, created_at FROM reviews WHERE product_id=? AND is_approved=1 ORDER BY id DESC');
    $rev->execute([$product['id']]);
    $product['reviews'] = $rev->fetchAll();

    // Related products
    $rel = [];
    try {
        $relSt = $pdo->prepare('
            SELECT p2.id, p2.name, p2.slug, p2.price, p2.old_price, p2.image_url, p2.ram, p2.storage, p2.processor, b2.name AS brand
            FROM product_related pr
            JOIN products p2 ON p2.id = pr.related_id AND p2.is_active = 1
            LEFT JOIN brands b2 ON b2.id = p2.brand_id
            WHERE pr.product_id = ?
            LIMIT 8
        ');
        $relSt->execute([$product['id']]);
        $rel = $relSt->fetchAll();
    } catch (PDOException $e) { /* table may not exist yet */ }
    $product['related'] = $rel;

    echo json_encode(['product' => $product], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* ── Single product by id ── */
if (!empty($_GET['id'])) {
    $st = $pdo->prepare('
        SELECT p.*, b.name AS brand, c.name AS category, c.slug AS category_slug
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = ? AND p.is_active = 1
        LIMIT 1
    ');
    $st->execute([(int)$_GET['id']]);
    $product = $st->fetch();
    if (!$product) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit; }
    echo json_encode(['product' => $product], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* ── Reviews list ── */
if (!empty($_GET['reviews'])) {
    $limit = min((int)($_GET['limit'] ?? 20), 50);
    $pid = !empty($_GET['product_id']) ? (int)$_GET['product_id'] : null;
    if ($pid) {
        $st = $pdo->prepare('SELECT author_name,initials,rating,body,source,created_at FROM reviews WHERE is_approved=1 AND product_id=? ORDER BY id DESC LIMIT ?');
        $st->execute([$pid, $limit]);
    } else {
        $st = $pdo->prepare('SELECT author_name,initials,rating,body,source,created_at FROM reviews WHERE is_approved=1 ORDER BY id DESC LIMIT ?');
        $st->execute([$limit]);
    }
    echo json_encode(['reviews' => $st->fetchAll()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* ── Promotions list ── */
if (!empty($_GET['promotions'])) {
    $st = $pdo->query('SELECT * FROM promotions WHERE is_active=1 ORDER BY sort_order,id');
    echo json_encode(['promotions' => $st->fetchAll()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* ── Brands list ── */
if (!empty($_GET['brands'])) {
    $st = $pdo->query('SELECT b.*, COUNT(p.id) as product_count FROM brands b LEFT JOIN products p ON p.brand_id=b.id AND p.is_active=1 WHERE b.is_active=1 GROUP BY b.id ORDER BY b.name');
    echo json_encode(['brands' => $st->fetchAll()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* ── Categories list ── */
if (!empty($_GET['categories'])) {
    $st = $pdo->query('SELECT c.*, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON p.category_id=c.id AND p.is_active=1 WHERE c.is_active=1 GROUP BY c.id ORDER BY c.sort_order,c.name');
    echo json_encode(['categories' => $st->fetchAll()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* ── Product list ── */
$sql  = 'SELECT p.*, b.name AS brand, b.slug AS brand_slug, c.name AS category, c.slug AS category_slug
         FROM products p
         LEFT JOIN brands b ON b.id = p.brand_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.is_active = 1';
$args = [];

foreach (['brand' => 'b.slug', 'category' => 'c.slug'] as $q => $col) {
    if (!empty($_GET[$q])) { $sql .= " AND $col=?"; $args[] = $_GET[$q]; }
}
if (!empty($_GET['brand_name'])) { $sql .= ' AND b.name=?'; $args[] = $_GET['brand_name']; }
if (isset($_GET['min'])) { $sql .= ' AND p.price>=?'; $args[] = (float)$_GET['min']; }
if (isset($_GET['max'])) { $sql .= ' AND p.price<=?'; $args[] = (float)$_GET['max']; }
foreach (['hit' => 'is_hit', 'sale' => 'is_sale', 'new' => 'is_new', 'stock' => 'in_stock'] as $q => $col) {
    if (!empty($_GET[$q])) $sql .= " AND p.$col=1";
}
if (!empty($_GET['search'])) {
    $sql .= ' AND (p.name LIKE ? OR p.processor LIKE ? OR b.name LIKE ?)';
    $s = '%' . $_GET['search'] . '%';
    $args = array_merge($args, [$s, $s, $s]);
}

$sort = match($_GET['sort'] ?? 'popular') {
    'price_asc'  => 'p.price ASC',
    'price_desc' => 'p.price DESC',
    'new'        => 'p.created_at DESC',
    default      => 'p.is_hit DESC, p.id DESC',
};
$sql .= " ORDER BY $sort";

$limit = min((int)($_GET['limit'] ?? 40), 100);
$offset = (int)($_GET['offset'] ?? 0);
$sql .= ' LIMIT ? OFFSET ?';
$args[] = $limit;
$args[] = $offset;

$st = $pdo->prepare($sql);
$st->execute($args);

echo json_encode(['products' => $st->fetchAll()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
