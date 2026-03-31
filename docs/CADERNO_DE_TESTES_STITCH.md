# Caderno de Testes: Evolucao Skill stitch-ui-design

> **Data:** 2026-03-31
> **Versao:** 1.0
> **Escopo:** Validar todas as alteracoes feitas na skill `stitch-ui-design` e ficheiros dependentes
> **Alteracoes testadas:** Expansao de 6 para 14 MCP tools, Steps 8-10, code-handoff.md, DS sync, workflows

---

## T01: Integridade dos Ficheiros Modificados

**Objetivo:** Verificar que todos os ficheiros alterados existem e tem conteudo valido.

| ID | Verificacao | Ficheiro | Resultado |
|----|-------------|----------|-----------|
| T01.1 | Ficheiro existe e nao esta vazio | `.agents/skills/stitch-ui-design/SKILL.md` | |
| T01.2 | Ficheiro existe e nao esta vazio | `.agents/skills/stitch-ui-design/code-handoff.md` | |
| T01.3 | Ficheiro existe e nao esta vazio | `.agents/skills/stitch-ui-design/design-system-integration.md` | |
| T01.4 | Ficheiro existe e nao esta vazio | `.agents/skills/stitch-ui-design/validation-checklist.md` | |
| T01.5 | Ficheiro existe e nao esta vazio | `.agents/skills/stitch-ui-design/prompt-engineering.md` | |
| T01.6 | Ficheiro existe e nao esta vazio | `.agents/skills/stitch-ui-design/wireframe-to-prompt.md` | |
| T01.7 | Ficheiro existe e nao esta vazio | `.agents/workflows/define.md` | |
| T01.8 | Ficheiro existe e nao esta vazio | `.agents/workflows/ui-ux-pro-max.md` | |
| T01.9 | Ficheiro existe e nao esta vazio | `.agents/ARCHITECTURE.md` | |

---

## T02: SKILL.md — Frontmatter

**Objetivo:** Validar que o frontmatter do SKILL.md tem todos os MCP tools declarados.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T02.1 | Campo `allowed-tools` inclui `mcp__stitch__fetch_screen_code` | Presente no frontmatter | |
| T02.2 | Campo `allowed-tools` inclui `mcp__stitch__fetch_screen_image` | Presente no frontmatter | |
| T02.3 | Campo `allowed-tools` inclui `mcp__stitch__edit_screens` | Presente no frontmatter | |
| T02.4 | Campo `allowed-tools` inclui `mcp__stitch__generate_variants` | Presente no frontmatter | |
| T02.5 | Campo `allowed-tools` inclui `mcp__stitch__create_design_system` | Presente no frontmatter | |
| T02.6 | Campo `allowed-tools` inclui `mcp__stitch__apply_design_system` | Presente no frontmatter | |
| T02.7 | Campo `allowed-tools` inclui `mcp__stitch__list_design_systems` | Presente no frontmatter | |
| T02.8 | Campo `allowed-tools` inclui `mcp__stitch__update_design_system` | Presente no frontmatter | |
| T02.9 | Total de MCP tools no frontmatter = 14 | Contar ocorrencias de `mcp__stitch__` | |
| T02.10 | Descricao atualizada menciona "extract production-ready code" | Texto no campo description | |

---

## T03: SKILL.md — Tabela de Tools (14 tools em 3 categorias)

**Objetivo:** Validar que a tabela de tools esta completa e organizada por categoria.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T03.1 | Categoria "Project Management" existe | Heading `### Project Management` | |
| T03.2 | Categoria "Screen Generation & Retrieval" existe | Heading `### Screen Generation & Retrieval` | |
| T03.3 | Categoria "Design System Management" existe | Heading `### Design System Management` | |
| T03.4 | `fetch_screen_code` marcado como **CRITICAL** | Bold ou destaque na tabela | |
| T03.5 | `fetch_screen_image` documentado | Presente na tabela Screen Generation | |
| T03.6 | `edit_screens` documentado | Presente na tabela Screen Generation | |
| T03.7 | `generate_variants` documentado | Presente na tabela Screen Generation | |
| T03.8 | 4 tools de DS documentados | create/list/apply/update na tabela DS | |
| T03.9 | Parametros de `fetch_screen_code` documentados | Secao Tool Parameters Quick Reference | |
| T03.10 | Parametros de `edit_screens` documentados | Secao Tool Parameters Quick Reference | |
| T03.11 | Parametros de `create_design_system` documentados | Secao Tool Parameters Quick Reference | |
| T03.12 | Parametros de `apply_design_system` documentados | Secao Tool Parameters Quick Reference | |

---

## T04: SKILL.md — Steps 8, 9 e 10

**Objetivo:** Validar que os novos steps existem e tem conteudo completo.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T04.1 | Step 8 existe com heading correto | `### Step 8: Fetch Generated Code` | |
| T04.2 | Step 8 menciona `fetch_screen_code` | Referencia ao tool no corpo | |
| T04.3 | Step 8 define path de output | `generated-code/{screenName}-{deviceType}.html` | |
| T04.4 | Step 8 tem template de tabela para output | Tabela markdown com Screen/Device/Code File | |
| T04.5 | Step 8 referencia `code-handoff.md` | Link ou mencao ao sub-documento | |
| T04.6 | Step 9 existe com heading correto | `### Step 9: Fetch Screen Images` | |
| T04.7 | Step 9 menciona `fetch_screen_image` | Referencia ao tool no corpo | |
| T04.8 | Step 10 existe com heading correto | `### Step 10: Iteration Protocol` | |
| T04.9 | Step 10 menciona `edit_screens` | Para mudancas parciais | |
| T04.10 | Step 10 menciona `generate_variants` | Para exploracao de alternativas | |
| T04.11 | Step 10 menciona tools de DS | create/apply_design_system | |
| T04.12 | Step 10 tem regra de re-fetch | "re-run fetch_screen_code for updated screens" | |

---

## T05: SKILL.md — Selective Reading Rule e Integration Points

**Objetivo:** Validar que as tabelas de referencia foram atualizadas.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T05.1 | `code-handoff.md` listado na Selective Reading Rule | Linha na tabela com status Optional | |
| T05.2 | Integration Points menciona "generated code" | Texto atualizado para frontend-specialist | |
| T05.3 | Integration Points tem linha "Stitch Design System" | Nova linha na tabela | |
| T05.4 | Integration Points marca DS como "Bidirectional" | Direction = Bidirectional | |
| T05.5 | Output Document Template tem secao "Generated Code" | Secao com tabela Screen/Device/Code File | |
| T05.6 | Output Document Template tem secao "Stitch Design System" | Secao com DS ID/Name/Applied screens | |

---

## T06: code-handoff.md (Ficheiro Novo)

**Objetivo:** Validar estrutura e conteudo do novo sub-documento.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T06.1 | Ficheiro existe em `.agents/skills/stitch-ui-design/` | Path correto | |
| T06.2 | Tem secao "Extraction Protocol" | Heading presente | |
| T06.3 | Tem secao "Code Quality Assessment" | Tabela com aspectos e % qualidade | |
| T06.4 | Tem secao "Conversion Protocol: HTML to React" | Steps 1-6 documentados | |
| T06.5 | Step 1: Structural Extraction | Identificar layout sections | |
| T06.6 | Step 2: Component Decomposition | Arvore de decomposicao | |
| T06.7 | Step 3: Token Alignment | Tabela Stitch Output -> Replace With | |
| T06.8 | Step 4: Add Interactivity | Lista de state/handlers/forms | |
| T06.9 | Step 5: Accessibility Pass | Checklist com items marcaveis | |
| T06.10 | Step 6: TypeScript Types | Exemplo de interface/types | |
| T06.11 | Tem secao "Handoff Checklist" | Checklist final | |
| T06.12 | Tem secao "Anti-Patterns" | Lista de DO NOT | |

---

## T07: design-system-integration.md — Stitch DS Management

**Objetivo:** Validar a nova secao de gestao de Design Systems no Stitch.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T07.1 | Secao "Stitch Design System Management" existe | Heading presente | |
| T07.2 | Tabela de tools com 4 entradas | list/create/apply/update | |
| T07.3 | Diagrama de Sync Protocol existe | Fluxo visual com setas | |
| T07.4 | Tabela "When to Create" por workflow | /define, /ui-ux-pro-max, Manual | |
| T07.5 | Secao "How to Create" com passos | 4 passos sequenciais | |
| T07.6 | Secao "When to Update" | Triggers de atualizacao | |
| T07.7 | Regra "One DS per project" | Consistency Rules presentes | |
| T07.8 | Regra "DS doc is source of truth" | Hierarquia clara | |

---

## T08: validation-checklist.md — Novas Seccoes

**Objetivo:** Validar que os novos checks de validacao foram adicionados.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T08.1 | Secao "5. Code Extraction" existe | Heading `## 5. Code Extraction` | |
| T08.2 | Check "Code fetched for all approved screens" | Linha na tabela | |
| T08.3 | Check "Code files are valid HTML" | Linha na tabela | |
| T08.4 | Check "Output document has code links" | Linha na tabela | |
| T08.5 | Secao "6. Design System Sync" existe | Heading `## 6. Design System Sync` | |
| T08.6 | Check "Stitch DS exists" | Linha na tabela | |
| T08.7 | Check "DS applied to all screens" | Linha na tabela | |
| T08.8 | Check "DS tokens match doc" | Linha na tabela | |
| T08.9 | Nota de condicionalidade da secao 6 | "Only applies when DS doc exists" | |
| T08.10 | Quick Validation inclui "Code extracted" | Item adicionado a checklist minima | |

---

## T09: Workflow /define — Fase 3.5

**Objetivo:** Validar que os novos passos foram adicionados ao workflow.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T09.1 | Passo 8 existe apos passo 7 | Texto "Extrair codigo gerado" | |
| T09.2 | Passo 8 menciona `fetch_screen_code` | Tool referenciado | |
| T09.3 | Passo 8 define mkdir para `generated-code` | Comando mkdir presente | |
| T09.4 | Passo 9 existe | Texto "Salvar imagens de referencia" | |
| T09.5 | Passo 9 menciona `fetch_screen_image` | Tool referenciado | |
| T09.6 | Passo 9 define mkdir para `images` | Comando mkdir presente | |

---

## T10: Workflow /ui-ux-pro-max — Step 2c

**Objetivo:** Validar que os novos passos foram adicionados ao workflow.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T10.1 | Passo 5 menciona `edit_screens` | Para iteracao parcial | |
| T10.2 | Passo 5 menciona `generate_variants` | Para explorar alternativas | |
| T10.3 | Passo 6 "Sync Stitch Design System" existe | Heading ou numero | |
| T10.4 | Passo 6 menciona `list_design_systems` | Check antes de criar | |
| T10.5 | Passo 6 menciona `create_design_system` | Criar se nao existir | |
| T10.6 | Passo 6 menciona `apply_design_system` | Aplicar a cada screen | |
| T10.7 | Passo 7 "Extract code" existe | Heading ou numero | |
| T10.8 | Passo 7 menciona `fetch_screen_code` | Tool referenciado | |

---

## T11: ARCHITECTURE.md

**Objetivo:** Validar que a descricao da skill foi atualizada.

| ID | Verificacao | Criterio | Resultado |
|----|-------------|----------|-----------|
| T11.1 | Descricao de `stitch-ui-design` menciona "14 MCP tools" | Texto atualizado | |
| T11.2 | Descricao menciona "code-handoff" | Sub-doc listado | |
| T11.3 | Descricao menciona "production-ready code" | Capacidade documentada | |

---

## T12: Consistencia de Referencias Cruzadas

**Objetivo:** Validar que todos os ficheiros se referenciam corretamente entre si.

| ID | Verificacao | De | Para | Resultado |
|----|-------------|-----|------|-----------|
| T12.1 | SKILL.md referencia code-handoff.md | SKILL.md Selective Reading | code-handoff.md | |
| T12.2 | SKILL.md referencia design-system-integration.md | Step 10 | design-system-integration.md | |
| T12.3 | Step 8 referencia code-handoff.md | SKILL.md Step 8 | code-handoff.md | |
| T12.4 | code-handoff.md referencia frontend-specialist | Handoff Checklist | @frontend-specialist | |
| T12.5 | design-system-integration.md referencia tools de DS | Sync Protocol | 4 tools MCP | |
| T12.6 | validation-checklist.md referencia Step 8 | Secao 5 | generated-code/ path | |
| T12.7 | /define referencia fetch_screen_code | Passo 8 | mcp__stitch__fetch_screen_code | |
| T12.8 | /ui-ux-pro-max referencia DS tools | Passo 6 | list/create/apply_design_system | |

---

## T13: Nomes de MCP Tools (Match com Runtime)

**Objetivo:** Validar que todos os nomes de tools MCP na documentacao correspondem aos tools reais disponiveis.

| ID | Tool Documentado | Tool Real Esperado | Resultado |
|----|------------------|--------------------|-----------|
| T13.1 | `mcp__stitch__create_project` | Disponivel no runtime | |
| T13.2 | `mcp__stitch__list_projects` | Disponivel no runtime | |
| T13.3 | `mcp__stitch__get_project` | Disponivel no runtime | |
| T13.4 | `mcp__stitch__list_screens` | Disponivel no runtime | |
| T13.5 | `mcp__stitch__get_screen` | Disponivel no runtime | |
| T13.6 | `mcp__stitch__generate_screen_from_text` | Disponivel no runtime | |
| T13.7 | `mcp__stitch__fetch_screen_code` | Disponivel no runtime | |
| T13.8 | `mcp__stitch__fetch_screen_image` | Disponivel no runtime | |
| T13.9 | `mcp__stitch__edit_screens` | Disponivel no runtime | |
| T13.10 | `mcp__stitch__generate_variants` | Disponivel no runtime | |
| T13.11 | `mcp__stitch__create_design_system` | Disponivel no runtime | |
| T13.12 | `mcp__stitch__apply_design_system` | Disponivel no runtime | |
| T13.13 | `mcp__stitch__list_design_systems` | Disponivel no runtime | |
| T13.14 | `mcp__stitch__update_design_system` | Disponivel no runtime | |

---

## Resumo de Execucao

| Grupo | Total Testes | Pass | Fail | Skip |
|-------|-------------|------|------|------|
| T01: Integridade Ficheiros | 9 | | | |
| T02: Frontmatter | 10 | | | |
| T03: Tabela Tools | 12 | | | |
| T04: Steps 8-10 | 12 | | | |
| T05: Reading Rule + Integration | 6 | | | |
| T06: code-handoff.md | 12 | | | |
| T07: DS Integration | 8 | | | |
| T08: Validation Checklist | 10 | | | |
| T09: /define Fase 3.5 | 6 | | | |
| T10: /ui-ux-pro-max Step 2c | 8 | | | |
| T11: ARCHITECTURE.md | 3 | | | |
| T12: Refs Cruzadas | 8 | | | |
| T13: MCP Tools Match | 14 | | | |
| **TOTAL** | **118** | | | |

---

**Executado por:** _pendente_
**Data de execucao:** _pendente_
**Veredicto:** _pendente_
