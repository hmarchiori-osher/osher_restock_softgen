---
title: "CRUD de Filiais e Produtos"
status: "todo"
priority: "high"
type: "feature"
tags: ["admin", "crud"]
created_by: "agent"
created_at: "2026-04-13T03:23:17Z"
position: 3
---

## Notes

Telas de gerenciamento de filiais (vinculadas a redes) e produtos (com controle de estoque e visibilidade).

**Filiais:** formulário com select de rede, CNPJ, nome, endereço completo (CEP com busca via ViaCEP API), contatos, array de opções de frete (nome + valor, ex: "Transportadora X - R$50", "Motoboy - R$30"). Tabela lista filiais com filtro por rede, mostra cidade/estado.

**Produtos:** formulário com nome, descrição, SKU, upload de foto (bucket `product-photos`), preço (input decimal), unidade (select: rolo, caixa, unidade), estoque atual (número inteiro), multiselect de redes (se vazio = todas). Tabela de produtos com foto thumbnail, SKU, preço, estoque, badge de visibilidade ("Todas as redes" ou "X redes").

## Checklist

- [ ] Criar /admin/branches: BranchesTable com filtro por rede, colunas: rede, CNPJ, nome, cidade/estado
- [ ] Criar BranchForm: select network, CNPJ, nome, CEP (busca ViaCEP), endereço completo, contatos
- [ ] Adicionar FreightOptionsInput: array dinâmico com nome + custo (+ adicionar linha, - remover)
- [ ] Criar branchService: CRUD + método searchByCNPJ (retorna branch + network data)
- [ ] Criar /admin/products: ProductsTable com foto, SKU, nome, preço, estoque, visibilidade
- [ ] Criar ProductForm: campos básicos, upload foto (Storage bucket `product-photos`), estoque (input number)
- [ ] Adicionar NetworkVisibilitySelect: multiselect de redes, placeholder "Todas as redes se vazio"
- [ ] Criar productService: CRUD + método getVisibleProducts(networkId) para filtrar por rede
- [ ] Criar bucket `product-photos` no Storage com policy pública para leitura
