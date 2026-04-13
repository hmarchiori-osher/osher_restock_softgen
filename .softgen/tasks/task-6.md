---
title: "Ajustes de UX Mobile + Validações Finais"
status: "todo"
priority: "medium"
type: "chore"
tags: ["ux", "validation"]
created_by: "agent"
created_at: "2026-04-13T03:23:17Z"
position: 6
---

## Notes

Refinamentos de experiência mobile, validações de formulário, mensagens de erro amigáveis, loading states.

**Mobile-first:** garantir que todo o fluxo da filial funciona perfeitamente em telas pequenas (320px+). Botões grandes, inputs com boa área de toque, cards espaçados.

**Validações:** CNPJ (14 dígitos, formato válido), email, campos obrigatórios, quantidade mínima 1 em pedidos, estoque suficiente antes de confirmar.

**Feedback:** loading spinners em uploads e submits, toasts de sucesso/erro, confirmação antes de excluir (admin), mensagens amigáveis ("CNPJ não encontrado. Entre em contato com seu fornecedor.").

**Acessibilidade:** labels em inputs, alt em imagens, contraste WCAG AA, navegação por teclado.

## Checklist

- [ ] Testar fluxo completo da filial em mobile (Chrome DevTools responsive mode)
- [ ] Adicionar validação CNPJ (algoritmo de dígito verificador) em BranchIdentification
- [ ] Adicionar validação de email em todos os formulários (regex padrão)
- [ ] Criar ErrorBoundary component para capturar erros de React e exibir fallback UI
- [ ] Adicionar loading states em uploads (FileUploader com progress bar ou spinner)
- [ ] Adicionar confirmação "Tem certeza?" antes de excluir redes/filiais/produtos (AlertDialog)
- [ ] Criar componente Toast com ícones de sucesso/erro/info (usar shadcn toast)
- [ ] Adicionar mensagem amigável quando catálogo de produtos vazio ("Nenhum produto disponível no momento")
- [ ] Verificar contraste de texto em badges de status (ajustar cores se necessário)
- [ ] Testar navegação por teclado em formulários críticos (login, montagem de pedido)
