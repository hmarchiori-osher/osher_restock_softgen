-- SOLUÇÃO RADICAL: Desabilitar RLS completamente e recriar do zero
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Deletar TODAS as políticas existentes (caso existam)
DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON profiles';
  END LOOP;
END $$;

-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar apenas UMA política super simples: cada um vê/edita só seu próprio profile
CREATE POLICY "own_profile_access" ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permitir INSERT inicial (trigger do signup)
CREATE POLICY "allow_signup_insert" ON profiles
  FOR INSERT
  WITH CHECK (true);