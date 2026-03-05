-- Add tx_hash column for manual pending deposits
-- Run: psql $DATABASE_URL -f server/scripts/migrate-add-tx-hash.sql

SET search_path TO ipg;

ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(512) NULL;

COMMENT ON COLUMN transactions.tx_hash IS 'Transaction hash (TXID) for manual deposits awaiting admin confirmation';
