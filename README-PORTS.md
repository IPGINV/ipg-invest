# Imperial Pure Gold - Порты и запуск приложений

## 📋 Структура портов

| Приложение | Порт | URL (localhost) | Описание |
|------------|------|-----------------|----------|
| **API Server** | 3001 | http://localhost:3001 | Backend API сервер |
| **Dashboard** | 3000 | http://localhost:3000 | Личный кабинет инвестора |
| **Info App** | 3002 | http://localhost:3002 | Информация о проекте/компании |
| **Wallet App** | 3003 | http://localhost:3003 | Криптокошелек и транзакции |
| **Invest-Lending** | 5182 | http://localhost:5182 | Лендинг и регистрация |

## 🚀 Запуск всех приложений

### 1. API Server (обязательно первым!)
```bash
cd server
npm install
npm run dev
```
URL: http://localhost:3001
Health check: http://localhost:3001/health

### 2. Dashboard App
```bash
cd Dashboard
npm install
npm run dev
```
URL: http://localhost:3000

### 3. Invest-Lending (лендинг)
```bash
cd Invest-Lending
npm install
npm run dev
```
URL: http://localhost:5182

### 4. Info App
```bash
cd Info
npm install
npm run dev
```
URL: http://localhost:3002

### 5. Wallet App
```bash
cd Wallet
npm install
npm run dev
```
URL: http://localhost:3003

## 🔄 Переходы между приложениями

### Из Invest-Lending:
- **Регистрация** → Dashboard (`http://localhost:3000/?investorId=...&email=...`)
- **"Личный кабинет"** (меню) → Dashboard login

### Из Dashboard:
- **"Проект"** (меню) → Info App (`?view=project&lang=ru`)
- **"Компания"** (меню) → Info App (`?view=company&lang=ru`)
- **"Кошелек"** → Wallet App

## ⚙️ .env файлы

Каждое приложение имеет свой `.env` файл с портами:

### Dashboard/.env
```env
VITE_PORT=3000
VITE_API_BASE_URL=http://localhost:3001
VITE_INFO_APP_URL=http://localhost:3002
VITE_WALLET_APP_URL=http://localhost:3003
VITE_LENDING_APP_URL=http://localhost:5182
```

### Invest-Lending/.env
```env
VITE_PORT=5182
VITE_API_BASE_URL=http://localhost:3001
VITE_DASHBOARD_APP_URL=http://localhost:3000
```

### Info/.env
```env
VITE_PORT=3002
VITE_API_BASE_URL=http://localhost:3001
```

### Wallet/.env
```env
VITE_PORT=3003
VITE_API_BASE_URL=http://localhost:3001
```

### server/.env
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3003,http://localhost:5182
```

## 🔧 Требования

- **Node.js** (версия 16+)
- **PostgreSQL** (порт 5432) - для API сервера
- **Redis** (порт 6379) - для Telegram регистрации (опционально)

## ⚠️ Частые проблемы

### Порт уже занят
Если порт занят, Vite автоматически выберет следующий свободный. Проверьте вывод в терминале.

### API Server падает
Убедитесь, что PostgreSQL запущен и доступен на порту 5432.

### CORS ошибки
Проверьте, что все порты приложений добавлены в `CORS_ORIGIN` в `server/.env`.

## 📝 Примечания

- API Server должен быть запущен **первым** перед остальными приложениями
- Dashboard работает в режиме fallback если API недоступен (показывает данные из URL параметров)
- Все приложения используют общий API на порту 3001
