# Osher Restock — Portal B2B de Pedidos

## Visão
SaaS B2B para fornecedores de insumos (etiquetas, ribbons) gerenciarem pedidos de redes de varejo. Redes cadastram filiais, filiais fazem pedidos pelo portal — white-label com logo e cores da marca de cada rede. Mobile-first, fluxo simplificado (2 minutos do CNPJ ao pedido confirmado).

**Público:** Fornecedor (admin) + gerentes de filiais de redes varejistas (usuário final sem conhecimento técnico).

## Design

Profissionalismo B2B com toque white-label. Painel admin denso/funcional, portal da filial ultra-limpo/mobile-first.

**Paleta:**
- `--primary: 217 91% 40%` (azul profissional #1E40AF)
- `--accent: 160 84% 39%` (verde confirmação #10B981)
- `--background: 0 0% 98%` (cinza bem claro)
- `--foreground: 222 47% 11%` (azul marinho escuro)
- `--muted: 214 32% 91%` (azul acinzentado claro)
- `--card: 0 0% 100%` (branco)

**Tipografia:**
- Heading: **Plus Jakarta Sans** (600/700) — clean, tech, profissional
- Body: **Work Sans** (400/500) — legibilidade em mobile, neutro

**Direção de estilo:** Interface SaaS moderna com hierarquia clara. Admin = dashboard denso com tabelas, filtros, métricas. Portal da filial = cards grandes, botões destacados, poucos campos por tela. White-label = logo do cliente no topo + accent color dinâmico (sobrescreve `--primary` quando rede define cor da marca).

## Features

**Admin (retaguarda):**
- Autenticação email/senha
- Dashboard: métricas do mês, pedidos pendentes, últimas atividades
- CRUD Redes: nome, CNPJ matriz, contato, logo (upload), cor da marca (hex), modo de acesso (toggle: "CNPJ sem senha" vs "Login com senha")
- CRUD Filiais: vinculada a rede, CNPJ, nome, endereço completo, contato, opções de frete disponíveis (multiselect + valores)
- CRUD Produtos: nome, descrição, SKU, foto, preço, unidade, estoque atual, visibilidade (multiselect de redes)
- Gestão de Pedidos: lista com filtros (rede/filial/status/data), detalhes, anexo, atualizar status (Novo → Confirmado → Em separação → Enviado → Entregue)
- Configurações: quantidade mínima frete grátis, taxa urgência, prazos padrão

**Filial (portal público):**
- Etapa 1 — Identificação: se rede = "sem senha" → autocomplete CNPJ + confirmação de dados; se rede = "com senha" → login email/senha. Link direto opcional (pular etapa).
- Etapa 2 — Montagem do pedido: catálogo de produtos da rede, pré-preenchido com último pedido (se existir), indicadores de estoque (em estoque/sob encomenda), opção urgência, upload de arquivo (pedido de compra).
- Etapa 3 — Resumo: itens, frete, taxa urgência, total, prazo estimado, observações, confirmar.
- Etapa 4 — Confirmação: número do pedido, resumo, mensagem de email.
- White-label: logo + cor da rede em todas as páginas do fluxo (etapas 2-4).
