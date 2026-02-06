# ✅ PRE-DEPLOYMENT CHECKLIST для ipg-invest.ae

## 🎯 ОБНОВЛЕНИЯ ВЫПОЛНЕНЫ

### **✅ 1. FRONTEND ПРИЛОЖЕНИЯ**

#### **Dashboard (`C:\Users\HP\Desktop\Project site invest\Dashboard\`)**
- ✅ `components/Header.tsx`:
  - `openInfoApp()` → `https://info.ipg-invest.ae`
  - `openCalculator()` → `https://ipg-invest.ae`
- ✅ `App.tsx`:
  - API Base URL → `https://api.ipg-invest.ae` (для production)

#### **Invest-Lending (`C:\Users\HP\Desktop\Project site invest\Invest-Lending\`)**
- ✅ `App.tsx`:
  - `buildLoginUrl()` → `https://dashboard.ipg-invest.ae/login.html`
  - `handleOpenDashboard()` → `https://dashboard.ipg-invest.ae`
  - `openInfoView()` → `https://info.ipg-invest.ae`
  - `openCalculator()` → `https://wallet.ipg-invest.ae`
  - API Base URL → `https://api.ipg-invest.ae` (для production)

#### **Info (`C:\Users\HP\Desktop\Project site invest\Info\`)**
- ✅ `components/Header.tsx`:
  - `buildAppUrl()` → использует правильные поддомены для production
  - `openCalculator()` → `https://ipg-invest.ae`

---

### **✅ 2. BACKEND**

#### **Server (`C:\Users\HP\Desktop\Project site invest\server\`)**
- ✅ `.env` (для локальной разработки):
  - `CORS_ORIGIN` включает все production домены
- ✅ `.env.production` (для production сервера):
  - `CORS_ORIGIN=https://ipg-invest.ae,https://www.ipg-invest.ae,https://dashboard.ipg-invest.ae,https://info.ipg-invest.ae,https://wallet.ipg-invest.ae`
  - `DOMAIN=ipg-invest.ae`

---

## 🌐 СТРУКТУРА ДОМЕНОВ

| Приложение | Production URL |
|------------|----------------|
| **Landing/Invest-Lending** | `https://ipg-invest.ae` |
| **Dashboard** | `https://dashboard.ipg-invest.ae` |
| **Info App** | `https://info.ipg-invest.ae` |
| **Wallet App** | `https://wallet.ipg-invest.ae` |
| **API Server** | `https://api.ipg-invest.ae` |

---

## 📋 ЧТО НУЖНО СДЕЛАТЬ НА СЕРВЕРЕ

### **1. DNS Настройки**

Добавьте A-записи (или CNAME) для всех поддоменов:

```dns
ipg-invest.ae               A       YOUR_SERVER_IP
dashboard.ipg-invest.ae     A       YOUR_SERVER_IP
info.ipg-invest.ae          A       YOUR_SERVER_IP
wallet.ipg-invest.ae        A       YOUR_SERVER_IP
api.ipg-invest.ae           A       YOUR_SERVER_IP
www.ipg-invest.ae           A       YOUR_SERVER_IP
```

**Проверка DNS:**
```bash
nslookup ipg-invest.ae
nslookup dashboard.ipg-invest.ae
nslookup api.ipg-invest.ae
```

---

### **2. SSL Сертификаты (Let's Encrypt)**

Получите сертификаты для всех доменов:

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификатов
sudo certbot --nginx \
  -d ipg-invest.ae \
  -d www.ipg-invest.ae \
  -d dashboard.ipg-invest.ae \
  -d info.ipg-invest.ae \
  -d wallet.ipg-invest.ae \
  -d api.ipg-invest.ae

# Автопродление (уже настроено автоматически)
sudo certbot renew --dry-run
```

---

### **3. Nginx Конфигурация**

Файл уже создан: `nginx/conf.d/ipg-invest.ae.conf`

**Установка:**
```bash
sudo cp nginx/conf.d/ipg-invest.ae.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/ipg-invest.ae.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### **4. Environment Variables**

**На сервере обновите:**

```bash
cd /var/www/ipg

# Server
cd server
cp .env.production .env
nano .env  # Обновите секреты и пароли!

# Dashboard
cd ../Dashboard
nano .env.production

# Invest-Lending
cd ../Invest-Lending
nano .env.production

# Info
cd ../Info
nano .env.production

# Wallet
cd ../Wallet
nano .env.production
```

---

### **5. Build Frontend Apps**

```bash
# Dashboard
cd /var/www/ipg/Dashboard
npm run build
# dist/ → будет использован в Docker или скопирован в /var/www/html/

# Invest-Lending
cd /var/www/ipg/Invest-Lending
npm run build

# Info
cd /var/www/ipg/Info
npm run build

# Wallet
cd /var/www/ipg/Wallet
npm run build
```

---

## 🐳 DOCKER DEPLOYMENT (РЕКОМЕНДУЕТСЯ)

```bash
cd /var/www/ipg

# Обновите .env файл
cp .env.production.example .env
nano .env  # Установите все секреты!

# Build и запуск
docker compose build
docker compose up -d

# Проверка
docker compose ps
docker compose logs -f api
```

---

## 🔧 PM2 DEPLOYMENT (АЛЬТЕРНАТИВА)

```bash
cd /var/www/ipg

# Запуск API
cd server
npm install --production
pm2 start ecosystem.config.js --env production

# Копирование frontend builds
sudo cp -r Dashboard/dist/* /var/www/html/dashboard/
sudo cp -r Invest-Lending/dist/* /var/www/html/lending/
sudo cp -r Info/dist/* /var/www/html/info/
sudo cp -r Wallet/dist/* /var/www/html/wallet/

# PM2 автозапуск
pm2 save
pm2 startup
```

---

## ✅ ФИНАЛЬНАЯ ПРОВЕРКА

### **1. Проверка DNS**
```bash
nslookup ipg-invest.ae
nslookup dashboard.ipg-invest.ae
nslookup api.ipg-invest.ae
```

### **2. Проверка SSL**
```bash
curl -I https://ipg-invest.ae
curl -I https://dashboard.ipg-invest.ae
curl -I https://api.ipg-invest.ae/health
```

### **3. Проверка в браузере**
- [ ] Открыть `https://ipg-invest.ae` (Lending)
- [ ] Нажать "Начать расчет" → должна открыться страница симуляции
- [ ] Перейти в регистрацию → проверить форму
- [ ] После регистрации → должен открыться `https://dashboard.ipg-invest.ae`
- [ ] В Dashboard → Меню → Проект → должен открыться `https://info.ipg-invest.ae?view=project`
- [ ] В Dashboard → Меню → Компания → должен открыться `https://info.ipg-invest.ae?view=company`

### **4. Проверка API**
```bash
curl https://api.ipg-invest.ae/health
# Ожидаемый ответ: {"status":"ok"} или аналогичный

curl -X POST https://api.ipg-invest.ae/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","full_name":"Test User"}'
```

---

## 📊 МЕТРИКИ ПОСЛЕ ДЕПЛОЯ

Проверьте производительность:

```bash
# Скорость загрузки
curl -w "@curl-format.txt" -o /dev/null -s https://ipg-invest.ae

# Размер главной страницы
curl -I https://ipg-invest.ae | grep Content-Length

# Health checks
watch -n 5 'curl -s https://api.ipg-invest.ae/health'
```

---

## 🚨 ПРОБЛЕМЫ И РЕШЕНИЯ

### **Проблема: ERR_NAME_NOT_RESOLVED**
**Решение:** DNS еще не propagated. Подождите 5-30 минут или используйте `8.8.8.8` DNS.

### **Проблема: SSL Certificate Error**
**Решение:**
```bash
sudo certbot certificates
sudo certbot renew
sudo nginx -t && sudo systemctl reload nginx
```

### **Проблема: CORS Error**
**Решение:** Проверьте `server/.env`:
```bash
CORS_ORIGIN=https://ipg-invest.ae,https://dashboard.ipg-invest.ae,https://info.ipg-invest.ae,https://wallet.ipg-invest.ae
```

### **Проблема: 502 Bad Gateway**
**Решение:** API не запущен или упал:
```bash
# Docker
docker compose logs api
docker compose restart api

# PM2
pm2 logs ipg-api
pm2 restart ipg-api
```

---

## 📝 ИТОГОВЫЙ ЧЕКЛИСТ

### **Перед деплоем:**
- [x] Все URL обновлены на production домены
- [x] CORS настроен для всех поддоменов
- [x] .env.production файлы созданы
- [x] Nginx конфигурация готова
- [x] Docker-compose готов
- [x] Документация создана

### **На сервере:**
- [ ] DNS записи добавлены
- [ ] DNS propagation завершена (проверка: `nslookup`)
- [ ] SSL сертификаты получены (Certbot)
- [ ] Nginx настроен и перезапущен
- [ ] База данных импортирована
- [ ] Environment variables установлены
- [ ] Docker containers запущены (или PM2)
- [ ] Health checks проходят

### **Тестирование:**
- [ ] Landing page загружается (`https://ipg-invest.ae`)
- [ ] Dashboard доступен (`https://dashboard.ipg-invest.ae`)
- [ ] API отвечает (`https://api.ipg-invest.ae/health`)
- [ ] Регистрация работает
- [ ] Навигация между приложениями работает
- [ ] SSL сертификаты валидны (зеленый замок в браузере)

---

## ✅ ПРОЕКТ ГОТОВ К DEPLOYMENT!

**Все необходимые правки внесены.**

**Следующий шаг:** Следуйте инструкциям в `DEPLOY-UBUNTU-GUIDE.md`

---

**Дата:** 2026-02-02  
**Домен:** ipg-invest.ae  
**Статус:** ✅ Код обновлен, готов к deployment
