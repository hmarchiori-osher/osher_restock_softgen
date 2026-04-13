-- Remover TODAS as políticas admin_full_access_* que causam recursão
DROP POLICY IF EXISTS "admin_full_access_networks" ON networks;
DROP POLICY IF EXISTS "admin_full_access_branches" ON branches;
DROP POLICY IF EXISTS "admin_full_access_products" ON products;
DROP POLICY IF EXISTS "admin_full_access_orders" ON orders;
DROP POLICY IF EXISTS "admin_full_access_branch_users" ON branch_users;

-- Remover políticas duplicadas
DROP POLICY IF EXISTS "own_branch_user" ON branch_users;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;