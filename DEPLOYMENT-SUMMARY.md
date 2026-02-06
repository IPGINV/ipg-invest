# 📦 DEPLOYMENT: КРАТКАЯ СВОДКА

## ✅ ПРОЕКТ ПОЛНОСТЬЮ ПОДГОТОВЛЕН К ПЕРЕНОСУ НА UBUNTU SERVER

---

## 📁 СОЗДАННЫЕ ФАЙЛЫ ДЛЯ DEPLOYMENT

### **🗄️ База данных (КРИТИЧНО!):**
1. **`server/scripts/export-database.sh`** - Экспорт БД с Windows
2. **`server/scripts/import-database.sh`** - Импорт БД на Ubuntu
3. **`server/scripts/setup-ubuntu-database.sh`** - Автонастройка PostgreSQL на Ubuntu
4. **`DATABASE-MIGRATION-CRITICAL.md`** - Критичные особенности миграции БД

### **⚙️ Конфигурации:**
5. **`server/.env.production`** - Production конфиг API сервера
6. **`.env.production.example`** - Примеры для всех приложений
7. **`ecosystem.config.js`** - PM2 конфигурация (2 процесса)

### **🐳 Docker:**
8. **`docker-compose.yml`** - Полная Docker конфигурация (8 сервисов)
9. **`server/Dockerfile`** - API Server
10. **`Dashboard/Dockerfile`** - Dashboard app
11. **`Invest-Lending/Dockerfile`** - Lending app
12. **`Info/Dockerfile`** - Info app
13. **`Wallet/Dockerfile`** - Wallet app

### **🌐 Nginx:**
14. **`nginx/nginx.conf`** - Главная конфигурация Nginx
15. **`nginx/conf.d/ipg-invest.ae.conf`** - Reverse proxy для всех доменов
16. **`Dashboard/nginx.conf`** - Nginx для Dashboard контейнера
17. **`Invest-Lending/nginx.conf`** - Nginx для Lending контейнера
18. **`Info/nginx.conf`** - Nginx для Info контейнера
19. **`Wallet/nginx.conf`** - Nginx для Wallet контейнера

### **📖 Документация:**
20. **`DEPLOY-UBUNTU-GUIDE.md`** (50 KB) - Полное руководство по деплою
21. **`DATABASE-MIGRATION-CRITICAL.md`** (35 KB) - Критичные моменты БД
22. **`DEPLOYMENT-SUMMARY.md`** (этот файл) - Краткая сводка

---

## ⚠️ ОСОБЫЕ ДЕЙСТВИЯ ДЛЯ БАЗЫ ДАННЫХ

### **🔴 5 КРИТИЧЕСКИХ МОМЕНТОВ:**

#### **1. КОДИРОВКА (САМОЕ ВАЖНОЕ!)**
```bash
# При создании БД на Ubuntu ОБЯЗАТЕЛЬНО:
createdb ipg_production --encoding=UTF8 --locale=en_US.UTF-8 --template=template0

# Иначе → кириллица превратится в "???"
```

#### **2. СХЕМА "ipg" (НЕ "public")**
```sql
-- Все таблицы в отдельной схеме:
CREATE SCHEMA IF NOT EXISTS ipg;
SET search_path TO ipg;

-- Проверка:
\dt  -- должно показать 7 таблиц
```

#### **3. ПРАВА ДОСТУПА**
```sql
-- Обязательно для БУДУЩИХ объектов:
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg GRANT ALL PRIVILEGES ON TABLES TO ipg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg GRANT ALL PRIVILEGES ON SEQUENCES TO ipg_user;
```

#### **4. ТРИГГЕРЫ**
```bash
# После импорта проверьте:
\dft ipg.*

# Должно быть минимум 5 триггеров:
# - users_set_updated_at
# - balances_set_updated_at
# - transactions_set_updated_at
# - contracts_set_updated_at
# - users_create_default_balances
```

#### **5. pg_hba.conf**
```bash
# /etc/postgresql/16/main/pg_hba.conf
# Добавьте:
host    ipg_production    ipg_user    127.0.0.1/32    md5

# Перезапустите:
sudo systemctl restart postgresql
```

---

## 🚀 БЫСТРЫЙ СТАРТ (2 ВАРИАНТА)

### **ВАРИАНТ A: Docker (проще, рекомендуется)**

**На Windows:**
```bash
cd server
bash scripts/export-database.sh
# Результат: backups/ipg_backup_*.sql.gz
```

**На Ubuntu:**
```bash
# 1. Установить Docker
curl -fsSL https://get.docker.com | sh
sudo apt install -y docker-compose-plugin

# 2. Скопировать проект
git clone <repo> /var/www/ipg
cd /var/www/ipg

# 3. Настроить .env
cp .env.production.example .env
nano .env  # ИЗМЕНИТЬ пароли и секреты!

# 4. Запустить
docker compose up -d

# 5. Применить schema
docker compose exec api node scripts/apply-schema.js

# 6. Проверить
docker compose ps  # Все должны быть Up
curl http://localhost:3001/health  # {"status":"ok"}
```

**Время: ~20 минут**

---

### **ВАРИАНТ B: PM2 (больше контроля)**

**На Windows:**
```bash
# То же самое - экспорт БД
cd server
bash scripts/export-database.sh
```

**На Ubuntu:**
```bash
# 1. Установить всё ПО
sudo apt install -y nodejs postgresql-16 redis nginx
sudo npm install -g pm2

# 2. Настроить PostgreSQL
sudo bash scripts/setup-ubuntu-database.sh
# Введите: user=ipg_user, password=<strong_password>

# 3. Импортировать БД
bash scripts/import-database.sh /tmp/backup.sql.gz

# 4. Запустить API
cd /var/www/ipg/server
npm install --production
pm2 start ecosystem.config.js

# 5. Build и копировать frontend
cd /var/www/ipg/Dashboard && npm run build
sudo cp -r dist/* /var/www/html/dashboard/
# Повторить для остальных apps

# 6. Настроить Nginx
sudo cp nginx/conf.d/*.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/ipg-invest.ae /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 7. SSL сертификаты
sudo certbot --nginx -d ipg-invest.ae -d api.ipg-invest.ae -d dashboard.ipg-invest.ae
```

**Время: ~45-60 минут**

---

## 🔍 ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

```bash
# 1. БД работает
psql -h localhost -U ipg_user -d ipg_production -c "SELECT COUNT(*) FROM ipg.users;"

# 2. API работает
curl http://localhost:3001/health

# 3. Все сервисы запущены
pm2 status  # или docker compose ps

# 4. Nginx работает
curl http://localhost

# 5. HTTPS работает (после SSL)
curl https://ipg-invest.ae
curl https://api.ipg-invest.ae/health
```

---

## 📊 АРХИТЕКТУРА PRODUCTION

```
┌─────────────────────────────────────────┐
│         Internet (HTTPS)                │
└─────────────────┬───────────────────────┘
                  │
         ┌────────▼────────┐
         │  Nginx (Port 80/443)       │
         │  - SSL Termination         │
         │  - Reverse Proxy           │
         │  - Load Balancing          │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌───▼────┐
│Dashboard│  │API Server│  │Lending │
│(Static) │  │(Node.js) │  │(Static)│
│Port 3000│  │Port 3001 │  │Port5182│
└─────────┘  └────┬─────┘  └────────┘
                  │
         ┌────────┼────────┐
         │                 │
    ┌────▼──────┐    ┌────▼────┐
    │PostgreSQL │    │  Redis  │
    │Port 5432  │    │Port 6379│
    │Schema:ipg │    │         │
    └───────────┘    └─────────┘
```

---

## 📋 ДОМЕНЫ И ПОРТЫ

### **Production URLs:**
- **https://ipg-invest.ae** → Invest-Lending (port 5182)
- **https://dashboard.ipg-invest.ae** → Dashboard (port 3000)
- **https://api.ipg-invest.ae** → API Server (port 3001)
- **https://info.ipg-invest.ae** → Info App (port 3002)
- **https://wallet.ipg-invest.ae** → Wallet App (port 3003)

### **Internal Services:**
- **localhost:5432** → PostgreSQL
- **localhost:6379** → Redis

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Прочитайте:** `DATABASE-MIGRATION-CRITICAL.md` (ОБЯЗАТЕЛЬНО!)
2. **Экспортируйте БД** с Windows: `bash server/scripts/export-database.sh`
3. **Следуйте:** `DEPLOY-UBUNTU-GUIDE.md` пошагово
4. **Проверьте:** Все чеклисты
5. **Запустите:** Docker или PM2
6. **Настройте:** SSL сертификаты
7. **Протестируйте:** Все функции

---

## ✅ ВСЁ ГОТОВО К DEPLOYMENT!

**Время деплоя:** 20-60 минут (зависит от метода)
**Сложность:** Средняя
**Критичная часть:** База данных (следуйте инструкциям!)

---

**Последнее обновление:** 2026-02-02  
**Статус:** ✅ Production Ready
