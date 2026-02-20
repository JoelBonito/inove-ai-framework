# AGENTS.md - Instruções para OpenAI Codex CLI

> **Papel principal:** Implementação de código
> **Papel standalone:** Autônomo (planning + implementação)
> **Fonte canônica:** `.agents/INSTRUCTIONS.md`

---

## Papel do Codex CLI

O Codex CLI é primariamente um **implementador de código**. Quando usado junto com o Gemini (Flow B), recebe contexto via `HANDOFF.md`. Quando usado **sozinho** (Standalone Mode), opera de forma autônoma com todos os 21 agentes.

```
┌──────────────────────────────────────┐
│  CODEX CLI                           │
│                                      │
│  Flow B (com Gemini):                │
│  - Input: HANDOFF.md + Backlog       │
│  - Foco: Implementação               │
│                                      │
│  Standalone (sem Gemini):            │
│  - Todos os 21 agentes disponíveis   │
│  - Todos os 22 workflows             │
│  - Planning + Implementação          │
│                                      │
│  MCP: Context7 + Shadcn              │
│  Output: src/ (código)               │
└──────────────────────────────────────┘
```

### O Que NÃO Fazer (quando HANDOFF.md existir)
- **NÃO** alterar documentos de planejamento em `docs/01-Planejamento/`
- **NÃO** replanear ou refazer decisões já tomadas no HANDOFF.md
- **NÃO** alterar o `docs/BACKLOG.md` manualmente (usar scripts)

---

## Input Protocol (OBRIGATÓRIO)

**ANTES de começar qualquer implementação:**

1. **Verificar** se `docs/HANDOFF.md` existe:
   - **Se existir:** Ler para entender prioridades e decisões (contexto rico)
   - **Se não existir:** Prosseguir sem ele (ver Standalone Mode abaixo)
2. **Ler** `docs/BACKLOG.md` para identificar a próxima tarefa
3. **Ler** documentos relevantes em `docs/01-Planejamento/` (se existirem):
   - `04-architecture.md` para decisões de arquitetura
   - `06-stack.md` para stack e dependências
   - `07-design-system.md` para UI (se aplicável)
   - `05-security.md` para requisitos de segurança

> **Regra:** O HANDOFF.md enriquece o contexto mas **NÃO é bloqueante**. Se não existir, usar o que estiver disponível.

---

## Standalone Mode (sem Gemini)

Quando o Codex CLI é usado **sem o Gemini** (sem `docs/HANDOFF.md`):

1. **Se `docs/BACKLOG.md` existir:** Ler e implementar a próxima tarefa
2. **Se `docs/01-Planejamento/` existir:** Usar os documentos como contexto
3. **Se nenhum existir:** Usar o Socratic Gate para descobrir requisitos com o usuário, depois implementar

### Agentes Adicionais (Standalone)

No modo standalone, além dos 14 agentes de implementação, ficam disponíveis os 7 agentes de planning:

| Agente | Quando Usar |
|--------|-------------|
| `project-planner` | `/define`, `/plan` — planning de projetos |
| `product-manager` | Requisitos, user stories |
| `product-owner` | Backlog, MVP, GAP analysis |
| `ux-researcher` | User flows, wireframes, UX research |
| `security-auditor` (planning) | Threat modeling, security planning |
| `explorer-agent` | Análise de codebase |
| `orchestrator` | Coordenação multi-agente |

### Workflows Adicionais (Standalone)

| Comando | Descrição |
|---------|-----------|
| `/define` | Planejamento completo em 9 fases |
| `/brainstorm` | Exploração Socrática |
| `/journeys` | Documentar jornadas de usuário |
| `/context` | Criar Project Context |
| `/readiness` | Validar prontidão |
| `/plan` | Planejamento rápido |
| `/squad` | Gerenciar squads |
| `/ui-ux-pro-max` | Design system |

> **Resumo:** Codex standalone = todos os 21 agentes + 22 workflows. Funciona como agente autônomo completo.

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
```

---

## REGRAS INVIOLÁVEIS

### Regra Zero — NUNCA Editar Sem Aprovação (ABSOLUTO)

1. **NUNCA usar ferramentas de modificação sem aprovação EXPLÍCITA do usuário.**
2. **"Analisar" ≠ "Editar".** Responder com DIAGNÓSTICO TEXTUAL apenas.
3. **Fluxo obrigatório:** LER → ANALISAR → PROPOR → ESPERAR aprovação → EDITAR.

### Classificação de Requisição (STEP 0)

| Tipo                 | Palavras-chave                                | Resultado                      |
| -------------------- | --------------------------------------------- | ------------------------------ |
| **PERGUNTA**         | "o que é", "como funciona", "explique"        | Resposta textual               |
| **EDIT SIMPLES**     | "corrige", "adiciona", "muda" (1 arquivo)     | Edição inline                  |
| **CÓDIGO COMPLEXO**  | "construa", "crie", "implemente", "refatore"  | Ler contexto + implementar     |
| **SLASH CMD**        | /create, /debug, /enhance, /test              | Fluxo do comando               |

### Socratic Gate (OBRIGATÓRIO)

| Tipo                      | Ação Obrigatória                                     |
| ------------------------- | ---------------------------------------------------- |
| **Nova Feature / Build**  | PERGUNTAR mínimo 3 questões estratégicas             |
| **Edit / Bug Fix**        | Confirmar entendimento + perguntas de impacto        |
| **"Prossiga" direto**     | Mesmo assim, perguntar 2 questões de Edge Case       |

### Read → Understand → Apply

```
ERRADO: Ler agente → Começar a codar
CORRETO: Ler contexto (HANDOFF/BACKLOG/docs) → Ler agente → Entender PORQUÊ → Aplicar PRINCÍPIOS → Codar
```

---

## Agentes Disponíveis (Implementação)

| Agente | Arquivo | Foco |
|--------|---------|------|
| `frontend-specialist` | `.agents/agents/frontend-specialist.md` | Web UI/UX, React, Next.js |
| `backend-specialist` | `.agents/agents/backend-specialist.md` | APIs, Node.js, Python |
| `database-architect` | `.agents/agents/database-architect.md` | Schemas, queries, migrations |
| `mobile-developer` | `.agents/agents/mobile-developer.md` | iOS, Android, React Native |
| `devops-engineer` | `.agents/agents/devops-engineer.md` | CI/CD, Docker, infra |
| `test-engineer` | `.agents/agents/test-engineer.md` | Estratégias de teste |
| `qa-automation-engineer` | `.agents/agents/qa-automation-engineer.md` | E2E, automação |
| `debugger` | `.agents/agents/debugger.md` | Root cause analysis |
| `performance-optimizer` | `.agents/agents/performance-optimizer.md` | Otimizações |
| `security-auditor` | `.agents/agents/security-auditor.md` | Code review de segurança |
| `code-archaeologist` | `.agents/agents/code-archaeologist.md` | Refatoração legacy |
| `documentation-writer` | `.agents/agents/documentation-writer.md` | Docs técnicos |
| `seo-specialist` | `.agents/agents/seo-specialist.md` | SEO, visibilidade |
| `game-developer` | `.agents/agents/game-developer.md` | Game logic |

### Roteamento Inteligente

| Palavras-chave | Domínio | Agente |
|----------------|---------|--------|
| "UI", "componente", "página", "frontend" | Frontend | `frontend-specialist` |
| "API", "endpoint", "backend", "servidor" | Backend | `backend-specialist` |
| "database", "schema", "query", "migração" | Database | `database-architect` |
| "mobile", "iOS", "Android", "React Native" | Mobile | `mobile-developer` |
| "auth", "segurança", "vulnerabilidade" | Security | `security-auditor` |
| "bug", "erro", "não funciona", "debug" | Debug | `debugger` |
| "teste", "E2E", "CI/CD" | Testing | `qa-automation-engineer` |
| "deploy", "docker", "infraestrutura" | DevOps | `devops-engineer` |

---

## Workflows Disponíveis (Implementação)

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/create` | Criar novas features | Implementação guiada |
| `/debug` | Debug sistemático | Resolução de bugs |
| `/enhance` | Melhorar código existente | Refatoração |
| `/test` | Gerar e rodar testes | Quality assurance |
| `/deploy` | Deploy de aplicação | Publicação |
| `/review` | Revisão de código pós-sprint | Qualidade |
| `/preview` | Gerenciar servidor de preview | Dev server |

### Workflows Partilhados (Ambos os fluxos)

| Comando | Descrição |
|---------|-----------|
| `/track` | Atualizar progresso |
| `/status` | Dashboard consolidado |
| `/finish` | Marcar tarefas completas |
| `/log` | Registrar sessões |
| `/orchestrate` | Coordenação multi-agente |
| `/test-book` | Gerar caderno de testes |
| `/release` | Preparar release |

---

## Auto-Finish Protocol (OBRIGATÓRIO)

```bash
python .agents/scripts/finish_task.py "{task_id}"
python .agents/scripts/progress_tracker.py
```

---

## Registro de Sessões (OBRIGATÓRIO)

```bash
python .agents/scripts/auto_session.py start --agent codex
python .agents/scripts/auto_session.py end --activities "ativ1; ativ2"
```

### Tratamento de Idioma

- **Prompt em PT-BR** → Responder em PT-BR
- **Comentários de código** → Sempre em inglês
- **Variáveis/funções** → Sempre em inglês

---

## Final Checklist Protocol

```bash
python .agents/scripts/checklist.py .
python .agents/scripts/checklist.py . --url <URL>
```

**Ordem:** Security → Lint → Schema → Tests → UX → SEO → Perf

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

```bash
export AGENT_SOURCE=codex
python .agents/scripts/lock_manager.py list
python .agents/scripts/lock_manager.py cleanup
```

Ownership no BACKLOG.md: `## Epic 1 [OWNER: codex] [MODEL: gpt-4]`

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

📄 **[.agents/INSTRUCTIONS.md](.agents/INSTRUCTIONS.md)** — Regras detalhadas
📄 **[.agents/ARCHITECTURE.md](.agents/ARCHITECTURE.md)** — Documentação técnica

<!--
IMPORTANT: The actual full instructions are in .agents/INSTRUCTIONS.md
This file serves as the implementation-focused interface for Codex CLI.
Codex reads AGENTS.md files automatically.
-->
