-- Unified database schema for Imperial Pure Gold (PostgreSQL)

-- Schema namespace
CREATE SCHEMA IF NOT EXISTS ipg;
SET search_path TO ipg;

-- Enums
CREATE TYPE user_status_enum AS ENUM ('active', 'pending', 'blocked', 'deleted');
CREATE TYPE currency_enum AS ENUM ('USD', 'GHS');
CREATE TYPE transaction_type_enum AS ENUM (
  'DEPOSIT',
  'WITHDRAWAL',
  'PROFIT_ACCRUAL',
  'GHS_BONUS',
  'GHS_PURCHASE'
);
CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE contract_status_enum AS ENUM ('active', 'completed');
CREATE TYPE log_action_enum AS ENUM (
  'USER_LOGIN',
  'USER_VIEW',
  'USER_UPDATE',
  'BALANCE_MANUAL_EDIT'
);

-- Users
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  investor_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  passport_file_path VARCHAR(512),
  crypto_wallet VARCHAR(255),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  google_id VARCHAR(255),
  telegram_id VARCHAR(255),
  telegram_username VARCHAR(255),
  telegram_chat_id VARCHAR(255),
  facebook_id VARCHAR(255),
  facebook_access_token VARCHAR(500),
  phone VARCHAR(20),
  date_of_birth DATE,
  passport_number VARCHAR(50),
  passport_photo_url VARCHAR(500),
  status user_status_enum NOT NULL DEFAULT 'pending',
  registration_method VARCHAR(20),
  registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    email IS NOT NULL OR
    telegram_id IS NOT NULL OR
    facebook_id IS NOT NULL OR
    google_id IS NOT NULL
  )
);

-- Balances
CREATE TABLE balances (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency currency_enum NOT NULL,
  amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, currency),
  CHECK (amount >= 0)
);

CREATE INDEX balances_user_id_idx ON balances(user_id);

-- Transactions
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type_enum NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  status transaction_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  comment TEXT,
  CHECK (amount > 0)
);

CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_created_at_idx ON transactions(created_at);

-- Contracts
CREATE TABLE contracts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_invested DECIMAL(20, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status contract_status_enum NOT NULL DEFAULT 'active',
  final_profit DECIMAL(20, 2),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (amount_invested > 0),
  CHECK (end_date >= start_date),
  CHECK (final_profit IS NULL OR final_profit >= 0)
);

CREATE INDEX contracts_user_id_idx ON contracts(user_id);
CREATE INDEX contracts_end_date_idx ON contracts(end_date);

-- Token price history
CREATE TABLE token_price_history (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  price_usd DECIMAL(10, 4) NOT NULL,
  CHECK (price_usd >= 0),
  UNIQUE (timestamp)
);

CREATE INDEX token_price_history_timestamp_idx ON token_price_history(timestamp);

-- Admin logs
CREATE TABLE admin_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) NOT NULL,
  action_type log_action_enum NOT NULL,
  target_user_id BIGINT NOT NULL REFERENCES users(id),
  details JSONB NOT NULL,
  CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX admin_logs_target_user_id_idx ON admin_logs(target_user_id);
CREATE INDEX admin_logs_timestamp_idx ON admin_logs(timestamp);
CREATE INDEX admin_logs_action_type_idx ON admin_logs(action_type);-- Unique social IDs (nullable)
CREATE UNIQUE INDEX users_google_id_uq ON users(google_id) WHERE google_id IS NOT NULL;
CREATE UNIQUE INDEX users_telegram_id_uq ON users(telegram_id) WHERE telegram_id IS NOT NULL;
CREATE UNIQUE INDEX users_facebook_id_uq ON users(facebook_id) WHERE facebook_id IS NOT NULL;
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_investor_id_idx ON users(investor_id);
CREATE INDEX users_status_idx ON users(status);-- Updated-at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER balances_set_updated_at
BEFORE UPDATE ON balances
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER transactions_set_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER contracts_set_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Default balances on user creation
CREATE OR REPLACE FUNCTION create_default_balances()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO balances (user_id, currency, amount)
  VALUES (NEW.id, 'USD', 0), (NEW.id, 'GHS', 0)
  ON CONFLICT (user_id, currency) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_create_default_balances
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_balances();

-- Sessions (refresh tokens)
CREATE TABLE sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(512) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);
