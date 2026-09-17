# 🚀 Руководство по деплою OnePoint Frontend на хостинг PS.KZ

Данный проект полностью подготовлен для развертывания на **обычном хостинге ps.kz** (cPanel / Plesk) с бэкендом на **`https://api.onepoint.kz`** (PHP 7.4).

---

## ⚡ Что уже подготовлено для SEO и быстрой работы

1. **Pre-rendering (SSG/ISR) всех товаров**: Все карточки товаров генерируются в готовый HTML со всеми метатегами, ценами и разметкой Schema.org.
2. **Полный `sitemap.xml`**: Автоматически включает все товары из API и разделы каталога.
3. **`robots.txt`**: Ссылается на актуальный sitemap и разрешает индексацию поисковым роботам.
4. **Schema.org JSON-LD**: Микроразметка `Product`, `Offer`, `Brand` для расширенных сниппетов в Google и Яндекс.
5. **Файл `.htaccess`**:
   - Принудительный HTTPS 301 редирект
   - Gzip/Deflate сжатие для максимальной оценки Google PageSpeed Insights
   - Кеширование статики (JS/CSS/WebP) на 1 год
   - Заголовки безопасности (`X-Frame-Options`, `X-Content-Type-Options`)
6. **Готовый `server.js`**: Адаптирован под Phusion Passenger / cPanel Node.js Selector.

---

## 🛠 Способ 1: Деплой через cPanel «Настройка приложений Node.js» (Рекомендуется для SSR)

На виртуальном хостинге ps.kz с панелью cPanel есть встроенный модуль **Node.js Selector** (CloudLinux / Passenger).

### Шаг 1: Локальная сборка проекта
В терминале проекта выполните команду:
```bash
npm run build
```
Next.js автоматически скомпилирует приложение в режиме **standalone** (папка `.next/standalone/`).

### Шаг 2: Подготовка файлов для хостинга
Вам понадобятся следующие папки и файлы:
```
├── .next/
│   ├── standalone/       (содержит скомпилированный сервер)
│   └── static/           (статические стили и скрипты)
├── public/               (картинки, иконки, .htaccess)
├── server.js             (точка входа для Passenger)
└── package.json
```

> 💡 **Копирование статики**: Скопируйте папку `.next/static` внутрь `.next/standalone/.next/static` и папку `public` внутрь `.next/standalone/public`.

### Шаг 3: Настройка приложения в cPanel на PS.KZ
1. Войдите в **cPanel** на ps.kz.
2. В блоке **«Программное обеспечение»** выберите **«Настройка приложений Node.js»** (Setup Node.js App).
3. Нажмите **«Создать приложение»** (Create Application):
   - **Node.js version**: выберите `20.x` или `18.x`
   - **Application mode**: `Production`
   - **Application root**: укажите путь к папке приложения (например: `onepoint-front` или `public_html`)
   - **Application URL**: выберите ваш домен `onepoint.kz`
   - **Application startup file**: `server.js`
4. Нажмите **«Создать»** (Create).

### Шаг 4: Загрузка файлов
Загрузите содержимое вашего проекта (или папки `.next/standalone`) в указанный **Application root** через FTP (FileZilla) или «Диспетчер файлов» cPanel.

### Шаг 5: Переменные окружения (Environment Variables)
В настройках Node.js приложения в cPanel (раздел *Environment variables*) добавьте:

| Переменная | Значение | Описание |
|---|---|---|
| `NODE_ENV` | `production` | Режим работы Node.js |
| `PORT` | `3000` | Порт сервера |
| `NEXT_PUBLIC_SITE_URL` | `https://onepoint.kz` | Основной домен сайта для SEO |
| `NEXT_PUBLIC_API_URL` | `https://api.onepoint.kz/api` | URL PHP API для фронтенда |
| `BACKEND_API_URL` | `https://api.onepoint.kz` | Базовый URL бэкенда |
| `TELEGRAM_BOT_TOKEN` | `8510182301:AAEVviHThdSvbhwjDg0YDJT4f3K2YF6w5jU` | Бот для заявок |
| `TELEGRAM_GROUP_ID` | `-5319438603` | Группа Telegram для уведомлений |

### Шаг 6: Запуск
Нажмите **«Запустить / Перезапустить приложение»** (Restart Application). Сайт готов к работе!

---

## 🌐 Способ 2: Деплой как статический сайт (без постоянного Node.js процесса)

Если на вашем тарифе ps.kz нет Node.js Selector, вы можете залить сгенерированный статический HTML в папку `public_html`:

1. Запустите экспорт:
   - В Windows PowerShell:
     ```powershell
     $env:NEXT_OUTPUT_MODE="export"; npm run build
     ```
   - В Linux / macOS:
     ```bash
     NEXT_OUTPUT_MODE=export npm run build
     ```
2. Будет создана папка `out/` со всеми готовыми `.html`, `.js`, `.css` файлами и страницами товаров.
3. Скопируйте файл `public/.htaccess` внутрь папки `out/`.
4. Загрузите всё содержимое папки `out/` напрямую в папку `public_html/` вашего хостинга ps.kz.

---

## 🔍 Проверка SEO после деплоя

После завершения загрузки проверьте:
1. **Sitemap**: Откройте `https://onepoint.kz/sitemap.xml` — файл должен содержать ссылки на главную, категории и все товары.
2. **Robots.txt**: Откройте `https://onepoint.kz/robots.txt` — должен отдавать корректные правила и ссылку на sitemap.
3. **Meta теги и Schema.org**: Откройте любой товар (например: `https://onepoint.kz/product/...`), просмотрите исходный код страницы (`Ctrl + U`) — в `<head>` и в теле страницы должны присутствовать:
   - `<title>` с названием товара
   - `<meta name="description">`
   - `<link rel="canonical" href="...">`
   - `<meta property="og:title">` и `<meta property="og:image">`
   - `<script type="application/ld+json">` с типом `"@type": "Product"`
4. **Добавление в поисковики**:
   - Добавьте `https://onepoint.kz/sitemap.xml` в **Яндекс.Вебмастер** → Индексирование → Файлы Sitemap.
   - Добавьте `https://onepoint.kz/sitemap.xml` в **Google Search Console** → Sitemaps.
