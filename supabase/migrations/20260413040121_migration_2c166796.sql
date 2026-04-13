-- DELETAR TODAS as políticas da tabela profiles
DROP POLICY IF EXISTS "allow_profile_creation" ON profiles;
DROP POLICY IF EXISTS "users_manage_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_full_access" ON profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "public_read" ON profiles;
DROP POLICY IF EXISTS "auth_insert" ON profiles;
DROP POLICY IF EXISTS "auth_update" ON profiles;
DROP POLICY IF EXISTS "auth_delete" ON profiles;

-- Criar política ULTRA SIMPLES sem nenhuma subquery
-- Qualquer usuário autenticado pode ler/atualizar SEU PRÓPRIO profile (usando auth.uid() diretamente)
CREATE POLICY "select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);