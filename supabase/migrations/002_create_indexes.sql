-- Performance Indexes for FamFinance
-- Run this migration to improve query performance on common operations

-- =============================================
-- TRANSACOES (Transactions) Table Indexes
-- =============================================

-- Index for filtering transactions by user and date (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_transacoes_user_date
ON transacoes (user_id, data DESC);

-- Index for filtering by user and type (income/expense filtering)
CREATE INDEX IF NOT EXISTS idx_transacoes_user_type
ON transacoes (user_id, tipo);

-- Index for filtering by category (category reports)
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria
ON transacoes (categoria_id);

-- Index for filtering by account (account statements)
CREATE INDEX IF NOT EXISTS idx_transacoes_conta
ON transacoes (conta_id);

-- Composite index for monthly reports (user + month filter)
CREATE INDEX IF NOT EXISTS idx_transacoes_user_mes_ano
ON transacoes (user_id, mes_ano);

-- Index for recurring transactions
CREATE INDEX IF NOT EXISTS idx_transacoes_recorrente
ON transacoes (recorrente) WHERE recorrente = true;

-- =============================================
-- CONTAS (Accounts) Table Indexes
-- =============================================

-- Index for user's accounts lookup
CREATE INDEX IF NOT EXISTS idx_contas_user
ON contas (user_id);

-- Index for account type filtering
CREATE INDEX IF NOT EXISTS idx_contas_user_tipo
ON contas (user_id, tipo);

-- =============================================
-- INVESTIMENTOS (Investments) Table Indexes
-- =============================================

-- Index for user's investments lookup
CREATE INDEX IF NOT EXISTS idx_investimentos_user
ON investimentos (user_id);

-- Index for investment type filtering
CREATE INDEX IF NOT EXISTS idx_investimentos_user_tipo
ON investimentos (user_id, tipo);

-- Index for performance calculations (purchase date sorting)
CREATE INDEX IF NOT EXISTS idx_investimentos_user_date
ON investimentos (user_id, data_compra DESC);

-- =============================================
-- METAS (Goals) Table Indexes
-- =============================================

-- Index for user's goals lookup
CREATE INDEX IF NOT EXISTS idx_metas_user
ON metas (user_id);

-- Index for filtering active goals
CREATE INDEX IF NOT EXISTS idx_metas_user_status
ON metas (user_id, status);

-- Index for deadline alerts
CREATE INDEX IF NOT EXISTS idx_metas_deadline
ON metas (prazo) WHERE prazo IS NOT NULL;

-- =============================================
-- CATEGORIAS (Categories) Table Indexes
-- =============================================

-- Index for user's categories
CREATE INDEX IF NOT EXISTS idx_categorias_user
ON categorias (user_id);

-- Index for category group filtering (50-30-20 rule)
CREATE INDEX IF NOT EXISTS idx_categorias_user_grupo
ON categorias (user_id, grupo);

-- =============================================
-- USUARIOS (Users) Table Indexes
-- =============================================

-- Index for auth_id lookup (used in authentication)
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id
ON usuarios (auth_id);

-- =============================================
-- Analyze tables to update statistics
-- =============================================
ANALYZE transacoes;
ANALYZE contas;
ANALYZE investimentos;
ANALYZE metas;
ANALYZE categorias;
ANALYZE usuarios;

-- =============================================
-- Add comments to document indexes
-- =============================================
COMMENT ON INDEX idx_transacoes_user_date IS 'Primary index for user transaction queries sorted by date';
COMMENT ON INDEX idx_transacoes_user_type IS 'Index for filtering transactions by type (RECEITA/DESPESA)';
COMMENT ON INDEX idx_transacoes_user_mes_ano IS 'Index for monthly financial reports';
