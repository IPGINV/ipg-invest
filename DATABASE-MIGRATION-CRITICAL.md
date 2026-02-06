# 🔴 КРИТИЧНО: МИГРАЦИЯ БАЗЫ ДАННЫХ PostgreSQL

## ⚠️ ОСОБЫЕ ДЕЙСТВИЯ ПРИ ПЕРЕНОСЕ БД

---

## 🚨 5 КРИТИЧЕСКИХ МОМЕНТОВ

### **1. КОДИРОВКА БАЗЫ ДАННЫХ**

**Проблема:** Неправильная кодировка → поврежденные кириллические символы

**Windows (перед экспортом):**
```bash
psql -U postgres -d ipg -c "SHOW server_encoding;"
# Проверьте: должно быть UTF8
```

**Ubuntu (при создании БД):**
```bash
sudo -u postgres createdb ipg_production \
    --encoding=UTF8 \
    --locale=en_US.UTF-8 \
    --lc-collate=en_US.UTF-8 \
    --lc-ctype=en_US.UTF-8 \
    --template=template0
```

**❌ ОШИБКА:** Создание без указания encoding
```bash
# НЕПРАВИЛЬНО:
createdb ipg_production

# ПРАВИЛЬНО:
createdb ipg_production --encoding=UTF8 --locale=en_US.UTF-8 --template=template0
```

---

### **2. СХЕМА "ipg" (НЕ "public")**

**Проблема:** Проект использует отдельную схему `ipg`, а не стандартную `public`

**Все таблицы находятся в:**
```
ipg.users
ipg.balances
ipg.contracts
ipg.transactions
ipg.sessions
ipg.token_price_history
ipg.admin_logs
```

**НА UBUNTU ОБЯЗАТЕЛЬНО:**

```sql
-- 1. Создать схему
CREATE SCHEMA IF NOT EXISTS ipg;

-- 2. Установить search_path
SET search_path TO ipg;

-- 3. Или в .env добавить:
# В Node.js коде (db.js) есть:
pool.on('connect', (client) => {
  client.query('SET search_path TO ipg');
});
```

**❌ ОШИБКА:** Забыть создать схему
```bash
# Симптом: "relation users does not exist"
# Решение: CREATE SCHEMA IF NOT EXISTS ipg;
```

---

### **3. ТРИГГЕРЫ И ФУНКЦИИ**

**Проблема:** Триггеры могут не импортироваться из-за разных версий PostgreSQL

**Проверка после импорта:**
```sql
-- Подключитесь к БД
psql -h localhost -U ipg_user -d ipg_production

SET search_path TO ipg;

-- Список триггеров
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname LIKE '%ipg%' OR tgrelid::regclass::text LIKE 'ipg.%';

-- Должны быть (минимум 5 триггеров):
-- users_set_updated_at ON users
-- balances_set_updated_at ON balances
-- transactions_set_updated_at ON transactions
-- contracts_set_updated_at ON contracts
-- users_create_default_balances ON users

-- Список функций
\df ipg.*

-- Должны быть:
-- set_updated_at()
-- create_default_balances()
```

**Если триггеров нет:**
```bash
# Примените schema.sql вручную
cd /var/www/ipg
psql -h localhost -U ipg_user -d ipg_production -f schema.sql
```

---

### **4. ПРАВА ДОСТУПА**

**Проблема:** Недостаточные права → API не может читать/писать в БД

**ОБЯЗАТЕЛЬНЫЕ ПРАВА:**

```sql
-- После создания БД и схемы
sudo -u postgres psql -d ipg_production

-- Права на схему
GRANT ALL PRIVILEGES ON SCHEMA ipg TO ipg_user;

-- Права на существующие таблицы
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA ipg TO ipg_user;

-- Права на БУДУЩИЕ объекты (КРИТИЧНО!)
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON TABLES TO ipg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON SEQUENCES TO ipg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON FUNCTIONS TO ipg_user;

\q
```

**Проверка прав:**
```sql
-- Проверьте, что можете вставить данные
INSERT INTO ipg.users (
  investor_id, email, full_name, status, registration_method
) VALUES (
  'TEST-001', 'test@test.com', 'Test User', 'pending', 'email'
);

-- Если успешно → права ОК
-- Если ошибка → права недостаточны

-- Удалите тестовую запись
DELETE FROM ipg.users WHERE investor_id = 'TEST-001';
```

---

### **5. ВЕРСИИ PostgreSQL**

**Проблема:** Несовместимость версий Windows → Ubuntu

**Проверка версий:**

**Windows:**
```bash
psql --version
# PostgreSQL X.Y.Z
```

**Ubuntu:**
```bash
psql --version
# PostgreSQL X.Y.Z
```

**Правило:** Ubuntu версия должна быть **≥** Windows версии

**Если версии различаются:**

```bash
# При экспорте на Windows используйте флаги:
pg_dump \
    -h localhost \
    -U postgres \
    -d ipg \
    --schema=ipg \
    --no-owner \
    --no-acl \
    --format=plain \
    -f ipg_export.sql

# --no-owner: не включать владельцев объектов
# --no-acl: не включать права доступа
# --format=plain: текстовый формат (совместимый)
```

---

## 🔧 ПОШАГОВАЯ ИНСТРУКЦИЯ МИГРАЦИИ БД

### **ЭТАП 1: ЭКСПОРТ НА WINDOWS (ПЕРЕД ПЕРЕНОСОМ)**

```bash
# Откройте Git Bash или PowerShell в папке проекта
cd "server"

# Запустите экспорт (используйте Git Bash)
bash scripts/export-database.sh

# Результат в backups/:
# ipg_backup_20260202_123456.sql.gz
```

**Проверьте экспорт:**
```bash
# Размер файла
ls -lh backups/*.gz
# Должен быть > 1 KB (минимум несколько KB)

# Содержимое (первые 100 строк)
gunzip -c backups/ipg_backup_*.sql.gz | head -100

# Должны увидеть:
# CREATE SCHEMA IF NOT EXISTS ipg;
# SET search_path TO ipg;
# CREATE TYPE user_status_enum ...
# CREATE TABLE users ...
```

---

### **ЭТАП 2: ПЕРЕНОС НА UBUNTU**

```bash
# С Windows машины:
scp server/backups/ipg_backup_20260202_123456.sql.gz root@your-server-ip:/tmp/

# Также перенесите schema.sql
scp schema.sql root@your-server-ip:/tmp/
```

---

### **ЭТАП 3: НАСТРОЙКА БД НА UBUNTU**

#### **Способ A: Автоматический (рекомендуется)**

```bash
# На Ubuntu сервере:
sudo bash /var/www/ipg/server/scripts/setup-ubuntu-database.sh

# Скрипт спросит:
# - Database user name: ipg_user
# - Password: [введите надёжный пароль]

# Скрипт автоматически:
# ✅ Установит PostgreSQL
# ✅ Создаст пользователя
# ✅ Создаст базу данных
# ✅ Настроит права
# ✅ Проверит соединение
```

---

#### **Способ B: Ручной (если скрипт не работает)**

```bash
# 1. Подключитесь к PostgreSQL
sudo -u postgres psql

# 2. Создайте пользователя
CREATE USER ipg_user WITH PASSWORD 'ваш_надёжный_пароль_здесь';

# 3. Создайте базу (С ПРАВИЛЬНОЙ КОДИРОВКОЙ!)
CREATE DATABASE ipg_production 
    OWNER ipg_user
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE template0;

# 4. Подключитесь к базе
\c ipg_production

# 5. Создайте схему
CREATE SCHEMA IF NOT EXISTS ipg;

# 6. Настройте права (КРИТИЧНО!)
GRANT ALL PRIVILEGES ON SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON DATABASE ipg_production TO ipg_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ipg TO ipg_user;

-- Для будущих объектов (ОЧЕНЬ ВАЖНО!)
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON TABLES TO ipg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg 
  GRANT ALL PRIVILEGES ON SEQUENCES TO ipg_user;

# 7. Выход
\q
```

---

### **ЭТАП 4: НАСТРОЙКА pg_hba.conf**

```bash
# Найдите файл
sudo find /etc/postgresql -name pg_hba.conf

# Обычно:
# /etc/postgresql/16/main/pg_hba.conf

# Откройте
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Добавьте ПЕРЕД строкой "local all all peer":
# TYPE  DATABASE          USER      ADDRESS       METHOD
host    ipg_production    ipg_user  127.0.0.1/32  md5
host    ipg_production    ipg_user  ::1/128       md5

# Сохраните: Ctrl+X, Y, Enter

# Перезапустите PostgreSQL
sudo systemctl restart postgresql
```

---

### **ЭТАП 5: ТЕСТ СОЕДИНЕНИЯ**

```bash
# Попробуйте подключиться
psql -h localhost -U ipg_user -d ipg_production

# Введите пароль
# Если подключилось → ОК!

# Внутри проверьте:
\l                          # Список баз
\c ipg_production          # Подключение
\dn                        # Список схем (должна быть ipg)
SET search_path TO ipg;
\dt                        # Список таблиц (пока пусто)
\q                         # Выход
```

---

### **ЭТАП 6: ИМПОРТ ДАННЫХ**

#### **Метод 1: Через apply-schema.js (чистая установка)**

```bash
cd /var/www/ipg/server

# Настройте .env
cp .env.production .env
nano .env

# Убедитесь что указаны:
PGHOST=localhost
PGPORT=5432
PGUSER=ipg_user
PGPASSWORD=ваш_пароль
PGDATABASE=ipg_production

# Установите зависимости
npm install --production

# Примените схему
node scripts/apply-schema.js

# Вывод:
# Applying schema: 30 statements
# Schema applied
```

---

#### **Метод 2: Импорт из backup (с данными)**

```bash
# Используйте скрипт
cd /var/www/ipg/server
bash scripts/import-database.sh /tmp/ipg_backup_20260202_123456.sql.gz

# Скрипт:
# 1. Проверит существование БД
# 2. Распакует backup
# 3. Импортирует данные
# 4. Проверит количество таблиц
# 5. Покажет статистику
```

---

#### **Метод 3: Ручной импорт**

```bash
# Распакуйте
gunzip /tmp/ipg_backup_20260202_123456.sql.gz

# Импортируйте
psql -h localhost -U ipg_user -d ipg_production -f /tmp/ipg_backup_20260202_123456.sql

# Если ошибки с правами:
psql -h localhost -U ipg_user -d ipg_production \
    -c "SET search_path TO ipg;" \
    -f /tmp/ipg_backup_20260202_123456.sql
```

---

### **ЭТАП 7: ПРОВЕРКА ИМПОРТА**

```sql
psql -h localhost -U ipg_user -d ipg_production

SET search_path TO ipg;

-- 1. Проверка таблиц
\dt

-- Должно быть 7 таблиц:
--  admin_logs
--  balances
--  contracts
--  sessions
--  token_price_history
--  transactions
--  users

-- 2. Проверка количества записей
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'balances', COUNT(*) FROM balances
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;

-- 3. Проверка триггеров
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgrelid::regclass::text LIKE 'ipg.%'
ORDER BY tgname;

-- Должно быть минимум 5 триггеров

-- 4. Проверка типов данных (enums)
SELECT n.nspname as schema, t.typname as enum_type
FROM pg_type t 
JOIN pg_namespace n ON n.oid = t.typnamespace 
WHERE t.typtype = 'e' AND n.nspname = 'ipg';

-- Должно быть 5 enums:
-- contract_status_enum
-- currency_enum
-- log_action_enum
-- transaction_status_enum
-- transaction_type_enum
-- user_status_enum

-- 5. Проверка индексов
\di ipg.*

-- Должно быть множество индексов на foreign keys

\q
```

---

## 🔥 ЧАСТЫЕ ОШИБКИ И ИХ РЕШЕНИЯ

### **Ошибка 1: "permission denied for schema ipg"**

**Причина:** Недостаточно прав

**Решение:**
```sql
sudo -u postgres psql -d ipg_production

GRANT ALL PRIVILEGES ON SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ipg TO ipg_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ipg TO ipg_user;

\q
```

---

### **Ошибка 2: "schema ipg does not exist"**

**Причина:** Забыли создать схему

**Решение:**
```sql
psql -h localhost -U ipg_user -d ipg_production

CREATE SCHEMA IF NOT EXISTS ipg;
GRANT ALL PRIVILEGES ON SCHEMA ipg TO ipg_user;

\q
```

---

### **Ошибка 3: "relation users does not exist"**

**Причина:** search_path не установлен

**Решение:**
```sql
-- В каждой сессии:
SET search_path TO ipg;

-- Или установите навсегда для пользователя:
ALTER USER ipg_user SET search_path TO ipg;

-- Или в коде (уже есть в db.js):
pool.on('connect', (client) => {
  client.query('SET search_path TO ipg');
});
```

---

### **Ошибка 4: Кириллица превратилась в "???"**

**Причина:** Неправильная кодировка при создании БД

**Решение:**
```bash
# 1. Удалите БД
sudo -u postgres psql
DROP DATABASE ipg_production;

# 2. Создайте заново с UTF-8
CREATE DATABASE ipg_production 
    OWNER ipg_user
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE template0;

\q

# 3. Импортируйте заново
bash scripts/import-database.sh /tmp/backup.sql.gz
```

---

### **Ошибка 5: "role postgres does not exist"**

**Причина:** В backup файле есть ссылки на роль postgres

**Решение:**
```bash
# Импортируйте БЕЗ owner information
gunzip -c backup.sql.gz | \
    sed 's/OWNER TO postgres/OWNER TO ipg_user/g' | \
    psql -h localhost -U ipg_user -d ipg_production
```

---

### **Ошибка 6: Триггеры не работают**

**Симптом:** `updated_at` не обновляется автоматически

**Решение:**
```bash
# Примените schema.sql вручную
psql -h localhost -U ipg_user -d ipg_production -f schema.sql

# Проверьте
psql -h localhost -U ipg_user -d ipg_production
SET search_path TO ipg;
\dft  # Список триггеров

# Если видите триггеры → они работают
```

---

## ✅ ЧЕКЛИСТ УСПЕШНОЙ МИГРАЦИИ

Пройдите по этому чеклисту **ПОСЛЕДОВАТЕЛЬНО**:

### **Перед экспортом (Windows):**
- [ ] PostgreSQL запущен
- [ ] Кодировка БД: UTF-8
- [ ] Backup скрипт работает
- [ ] Размер backup > 1 KB

### **На Ubuntu сервере:**
- [ ] PostgreSQL 16 установлен
- [ ] Служба запущена: `systemctl status postgresql`
- [ ] Пользователь `ipg_user` создан
- [ ] База `ipg_production` создана с UTF-8
- [ ] Схема `ipg` существует
- [ ] pg_hba.conf настроен
- [ ] PostgreSQL перезапущен
- [ ] Соединение тестом прошло: `psql -h localhost -U ipg_user -d ipg_production`

### **После импорта:**
- [ ] 7 таблиц создано: `\dt`
- [ ] Минимум 5 триггеров: `\dft`
- [ ] 6 enum типов: `SELECT * FROM pg_type WHERE typtype='e'`
- [ ] Данные импортированы: `SELECT COUNT(*) FROM users;`
- [ ] Индексы созданы: `\di ipg.*`
- [ ] Тест INSERT работает
- [ ] Тест UPDATE работает
- [ ] Триггер updated_at работает

### **API подключение:**
- [ ] .env файл настроен с правильными credentials
- [ ] API может подключиться: проверьте логи
- [ ] Endpoint `/users/:id` работает
- [ ] Регистрация создаёт запись в БД
- [ ] Login работает

---

## 🎯 БЫСТРАЯ КОМАНДА ДЛЯ ПРОВЕРКИ

Скопируйте и вставьте в Ubuntu terminal:

```bash
# Комплексная проверка БД
psql -h localhost -U ipg_user -d ipg_production << 'EOF'
SET search_path TO ipg;

SELECT '=== TABLES ===' as check;
\dt

SELECT '=== TRIGGERS ===' as check;
SELECT tgname FROM pg_trigger WHERE tgrelid::regclass::text LIKE 'ipg.%';

SELECT '=== RECORD COUNTS ===' as check;
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL SELECT 'balances', COUNT(*) FROM balances
UNION ALL SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions;

SELECT '=== ENUMS ===' as check;
SELECT typname FROM pg_type WHERE typtype='e' AND typnamespace = 'ipg'::regnamespace;

EOF

# Если всё вывелось без ошибок → БД готова!
```

---

## 🚨 КРИТИЧЕСКАЯ ИНФОРМАЦИЯ

### **ЧТО МОЖЕТ ПОЙТИ НЕ ТАК:**

1. **Кодировка** → Кириллица поломается
2. **Права доступа** → API не сможет писать в БД  
3. **Схема ipg** → "relation does not exist"
4. **Триггеры** → updated_at не обновляется
5. **pg_hba.conf** → "authentication failed"

### **КАК ИЗБЕЖАТЬ:**

1. ✅ Всегда указывайте `--encoding=UTF8` при создании БД
2. ✅ Всегда используйте `ALTER DEFAULT PRIVILEGES`
3. ✅ Всегда создавайте схему `ipg` ПЕРЕД импортом
4. ✅ Всегда применяйте `schema.sql` после импорта
5. ✅ Всегда настраивайте `pg_hba.conf` перед импортом

---

## 📞 ЭКСТРЕННАЯ ПОМОЩЬ

Если миграция не работает:

```bash
# 1. Соберите информацию
psql --version
psql -h localhost -U ipg_user -d ipg_production -c "SHOW server_encoding;"
psql -h localhost -U ipg_user -d ipg_production -c "\dn"
psql -h localhost -U ipg_user -d ipg_production -c "SET search_path TO ipg; \dt"

# 2. Проверьте логи PostgreSQL
sudo tail -100 /var/log/postgresql/postgresql-16-main.log

# 3. Проверьте права
psql -h localhost -U ipg_user -d ipg_production \
    -c "SELECT has_schema_privilege('ipg_user', 'ipg', 'USAGE');"
# Должно вернуть: t (true)

# 4. Пересоздайте БД с нуля
sudo -u postgres psql
DROP DATABASE ipg_production;
# Повторите ЭТАП 3
```

---

## ✅ ЗАКЛЮЧЕНИЕ

**База данных - самая критичная часть деплоя.**

**Следуйте инструкциям последовательно, и проблем не будет!**

**Основные файлы для миграции БД:**
1. `server/scripts/export-database.sh` - экспорт на Windows
2. `server/scripts/import-database.sh` - импорт на Ubuntu
3. `server/scripts/setup-ubuntu-database.sh` - автонастройка БД
4. `schema.sql` - структура БД
5. `backups/*.sql.gz` - ваши данные

**Поддержка:** См. `DEPLOY-UBUNTU-GUIDE.md` для полной инструкции

---

**Дата:** 2026-02-02  
**Важность:** 🔴 КРИТИЧНО  
**Время на миграцию:** 30-60 минут (при правильном подходе)
