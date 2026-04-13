---
title: "Autenticação Admin + Schema do Banco"
status: "done"
priority: "urgent"
type: "feature"
tags: ["auth", "database"]
created_by: "agent"
created_at: "2026-04-13T03:23:17Z"
position: 1
---

## Notes

Configurar autenticação de admin (email/senha via Supabase Auth) e criar todas as tabelas do sistema com RLS. Admin tem acesso total, filiais acessam dados da própria rede via políticas específicas.

**Tabelas:**
- `profiles` (auto-criada, estender com role: admin)
- `networks` (redes): name, cnpj_matriz, contact_name, contact_email, contact_phone, logo_url, brand_color (hex), access_mode (enum: 'cnpj_only' | 'login_required')
- `branches` (filiais): network_id (FK), cnpj, name, address (jsonb: cep, street, number, complement, neighborhood, city, state), contact_name, contact_phone, contact_email, freight_options (jsonb array: [{name, cost}])
- `branch_users` (usuários de filiais com login): branch_id (FK), email, created_at — senha via Supabase Auth, só existe se network.access_mode = 'login_required'
- `products`: name, description, sku, photo_url, price (decimal), unit, stock (integer), visible_to_networks (array de network_id, null = todas)
- `orders`: branch_id (FK), status (enum: 'new' | 'confirmed' | 'separating' | 'shipped' | 'delivered'), items (jsonb array: [{product_id, quantity, price}]), freight_option (text), freight_cost (decimal), urgent_fee (decimal), total (decimal), estimated_delivery (date), attachment_url, notes, created_at

**RLS:**
- Admin (via profiles.role = 'admin'): acesso total (T2 com auth check)
- Branch users (login_required): SELECT própria branch + INSERT orders da própria branch (T1 com branch_id match)
- Acesso CNPJ (cnpj_only): anon pode SELECT branches pelo CNPJ + INSERT orders (T3)

**Configurações globais:** tabela `settings` com min_quantity_free_shipping, urgent_fee_percentage, default_delivery_days_in_stock, default_delivery_days_out_of_stock.

## Checklist

- [ ] Criar trigger handle_new_user para profiles (user_id = auth.uid, role default = null)
- [ ] Criar tabela `networks` com campos de white-label (logo_url, brand_color, access_mode)
- [ ] Criar tabela `branches` com address (jsonb) e freight_options (jsonb array)
- [ ] Criar tabela `branch_users` para filiais com login obrigatório
- [ ] Criar tabela `products` com controle de visibilidade (visible_to_networks array)
- [ ] Criar tabela `orders` com items (jsonb), cálculos de frete/urgência, attachment_url
- [ ] Criar tabela `settings` para configurações globais do sistema
- [ ] Aplicar RLS T2 (admin full access) em todas as tabelas via profiles.role
- [ ] Aplicar RLS misto em branches/orders: T1 para branch_users autenticados + T3 para CNPJ anon
- [ ] Criar função SQL para buscar filial por CNPJ (retorna branch + network data para white-label)
