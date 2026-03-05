-- PERFORMANCE OPTIMIZATION: Additional Indexes
-- Добавляет недостающие индексы для оптимизации запросов

-- Users table optimization
CREATE INDEX IF NOT EXISTS users_email_verified_idx ON ipg.users(email_verified) WHERE email_verified = false;
CREATE INDEX IF NOT EXISTS users_status_registration_date_idx ON ipg.users(status, registration_date DESC);
CREATE INDEX IF NOT EXISTS users_last_login_idx ON ipg.users(last_login DESC) WHERE last_login IS NOT NULL;

-- Balances optimization для агрегации
CREATE INDEX IF NOT EXISTS balances_currency_amount_idx ON ipg.balances(currency, amount);

-- Transactions optimization
CREATE INDEX IF NOT EXISTS transactions_user_status_idx ON ipg.transactions(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_type_status_idx ON ipg.transactions(type, status);

-- Contracts optimization
CREATE INDEX IF NOT EXISTS contracts_status_end_date_idx ON ipg.contracts(status, end_date DESC);
CREATE INDEX IF NOT EXISTS contracts_user_status_idx ON ipg.contracts(user_id, status);

-- Sessions optimization для очистки старых сессий
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON ipg.sessions(expires_at) WHERE expires_at < NOW();

-- Admin logs optimization
CREATE INDEX IF NOT EXISTS admin_logs_action_timestamp_idx ON ipg.admin_logs(action_type, timestamp DESC);

-- Composite index для частых запросов Dashboard
CREATE INDEX IF NOT EXISTS users_id_status_idx ON ipg.users(id, status) WHERE status = 'active';

COMMENT ON INDEX ipg.users_email_verified_idx IS 'Оптимизация поиска неподтвержденных пользователей';
COMMENT ON INDEX ipg.users_status_registration_date_idx IS 'Оптимизация списка пользователей по статусу и дате';
COMMENT ON INDEX ipg.transactions_user_status_idx IS 'Оптимизация истории транзакций пользователя';
