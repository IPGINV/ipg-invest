# Пошаговый деплой ipg-invest.ae — делаем по порядку

Деплой через **Docker**. Выполняйте шаги по очереди.

---

## ШАГ 0. Что должно быть готово

- [ ] **Сервер:** VPS с Ubuntu 22.04 или 24.04 (минимум 2 GB RAM, 40 GB диск).
- [ ] **Доступ по SSH:** логин и пароль (или ключ) к серверу.
- [ ] **Домен ipg-invest.ae:** привязан к вашему серверу (A-запись на IP сервера) — можно настроить позже, на шаге 7.
- [ ] **IP сервера:** знаете (например `123.45.67.89`).

Если чего-то нет — напишите, на каком шаге остановились, подскажу.

---

## ШАГ 1. На вашем компьютере (Windows) — подготовка

### 1.1 Экспорт базы данных (если есть данные в БД)

Если PostgreSQL у вас установлен и в базе `ipg` есть данные:

1. Откройте **Git Bash** (или WSL) в папке проекта.
2. Выполните:

```bash
cd "C:/Users/HP/Desktop/Project site invest/server"
bash scripts/export-database.sh
```

Если скрипт ругается на переменные — создайте в `server` файл `.env` с вашими данными БД (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE), затем снова запустите скрипт.

**Если БД пустая или PostgreSQL не установлен** — этот шаг можно пропустить. На сервере схема создастся из `schema.sql`.

Результат: в `server/backups/` появится файл вида `ipg_backup_YYYYMMDD_HHMMSS.sql.gz`. Запомните путь к нему — понадобится для загрузки на сервер.

### 1.2 Файл .env для production

В корне проекта (рядом с `docker-compose.yml`) создайте файл **`.env`** (если его ещё нет). Скопируйте содержимое из `.env.production.example` и заполните:

```env
# Обязательно поменяйте на свои значения:
PGUSER=ipg_user
PGPASSWORD=придумайте_надёжный_пароль
PGDATABASE=ipg_production
JWT_SECRET=случайная_строка_минимум_32_символа
REFRESH_TOKEN_SECRET=другая_случайная_строка_минимум_32_символа
DOMAIN=ipg-invest.ae
CORS_ORIGIN=https://ipg-invest.ae,https://dashboard.ipg-invest.ae,https://info.ipg-invest.ae,https://wallet.ipg-invest.ae

# Остальное — по необходимости (email, Telegram и т.д.)
```

Сохраните файл. **На сервер потом попадёт этот же .env** (или вы создадите его там по этому образцу).

### 1.3 Проверка

- В корне проекта есть `docker-compose.yml`.
- Есть файл `.env` с паролями и секретами.
- Если экспортировали БД — есть `server/backups/ipg_backup_*.sql.gz`.

Дальше — работа на сервере.

---

## ШАГ 2. Подключение к серверу и загрузка проекта

### 2.1 Подключиться по SSH

В PowerShell или Git Bash:

```bash
ssh root@IP_ВАШЕГО_СЕРВЕРА
```

(или `ssh ubuntu@IP_ВАШЕГО_СЕРВЕРА` — зависит от образа VPS). Подставьте свой IP.

При первом подключении ответьте `yes` на вопрос о fingerprint.

### 2.2 Загрузить проект на сервер

**Вариант A — через Git (если проект в репозитории):**

На сервере:

```bash
sudo apt update && sudo apt install -y git
cd /var
sudo mkdir -p www && sudo chown $USER:$USER www
cd www
git clone ВАШ_РЕПОЗИТОРИЙ_URL ipg
cd ipg
```

**Вариант B — через архив с вашего ПК:**

На **Windows** (в PowerShell, в папке проекта):

```powershell
cd "C:\Users\HP\Desktop\Project site invest"
# Создать архив без node_modules
Compress-Archive -Path server, Dashboard, Invest-Lending, Info, Wallet, docker-compose.yml, schema.sql, .env.production.example, nginx -DestinationPath ipg-deploy.zip
```

Потом перенесите `ipg-deploy.zip` на сервер (WinSCP, FileZilla или `scp`):

```bash
scp ipg-deploy.zip root@IP_ВАШЕГО_СЕРВЕРА:/var/www/
```

На **сервере**:

```bash
sudo mkdir -p /var/www && cd /var/www
sudo unzip ipg-deploy.zip -d ipg
cd ipg
```

**Вариант C — через SCP папками (без архива):**

С вашего ПК (Git Bash):

```bash
scp -r "C:/Users/HP/Desktop/Project site invest/server" "C:/Users/HP/Desktop/Project site invest/Dashboard" "C:/Users/HP/Desktop/Project site invest/Invest-Lending" "C:/Users/HP/Desktop/Project site invest/Info" "C:/Users/HP/Desktop/Project site invest/Wallet" "C:/Users/HP/Desktop/Project site invest/docker-compose.yml" "C:/Users/HP/Desktop/Project site invest/schema.sql" root@IP_ВАШЕГО_СЕРВЕРА:/var/www/ipg/
```

На сервере проверьте:

```bash
ls -la /var/www/ipg
```

Должны быть папки: `server`, `Dashboard`, `Invest-Lending`, `Info`, `Wallet` и файл `docker-compose.yml`.

---

## ШАГ 3. На сервере — установка Docker

Выполняйте в SSH на сервере:

```bash
# Установка Docker
curl -fsSL https://get.docker.com | sh

# Текущего пользователя добавить в группу docker (чтобы не писать sudo каждый раз)
sudo usermod -aG docker $USER

# Выйти из SSH и зайти снова, чтобы группа применилась
exit
```

Подключитесь снова:

```bash
ssh root@IP_ВАШЕГО_СЕРВЕРА
cd /var/www/ipg
```

Проверка:

```bash
docker --version
docker compose version
```

Должны вывести версии. Если `docker compose` не найден:

```bash
sudo apt install -y docker-compose-plugin
```

---

## ШАГ 4. На сервере — файл .env

В папке проекта на сервере создайте `.env`:

```bash
cd /var/www/ipg
nano .env
```

Вставьте (или скопируйте с вашего .env и поправьте):

```env
PGUSER=ipg_user
PGPASSWORD=ваш_надёжный_пароль
PGDATABASE=ipg_production
JWT_SECRET=ваша_случайная_строка_32_символа
REFRESH_TOKEN_SECRET=другая_случайная_строка_32_символа
DOMAIN=ipg-invest.ae
CORS_ORIGIN=https://ipg-invest.ae,https://dashboard.ipg-invest.ae,https://info.ipg-invest.ae,https://wallet.ipg-invest.ae
```

Сохраните: `Ctrl+O`, Enter, `Ctrl+X`.

---

## ШАГ 5. Запуск контейнеров

В той же папке:

```bash
cd /var/www/ipg
docker compose build
```

Дождитесь окончания сборки. Запускаем **без** контейнера Nginx (Nginx поставим на сам сервер на шаге 6, так проще настроить SSL):

```bash
docker compose up -d postgres redis api dashboard lending info wallet admin
```

Проверка:

```bash
docker compose ps
```

Должны быть в состоянии `Up`: postgres, redis, api, dashboard, lending, info, wallet. Проверка API:

```bash
curl http://localhost:3001/health
```

Должен ответить что-то вроде `{"status":"ok"}` или `healthy`.

Если есть бэкап БД и нужно импортировать данные — напишите, дам команды для импорта в контейнер PostgreSQL.

---

## ШАГ 6. Nginx на хосте (проксирование на контейнеры)

Сейчас приложения слушают только localhost. Чтобы к ним ходить по домену, на **хосте** ставим Nginx и проксируем запросы.

```bash
sudo apt install -y nginx
```

Создайте конфиг (подставьте свой домен):

```bash
sudo nano /etc/nginx/sites-available/ipg-invest.ae
```

Вставьте (замените `ipg-invest.ae` на ваш домен, если другой):

```nginx
# Лендинг (Invest-Lending)
server {
    listen 80;
    server_name ipg-invest.ae www.ipg-invest.ae;
    location / {
        proxy_pass http://127.0.0.1:5182;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name dashboard.ipg-invest.ae;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name info.ipg-invest.ae;
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name wallet.ipg-invest.ae;
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.ipg-invest.ae;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin App (админ-панель — только для авторизованных админов)
server {
    listen 80;
    server_name admin.ipg-invest.ae;
    location / {
        proxy_pass http://127.0.0.1:3004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Включите сайт и перезапустите Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/ipg-invest.ae /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Важно: в `docker-compose.yml` фронты и API слушают порты 3000, 3001, 3002, 3003, 3004, 5182 на хосте. Если у вас порты не проброшены — в `docker-compose.yml` в секции `ports` для каждого сервиса должно быть что-то вроде `"3001:3001"`. Проверьте, что они есть.

---

## ШАГ 7. DNS

В панели управления доменом (где купили ipg-invest.ae) добавьте A-записи:

| Имя (Host)     | Тип | Значение    | TTL |
|----------------|-----|-------------|-----|
| @              | A   | IP_СЕРВЕРА  | 300 |
| www            | A   | IP_СЕРВЕРА  | 300 |
| dashboard      | A   | IP_СЕРВЕРА  | 300 |
| info           | A   | IP_СЕРВЕРА  | 300 |
| wallet         | A   | IP_СЕРВЕРА  | 300 |
| api            | A   | IP_СЕРВЕРА  | 300 |
| admin          | A   | IP_СЕРВЕРА  | 300 |

Подождите 5–30 минут, проверьте:

```bash
nslookup ipg-invest.ae
nslookup dashboard.ipg-invest.ae
```

Должен отвечать IP вашего сервера.

---

## ШАГ 8. SSL (HTTPS)

На сервере:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ipg-invest.ae -d www.ipg-invest.ae -d dashboard.ipg-invest.ae -d info.ipg-invest.ae -d wallet.ipg-invest.ae -d api.ipg-invest.ae -d admin.ipg-invest.ae
```

Следуйте подсказкам (email, согласие с условиями). Certbot сам настроит Nginx на HTTPS.

Проверка:

```bash
curl -I https://ipg-invest.ae
curl -I https://api.ipg-invest.ae/health
```

---

## Готово

После шага 8 сайт должен открываться по:

- https://ipg-invest.ae  
- https://dashboard.ipg-invest.ae  
- https://info.ipg-invest.ae  
- https://wallet.ipg-invest.ae  
- https://api.ipg-invest.ae  
- https://admin.ipg-invest.ae (админ-панель)

Если на каком-то шаге ошибка — напишите номер шага и текст ошибки (или скрин), подскажу, что поправить.
