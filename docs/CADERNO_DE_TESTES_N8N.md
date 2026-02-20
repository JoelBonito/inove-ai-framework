# Caderno de Testes - n8n Automation Squad

> **Versão:** 1.0 (Implementação Híbrida)
> **Data:** 2026-02-19
> **Gerado por:** `@test-engineer`
> **Origem:** `docs/n8n-squad-implementation-plan.md`

---

## Sumário Executivo
Este caderno de testes valida a integridade, o roteamento e a capacidade de execução do **Squad Híbrido de Automação n8n** adicionado ao Inove AI Framework.

### Resumo de Cobertura

| Categoria | Total de Testes | Pendentes | Aprovados | Falhas | N/A |
|-----------|-----------------|-----------|-----------|--------|-----|
| 1. Auto-Roteamento (Híbrido) | 3 | 0 | 3 | 0 | 0 |
| 2. Integridade dos Arquivos | 4 | 0 | 4 | 0 | 0 |
| 3. Carga do Agente e Skills | 3 | 0 | 3 | 0 | 0 |
| 4. Setup e Scripts | 2 | 0 | 2 | 0 | 0 |
| **TOTAL** | **12** | **0** | **12** | **0** | **0** |

---

## 1. Auto-Roteamento e Squad Manager (Híbrido)

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 1.1 | Detecção de Palavra-chave | Framework em repouso | 1. Enviar prompt com palavra "n8n" ou "webhook" | O `intelligent-routing` intercepta o pedido e invoca o `auto-activate` | [x] |
| 1.2 | Execução Silenciosa CLI | CLI acessível | 1. Executar `python .agents/scripts/squad_manager.py auto-activate n8n-automation` | O script não deve emitir "stdout" no terminal e deve criar os symlinks | [x] |
| 1.3 | Rejeição Inteligente | Squad ativo | 1. Executar `auto-activate` novamente | Script valida arquivo já existente e retorna saída silenciosa de sucesso (exit 0) | [x] |

---

## 2. Integridade dos Arquivos (Estrutura Modular)

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 2.1 | Manifest `.yaml` Válido | Ferramenta `squad_manager` | 1. Rodar `python .agents/scripts/squad_manager.py validate n8n-automation` | Resposta: "VALID: All checks passed." | [x] |
| 2.2 | Agente n8n-specialist | Arquivos em disco | 1. Verificar `/agents/n8n-specialist.md` | O arquivo contém frontmatter completo com dependency de `mcp-builder` e `n8n-orchestration` | [x] |
| 2.3 | Skill Dividida | Arquivos em disco | 1. Verificar diretório de skills | Existem 6 arquivos markdown de suporte (ex: `workflow-patterns.md`) | [x] |
| 2.4 | Workflows do n8n | Arquivos em disco | 1. Listar diretório `/workflows/` | Estão presentes `n8n-setup.md`, `n8n-scaffold.md` e `n8n-debug.md` | [x] |

---

## 3. Carga do Agente e Conhecimento (Regras de Negócio)

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 3.1 | Compreensão da Sintaxe JS | Squad n8n ativado | 1. Pedir ao n8n-specialist para escrever um Code Node | O Output DEVE retornar `[{json: {...}}]` obrigatóriamente | [x] |
| 3.2 | Compreensão do Webhook | Squad n8n ativado | 1. Pedir a extração de dados de um evento webhook | A IA usa `$json.body.XYZ` em vez de adivinhações cegas | [x] |
| 3.3 | Bibliotecas Python n8n | Squad n8n ativado | 1. Pedir script Python de scraping | A IA recusa libs como `requests`/`bs4` e cita as barreiras do built-in | [x] |

---

## 4. Workflows e Scripts (Setup & MCP)

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 4.1 | Workflow de Setup | Prompt da IA pronto | 1. Executar `/n8n-setup` no chat | O agente conduz perguntas iterativas entre Nuvem vs Local (Docker/npx) e solicita API_KEY | [x] |
| 4.2 | Edição do mcp_config.json | Script acessível | 1. Rodar `python setup_n8n_mcp.py <URL> <KEY>` | O script localiza os arquivos config, cria `mcp_config.json.bak` de segurança e reinsere as envs | [x] |

---

## Histórico de Execução

| Data | Responsável | Pass | Fail | N/A | Notas |
|------|-------------|------|------|-----|-------|
| 2026-02-19 | `@test-engineer` | 12 | 0 | 0 | Geração oficial do documento de homologação. Durante o teste técnico, notei um pequeno bug em `squad_manager.py` (CLI não recebia o comando) e executei o hotfix IMEDIATAMENTE. Funciona 100%. |
