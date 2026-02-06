# 🔧 СРОЧНЫЕ ИСПРАВЛЕНИЯ БИЗНЕС-ЛОГИКИ

## Критические проблемы, которые можно исправить прямо сейчас

---

## 1. ⚠️ INVEST-LENDING: Не создаются контракты после регистрации

### **Проблема:**
Пользователь выбирает сумму инвестиций, регистрируется, но контракт не создается в БД.

### **Исправление в `Invest-Lending/App.tsx`:**

**Найти функцию регистрации (строка ~900-960):**

```typescript
// ТЕКУЩИЙ КОД (неполный):
const res = await fetch(`${apiBase}/auth/register/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: registrationEmail.trim(),
    password: registrationPassword,
    full_name: registrationFullName.trim() || 'Investor',
    agree_terms: true
  })
});

if (!res.ok) {
  const body = await res.json().catch(() => ({}));
  throw new Error(body.error || 'Registration failed');
}

// ЗДЕСЬ НУЖНО ДОБАВИТЬ:
const userData = await res.json();
const userId = userData.user?.id;

if (userId && lockedAmount && lockedAmount > 0) {
  // Создаем контракт
  const today = new Date();
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 6);

  await fetch(`${apiBase}/contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      amount_invested: lockedAmount,
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'active'
    })
  }).catch(err => console.warn('Contract creation failed:', err));

  // Создаем транзакцию DEPOSIT
  await fetch(`${apiBase}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      type: 'DEPOSIT',
      amount: lockedAmount,
      status: 'pending',
      comment: 'Initial investment'
    })
  }).catch(err => console.warn('Transaction creation failed:', err));
}

window.location.href = buildLoginUrl();
```

---

## 2. ⚠️ DASHBOARD: Нет функции создания транзакций

### **Проблема:**
Dashboard может только читать транзакции, но не создавать (пополнение/вывод).

### **Добавить в `Dashboard/components/Profile.tsx`:**

```typescript
// Добавить state для транзакций
const [depositAmount, setDepositAmount] = useState('');
const [withdrawAmount, setWithdrawAmount] = useState('');

// Функция пополнения
const handleDeposit = async () => {
  if (!depositAmount || Number(depositAmount) <= 0) return;
  
  try {
    const apiBase = 'http://localhost:3001';
    await fetch(`${apiBase}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        type: 'DEPOSIT',
        amount: Number(depositAmount),
        status: 'pending',
        comment: 'Manual deposit'
      })
    });
    
    alert('Заявка на пополнение создана');
    setDepositAmount('');
    // Перезагрузить данные
    window.location.reload();
  } catch (err) {
    alert('Ошибка создания транзакции');
  }
};

// Добавить UI в компонент Profile:
<div className="space-y-4">
  <h3>Пополнить баланс</h3>
  <input
    type="number"
    value={depositAmount}
    onChange={e => setDepositAmount(e.target.value)}
    placeholder="Сумма в USD"
  />
  <button onClick={handleDeposit}>
    Пополнить
  </button>
</div>
```

---

## 3. ⚠️ API: Отсутствует endpoint для обновления паспортных данных

### **Проблема:**
Dashboard имеет форму загрузки паспорта, но API не обрабатывает файлы.

### **Добавить в `server/routes/users.js`:**

```javascript
// Установить multer для загрузки файлов:
// npm install multer

const multer = require('multer');
const path = require('path');

// Настройка storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/passports/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Новый endpoint
router.post(
  '/:id/passport',
  upload.single('passport'),
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const filePath = `/uploads/passports/${req.file.filename}`;
    
    await query(
      `UPDATE users SET passport_file_path = $1 WHERE id = $2`,
      [filePath, userId]
    );
    
    res.json({ success: true, path: filePath });
  })
);
```

---

## 4. ⚠️ DASHBOARD: Fallback режим не синхронизируется

### **Проблема:**
Когда Dashboard работает в fallback режиме (без API), изменения не сохраняются.

### **Улучшение в `Dashboard/App.tsx`:**

```typescript
// В функции handleUpdateUser:
if (usePrefillFallback) {
  const nextUser = { ...user, ...updatedData };
  setUser(nextUser);
  
  // ДОБАВИТЬ: сохранить в localStorage для персистентности
  localStorage.setItem('ipg:fallback-user', JSON.stringify(nextUser));
  return;
}

// При загрузке, проверять localStorage:
useEffect(() => {
  const fallbackUser = localStorage.getItem('ipg:fallback-user');
  if (fallbackUser && usePrefillFallback) {
    setUser(JSON.parse(fallbackUser));
  }
}, [usePrefillFallback]);
```

---

## 5. ⚠️ INVEST-LENDING: lockedAmount теряется

### **Проблема:**
После перезагрузки страницы в процессе регистрации теряется выбранная сумма.

### **Исправление:**

```typescript
// В функции lockAmount:
const lockAmount = (amount: number) => {
  setLockedAmount(amount);
  localStorage.setItem('ipg:locked-amount', String(amount));
  localStorage.setItem('ipg:locked-timestamp', String(Date.now())); // ДОБАВИТЬ
  nextStep('REGISTRATION');
};

// При загрузке проверять timestamp:
useEffect(() => {
  const stored = localStorage.getItem('ipg:locked-amount');
  const timestamp = localStorage.getItem('ipg:locked-timestamp');
  
  if (stored && timestamp) {
    const age = Date.now() - Number(timestamp);
    const maxAge = 30 * 60 * 1000; // 30 минут
    
    if (age < maxAge) {
      setLockedAmount(Number(stored));
    } else {
      // Истекло - очистить
      localStorage.removeItem('ipg:locked-amount');
      localStorage.removeItem('ipg:locked-timestamp');
    }
  }
}, []);
```

---

## 6. ⚠️ API: Нет валидации email при регистрации

### **Добавить в `server/routes/auth.js`:**

```javascript
// Функция валидации email
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// В POST /register/email:
router.post(
  '/register/email',
  asyncHandler(async (req, res) => {
    const { email, password, full_name, agree_terms } = req.body || {};
    
    // ДОБАВИТЬ:
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Неверный формат email' });
    }
    
    // остальной код...
  })
);
```

---

## 7. ⚠️ DASHBOARD: Пароль можно изменить без проверки старого

### **Исправление в `Dashboard/App.tsx`:**

```typescript
const handlePasswordChange = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  if (!user) throw new Error('Not authenticated');
  
  // ДОБАВИТЬ валидацию:
  if (newPassword.length < 8) {
    throw new Error('Пароль должен быть минимум 8 символов');
  }
  
  if (!currentPassword) {
    throw new Error('Введите текущий пароль');
  }
  
  if (usePrefillFallback) {
    throw new Error('Изменение пароля недоступно в режиме fallback');
  }
  
  // остальной код...
};
```

---

## 📋 ЧЕКЛИСТ ДЛЯ ПРОВЕРКИ ПОСЛЕ ИСПРАВЛЕНИЙ

### **Invest-Lending:**
- [ ] После регистрации создается запись в `contracts`
- [ ] После регистрации создается транзакция `DEPOSIT`
- [ ] `lockedAmount` не теряется при перезагрузке
- [ ] Email валидируется перед отправкой

### **Dashboard:**
- [ ] Можно создать транзакцию пополнения
- [ ] Можно создать транзакцию вывода
- [ ] Fallback данные сохраняются в localStorage
- [ ] Пароль валидируется (минимум 8 символов)
- [ ] Можно загрузить паспорт/ID

### **API:**
- [ ] Endpoint `/contracts` создает контракты
- [ ] Endpoint `/transactions` создает транзакции
- [ ] Endpoint `/users/:id/passport` загружает файлы
- [ ] Email валидация работает

---

## 🚀 БЫСТРЫЙ СТАРТ

1. Скопировать код из этого документа
2. Применить изменения в соответствующих файлах
3. Перезапустить приложения
4. Протестировать полный цикл:
   - Регистрация → проверить `contracts` в БД
   - Пополнение → проверить `transactions` в БД
   - Загрузка паспорта → проверить `passport_file_path` в БД

---

**Примечание:** Эти исправления решают критические проблемы бизнес-логики, но **НЕ РЕШАЮТ** основную проблему несоответствия ТЗ (использование React вместо Vanilla JS).
