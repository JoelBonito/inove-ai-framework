# 🤖🔵 Sistema Dual-Agent - Guia Completo

Sistema que permite que dois agentes (Antigravity e Claude Code) trabalhem simultaneamente no mesmo projeto sem conflitos.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Melhorias Implementadas](#melhorias-implementadas)
3. [Configuração Inicial](#configuração-inicial)
4. [Uso Diário](#uso-diário)
5. [Comandos Disponíveis](#comandos-disponíveis)
6. [Convenções](#convenções)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O sistema dual-agent implementa 6 melhorias principais que permitem colaboração sem conflitos:

| Melhoria | Status | Benefício |
|----------|--------|-----------|
| #1 - Identificador de Fonte nos Logs | ✅ | Rastreia qual agente fez cada atividade |
| #2 - Lock File para Edições Concorrentes | ✅ | Previne corrupção do BACKLOG |
| #4 - Regras de Território por Epic | ✅ | Define responsabilidades claras |
| #5 - Automação de Sessão | ✅ | Tracking automático de sessões |
| #7 - Dashboard Unificado | ✅ | Visão consolidada do projeto |
| #9 - Git Integration | ✅ | Auto-tracking via commits |

---

## Melhorias Implementadas

### 1️⃣ Identificador de Fonte nos Logs

**Arquivo:** `.agent/scripts/session_logger.py`

**O que faz:**
- Adiciona campo `agent_source` ao NamedTuple Session
- Detecta automaticamente qual agente está executando
- Logs exibem emoji identificando o agente:
  - 🤖 = antigravity
  - 🔵 = claude_code

**Formato do log:**
```markdown
1. 09:00 — 11:30 (02:30) [🤖 antigravity]
   - Atividades:
     - Implementação do Epic 2

2. 14:00 — 16:45 (02:45) [🔵 claude_code]
   - Atividades:
     - Refatoração do código
```

**Backward compatibility:** Logs antigos sem `[agent]` assumem "antigravity" por padrão.

---

### 2️⃣ Lock File para Edições Concorrentes

**Arquivo:** `.agent/scripts/lock_manager.py`

**O que faz:**
- Gerencia locks de recursos (BACKLOG.md)
- Timeout de 5 minutos (locks stale expiram automaticamente)
- Integrado em `finish_task.py`

**Como funciona:**
```python
lock_mgr = LockManager()

# Tenta adquirir lock (espera até 30s se bloqueado)
if lock_mgr.wait_for_lock("backlog", "antigravity", max_wait=30):
    try:
        # Modifica BACKLOG.md
        ...
    finally:
        lock_mgr.release_lock("backlog", "antigravity")
```

**Comandos úteis:**
```bash
# Listar locks ativos
python .agent/scripts/lock_manager.py list

# Limpar locks expirados
python .agent/scripts/lock_manager.py cleanup

# Forçar liberação (emergência)
python .agent/scripts/lock_manager.py force-release backlog
```

---

### 3️⃣ Regras de Território por Epic

**Arquivo:** `.agent/scripts/progress_tracker.py` e `finish_task.py`

**O que faz:**
- Adiciona campo `owner` ao NamedTuple Epic
- Parsing atualizado para capturar `[OWNER: agent_name]`
- Validação soft em `finish_task.py`

**Formato no BACKLOG.md:**
```markdown
## Epic 1: Fundação e Autenticação [OWNER: claude_code] ✅

## Epic 2: Conexão com WhatsApp [OWNER: antigravity] 🔄

## Epic 3: Gestão de Contatos [OWNER: claude_code] ✅
```

**Comportamento:**
```bash
# Antigravity tenta marcar tarefa do Epic 1 (que pertence a claude_code)
python .agent/scripts/finish_task.py 1.2

# Resultado:
⚠️ Epic 1 pertence a 'claude_code'. Use --force para sobrescrever.

# Com --force:
python .agent/scripts/finish_task.py 1.2 --force
✅ Tarefa '1.2' marcada como concluída
```

---

### 4️⃣ Automação de Sessão

**Arquivo:** `.agent/scripts/auto_session.py`

**O que faz:**
- Gerencia sessões automaticamente
- Estado persistido em `.agent/.session_state.json`
- Atualiza logs diários em tempo real

**Comandos:**
```bash
# Iniciar sessão
python .agent/scripts/auto_session.py start

# Verificar status
python .agent/scripts/auto_session.py status

# Encerrar sessão
python .agent/scripts/auto_session.py end

# Encerrar com atividades
python .agent/scripts/auto_session.py end --activities "Epic 2 implementado; Testes criados"

# Encerrar rápido (sem registrar atividades)
python .agent/scripts/auto_session.py end --quick
```

**Especificar agente manualmente:**
```bash
python .agent/scripts/auto_session.py start --agent claude_code
```

---

### 5️⃣ Dashboard Unificado

**Arquivo:** `.agent/scripts/dashboard.py`

**O que faz:**
- Consolida todas as informações em um único dashboard
- Mostra progresso, sessão atual, stats da semana e sync status

**Execução:**
```bash
python .agent/scripts/dashboard.py
```

**Output exemplo:**
```markdown
# 📊 Dashboard - 2026-01-26 16:30

## 🎯 Progresso do Projeto

██████████████░░░░░░ 74.5%
Tarefas: 35/47

## ⏱️ Sessão Atual

🟢 Ativa desde 14:30 (02h 00m decorridos)
   🤖 Agente: antigravity
   📁 Projeto: inove-ai-framework

## 📅 Esta Semana (últimos 7 dias)

- Tempo total: 25h 30m
- Sessões: 13
- Média/dia: 3h 38m

## 🔄 Sync Status (Dual-Agent)

| Agente | Última Atividade | Tempo (7 dias) | Sessões |
|--------|------------------|----------------|---------|
| 🤖 antigravity | 2026-01-26 10:30<br/>*Implementação do Epic 2* | 15h 30m | 8 |
| 🔵 claude_code | 2026-01-26 14:00<br/>*Refatoração* | 10h 00m | 5 |

**Conflitos:** Nenhum ✅

## 🔥 Próximas Tarefas

1. Conexão com WhatsApp [🤖 antigravity]
2. Gestão de Contatos [🔵 claude_code]
```

---

### 6️⃣ Git Integration (Hooks)

**Arquivos:** `.agent/scripts/install_git_hooks.sh`, `GIT_HOOKS_README.md`

**O que faz:**
- Hook `post-commit` marca tarefas automaticamente após commits
- Detecta task IDs no formato `Story-X.Y` ou `Epic-X`

**Instalação:**
```bash
bash .agent/scripts/install_git_hooks.sh
```

**Uso:**
```bash
# Commit com task ID
git commit -m "feat(Story-3.1): Implementar autenticação"

# Hook detecta e executa automaticamente:
# 1. python .agent/scripts/finish_task.py 3.1
# 2. python .agent/scripts/progress_tracker.py

# Resultado:
🔄 Task detectada no commit: 3.1
✅ Task 3.1 marcada como concluída
```

---

## Configuração Inicial

### 1. Definir Ownership dos Epics

Edite seu `docs/BACKLOG.md` e adicione `[OWNER: agent_name]`:

```markdown
## Epic 1: Fundação [OWNER: antigravity] ✅
## Epic 2: WhatsApp Integration [OWNER: claude_code] 🔄
## Epic 3: Dashboard [OWNER: antigravity]
```

### 2. Configurar Variáveis de Ambiente

**Para Antigravity:**
```bash
export AGENT_SOURCE=antigravity
export GEMINI_SESSION=true
```

**Para Claude Code:**
```bash
export AGENT_SOURCE=claude_code
export CLAUDE_CODE_SESSION=true
```

Adicione ao seu shell profile (`~/.bashrc`, `~/.zshrc`, etc.).

### 3. Instalar Git Hooks

```bash
bash .agent/scripts/install_git_hooks.sh
```

### 4. Atualizar .gitignore

Já adicionado ao `.gitignore`:
```gitignore
.agent/locks/*.lock
.agent/.session_state.json
```

---

## Uso Diário

### Workflow Típico - Antigravity

```bash
# 1. Iniciar sessão
python .agent/scripts/auto_session.py start

# 2. Ver dashboard
python .agent/scripts/dashboard.py

# 3. Trabalhar em tarefas do seu Epic
# ... implementa código ...

# 4. Commit (auto-marca tarefa)
git add .
git commit -m "feat(Story-2.1): Integração com API WhatsApp"

# 5. Verificar progresso
python .agent/scripts/dashboard.py

# 6. Encerrar sessão
python .agent/scripts/auto_session.py end --activities "Epic 2 Story 2.1 implementada"
```

### Workflow Típico - Claude Code

```bash
# 1. Iniciar sessão
python .agent/scripts/auto_session.py start --agent claude_code

# 2. Ver dashboard
python .agent/scripts/dashboard.py

# 3. Trabalhar em tarefas do seu Epic
# ... refatora código ...

# 4. Commit
git add .
git commit -m "refactor(Story-3.2): Melhorar performance do dashboard"

# 5. Encerrar sessão
python .agent/scripts/auto_session.py end
```

---

## Comandos Disponíveis

### Gestão de Sessões

```bash
# Iniciar
python .agent/scripts/auto_session.py start [--agent AGENT]

# Status
python .agent/scripts/auto_session.py status

# Encerrar
python .agent/scripts/auto_session.py end [--quick] [--activities "..."]
```

### Gestão de Tarefas

```bash
# Marcar como concluída
python .agent/scripts/finish_task.py <TASK_ID> [--force]

# Exemplos:
python .agent/scripts/finish_task.py 3.1
python .agent/scripts/finish_task.py Story-2.3
python .agent/scripts/finish_task.py 1.1 --force  # ignora ownership
```

### Progresso e Dashboard

```bash
# Atualizar barra de progresso
python .agent/scripts/progress_tracker.py

# Dashboard completo
python .agent/scripts/dashboard.py
```

### Gestão de Locks

```bash
# Listar locks ativos
python .agent/scripts/lock_manager.py list

# Limpar locks expirados
python .agent/scripts/lock_manager.py cleanup

# Forçar liberação
python .agent/scripts/lock_manager.py force-release <resource>
```

### Logs e Relatórios

```bash
# Relatório semanal
python .agent/scripts/session_logger.py summary --week

# Relatório mensal
python .agent/scripts/session_logger.py summary --month

# Ver log de um dia
python .agent/scripts/session_logger.py show 2026-01-26
```

---

## Convenções

### Commit Messages

Siga o formato para auto-tracking:

```
<type>(<task-id>): <description>

Tipos:
- feat: Nova funcionalidade
- fix: Correção de bug
- refactor: Refatoração
- docs: Documentação
- test: Testes
- chore: Tarefas gerais

Task ID:
- Story-X.Y (ex: Story-2.3)
- Epic-X (ex: Epic-1)
```

**Exemplos:**
```bash
git commit -m "feat(Story-3.1): Adicionar autenticação OAuth"
git commit -m "fix(Story-2.5): Corrigir validação de formulário"
git commit -m "refactor(Epic-2): Reorganizar estrutura de pastas"
```

### Ownership de Epics

- **Soft enforcement**: Aviso mas permite com `--force`
- **Recomendação**: Respeite o ownership para evitar conflitos
- **Exceções**: Use `--force` apenas para trabalho urgente ou correções críticas

---

## Troubleshooting

### Problema: BACKLOG bloqueado

**Sintoma:** `⏳ BACKLOG bloqueado por outro agente`

**Solução:**
1. Aguarde até 30 segundos (timeout automático)
2. Ou peça ao outro agente para finalizar sua edição
3. Emergência: `python .agent/scripts/lock_manager.py force-release backlog`

### Problema: Lock stale não expira

**Sintoma:** Lock persiste mesmo sem agente ativo

**Solução:**
```bash
# Limpar todos os locks expirados
python .agent/scripts/lock_manager.py cleanup

# Ou forçar liberação específica
python .agent/scripts/lock_manager.py force-release backlog
```

### Problema: Sessão não aparece no dashboard

**Sintoma:** Dashboard mostra "🔴 Nenhuma sessão ativa"

**Solução:**
```bash
# Verificar se sessão está ativa
python .agent/scripts/auto_session.py status

# Se não estiver, iniciar
python .agent/scripts/auto_session.py start
```

### Problema: Git hook não marca tarefa

**Sintoma:** Commit não atualiza BACKLOG

**Solução:**
1. Verificar se hook está instalado:
   ```bash
   ls -la .git/hooks/post-commit
   ```

2. Verificar se commit message segue formato:
   ```bash
   # ❌ Errado
   git commit -m "implementar login"

   # ✅ Correto
   git commit -m "feat(Story-2.1): Implementar login"
   ```

3. Executar manualmente:
   ```bash
   python .agent/scripts/finish_task.py 2.1
   ```

### Problema: Ownership inválido

**Sintoma:** `⚠️ Epic X pertence a 'Y'`

**Soluções:**
1. Use `--force` se você realmente precisa modificar:
   ```bash
   python .agent/scripts/finish_task.py 2.1 --force
   ```

2. Ou peça ao owner para marcar a tarefa:
   ```bash
   # Owner marca a tarefa
   python .agent/scripts/finish_task.py 2.1
   ```

3. Ou remova ownership do Epic (edite BACKLOG.md):
   ```markdown
   ## Epic 2: Nome do Epic
   # Remove: [OWNER: antigravity]
   ```

---

## Métricas de Sucesso

Após implementação, o sistema permite:

✅ **Dois agentes trabalhando concorrentemente** sem corrupção de dados
✅ **Rastreamento completo** de qual agente fez cada atividade
✅ **Dashboard consolidado** mostrando status de ambos agentes
✅ **Prevenção de conflitos** via locks e ownership
✅ **Backward compatibility** com logs/backlogs antigos
✅ **Mensagens claras** sobre locks e ownership

---

## Arquivos Modificados/Criados

### Modificados
- `.agent/scripts/session_logger.py` - Adicionado `agent_source` e `get_last_activity_by_agent()`
- `.agent/scripts/progress_tracker.py` - Adicionado `owner` ao Epic
- `.agent/scripts/finish_task.py` - Integrado LockManager e validação de ownership
- `.gitignore` - Adicionado locks e session_state

### Criados
- `.agent/scripts/auto_session.py` - Gestão automática de sessões
- `.agent/scripts/lock_manager.py` - Sistema de locks
- `.agent/scripts/dashboard.py` - Dashboard unificado
- `.agent/scripts/install_git_hooks.sh` - Instalador de hooks
- `.agent/scripts/GIT_HOOKS_README.md` - Documentação dos hooks
- `docs/DUAL_AGENT_SYSTEM.md` - Este documento

---

## Próximos Passos (Opcional - Fase 3 e 4)

Melhorias adicionais que podem ser implementadas no futuro:

### Fase 3: Automação Avançada
- **#6 - Auto-Finish Melhorado**: Detecção inteligente de conclusão
- **#8 - Sistema de Lembretes**: Notificações proativas

### Fase 4: Analytics e UX
- **#10 - Métricas Automáticas**: Insights de produtividade
- **#11 - Notificações macOS**: Feedback visual

---

**Última atualização:** 2026-01-26
**Versão:** 1.0.0
**Status:** ✅ Implementação completa (Fase 1 + Fase 2)
