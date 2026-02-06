# Inove AI Framework - Project Instructions

> **AUTO-LOADED:** Claude Code loads this file automatically for every conversation in this project.

## Sobre Este Projeto

**Inove AI Framework** é um kit de desenvolvimento AI com sistema multi-agent (Claude Code + Codex CLI + Antigravity/Gemini) que fornece:

- **21 Agentes Especializados** para diferentes domínios
- **41 Skills Modulares** carregadas sob demanda
- **21 Workflows** (slash commands) para processos estruturados
- **Sistema Multi-Agent** com sincronização de locks e ownership

---

## Estrutura do Framework

```
.agents/
├── agents/           # 21 agentes especializados
├── skills/           # 41 módulos de conhecimento
├── workflows/        # 21 workflows (slash commands)
├── scripts/          # Automação Python
├── config/           # Configurações por plataforma
└── ARCHITECTURE.md   # Documentação técnica
```

---

## Protocolo de Roteamento Inteligente

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

### 2. Ativação de Agente (OBRIGATÓRIO)

Quando um domínio for detectado:

1. **Ler arquivo do agente:** `.agents/agents/{agent}.md`
2. **Anunciar ativação:**
   ```
   🤖 Ativando @{nome-do-agente}...
   📖 Carregando regras e protocolos
   ```
3. **Carregar skills** do frontmatter do agente
4. **Aplicar persona e regras** do agente

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

**Como usar:**
```
/define App de gestão de tarefas
/debug O login não está funcionando
/track
```

---

## Protocolo Auto-Finish (OBRIGATÓRIO)

Após completar QUALQUER tarefa do `docs/BACKLOG.md`:

```bash
python .agents/scripts/finish_task.py "{task_id}"
python .agents/scripts/progress_tracker.py
```

Informar ao usuário:
```
✅ Task {task_id} marcada como completa
📊 Progresso atualizado: {percentual}%
🎯 Próxima tarefa: {nome_proxima_tarefa}
```

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

### Socratic Gate

Para requisições complexas, PERGUNTAR antes de implementar:

- Propósito e escopo
- Casos de borda
- Implicações de performance
- Considerações de segurança

---

## Compatibilidade Multi-Plataforma

Este framework suporta múltiplas ferramentas AI:

| Ferramenta | Arquivo de Instrução | Skills Location |
|------------|---------------------|-----------------|
| Claude Code | `CLAUDE.md` | `.claude/skills/` (symlink) |
| Codex CLI | `AGENTS.md` | `.codex/skills/` (symlink) |
| Antigravity | Via AGENT_SOURCE | `.agents/skills/` |

### Symlinks Nativos

Cada plataforma acessa os mesmos recursos via caminhos nativos (symlinks para `.agents/`):

| Plataforma | Agents | Skills | Workflows |
|------------|--------|--------|-----------|
| Claude Code | `.claude/agents/` | `.claude/skills/` | `.agents/workflows/` |
| Codex CLI | `.codex/agents/` | `.codex/skills/` | `.codex/prompts/` |
| Antigravity | `.agents/agents/` | `.agents/skills/` | `.agents/workflows/` |

> **Fonte canônica:** `.agents/` -- todos os symlinks apontam para lá.

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

---

## Inicialização de Sessão

Toda conversa começa com:

```
✅ Project Instructions carregadas
✅ Protocolo Inove AI Framework ativo
✅ 21 agentes disponíveis
✅ 41 skills disponíveis
✅ 21 workflows disponíveis
✅ Roteamento inteligente habilitado

🎯 Pronto para trabalhar. O que devo fazer?
```

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
1. 🔍 Domínio detectado: Security + Backend
2. 🤖 Ativando agentes:
   - @security-auditor (líder)
   - @backend-specialist (suporte)
3. 📖 Carregando skills: vulnerability-scanner, api-patterns
4. [Implementa código seguindo regras dos agentes]
5. ✅ Implementação completa
6. 🔧 Executando: `python .agents/scripts/finish_task.py "Epic 1"`
7. 📊 Progresso: 25% (1/4 epics concluídos)

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
