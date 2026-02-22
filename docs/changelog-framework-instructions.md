# Changelog — Melhorias nas Instruções do Framework

**Data:** 2026-02-13
**Autor:** Antigravity (Gemini) + Joel
**Contexto:** Análise comparativa entre `CLAUDE.md`, `GEMINI.md` e `.agents/rules/GEMINI.md` revelou lacunas significativas nos arquivos de instrução do Claude Code e Codex CLI.
**Projeto de origem:** CronoCapilar (`chs-crono-capilar`)

---

## Motivação

Durante uma sessão de trabalho, identificamos que:

1. O **Claude Code** nunca registrava logs diários de sessão — a regra não existia no `CLAUDE.md`.
2. O `CLAUDE.md` estava **significativamente menos estruturado** que os equivalentes do Gemini (`GEMINI.md` e `.agents/rules/GEMINI.md`).
3. O `AGENTS.md` (Codex CLI) era um **redirect puro** para `INSTRUCTIONS.md`, sem nenhuma regra direta — arriscando que regras críticas fossem ignoradas se o Codex não seguisse o redirect.

A análise comparativa identificou **6 lacunas** no `CLAUDE.md` e **6 lacunas** no `AGENTS.md` em relação ao `GEMINI.md`.

---

## Arquivos Alterados

### 1. `CLAUDE.md` (317 → ~380 linhas)

### 2. `AGENTS.md` (57 → ~110 linhas)

---

## Detalhamento das Melhorias

### Melhoria 1: Request Classifier (STEP 0)

**Problema:** O Claude não classificava o tipo de pedido antes de agir, ativando agentes e skills desnecessariamente para perguntas simples.

**Solução:** Tabela de classificação obrigatória antes de qualquer ação.

**Onde:** `CLAUDE.md` (seção completa), `AGENTS.md` (versão resumida)

```markdown
| Tipo                 | Palavras-chave                                | Tiers Ativos                   | Resultado                      |
| -------------------- | --------------------------------------------- | ------------------------------ | ------------------------------ |
| **PERGUNTA**         | "o que é", "como funciona", "explique"        | TIER 0 apenas                  | Resposta textual               |
| **ANÁLISE/INTEL**    | "analise", "liste arquivos", "overview"       | TIER 0 + Explorer              | Intel de sessão (sem edit)     |
| **EDIT SIMPLES**     | "corrige", "adiciona", "muda" (1 arquivo)     | TIER 0 + TIER 1 (lite)         | Edição inline                  |
| **CÓDIGO COMPLEXO**  | "construa", "crie", "implemente", "refatore"  | TIER 0 + TIER 1 (full) + Agent | {task-slug}.md obrigatório     |
| **DESIGN/UI**        | "design", "UI", "página", "dashboard"         | TIER 0 + TIER 1 + Agent        | {task-slug}.md obrigatório     |
| **SLASH CMD**        | /create, /orchestrate, /debug, /define        | Fluxo do comando               | Variável                       |
```

**Referência no Gemini:** `GEMINI.md` linhas 66-78, `.agents/rules/GEMINI.md` linhas 30-42.

---

### Melhoria 2: Registro de Sessões de Trabalho

**Problema:** O Claude Code **nunca** registrava logs diários. A regra existia apenas nas `user_rules` do Antigravity, não no `CLAUDE.md`. Quando o Claude Code trabalhava, não havia registro de atividade.

**Solução:** Seção completa com regras, modelo e comandos.

**Onde:** `CLAUDE.md` (seção completa com modelo e critérios), `AGENTS.md` (versão resumida com regras essenciais)

**Conteúdo adicionado:**

- **Regras de operação:** Abrir sessão → registrar início → registrar fim → calcular duração → consolidar dia.
- **Modelo de arquivo diário:** Formatado com cabeçalho, sessões numeradas e resumo do dia.
- **Comandos:** `auto_session.py start`, `auto_session.py end`, `auto_session.py status`.
- **Critérios de qualidade:** PT-BR, horários 24h, ISO dates, fuso America/Sao_Paulo.
- **Local:** `docs/08-Logs-Sessoes/{ANO}/{AAAA-MM-DD}.md`
- **Índice:** Manter `docs/08-Logs-Sessoes/README.md` atualizado.

**Nota:** Esta regra já existia nas `user_rules` globais do Antigravity (MEMORY), mas precisa estar **explicitamente** nos arquivos de instrução de cada ferramenta para garantir conformidade.

---

### Melhoria 3: Socratic Gate Avançado

**Problema:** O `CLAUDE.md` tinha apenas 4 bullets genéricos. O Gemini tinha estratégias diferenciadas por tipo de request + regra de "Direct Proceed" para evitar que o AI pule a validação quando o usuário diz "prossiga".

**Solução:** Tabela com 5 estratégias + protocolo detalhado.

**Onde:** `CLAUDE.md` (seção completa), `AGENTS.md` (tabela resumida)

**Antes (CLAUDE.md):**
```markdown
- Propósito e escopo
- Casos de borda
- Implicações de performance
- Considerações de segurança
```

**Depois (CLAUDE.md):**
```markdown
| Tipo de Requisição        | Estratégia       | Ação Obrigatória                                          |
| ------------------------- | ---------------- | --------------------------------------------------------- |
| **Nova Feature / Build**  | Deep Discovery   | PERGUNTAR mínimo 3 questões estratégicas                  |
| **Edit / Bug Fix**        | Context Check    | Confirmar entendimento + perguntas de impacto             |
| **Vago / Simples**        | Clarificação     | Perguntar Propósito, Usuários e Escopo                    |
| **Orquestração Full**     | Gatekeeper       | PARAR subagentes até confirmar plano                      |
| **"Prossiga" direto**     | Validação        | Mesmo assim, perguntar 2 questões de Edge Case            |

Protocolo:
1. Nunca assumir: Se 1% estiver indefinido, PERGUNTAR.
2. Respostas em lista: NÃO pular o gate. Perguntar Trade-offs e Edge Cases.
3. Esperar: NÃO escrever código até o usuário liberar o gate.
4. Referência: `.agents/skills/brainstorming/SKILL.md`.
```

**Referência no Gemini:** `.agents/rules/GEMINI.md` linhas 140-161.

---

### Melhoria 4: Final Checklist Protocol

**Problema:** O `CLAUDE.md` não tinha nenhum protocolo de verificação final. O Gemini tem 7 etapas prioritizadas com 12 scripts de auditoria.

**Solução:** Seção completa com tabela de scripts prioritizados.

**Onde:** `CLAUDE.md` (seção completa com 7 etapas e scripts)

**Conteúdo adicionado:**

```markdown
Ordem de execução prioritizada:
1. Security  → security_scan.py
2. Lint      → lint_runner.py
3. Schema    → schema_validator.py
4. Tests     → test_runner.py
5. UX        → ux_audit.py
6. SEO       → seo_checker.py
7. Perf      → lighthouse_audit.py

Regra: Uma tarefa NÃO está completa até checklist.py retornar sucesso.
```

**Referência no Gemini:** `.agents/rules/GEMINI.md` linhas 173-208.

**Nota:** Não adicionado ao `AGENTS.md` por ser muito detalhado para a abordagem de ponte. O Codex deve obter isso via `INSTRUCTIONS.md`.

---

### Melhoria 5: Project Type Routing

**Problema:** O `CLAUDE.md` não distinguia entre projetos Mobile, Web e Backend. Podia rotear um pedido mobile para o `frontend-specialist` (errado).

**Solução:** Tabela explícita de roteamento por tipo de projeto com regra anti-mistura.

**Onde:** `CLAUDE.md` (dentro da seção de Roteamento)

```markdown
| Tipo                                   | Agente Primário       | Skills                        |
| -------------------------------------- | --------------------- | ----------------------------- |
| **MOBILE** (iOS, Android, RN, Flutter) | `mobile-developer`    | mobile-design                 |
| **WEB** (Next.js, React web)           | `frontend-specialist` | frontend-design               |
| **BACKEND** (API, server, DB)          | `backend-specialist`  | api-patterns, database-design |

> Mobile + frontend-specialist = ERRADO. Mobile = mobile-developer APENAS.
```

**Referência no Gemini:** `.agents/rules/GEMINI.md` linhas 128-138.

---

### Melhoria 6: Read → Understand → Apply

**Problema:** O Claude podia ler um agente/skill e codar imediatamente sem internalizar os princípios, gerando output genérico.

**Solução:** Protocolo obrigatório de 3 perguntas internas antes de codar.

**Onde:** `CLAUDE.md` (seção dedicada), `AGENTS.md` (versão resumida)

```markdown
ERRADO: Ler agente → Começar a codar
CORRETO: Ler → Entender PORQUÊ → Aplicar PRINCÍPIOS → Codar

Antes de codar, responder internamente:
1. Qual é o OBJETIVO deste agente/skill?
2. Quais PRINCÍPIOS devo aplicar?
3. Como isso DIFERE de output genérico?
```

**Referência no Gemini:** `.agents/rules/GEMINI.md` linhas 113-125.

---

## Melhorias Estruturais Adicionais (CLAUDE.md)

Além das 6 melhorias de conteúdo, foram feitas melhorias estruturais:

### Reorganização do Fluxo

**Antes:** Roteamento → Workflows → Auto-Finish → Backlog → Regras → Multi-Platform

**Depois:** Classificar (STEP 0) → Rotear (STEP 1) → Entender → Perguntar (Socratic) → Workflows → Implementar → Verificar (Checklist) → Logar (Sessão) → Backlog → Regras → Multi-Platform

A nova ordem segue o **fluxo natural de trabalho**: receber pedido → classificar → rotear → entender → perguntar → executar → verificar → registrar.

### Regras de Ativação de Agente

Adicionadas 3 regras ao roteamento (vindas do Gemini):
1. **Análise silenciosa** — sem meta-comentários verbosos
2. **Override explícito** — se o usuário mencionar `@agent`, usar esse
3. **Multi-domínio** — usar `orchestrator` para tarefas que cruzam domínios

### Inicialização de Sessão

Adicionado `Log de sessão iniciado` ao bloco de inicialização e regra obrigatória de criar/abrir o arquivo de log diário.

### Fluxo de Exemplo Atualizado

O exemplo de "Implementar Epic 1" foi expandido de 7 para 9 passos, incluindo:
- Classificação (STEP 0)
- Read → Understand → Apply
- Log de sessão atualizado

---

## Resumo para o `AGENTS.md`

O `AGENTS.md` manteve a filosofia de **ponte/redirect** para `.agents/INSTRUCTIONS.md`, mas ganhou uma seção `REGRAS INVIOLÁVEIS` com versões resumidas de:

| Regra | Linhas adicionadas |
|-------|-------------------|
| Request Classifier | ~8 |
| Socratic Gate | ~8 |
| Read → Understand → Apply | ~4 |
| Auto-Finish Protocol | ~6 |
| Registro de Sessões | ~20 |
| Tratamento de Idioma | ~4 |

**Total:** De 57 para ~110 linhas (+93%).

---

## Checklist para Aplicar no Repositório do Framework

- [x] Atualizar `CLAUDE.md` com todas as 6 melhorias + reestruturação
- [x] Atualizar `AGENTS.md` com regras invioláveis (ponte mantida)
- [x] Atualizar `GEMINI.md` (raiz) com Regra Zero + Sessões + tabela completa de agentes
- [x] Atualizar `.agents/rules/GEMINI.md` com Regra Zero + paths corrigidos + Sessões
- [x] Atualizar `auto_session.py` com versão melhorada (parser robusto + resumo automático)
- [x] Criar `docs/changelog-framework-instructions.md`
- [x] Verificar que nenhuma referência a "crono-capilar" existe nos arquivos de instrução
- [x] Confirmar contagens 22/42/25 (21 agentes core + squads ativos, 41 skills core + 1 squad, 22 workflows core + 3 adicionais)

---

## Arquivos de Referência

Os arquivos originais foram desenvolvidos no projeto CronoCapilar e portados para o repositório canônico do framework em 2026-02-18.

- **Commits de origem:** `eaaf3dd` e `f24e988` no repositório `chs-crono-capilar`
- **Portado para:** `inove-ai-framework` (repositório canônico)
