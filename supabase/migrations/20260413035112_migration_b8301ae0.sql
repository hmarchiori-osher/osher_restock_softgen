-- Corrigir RLS: permitir que usuários autenticados leiam seus próprios profiles
-- Isso resolve o deadlock: admin precisa ler profile para saber que é admin

-- Primeiro, dropar políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "admin_full_access" ON profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;

-- Criar políticas corretas
-- 1. Qualquer usuário autenticado pode ler SEU PRÓPRIO profile
CREATE POLICY "users_read_own_profile" ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- 2. Admins podem fazer tudo
CREATE POLICY "admin_full_access" ON profiles 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );