---
title: "Portal Público da Filial - Fluxo de Pedido"
status: "done"
priority: "urgent"
type: "feature"
tags: ["filial", "public", "pedido"]
created_by: "agent"
created_at: "2026-04-13T03:23:17Z"
position: 5
---

## Notes

Portal público white-label para filiais fazerem pedidos. 4 etapas: identificação, montagem, resumo, confirmação.

**White-label:** Logo + cor da marca da rede em todas as páginas (etapas 2-4). Dados extraídos de `networks.logo_url` e `networks.brand_color`.

**CNPJ vs Login:** Verificar `access_mode` da filial. Se `cnpj_only` → autocomplete CNPJ. Se `login_required` → tela de login.

**Último pedido:** Pré-preencher quantidades com o último pedido da filial (buscar `orders` filtrado por `branch_id` ordenado por `created_at DESC`).

## Checklist

- [x] Etapa 1 - Identificação: campo CNPJ com autocomplete em tempo real, confirmação de dados mascarados (LGPD)
- [x] Etapa 2 - Montagem: catálogo filtrado por rede, quantidades, indicadores de estoque, urgência, upload
- [x] Etapa 3 - Resumo: itens, frete, taxa urgência, total, prazo, observações, confirmar
- [x] Etapa 4 - Confirmação: número pedido, resumo, mensagem email
- [x] White-label: aplicar logo + cor da rede nas etapas 2-4
- [x] Pré-preenchimento: buscar último pedido e popular quantidades
- [x] Persistir carrinho: sessionStorage entre etapas