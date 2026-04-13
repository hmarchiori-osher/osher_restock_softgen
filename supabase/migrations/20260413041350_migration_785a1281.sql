-- Agora permitir INSERT/UPDATE/DELETE para usuários autenticados
-- (vamos validar role='admin' no código TypeScript, não no RLS)

-- NETWORKS
CREATE POLICY "auth_write_networks" ON networks
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- BRANCHES
CREATE POLICY "auth_write_branches" ON branches
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- PRODUCTS
CREATE POLICY "auth_write_products" ON products
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ORDERS
CREATE POLICY "auth_write_orders" ON orders
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- BRANCH_USERS
CREATE POLICY "auth_write_branch_users" ON branch_users
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);