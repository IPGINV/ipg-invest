# 🚀 ПОЛНОЕ РУКОВОДСТВО ПО ДЕПЛОЮ НА UBUNTU SERVER

## Imperial Pure Gold - Production Deployment Guide

---

## 📋 СОДЕРЖАНИЕ

1. [Требования к серверу](#требования-к-серверу)
2. [⚠️ КРИТИЧНО: База данных](#критично-база-данных)
3. [Подготовка на Windows](#подготовка-на-windows)
4. [Настройка Ubuntu сервера](#настройка-ubuntu-сервера)
5. [Деплой с Docker](#деплой-с-docker-рекомендуется)
6. [Деплой без Docker (PM2)](#деплой-без-docker-pm2)
7. [SSL сертификаты](#ssl-сертификаты)
8. [Проверка и мониторинг](#проверка-и-мониторинг)
9. [Backup и восстановление](#backup-и-восстановление)

---

## 📦 ТРЕБОВАНИЯ К СЕРВЕРУ

### **Минимальные требования:**
- **OS:** Ubuntu 22.04 LTS или 24.04 LTS
- **CPU:** 2 cores (4 cores рекомендуется)
- **RAM:** 4 GB (8 GB рекомендуется)
- **Disk:** 40 GB SSD (100 GB для production)
- **Network:** Статический IP адрес

### **Необходимое ПО:**
```bash
- Node.js 20.x
- PostgreSQL 16
- Redis 7
- Nginx 1.24+
- PM2 (для non-Docker deployment)
- Docker & Docker Compose (для Docker deployment)
- Git
- Certbot (для SSL)
```

---

## ⚠️ КРИТИЧНО: БАЗА ДАННЫХ

### **🔴 ОСОБЕННОСТИ ПЕРЕНОСА PostgreSQL**

#### **ВАЖНО #1: Кодировка и локаль**

PostgreSQL чувствителен к кодировке. Убедитесь:

```bash
# На Windows (перед экспортом):
# Проверьте кодировку БД
psql -U postgres -d ipg -c "SHOW server_encoding;"
# Должно быть: UTF8

# На Ubuntu (при создании БД):
sudo -u postgres createdb ipg_production \
    --encoding=UTF8 \
    --locale=en_US.UTF-8 \
    --template=template0
```

**Если кодировки не совпадают → данные могут повредиться!**

---

#### **ВАЖНО #2: Версии PostgreSQL**

**Windows версия:** (проверьте вашу)
```bash
psql --version
```

**Ubuntu версия:** Должна быть **≥ версии Windows** или совместимая

```bash
# Установка PostgreSQL 16 на Ubuntu:
sudo apt install -y postgresql-16
```

**⚠️ Если версии различаются:**
- При экспорте используйте: `pg_dump --no-owner --no-acl`
- Возможны проблемы с триггерами и функциями

---

#### **ВАЖНО #3: Схема `ipg`**

Проект использует **отдельную схему** `ipg`, а не `public`:

```sql
-- Все таблицы находятся в:
SET search_path TO ipg;

-- Таблицы:
ipg.users
ipg.balances
ipg.contracts
ipg.transactions
ipg.sessions
ipg.token_price_history
ipg.admin_logs
```

**При импорте убедитесь, что схема создана!**

---

#### **ВАЖНО #4: Права доступа**

На Ubuntu создайте отдельного пользователя (не `postgres`):

```bash
sudo -u postgres psql

CREATE USER ipg_user WITH PASSWORD 'strong_password_here';
CREATE DATABASE ipg_production OWNER ipg_user;

\c ipg_production

CREATE SCHEMA IF NOT EXISTS ipg;
GRANT ALL PRIVILEGES ON SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ipg TO ipg_user;

-- Для будущих объектов
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON TABLES TO ipg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON SEQUENCES TO ipg_user;
```

---

#### **ВАЖНО #5: Триггеры и функции**

Проект использует:
- `set_updated_at()` - автообновление `updated_at`
- `create_default_balances()` - автосоздание балансов

**Проверьте после импорта:**
```sql
-- Список триггеров
\dft ipg.*

-- Должны быть:
-- users_set_updated_at
-- balances_set_updated_at
-- transactions_set_updated_at
-- contracts_set_updated_at
-- users_create_default_balances
```

---

## 🔧 ПОДГОТОВКА НА WINDOWS

### **Шаг 1: Экспорт базы данных**

```bash
# Перейдите в папку server
cd server

# Запустите скрипт экспорта (в Git Bash или WSL)
bash scripts/export-database.sh

# Результат:
# backups/
#   ├── schema_20260202_123456.sql   (только структура)
#   ├── data_20260202_123456.sql     (только данные)
#   └── ipg_backup_20260202_123456.sql.gz (полный бэкап, сжатый)
```

**⚠️ КРИТИЧНО:** Проверьте размер backup файла:
```bash
ls -lh backups/*.gz

# Если файл < 1 KB → экспорт провалился!
# Если файл > 0 → всё ОК
```

---

### **Шаг 2: Проверка backup**

```bash
# Распакуйте и проверьте содержимое:
gunzip -c backups/ipg_backup_20260202_123456.sql.gz | head -100

# Должны увидеть:
# CREATE SCHEMA IF NOT EXISTS ipg;
# SET search_path TO ipg;
# CREATE TYPE user_status_enum AS ENUM ...
# CREATE TABLE users ...
```

---

### **Шаг 3: Build production версий**

```bash
# Dashboard
cd Dashboard
npm run build
# Результат: dist/ папка

# Invest-Lending
cd ../Invest-Lending
npm run build
# Результат: dist/ папка

# Info
cd ../Info
npm run build

# Wallet
cd ../Wallet
npm run build
```

---

### **Шаг 4: Подготовка файлов для переноса**

Создайте архив:
```bash
cd "C:\Users\HP\Desktop\Project site invest"

# Вариант A: Весь проект (без node_modules)
tar -czf ipg-project.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=.vite \
    --exclude=*.log \
    .

# Вариант B: Только необходимое
mkdir ipg-deploy
cp -r server ipg-deploy/
cp -r Dashboard/dist ipg-deploy/dashboard-dist
cp -r Invest-Lending/dist ipg-deploy/lending-dist
cp -r Info/dist ipg-deploy/info-dist
cp -r Wallet/dist ipg-deploy/wallet-dist
cp docker-compose.yml ipg-deploy/
cp ecosystem.config.js ipg-deploy/
cp -r nginx ipg-deploy/
cp schema.sql ipg-deploy/
cp server/backups/*.gz ipg-deploy/

tar -czf ipg-deploy.tar.gz ipg-deploy/
```

---

## 🖥️ НАСТРОЙКА UBUNTU СЕРВЕРА

### **Шаг 1: Подключение к серверу**

```bash
ssh root@your-server-ip

# или через SSH key
ssh -i ~/.ssh/ipg-server.pem ubuntu@your-server-ip
```

---

### **Шаг 2: Обновление системы**

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

---

### **Шаг 3: Установка Node.js 20**

```bash
# Установка через NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка
node --version  # должно быть v20.x.x
npm --version
```

---

### **Шаг 4: Установка PostgreSQL 16**

```bash
# Добавить PostgreSQL репозиторий
sudo apt install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y

# Установка PostgreSQL 16
sudo apt install -y postgresql-16 postgresql-contrib-16

# Проверка
sudo systemctl status postgresql

# Должен быть: active (running)
```

---

### **🔴 Шаг 5: НАСТРОЙКА БАЗЫ ДАННЫХ (КРИТИЧНО!)**

#### **Вариант A: Автоматическая настройка**

```bash
# Скопируйте файл на сервер
scp server/scripts/setup-ubuntu-database.sh root@server:/root/

# Запустите на сервере
sudo bash setup-ubuntu-database.sh

# Скрипт автоматически:
# ✅ Установит PostgreSQL
# ✅ Создаст пользователя ipg_user
# ✅ Создаст базу ipg_production
# ✅ Настроит права доступа
# ✅ Проверит соединение
```

---

#### **Вариант B: Ручная настройка (если автоскрипт не работает)**

```bash
# 1. Войти в PostgreSQL
sudo -u postgres psql

# 2. Создать пользователя
CREATE USER ipg_user WITH PASSWORD 'your_strong_password_here';

# 3. Создать базу данных с правильной кодировкой
CREATE DATABASE ipg_production 
    OWNER ipg_user
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE template0;

# 4. Подключиться к базе
\c ipg_production

# 5. Создать схему
CREATE SCHEMA IF NOT EXISTS ipg;

# 6. Настроить права
GRANT ALL PRIVILEGES ON SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON DATABASE ipg_production TO ipg_user;

# 7. Для будущих объектов
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON TABLES TO ipg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON SEQUENCES TO ipg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON FUNCTIONS TO ipg_user;

# 8. Выход
\q
```

---

#### **🔴 КРИТИЧНО: Настройка pg_hba.conf**

Файл: `/etc/postgresql/16/main/pg_hba.conf`

```bash
# Откройте файл
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Добавьте строку (ПЕРЕД строкой с "peer"):
# TYPE  DATABASE        USER        ADDRESS         METHOD
host    ipg_production  ipg_user    127.0.0.1/32    md5
host    ipg_production  ipg_user    ::1/128         md5

# Сохраните (Ctrl+X, Y, Enter)

# Перезапустите PostgreSQL
sudo systemctl restart postgresql
```

---

#### **🔴 КРИТИЧНО: Тест соединения**

```bash
# Проверьте, что можете подключиться
psql -h localhost -U ipg_user -d ipg_production

# Если спрашивает пароль → вводите
# Если подключилось → отлично!

# Внутри psql проверьте:
\l                    # Список баз
\dn                   # Список схем
SET search_path TO ipg;
\dt                   # Список таблиц (должно быть пусто пока)

\q  # Выход
```

---

### **Шаг 6: Импорт schema и данных**

#### **Метод 1: Через apply-schema.js (рекомендуется)**

```bash
# Скопируйте проект на сервер
cd /var/www
git clone <your-repo> ipg
cd ipg

# Или загрузите архив
scp ipg-deploy.tar.gz root@server:/var/www/
tar -xzf ipg-deploy.tar.gz
mv ipg-deploy ipg

# Настройте .env
cd server
cp .env.production .env
nano .env  # Отредактируйте пароли

# Установите зависимости
npm install --production

# Примените схему
node scripts/apply-schema.js

# Должно вывести:
# Applying schema: X statements
# Schema applied
```

---

#### **Метод 2: Импорт из backup**

```bash
# Скопируйте backup на сервер
scp backups/ipg_backup_20260202_123456.sql.gz root@server:/tmp/

# На сервере:
cd /var/www/ipg/server

# Запустите импорт
bash scripts/import-database.sh /tmp/ipg_backup_20260202_123456.sql.gz

# Скрипт:
# ✅ Проверит существует ли БД
# ✅ Распакует backup
# ✅ Импортирует все данные
# ✅ Проверит количество таблиц и записей
```

---

#### **🔴 ПРОБЛЕМЫ ПРИ ИМПОРТЕ И РЕШЕНИЯ:**

##### **Проблема 1: "permission denied for schema ipg"**

**Решение:**
```sql
sudo -u postgres psql -d ipg_production

GRANT ALL PRIVILEGES ON SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ipg TO ipg_user;

\q
```

---

##### **Проблема 2: "role does not exist"**

**Причина:** В backup есть старое имя пользователя

**Решение:**
```bash
# Импортируйте БЕЗ owner information
gunzip -c backup.sql.gz | psql -h localhost -U ipg_user -d ipg_production

# Или измените backup перед импортом:
gunzip backup.sql.gz
sed -i 's/OWNER TO postgres/OWNER TO ipg_user/g' backup.sql
psql -h localhost -U ipg_user -d ipg_production -f backup.sql
```

---

##### **Проблема 3: "could not open file for reading"**

**Причина:** Недостаточно прав на файл

**Решение:**
```bash
chmod +r backup.sql.gz
chown $(whoami):$(whoami) backup.sql.gz
```

---

##### **Проблема 4: Triggers не импортировались**

**Решение:** Примените schema.sql вручную:
```bash
psql -h localhost -U ipg_user -d ipg_production -f /var/www/ipg/schema.sql
```

---

#### **🔴 ПРОВЕРКА ПОСЛЕ ИМПОРТА**

```bash
psql -h localhost -U ipg_user -d ipg_production

-- Проверка таблиц
SET search_path TO ipg;
\dt

-- Должны быть:
--  admin_logs
--  balances
--  contracts
--  sessions
--  token_price_history
--  transactions
--  users

-- Проверка триггеров
SELECT tgname FROM pg_trigger WHERE tgname LIKE '%ipg%';

-- Должны быть:
--  users_set_updated_at
--  balances_set_updated_at
--  users_create_default_balances
--  и т.д.

-- Проверка данных
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM balances;
SELECT COUNT(*) FROM contracts;
SELECT COUNT(*) FROM transactions;

-- Выход
\q
```

---

### **Шаг 7: Установка Redis**

```bash
sudo apt install -y redis-server

# Настройка Redis
sudo nano /etc/redis/redis.conf

# Найдите и измените:
# supervised no  →  supervised systemd
# bind 127.0.0.1  (оставьте для локального доступа)

# Перезапуск
sudo systemctl restart redis
sudo systemctl enable redis

# Проверка
redis-cli ping
# Должно вывести: PONG
```

---

### **Шаг 8: Установка Nginx**

```bash
sudo apt install -y nginx

# Запуск
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверка
curl http://localhost
# Должна вернуть страницу nginx
```

---

## 🐳 ДЕПЛОЙ С DOCKER (РЕКОМЕНДУЕТСЯ)

### **Преимущества Docker:**
- ✅ Изолированная среда
- ✅ Легко масштабировать
- ✅ Простое обновление
- ✅ Все зависимости включены
- ✅ Автоматический перезапуск

---

### **Шаг 1: Установка Docker**

```bash
# Установка Docker
curl -fsSL https://get.docker.com | sh

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo apt install -y docker-compose-plugin

# Проверка
docker --version
docker compose version
```

---

### **Шаг 2: Подготовка проекта**

```bash
# Скопируйте проект на сервер
cd /var/www
git clone <your-repo> ipg
# или загрузите tar.gz

cd ipg

# Создайте .env файл
cp .env.production.example .env
nano .env

# ОБЯЗАТЕЛЬНО измените:
# - PGPASSWORD (пароль БД)
# - JWT_SECRET (минимум 32 символа)
# - REFRESH_TOKEN_SECRET (минимум 32 символа)
# - EMAIL_PASSWORD
# - TELEGRAM_BOT_TOKEN
```

---

### **Шаг 3: Build и запуск**

```bash
# Build все контейнеры
docker compose build

# Запуск в фоне
docker compose up -d

# Проверка статуса
docker compose ps

# Должны быть running:
# ipg-postgres
# ipg-redis
# ipg-api
# ipg-dashboard
# ipg-lending
# ipg-info
# ipg-wallet
# ipg-nginx
```

---

### **Шаг 4: Проверка работы**

```bash
# Проверка логов
docker compose logs -f api

# Проверка health endpoints
curl http://localhost:3001/health  # API
curl http://localhost:3000/health  # Dashboard
curl http://localhost:5182/health  # Lending

# Все должны вернуть: healthy или {"status":"ok"}
```

---

## 🔧 ДЕПЛОЙ БЕЗ DOCKER (PM2)

Если Docker не подходит, используйте PM2.

### **Шаг 1: Установка PM2**

```bash
sudo npm install -g pm2

# Проверка
pm2 --version
```

---

### **Шаг 2: Подготовка приложений**

```bash
cd /var/www/ipg

# API Server
cd server
npm install --production
cd ..

# Build frontend apps (если еще не собраны)
cd Dashboard && npm run build && cd ..
cd Invest-Lending && npm run build && cd ..
cd Info && npm run build && cd ..
cd Wallet && npm run build && cd ..
```

---

### **Шаг 3: Запуск с PM2**

```bash
# Из корня проекта
pm2 start ecosystem.config.js --env production

# Проверка
pm2 status

# Должны быть online:
# ipg-api (2 instances)
# ipg-telegram-bot (1 instance)

# Просмотр логов
pm2 logs ipg-api

# Сохранение для автозапуска
pm2 save
pm2 startup
# Выполните команду, которую выведет PM2
```

---

### **Шаг 4: Настройка Nginx для статики**

```bash
# Создайте директории
sudo mkdir -p /var/www/html/dashboard
sudo mkdir -p /var/www/html/lending
sudo mkdir -p /var/www/html/info
sudo mkdir -p /var/www/html/wallet

# Скопируйте build файлы
sudo cp -r /var/www/ipg/Dashboard/dist/* /var/www/html/dashboard/
sudo cp -r /var/www/ipg/Invest-Lending/dist/* /var/www/html/lending/
sudo cp -r /var/www/ipg/Info/dist/* /var/www/html/info/
sudo cp -r /var/www/ipg/Wallet/dist/* /var/www/html/wallet/

# Настройте права
sudo chown -R www-data:www-data /var/www/html
```

---

### **Шаг 5: Nginx конфигурация**

```bash
# Скопируйте конфигурацию
sudo cp nginx/conf.d/ipg-invest.ae.conf /etc/nginx/sites-available/ipg-invest.ae

# Создайте symlink
sudo ln -s /etc/nginx/sites-available/ipg-invest.ae /etc/nginx/sites-enabled/

# Удалите default
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx
```

---

## 🔒 SSL СЕРТИФИКАТЫ

### **Установка Certbot**

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

### **Получение сертификатов**

```bash
# Для каждого домена
sudo certbot --nginx -d ipg-invest.ae -d www.ipg-invest.ae
sudo certbot --nginx -d api.ipg-invest.ae
sudo certbot --nginx -d dashboard.ipg-invest.ae
sudo certbot --nginx -d invest.ipg-invest.ae
sudo certbot --nginx -d info.ipg-invest.ae
sudo certbot --nginx -d wallet.ipg-invest.ae

# Certbot автоматически:
# ✅ Получит сертификаты
# ✅ Настроит Nginx
# ✅ Настроит автопродление
```

---

### **Проверка автопродления**

```bash
# Тест
sudo certbot renew --dry-run

# Если всё ОК → сертификаты будут обновляться автоматически
```

---

## ✅ ПРОВЕРКА И МОНИТОРИНГ

### **Проверка всех сервисов**

```bash
# PostgreSQL
sudo systemctl status postgresql
psql -h localhost -U ipg_user -d ipg_production -c "SELECT version();"

# Redis
redis-cli ping

# PM2 (если используется)
pm2 status
pm2 monit  # Real-time monitoring

# Docker (если используется)
docker compose ps
docker compose logs -f --tail=50

# Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

### **Health checks**

```bash
# API
curl https://api.ipg-invest.ae/health

# Dashboard
curl https://dashboard.ipg-invest.ae/health

# Lending
curl https://ipg-invest.ae/health
```

---

### **Мониторинг логов**

```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/api_error.log

# PM2 logs
pm2 logs --lines 100

# Docker logs
docker compose logs -f api
docker compose logs -f postgres
```

---

## 💾 BACKUP И ВОССТАНОВЛЕНИЕ

### **Автоматический backup (cron)**

```bash
# Создайте скрипт backup
sudo nano /usr/local/bin/ipg-backup.sh

# Содержимое:
#!/bin/bash
export PGPASSWORD='your_password'
BACKUP_DIR="/var/backups/ipg"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p ${BACKUP_DIR}

pg_dump -h localhost -U ipg_user -d ipg_production \
    --schema=ipg \
    -f ${BACKUP_DIR}/ipg_backup_${DATE}.sql

gzip ${BACKUP_DIR}/ipg_backup_${DATE}.sql

# Удалить старые backup (>30 дней)
find ${BACKUP_DIR} -name "*.gz" -mtime +30 -delete

# Сделайте исполняемым
sudo chmod +x /usr/local/bin/ipg-backup.sh

# Добавьте в cron
sudo crontab -e

# Добавьте строку (backup каждый день в 2:00 AM):
0 2 * * * /usr/local/bin/ipg-backup.sh >> /var/log/ipg-backup.log 2>&1
```

---

### **Восстановление из backup**

```bash
# Найдите backup
ls -lh /var/backups/ipg/

# Импортируйте
cd /var/www/ipg/server
bash scripts/import-database.sh /var/backups/ipg/ipg_backup_20260202.sql.gz
```

---

## 🎯 БЫСТРЫЙ ЧЕКЛИСТ ДЕПЛОЯ

### **ДО НАЧАЛА (на Windows):**
- [ ] Экспортировать БД: `bash scripts/export-database.sh`
- [ ] Build все приложения: `npm run build` в каждой папке
- [ ] Проверить размер backup файла (> 1 KB)
- [ ] Создать tar.gz архив проекта

### **НА СЕРВЕРЕ (Ubuntu):**

**База данных:**
- [ ] Установить PostgreSQL 16
- [ ] Создать пользователя `ipg_user`
- [ ] Создать базу `ipg_production` с UTF-8 кодировкой
- [ ] Настроить `pg_hba.conf`
- [ ] Проверить соединение
- [ ] Импортировать schema: `node scripts/apply-schema.js`
- [ ] Проверить триггеры: `\dft ipg.*`
- [ ] Проверить таблицы: `\dt`

**Приложения:**
- [ ] Установить Node.js 20
- [ ] Установить Redis
- [ ] Установить Nginx
- [ ] Установить PM2 или Docker
- [ ] Скопировать проект
- [ ] Настроить .env файлы
- [ ] Запустить приложения
- [ ] Проверить health endpoints

**SSL:**
- [ ] Установить Certbot
- [ ] Получить сертификаты для всех доменов
- [ ] Проверить HTTPS

**Финальная проверка:**
- [ ] Открыть https://ipg-invest.ae (Lending)
- [ ] Открыть https://dashboard.ipg-invest.ae
- [ ] Проверить регистрацию
- [ ] Проверить API запросы
- [ ] Проверить логи

---

## 🚨 ЧАСТЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### **1. "Connection refused" к PostgreSQL**

**Проверьте:**
```bash
# PostgreSQL запущен?
sudo systemctl status postgresql

# Слушает на 5432?
sudo netstat -tulpn | grep 5432

# pg_hba.conf настроен?
sudo cat /etc/postgresql/16/main/pg_hba.conf | grep ipg
```

---

### **2. "Authentication failed for user"**

**Решение:**
```bash
# Сбросьте пароль
sudo -u postgres psql
ALTER USER ipg_user WITH PASSWORD 'new_strong_password';
\q

# Обновите .env
nano /var/www/ipg/server/.env
# PGPASSWORD=new_strong_password
```

---

### **3. "Schema ipg does not exist"**

**Решение:**
```bash
sudo -u postgres psql -d ipg_production
CREATE SCHEMA IF NOT EXISTS ipg;
GRANT ALL PRIVILEGES ON SCHEMA ipg TO ipg_user;
\q
```

---

### **4. "Cannot connect to Redis"**

**Решение:**
```bash
# Запустите Redis
sudo systemctl start redis
sudo systemctl enable redis

# Проверка
redis-cli ping
```

---

### **5. "502 Bad Gateway" на Nginx**

**Проверьте:**
```bash
# API работает?
curl http://localhost:3001/health

# PM2/Docker запущены?
pm2 status  # или docker compose ps

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 ПРОИЗВОДИТЕЛЬНОСТЬ PRODUCTION

### **Рекомендованные настройки PostgreSQL:**

```bash
sudo nano /etc/postgresql/16/main/postgresql.conf

# Для сервера с 8GB RAM:
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 5MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
max_parallel_maintenance_workers = 2
```

---

## 📞 ПОДДЕРЖКА

Если возникли проблемы:

1. Проверьте логи:
   - PostgreSQL: `/var/log/postgresql/`
   - Nginx: `/var/log/nginx/`
   - PM2: `pm2 logs`
   - Docker: `docker compose logs`

2. Проверьте статус всех сервисов

3. Обратитесь к этому руководству

---

## ✅ ЗАКЛЮЧЕНИЕ

Проект готов к deployment. Следуйте этому руководству шаг за шагом.

**КРИТИЧНО:** Уделите особое внимание разделу "База данных" - это самая сложная часть миграции!

---

**Дата:** 2026-02-02  
**Версия:** 1.0  
**Статус:** Production Ready
