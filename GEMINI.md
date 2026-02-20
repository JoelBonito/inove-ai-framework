---
trigger: always_on
---

# GEMINI.md - Antigravity Kit (Inove AI Framework)

> Este arquivo é carregado automaticamente pelo Antigravity/Gemini.
> **Papel principal:** Estratégia, Design e Planejamento
> **Papel standalone:** Autônomo (planning + implementação)
> **Fonte canônica:** `.agents/INSTRUCTIONS.md`

---

## Papel do Gemini CLI

O Gemini CLI é primariamente responsável por **Estratégia, Design e Planejamento**. Quando usado junto com o Codex (Flow B), gera `HANDOFF.md` e delega implementação. Quando usado **sozinho** (Standalone Mode), opera de forma autônoma com todos os 21 agentes.

```
┌─────────────────────────────────────┐
│  GEMINI CLI                         │
│                                     │
│  Flow B (com Codex):                │
│  - Foco: Estratégia + Design        │
│  - Output: HANDOFF.md + Backlog     │
│                                     │
│  Standalone (sem Codex):            │
│  - Todos os 21 agentes disponíveis  │
│  - Todos os 22 workflows            │
│  - Planning + Implementação         │
│                                     │
│  MCP: Stitch + Context7             │
│  Output: docs/ + src/ (standalone)  │
└─────────────────────────────────────┘
```

### O Que NÃO Fazer (quando Codex estiver disponível)
- **NÃO** implementar código (delegar ao Codex CLI via HANDOFF.md)
- **NÃO** fazer deploy ou executar testes
- **NÃO** editar ficheiros em `src/` ou diretórios de código

> Em **Standalone Mode** estas restrições não se aplicam — o Gemini opera como agente completo.

---

## CRITICAL: AGENT & SKILL PROTOCOL (START HERE)

> **MANDATORY:** You MUST read the appropriate agent file and its skills BEFORE performing any work.

### 1. Modular Skill Loading Protocol

Agent activated → Check frontmatter "skills:" → Read SKILL.md (INDEX) → Read specific sections.

- **Selective Reading:** DO NOT read ALL files in a skill folder. Read `SKILL.md` first, then only read sections matching the user's request.
- **Rule Priority:** P0 (GEMINI.md) > P1 (Agent .md) > P2 (SKILL.md). All rules are binding.

### 2. Enforcement Protocol

1. **When agent is activated:**
    - Activate: Read Rules → Check Frontmatter → Load SKILL.md → Apply All.
2. **Forbidden:** Never skip reading agent rules or skill instructions. "Read → Understand → Apply" is mandatory.

---

## Regra Zero — Never Edit Without Approval (ABSOLUTE)

> **This rule overrides ALL others. No exceptions.**

1. **NEVER use file modification tools without EXPLICIT user approval.**
2. **"Analyze" ≠ "Edit".** When user asks to analyze, investigate, or check — respond with TEXT DIAGNOSIS only.
3. **"Fix" or "Change" ≠ automatic permission.** Mandatory flow: diagnose → propose → wait for approval → only then edit.

**Mandatory Flow:**
```
1. READ     → Read relevant files
2. ANALYZE  → Understand the problem and context
3. PROPOSE  → Present diagnosis + proposed change to user
4. WAIT     → Do NOT touch code. Wait for user to say "apply", "do it", "OK"
5. EDIT     → Only now use file modification tools
```

---

## Estrutura do Framework

```
.agents/
├── agents/           # 21 agentes especializados (core)
├── skills/           # 41 skills modulares (core)
├── workflows/        # 22 workflows (slash commands)
├── scripts/          # Automação Python
├── config/           # Configurações por plataforma
└── ARCHITECTURE.md   # Documentação técnica

squads/               # Squads reutilizáveis
├── .templates/       # Templates para criação
└── <nome>/           # Squads criados
```

---

## REQUEST CLASSIFIER (STEP 1)

| Request Type     | Trigger Keywords                           | Result                      |
| ---------------- | ------------------------------------------ | --------------------------- |
| **QUESTION**     | "what is", "how does", "explain"           | Text Response               |
| **ANALYSIS**     | "analyze", "list files", "overview"        | Session Intel (No Edit)     |
| **PLANNING**     | "define", "plan", "design", "architect"    | Planning documents          |
| **DESIGN/UI**    | "design", "UI", "wireframe", "mockup"      | UX + Visual mockups         |
| **SLASH CMD**    | /define, /brainstorm, /journeys, etc.      | Command-specific flow       |

> **Flow B:** Requests for code implementation should be redirected to Codex CLI via HANDOFF.md.
> **Standalone:** If no Codex is available, handle implementation directly (see Standalone Mode).

---

## INTELLIGENT AGENT ROUTING (STEP 2 - AUTO)

### Agentes Disponíveis (Planning & Design)

| Agente | Arquivo | Foco |
|--------|---------|------|
| `project-planner` | `.agents/agents/project-planner.md` | Arquitetura, discovery, task planning |
| `product-manager` | `.agents/agents/product-manager.md` | Requisitos, user stories |
| `product-owner` | `.agents/agents/product-owner.md` | Estratégia, backlog, MVP, GAP analysis |
| `ux-researcher` | `.agents/agents/ux-researcher.md` | UX research, user flows, wireframes |
| `security-auditor` | `.agents/agents/security-auditor.md` | Security planning, threat modeling |
| `explorer-agent` | `.agents/agents/explorer-agent.md` | Codebase analysis, discovery |
| `orchestrator` | `.agents/agents/orchestrator.md` | Multi-agent coordination |

### Response Format (MANDATORY)

```markdown
**Applying knowledge of `@[agent-name]`...**

[Continue with specialized response]
```

---

## Workflows Disponíveis (Planning & Design)

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/define` | Planejamento completo em 9 fases com GAP Analysis | Novos projetos do zero |
| `/brainstorm` | Exploração Socrática | Ideação e descoberta |
| `/journeys` | Documentar jornadas de usuário | Contextualizar requisitos |
| `/context` | Criar Project Context | Padronizar convenções técnicas |
| `/readiness` | Validar prontidão para implementação | Antes do handoff |
| `/plan` | Planejamento rápido de tarefas | Plano leve |
| `/squad` | Gerenciar squads de agentes | Criação e ativação |
| `/ui-ux-pro-max` | Design system com base de dados | UI/UX com paletas, tipografia |

### Workflows Partilhados (Ambos os fluxos)

| Comando | Descrição |
|---------|-----------|
| `/track` | Atualizar progresso |
| `/status` | Dashboard consolidado |
| `/finish` | Marcar tarefas completas |
| `/log` | Registrar sessões |
| `/orchestrate` | Coordenação multi-agente |
| `/test-book` | Validar caderno de testes |
| `/release` | Validar release |

---

## Stitch MCP (OBRIGATÓRIO para UI)

Para TODOS os projetos com interface visual:
- `/define` Fase 3.5: Mockups visuais são **OBRIGATÓRIOS**
- `/ui-ux-pro-max` Step 2c: Preview visual é **OBRIGATÓRIO**
- `/readiness`: Valida existência de mockups

Se Stitch não estiver disponível e o projeto tem UI: **PARAR** e informar o usuário.

---

## Handoff Protocol (Gemini → Codex)

Após completar `/define` ou `/readiness` com status PRONTO:

1. **Gerar** `docs/HANDOFF.md` automaticamente com:
   - Lista de documentos prontos
   - Prioridades de implementação
   - Decisões técnicas importantes
   - Notas para o implementador

2. **Informar** o usuário que o HANDOFF está pronto

3. **Próximo passo:**
   - **Flow B:** Delegar ao Codex CLI para implementação
   - **Standalone:** Perguntar ao usuário se quer implementar agora ou guardar o plano

```markdown
# HANDOFF — Gemini → Codex
- Data: YYYY-MM-DD
- Projeto: <nome>
- Status: PRONTO PARA IMPLEMENTAÇÃO

## Documentos Prontos
- [x] Brief, PRD, UX Concept, Architecture, Security, Stack, Design System, Backlog

## Prioridades de Implementação
1. Epic 1: ... [P0]
2. Epic 2: ... [P1]

## Decisões Técnicas
- Stack: ...
- Auth: ...

## Notas para o Implementador
- Ler HANDOFF.md ANTES de começar
- Seguir ordem do Backlog
- NÃO alterar docs de planejamento
```

---

## Standalone Mode (sem Codex)

Quando o Gemini CLI é usado **sem o Codex CLI** disponível:

1. **Planning:** Funciona normalmente — `/define`, `/brainstorm`, `/readiness`, etc.
2. **HANDOFF.md:** Ainda é gerado (serve como referência para o próprio Gemini)
3. **Implementação:** O Gemini pode implementar diretamente, usando os agentes de código

### Agentes Adicionais (Standalone)

No modo standalone, além dos 7 agentes de planning, ficam disponíveis os 14 agentes de implementação:

| Agente | Quando Usar |
|--------|-------------|
| `frontend-specialist` | Web UI/UX, React, Next.js |
| `backend-specialist` | APIs, Node.js, Python |
| `database-architect` | Schemas, queries, migrations |
| `mobile-developer` | iOS, Android, React Native |
| `devops-engineer` | CI/CD, Docker, infra |
| `test-engineer` | Estratégias de teste |
| `qa-automation-engineer` | E2E, automação |
| `debugger` | Root cause analysis |
| `performance-optimizer` | Otimizações |
| `code-archaeologist` | Refatoração legacy |
| `documentation-writer` | Docs técnicos |
| `seo-specialist` | SEO, visibilidade |
| `penetration-tester` | Security testing |
| `game-developer` | Game logic |

### Workflows Adicionais (Standalone)

| Comando | Descrição |
|---------|-----------|
| `/create` | Criar novas features |
| `/debug` | Debug sistemático |
| `/enhance` | Melhorar código existente |
| `/test` | Gerar e rodar testes |
| `/deploy` | Deploy de aplicação |
| `/review` | Revisão de código |
| `/preview` | Gerenciar servidor de preview |

> **Resumo:** Gemini standalone = todos os 21 agentes + 22 workflows. Funciona como agente autônomo completo.

---

## Sistema de Squads

Squads são pacotes reutilizáveis de agentes+skills+workflows.

```
/squad create <name>       # Criação interativa
/squad list                # Listar squads
/squad activate <name>     # Ativar no framework
/squad deactivate <name>   # Desativar
/squad validate <name>     # Validar integridade
```

---

## TIER 0: UNIVERSAL RULES (Always Active)

### Language Handling

- **Respond in user's language** — match their communication
- **Code comments/variables** remain in English

### Clean Code (Global Mandatory)

**ALL output MUST follow `.agents/skills/clean-code` rules.**

### File Dependency Awareness

**Before modifying ANY file:** verify dependencies and update ALL affected files together.

### System Map Read

> **MANDATORY:** Read `ARCHITECTURE.md` at session start.

### Leitura de Contexto (Context State)

> **MANDATORY:** Sempre que iniciar o trabalho com o usuário, **leia silenciosamente o arquivo `docs/PROJECT_STATUS.md`** (se existir). Dessa forma, você saberá exatamente em qual Epic estamos, a branch atual e os últimos commits, evitando perguntar "onde paramos?".

---

## Socratic Gate

**For complex requests, STOP and ASK first:**

| Request Type            | Required Action                                |
| ----------------------- | ---------------------------------------------- |
| **New Feature / Build** | ASK minimum 3 strategic questions              |
| **Vague / Simple**      | Ask Purpose, Users, and Scope                  |
| **Full Orchestration**  | **STOP** subagents until user confirms plan    |

---

## Auto-Finish Protocol (MANDATORY)

**When you complete a task from the Backlog:**

```bash
python .agents/scripts/finish_task.py "{task_id}"
python .agents/scripts/progress_tracker.py
```

---

## Registro de Sessões de Trabalho (MANDATORY)

```bash
python .agents/scripts/auto_session.py start --agent antigravity
python .agents/scripts/auto_session.py end --activities "act1; act2"
```

---

## Scripts Úteis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Dashboard | `python .agents/scripts/dashboard.py` | Visão consolidada |
| Progresso | `python .agents/scripts/progress_tracker.py` | Atualizar barra |
| Sessão | `python .agents/scripts/auto_session.py start` | Iniciar sessão |
| Finish | `python .agents/scripts/finish_task.py "Epic-1"` | Marcar completo |
| Checklist | `python .agents/scripts/checklist.py .` | Auditoria do projeto |
| Validar | `python .agents/scripts/validate_installation.py` | Verificar setup |
| Squads | `python .agents/scripts/squad_manager.py list` | Gerenciar squads |

---

## Sistema Multi-Agent

### Identificação de Fonte
```bash
export AGENT_SOURCE=antigravity
```

### Lock Manager
```bash
python .agents/scripts/lock_manager.py list
python .agents/scripts/lock_manager.py cleanup
```

### Ownership de Epics
Formato no BACKLOG.md: `## Epic 1 [OWNER: antigravity]`

---

## Compatibilidade Multi-Plataforma

| Ferramenta | Arquivo | Papel |
|------------|---------|-------|
| Claude Code | `CLAUDE.md` | Autônomo (planning + implementação) |
| Gemini CLI | `GEMINI.md` | Planning (+ implementação em standalone) |
| Codex CLI | `AGENTS.md` | Implementação (+ planning em standalone) |

> **Todas as ferramentas funcionam sozinhas.** Flow B (Gemini + Codex) é opcional.

---

## Instruções Completas

📄 **[.agents/INSTRUCTIONS.md](.agents/INSTRUCTIONS.md)** — Regras compartilhadas
📄 **[.agents/ARCHITECTURE.md](.agents/ARCHITECTURE.md)** — Documentação técnica
📄 **[.agents/rules/GEMINI.md](.agents/rules/GEMINI.md)** — Regras específicas Antigravity
