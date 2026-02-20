# PLANO DE IMPLEMENTAÇÃO: n8n Automation Squad

**Agentes Responsáveis:** `@project-planner`, `@mcp-builder`, e `@orchestrator`
**Opção Escolhida:** Option A Modificada (Squad Híbrido com Auto-Activate e High-Density Markdowns)
**Data:** 2026-02-19

---

## 🎯 1. Visão Geral e Objetivo
Implementar o pacote de automação n8n no **Inove AI Framework** baseando-se no modelo de "Squad", mas adotando uma abordagem **Híbrida de Auto-Ativação**. Quando o roteamento global (`intelligent-routing`) detectar a intenção "n8n", o Squad será auto-ativado silenciosamente. Isso garante zero sobrecarga constante no core, mas mantém fluidez extrema para o usuário. 

Além disso, adotaremos a excelente densidade e estruturação de *Frontmatters* e subdivisão de arquivos de conhecimento propostas empiricamente.

## 📐 2. Arquitetura do Squad (`squads/n8n-automation/`)

O Squad será autocontido, porém incrivelmente denso e modular nas skills.

```text
squads/n8n-automation/
├── squad.yaml                      # Manifest que permitirá a flag de auto-activation futuramente
├── agents/
│   └── n8n-specialist.md           # Agente core, especialista em fluxos e regras n8n (~12KB de density)
├── skills/
│   └── n8n-orchestration/          
│       ├── SKILL.md                # Index da skill com tabela de mapeamento
│       ├── expression-syntax.md    # {{ }}, $json, $node, webhooks
│       ├── mcp-tools.md            # Guia detalhado de uso dos 20 tools
│       ├── workflow-patterns.md    # API, Webhooks, DB, Cron, etc.
│       ├── validation.md           # Erros, falsos positivos e auto-fix
│       ├── node-configuration.md   # Setup de propriedades, dependências
│       └── code-nodes.md           # Code patterns em JS e regras rígidas Python
├── workflows/
│   ├── n8n-setup.md                # Configuração do MCP Nuvem/Local
│   ├── n8n-scaffold.md             # Desenhar fluxos do zero via MCP
│   └── n8n-debug.md                # Root-cause investigation
└── scripts/
    └── setup_n8n_mcp.py            # Helper script para atualizar o mcp_config.json
```

---

## 🛠️ 3. Fases de Implementação (Passo a Passo)

### FASE 1: Atualização do Roteamento
- [ ] **Modificar `.agents/scripts/squad_manager.py` (TRABALHO EXTRA APROVADO):**
  - Adicionar funcionalidade técnica de *auto-activation* para quando o AI solicitar ativação programática via flag ou chamada imperativa.
- [ ] **Atualização Core (`.agents/skills/intelligent-routing/SKILL.md`):**
  - Adicionar regra no roteamento: *"Quando a tag `n8n` ou `automation` surgir, não devolva erro. Acione silenciosamente o script para ativar o `n8n-automation` squad antes de seguir adiante."*

### FASE 2: Estrutura Modular da Skill (`n8n-orchestration`)
- [ ] **Criação de `SKILL.md` (Index):**
  - Tabela com todos os 6 sub-arquivos e "When to read".
  - *Frontmatter rules*: allowed-tools (Read, Write, Edit, Glob, Grep).
- [ ] **Criar os 6 Subarquivos Base Markdown:**
  - `expression-syntax.md` (Foco extremo no problema do `$json.body` e sintaxe N8N).
  - `mcp-tools.md` (A documentação e caso de uso das 20 tools do `n8n-mcp`).
  - `workflow-patterns.md` (Decisões arquiteturais de 5 padrões).
  - `validation.md` (Como investigar falhas).
  - `node-configuration.md` (Dual nodeType formats).
  - `code-nodes.md` (Helpers de JS, retorno obrigatório em array de JSON, limitações do Python core library).

### FASE 3: O Agente Super-Denso (`n8n-specialist`)
- [ ] **Criar `agents/n8n-specialist.md` com estrutura avançada:**
  - *Identity*: Specially tuned for N8N Workflow Automation.
  - *Core Philosophy*: Templates First, Validate Always.
  - *Decisions Framework*: Tabelas completas e complexas de design, como instruído.
  - *Anti-patterns*: Regras vitais sobre bypasses não seguros.

### FASE 4: Automação e Integração (MCP e Workflows)
- [ ] **Criar `workflows/n8n-setup.md` juntamente com `scripts/setup_n8n_mcp.py`:**
  - Permitir integração *1-click* que encontre o `.claude/mcp_config.json`, `.windsurf`, etc., injetando o novo servidor dinamicamente.

---

## 🔐 4. Matriz de Segurança e Riscos

| Risco Potencial | Solução / Mitigação |
| --- | --- |
| Auto-activate criando lags | Testar a perfomance do loader do squad. Garantir que o unload também ocorra se o contexto n8n morrer definitivamente da conversa. |
| IA editando workflows em Prod | Aplicar a **Alerta de Segurança Máxima** nas regras do Agente: *Sempre avisar o usuário dos riscos e exigir autorização antes do bypass / override de nós*. |

## ✅ 5. Fluxo de Aceite (Critérios de Conclusão)
- Squad é criado com 6 *sub-markdowns* denso e o Agente com metadata preenchida.
- O Roteamento reconhece e invoca o Squad de forma imperceptível via script (híbrido).
- O MCP é facilmente acionável.

---
> **Ação Imediata:** Atualizei o plano no formato Squad Híbrido e estou pronto para programar as modificações na arquitetura e criar os arquivos em formato estruturado.
