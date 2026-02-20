# CLAUDE.md - Instruções para Claude Code

> Este arquivo é carregado automaticamente pelo Claude Code em cada conversa.
> **Fonte canônica:** `.agents/INSTRUCTIONS.md` - mantenha sincronizado.

## Sobre Este Projeto

**Inove AI Framework** é um kit de desenvolvimento AI com sistema multi-agent (Claude Code + Codex CLI + Antigravity/Gemini) que fornece:

- **21 Agentes Especializados** para diferentes domínios
- **41 Skills Modulares** carregadas sob demanda
- **22 Workflows** (slash commands) para processos estruturados
- **Sistema Multi-Agent** com sincronização de locks e ownership

---

## Estrutura do Framework

```
.agents/
├── agents/           # 21 agentes especializados
├── skills/           # 41 módulos de conhecimento
├── workflows/        # 22 workflows (slash commands)
├── scripts/          # Automação Python
├── config/           # Configurações por plataforma
└── ARCHITECTURE.md   # Documentação técnica
```

---

## Regra Zero — NUNCA Editar Sem Aprovação (ABSOLUTO)

> **Esta regra prevalece sobre TODAS as outras. Sem exceções.**

### Proibições Absolutas

1. **NUNCA usar Edit, Write ou qualquer ferramenta que modifique código sem aprovação EXPLÍCITA do usuário.**
2. **"Analisar" ≠ "Editar".** Quando o usuário pede para analisar, investigar, verificar ou olhar — a resposta é um DIAGNÓSTICO TEXTUAL. Não tocar em nenhum arquivo.
3. **"Corrigir" ou "Mudar" ≠ permissão automática.** Mesmo quando o usuário descreve um problema, o fluxo obrigatório é: diagnosticar → propor → esperar aprovação → só então editar.

### Fluxo Obrigatório para QUALQUER Modificação de Código

```
1. LER     → Ler os arquivos relevantes (Read/Glob/Grep)
2. ANALISAR → Entender o problema e o contexto
3. PROPOR   → Apresentar diagnóstico + proposta de mudança ao usuário
4. ESPERAR  → NÃO tocar em código. Aguardar o usuário dizer "aplica", "faz", "pode editar", "OK"
5. EDITAR   → Só agora usar Edit/Write, seguindo STEP 0 + STEP 1
```

### Gatilhos de Aprovação (palavras que LIBERAM edição)

- "aplica", "faz", "pode editar", "sim", "OK", "vai", "manda", "prossiga com a edição"

### Gatilhos que NÃO liberam edição

- "analise", "vamos ver", "vamos analisar", "olha isso", "o que acha", "investigue"

> **Na dúvida, PERGUNTE.** É sempre melhor perguntar do que editar sem permissão.

---

## Classificação de Requisição (STEP 0 — OBRIGATÓRIO)

**Antes de QUALQUER ação, classificar a requisição:**

| Tipo                 | Palavras-chave                                    | Tiers Ativos                   | Resultado                        |
| -------------------- | ------------------------------------------------- | ------------------------------ | -------------------------------- |
| **PERGUNTA**         | "o que é", "como funciona", "explique"            | TIER 0 apenas                  | Resposta textual                 |
| **ANÁLISE/INTEL**    | "analise", "liste arquivos", "overview"           | TIER 0 + Explorer              | Intel de sessão (sem editar)     |
| **EDIT SIMPLES**     | "corrige", "adiciona", "muda" (1 arquivo)         | TIER 0 + TIER 1 (lite)         | Edição inline                    |
| **CÓDIGO COMPLEXO**  | "construa", "crie", "implemente", "refatore"      | TIER 0 + TIER 1 (full) + Agent | **{task-slug}.md obrigatório**   |
| **DESIGN/UI**        | "design", "UI", "página", "dashboard"             | TIER 0 + TIER 1 + Agent        | **{task-slug}.md obrigatório**   |
| **SLASH CMD**        | /create, /orchestrate, /debug, /define            | Fluxo do comando               | Variável                         |

> **Regra:** NÃO ative agentes ou skills para perguntas simples. Responda diretamente.

---

## Protocolo de Roteamento Inteligente (STEP 1)

### 1. Detecção de Domínio (AUTOMÁTICO)

| Palavras-chave | Domínio | Agente Primário |
|----------------|---------|-----------------|
| "UI", "componente", "página", "frontend" | Frontend | `frontend-specialist` |
| "API", "endpoint", "backend", "servidor" | Backend | `backend-specialist` |
| "database", "schema", "query", "migração" | Database | `database-architect` |
| "mobile", "iOS", "Android", "React Native" | Mobile | `mobile-developer` |
| "auth", "segurança", "vulnerabilidade" | Security | `security-auditor` |
| "bug", "erro", "não funciona", "debug" | Debug | `debugger` |
| "teste", "E2E", "CI/CD" | Testing | `qa-automation-engineer` |
| "deploy", "docker", "infraestrutura" | DevOps | `devops-engineer` |
| "requisitos", "user story", "backlog", "MVP" | Product | `product-owner` |
| "UX", "user flow", "wireframe", "jornada", "usabilidade" | UX Research | `ux-researcher` |

### 2. Roteamento por Tipo de Projeto

| Tipo                                   | Agente Primário       | Skills                        |
| -------------------------------------- | --------------------- | ----------------------------- |
| **MOBILE** (iOS, Android, RN, Flutter) | `mobile-developer`    | mobile-design                 |
| **WEB** (Next.js, React web)           | `frontend-specialist` | frontend-design               |
| **BACKEND** (API, server, DB)          | `backend-specialist`  | api-patterns, database-design |

> **Mobile + frontend-specialist = ERRADO.** Mobile = `mobile-developer` APENAS.

### 3. Ativação de Agente (OBRIGATÓRIO)

Quando um domínio for detectado:

1. **Ler arquivo do agente:** `.agents/agents/{agent}.md`
2. **Anunciar ativação:**
   ```
   Ativando @{nome-do-agente}...
   Carregando regras e protocolos
   ```
3. **Carregar skills** do frontmatter do agente
4. **Aplicar persona e regras** do agente

### 4. Regras de Ativação

1. **Análise silenciosa**: Sem meta-comentários verbosos ("Estou analisando...").
2. **Override explícito**: Se o usuário mencionar `@agent`, usar esse agente.
3. **Tarefas complexas**: Para multi-domínio, usar `orchestrator` e fazer perguntas Socráticas primeiro.

---

## Read → Understand → Apply (OBRIGATÓRIO)

```
ERRADO: Ler agente → Começar a codar
CORRETO: Ler → Entender PORQUÊ → Aplicar PRINCÍPIOS → Codar
```

**Antes de codar, responder internamente:**

1. Qual é o OBJETIVO deste agente/skill?
2. Quais PRINCÍPIOS devo aplicar?
3. Como isso DIFERE de output genérico?

---

## Workflows Disponíveis (Slash Commands)

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/define` | Planejamento completo em 9 fases com GAP Analysis | Novos projetos do zero |
| `/journeys` | Documentar jornadas de usuário | Contextualizar requisitos |
| `/context` | Criar Project Context | Padronizar convenções técnicas |
| `/readiness` | Validar prontidão para implementação | Antes de começar a codar |
| `/brainstorm` | Exploração Socrática | Ideação e descoberta |
| `/create` | Criar novas features | Implementação guiada |
| `/debug` | Debug sistemático | Resolução de bugs |
| `/enhance` | Melhorar código existente | Refatoração |
| `/deploy` | Deploy de aplicação | Publicação |
| `/test` | Gerar e rodar testes | Quality assurance |
| `/track` | Atualizar progresso | Tracking de tarefas |
| `/status` | Dashboard consolidado | Visão geral |
| `/log` | Registrar sessões | Documentação |
| `/finish` | Marcar tarefas completas | Conclusão |
| `/orchestrate` | Coordenação multi-agente | Tarefas que requerem múltiplos agentes |
| `/plan` | Planejamento rápido de tarefas | Plano leve (alternativa ao /define) |
| `/preview` | Gerenciar servidor de preview | Start/stop/restart do dev server |
| `/ui-ux-pro-max` | Design system avançado com base de dados | UI/UX com paletas, tipografia, estilos |
| `/review` | Revisão de código pós-sprint | Após implementação, antes de /finish |
| `/test-book` | Gerar/atualizar Caderno de Testes | Antes de finalizar MVP ou release |
| `/release` | Finalizar projeto e gerar release | Conclusão de MVP ou Produção |
| `/squad` | Gerenciar squads de agentes | Criação e ativação de squads |

**Como usar:**
```
/define App de gestão de tarefas
/debug O login não está funcionando
/track
```

---

## Socratic Gate (OBRIGATÓRIO)

**Para TODAS as requisições que envolvam código, PARAR e PERGUNTAR primeiro:**

| Tipo de Requisição        | Estratégia       | Ação Obrigatória                                          |
| ------------------------- | ---------------- | --------------------------------------------------------- |
| **Nova Feature / Build**  | Deep Discovery   | PERGUNTAR mínimo 3 questões estratégicas                  |
| **Edit / Bug Fix**        | Diagnóstico      | Apresentar DIAGNÓSTICO + PROPOSTA → **esperar aprovação** → só então editar |
| **Vago / Simples**        | Clarificação     | Perguntar Propósito, Usuários e Escopo                    |
| **Orquestração Full**     | Gatekeeper       | **PARAR** subagentes até confirmar plano                  |
| **"Prossiga" direto**     | Validação        | Mesmo assim, perguntar 2 questões de Edge Case            |

**Protocolo:**

1. **Nunca assumir:** Se 1% estiver indefinido, PERGUNTAR.
2. **Respostas em lista:** NÃO pular o gate. Perguntar sobre Trade-offs e Edge Cases.
3. **Esperar:** NÃO escrever código até o usuário liberar o gate.
4. **Regra Zero:** Mesmo para edits simples, apresentar proposta e esperar "OK" (ver seção Regra Zero acima).
5. **Referência:** Protocolo completo em `.agents/skills/brainstorming/SKILL.md`.

---

## Protocolo Auto-Finish (OBRIGATÓRIO)

Após completar QUALQUER tarefa do `docs/BACKLOG.md`:

```bash
python .agents/scripts/finish_task.py "{task_id}"
python .agents/scripts/progress_tracker.py
```

Informar ao usuário:
```
Task {task_id} marcada como completa
Progresso atualizado: {percentual}%
Próxima tarefa: {nome_proxima_tarefa}
```

> **Regra:** Você é RESPONSÁVEL por atualizar o status no backlog. Não peça ao usuário para fazer isso.

---

## Final Checklist Protocol (OBRIGATÓRIO)

**Trigger:** Quando o usuário pede "verificações finais", "final checks", ou antes de deploy/release.

**Comando principal:**

```bash
python .agents/scripts/checklist.py .                   # Auditoria manual
python .agents/scripts/checklist.py . --url <URL>       # Full Suite + Performance + E2E
```

**Ordem de execução prioritizada:**

| Prioridade | Etapa        | Script                                                                  | Quando Usar         |
| ---------- | ------------ | ----------------------------------------------------------------------- | ------------------- |
| 1          | **Security** | `python .agents/skills/vulnerability-scanner/scripts/security_scan.py`  | Sempre em deploy    |
| 2          | **Lint**     | `python .agents/skills/lint-and-validate/scripts/lint_runner.py`        | Cada mudança        |
| 3          | **Schema**   | `python .agents/skills/database-design/scripts/schema_validator.py`     | Após mudança no DB  |
| 4          | **Tests**    | `python .agents/skills/testing-patterns/scripts/test_runner.py`         | Após mudança lógica |
| 5          | **UX**       | `python .agents/skills/frontend-design/scripts/ux_audit.py`            | Após mudança UI     |
| 6          | **SEO**      | `python .agents/skills/seo-fundamentals/scripts/seo_checker.py`        | Após mudança página |
| 7          | **Perf**     | `python .agents/skills/performance-profiling/scripts/lighthouse_audit.py` | Antes de deploy   |
| 8          | **Deps**     | `python .agents/skills/vulnerability-scanner/scripts/dependency_analyzer.py` | Semanal / Deploy |
| 9          | **A11y**     | `python .agents/skills/frontend-design/scripts/accessibility_checker.py` | Após mudança UI |
| 10         | **Bundle**   | `python .agents/skills/performance-profiling/scripts/bundle_analyzer.py` | Antes de deploy |
| 11         | **Mobile**   | `python .agents/skills/mobile-design/scripts/mobile_audit.py`           | Após mudança mobile |
| 12         | **E2E**      | `python .agents/skills/webapp-testing/scripts/playwright_runner.py`     | Antes de deploy |

**Regras:**

- Uma tarefa NÃO está completa até `checklist.py` retornar sucesso.
- Se falhar, corrigir blockers **Critical** primeiro (Security/Lint).

---

## Registro de Sessões de Trabalho (OBRIGATÓRIO)

### Objetivo
Rastrear sessões de trabalho e gerar um relatório diário consolidado em Markdown.

### Local e Nome
Salvar em `docs/08-Logs-Sessoes/{ANO}/{AAAA-MM-DD}.md` (ex.: `docs/08-Logs-Sessoes/2026/2026-02-13.md`).

### Regras de Operação

1. **Abertura de Sessão (Início):**
   - Ao iniciar uma sessão, criar (ou abrir) o arquivo do dia.
   - Se o arquivo não existir, criar com o cabeçalho diário (ver Modelo).
   - Registrar hora de início no bloco "Sessões" com uma entrada provisória.

2. **Encerramento de Sessão (Fim):**
   - Ao encerrar, completar a entrada com hora de fim, calcular duração (fim - início).
   - Descrever o que foi feito (bullet points objetivos).

3. **Consolidação Diária (Resumo do Dia):**
   - Atualizar o bloco "Resumo do Dia" contendo:
     - Hora de início do dia (menor hora de início).
     - Hora de fim do dia (maior hora de fim).
     - Tempo total trabalhado (soma de todas as sessões).
   - Atualizar ao final da última sessão do dia.

4. **Limites e Bordas:**
   - Se uma sessão ultrapassar 23:59, encerrar no dia D e abrir nova no dia D+1 às 00:00.
   - Não registrar dados sensíveis ou tokens. Descrever apenas tarefas/artefatos técnicos.

5. **Índice:**
   - Manter/atualizar `docs/08-Logs-Sessoes/README.md` com links para cada arquivo diário.

6. **Fonte Única:**
   - SEMPRE usar `auto_session.py` para abrir/fechar sessões.
   - NUNCA criar ou editar logs manualmente com Write/Edit.
   - Se o script falhar, reportar o erro ao usuário em vez de criar log manual.

### Modelo de Arquivo Diário

```markdown
# LOG DIARIO — AAAA-MM-DD
- Projeto: <NOME_DO_PROJETO>
- Fuso: America/Sao_Paulo

## Sessoes
1. HH:MM — HH:MM (HH:MM) [badge]
   - Atividades: <bullets curtos e objetivos>

2. HH:MM — HH:MM (HH:MM) [badge]
   - Atividades: <...>

## Resumo do Dia
- Inicio do dia: HH:MM
- Fim do dia: HH:MM
- Tempo total: HH:MM
```

### Comandos

```bash
python .agents/scripts/auto_session.py start                      # Abrir sessão
python .agents/scripts/auto_session.py start --agent antigravity  # Abrir com agente específico
python .agents/scripts/auto_session.py end --activities "ativ1; ativ2"  # Fechar sessão
python .agents/scripts/auto_session.py end --quick                # Fechar sem atividades
python .agents/scripts/auto_session.py status                     # Ver sessão ativa
```

### Critérios de Qualidade

- PT-BR consistente. Sem código comentado/console.log em descrições de atividades.
- Durações corretas e soma exata no resumo diário.
- Nomes de arquivos e diretórios exatamente conforme especificação.
- Formato: horários em 24h (HH:MM), data ISO (AAAA-MM-DD), duração em HH:MM.
- Fuso horário: America/Sao_Paulo.

---

## Integração com Backlog

Quando o usuário disser "implementar Epic X" ou "implementar Story Y.Z":

1. **Ler backlog:** `docs/BACKLOG.md`
2. **Identificar detalhes** da tarefa
3. **Detectar domínio** → Ativar agente apropriado
4. **Implementar** seguindo regras do agente
5. **Auto-finish** usando scripts
6. **Atualizar progresso**

---

## Regras Universais (TIER 0)

### Clean Code (Mandatório Global)

Todo código DEVE seguir `.agents/skills/clean-code/SKILL.md`:

- Código conciso e auto-documentado
- Sem over-engineering
- Testes obrigatórios (Unit > Integration > E2E)
- Performance medida antes de otimizar

### Tratamento de Idioma

- **Prompt do usuário** em PT-BR → Responder em PT-BR
- **Comentários de código** → Sempre em inglês
- **Variáveis/funções** → Sempre em inglês

### Dependência entre Arquivos

**Antes de modificar QUALQUER arquivo:**

1. Usar Grep/Glob para verificar dependências entre arquivos
2. Identificar arquivos dependentes
3. Atualizar TODOS os arquivos afetados juntos

### Leitura do Mapa do Sistema

> **OBRIGATÓRIO:** Ler `ARCHITECTURE.md` no início da sessão para entender Agents, Skills e Scripts.

**Paths:**

- Agents: `.agents/agents/`
- Skills: `.agents/skills/`
- Runtime Scripts: `.agents/skills/<skill>/scripts/`

---

## Compatibilidade Multi-Plataforma

Este framework suporta múltiplas ferramentas AI. Cada uma funciona de forma autônoma ou em conjunto:

| Ferramenta | Arquivo | Papel |
|------------|---------|-------|
| Claude Code | `CLAUDE.md` | Autônomo (planning + implementação) |
| Gemini CLI | `GEMINI.md` | Planning (+ implementação em standalone) |
| Codex CLI | `AGENTS.md` | Implementação (+ planning em standalone) |

> **Todas as ferramentas funcionam sozinhas.** Flow B (Gemini + Codex) é opcional.

### Symlinks Nativos

Cada plataforma acessa os mesmos recursos via caminhos nativos (symlinks para `.agents/`):

| Plataforma | Agents | Skills | Workflows |
|------------|--------|--------|-----------|
| Claude Code | `.claude/agents/` | `.claude/skills/` | `.agents/workflows/` |
| Codex CLI | `.codex/agents/` | `.codex/skills/` | `.codex/prompts/` |
| Antigravity | `.agents/agents/` | `.agents/skills/` | `.agents/workflows/` |

> **Fonte canônica:** `.agents/` — todos os symlinks apontam para lá.

### Detecção Automática de Plataforma

Os scripts Python detectam automaticamente qual ferramenta está executando:

```python
from platform_compat import get_agent_source
source = get_agent_source()  # 'claude_code', 'codex', ou 'unknown'
```

---

## Sistema Multi-Agent

Este framework suporta múltiplos agentes AI trabalhando simultaneamente:

### Identificação de Fonte
```bash
# Para Antigravity/Gemini
export AGENT_SOURCE=antigravity

# Para Claude Code
export AGENT_SOURCE=claude_code

# Para Codex CLI
export AGENT_SOURCE=codex
```

### Lock Manager
```bash
python .agents/scripts/lock_manager.py list      # Ver locks ativos
python .agents/scripts/lock_manager.py cleanup   # Limpar locks expirados
```

### Ownership e Modelo Preferencial de Epics

Formato no BACKLOG.md:
```markdown
## Epic 1: Nome [OWNER: claude_code] [MODEL: opus-4-5]
```

| Campo | Descrição | Valores |
|-------|-----------|---------|
| `OWNER` | Agente/ferramenta responsável | `claude_code`, `antigravity`, `codex` |
| `MODEL` | Modelo AI preferencial | `opus-4-5`, `sonnet`, `haiku`, `gemini-2.0` |

---

## Scripts Úteis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Dashboard | `python .agents/scripts/dashboard.py` | Visão consolidada |
| Progresso | `python .agents/scripts/progress_tracker.py` | Atualizar barra |
| Sessão | `python .agents/scripts/auto_session.py start` | Iniciar sessão |
| Finish | `python .agents/scripts/finish_task.py "Epic-1"` | Marcar completo |
| Métricas | `python .agents/scripts/metrics.py` | Insights |
| Validar | `python .agents/scripts/validate_installation.py` | Verificar setup |
| Rastreabilidade | `python .agents/scripts/validate_traceability.py` | Validar cobertura |
| Projeto | `python .agents/scripts/project_analyzer.py status` | Analisar tech stack |
| Web Data | `python .agents/scripts/generate_web_data.py` | Gerar JSONs do site |
| Checklist | `python .agents/scripts/checklist.py .` | Validação incremental |
| Verificar Tudo | `python .agents/scripts/verify_all.py .` | Verificação completa |
| Squad Manager | `python .agents/scripts/squad_manager.py list` | Gerenciar squads |
| Recovery | `python .agents/scripts/recovery.py checkpoint <label>` | Retry + rollback |

---

## Sistema de Squads

Squads são pacotes reutilizáveis de agentes+skills+workflows para domínios específicos.

### Comandos
| Comando | Descrição |
|---------|-----------|
| `/squad create <name>` | Criar novo squad |
| `/squad list` | Listar squads disponíveis |
| `/squad activate <name>` | Ativar squad no framework |
| `/squad deactivate <name>` | Desativar squad |
| `/squad validate <name>` | Validar integridade |

### Como Funciona
Ao ativar um squad, os seus agentes/skills/workflows ficam disponíveis via symlinks e são tratados como componentes nativos do framework.

Squads ficam em `squads/<nome>/` com um manifesto `squad.yaml`.

Para detalhes: `squads/README.md`

---

### Stitch MCP (Projetos com UI)

Para TODOS os projetos com interface visual:
- `/define` Fase 3.5: Mockups visuais são OBRIGATÓRIOS
- `/ui-ux-pro-max` Step 2c: Preview visual é OBRIGATÓRIO
- `/readiness`: Valida existência de mockups

Projetos sem UI (API, CLI, backend-only): Stitch é ignorado.

---

### Recovery System

Scripts críticos usam retry automático (max 3 tentativas):
- `checklist.py` — retry em checks com timeout
- `auto_preview.py` — retry no start do server
- `finish_task.py` — git checkpoint antes de marcar complete

Para usar em novos scripts:
```python
from recovery import with_retry, safe_execute, git_checkpoint
```

---

## Inicialização de Sessão

Toda conversa começa com:

```
Project Instructions carregadas
Protocolo Inove AI Framework ativo
21 agentes disponíveis
41 skills disponíveis
22 workflows disponíveis
Roteamento inteligente habilitado
Log de sessão iniciado

Pronto para trabalhar. O que devo fazer?
```

> **OBRIGATÓRIO:** Criar/abrir o arquivo de log diário ao inicializar a sessão.

---

## Referência Rápida de Agentes

| Agente | Arquivo | Skills Primárias |
|--------|---------|------------------|
| `orchestrator` | `.agents/agents/orchestrator.md` | Coordenação multi-agente |
| `project-planner` | `.agents/agents/project-planner.md` | Planejamento, discovery |
| `product-manager` | `.agents/agents/product-manager.md` | Requisitos, user stories |
| `frontend-specialist` | `.agents/agents/frontend-specialist.md` | React, UI/UX, Tailwind |
| `backend-specialist` | `.agents/agents/backend-specialist.md` | APIs, Node.js, lógica |
| `database-architect` | `.agents/agents/database-architect.md` | Schemas, Prisma, queries |
| `mobile-developer` | `.agents/agents/mobile-developer.md` | iOS, Android, RN |
| `security-auditor` | `.agents/agents/security-auditor.md` | Auth, OWASP, compliance |
| `debugger` | `.agents/agents/debugger.md` | Root cause analysis |
| `devops-engineer` | `.agents/agents/devops-engineer.md` | CI/CD, Docker, infra |
| `test-engineer` | `.agents/agents/test-engineer.md` | Estratégias de teste |
| `qa-automation-engineer` | `.agents/agents/qa-automation-engineer.md` | E2E, automação |
| `documentation-writer` | `.agents/agents/documentation-writer.md` | Manuais, docs |
| `code-archaeologist` | `.agents/agents/code-archaeologist.md` | Refatoração legacy |
| `performance-optimizer` | `.agents/agents/performance-optimizer.md` | Otimizações |
| `seo-specialist` | `.agents/agents/seo-specialist.md` | SEO, visibilidade |
| `penetration-tester` | `.agents/agents/penetration-tester.md` | Security testing |
| `game-developer` | `.agents/agents/game-developer.md` | Game logic |
| `product-owner` | `.agents/agents/product-owner.md` | Requisitos, backlog, MVP |
| `ux-researcher` | `.agents/agents/ux-researcher.md` | UX research, user flows, wireframes |
| `explorer-agent` | `.agents/agents/explorer-agent.md` | Análise de codebase |

---

## Exemplo de Fluxo Completo

**Usuário:** "Implementar Epic 1: Autenticação de Usuários"

**Claude:**
1. Classificação: CÓDIGO COMPLEXO → TIER 0 + TIER 1 (full) + Agent
2. Domínio detectado: Security + Backend
3. Ativando agentes:
   - @security-auditor (líder)
   - @backend-specialist (suporte)
4. Read → Understand → Apply: Ler regras dos agentes, entender princípios, aplicar
5. Socratic Gate: Perguntar sobre escopo, edge cases, integrações
6. [Implementa código seguindo regras dos agentes]
7. Executando: `python .agents/scripts/finish_task.py "Epic 1"`
8. Progresso: 25% (1/4 epics concluídos)
9. Log de sessão atualizado

**Usuário:** `/define App de gestão de tarefas`

**Claude (ou Antigravity):**
1. Fase 0: Discovery (12 perguntas estruturadas)
2. Fase 1: Brief (`product-manager`)
3. Fase 2: PRD + GAP Produto (`product-owner`)
4. Fase 3: UX Concept + GAP UX (`ux-researcher`)
5. Fase 4: Architecture + DB + GAP Infra (`project-planner`)
6. Fase 5: Security + GAP Segurança (`security-auditor`)
7. Fase 6: Stack + GAP Tech (`project-planner`)
8. Fase 7: Design System + GAP Design (`frontend-specialist`)
9. Fase 8: Backlog + GAPs consolidados (`product-owner`)
10. Revisão: Claude Code/Codex valida com skill `doc-review`
