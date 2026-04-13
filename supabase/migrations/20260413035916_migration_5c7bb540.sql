-- Remover TODAS as políticas existentes de profiles
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_full_access" ON profiles;
DROP POLICY IF EXISTS "public_read" ON profiles;
DROP POLICY IF EXISTS "auth_insert" ON profiles;
DROP POLICY IF EXISTS "auth_update" ON profiles;
DROP POLICY IF EXISTS "auth_delete" ON profiles;

-- Criar políticas simples SEM recursão
-- Qualquer usuário autenticado pode ler e atualizar SEU PRÓPRIO profile
CREATE POLICY "users_manage_own_profile" ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permitir INSERT na criação do profile (trigger do signup)
CREATE POLICY "allow_profile_creation" ON profiles
  FOR INSERT
  WITH CHECK (true);