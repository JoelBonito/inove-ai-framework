# Caderno de Testes Final - Inove AI Framework

> **Versão:** 5.0.2
> **Data:** 2026-02-21
> **Gerado por:** Antigravity (Gemini CLI) + Claude Code (@qa-automation-engineer)
> **Base:** Auditoria Estrutural e Comportamental do Inove AI Framework

---

## Resumo de Cobertura

| Categoria | Total | Pendentes | Aprovados | Falhas | N/A |
|-----------|-------|-----------|-----------|--------|-----|
| 1. Estrutura e Integridade | 8 | 0 | 0 | 0 | 0 |
| 2. CLI/Multi-Platform | 4 | 0 | 0 | 0 | 0 |
| 3. Agentes e Skills | 4 | 0 | 0 | 0 | 0 |
| 4. Workflows e Slash Commands| 5 | 0 | 0 | 0 | 0 |
| 5. Scripts de Validacao | 3 | 0 | 0 | 0 | 0 |
| 6. Stitch MCP Enforcement | 18 | 0 | 18 | 0 | 0 |
| **TOTAL** | **42** | **0** | **18** | **0** | **0** |

---

## 1. Estrutura e Integridade

### 1.1 Arquivos e Diretórios (P0)
Verifica se as raízes do framework estão intactas.

| # | Teste | Comando/Ação | Esperado | Status |
|---|-------|--------------|----------|--------|
| 1.1.1 | Diretório Core existe | `test -d .agents` | OK | [ ] |
| 1.1.2 | Diretórios de Plugins/Agents | `test -d .agents/agents && test -d .agents/skills` | OK | [ ] |
| 1.1.3 | INSTRUCTIONS base | `test -f .agents/INSTRUCTIONS.md` | OK | [ ] |
| 1.1.4 | ARCHITECTURE documentado | `test -f .agents/ARCHITECTURE.md` | OK | [ ] |

### 1.2 Symlinks de Compatibilidade (P0)
Deve haver symlinks corretos para as multiplataformas.

| # | Teste | Comando/Ação | Esperado | Status |
|---|-------|--------------|----------|--------|
| 1.2.1 | Claude symlinks | `ls -la .claude/agents` | Aponta para `.agents/agents` | [ ] |
| 1.2.2 | Codex symlinks | `ls -la .codex/agents` | Aponta para `.agents/agents` | [ ] |
| 1.2.3 | Codex workflows | `ls -la .codex/prompts` | Aponta para `.agents/workflows` | [ ] |
| 1.2.4 | Gemini mappings | Ler configurações no `.gemini/` | Configuradas corretamente | [ ] |

---

## 2. CLI / Multi-Platform Support

### 2.1 Compatibilidade de Agentes Base (P0)

| # | Teste | Comando/Ação | Esperado | Status |
|---|-------|--------------|----------|--------|
| 2.1.1 | Claude Code inicializa | Invocar modelo Claude Code (e.g. `claude`) | Lê CLAUDE.md s/ erro | [ ] |
| 2.1.2 | Codex CLI inicializa | Executar `codex` | Lê AGENTS.md s/ erro | [ ] |
| 2.1.3 | Antigravity GEMINI | Executar Gemini | Lê GEMINI.md s/ erro | [ ] |
| 2.1.4 | Respeito à Regra Zero | Instruir agent a editar arquivo random | Agent exige aprovação | [ ] |

---

## 3. Agentes e Skills

### 3.1 Definições dos Agentes (P1)

| # | Teste | Comando/Ação | Esperado | Status |
|---|-------|--------------|----------|--------|
| 3.1.1 | Lista de Agentes | Contar `.agents/agents/*.md` | Retorna exatamente 21 | [ ] |
| 3.1.2 | Frontmatter Agentes | `cat .agents/agents/backend-specialist.md` | Contém nome e description | [ ] |
| 3.1.3 | Mapeamento de Skills | Verificar keys `skills:` no frontmatter | Lista válida no dir de skills | [ ] |

### 3.2 Estrutura das Skills (P1)

| # | Teste | Comando/Ação | Esperado | Status |
|---|-------|--------------|----------|--------|
| 3.2.1 | Diretório e SKILL.md | `test -f .agents/skills/clean-code/SKILL.md` | OK | [ ] |

---

## 4. Workflows e Slash Commands

### 4.1 Invocações (P1)

| # | Teste | Comando/Ação | Esperado | Status |
|---|-------|--------------|----------|--------|
| 4.1.1 | /debug workflow | Executar `/debug` via prompt | Entra em modo debug | [ ] |
| 4.1.2 | /readiness workflow | Executar `/readiness` via prompt | Verifica pendências | [ ] |
| 4.1.3 | /test-book workflow | Executar `/test-book` | Gera caderno de base | [ ] |
| 4.1.4 | /context workflow | Executar `/context` | Gera arquivo PROJECT_STATUS | [ ] |
| 4.1.5 | /log workflow (GEMINI) | Testar comandos de log diário | Log salvo com sucesso | [ ] |

---

## 5. Scripts de Validação Mestre

### 5.1 Verificação Python (P0)

| # | Teste | Comando/Ação | Esperado | Status |
|---|-------|--------------|----------|--------|
| 5.1.1 | Master Checklist Exec | `python3 .agents/scripts/checklist.py .` | Retorna sucesso/falhas claras | [ ] |
| 5.1.2 | Validate Installation | `python3 .agents/scripts/validate_installation.py` | "PASSED - All components" | [ ] |
| 5.1.3 | Test Framework Exect | `python3 -m pytest tests/` | Todos os testes passam | [ ] |

---

## 6. Stitch MCP Enforcement (Gate + Cobertura Total)

> **Origem:** Melhoria v5.0.2 — Enforcement mecanico do Stitch MCP no /define Fase 3.5
> **Arquivos afetados:** define.md, CLAUDE.md, GEMINI.md, AGENTS.md, INSTRUCTIONS.md

### 6.1 Consistencia Cross-File — Tabela Condicional (P0)

Valida que os 5 arquivos tem a mesma tabela de 3 cenarios (Stitch disponivel, nao disponivel, HAS_UI=false).

| # | Teste | Comando/Acao | Esperado | Status |
|---|-------|--------------|----------|--------|
| 6.1.1 | CLAUDE.md tem tabela condicional | `grep "Stitch MCP \*\*disponivel\*\*" CLAUDE.md` | Match encontrado | [x] |
| 6.1.2 | GEMINI.md tem tabela condicional | `grep "Stitch MCP \*\*disponivel\*\*" GEMINI.md` | Match encontrado | [x] |
| 6.1.3 | AGENTS.md tem tabela condicional | `grep "Stitch MCP \*\*disponivel\*\*" AGENTS.md` | Match encontrado | [x] |
| 6.1.4 | INSTRUCTIONS.md tem tabela condicional | `grep "Stitch MCP \*\*disponivel\*\*" .agents/INSTRUCTIONS.md` | Match encontrado | [x] |
| 6.1.5 | 3 cenarios em cada arquivo | Contar linhas com "HAS_UI" na secao Stitch de cada arquivo | 3 cenarios por arquivo | [x] |

### 6.2 Consistencia Cross-File — Regras de Cobertura (P0)

Valida que todos os arquivos exigem cobertura total e gate de bloqueio.

| # | Teste | Comando/Acao | Esperado | Status |
|---|-------|--------------|----------|--------|
| 6.2.1 | CLAUDE.md tem "Cobertura Total" | `grep "Regras de Cobertura Total" CLAUDE.md` | Match encontrado | [x] |
| 6.2.2 | GEMINI.md tem "Cobertura Total" | `grep "Regras de Cobertura Total" GEMINI.md` | Match encontrado | [x] |
| 6.2.3 | AGENTS.md tem "Cobertura Total" | `grep "Regras de Cobertura Total" AGENTS.md` | Match encontrado | [x] |
| 6.2.4 | INSTRUCTIONS.md tem "Cobertura Total" | `grep "Regras de Cobertura Total" .agents/INSTRUCTIONS.md` | Match encontrado | [x] |
| 6.2.5 | CLAUDE.md tem Gate de Bloqueio | `grep "Gate de Bloqueio" CLAUDE.md` | Match encontrado | [x] |
| 6.2.6 | GEMINI.md tem Gate de Bloqueio | `grep "Gate de Bloqueio" GEMINI.md` | Match encontrado | [x] |
| 6.2.7 | AGENTS.md tem Gate de Bloqueio | `grep "Gate de Bloqueio" AGENTS.md` | Match encontrado | [x] |
| 6.2.8 | INSTRUCTIONS.md tem Gate de Bloqueio | `grep "Gate de Bloqueio" .agents/INSTRUCTIONS.md` | Match encontrado | [x] |

### 6.3 Workflow /define — Gate Mecanico (P0)

Valida que o define.md tem o gate inviolavel e o processo completo de 6 passos.

| # | Teste | Comando/Acao | Esperado | Status |
|---|-------|--------------|----------|--------|
| 6.3.1 | Gate INVIOLAVEL presente | `grep "GATE DE BLOQUEIO (INVIOLAVEL)" .agents/workflows/define.md` | Match encontrado | [x] |
| 6.3.2 | Extracao de lista completa (passo 2) | `grep "Extrair lista completa de telas" .agents/workflows/define.md` | Match encontrado | [x] |
| 6.3.3 | Geracao de TODAS as telas (passo 5) | `grep "Gerar TODAS as telas via Stitch" .agents/workflows/define.md` | Match encontrado | [x] |
| 6.3.4 | Validacao de cobertura (passo 6) | `grep "Validar cobertura (OBRIGATORIO" .agents/workflows/define.md` | Match encontrado | [x] |
| 6.3.5 | Checkpoint com metricas de cobertura | `grep "Cobertura de Telas" .agents/workflows/define.md` | Match encontrado | [x] |

### 6.4 Rastreabilidade — Origem da Mudanca

| Origem | Descricao | Arquivos | Testes |
|--------|-----------|----------|--------|
| Melhoria v5.0.2 | Stitch MCP obrigatorio quando disponivel + cobertura total de telas | 5 arquivos | 6.1.x, 6.2.x, 6.3.x |

---

## Historico de Execucao

| Data | Agente Executor | Pass | Fail | N/A | Notas |
|------|-----------------|------|------|-----|-------|
| 2026-02-21 | Antigravity | - | - | - | Elaboracao do Caderno e Setup Audit |
| 2026-02-21 | Claude Code (@qa-automation-engineer) | 18 | 0 | 0 | Secao 6: Stitch MCP Enforcement (v5.0.2) |
