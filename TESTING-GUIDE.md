# 🧪 ИНСТРУКЦИЯ ПО ТЕСТИРОВАНИЮ ПРОЕКТА

## ✅ Статус запуска

Все сервисы успешно запущены:

- ✅ **API Server:** http://localhost:3005
  - JWT middleware ✅
  - Rate limiting ✅
  - Unified endpoints ✅
  - Refresh token flow ✅
  - Session cleanup job ✅

- ✅ **Dashboard:** http://localhost:3000
  - Использует новый apiClient ✅
  - Automatic refresh ✅

- ✅ **Invest-Lending:** http://localhost:5182
  - Регистрация и калькулятор ✅

---

## 🧪 ТЕСТ 1: Вход в систему с тестовым пользователем

### **Шаг 1: Откройте Dashboard**
URL: http://localhost:3000

Должна открыться страница входа (login.html)

### **Шаг 2: Войдите с тестовыми данными**
```
Логин: Test
Пароль: Testtest
```

**Ожидаемый результат:**
- ✅ Успешный вход
- ✅ Редирект на Dashboard
- ✅ Отображение данных пользователя
- ✅ В localStorage сохранены:
  - `ipg_token` (access token)
  - `ipg_refresh_token` (refresh token)
  - `ipg_user_id`

**Проверка в консоли браузера (F12):**
```javascript
// Проверьте токены:
console.log('Access Token:', localStorage.getItem('ipg_token'));
console.log('Refresh Token:', localStorage.getItem('ipg_refresh_token'));
console.log('User ID:', localStorage.getItem('ipg_user_id'));
```

---

## 🧪 ТЕСТ 2: Automatic Refresh Token Flow

### **Метод A: Быстрый тест (изменение expires)**

#### **Шаг 1: Измените время жизни access token**
В файле `server/routes/auth.js` найдите:
```javascript
const signAccessToken = (userId, email) =>
  jwt.sign(
    { sub: userId, role: 'user', email },
    process.env.JWT_SECRET || 'ipg-dev-secret',
    { expiresIn: '15m' } // ← Измените на '10s' для теста
  );
```

#### **Шаг 2: Перезапустите API сервер**
```bash
# В терминале остановите сервер (Ctrl+C)
# И запустите заново:
npm start
```

#### **Шаг 3: Войдите в Dashboard**
- Логин: Test
- Пароль: Testtest

#### **Шаг 4: Подождите 15 секунд**
(Access token истечет)

#### **Шаг 5: Обновите страницу (F5)**

**Ожидаемый результат:**
- ✅ Страница загружается **БЕЗ** ошибок
- ✅ НЕТ редиректа на login
- ✅ Данные пользователя отображаются
- ✅ В консоли браузера (F12 → Network):
  - Видно 401 TokenExpired
  - Затем POST /auth/refresh
  - Затем повторный запрос с новым токеном ✅

---

### **Метод B: Ручной тест через консоль браузера**

#### **Шаг 1: Войдите в Dashboard**

#### **Шаг 2: Откройте консоль (F12)**

#### **Шаг 3: Вручную вызовите refresh:**
```javascript
// Проверяем текущий токен:
const oldToken = localStorage.getItem('ipg_token');
console.log('Old access token:', oldToken);

// Вызываем refresh:
const response = await fetch('http://localhost:3005/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    refreshToken: localStorage.getItem('ipg_refresh_token') 
  })
});

const data = await response.json();
console.log('New tokens:', data);

// Сохраняем новый токен:
localStorage.setItem('ipg_token', data.accessToken);
if (data.refreshToken) {
  localStorage.setItem('ipg_refresh_token', data.refreshToken);
}

const newToken = localStorage.getItem('ipg_token');
console.log('Tokens updated!', newToken !== oldToken);
```

**Ожидаемый результат:**
```javascript
{
  accessToken: "eyJhbGciOiJIUzI1NiIs...",  // Новый token
  refreshToken: "eyJhbGciOiJIUzI1NiIs...", // Тот же или новый
  user: { id: 1, investor_id: "INV-...", email: "test@example.com", ... }
}
```

---

## 🧪 ТЕСТ 3: Очередь запросов во время refresh

#### **Шаг 1: Войдите в Dashboard**

#### **Шаг 2: Подождите пока access token истечет (15 мин или 10s если изменили)**

#### **Шаг 3: В консоли (F12) выполните:**
```javascript
// Делаем 10 одновременных запросов:
const promises = Array(10).fill(null).map((_, i) => 
  fetch('http://localhost:3005/users/1', {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('ipg_token')}` 
    }
  }).then(r => r.json())
);

const results = await Promise.all(promises);
console.log('All requests succeeded:', results.length === 10);
```

**Ожидаемый результат:**
- ✅ Все 10 запросов успешны
- ✅ В Network tab (F12) видно:
  - 10 запросов → 401 TokenExpired
  - **Только 1** POST /auth/refresh ✅ (не 10!)
  - 10 повторных запросов с новым токеном

---

## 🧪 ТЕСТ 4: Rate Limiting

### **Тест A: Auth Rate Limiting (5 попыток / 15 минут)**

#### **Шаг 1: Выйдите из Dashboard (или откройте в режиме инкогнито)**

#### **Шаг 2: Попробуйте войти с **неправильным** паролем 6 раз подряд**

**Ожидаемый результат после 5-й попытки:**
```
Error: Too many login attempts, please try again later
HTTP Status: 429 Too Many Requests
```

**Проверка:**
```javascript
// В консоли (F12):
for (let i = 0; i < 6; i++) {
  const response = await fetch('http://localhost:3005/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'Test', password: 'WrongPassword' })
  });
  console.log(`Attempt ${i + 1}:`, response.status, await response.json());
}

// Attempt 1-5: 401 Invalid credentials
// Attempt 6: 429 Too many login attempts ✅
```

---

### **Тест B: API Rate Limiting (100 запросов / 15 минут)**

#### **Шаг 1: Войдите в Dashboard**

#### **Шаг 2: В консоли (F12) выполните:**
```javascript
// Делаем 101 запрос подряд:
for (let i = 0; i < 101; i++) {
  const response = await fetch('http://localhost:3005/api/market-data');
  if (response.status === 429) {
    console.log(`Rate limit hit at request ${i + 1}! ✅`);
    break;
  }
}

// Ожидается: Rate limit hit at request 101! ✅
```

---

## 🧪 ТЕСТ 5: Unified Endpoints (производительность)

### **Сравнение: 4 запроса vs 1 запрос**

#### **Метод A: 4 отдельных запроса (старый способ)**
```javascript
console.time('4 requests');

const [user, balances, contracts, transactions] = await Promise.all([
  fetch('http://localhost:3005/users/1', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('ipg_token')}` }
  }).then(r => r.json()),
  
  fetch('http://localhost:3005/balances?userId=1', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('ipg_token')}` }
  }).then(r => r.json()),
  
  fetch('http://localhost:3005/contracts?userId=1', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('ipg_token')}` }
  }).then(r => r.json()),
  
  fetch('http://localhost:3005/transactions?userId=1&limit=50', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('ipg_token')}` }
  }).then(r => r.json())
]);

console.timeEnd('4 requests');
// Обычно: 150-300ms
```

#### **Метод B: 1 unified запрос (новый способ)**
```javascript
console.time('1 unified request');

const dashboard = await fetch('http://localhost:3005/unified/user-dashboard/1', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('ipg_token')}` }
}).then(r => r.json());

console.log('Dashboard data:', dashboard);

console.timeEnd('1 unified request');
// Обычно: 50-100ms ✅ (3x быстрее!)
```

**Ожидаемый результат:**
```javascript
{
  user: { id: 1, investor_id: "INV-...", email: "test@example.com", ... },
  balances: [
    { currency: "USD", amount: 0 },
    { currency: "GHS", amount: 0 }
  ],
  contracts: [],
  transactions: [],
  meta: {
    timestamp: "2026-02-27T...",
    transactionsLimit: 50,
    transactionsTotal: 0
  }
}
```

---

## 🧪 ТЕСТ 6: Session Cleanup Job

### **Проверка автоматической очистки**

#### **Шаг 1: Проверьте логи API сервера**
В терминале должно быть:
```
[Session Cleanup] Starting automatic cleanup job...
[Session Cleanup] Will run every 24 hours
[Session Cleanup] Deleted 0 expired sessions in 80ms
```

#### **Шаг 2: Проверьте статистику сессий**
```javascript
// В консоли браузера:
const stats = await fetch('http://localhost:3005/unified/statistics', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('ipg_token')}` }
}).then(r => r.json());

console.log('Sessions stats:', stats);
```

---

## 🧪 ТЕСТ 7: Logout

#### **Шаг 1: Войдите в Dashboard**

#### **Шаг 2: В консоли (F12):**
```javascript
// Проверяем токены перед logout:
console.log('Before logout:', {
  token: localStorage.getItem('ipg_token'),
  refreshToken: localStorage.getItem('ipg_refresh_token')
});

// Logout:
await fetch('http://localhost:3005/auth/logout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    refreshToken: localStorage.getItem('ipg_refresh_token') 
  })
});

// Очищаем локальное хранилище:
localStorage.removeItem('ipg_token');
localStorage.removeItem('ipg_refresh_token');
localStorage.removeItem('ipg_user_id');

// Проверяем:
console.log('After logout:', {
  token: localStorage.getItem('ipg_token'), // null ✅
  refreshToken: localStorage.getItem('ipg_refresh_token') // null ✅
});
```

#### **Шаг 3: Попробуйте обновить страницу**

**Ожидаемый результат:**
- ✅ Редирект на /login.html
- ✅ Сессия завершена

---

## 📊 Ожидаемые результаты

### **Безопасность:**
- ✅ API endpoints защищены (без токена = 401)
- ✅ Rate limiting работает (брутфорс невозможен)
- ✅ Refresh token можно отозвать (logout удаляет из БД)

### **Производительность:**
- ✅ Unified endpoints в 3x быстрее
- ✅ Только 1 refresh для множественных запросов
- ✅ Dashboard загружается за ~50-100ms

### **UX:**
- ✅ Нет "Session expired" экранов
- ✅ Работа 30 дней без повторного логина
- ✅ Автоматический refresh незаметен для пользователя

---

## 🐛 Устранение неполадок

### **Проблема: "Connection refused"**
**Решение:** Убедитесь что все сервисы запущены:
```bash
# API сервер должен быть на порту 3005:
netstat -ano | findstr ":3005"

# Dashboard на порту 3000:
netstat -ano | findstr ":3000"
```

### **Проблема: "Invalid refresh token"**
**Решение:** Очистите localStorage и войдите заново:
```javascript
localStorage.clear();
window.location.href = '/login.html';
```

### **Проблема: "Too many requests"**
**Решение:** Подождите 15 минут или перезапустите API сервер

---

## 🏁 Заключение

Если все тесты прошли успешно:
- ✅ Проект готов к production
- ✅ Automatic refresh работает
- ✅ Rate limiting защищает от атак
- ✅ Unified endpoints ускоряют работу в 3x

**Следующий шаг:** Деплой на сервер!

---

**Конец инструкции.** Приятного тестирования! 🚀
