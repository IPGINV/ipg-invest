# 🚀 ПОЛНАЯ ИНСТРУКЦИЯ ПО ДЕПЛОЮ ПРОЕКТА IPG-INVEST
## От Git репозитория до запуска на Ubuntu сервере

---

## 📋 СОДЕРЖАНИЕ
1. [Подготовка Git репозитория](#шаг-1-подготовка-git-репозитория)
2. [Настройка сервера Ubuntu](#шаг-2-настройка-сервера-ubuntu)
3. [Клонирование проекта на сервер](#шаг-3-клонирование-проекта-на-сервер)
4. [Настройка окружения](#шаг-4-настройка-окружения)
5. [Установка Docker](#шаг-5-установка-docker)
6. [Настройка DNS](#шаг-6-настройка-dns)
7. [Настройка Nginx и SSL](#шаг-7-настройка-nginx-и-ssl)
8. [Запуск проекта](#шаг-8-запуск-проекта)
9. [Проверка работы](#шаг-9-проверка-работы)

---

## ШАГ 1: ПОДГОТОВКА GIT РЕПОЗИТОРИЯ

### 1.1. Создайте `.gitignore` файл

На вашем Windows компьютере в папке проекта:

```bash
# В PowerShell
cd "C:\Users\HP\Desktop\Project site invest"
```

Создайте файл `.gitignore`:

```gitignore
# Node modules
node_modules/
**/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
**/.env
**/.env.local

# Но оставляем .env.production.example для документации
!.env.production.example

# Build outputs
dist/
build/
**/dist/
**/build/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
**/logs/

# Database backups (слишком большие)
backups/*.sql
backups/*.sql.gz
# Оставляем только папку
!backups/.gitkeep

# Uploads
server/uploads/*
!server/uploads/.gitkeep

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
desktop.ini

# Temporary files
*.tmp
*.temp
.cache/

# Docker volumes (если есть)
postgres_data/
redis_data/

# Testing
coverage/
.nyc_output/
```

### 1.2. Инициализируйте Git репозиторий

```bash
git init
git add .
git commit -m "Initial commit: IPG Invest multi-app project"
```

### 1.3. Создайте репозиторий на GitHub

1. Откройте https://github.com/new
2. Название: `ipg-invest` (или любое другое)
3. Выберите **Private** (рекомендуется для коммерческих проектов)
4. **НЕ** добавляйте README, .gitignore, license (у вас уже есть)
5. Нажмите **Create repository**

### 1.4. Свяжите локальный репозиторий с GitHub

GitHub покажет команды, например:

```bash
git remote add origin https://github.com/ваш-username/ipg-invest.git
git branch -M main
git push -u origin main
```

**Альтернатива через SSH** (рекомендуется):

```bash
# Если у вас настроен SSH ключ
git remote add origin git@github.com:ваш-username/ipg-invest.git
git branch -M main
git push -u origin main
```

### 1.5. Создайте `.gitkeep` файлы для пустых папок

```bash
# Чтобы Git отслеживал пустые папки
echo "" > backups/.gitkeep
echo "" > server/uploads/.gitkeep
git add backups/.gitkeep server/uploads/.gitkeep
git commit -m "Add .gitkeep files for empty directories"
git push
```

✅ **Репозиторий готов!** Переходим к серверу.

---

## ШАГ 2: НАСТРОЙКА СЕРВЕРА UBUNTU

### 2.1. Подключитесь к серверу

```bash
ssh root@ваш-ip-адрес
# или
ssh ваш-username@ваш-ip-адрес
```

### 2.2. Обновите систему

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3. Создайте пользователя для проекта (опционально, но рекомендуется)

```bash
# Создание пользователя
sudo adduser deploy
sudo usermod -aG sudo deploy

# Переключитесь на нового пользователя
su - deploy
```

### 2.4. Установите базовые инструменты

```bash
sudo apt install -y git curl wget nano htop ufw
```

### 2.5. Настройте файрвол

```bash
# Разрешите SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## ШАГ 3: КЛОНИРОВАНИЕ ПРОЕКТА НА СЕРВЕР

### 3.1. Установите Git (если еще не установлен)

```bash
git --version
# Если нет, установите:
sudo apt install git -y
```

### 3.2. Настройте SSH для GitHub (рекомендуется)

```bash
# Генерация SSH ключа
ssh-keygen -t ed25519 -C "ваш-email@example.com"
# Нажмите Enter 3 раза (путь по умолчанию, без пароля)

# Скопируйте публичный ключ
cat ~/.ssh/id_ed25519.pub
```

Скопируйте вывод и добавьте в GitHub:
1. https://github.com/settings/keys
2. "New SSH key"
3. Вставьте ключ, дайте название "Ubuntu Server"

### 3.3. Клонируйте репозиторий

```bash
# Создайте папку для проектов
mkdir -p ~/projects
cd ~/projects

# Клонируйте репозиторий (SSH)
git clone git@github.com:ваш-username/ipg-invest.git

# Или через HTTPS (если SSH не настроен)
git clone https://github.com/ваш-username/ipg-invest.git

# Перейдите в папку проекта
cd ipg-invest
```

### 3.4. Проверьте структуру проекта

```bash
ls -la
# Вы должны увидеть:
# - Dashboard/
# - Invest-Lending/
# - Info/
# - Wallet/
# - admin/
# - server/
# - docker-compose.yml
# - nginx/
```

✅ **Проект на сервере!**

---

## ШАГ 4: НАСТРОЙКА ОКРУЖЕНИЯ

### 4.1. Создайте `.env` файл в корне проекта

```bash
cd ~/projects/ipg-invest
nano .env
```

**Вставьте содержимое** (смените пароли и секреты):

```env
# ============================================
# КОНФИГУРАЦИЯ ДЛЯ DOCKER-COMPOSE (PRODUCTION)
# ============================================

# БАЗА ДАННЫХ POSTGRESQL
PGUSER=ipg_user
PGPASSWORD=ВАШ_БЕЗОПАСНЫЙ_ПАРОЛЬ_СЮДА
PGDATABASE=ipg_production

# БЕЗОПАСНОСТЬ (JWT)
# Сгенерируйте: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=сгенерированный_секрет_32_символа_минимум
REFRESH_TOKEN_SECRET=другой_сгенерированный_секрет_32_символа

# ДОМЕН И CORS
DOMAIN=ipg-invest.ae
CORS_ORIGIN=https://ipg-invest.ae,https://www.ipg-invest.ae,https://dashboard.ipg-invest.ae,https://info.ipg-invest.ae,https://wallet.ipg-invest.ae,https://admin.ipg-invest.ae

# REDIS
REDIS_PASSWORD=

# EMAIL
EMAIL_SERVICE=elasticemail
EMAIL_HOST=smtp.elasticemail.com
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=invest.gold2025@proton.me
EMAIL_PASSWORD=5EFC51B09C8BA9D2A6FB60A85F5E560AD508

# TELEGRAM BOT
TELEGRAM_BOT_TOKEN=8469443969:AAEtv5x_Ta4JQ8fpLFANyYTo_DgQv0kALxU

# FRONTEND BUILD
VITE_API_BASE_URL=https://api.ipg-invest.ae
VITE_DASHBOARD_APP_URL=https://dashboard.ipg-invest.ae
GEMINI_API_KEY=
```

**Сохраните:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 4.2. Сгенерируйте безопасные секреты

Установите Node.js временно для генерации:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Генерация секретов
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Скопируйте эти 2 строки и вставьте в .env как JWT_SECRET и REFRESH_TOKEN_SECRET
```

Откройте `.env` снова и вставьте секреты:

```bash
nano .env
```

### 4.3. Создайте папки для данных

```bash
mkdir -p backups
mkdir -p server/uploads
```

✅ **Окружение настроено!**

---

## ШАГ 5: УСТАНОВКА DOCKER

### 5.1. Удалите старые версии Docker (если есть)

```bash
sudo apt remove docker docker-engine docker.io containerd runc
```

### 5.2. Установите Docker

```bash
# Установка зависимостей
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Добавление GPG ключа Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавление репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Проверка версии
docker --version
docker compose version
```

### 5.3. Добавьте пользователя в группу Docker

```bash
sudo usermod -aG docker $USER

# Перезапустите сессию или выполните:
newgrp docker

# Проверьте (должно работать без sudo)
docker ps
```

### 5.4. Настройте автозапуск Docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
```

✅ **Docker установлен!**

---

## ШАГ 6: НАСТРОЙКА DNS

### 6.1. Добавьте A-записи в DNS вашего домена

Зайдите в панель управления DNS вашего регистратора домена (например, GoDaddy, Namecheap, Cloudflare) и добавьте:

| Тип | Имя              | Значение           | TTL  |
|-----|------------------|--------------------|------|
| A   | @                | ВАШ_IP_СЕРВЕРА     | 3600 |
| A   | www              | ВАШ_IP_СЕРВЕРА     | 3600 |
| A   | dashboard        | ВАШ_IP_СЕРВЕРА     | 3600 |
| A   | api              | ВАШ_IP_СЕРВЕРА     | 3600 |
| A   | info             | ВАШ_IP_СЕРВЕРА     | 3600 |
| A   | wallet           | ВАШ_IP_СЕРВЕРА     | 3600 |
| A   | admin            | ВАШ_IP_СЕРВЕРА     | 3600 |

**Примечание:** DNS распространяется 5-60 минут.

### 6.2. Проверьте DNS

```bash
# Установите dig (если нет)
sudo apt install dnsutils -y

# Проверьте каждый поддомен
dig ipg-invest.ae +short
dig dashboard.ipg-invest.ae +short
dig api.ipg-invest.ae +short
dig info.ipg-invest.ae +short
dig wallet.ipg-invest.ae +short
dig admin.ipg-invest.ae +short

# Все должны вернуть IP вашего сервера
```

✅ **DNS настроен!**

---

## ШАГ 7: НАСТРОЙКА NGINX И SSL

### 7.1. Установите Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

### 7.2. Скопируйте конфигурацию Nginx

```bash
cd ~/projects/ipg-invest

# Скопируйте главную конфигурацию
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Создайте папки для SSL
sudo mkdir -p /etc/nginx/ssl

# Скопируйте конфигурацию домена
sudo cp nginx/conf.d/ipg-invest.ae.conf /etc/nginx/conf.d/

# Проверьте синтаксис
sudo nginx -t
```

**⚠️ ВАЖНО:** На этом этапе Nginx НЕ запустится (нет SSL сертификатов). Это нормально.

### 7.3. Временная конфигурация для получения SSL

Создайте временную конфигурацию:

```bash
sudo nano /etc/nginx/conf.d/temp-ssl.conf
```

Вставьте:

```nginx
server {
    listen 80;
    server_name ipg-invest.ae www.ipg-invest.ae dashboard.ipg-invest.ae api.ipg-invest.ae info.ipg-invest.ae wallet.ipg-invest.ae admin.ipg-invest.ae;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 "Server is ready for SSL";
        add_header Content-Type text/plain;
    }
}
```

Сохраните и перезапустите:

```bash
sudo mkdir -p /var/www/certbot
sudo nginx -t
sudo systemctl restart nginx
```

### 7.4. Установите Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 7.5. Получите SSL сертификаты

```bash
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d ipg-invest.ae \
  -d www.ipg-invest.ae \
  -d dashboard.ipg-invest.ae \
  -d api.ipg-invest.ae \
  -d info.ipg-invest.ae \
  -d wallet.ipg-invest.ae \
  -d admin.ipg-invest.ae \
  --email invest.gold2025@proton.me \
  --agree-tos \
  --no-eff-email
```

**Ответьте на вопросы:**
- Email: `invest.gold2025@proton.me`
- Согласие с условиями: `Y`

### 7.6. Обновите конфигурацию Nginx с SSL путями

Certbot создаст сертификаты в `/etc/letsencrypt/live/ipg-invest.ae/`

Откройте конфигурацию:

```bash
sudo nano /etc/nginx/conf.d/ipg-invest.ae.conf
```

Найдите все строки с `ssl_certificate` и обновите:

```nginx
# Было (пример):
ssl_certificate /etc/nginx/ssl/dashboard.ipg-invest.ae/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/dashboard.ipg-invest.ae/privkey.pem;

# Стало:
ssl_certificate /etc/letsencrypt/live/ipg-invest.ae/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/ipg-invest.ae/privkey.pem;
```

**Сделайте это для ВСЕХ server блоков** (dashboard, api, info, wallet, admin).

### 7.7. Удалите временную конфигурацию

```bash
sudo rm /etc/nginx/conf.d/temp-ssl.conf
```

### 7.8. Проверьте и перезапустите Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 7.9. Настройте автообновление SSL

```bash
# Certbot автоматически добавляет задание в cron
sudo certbot renew --dry-run
```

✅ **Nginx и SSL настроены!**

---

## ШАГ 8: ЗАПУСК ПРОЕКТА

### 8.1. Вернитесь в папку проекта

```bash
cd ~/projects/ipg-invest
```

### 8.2. Обновите конфигурацию Nginx для проксирования

Откройте:

```bash
sudo nano /etc/nginx/conf.d/ipg-invest.ae.conf
```

Убедитесь, что `proxy_pass` указывает на **localhost:ПОРТ** (не на Docker service names):

```nginx
# API (api.ipg-invest.ae)
location / {
    proxy_pass http://127.0.0.1:3001;
    # ...
}

# Dashboard (dashboard.ipg-invest.ae)
location / {
    proxy_pass http://127.0.0.1:3000;
    # ...
}

# Invest-Lending (ipg-invest.ae и www.ipg-invest.ae)
location / {
    proxy_pass http://127.0.0.1:5182;
    # ...
}

# Info (info.ipg-invest.ae)
location / {
    proxy_pass http://127.0.0.1:3002;
    # ...
}

# Wallet (wallet.ipg-invest.ae)
location / {
    proxy_pass http://127.0.0.1:3003;
    # ...
}

# Admin (admin.ipg-invest.ae)
location / {
    proxy_pass http://127.0.0.1:3004;
    # ...
}
```

Перезапустите Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 8.3. Запустите Docker контейнеры

**Без встроенного Nginx контейнера** (используем Nginx на хосте):

```bash
docker compose up -d postgres redis api dashboard lending info wallet admin
```

**Проверьте статус:**

```bash
docker compose ps
```

Вывод должен быть:

```
NAME              STATUS    PORTS
ipg-postgres      Up        0.0.0.0:5432->5432/tcp
ipg-redis         Up        0.0.0.0:6379->6379/tcp
ipg-api           Up        0.0.0.0:3001->3001/tcp
ipg-dashboard     Up        0.0.0.0:3000->80/tcp
ipg-lending       Up        0.0.0.0:5182->80/tcp
ipg-info          Up        0.0.0.0:3002->80/tcp
ipg-wallet        Up        0.0.0.0:3003->80/tcp
ipg-admin         Up        0.0.0.0:3004->80/tcp
```

### 8.4. Проверьте логи контейнеров

```bash
# Логи API
docker compose logs -f api

# Логи базы данных
docker compose logs postgres

# Логи всех сервисов
docker compose logs --tail=50
```

**Если есть ошибки** — исправьте их перед продолжением.

### 8.5. Инициализируйте базу данных

Если у вас есть бэкап БД:

```bash
# Скопируйте бэкап на сервер (с локального Windows)
scp "C:\Users\HP\Desktop\Project site invest\backups\ipg_backup_XXXXXX.sql.gz" deploy@ваш-ip:~/projects/ipg-invest/backups/

# На сервере импортируйте
cd ~/projects/ipg-invest/server/scripts
chmod +x import-database.sh
./import-database.sh ../backups/ipg_backup_XXXXXX.sql.gz
```

Или если БД пустая, API должен автоматически создать таблицы при первом запуске.

✅ **Проект запущен!**

---

## ШАГ 9: ПРОВЕРКА РАБОТЫ

### 9.1. Проверьте доступность приложений

Откройте в браузере:

1. **Landing Page:** https://ipg-invest.ae
2. **Dashboard:** https://dashboard.ipg-invest.ae
3. **Info App:** https://info.ipg-invest.ae
4. **Wallet:** https://wallet.ipg-invest.ae
5. **Admin:** https://admin.ipg-invest.ae
6. **API Health:** https://api.ipg-invest.ae/health

### 9.2. Проверьте API

```bash
curl https://api.ipg-invest.ae/health
# Ожидаемый ответ: {"status":"ok","timestamp":"..."}
```

### 9.3. Проверьте логи Nginx

```bash
# Логи доступа
sudo tail -f /var/log/nginx/access.log

# Логи ошибок
sudo tail -f /var/log/nginx/error.log

# Логи API
sudo tail -f /var/log/nginx/api_access.log
```

### 9.4. Проверьте SSL

```bash
# Проверка сертификата
openssl s_client -connect ipg-invest.ae:443 -servername ipg-invest.ae < /dev/null | grep "Verify return code"

# Должен вернуть: Verify return code: 0 (ok)
```

### 9.5. Мониторинг контейнеров

```bash
# Статус
docker compose ps

# Использование ресурсов
docker stats

# Логи в реальном времени
docker compose logs -f
```

---

## 🎉 ПОЗДРАВЛЯЕМ! ПРОЕКТ ЗАПУЩЕН!

### 📊 Полезные команды

#### Управление Docker

```bash
# Перезапуск всех контейнеров
docker compose restart

# Остановка
docker compose stop

# Удаление и пересоздание
docker compose down
docker compose up -d postgres redis api dashboard lending info wallet admin

# Обновление после изменений в коде
docker compose down
docker compose build --no-cache
docker compose up -d postgres redis api dashboard lending info wallet admin

# Очистка неиспользуемых образов
docker system prune -a
```

#### Управление Nginx

```bash
# Перезапуск
sudo systemctl restart nginx

# Проверка конфигурации
sudo nginx -t

# Просмотр логов
sudo tail -f /var/log/nginx/error.log
```

#### Мониторинг

```bash
# Использование диска
df -h

# Использование памяти
free -h

# Процессы
htop

# Размер логов Docker
sudo du -sh /var/lib/docker/containers/*
```

#### Бэкап базы данных

```bash
cd ~/projects/ipg-invest/server/scripts
chmod +x export-database.sh
./export-database.sh

# Бэкап будет в backups/
ls -lh ../backups/
```

---

## 🚨 TROUBLESHOOTING

### Проблема: Контейнер не запускается

```bash
# Проверьте логи
docker compose logs имя-контейнера

# Пересоздайте контейнер
docker compose up -d --force-recreate имя-контейнера
```

### Проблема: 502 Bad Gateway

```bash
# Проверьте, что контейнеры запущены
docker compose ps

# Проверьте, что порты открыты
sudo netstat -tulpn | grep LISTEN

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### Проблема: SSL не работает

```bash
# Проверьте сертификаты
sudo certbot certificates

# Обновите сертификаты
sudo certbot renew --force-renewal

# Перезапустите Nginx
sudo systemctl restart nginx
```

### Проблема: База данных не подключается

```bash
# Проверьте контейнер PostgreSQL
docker compose logs postgres

# Проверьте подключение
docker compose exec postgres psql -U ipg_user -d ipg_production -c "SELECT version();"

# Проверьте .env файл
cat .env | grep PG
```

---

## 📞 ПОДДЕРЖКА

Если возникли вопросы:
1. Проверьте логи: `docker compose logs`
2. Проверьте логи Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Проверьте статус: `docker compose ps` и `sudo systemctl status nginx`

---

## ✅ ЧЕКЛИСТ ЗАВЕРШЕНИЯ

- [ ] Git репозиторий создан и код загружен
- [ ] Сервер Ubuntu настроен и обновлен
- [ ] Проект склонирован на сервер
- [ ] `.env` файл создан с безопасными секретами
- [ ] Docker установлен и работает
- [ ] DNS A-записи добавлены и проверены
- [ ] SSL сертификаты получены и установлены
- [ ] Nginx настроен и запущен
- [ ] Docker контейнеры запущены
- [ ] База данных инициализирована/импортирована
- [ ] Все URL доступны через HTTPS
- [ ] API отвечает на запросы

---

**УСПЕШНОГО ДЕПЛОЯ! 🚀**
