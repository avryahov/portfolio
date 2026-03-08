# Portfolio Александра Ряхова (static MPA)

Статический многостраничный сайт-визитка/портфолио на чистом HTML/CSS/JS без сборщика и без backend.

### Что это за проект

- Персональный сайт-портфолио в формате `MPA`.
- Основной контент: профессиональный опыт, кейсы, квалификация, контакты.
- Текущая модель: статическая раздача файлов, без серверной логики.

### Как собирать и запускать

- Сборка: **не требуется**.
- Установка зависимостей: **не требуется**.
- Локальный запуск:

```bash
./scripts/serve-local.sh
```

- Проверка в браузере: `http://127.0.0.1:8080`.

### Как работать с проектом

- Редактировать страницы и стили напрямую (`.html`, `.css`, `.js`).
- Для внутренних страниц использовать шаблон с `data-root=".."` + `data-component="header/footer"`.
- После правок компонентов (`components/header.html`, `components/footer.html`) обновлять `componentVersion` в `assets/js/main.js`.
- Для build-версии использовать `./scripts/version.sh`, а не править build-плашку в footer вручную.
- Для выкладки на домашний UAT NAS использовать `./scripts/deploy-uat-nas.sh`.
- Для выкладки в облачный PROD использовать `./scripts/deploy-prod-cloud.sh`.
- После правок CSS/JS обновлять `?v=` у подключений на нужных страницах (ручной cache-busting).

## Общее

### Профессиональные этапы

- `2013–2017` — **ОрГМУ**: корпоративные ИС, интеграции с гос-контурами, high-load учебные/отчетные процессы.
- `2018–2021` — **АО «Завод «Инертор»**: промышленный мониторинг, Modbus, Swing/Android/C, эксплуатационный контур.
- `2021–2025` — **ООО «Открытые Решения»**: Java backend → Team Lead, enterprise-интеграции, архитектурная эволюция.
- `2025–н.в.` — **ИТ-ПУХ / IT-PUH**: заказная backend-разработка и развитие собственных продуктовых инициатив.

### Ключевые кейсы

- `Лизинговый калькулятор (2021–2022)` — расчётный backend, API, безопасность, документооборот.
- `PKI импортозамещение (2022–2023)` — legacy + migration, X.509/OCSP/CRL, сертификационный контур.
- `B2B ритейл-портал (2023–2025)` — supplier platform, критичный модуль, рост до техлида.
- `Экология/Город Онлайн (2023)` — backend и интеграции мониторинга качества воздуха для городского контура.

### Дополнительный трек

- Преподавание и менторство: дети/школьники/junior-специалисты, корпоративные образовательные форматы.

## Состояние проекта (на 2 марта 2026)

- Формат: `MPA` (multi-page application), раздача как статические файлы.
- Технологии: `HTML5`, `CSS3`, `Vanilla JavaScript`.
- В репозитории:
  - `27` HTML-страниц
  - `14` CSS-файлов
  - `4` JS-файла
  - `85` графических ассетов (`svg/png/ico`)
- Node/npm не используются, `package.json` отсутствует.

## Карта сайта и статус разделов

### Основной контур (наполнен)

- `/` (`index.html`)
  - Главная страница с якорными секциями:
    - `#about`
    - `#education`
    - `#experience`
    - `#lifecycle`
    - `#qualification`
- `/orgmu/`
- `/inverter/`
- `/open-solutions/`
- `/open-solutions/leasing-calculator.html`
- `/open-solutions/pki-import-substitution.html`
- `/open-solutions/retail-supplier-portal.html`
- `/open-solutions/ecology-monitoring.html`
- `/education/`
- `/teaching/`
- `/qualification/`

### Разделы в статусе мок/подготовки

- `/services/`
- `/services/custom-backend.html`
- `/services/architecture-tech-lead.html`
- `/services/system-integrations.html`
- `/services/legacy-modernization.html`
- `/services/pki-security.html`
- `/services/devops-reliability.html`

## Архитектура фронтенда

### 1) Страницы и компоненты

- Главная страница (`/index.html`) содержит собственный `header` в разметке и подгружает `footer` как компонент.
- Внутренние страницы используют единый шаблон:
  - `<div data-component="header"></div>`
  - `<div data-component="footer"></div>`
- Компоненты находятся в:
  - `components/header.html`
  - `components/footer.html`
- Подгрузка выполняется через `fetch()` в `assets/js/main.js`.

Важно: сайт нельзя открывать корректно через `file://` из-за `fetch` компонентов. Нужен HTTP-сервер.

### 2) Корень путей через `data-root`

- На главной: `<body data-root=".">`
- На внутренних страницах: `<body data-root="..">`
- `main.js` использует `data-root` для корректных относительных путей к компонентам и ссылкам.

### 3) Темизация

- Переменные темы:
  - `assets/css/themes/theme-dark.css`
  - `assets/css/themes/theme-light.css`
- Базовые (fallback) токены в `assets/css/base.css`.
- Переключение тем в `assets/js/main.js`:
  - ключ хранения: `portfolio-theme-v2`
  - тема по умолчанию: `dark` (если в storage нет `light`)

### 4) JS-модули

- `assets/js/main.js`
  - инициализация темы и переключателя
  - загрузка `header/footer`
  - подсветка активного пункта верхней навигации по `pathname`
  - sticky/nav fallback
  - mobile-меню и drag-scroll в навигации
  - UI поиска в шапке (раскрытие/сворачивание)
  - модалка "Обсудить проект" (переход в сообщество VK)
  - кнопка "наверх"
- `assets/js/home-nav.js`
  - якорная навигация главной
  - активный якорь при скролле
  - горизонтальный drag/wheel-scroll блоков опыта и lifecycle
- `assets/js/about-toggle.js`
  - сворачивание/разворачивание блока `about`
- `assets/js/reveal.js`
  - reveal-анимации через `IntersectionObserver`

## Структура директорий

```text
.
├── index.html
├── components/
│   ├── header.html
│   └── footer.html
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   ├── home.css
│   │   ├── themes/
│   │   └── sections/
│   ├── js/
│   └── img/
├── orgmu/
├── inverter/
├── open-solutions/
├── education/
├── teaching/
├── qualification/
├── services/
├── manifest.webmanifest
└── scripts/
    └── serve-local.sh
```

## Особенности контента и UI

- Подключены PWA-метаданные (`manifest.webmanifest`, иконки, `theme-color`).
- Используются внешние ресурсы:
  - Google Fonts
- В проекте есть временно скрытые элементы на главной:
  - кнопка "Обсудить проект" (CSS hide в `base.css`)
  - ссылки "Подробнее" и "Показать все навыки..." на карточках главной (CSS hide в `home.css`)
- В footer явно указано, что часть разделов находится в активной разработке.

## Локальный запуск

Требуется `python3`.

```bash
./scripts/serve-local.sh
```

По умолчанию:

- `http://127.0.0.1:8080`

Кастомный хост/порт:

```bash
./scripts/serve-local.sh 8080 0.0.0.0
```

## Деплой (Linux, static hosting)

Подходит любой статический хостинг (Nginx/Apache/Caddy/CDN object storage).

Целевой домен:

- `itpuh.ru`
- `итпух.рф`
- Punycode для `nginx`, `certbot`, части DNS/API-инструментов: `xn--h1aoifk.xn--p1ai`

Критично:

- раздавать сайт по HTTP(S), не `file://`
- сохранить структуру директорий как в репозитории
- не блокировать доступ к `/components/*.html`, `/assets/*`, `/manifest.webmanifest`
- корень сайта должен соответствовать `/` (код ориентирован на абсолютный корень)

Минимальный блок для `nginx`:

```nginx
server {
    listen 80;
    server_name itpuh.ru www.itpuh.ru итпух.рф www.итпух.рф xn--h1aoifk.xn--p1ai www.xn--h1aoifk.xn--p1ai;
    root /var/www/portfolio;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Для первого деплоя используйте готовые файлы:

- [deploy/nginx/portfolio.conf](/Users/avrjakhov/repositories/git/itpuh/portfolio/deploy/nginx/portfolio.conf)
- [deploy/nginx/bootstrap-nginx.sh](/Users/avrjakhov/repositories/git/itpuh/portfolio/deploy/nginx/bootstrap-nginx.sh)

После активации HTTP-конфига и проверки DNS можно выпустить сертификат:

```bash
certbot --nginx \
  -d itpuh.ru \
  -d www.itpuh.ru \
  -d xn--h1aoifk.xn--p1ai \
  -d www.xn--h1aoifk.xn--p1ai \
  --redirect \
  -m your-email@example.com \
  --agree-tos -n
```

## Правила сопровождения

### 1) Обновили `components/header.html` или `components/footer.html`

- Поднимите `componentVersion` в `assets/js/main.js`, иначе можно поймать stale-кэш компонента.

### 1.1) Обновили или итерировали build-версию

- Состояние `major/minor` хранится в `version.env`.
- `patch` считается автоматически как разница между общим количеством commit-ов и `PATCH_BASE_COUNT`.
- Текущую сборку вывести командой:
  `./scripts/version.sh current`
- Обновить build-плашку в footer и `componentVersion`:
  `./scripts/version.sh sync`
- Итерировать `minor` и начать patch-счёт с нуля от текущей истории:
  `./scripts/version.sh minor`
- Итерировать `major`, сбросить `minor` и начать patch-счёт с нуля:
  `./scripts/version.sh major`

### 1.2) Выкладка на домашний UAT NAS

- Скрипт деплоя: `./scripts/deploy-uat-nas.sh`
- Параметры по умолчанию лежат в `deploy/uat/env.sh`
- Перед деплоем скрипт проверяет, что локальная ветка тоже `dev`.
- На NAS выполняются:
  - `git fetch origin`
  - `git checkout dev`
  - `git pull --ff-only origin dev`
  - `bash scripts/version.sh sync`
- Пример с переопределением хоста:
  `DEPLOY_HOST=nas.local DEPLOY_PORT=3022 ./scripts/deploy-uat-nas.sh`

### 1.3) Выкладка в облачный PROD

- Скрипт деплоя: `./scripts/deploy-prod-cloud.sh`
- Параметры по умолчанию лежат в `deploy/prod/env.sh`
- На PROD выполняются:
  - `git fetch origin`
  - `git checkout <branch>`
  - `git pull --ff-only origin <branch>`
  - `bash ../scripts/version.sh sync`
  - `bash nginx/reload-nginx.sh`
- `deploy/nginx/bootstrap-nginx.sh` использовать только для первичной настройки сервера, а не для обычного обновления релиз-стенда.

### 2) Обновили JS/CSS файл

- Проверьте `?v=` в `<script>`/`<link>` на страницах, где файл подключается.
- В проекте используется ручной cache-busting через query-параметры.

### 3) Добавление новой внутренней страницы

- Используйте шаблон внутренней страницы:
  - `data-root=".."`
  - `data-component="header"`
  - `data-component="footer"`
  - подключение `../assets/js/main.js` и `../assets/js/reveal.js`

### 4) Проверка после изменений

- Главная: якорная навигация, reveal, горизонтальный скролл карточек.
- Внутренние страницы: загрузка header/footer, корректные ссылки.
- Темы: переключение светлая/темная + сохранение состояния.
- Модалка "Обсудить проект": открытие сообщества VK и сброс формы.

## Известные ограничения

- Поиск в верхнем меню сейчас UI-only (раскрытие/поле ввода), без движка поиска по контенту.
- Несколько разделов в статусе подготовительных мок-страниц (см. карту сайта).
- В репозитории нет CI/lint/test pipeline.
