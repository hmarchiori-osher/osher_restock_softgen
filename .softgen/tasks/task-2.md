---
title: "Dashboard Admin + CRUD de Redes"
status: "todo"
priority: "high"
type: "feature"
tags: ["admin", "dashboard"]
created_by: "agent"
created_at: "2026-04-13T03:23:17Z"
position: 2
---

## Notes

Painel de controle do fornecedor: página de login, dashboard com métricas do mês, e CRUD completo de redes com upload de logo e seletor de cor.

**Autenticação:** componente LoginForm com email + senha via authService.signIn. Redirect pra /admin após login, middleware protege rotas /admin/*.

**Dashboard:** cards com totais do mês (pedidos, faturamento), lista de pedidos pendentes (últimos 5), botão "Ver todos os pedidos".

**CRUD Redes:** formulário com nome, CNPJ (máscara), contatos, upload de logo (Supabase Storage bucket `network-logos`), color picker (hex), toggle "Modo de acesso" (CNPJ sem senha / Login obrigatório). Tabela com lista de redes, botão editar/excluir.

## Checklist

- [ ] Criar página /admin/login com LoginForm (email, senha, submit via authService)
- [ ] Criar middleware useAuth hook: verifica session, redirect se não autenticado, carrega profile.role
- [ ] Criar layout AdminLayout com sidebar: Dashboard, Redes, Filiais, Produtos, Pedidos, Configurações
- [ ] Criar /admin/dashboard: DashboardCards (total pedidos mês, pendentes, faturamento) + RecentOrders list
- [ ] Criar /admin/networks: NetworksTable (lista de redes com logo thumbnail, CNPJ, contato, modo de acesso)
- [ ] Criar NetworkForm: campos nome, CNPJ (react-input-mask), contatos, upload logo (Storage), ColorPicker (react-colorful), toggle access_mode
- [ ] Criar bucket `network-logos` no Supabase Storage com policy pública para leitura
- [ ] Criar networkService: CRUD methods (create, update, delete, list) + uploadLogo helper
- [ ] Adicionar validação CNPJ (14 dígitos, formatação) no formulário
