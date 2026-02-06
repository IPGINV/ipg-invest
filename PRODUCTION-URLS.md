# 🌐 СТРУКТУРА ДОМЕНОВ И URL

## Домен: ipg-invest.ae

---

## 📍 ПОДДОМЕНЫ И МАРШРУТИЗАЦИЯ

### **Production URLs:**

| Приложение | Поддомен | URL | Порт (внутренний) |
|------------|----------|-----|-------------------|
| **Invest-Lending** (Главная) | `ipg-invest.ae` | `https://ipg-invest.ae` | 5182 |
| **Dashboard** | `dashboard.ipg-invest.ae` | `https://dashboard.ipg-invest.ae` | 3000 |
| **Info App** | `info.ipg-invest.ae` | `https://info.ipg-invest.ae` | 3002 |
| **Wallet App** | `wallet.ipg-invest.ae` | `https://wallet.ipg-invest.ae` | 3003 |
| **API Server** | `api.ipg-invest.ae` | `https://api.ipg-invest.ae` | 3001 |

---

## 🔧 КОНФИГУРАЦИЯ ПРИЛОЖЕНИЙ

### **1. API Server (server/.env)**

```bash
# Domain
DOMAIN=ipg-invest.ae

# CORS Origins (все поддомены)
CORS_ORIGIN=https://ipg-invest.ae,https://dashboard.ipg-invest.ae,https://info.ipg-invest.ae,https://wallet.ipg-invest.ae

# API URL
API_URL=https://api.ipg-invest.ae
```

---

### **2. Dashboard (.env.production)**

```bash
VITE_API_BASE_URL=https://api.ipg-invest.ae
VITE_INFO_APP_URL=https://info.ipg-invest.ae
VITE_WALLET_APP_URL=https://wallet.ipg-invest.ae
VITE_LENDING_APP_URL=https://ipg-invest.ae
```

**Код (`Dashboard/components/Header.tsx`):**
```typescript
const openInfoApp = (view: 'project' | 'company') => {
  const isLocal = window.location.hostname === 'localhost';
  const base = isLocal ? 'http://localhost:3002' : 'https://info.ipg-invest.ae';
  const url = new URL(base);
  url.searchParams.set('view', view);
  url.searchParams.set('lang', lang);
  window.location.href = url.toString();
};

const openCalculator = () => {
  const isLocal = window.location.hostname === 'localhost';
  const base = isLocal ? 'http://localhost:5182' : 'https://ipg-invest.ae';
  window.location.href = base;
};
```

---

### **3. Invest-Lending (.env.production)**

```bash
VITE_API_BASE_URL=https://api.ipg-invest.ae
VITE_DASHBOARD_APP_URL=https://dashboard.ipg-invest.ae
GEMINI_API_KEY=your_gemini_api_key
```

**Код (`Invest-Lending/App.tsx`):**
```typescript
const buildLoginUrl = () => {
  const isLocal = window.location.hostname === 'localhost';
  return isLocal ? 'http://localhost:3000' : 'https://dashboard.ipg-invest.ae';
};

const getApiBase = () => {
  return (window as any).__IPG_API_BASE || 'https://api.ipg-invest.ae';
};
```

---

### **4. Info App (.env.production)**

```bash
VITE_API_BASE_URL=https://api.ipg-invest.ae
GEMINI_API_KEY=your_gemini_api_key
```

**Код (`Info/components/Header.tsx`):**
```typescript
const buildAppUrl = (app: 'dashboard' | 'wallet' | 'invest' | 'info') => {
  const isLocal = window.location.hostname === 'localhost';
  
  if (isLocal) {
    const ports: Record<typeof app, number> = {
      dashboard: 3000,
      wallet: 3003,
      invest: 5182,
      info: 3002
    };
    return `http://localhost:${ports[app]}`;
  }
  
  // Production: поддомены
  const subdomains: Record<typeof app, string> = {
    dashboard: 'dashboard.ipg-invest.ae',
    wallet: 'wallet.ipg-invest.ae',
    invest: 'ipg-invest.ae',
    info: 'info.ipg-invest.ae'
  };
  
  return `https://${subdomains[app]}`;
};
```

---

### **5. Wallet App (.env.production)**

```bash
VITE_API_BASE_URL=https://api.ipg-invest.ae
```

---

## 🔀 НАВИГАЦИЯ МЕЖДУ ПРИЛОЖЕНИЯМИ

### **Из Invest-Lending → Dashboard:**
```typescript
// После регистрации/логина
window.location.href = 'https://dashboard.ipg-invest.ae';
```

### **Из Dashboard → Info App:**
```typescript
// Просмотр проекта/компании
window.location.href = 'https://info.ipg-invest.ae?view=project&lang=ru';
```

### **Из Dashboard → Invest-Lending:**
```typescript
// Калькулятор
window.location.href = 'https://ipg-invest.ae';
```

### **Из Info App → Dashboard:**
```typescript
// Личный кабинет
window.location.href = 'https://dashboard.ipg-invest.ae';
```

---

## 🌐 DNS НАСТРОЙКИ

### **Необходимые A-записи:**

```
ipg-invest.ae               A    YOUR_SERVER_IP
dashboard.ipg-invest.ae     A    YOUR_SERVER_IP
info.ipg-invest.ae          A    YOUR_SERVER_IP
wallet.ipg-invest.ae        A    YOUR_SERVER_IP
api.ipg-invest.ae           A    YOUR_SERVER_IP
www.ipg-invest.ae           A    YOUR_SERVER_IP (редирект на ipg-invest.ae)
```

**Или через CNAME:**
```
dashboard.ipg-invest.ae     CNAME    ipg-invest.ae
info.ipg-invest.ae          CNAME    ipg-invest.ae
wallet.ipg-invest.ae        CNAME    ipg-invest.ae
api.ipg-invest.ae           CNAME    ipg-invest.ae
```

---

## 🔒 SSL СЕРТИФИКАТЫ (Let's Encrypt)

```bash
# Получить сертификаты для всех поддоменов
sudo certbot --nginx \
  -d ipg-invest.ae \
  -d www.ipg-invest.ae \
  -d dashboard.ipg-invest.ae \
  -d info.ipg-invest.ae \
  -d wallet.ipg-invest.ae \
  -d api.ipg-invest.ae

# Или по отдельности:
sudo certbot --nginx -d ipg-invest.ae -d www.ipg-invest.ae
sudo certbot --nginx -d dashboard.ipg-invest.ae
sudo certbot --nginx -d info.ipg-invest.ae
sudo certbot --nginx -d wallet.ipg-invest.ae
sudo certbot --nginx -d api.ipg-invest.ae
```

---

## 🧪 ТЕСТИРОВАНИЕ

### **Локальная разработка (с /etc/hosts):**

Для тестирования на локальной машине:

```bash
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/Mac: /etc/hosts

127.0.0.1  ipg-invest.local
127.0.0.1  dashboard.ipg-invest.local
127.0.0.1  info.ipg-invest.local
127.0.0.1  wallet.ipg-invest.local
127.0.0.1  api.ipg-invest.local
```

Затем обновите код для проверки на `.local`:

```typescript
const isLocal = window.location.hostname.includes('localhost') || 
                window.location.hostname.includes('.local');
```

---

## ✅ ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

### **DNS:**
- [ ] A-записи настроены для всех поддоменов
- [ ] DNS propagation завершена (проверка: `nslookup ipg-invest.ae`)

### **SSL:**
- [ ] Сертификаты получены для всех поддоменов
- [ ] Auto-renewal настроен

### **Nginx:**
- [ ] Конфигурация обновлена для всех поддоменов
- [ ] HTTPS редиректы настроены
- [ ] www → non-www редирект работает

### **Environment Variables:**
- [ ] `server/.env` обновлен (CORS_ORIGIN, DOMAIN)
- [ ] `Dashboard/.env.production` обновлен
- [ ] `Invest-Lending/.env.production` обновлен
- [ ] `Info/.env.production` обновлен
- [ ] `Wallet/.env.production` обновлен

### **Код:**
- [ ] Все `localhost` URL обновлены на production
- [ ] API_BASE указывает на `api.ipg-invest.ae`
- [ ] Навигация между приложениями работает

---

## 🎯 ПРИОРИТЕТ ИСПРАВЛЕНИЙ

### **КРИТИЧНО (должно быть исправлено):**

1. **API Base URL** во всех frontend приложениях
2. **CORS_ORIGIN** в server/.env
3. **Nginx конфигурация** для всех поддоменов
4. **SSL сертификаты**

### **ВАЖНО (рекомендуется):**

1. Проверка всех межприложенных навигационных ссылок
2. Тестирование регистрации и логина
3. Проверка email ссылок (должны указывать на production домены)

### **ОПЦИОНАЛЬНО:**

1. Настройка CDN (CloudFlare)
2. Настройка analytics (Google Analytics, Yandex Metrika)
3. Настройка error tracking (Sentry)

---

**Дата:** 2026-02-02  
**Домен:** ipg-invest.ae  
**Статус:** ✅ Готов к настройке
