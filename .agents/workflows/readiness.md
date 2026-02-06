---
description: Valida se toda a documentação está completa e alinhada antes de iniciar implementação. Gera relatório de prontidão.
---

# Workflow: /readiness

> **Propósito:** Verificar que TODA a documentação necessária existe, está completa e alinhada antes de escrever qualquer código.

## Quando Usar

Execute `/readiness` APÓS completar o `/define` e ANTES de começar a implementação.

## Regras Críticas

1. **NÃO APROVE** se houver gaps críticos
2. **DOCUMENTE** todas as inconsistências encontradas
3. **SUGIRA CORREÇÕES** para cada problema
4. **GERE RELATÓRIO** estruturado ao final

---

## Fluxo de Execução

### Fase 1: Inventário de Documentos

Verifique a existência de todos os documentos obrigatórios:

```markdown
## 📋 Inventário de Documentos

### Documentos Core (Obrigatórios)
| Documento | Path | Status |
|-----------|------|--------|
| Product Brief | `docs/01-Planejamento/01-product-brief.md` | ✅ Encontrado / ❌ Faltando |
| PRD | `docs/01-Planejamento/02-prd.md` | ✅ / ❌ |
| UX Concept | `docs/01-Planejamento/03-ux-concept.md` | ✅ / ❌ |
| Architecture | `docs/01-Planejamento/04-architecture.md` | ✅ / ❌ |
| Security | `docs/01-Planejamento/05-security.md` | ✅ / ❌ |
| Stack | `docs/01-Planejamento/06-stack.md` | ✅ / ❌ |
| Design System | `docs/01-Planejamento/07-design-system.md` | ✅ / ❌ |
| Backlog | `docs/BACKLOG.md` | ✅ / ❌ |

### Documentos Complementares (Recomendados)
| Documento | Path | Status |
|-----------|------|--------|
| User Journeys | `docs/01-Planejamento/user-journeys.md` | ✅ / ❌ / ⚠️ Não criado |
| Project Context | `docs/PROJECT-CONTEXT.md` | ✅ / ❌ / ⚠️ Não criado |
| Readiness | `docs/01-Planejamento/IMPLEMENTATION-READINESS.md` | ✅ / ❌ / ⚠️ Não criado |

### Resultado do Inventário
- **Documentos obrigatórios:** X/8 ✅
- **Documentos complementares:** Y/3 ✅
- **Status:** ✅ Completo / ⚠️ Parcial / ❌ Incompleto
```

---

### Fase 2: Validação de Cobertura (Rastreabilidade)

Verifique se TODOS os requisitos funcionais têm cobertura no backlog:

```markdown
## 🔗 Validação de Rastreabilidade

### Matriz FR → Epic → Story

| Requisito | Descrição | Epic | Story | Status |
|-----------|-----------|------|-------|--------|
| RF01 | [Descrição curta] | Epic 1 | Story 1.1 | ✅ Coberto |
| RF02 | [Descrição curta] | Epic 1 | Story 1.2 | ✅ Coberto |
| RF03 | [Descrição curta] | - | - | ❌ SEM COBERTURA |
| RF04 | [Descrição curta] | Epic 2 | Story 2.1, 2.2 | ✅ Coberto |
| ... | ... | ... | ... | ... |

### Estatísticas
- **Total de FRs:** {N}
- **FRs cobertos:** {X}
- **FRs sem cobertura:** {Y}
- **Cobertura:** {X/N * 100}%

### FRs Sem Cobertura (Ação Necessária)
1. **RF03:** [Descrição]
   - **Sugestão:** Criar Story no Epic X para cobrir este requisito

### Stories Órfãs (Sem FR correspondente)
| Story | Descrição | Ação Sugerida |
|-------|-----------|---------------|
| Story 3.5 | [Desc] | Vincular a RF existente ou remover |
```

---

### Fase 3: Validação de Qualidade

Verifique se cada documento atende aos padrões de qualidade:

```markdown
## 📊 Validação de Qualidade

### 3.1 Product Brief
| Critério | Status | Observação |
|----------|--------|------------|
| Visão do produto clara | ✅ / ❌ | |
| Problema específico (não genérico) | ✅ / ❌ | |
| Personas com detalhes concretos | ✅ / ❌ | |
| Métricas de sucesso quantificadas | ✅ / ❌ | Ex: "< 3 dias" não apenas "rápido" |
| Anti-persona definida | ✅ / ❌ / ⚠️ | |
| Riscos identificados | ✅ / ❌ | |

### 3.2 PRD
| Critério | Status | Observação |
|----------|--------|------------|
| Todos FRs têm ID único | ✅ / ❌ | RF01, RF02, ... |
| Todos FRs têm prioridade (P0/P1/P2) | ✅ / ❌ | |
| Acceptance Criteria em formato BDD | ✅ / ❌ | Given/When/Then |
| Casos de borda documentados | ✅ / ❌ | |
| Requisitos não-funcionais presentes | ✅ / ❌ | Performance, Segurança, etc. |
| Fluxos de usuário com diagramas | ✅ / ❌ | Mermaid ou descrição |
| Integrações especificadas | ✅ / ❌ / N/A | |

### 3.3 Design System
| Critério | Status | Observação |
|----------|--------|------------|
| Paleta de cores com Hex | ✅ / ❌ | |
| Escala tipográfica completa | ✅ / ❌ | |
| Espaçamento definido | ✅ / ❌ | |
| Componentes base documentados | ✅ / ❌ | Buttons, Inputs, Cards, Modal |
| Estados de componentes | ✅ / ❌ | Hover, Focus, Disabled, Loading |
| Breakpoints responsivos | ✅ / ❌ | |
| Acessibilidade considerada | ✅ / ❌ | Contraste, ARIA |

### 3.4 Database Design
| Critério | Status | Observação |
|----------|--------|------------|
| Diagrama ER presente | ✅ / ❌ | Mermaid ou similar |
| Todas entidades com campos tipados | ✅ / ❌ | |
| Constraints documentadas | ✅ / ❌ | NOT NULL, UNIQUE, etc. |
| Índices planejados | ✅ / ❌ | |
| Relacionamentos claros | ✅ / ❌ | 1:N, N:N com FKs |
| Security Rules/RLS definidas | ✅ / ❌ | |
| Migrations planejadas | ✅ / ❌ | |

### 3.5 Backlog
| Critério | Status | Observação |
|----------|--------|------------|
| Épicos com objetivo claro | ✅ / ❌ | |
| Stories no formato "Como...quero...para" | ✅ / ❌ | |
| Todas stories têm Acceptance Criteria | ✅ / ❌ | |
| Subtarefas técnicas definidas | ✅ / ❌ | |
| Dependências entre stories mapeadas | ✅ / ❌ | |
| Ordem de execução sugerida | ✅ / ❌ | |
```

---

### Fase 4: Validação de Alinhamento

Verifique consistência entre documentos:

```markdown
## 🔄 Validação de Alinhamento

### PRD ↔ Product Brief
| Aspecto | Brief | PRD | Alinhado? |
|---------|-------|-----|-----------|
| Público-alvo | [Persona X] | [Mesma persona em FRs] | ✅ / ❌ |
| Funcionalidades core | [Lista] | [FRs correspondentes] | ✅ / ❌ |
| Métricas de sucesso | [KPIs] | [RNFs correspondentes] | ✅ / ❌ |

### PRD ↔ Database
| Aspecto | PRD | Database | Alinhado? |
|---------|-----|----------|-----------|
| RF01: [Cadastro de X] | Descreve campos A, B, C | Tabela X tem A, B, C | ✅ / ❌ |
| RF05: [Relatório de Y] | Precisa de dados Z | Índice em Z existe | ✅ / ❌ |

### PRD ↔ Design System
| Aspecto | PRD | Design | Alinhado? |
|---------|-----|--------|-----------|
| RF03: Modal de confirmação | Menciona modal | Modal spec existe | ✅ / ❌ |
| RF07: Tabela paginada | Menciona tabela | Table + Pagination specs | ✅ / ❌ |

### Design ↔ Backlog
| Componente | Design System | Story Correspondente | Alinhado? |
|------------|---------------|---------------------|-----------|
| Button Primary | Documentado | Story X.Y menciona | ✅ / ❌ |
| StatsCard | Documentado | Story X.Y menciona | ✅ / ❌ |

### Inconsistências Encontradas
| # | Tipo | Documento A | Documento B | Problema | Sugestão |
|---|------|-------------|-------------|----------|----------|
| 1 | Desalinhamento | PRD RF06 | Backlog | RF06 marcado P1 no PRD, adiado no Backlog | Atualizar prioridade no PRD |
| 2 | Campo faltando | PRD RF09 | Database | RF09 menciona LTV, Database não tem campo | Adicionar campo calculado |
```

---

### Fase 5: Validação de Completude de Stories

Verifique se cada story está pronta para implementação:

```markdown
## ✅ Validação de Stories (Dev-Ready)

### Checklist por Story

#### Story 1.1: [Título]
| Critério | Status |
|----------|--------|
| Descrição clara (Como/Quero/Para) | ✅ / ❌ |
| Acceptance Criteria em BDD | ✅ / ❌ |
| Subtarefas técnicas definidas | ✅ / ❌ |
| Dependências identificadas | ✅ / ❌ |
| Componentes UI mapeados no Design System | ✅ / ❌ |
| Entidades de dados mapeadas no Database | ✅ / ❌ |
| **Status:** | ✅ Dev-Ready / ⚠️ Precisa Ajustes |

#### Story 1.2: [Título]
[Mesmo formato]

### Resumo de Stories
| Status | Quantidade | Percentual |
|--------|------------|------------|
| ✅ Dev-Ready | X | Y% |
| ⚠️ Precisa Ajustes | Z | W% |
| ❌ Não Pronta | N | M% |
```

---

### Fase 6: Relatório Final

Gere o relatório consolidado:

```markdown
# 📋 Implementation Readiness Report

**Projeto:** {Nome do Projeto}
**Data:** {YYYY-MM-DD}
**Gerado por:** AI Project Validator

---

## Executive Summary

| Categoria | Score | Status |
|-----------|-------|--------|
| Inventário de Docs | X/5 | ✅ / ⚠️ / ❌ |
| Cobertura de FRs | Y% | ✅ / ⚠️ / ❌ |
| Qualidade dos Docs | Z/20 critérios | ✅ / ⚠️ / ❌ |
| Alinhamento | W inconsistências | ✅ / ⚠️ / ❌ |
| Stories Dev-Ready | N% | ✅ / ⚠️ / ❌ |

---

## Status Geral

### ✅ PRONTO PARA IMPLEMENTAÇÃO
*Todos os critérios foram atendidos. O projeto pode iniciar a fase de desenvolvimento.*

### ⚠️ PRONTO COM RESSALVAS
*O projeto pode iniciar, mas os seguintes pontos devem ser resolvidos durante o desenvolvimento:*
1. [Issue menor 1]
2. [Issue menor 2]

### ❌ NÃO PRONTO - BLOQUEADORES
*Os seguintes problemas DEVEM ser resolvidos antes de iniciar:*
1. **[Bloqueador 1]:** [Descrição + Ação necessária]
2. **[Bloqueador 2]:** [Descrição + Ação necessária]

---

## Issues Detalhados

### Críticos (Bloqueadores) 🔴
| # | Problema | Impacto | Ação Necessária |
|---|----------|---------|-----------------|
| 1 | [Descrição] | [Alto/Médio] | [O que fazer] |

### Importantes (Devem ser resolvidos) 🟡
| # | Problema | Impacto | Ação Necessária |
|---|----------|---------|-----------------|
| 1 | [Descrição] | [Médio] | [O que fazer] |

### Menores (Nice to fix) 🟢
| # | Problema | Impacto | Ação Sugerida |
|---|----------|---------|---------------|
| 1 | [Descrição] | [Baixo] | [Sugestão] |

---

## Próximos Passos

### Se PRONTO:
1. Rodar `/track` para inicializar tracking
2. Começar com `implementar Story 1.1`
3. Seguir ordem de execução sugerida no Backlog

### Se NÃO PRONTO:
1. Resolver bloqueadores listados acima
2. Atualizar documentação correspondente
3. Rodar `/readiness` novamente

---

## Changelog do Relatório

| Data | Versão | Mudanças |
|------|--------|----------|
| {YYYY-MM-DD} | 1.0 | Relatório inicial |
```

**Output:** Salvar em `docs/01-Planejamento/IMPLEMENTATION-READINESS.md`

---

## Pós-Execução

```markdown
## Relatório de Prontidão Gerado!

📄 Arquivo: `docs/01-Planejamento/IMPLEMENTATION-READINESS.md`

### Resultado: [STATUS]

[Se PRONTO]
✅ Documentação completa e alinhada!
🚀 Você pode iniciar a implementação com `implementar Story 1.1`

[Se NÃO PRONTO]
❌ Foram encontrados {N} bloqueadores que precisam ser resolvidos.
📝 Revise o relatório e corrija os issues listados.
🔄 Após correções, rode `/readiness` novamente.
```
