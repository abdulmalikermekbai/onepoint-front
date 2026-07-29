# PHP + MySQL backend

1. Запустите в XAMPP **Apache** и **MySQL**.
2. Откройте `http://localhost/onepoint-laptop-e-commerce-development/backend/install.php`.
   Скрипт создаст БД `onepoint_laptops` и импортирует текущие 19 товаров и 6 отзывов из `src/lib/data.ts`.
3. Откройте админку: `http://localhost/onepoint-laptop-e-commerce-development/backend/admin/login.php`.
   Первый вход: `admin` / `change-me-now`. Немедленно смените пароль в пункте «Пароль».

Если у MySQL задан пароль, укажите его в `backend/config.php` до запуска установки.

Каталог можно получать из MySQL по адресу `backend/api/products.php`.
Доступны фильтры: `?brand=Lenovo&category=gaming&min=300000&max=700000&sale=1&hit=1&new=1&stock=1`.

Повторный запуск `install.php` безопасен для товаров: существующие товары по slug не дублируются. Отзывы при повторном запуске добавляются снова, поэтому используйте импортёр один раз.

Загрузка изображений: `backend/admin/upload.php` (JPG/PNG/WebP, до 5 МБ). Файлы попадают в `backend/uploads/products/`.
