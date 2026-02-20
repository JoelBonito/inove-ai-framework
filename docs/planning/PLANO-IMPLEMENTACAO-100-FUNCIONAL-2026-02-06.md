# Plano de Implementacao - Framework 100% Funcional

**Data:** 2026-02-06  
**Objetivo:** corrigir todos os gaps funcionais e fechar criterios de release para producao.

## 1) Definicao de "100% funcional"

O framework so sera considerado 100% quando TODOS os criterios abaixo passarem:

1. `21/21` agentes validos (arquivo existente, frontmatter valido, skills referenciadas existentes).
2. `41/41` skills validas (`SKILL.md` presente e legivel).
3. `21/21` workflows validos (arquivos existentes, sem referencias quebradas para docs principais).
4. `21/21` scripts executaveis com smoke test definido (python/bash), sem erro de runtime.
5. Matriz multi-plataforma validada para `codex`, `claude_code` e `antigravity`.
6. Documentacao sincronizada com estado real (`21 agentes`, `41 skills`, `21 workflows`).
7. Gate final de verificacao aprovado (`validate_installation`, `verify_all`, `checklist`, auditoria interna completa).

## 2) Roteamento inteligente de agentes (execucao)

1. `orchestrator`: coordenacao da entrega e consolidacao do release gate.
2. `debugger`: correcao de bugs de runtime nos scripts.
3. `backend-specialist`: refatoracao de scripts Python e estrutura de utilitarios compartilhados.
4. `qa-automation-engineer`: criacao de smoke suite para scripts/workflows/agentes/skills.
5. `test-engineer`: validacao de regressao e criterio de aceite.
6. `devops-engineer`: gate de CI para bloquear merge com regressao.
7. `documentation-writer`: alinhamento final da documentacao e contagens.

## 3) Fases de implementacao

### Fase 0 - Baseline e congelamento (P0)

**Objetivo:** estabelecer baseline auditavel antes das correcoes.

Tarefas:
1. Rodar baseline:
   - `python3 .agents/scripts/validate_installation.py`
   - `python3 .agents/scripts/verify_all.py . --no-e2e`
   - `python3 .agents/scripts/checklist.py . --skip-performance`
2. Salvar output em `docs/reviews/` como baseline tecnico.
3. Criar checklist de regressao por item (scripts/agentes/skills/workflows/plataformas).

Criterio de aceite:
1. Baseline registrado em arquivo.
2. Lista de problemas priorizada por severidade (P0/P1/P2).

### Fase 1 - Correcoes criticas de runtime (P0)

**Objetivo:** remover falhas que quebram execucao.

Tarefas:
1. Corrigir `ImportError` em `.agents/scripts/sync_tracker.py:106`:
   - hoje importa `extract_story_ids` de `auto_finish` (inexistente).
   - mover parser para utilitario compartilhado (ex.: `story_id_utils.py`) ou importar da fonte correta.
2. Corrigir compatibilidade Python 3.9 em:
   - `.agents/scripts/dashboard.py:30`
   - `.agents/scripts/notifier.py:103`
   - trocar `dict | None` por `Optional[dict]` (ou elevar requisito minimo para Python 3.10 e ajustar docs/scripts).
3. Reexecutar smoke de scripts impactados:
   - `python3 .agents/scripts/sync_tracker.py`
   - `python3 .agents/scripts/dashboard.py`
   - `python3 .agents/scripts/notifier.py test`

Criterio de aceite:
1. Scripts acima executam sem stacktrace.
2. Sem regressao nas suites `verify_all` e `checklist`.

### Fase 2 - Consistencia de workflows e roteamento (P1)

**Objetivo:** eliminar referencias quebradas e desalinhamentos de fluxo.

Tarefas:
1. Alinhar `.agents/workflows/readiness.md` com saídas reais de `.agents/workflows/define.md`:
   - `03-design-system.md` -> `07-design-system.md`
   - `04-database.md` -> alinhar com arquitetura/seguranca/stack conforme define atual.
   - `05-user-journeys.md` e `docs/PROJECT-CONTEXT.md` -> alinhar com estrutura oficial (`docs/02-Requisitos` e `docs/00-Contexto`).
2. Corrigir referencia de agente inexistente `api-designer` em:
   - `.agents/agents/orchestrator.md`
   - `.agents/skills/parallel-agents/SKILL.md`
3. Adicionar validador automatizado para referencias de agentes/skills/workflows.

Criterio de aceite:
1. Nenhuma referencia para agente inexistente.
2. Nenhum path principal de workflow apontando para arquivo errado.

### Fase 3 - Cobertura automatizada de scripts (P1)

**Objetivo:** garantir execucao objetiva de todos os scripts.

Tarefas:
1. Criar smoke suite dedicada (ex.: `.agents/scripts/audit_framework_runtime.py`) com matriz por script:
   - cada script com comando de verificacao minimo e codigo de saida esperado.
2. Cobrir os 21 scripts executaveis (`20 .py + 1 .sh`) com comando seguro.
3. Emitir relatorio de pass/fail consolidado em `docs/reviews/`.

Criterio de aceite:
1. `21/21` scripts aprovados na smoke suite.
2. Resultado reproduzivel localmente em um comando.

### Fase 4 - Validacao multi-plataforma real (P1)

**Objetivo:** comprovar funcionamento por plataforma, nao apenas existencia de arquivos.

Tarefas:
1. Rodar matriz com `AGENT_SOURCE`:
   - `AGENT_SOURCE=codex`
   - `AGENT_SOURCE=claude_code`
   - `AGENT_SOURCE=antigravity`
2. Para cada plataforma, validar:
   - detecao de origem (`platform_compat.py` e scripts dependentes)
   - comandos chave de sessao/progresso/locks/sync
   - integridade de symlinks e caminhos esperados.
3. Gerar relatorio por plataforma com evidencias de comandos.

Criterio de aceite:
1. Todos os checks da matriz passam para as 3 plataformas.
2. Sem comportamento divergente nao documentado.

### Fase 5 - Sincronizacao de documentacao (P1)

**Objetivo:** remover divergencias entre docs e estado real.

Tarefas:
1. Atualizar contagens em:
   - `README.md`
   - `AGENTS.md`
   - `CLAUDE.md`
   - `.agents/INSTRUCTIONS.md`
   - `.agents/ARCHITECTURE.md`
   - `.claude/project_instructions.md`
2. Padronizar contagem de scripts (diferenciar "arquivos" vs "scripts executaveis").
3. Revisar instrucoes de uso dos scripts com exemplos validos.

Criterio de aceite:
1. Nenhuma contagem conflitante entre arquivos oficiais.
2. Auditoria textual sem divergencias criticas.

### Fase 6 - Gate final para commit de producao (P0)

**Objetivo:** bloquear release com qualquer regressao.

Tarefas:
1. Rodar gate final:
   - `python3 .agents/scripts/validate_installation.py`
   - `python3 .agents/scripts/verify_all.py . --no-e2e`
   - `python3 .agents/scripts/checklist.py . --skip-performance`
   - smoke suite completa de scripts
   - validador de referencias (agentes/skills/workflows)
2. Registrar relatorio final de release em `docs/reviews/`.
3. Commit apenas se todos os gates estiverem verdes.

Criterio de aceite:
1. `0` falhas em todos os gates obrigatorios.
2. Release report assinado com data e hash de commit.

## 4) Ordem de execucao recomendada

1. Fase 1 (bugs runtime)  
2. Fase 2 (consistencia estrutural)  
3. Fase 3 (automacao de cobertura)  
4. Fase 4 (matriz multi-plataforma)  
5. Fase 5 (documentacao)  
6. Fase 6 (gate final e commit)

## 5) Riscos e mitigacao

1. **Risco:** corrigir docs sem validar runtime real.  
   **Mitigacao:** fases 1-4 antes da fase 5.
2. **Risco:** regressao silenciosa em script pouco usado.  
   **Mitigacao:** smoke suite obrigatoria em CI.
3. **Risco:** diferenca de comportamento por versao do Python.  
   **Mitigacao:** fixar versao minima suportada e validar no gate.

## 6) Entregaveis finais

1. Correcoes de codigo e workflows aplicadas.
2. Smoke suite automatizada para o framework.
3. Relatorio de validacao por plataforma (`codex`, `claude_code`, `antigravity`).
4. Documentacao sincronizada e sem divergencias de contagem.
5. Relatorio final de release pronto para commit de producao.
