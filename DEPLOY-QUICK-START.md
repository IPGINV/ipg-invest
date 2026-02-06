# 🚀 БЫСТРЫЙ СТАРТ: ДЕПЛОЙ НА UBUNTU СЕРВЕР

## ✅ ЧТО УЖЕ ГОТОВО
- ✅ Git репозиторий: https://github.com/IPGINV/ipg-invest
- ✅ Все файлы загружены на GitHub
- ✅ Docker конфигурация готова
- ✅ Nginx конфигурация готова
- ✅ Скрипты миграции БД готовы

---

## 📝 ЧТО НУЖНО СДЕЛАТЬ

### Подготовьте:
1. **Ubuntu сервер** (версия 20.04 или 22.04)
2. **Доступ по SSH** (root или sudo пользователь)
3. **IP адрес сервера**
4. **Домен ipg-invest.ae** должен быть направлен на IP сервера

---

## ШАГ 1: ПОДКЛЮЧИТЕСЬ К СЕРВЕРУ

```bash
ssh root@ваш-ip-адрес
# или
ssh ваш-пользователь@ваш-ip-адрес
```

---

## ШАГ 2: ОБНОВИТЕ СИСТЕМУ

```bash
sudo apt update && sudo apt upgrade -y
```

---

## ШАГ 3: УСТАНОВИТЕ GIT И БАЗОВЫЕ ИНСТРУМЕНТЫ

```bash
sudo apt install -y git curl wget nano htop ufw
```

---

## ШАГ 4: НАСТРОЙТЕ FIREWALL

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## ШАГ 5: КЛОНИРУЙТЕ ПРОЕКТ

### Вариант А: Через HTTPS (проще, но может потребовать токен)

```bash
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/IPGINV/ipg-invest.git
cd ipg-invest
```

**Если Git попросит аутентификацию:**
- Username: `IPGINV`
- Password: **Personal Access Token** (не обычный пароль)
- Создать токен: https://github.com/settings/tokens

### Вариант Б: Через SSH (рекомендуется)

```bash
# Сгенерируйте SSH ключ
ssh-keygen -t ed25519 -C "ваш-email@example.com"
# Нажмите Enter 3 раза

# Скопируйте публичный ключ
cat ~/.ssh/id_ed25519.pub
# Скопируйте вывод

# Добавьте ключ в GitHub:
# https://github.com/settings/keys
# "New SSH key" → вставьте ключ

# Клонируйте проект
mkdir -p ~/projects
cd ~/projects
git clone git@github.com:IPGINV/ipg-invest.git
cd ipg-invest
```

---

## ШАГ 6: СОЗДАЙТЕ `.env` ФАЙЛ

```bash
cd ~/projects/ipg-invest
nano .env
```

**Вставьте следующее содержимое:**

```env
# БАЗА ДАННЫХ POSTGRESQL
PGUSER=ipg_user
PGPASSWORD=СМЕНИТЕ_ЭТОТ_ПАРОЛЬ_НА_БЕЗОПАСНЫЙ
PGDATABASE=ipg_production

# БЕЗОПАСНОСТЬ (JWT) - ОБЯЗАТЕЛЬНО СМЕНИТЕ!
JWT_SECRET=СГЕНЕРИРУЙТЕ_СЛУЧАЙНУЮ_СТРОКУ_32_СИМВОЛА
REFRESH_TOKEN_SECRET=СГЕНЕРИРУЙТЕ_ДРУГУЮ_СЛУЧАЙНУЮ_СТРОКУ_32_СИМВОЛА

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

### 🔐 СГЕНЕРИРУЙТЕ БЕЗОПАСНЫЕ СЕКРЕТЫ

Установите Node.js для генерации секретов:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Сгенерируйте 2 секрета
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Скопируйте эти строки и замените в `.env`:
- Первую → `JWT_SECRET`
- Вторую → `REFRESH_TOKEN_SECRET`

```bash
nano .env
# Замените секреты и пароль БД, сохраните
```

---

## ШАГ 7: УСТАНОВИТЕ DOCKER

```bash
# Удалите старые версии
sudo apt remove docker docker-engine docker.io containerd runc

# Установите зависимости
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Добавьте GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавьте репозиторий Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установите Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker

# Включите автозапуск
sudo systemctl enable docker
sudo systemctl start docker

# Проверьте
docker --version
docker compose version
```

---

## ШАГ 8: НАСТРОЙТЕ DNS

Зайдите в панель управления DNS вашего домена и добавьте A-записи:

| Тип | Имя              | Значение           |
|-----|------------------|--------------------|
| A   | @                | IP_ВАШЕГО_СЕРВЕРА  |
| A   | www              | IP_ВАШЕГО_СЕРВЕРА  |
| A   | dashboard        | IP_ВАШЕГО_СЕРВЕРА  |
| A   | api              | IP_ВАШЕГО_СЕРВЕРА  |
| A   | info             | IP_ВАШЕГО_СЕРВЕРА  |
| A   | wallet           | IP_ВАШЕГО_СЕРВЕРА  |
| A   | admin            | IP_ВАШЕГО_СЕРВЕРА  |

**Подождите 5-10 минут** для распространения DNS.

**Проверьте DNS:**

```bash
sudo apt install dnsutils -y
dig ipg-invest.ae +short
dig dashboard.ipg-invest.ae +short
dig api.ipg-invest.ae +short
# Все должны вернуть IP вашего сервера
```

---

## ШАГ 9: УСТАНОВИТЕ NGINX

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## ШАГ 10: ПОЛУЧИТЕ SSL СЕРТИФИКАТЫ

### Создайте временную конфигурацию для Certbot:

```bash
sudo mkdir -p /var/www/certbot

sudo tee /etc/nginx/sites-available/temp-ssl.conf > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 "Server ready for SSL\n";
        add_header Content-Type text/plain;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/temp-ssl.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Установите Certbot и получите сертификаты:

```bash
sudo apt install certbot python3-certbot-nginx -y

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

---

## ШАГ 11: НАСТРОЙТЕ NGINX ДЛЯ PRODUCTION

```bash
cd ~/projects/ipg-invest

# Скопируйте конфигурацию
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp nginx/conf.d/ipg-invest.ae.conf /etc/nginx/conf.d/

# Обновите пути к SSL в конфигурации
sudo sed -i 's|/etc/nginx/ssl/[^/]*/|/etc/letsencrypt/live/ipg-invest.ae/|g' /etc/nginx/conf.d/ipg-invest.ae.conf

# Удалите временную конфигурацию
sudo rm -f /etc/nginx/sites-enabled/temp-ssl.conf

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

---

## ШАГ 12: ЗАПУСТИТЕ DOCKER КОНТЕЙНЕРЫ

```bash
cd ~/projects/ipg-invest

# Запустите все контейнеры КРОМЕ nginx (используем nginx на хосте)
docker compose up -d postgres redis api dashboard lending info wallet admin

# Проверьте статус
docker compose ps

# Проверьте логи
docker compose logs --tail=50
```

**Все контейнеры должны быть в статусе "Up".**

---

## ШАГ 13: ПРОВЕРЬТЕ РАБОТУ

### Откройте в браузере:

1. ✅ **Landing:** https://ipg-invest.ae
2. ✅ **Dashboard:** https://dashboard.ipg-invest.ae
3. ✅ **Info:** https://info.ipg-invest.ae
4. ✅ **Wallet:** https://wallet.ipg-invest.ae
5. ✅ **Admin:** https://admin.ipg-invest.ae
6. ✅ **API Health:** https://api.ipg-invest.ae/health

### Проверьте в терминале:

```bash
# API Health Check
curl https://api.ipg-invest.ae/health

# Проверьте логи контейнеров
docker compose logs -f api
docker compose logs postgres

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🎉 ПОЗДРАВЛЯЕМ! ПРОЕКТ ЗАПУЩЕН!

### 📊 Полезные команды

```bash
# Перезапуск контейнеров
docker compose restart

# Просмотр логов
docker compose logs -f

# Остановка
docker compose stop

# Статус
docker compose ps

# Использование ресурсов
docker stats

# Перезапуск Nginx
sudo systemctl restart nginx

# Обновление проекта из Git
cd ~/projects/ipg-invest
git pull
docker compose down
docker compose build --no-cache
docker compose up -d postgres redis api dashboard lending info wallet admin
```

---

## 🚨 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### 502 Bad Gateway

```bash
# Проверьте контейнеры
docker compose ps

# Проверьте логи
docker compose logs api
sudo tail -f /var/log/nginx/error.log
```

### База данных не подключается

```bash
# Проверьте PostgreSQL
docker compose logs postgres

# Проверьте подключение
docker compose exec postgres psql -U ipg_user -d ipg_production -c "SELECT version();"
```

### SSL не работает

```bash
# Проверьте сертификаты
sudo certbot certificates

# Обновите
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

---

## 📞 ВСЕ ГОТОВО!

Ваш проект доступен по адресу: **https://ipg-invest.ae**

Если возникли вопросы - проверьте логи и обратитесь за помощью! 🚀
