---
title: "Fluxo Público da Filial (4 Etapas + White-label)"
status: "todo"
priority: "high"
type: "feature"
tags: ["public", "white-label"]
created_by: "agent"
created_at: "2026-04-13T03:23:17Z"
position: 5
---

## Notes

Portal público para filiais fazerem pedidos. 4 etapas mobile-first com white-label (logo + cor da rede). Suporta 2 modos de acesso: CNPJ direto ou login com senha.

**Etapa 1 — Identificação:**
- Se network.access_mode = 'cnpj_only': campo CNPJ com autocomplete em tempo real (busca filiais ao digitar, mostra CNPJ + nome + cidade), exibe dados completos para confirmar ("É você?"). Alternativa: link direto /pedido/[cnpj] pula essa etapa.
- Se network.access_mode = 'login_required': LoginForm (email + senha) via authService, session identifica branch, pula pra etapa 2.

**Etapa 2 — Montagem do pedido:**
- Carrega produtos visíveis para a rede da filial
- Se filial tem pedidos anteriores: pré-preenche com último pedido (productService.getLastOrder)
- Cada produto: card com foto, nome, descrição, preço, badge de estoque (🟢 Em estoque 2 dias / 🟡 Sob encomenda 5-7 dias), input quantidade (+ / -)
- Checkbox "Entrega urgente" (só se todos os produtos em estoque), mostra taxa
- Upload de arquivo (pedido de compra): botão + preview
- White-label: logo da rede no topo, accent color = network.brand_color (se definido)

**Etapa 3 — Resumo:**
- Lista de itens selecionados, subtotais
- Select de frete (opções da filial), calcula frete grátis automaticamente
- Resumo de valores: subtotal, frete, taxa urgência, TOTAL
- Prazo estimado (calcula baseado em estoque + urgência)
- Textarea de observações
- Botão "Confirmar Pedido" (accent color)

**Etapa 4 — Confirmação:**
- "Pedido enviado com sucesso!" (ícone check verde)
- Número do pedido (#0001234)
- Resumo rápido: total, prazo estimado
- Mensagem: "Você receberá um email com os detalhes"
- Botão "Fazer novo pedido" (volta pra etapa 1)

## Checklist

- [ ] Criar /pedido (etapa 1): BranchIdentification com campo CNPJ autocomplete (debounce 300ms, busca por CNPJ parcial)
- [ ] Criar BranchLoginForm para redes com login obrigatório, authService branch login
- [ ] Criar rota dinâmica /pedido/[cnpj] que valida CNPJ e redireciona pra etapa 2 (pula identificação)
- [ ] Criar /pedido/montar (etapa 2): ProductCatalog com cards de produtos, estoque badges, quantity inputs
- [ ] Adicionar LastOrderLoader: busca último pedido da filial, pré-preenche quantidades se existir
- [ ] Criar UrgentDeliveryToggle: checkbox com cálculo de taxa, só ativo se todos produtos em estoque
- [ ] Adicionar FileUploader: upload pra Storage bucket `order-attachments`, preview de arquivo
- [ ] Criar /pedido/resumo (etapa 3): OrderSummary com itens, FreightSelector, cálculo automático de totais
- [ ] Adicionar função calculateEstimatedDelivery(items, isUrgent) baseada em estoque + settings
- [ ] Criar /pedido/confirmado (etapa 4): ConfirmationScreen com número do pedido, resumo, botão novo pedido
- [ ] Criar orderService.createOrder: insert na tabela, desconta estoque (transaction), upload de attachment
- [ ] Implementar WhiteLabelProvider: context carrega network data (logo_url, brand_color) após identificar filial, injeta CSS variable `--accent` dinamicamente
- [ ] Adicionar NetworkLogo component: exibe logo da rede no topo de todas as páginas do fluxo (etapas 2-4)
- [ ] Criar bucket `order-attachments` no Storage com policy de leitura para admins + write anon
