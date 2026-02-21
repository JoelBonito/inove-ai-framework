# Caderno de Testes Final - Inove AI Framework

> **Versão:** 5.0
> **Data:** 2026-02-21
> **Gerado por:** Antigravity (Gemini CLI)
> **Base:** Auditoria Estrutural e Comportamental do Inove AI Framework

---

## 📋 Resumo de Cobertura

| Categoria | Total | Pendentes | Aprovados | Falhas | N/A |
|-----------|-------|-----------|-----------|--------|-----|
| 1. Estrutura e Integridade | 8 | 8 | 0 | 0 | 0 |
| 2. CLI/Multi-Platform | 4 | 4 | 0 | 0 | 0 |
| 3. Agentes e Skills | 4 | 4 | 0 | 0 | 0 |
| 4. Workflows e Slash Commands| 5 | 5 | 0 | 0 | 0 |
| 5. Scripts de Validação | 3 | 3 | 0 | 0 | 0 |
| **TOTAL** | **24** | **24** | **0** | **0** | **0** |

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

## Histórico de Execução

| Data | Agente Executor | Pass | Fail | N/A | Notas |
|------|-----------------|------|------|-----|-------|
| 2026-02-21 | Antigravity | - | - | - | Elaboração do Caderno e Setup Audit |
