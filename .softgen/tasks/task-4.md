---
title: "Gestão de Pedidos (Admin)"
status: "todo"
priority: "high"
type: "feature"
tags: ["admin", "orders"]
created_by: "agent"
created_at: "2026-04-13T03:23:17Z"
position: 4
---

## Notes

Painel de pedidos do fornecedor: lista com filtros, detalhes do pedido, atualização de status, download de anexos.

**Lista de pedidos:** tabela com colunas: número, data, rede, filial, status (badge colorido), total. Filtros: rede (select), filial (select dependente), status (multiselect), período (date range). Ordenação padrão: mais recentes primeiro.

**Detalhes:** modal ou página separada mostrando: dados da filial (nome, endereço, contato), itens do pedido (tabela: produto, quantidade, preço unit, subtotal), frete selecionado + custo, taxa urgência (se aplicável), observações, arquivo anexado (link para download/preview), prazo estimado. Botão "Atualizar Status" com select dos 5 status possíveis.

**Configurações:** formulário simples com quantidade mínima para frete grátis, taxa de urgência (percentual), prazos padrão (em estoque, sob encomenda).

## Checklist

- [ ] Criar /admin/orders: OrdersTable com filtros (rede, filial, status, data) e paginação
- [ ] Criar OrderFilters component: selects de rede/filial (cascata), status, DateRangePicker
- [ ] Criar OrderDetails: visualização completa do pedido, itens em tabela, totais destacados
- [ ] Adicionar AttachmentViewer: download/preview de PDF ou imagem anexada (link do Storage)
- [ ] Criar OrderStatusUpdater: select de status + botão salvar, badge colorido atual
- [ ] Criar orderService: list com filtros, getById, updateStatus, desconta estoque ao confirmar
- [ ] Criar /admin/settings: SettingsForm com min_quantity_free_shipping, urgent_fee_percentage, prazos
- [ ] Criar settingsService: getSingleRow, update (upsert) — tabela settings tem 1 linha só
- [ ] Adicionar notificação ao admin via email quando novo pedido entra (Supabase trigger ou Edge Function)
