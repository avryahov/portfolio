# Portfolio Александра Ряхова (static MPA)

Статический многостраничный сайт-визитка/портфолио на чистом HTML/CSS/JS без сборщика и без backend.
Исходники сайта находятся в `site/`, operational-скрипты и deploy-конфигурация вынесены в `ops/`.

### Что это за проект

- Персональный сайт-портфолио в формате `MPA`.
- Основной контент: профессиональный опыт, кейсы, квалификация, контакты.
- Текущая модель: статическая раздача файлов, без серверной логики.

### Как собирать и запускать

- Сборка: **не требуется**.
- Установка зависимостей: **не требуется**.
- Локальный запуск:

```bash
./ops/scripts/serve-local.sh
```

- Проверка в браузере: `http://127.0.0.1:8080`.

### Как работать с проектом

- Редактировать страницы и стили напрямую в `site/` (`.html`, `.css`, `.js`).
- Для внутренних страниц использовать шаблон с `data-root=".."` + `data-component="header/footer"`.
- После правок компонентов (`site/components/header.html`, `site/components/footer.html`) обновлять `componentVersion` в `site/assets/js/main.js`.
- Для build-версии использовать `./ops/scripts/version.sh`, а не править build-плашку в footer вручную.
- Основной путь выкладки теперь идет через локальный `Forgejo Actions`.
- На целевых серверах больше не требуется `git clone` или `git pull`: доставляется подготовленная publishable-директория без `.git`-истории.
- Workflow разложены по стадиям: `validate -> build -> pre-deploy -> deploy -> smoke`.
- `build` проверяет, что сайт собирается в publishable-директорию.
- `pre-deploy` отдельно проверяет SSH-доступ и права записи до запуска доставки.
- `deploy` повторно собирает release и отправляет на целевой сервер архивом `tar.gz` через `scp/ssh`.
- `smoke` после деплоя подтверждает, что в целевом каталоге есть базовые статические файлы и отсутствует `.git`.
- Для ручного запуска деплоя на домашний UAT NAS можно использовать `./ops/scripts/deploy-uat-nas.sh`.
- Для ручного запуска деплоя в облачный PROD можно использовать `./ops/scripts/deploy-prod-cloud.sh`.
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
  - `site/components/header.html`
  - `site/components/footer.html`
- Подгрузка выполняется через `fetch()` в `site/assets/js/main.js`.

Важно: сайт нельзя открывать корректно через `file://` из-за `fetch` компонентов. Нужен HTTP-сервер.

### 2) Корень путей через `data-root`

- На главной: `<body data-root=".">`
- На внутренних страницах: `<body data-root="..">`
- `main.js` использует `data-root` для корректных относительных путей к компонентам и ссылкам.

### 3) Темизация

- Переменные темы:
  - `site/assets/css/themes/theme-dark.css`
  - `site/assets/css/themes/theme-light.css`
- Базовые (fallback) токены в `site/assets/css/base.css`.
- Переключение тем в `site/assets/js/main.js`:
  - ключ хранения: `portfolio-theme-v2`
  - тема по умолчанию: `dark` (если в storage нет `light`)

### 4) JS-модули

- `site/assets/js/main.js`
  - инициализация темы и переключателя
  - загрузка `header/footer`
  - подсветка активного пункта верхней навигации по `pathname`
  - sticky/nav fallback
  - mobile-меню и drag-scroll в навигации
  - UI поиска в шапке (раскрытие/сворачивание)
  - модалка "Обсудить проект" (переход в сообщество VK)
  - кнопка "наверх"
- `site/assets/js/home-nav.js`
  - якорная навигация главной
  - активный якорь при скролле
  - горизонтальный drag/wheel-scroll блоков опыта и lifecycle
- `site/assets/js/about-toggle.js`
  - сворачивание/разворачивание блока `about`
- `site/assets/js/reveal.js`
  - reveal-анимации через `IntersectionObserver`

## Структура директорий

```text
.
├── site/
│   ├── index.html
│   ├── components/
│   ├── assets/
│   ├── orgmu/
│   ├── inverter/
│   ├── open-solutions/
│   ├── education/
│   ├── teaching/
│   ├── qualification/
│   ├── services/
│   ├── favicon.ico
│   └── manifest.webmanifest
├── ops/
│   ├── deploy/
│   └── scripts/
│       └── serve-local.sh
├── .forgejo/
└── .build/
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
./ops/scripts/serve-local.sh
```

По умолчанию:

- `http://127.0.0.1:8080`

Кастомный хост/порт:

```bash
./ops/scripts/serve-local.sh 8080 0.0.0.0
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

- [ops/deploy/nginx/portfolio.conf](/Users/avrjakhov/repositories/git/itpuh/portfolio/ops/deploy/nginx/portfolio.conf)
- [ops/deploy/nginx/bootstrap-nginx.sh](/Users/avrjakhov/repositories/git/itpuh/portfolio/ops/deploy/nginx/bootstrap-nginx.sh)

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

### 1) Обновили `site/components/header.html` или `site/components/footer.html`

- Поднимите `componentVersion` в `site/assets/js/main.js`, иначе можно поймать stale-кэш компонента.

### 1.1) Обновили или итерировали build-версию

- Состояние `major/minor` хранится в `version.env`.
- `patch` считается автоматически как разница между эффективным количеством commit-ов и `PATCH_BASE_COUNT`.
- Build-метаданные больше не нужно коммитить вручную: CI проштамповывает release artifact на этапе сборки.
- Текущую сборку вывести командой:
  `./ops/scripts/version.sh current`
- Обновить build-плашку в footer и `componentVersion` в рабочем дереве:
  `./ops/scripts/version.sh sync`
- Проштамповать build-плашку в уже собранной директории релиза:
  `./ops/scripts/version.sh stamp .build/uat`
- Итерировать `minor` и начать patch-счёт с нуля от текущей истории:
  `./ops/scripts/version.sh minor`
- Итерировать `major`, сбросить `minor` и начать patch-счёт с нуля:
  `./ops/scripts/version.sh major`

### 1.2) Выкладка на домашний UAT NAS

- Автоматический сценарий: `push` в ветку `dev` запускает workflow `.forgejo/workflows/uat.yml`.
- Скрипт деплоя: `./ops/scripts/deploy-uat-nas.sh`
- Параметры по умолчанию лежат в `ops/deploy/uat/env.sh`
- При ручном локальном запуске скрипт проверяет, что локальная ветка тоже `dev`.
- На runner выполняются:
  - `bash ./ops/scripts/ci-validate.sh`
  - `bash ./ops/scripts/build-release.sh .build/uat`
  - упаковка релиза в `tar.gz`
  - копирование архива по `scp`
  - распаковка по `ssh` в `DEPLOY_PATH`
- На NAS не нужен git-репозиторий: достаточно существующей целевой директории и SSH-доступа.
- Пример с переопределением хоста:
  `DEPLOY_HOST=nas.local DEPLOY_PORT=3022 ./ops/scripts/deploy-uat-nas.sh`

### 1.3) Выкладка в облачный PROD

- Автоматического `push -> PROD` нет.
- PROD выкладывается вручную через workflow `.forgejo/workflows/prod.yml`.
- Скрипт деплоя: `./ops/scripts/deploy-prod-cloud.sh`
- Параметры по умолчанию лежат в `ops/deploy/prod/env.sh`
- По умолчанию `DEPLOY_HOST=itpuh.ru`; если PROD-хост отличается, переопределите `DEPLOY_HOST` перед запуском.
- На runner выполняются:
  - `bash ./ops/scripts/ci-validate.sh`
  - `bash ./ops/scripts/build-release.sh .build/prod`
  - упаковка релиза в `tar.gz`
  - копирование архива по `scp`
  - распаковка по `ssh` в `DEPLOY_PATH`
  - post-hook `nginx -t && systemctl reload nginx` на удаленной стороне
- `ops/deploy/nginx/bootstrap-nginx.sh` использовать только для первичной настройки сервера, а не для обычного обновления релиз-стенда.

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

## Локальный CI/CD в Forgejo

### Что запускается

- `.forgejo/workflows/uat.yml`
  - триггер: `push` в `dev` и ручной `workflow_dispatch`
  - шаги: `checkout` -> `validate` -> `build release` -> `deploy` на домашний UAT NAS
- `.forgejo/workflows/prod.yml`
  - триггер: только ручной `workflow_dispatch`
  - шаги: `checkout` -> `validate` -> `build release` -> `deploy` на PROD

### Что проверяет CI

- наличие ключевых файлов проекта
- корректный расчет build-версии через `./ops/scripts/version.sh current`

### Что входит в publishable release

В релизную директорию попадают только файлы, которые реально должны быть на web-сервере. Источник для сборки теперь `site/`, но сам artifact остается плоским:

- `index.html`
- `favicon.ico`
- `manifest.webmanifest`
- `assets/`
- `components/`
- `education/`
- `inverter/`
- `open-solutions/`
- `orgmu/`
- `qualification/`
- `services/`
- `teaching/`

Служебные файлы и директории (`.git`, `.forgejo`, `ops/`, `README.md`, `version.env`) на сервер не доставляются.

Build-метаданные в footer и `componentVersion` проставляются в release artifact во время сборки и не требуют отдельного commit.

### Какие secrets нужны в Forgejo

Если под `vault` имеется в виду локальное хранилище секретов Forgejo, то использовать нужно именно `Actions Secrets`. Для текущего контура этого достаточно; внешний HashiCorp Vault можно подключить позже отдельно.

Для UAT workflow:

- `UAT_SSH_KEY` — приватный ключ для SSH-доступа с runner к NAS
- `UAT_KNOWN_HOSTS` — опционально, заранее сохраненный `known_hosts`; если не задан, workflow попытается выполнить `ssh-keyscan`
- `UAT_DEPLOY_HOST` — опционально, хост UAT
- `UAT_DEPLOY_PORT` — опционально, порт UAT
- `UAT_DEPLOY_USER` — опционально, SSH-пользователь
- `UAT_DEPLOY_PATH` — опционально, путь до каталога выкладки на NAS
- `UAT_DEPLOY_BRANCH` — опционально, ветка выкладки; по умолчанию берется из `ops/deploy/uat/env.sh`

Для PROD workflow:

- `PROD_SSH_KEY`
- `PROD_KNOWN_HOSTS`
- `PROD_DEPLOY_HOST`
- `PROD_DEPLOY_PORT`
- `PROD_DEPLOY_USER`
- `PROD_DEPLOY_PATH`
- `PROD_DEPLOY_BRANCH`

Важно:

- На удаленной стороне не нужен git-репозиторий.
- Нужны только `ssh`, целевая директория и доступ на запись для пользователя деплоя.
- Для текущей схемы на runner должны быть доступны `ssh`, `scp`, `tar`.
- На целевой стороне должны быть доступны `ssh` и `tar`.
- Runner читает секреты из Forgejo Secrets и не хранит ключи в репозитории.

## Известные ограничения

- Поиск в верхнем меню сейчас UI-only (раскрытие/поле ввода), без движка поиска по контенту.
- Несколько разделов в статусе подготовительных мок-страниц (см. карту сайта).
- CI/CD стал локальным и минималистичным: без npm/lint/test toolchain, с artifact-based delivery через SSH/SCP.
