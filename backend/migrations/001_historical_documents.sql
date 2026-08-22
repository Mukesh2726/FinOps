-- Historical document storage and transaction reconciliation.
-- Apply with the project's PostgreSQL migration runner before deploying the updated API.

ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE documents ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS bank_name VARCHAR;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS account_number_masked VARCHAR;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS statement_start_date VARCHAR;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS statement_end_date VARCHAR;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS opening_balance DOUBLE PRECISION;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS closing_balance DOUBLE PRECISION;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS transaction_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_date VARCHAR;
UPDATE transactions SET transaction_date = date WHERE transaction_date IS NULL;
ALTER TABLE transactions ALTER COLUMN transaction_date SET NOT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS debit DOUBLE PRECISION;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS credit DOUBLE PRECISION;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS balance DOUBLE PRECISION;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fingerprint VARCHAR;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS duplicate_of_id UUID REFERENCES transactions(id);

CREATE INDEX IF NOT EXISTS ix_documents_statement_start_date ON documents(statement_start_date);
CREATE INDEX IF NOT EXISTS ix_documents_statement_end_date ON documents(statement_end_date);
CREATE INDEX IF NOT EXISTS ix_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS ix_transactions_fingerprint ON transactions(fingerprint);
CREATE INDEX IF NOT EXISTS ix_transactions_transaction_reference ON transactions(transaction_reference);

CREATE TABLE IF NOT EXISTS transaction_documents (
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (transaction_id, document_id)
);
