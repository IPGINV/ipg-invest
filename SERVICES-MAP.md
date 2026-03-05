# 🚀 КАРТА ПОРТОВ И СЕРВИСОВ

## ✅ Все запущенные сервисы

### **Backend:**
- **API Server:** http://localhost:3005
  - JWT authentication ✅
  - Refresh tokens ✅
  - Rate limiting (memory-based) ✅
  - Session cleanup job ✅

### **Frontend приложения:**

1. **Dashboard (Личный кабинет)** → http://localhost:3000
   - Логин: http://localhost:3000/login.html
   - Automatic token refresh ✅
   - Защита от бесконечных перезагрузок ✅

2. **Info (Компания/Проект)** → http://localhost:3003
   - Компания: http://localhost:3003?view=company&lang=ru
   - Проект: http://localhost:3003?view=project&lang=ru

3. **Invest-Lending (Landing Page)** → http://localhost:5182
   - Главная страница
   - Регистрация инвесторов

4. **Calculator (Калькулятор доходности)** → http://localhost:5178
   - Отдельное приложение калькулятора ✅

---

## 🔗 Навигация между приложениями

### **Из Invest-Lending (http://localhost:5182):**

Гамбургер меню (☰) → содержит кнопки:

1. **"Компания"** → http://localhost:3003?view=company&lang=ru
2. **"Проект"** → http://localhost:3003?view=project&lang=ru
3. **"Калькулятор доходности"** → http://localhost:5178
4. **"Личный кабинет"** → http://localhost:3000

---

## 📋 Карта портов для Production

### **Production URLs (будущие):**

- **API:** https://api.ipg-invest.ae
- **Dashboard:** https://dashboard.ipg-invest.ae
- **Info:** https://info.ipg-invest.ae
- **Invest-Lending:** https://ipg-invest.ae
- **Calculator:** https://calculator.ipg-invest.ae
- **Wallet:** https://wallet.ipg-invest.ae (еще не запущен)
- **Admin:** https://admin.ipg-invest.ae (еще не запущен)

---

## 🧪 Быстрый тест всех сервисов

### **1. Проверка API Server:**
```bash
curl http://localhost:3005/health
# Ожидается: {"status":"ok","timestamp":"..."}
```

### **2. Проверка Dashboard:**
Откройте http://localhost:3000/login.html
- Логин: Test
- Пароль: Testtest
- Ожидается: успешный вход → Dashboard

### **3. Проверка Info:**
Откройте http://localhost:3003?view=company&lang=ru
- Ожидается: страница с информацией о компании

### **4. Проверка Invest-Lending:**
Откройте http://localhost:5182
- Ожидается: landing page с регистрацией

### **5. Проверка Calculator:**
Откройте http://localhost:5178
- Ожидается: приложение калькулятора доходности

---

## 🛑 Остановка всех сервисов

### **Windows PowerShell:**
```powershell
# Найти все процессы на портах:
netstat -ano | findstr "3000 3003 3005 5178 5182"

# Остановить конкретный процесс (замените PID на нужный):
taskkill /F /PID <PID>

# Или остановить все Node.js процессы (ОСТОРОЖНО!):
taskkill /F /IM node.exe
```

---

## 🚀 Запуск всех сервисов

### **1. API Server:**
```bash
cd "C:\Users\HP\Desktop\Project site invest\server"
npm start
```

### **2. Dashboard:**
```bash
cd "C:\Users\HP\Desktop\Project site invest\Dashboard"
npm run dev
```

### **3. Info:**
```bash
cd "C:\Users\HP\Desktop\Project site invest\Info"
npm run dev
```

### **4. Invest-Lending:**
```bash
cd "C:\Users\HP\Desktop\Project site invest\Invest-Lending"
npm run dev
```

### **5. Calculator:**
```bash
cd "C:\Users\HP\Desktop\Project site invest\calculator-app"
npm run dev
```

---

## 📊 Текущий статус

| Сервис | Порт | URL | Статус |
|--------|------|-----|--------|
| API Server | 3005 | http://localhost:3005 | ✅ Running |
| Dashboard | 3000 | http://localhost:3000 | ✅ Running |
| Info | 3003 | http://localhost:3003 | ✅ Running |
| Invest-Lending | 5182 | http://localhost:5182 | ✅ Running |
| Calculator | 5178 | http://localhost:5178 | ✅ Running |
| Wallet | 5177 | - | ❌ Not started |
| Admin | - | - | ❌ Not started |

---

## 🔧 Устранение неполадок

### **Проблема: "Port already in use"**
```bash
# Найдите процесс:
netstat -ano | findstr ":ПОРТ"

# Остановите:
taskkill /F /PID <PID>
```

### **Проблема: "Cannot connect to localhost"**
1. Проверьте что сервис запущен
2. Проверьте firewall
3. Попробуйте http://127.0.0.1 вместо localhost

### **Проблема: "CORS error"**
Убедитесь что в `.env` сервера прописан нужный origin:
```
CORS_ORIGIN=http://localhost:3000,http://localhost:5182,http://localhost:5178,...
```

---

**Все сервисы готовы к использованию!** 🚀
