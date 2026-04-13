-- Task 1: Schema completo + RLS para Osher Restock

-- 1. Criar trigger para profiles (auto-create on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users
INSERT INTO public.profiles (id, email) 
SELECT u.id, u.email FROM auth.users u 
LEFT JOIN public.profiles p ON p.id = u.id 
WHERE p.id IS NULL;

-- Adicionar role em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;

-- 2. Tabela de redes (networks)
CREATE TABLE IF NOT EXISTS public.networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj_matriz TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  brand_color TEXT,
  access_mode TEXT NOT NULL DEFAULT 'cnpj_only' CHECK (access_mode IN ('cnpj_only', 'login_required')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de filiais (branches)
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id UUID NOT NULL REFERENCES public.networks(id) ON DELETE CASCADE,
  cnpj TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address JSONB,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  freight_options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de usuários de filiais (branch_users)
CREATE TABLE IF NOT EXISTS public.branch_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(branch_id, user_id)
);

-- 5. Tabela de produtos (products)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  photo_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  visible_to_networks UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de pedidos (orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'separating', 'shipped', 'delivered')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  freight_option TEXT,
  freight_cost DECIMAL(10, 2) DEFAULT 0,
  urgent_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  estimated_delivery DATE,
  attachment_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de configurações (settings)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_quantity_free_shipping INTEGER DEFAULT 50,
  urgent_fee_percentage DECIMAL(5, 2) DEFAULT 15.00,
  default_delivery_days_in_stock INTEGER DEFAULT 2,
  default_delivery_days_out_of_stock INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão se não existir
INSERT INTO public.settings (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- 8. Função para gerar número de pedido
CREATE OR REPLACE FUNCTION generate_order_number() 
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 2) AS INTEGER)), 0) + 1 
  INTO next_num 
  FROM public.orders;
  RETURN '#' || LPAD(next_num::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para auto-gerar order_number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number 
BEFORE INSERT ON public.orders 
FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- 10. RLS Policies

-- Profiles: admin full access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access_profiles" ON public.profiles 
  FOR ALL USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Networks: admin full access
ALTER TABLE public.networks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access_networks" ON public.networks 
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "public_read_networks" ON public.networks 
  FOR SELECT USING (true);

-- Branches: admin + anon read, anon insert (for CNPJ flow)
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access_branches" ON public.branches 
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "public_read_branches" ON public.branches 
  FOR SELECT USING (true);

-- Branch users: admin + own branch
ALTER TABLE public.branch_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access_branch_users" ON public.branch_users 
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "own_branch_user" ON public.branch_users 
  FOR SELECT USING (user_id = auth.uid());

-- Products: admin full, public read
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access_products" ON public.products 
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "public_read_products" ON public.products 
  FOR SELECT USING (true);

-- Orders: admin full, anon can insert (for CNPJ flow), branch users can read own
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access_orders" ON public.orders 
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "anon_insert_orders" ON public.orders 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_orders" ON public.orders 
  FOR SELECT USING (true);

-- Settings: admin full, public read
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access_settings" ON public.settings 
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "public_read_settings" ON public.settings 
  FOR SELECT USING (true);

-- 11. Função para buscar filial por CNPJ (com dados da rede para white-label)
CREATE OR REPLACE FUNCTION get_branch_by_cnpj(cnpj_search TEXT)
RETURNS TABLE (
  branch_id UUID,
  branch_name TEXT,
  branch_cnpj TEXT,
  branch_address JSONB,
  branch_contact_name TEXT,
  branch_contact_phone TEXT,
  branch_freight_options JSONB,
  network_id UUID,
  network_name TEXT,
  network_logo_url TEXT,
  network_brand_color TEXT,
  network_access_mode TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.cnpj,
    b.address,
    b.contact_name,
    b.contact_phone,
    b.freight_options,
    n.id,
    n.name,
    n.logo_url,
    n.brand_color,
    n.access_mode
  FROM public.branches b
  JOIN public.networks n ON b.network_id = n.id
  WHERE b.cnpj = cnpj_search;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;