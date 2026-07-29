# 🚀 Деплой OnePoint Frontend на GitLab → Vercel

## Архитектура

```
Браузер  →  Vercel (Next.js)  →  api.onepoint.kz (PHP бэкенд на ps.kz)
```

- **Frontend**: Next.js на Vercel (бесплатно)  
- **Backend API**: PHP на ps.kz → `https://api.onepoint.kz/api/`  
- **Admin Panel**: `https://api.onepoint.kz/admin/`  
- **Database**: PostgreSQL на ps.kz  

---

## Шаг 1: Залить на GitLab

```bash
# Инициализация Git (если ещё не сделано)
git init
git remote add origin https://gitlab.com/ВАШ_ЛОГИН/onepoint-frontend.git

# Первый коммит
git add .
git commit -m "feat: initial Next.js frontend with ps.kz backend"
git push -u origin main
```

> ⚠️ **Важно**: `.env.local` НЕ коммитится (в .gitignore). Секреты нужно добавить в Vercel Dashboard вручную.

---

## Шаг 2: Подключить Vercel к GitLab

1. Зайти на [vercel.com](https://vercel.com) → **New Project**
2. Выбрать **Import Git Repository** → GitLab
3. Авторизовать GitLab аккаунт
4. Выбрать репозиторий `onepoint-frontend`
5. Framework: **Next.js** (определяется автоматически)

---

## Шаг 3: Настроить Environment Variables в Vercel

В Dashboard → Settings → **Environment Variables** добавить:

| Переменная | Значение | Окружение |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.onepoint.kz/api` | Production, Preview |
| `BACKEND_API_URL` | `https://api.onepoint.kz` | Production, Preview |
| `DATABASE_URL` | `postgres://USER:PASS@HOST:5432/DB` | Production |
| `TELEGRAM_BOT_TOKEN` | `8510182301:AAEVvi...` | Production, Preview |
| `TELEGRAM_CHAT_ID` | `288706561` | Production, Preview |

> 💡 `DATABASE_URL` — скопируй реальные данные подключения из панели ps.kz

---

## Шаг 4: Деплой

После настройки нажать **Deploy**. Vercel автоматически:
- Установит зависимости (`npm install`)
- Запустит билд (`npm run build`)
- Задеплоит на CDN

---

## Автоматический деплой

После первого деплоя каждый `git push` в `main` → автоматический деплой на Vercel.

```bash
# Обновить код и задеплоить
git add .
git commit -m "fix: update API endpoint"
git push origin main
# ✅ Vercel автоматически задеплоит через ~30 секунд
```

---

## Проверка API вызовов

### Next.js API Routes (Telegram / заявки)
```
POST https://onepoint.vercel.app/api/lead        ✅ Next.js serverless
POST https://onepoint.vercel.app/api/newsletter  ✅ Next.js serverless
```

### PHP Backend (через src/lib/api.ts)
```
GET https://api.onepoint.kz/api/products         ✅ PHP backend
GET https://api.onepoint.kz/api/categories       ✅ PHP backend
GET https://api.onepoint.kz/api/products/1       ✅ PHP backend
```

### Admin Panel
```
https://api.onepoint.kz/admin/login.php          ✅ PHP admin
```

---

## Структура файлов конфигурации

```
.env              → Базовые значения (без секретов, в Git)
.env.local        → Локальная разработка (НЕ в Git)
.env.production   → Продакшн (можно в Git, т.к. секреты в Vercel Dashboard)
next.config.ts    → Rewrites: /backend-api/* → https://api.onepoint.kz/api/*
src/lib/api.ts    → Централизованный API клиент для PHP backend
```

---

## Troubleshooting

### CORS ошибка
Убедитесь, что на PHP бэкенде в `api.onepoint.kz` разрешен CORS:
```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

### База данных не подключается
Проверьте что ps.kz разрешает внешние подключения к PostgreSQL.
Если нет — используйте REST API вместо прямого подключения.

### Build fails на Vercel
```bash
# Проверить локально:
npm run build
```
