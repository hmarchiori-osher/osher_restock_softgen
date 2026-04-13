-- Adicionar coluna access_mode na tabela branches (se não existir)
ALTER TABLE branches
ADD COLUMN IF NOT EXISTS access_mode TEXT DEFAULT 'cnpj_only'
CHECK (access_mode IN ('cnpj_only', 'login_required'));

COMMENT ON COLUMN branches.access_mode IS 'Modo de acesso desta filial: cnpj_only (sem senha) ou login_required (email+senha)';