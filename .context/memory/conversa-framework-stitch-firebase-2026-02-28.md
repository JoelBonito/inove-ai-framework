# Conversa: inove-ai-cc — Framework, Stitch, Firebase, Context System

**Data:** 2026-02-28
**Contexto:** Criação de `inove-ai-cc` (Claude Code Edition) + Análise Stitch MCP + Firebase Skills + Sistema de Contexto
**Agentes:** claude-code
**Status:** Arquitetura finalizada, pronto para implementar
**Versão do contexto:** 2 (reescrito com conclusões finais)

---

## 📋 RESUMO EXECUTIVO

### Decisão Principal: Criar `inove-ai-cc`
- Versão **lite e customizada** do Inove AI para Claude Code exclusively
- Integrar conceitos do **ai-coders/context** nativamente
- Sistema de contexto em **2 camadas**: Global (Claude Memory) + Projeto (SESSION.md)
- Skills customizadas para uso pessoal (Firebase, Stitch fix)
- **Lazy loading** de agentes/skills para economizar tokens

### Issues Críticas Encontradas
1. **Firebase:** Skills genéricas insuficientes (Firestore, Security Rules, versionamento v9/v10/v11)
2. **Stitch:** Skill não usa `fetch_screen_code` — joga fora o código gerado pelo Stitch
3. **ai-coders/context:** Não separa global vs projeto, não tem memória de sessão
4. **Token waste:** CLAUDE.md carrega ~45k tokens upfront; com lazy loading pode ser ~8.5k
5. **Lazy loading vs Routing:** Resolvido — tabela de roteamento fica upfront (~1.5k), agentes carregam sob demanda

---

## 🏗️ ARQUITETURA FINAL DO SISTEMA DE CONTEXTO

### Decisão Chave (Evolução Durante a Conversa)

```
PROPOSTA INICIAL (over-engineered):
  ~/.ai-context/              ← pasta nova para global
  .context/memory/            ← múltiplos arquivos
  .context/decisions/         ← mais arquivos
  sync_to_context.py          ← script complexo
  save_session.py             ← outro script
  load_session.py             ← outro script
  prepare_context.py          ← outro script

DECISÃO FINAL (simples):
  MEMORY.md do Claude          ← global (já existe nativamente!)
  .context/SESSION.md          ← UM arquivo único, reescrito a cada sessão
  Sem scripts extras           ← Claude lê/reescreve diretamente
```

### Camada 1: Contexto Global → Claude Memory (MEMORY.md)

```
~/.claude/projects/.../memory/MEMORY.md

Conteúdo:
- Preferências técnicas permanentes (stack, tools, convenções)
- Cross-project (carregado em QUALQUER projeto automaticamente)
- Gerido nativamente pelo Claude (sem scripts)
- ~1.5k tokens (automático)
```

### Camada 2: Contexto do Projeto → SESSION.md (arquivo único)

```
seu-projeto/.context/SESSION.md

Conteúdo:
- Estado atual do projeto (epic, story, branch, progresso)
- Stack do projeto
- Próximos passos concretos
- Decisões ativas
- Problemas conhecidos
- Arquivos críticos

Regras:
- REESCRITO a cada sessão (nunca append, nunca cresce)
- Commitado no git (rastreável)
- Lido por Claude, AG, Codex (qualquer ferramenta)
- ~2-3k tokens (compacto)
```

### SESSION.md — Formato Canônico

```markdown
# Project Context: {Nome do Projeto}
> Última atualização: {data} {hora} por {ferramenta}
> Versão do contexto: {N} (reescrito a cada sessão)

## Stack
- **Frontend:** {stack}
- **Backend:** {stack}
- **Auth:** {método}
- **Deploy:** {onde}

## Estado Atual
- **Epic ativa:** {epic}
- **Story atual:** {story}
- **Branch:** {branch}
- **Progresso geral:** {%} ({n}/{total} epics)
- **Último commit:** {mensagem}

## O Que Está Pronto
- ✅ Epic 1: {nome} (100%)
- 🔄 Epic 2: {nome} (60%)

## O Que Falta Fazer (Próximos Passos)
1. {próximo passo concreto}
2. {próximo passo concreto}

## Decisões Ativas
- {decisão}: {escolha feita}

## Arquivos Críticos
- `{path}` — {descrição}

## Problemas Conhecidos
- {problema} — {status/workaround}
```

### Multi-Sessão Simultânea

Quando múltiplas sessões trabalham ao mesmo tempo:
- Cada sessão adiciona seção temporária: `## Notas da Sessão {id}`
- Ao fechar TODAS → consolida num SESSION.md limpo
- Conflitos git resolvidos por merge manual do SESSION.md

---

## 📊 TOKEN BUDGET (Comparação)

```
ANTES (Inove original):
  CLAUDE.md              → ~15k tokens
  + Agente ativado       → ~5k tokens
  + Skills do agente     → ~20k tokens
  + Workflow             → ~5k tokens
  TOTAL UPFRONT: ~45k tokens
  DISPONÍVEL: ~155k tokens

DEPOIS (inove-ai-cc):
  MEMORY.md (global)     → ~1.5k tokens (automático)
  CLAUDE-CC.md (routing) → ~4.5k tokens (automático)
  SESSION.md (projeto)   → ~2.5k tokens (automático)
  TOTAL UPFRONT: ~8.5k tokens
  DISPONÍVEL: ~191.5k tokens

  Agente + skills        → ~8-15k tokens (lazy, sob demanda)

GANHO: +36.5k tokens livres = +23% mais contexto para código
```

### Lazy Loading NÃO Compromete Roteamento

```
UPFRONT (sempre carregado):
  ├── Regra Zero              (~500 tokens)
  ├── STEP 0 (classificação)  (~500 tokens)
  ├── STEP 1 (tabela keywords → agente)  (~1.5k tokens)  ← O ROTEAMENTO
  ├── Socratic Gate           (~300 tokens)
  └── Regras universais       (~700 tokens)

LAZY (carregado após roteamento decidir):
  ├── Conteúdo do agente      (~5k por agente)
  ├── Skills do agente        (~3-5k por skill)
  └── Workflows               (~3k por workflow)

Fluxo: User pede → tabela roteia → Read agente.md → Read skill/SKILL.md → Executa
A tabela de keywords é o cérebro. O agente é o corpo.
Não precisa carregar o corpo para o cérebro decidir.
```

### Regra de Carregamento Seletivo de Skills

Ao ativar um agente:
1. SEMPRE ler o .md do agente (obrigatório)
2. Skills: carregar APENAS as relevantes para a tarefa
3. NUNCA carregar TODAS as skills de um agente de uma vez
4. Na dúvida, carregar skill principal e pedir mais se necessário

---

## 🔥 ANÁLISE: Firebase Skills

### O Problema
Skills atuais (`nodejs-best-practices`, `api-patterns`, `database-design`) são genéricas SQL/REST. Firebase é um paradigma completamente diferente:

| Aspecto | Skills Atuais | Firebase Precisa | Gap |
|---------|---|---|---|
| Modelo de Dados | Relacional (tabelas) | Document-based (Firestore) | ⚠️ Oposto |
| Normalization | Normalization padrão | Denormalization normal | ⚠️ Oposto |
| Queries | SQL (JOIN, WHERE) | Firestore (onde, orderBy) | ⚠️ Diferente |
| Security | Auth + Autorização separados | Firebase Auth + Security Rules integrados | ⚠️ Novo paradigma |
| Versionamento | PostgreSQL stable | v9→v10→v11 breaking changes | ⚠️ Rápido |
| Cloud Functions | Não coberto | Serverless, triggers, cold start | ⚠️ Novo |

### Recomendação
- Se 70%+ dos projetos usam Firebase → Criar skill `firebase-patterns/`
- Se ocasional → Documentar em CLAUDE-CC.md
- Skill incluiria: `firestore-design.md`, `security-rules.md`, `cloud-functions.md`, `version-guide.md`

---

## 🎨 ANÁLISE: Stitch MCP

### O Problema Central
A skill `stitch-ui-design` **NUNCA usa** `fetch_screen_code`.

Stitch gera **PNG + HTML/código** automaticamente, mas a skill:
- ✅ Usa `generate_screen_from_text` (gera mockup)
- ❌ Não usa `fetch_screen_code` (ignora o código gerado!)
- ❌ Extrai tokens manualmente (olhando screenshot)

Resultado: Em vez de copiar código pronto (30 min), você reescreve manualmente (2-3h) com ~50% de fidelidade.

### A Solução
Adicionar Step 8 à skill:

```
Step 8: Fetch Generated Code (CRITICAL!)

After screen is approved:
1. Call: fetch_screen_code(projectId, screenId)
2. Returns: HTML/React code completo
3. Save: docs/03.5-visual-mockups/generated-code/{screenId}.html
4. Document na saída

90% production-ready. Copy → React component → Add state/handlers → Done.
```

---

## 🌍 ANÁLISE: ai-coders/context

### O Que É
- CLI tool (`npx @ai-coders/context`) que gera `.context/` com docs, agentes, skills, plans
- MCP server com 9 tools (explore, context, sync, plan, agent, workflow-*)
- Workflow PREVC (Planning → Review → Execution → Validation → Confirmation)
- 14 agentes genéricos (todos cobertos pelos 21 do Inove, sem gap)

### Como Lida com Tokens
Não gerencia tokens explicitamente. Economia vem da arquitetura MCP (lazy loading):
- Cada tool call carrega só o necessário
- Em vez de 45k upfront, carrega ~6k sob demanda
- AI decide o que pedir

### O Que Copiar do ai-coders
- ✅ Conceito de `.context/` como estrutura agnóstica
- ✅ Lazy loading (não carregar tudo upfront)
- ❌ NÃO copiar: agentes (Inove tem melhores), MCP obrigatório (Read direto é mais simples)

### O Que ai-coders NÃO Tem (E Inove Tem)
- ❌ Separação global vs projeto
- ❌ Memória de sessão persistente
- ❌ Lock manager (multi-agent unsafe)
- ❌ UX Research, Product Manager, Orchestrator
- ❌ 42 skills profundas

---

## 📋 DECISÕES PARA `inove-ai-cc`

### Skills (~26, vs 42 original)

**Core:** clean-code, plan-writing, brainstorming, architecture, lint-and-validate

**Frontend:** nextjs-react-expert, tailwind-patterns, frontend-design, web-design-guidelines

**Backend:** nodejs-best-practices, python-patterns, api-patterns, database-design

**Testing:** testing-patterns, webapp-testing, tdd-workflow, code-review-checklist

**Security:** vulnerability-scanner

**DevOps:** deployment-procedures, server-management, bash-linux

**Docs:** documentation-templates, doc-review

**Performance:** performance-profiling

**Novas:** firebase-patterns (se 70%+ dos projetos), stitch-ui-design (fix Steps 8-9)

### Agentes (~13, vs 21 original)

**Core:** orchestrator, project-planner, frontend-specialist, backend-specialist, database-architect, security-auditor, debugger, test-engineer, documentation-writer, code-archaeologist, performance-optimizer

**Considerar:** product-manager, product-owner, ux-researcher, explorer-agent

**Removidos:** mobile-developer, game-developer, penetration-tester, qa-automation-engineer, devops-engineer, seo-specialist

### Workflows (~12, vs 25 original)

**Essenciais:** /define, /brainstorm, /create, /debug, /enhance, /test, /review

**Úteis:** /plan, /context, /readiness, /track, /status

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Setup Estrutural
- [ ] Criar pasta `inove-ai-cc/`
- [ ] Copiar agentes selecionados (~13)
- [ ] Copiar skills selecionadas (~26)
- [ ] Copiar workflows selecionados (~12)
- [ ] Criar `.context/SESSION.md` template
- [ ] Escrever CLAUDE-CC.md enxuto (~4.5k tokens)
- [ ] Enriquecer MEMORY.md com preferências permanentes

### Fase 2: Stitch Fix
- [ ] Adicionar Steps 8-9 ao stitch-ui-design
- [ ] Testar fetch_screen_code em projeto real

### Fase 3: Firebase Skill (se necessário)
- [ ] Criar `firebase-patterns/` skill
- [ ] firestore-design.md, security-rules.md, cloud-functions.md, version-guide.md

### Fase 4: Teste Real
- [ ] Usar inove-ai-cc em projeto real
- [ ] Validar: SESSION.md funciona entre sessões?
- [ ] Validar: lazy loading mantém qualidade?
- [ ] Validar: multi-ferramenta lê SESSION.md?

---

## 📁 ESTRUTURA FINAL

```
inove-ai-cc/                          # Framework (instalado em cada projeto)
├── .agents/                          # Fonte de verdade
│   ├── agents/                       # ~13 agentes
│   ├── skills/                       # ~26 skills
│   ├── workflows/                    # ~12 workflows
│   └── scripts/                      # Scripts essenciais
│
├── .context/                         # Contexto do projeto
│   └── SESSION.md                    # UM arquivo. Reescrito. Compacto.
│
├── .claude/
│   └── project_instructions.md       # Pointer → CLAUDE-CC.md
│
├── CLAUDE-CC.md                      # Master enxuto (~4.5k tokens)
│   ├── Regra Zero
│   ├── STEP 0 (classificação)
│   ├── STEP 1 (tabela roteamento)
│   ├── Socratic Gate
│   ├── Regra: "Read SESSION.md ao iniciar"
│   └── Regra: "Reescrever SESSION.md ao fechar"
│
└── .gitignore
```

```
~/.claude/.../memory/MEMORY.md        # Global (nativo Claude)
├── Preferências técnicas
├── Convenções de código
├── Stacks preferidas
└── Cross-project
```

---

## 💡 INSIGHTS PRINCIPAIS

1. **ai-coders/context é incompleto para seu caso** — não separa global/projeto, não tem memória de sessão, agentes genéricos. Mas o conceito de `.context/` e lazy loading via MCP são bons.

2. **A solução é mais simples do que parece** — MEMORY.md (global, nativo) + SESSION.md (projeto, um arquivo) + CLAUDE-CC.md enxuto (lazy loading). Sem scripts complexos.

3. **Stitch MCP gera código que estamos jogando fora** — `fetch_screen_code` existe mas skill não usa. Fix = 1 step adicional.

4. **Firebase precisa skill customizada** — Firestore, Security Rules e Cloud Functions são paradigmas diferentes de SQL/REST.

5. **Lazy loading não compromete roteamento** — Tabela de keywords (~1.5k tokens) fica upfront. Agentes/skills carregam depois da decisão.

6. **SESSION.md é reescrito, não append** — Arquivo nunca cresce. Sempre reflete estado atual. Qualquer ferramenta lê o mesmo arquivo.

---

## 📚 REFERÊNCIAS

- **Inove AI Framework:** `/Users/macbookdejoel/Documents/PROJETOS/inove-ai-framework/`
- **ai-coders/context:** https://github.com/vinilana/ai-coders-context
- **stitch-ui-design/SKILL.md:** `.agents/skills/stitch-ui-design/SKILL.md`
- **backend-specialist.md:** `.agents/agents/backend-specialist.md`
- **ARCHITECTURE.md:** `.agents/ARCHITECTURE.md`

## 🏷️ Tags

`inove-ai-cc` `session-md` `lazy-loading` `token-optimization` `firebase-skills` `stitch-fetch-code` `context-global-vs-project` `claude-memory` `multi-session` `multi-tool`

---

## ❓ PERGUNTAS ABERTAS (Resolver na Próxima Sessão)

### Sobre SESSION.md
1. O SESSION.md deve ser commitado no git ou ficar em .gitignore?
   - Argumento PRO commit: rastreabilidade, qualquer dev vê estado
   - Argumento PRO gitignore: é efêmero, muda a cada sessão, poluir histórico
2. Quando múltiplas sessões simultâneas editam SESSION.md, como resolver conflitos?
   - Solução proposta: seções temporárias por sessão → consolidar ao fechar
   - Alternativa: lock file? Último a fechar ganha?
3. Qual é o trigger para reescrever SESSION.md?
   - Automático ao final de cada sessão? (regra no CLAUDE-CC.md)
   - Manual (usuário pede)?
   - Baseado em evento (commit, /finish, /track)?

### Sobre Firebase
4. Quantos % dos seus projetos usam Firebase? (Define se cria skill ou não)
5. Quais serviços Firebase usa mais? (Firestore, Auth, Functions, Storage, Hosting?)
6. Trabalha com múltiplas versões (v9, v10, v11) ou sempre a mais recente?

### Sobre Stitch
7. Autoriza o fix na skill stitch-ui-design (adicionar Steps 8-9)?
8. Precisa testar fetch_screen_code num projeto existente antes?

### Sobre Agentes/Skills (Customização)
9. Confirma a lista de 13 agentes? Ou quer manter algum dos removidos?
10. Confirma a lista de ~26 skills? Ou tem skills que nunca usa e quer remover?
11. Usa product-manager / product-owner / ux-researcher? Ou são redundantes para seu workflow?

### Sobre ai-coders/context
12. Quer instalar o ai-coders/context como dependência ou apenas copiar conceitos?
13. MCP server do ai-coders: quer testar ou ignora completamente?

### Sobre Implementação
14. Criar inove-ai-cc do zero ou fork do inove-ai-framework atual?
15. Prioridade: começar pelo SESSION.md (contexto) ou pelo CLAUDE-CC.md (routing)?
16. Timeline: quer implementar tudo de uma vez ou incrementalmente?

---

## 🔄 COMO RETOMAR ESTA CONVERSA

Na próxima sessão, cole uma dessas instruções:

**Opção 1 (Completa):**
```
Lê o arquivo .context/memory/conversa-framework-stitch-firebase-2026-02-28.md
e continua a discussão sobre o sistema de contexto do inove-ai-cc.
Há perguntas abertas no final do arquivo para resolver.
```

**Opção 2 (Direta):**
```
Continua o plano de inove-ai-cc.
Contexto: .context/memory/conversa-framework-stitch-firebase-2026-02-28.md
Foco: resolver as perguntas abertas e começar implementação.
```

**Opção 3 (Específica):**
```
Lê .context/memory/conversa-framework-stitch-firebase-2026-02-28.md
Foco: implementar SESSION.md + CLAUDE-CC.md enxuto.
```

---

**Exportado em:** 2026-02-28
**Versão:** 3 (adicionadas perguntas abertas + instruções de retomada)
**Reutilizável em:** Qualquer janela de contexto
