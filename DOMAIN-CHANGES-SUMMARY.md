# 📝 СВОДКА ИЗМЕНЕНИЙ ДЛЯ ДОМЕНА ipg-invest.ae

## ✅ ВСЕ ИЗМЕНЕНИЯ ВНЕСЕНЫ

---

## 📂 ИЗМЕНЕННЫЕ ФАЙЛЫ

### **1. Frontend Applications**

#### **Dashboard/components/Header.tsx**
**Изменено:**
```typescript
// БЫЛО:
const base = isLocal ? 'http://localhost:3002' : 'https://ipg-invest.ae/info';

// СТАЛО:
const base = isLocal ? 'http://localhost:3002' : 'https://info.ipg-invest.ae';
```

```typescript
// БЫЛО:
const base = isLocal ? 'http://localhost:5178' : 'https://ipg-invest.ae/calculator';

// СТАЛО:
const base = isLocal ? 'http://localhost:5182' : 'https://ipg-invest.ae';
```

---

#### **Dashboard/App.tsx**
**Изменено:**
```typescript
// БЫЛО:
const base = apiBase || (window as any).__IPG_API_BASE || 'http://localhost:3001';

// СТАЛО:
const base = apiBase || (window as any).__IPG_API_BASE || 
  (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.ipg-invest.ae');
```

---

#### **Invest-Lending/App.tsx**
**Изменено 4 функции:**

1. **buildLoginUrl()**
```typescript
// БЫЛО:
return isLocal ? 'http://localhost:3000/login.html' : 'https://ipg-invest.ae/login';

// СТАЛО:
return isLocal ? 'http://localhost:3000/login.html' : 'https://dashboard.ipg-invest.ae/login.html';
```

2. **handleOpenDashboard()**
```typescript
// БЫЛО:
const base = isLocal ? 'http://localhost:3000' : 'https://ipg-invest.ae';

// СТАЛО:
const base = isLocal ? 'http://localhost:3000' : 'https://dashboard.ipg-invest.ae';
```

3. **openInfoView()**
```typescript
// БЫЛО:
const base = isLocal ? 'http://localhost:3002' : 'https://ipg-invest.ae/info';

// СТАЛО:
const base = isLocal ? 'http://localhost:3002' : 'https://info.ipg-invest.ae';
```

4. **openCalculator()**
```typescript
// БЫЛО:
const base = isLocal ? 'http://localhost:3003' : 'https://ipg-invest.ae/wallet';

// СТАЛО:
const base = isLocal ? 'http://localhost:3003' : 'https://wallet.ipg-invest.ae';
```

5. **API Base URL (в форме регистрации)**
```typescript
// БЫЛО:
const base = (window as any).__IPG_API_BASE || 'http://localhost:3001';

// СТАЛО:
const base = (window as any).__IPG_API_BASE || 
  (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.ipg-invest.ae');
```

---

#### **Info/components/Header.tsx**
**Изменено 2 функции:**

1. **buildAppUrl()**
```typescript
// БЫЛО: Использовал пути вида /dashboard, /wallet
const base = 'https://ipg-invest.ae';
const paths: Record<typeof app, string> = {
  dashboard: '/dashboard',
  wallet: '/wallet',
  invest: '/',
  info: '/info'
};
return `${base}${paths[app]}`;

// СТАЛО: Использует поддомены
const subdomains: Record<typeof app, string> = {
  dashboard: 'dashboard.ipg-invest.ae',
  wallet: 'wallet.ipg-invest.ae',
  invest: 'ipg-invest.ae',
  info: 'info.ipg-invest.ae'
};
return `https://${subdomains[app]}`;
```

2. **openCalculator()**
```typescript
// БЫЛО:
const base = isLocal ? 'http://localhost:5178' : 'https://ipg-invest.ae/calculator';

// СТАЛО:
const base = isLocal ? 'http://localhost:5182' : 'https://ipg-invest.ae';
```

---

### **2. Backend Configuration**

#### **server/.env**
**Изменено:**
```bash
# БЫЛО:
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3003,http://localhost:5182,http://localhost:8080

# СТАЛО (добавлены production домены):
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3003,http://localhost:5182,http://localhost:8080,https://ipg-invest.ae,https://dashboard.ipg-invest.ae,https://info.ipg-invest.ae,https://wallet.ipg-invest.ae
```

---

#### **server/.env.production**
**Изменено:**
```bash
# БЫЛО:
CORS_ORIGIN=https://ipg-invest.ae,https://www.ipg-invest.ae,https://dashboard.ipg-invest.ae

# СТАЛО:
CORS_ORIGIN=https://ipg-invest.ae,https://www.ipg-invest.ae,https://dashboard.ipg-invest.ae,https://info.ipg-invest.ae,https://wallet.ipg-invest.ae
```

---

## 🌐 АРХИТЕКТУРА ДОМЕНОВ

### **Production Structure:**

```
ipg-invest.ae (Root Domain)
├── ipg-invest.ae → Invest-Lending (главная landing/регистрация)
├── dashboard.ipg-invest.ae → Dashboard (личный кабинет)
├── info.ipg-invest.ae → Info App (О компании / Проект)
├── wallet.ipg-invest.ae → Wallet App (кошелек)
└── api.ipg-invest.ae → API Server (backend)
```

### **Navigation Flow:**

```
Пользователь → https://ipg-invest.ae (Landing)
             ↓
        Регистрация / Логин
             ↓
   https://dashboard.ipg-invest.ae (Dashboard)
             ↓
   Меню бургер → "Проект" → https://info.ipg-invest.ae?view=project
             ↓
   Меню бургер → "Компания" → https://info.ipg-invest.ae?view=company
             ↓
   Меню бургер → "Кошелек" → https://wallet.ipg-invest.ae
```

---

## 📋 СОЗДАННЫЕ ФАЙЛЫ ДЛЯ DEPLOYMENT

1. ✅ `PRODUCTION-URLS.md` - Подробная документация по URL структуре
2. ✅ `PRE-DEPLOYMENT-CHECKLIST.md` - Чеклист перед deployment
3. ✅ `DOMAIN-CHANGES-SUMMARY.md` - Эта сводка
4. ✅ `DEPLOY-UBUNTU-GUIDE.md` - Полное руководство по deployment
5. ✅ `DATABASE-MIGRATION-CRITICAL.md` - Критичные моменты БД
6. ✅ `DEPLOYMENT-SUMMARY.md` - Общая сводка deployment
7. ✅ `docker-compose.yml` - Docker конфигурация
8. ✅ `nginx/conf.d/ipg-invest.ae.conf` - Nginx конфигурация
9. ✅ `ecosystem.config.js` - PM2 конфигурация
10. ✅ `server/scripts/export-database.sh` - Экспорт БД
11. ✅ `server/scripts/import-database.sh` - Импорт БД
12. ✅ `server/scripts/setup-ubuntu-database.sh` - Настройка БД на Ubuntu

---

## 🔍 КАК ПРОВЕРИТЬ ИЗМЕНЕНИЯ

### **1. Локальная разработка (localhost)**
Все продолжает работать как раньше:
- Dashboard: `http://localhost:3000`
- Invest-Lending: `http://localhost:5182`
- Info: `http://localhost:3002`
- Wallet: `http://localhost:3003`
- API: `http://localhost:3001`

### **2. Production (после deployment)**
После деплоя на Ubuntu:
- Landing: `https://ipg-invest.ae`
- Dashboard: `https://dashboard.ipg-invest.ae`
- Info: `https://info.ipg-invest.ae`
- Wallet: `https://wallet.ipg-invest.ae`
- API: `https://api.ipg-invest.ae`

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

1. **На вашей машине (Windows):**
   ```bash
   cd "C:\Users\HP\Desktop\Project site invest\server"
   bash scripts/export-database.sh
   # Результат: backups/ipg_backup_*.sql.gz
   ```

2. **На Ubuntu сервере:**
   - Следуйте инструкциям в `DEPLOY-UBUNTU-GUIDE.md`
   - Или используйте быстрый старт из `PRE-DEPLOYMENT-CHECKLIST.md`

3. **DNS настройки:**
   - Добавьте A-записи для всех поддоменов (см. `PRE-DEPLOYMENT-CHECKLIST.md`)

4. **SSL сертификаты:**
   ```bash
   sudo certbot --nginx -d ipg-invest.ae -d dashboard.ipg-invest.ae -d info.ipg-invest.ae -d wallet.ipg-invest.ae -d api.ipg-invest.ae
   ```

---

## ✅ ИТОГ

**Все 6 измененных файлов:**
1. ✅ `Dashboard/components/Header.tsx`
2. ✅ `Dashboard/App.tsx`
3. ✅ `Invest-Lending/App.tsx`
4. ✅ `Info/components/Header.tsx`
5. ✅ `server/.env`
6. ✅ `server/.env.production`

**Все изменения направлены на:**
- ✅ Использование поддоменов вместо путей
- ✅ Правильную маршрутизацию между приложениями
- ✅ Корректную работу CORS
- ✅ Работу как на localhost, так и на production

---

## 📞 ПОДДЕРЖКА

Если возникнут вопросы при deployment:
1. Проверьте `PRE-DEPLOYMENT-CHECKLIST.md`
2. См. раздел "Проблемы и решения" в `DEPLOY-UBUNTU-GUIDE.md`
3. Проверьте логи:
   ```bash
   docker compose logs -f  # для Docker
   pm2 logs  # для PM2
   sudo tail -f /var/log/nginx/error.log  # Nginx
   ```

---

**Дата изменений:** 2026-02-02  
**Домен:** ipg-invest.ae  
**Статус:** ✅ Все правки внесены, проект готов к deployment
