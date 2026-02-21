# Relatório de Auditoria: Inove AI Framework (Foco: Gemini CLI / Antigravity)

**Data de Conclusão:** 2026-02-21
**Foco:** Uso autônomo e automatizado via Gemini CLI (Antigravity), interligações do sistema e riscos de cross-platform.

---

## 1. Visão Geral do Ecossistema
O Inove AI Framework (v5.0) atua como um sistema operacional local para o Gemini. Com suporte nativo a 21 Agentes Especializados, 41 Skills modulares, 22 Workflows e 22 Scripts de Automação, o Gemini deixa de ser apenas um assistente de código e escala para um Gerente de Projetos e Equipe de Engenharia completa.

O arquivo P0 de mais alta prioridade, **`GEMINI.md`** (e suas contrapartes `.agents/rules/GEMINI.md` ou `.agents/INSTRUCTIONS.md`), é o grande regulador deste ecossistema.

---

## 2. A Mágica do Roteamento Inteligente (A "Ferrari" Automática)

A maior vantagem do framework no Antigravity é o comportamento transparente através da skill `intelligent-routing`:

- **Análise Silenciosa:** Antes de qualquer respostar a um request, o sistema classifica a complexidade e domínio via *pattern matching* ("auth", "login" -> aciona `security-auditor`).
- **Invocação Sequencial ou Paralela:** Se a tarefa envolve 2 ou mais domínios (*Complex Request*), o agente `orchestrator` é auto-invocado. Ele faz *pre-flight checks* procurando por `PLAN.md` e assegurando os checkpoints do projeto. 
- **Auto-Ativação de Squads:** O script `squad_manager.py auto-activate <squad>` é invocado silenciosamente quando domínios específicos (ex: automação/n8n) são detectados, tornando o framework extremamente flexível e expansível "on the fly".

Isso transforma a "Ferrari" em um assistente autônomo, onde o usuário sequer precisa saber sobre os 21 agentes ou digitar `/orchestrate`. O sistema assume a direção até pedir confirmação no *Socratic Gate*.

---

## 3. Fluxo de Uso e Interligações

- **Protocolo de Fronteiras (Agent Boundaries):** Agentes possuem jurisdição rígida (`__tests__` é exclusivo do `test-engineer`, UI Components ao `frontend-specialist`). No modo Standalone com Antigravity, o Gemini adota estritamente a persona exigida para a tarefa momentânea ou orquestra chamadas sucessivas.
- **Validação Cruzada e Checklists:** O uso de Python scripts é o grande diferencial de interligação. Um fluxo não confia apenas na inferência do LLM; ele *executa* validações. O checklist script (`checklist.py`), os linters e o `verify_all.py` garantem a consistência.
- **Uso do Stitch MCP:** Quando ativado para UI (`HAS_UI=true`), a regra força a criação de mockups no Stitch durante o fluxo de planejamento (Workflow `/define`). Esse acoplamento provou-se formidável para guiar a visualização antes do código.

---

## 4. O Papel e Operacionalidade do `GEMINI.md`

O `GEMINI.md` é a espinha dorsal de governança. Para que tudo funcione bem no Gemini CLI, ele:
1. **Regra Zero Absoluta:** Exige Diagnose -> Propose -> Wait -> Edit. Previne que o LLM aplique edições em dezenas de arquivos sem aprovação, blindando o projeto contra regressões.
2. **Socratic Gate Global:** Impõe restrições severas em tarefas vagas. Bloqueia a ação técnica até que 3 perguntas estratégicas sejam superadas, forçando entendimento e escopo.
3. **Auto-Finish Protocol e Logs:** Delegou ao Antigravity a responsabilidade nativa de invocar no terminal `.agents/scripts/auto_session.py` (para Logging diário) e `finish_task.py` (Tracker de backlog). 

---

## 5. Recomendações de Automação Mestre (Do "Fiat Uno" para a "Ferrari")

Queremos zero fricção. Para deixar a Ferrari ainda melhor, as seguintes práticas já desenhadas no framework devem ser fortemente exigidas do agente:

*   **Silenciar *Pre-Flights*:** O agente Antigravity deve evitar imprimir relatórios longos sobre como está acessando o `intelligent-routing` a menos que seja para apresentar a conclusão (`Applying knowledge of...`).
*   **Abusar dos Annotations `// turbo` nos Workflows:** Comandos sistêmicos ou passivos (como scans de porta, read states e list dirs) devem ser gerados em parallel execution sem interrupções humanas, acelerando a fase investigativa.
*   **Context Passing Estrito:** A maior causa da Ferrari "engastar" é o modelo perder o contexto de requisitos passados. O agente deve cumprir sempre o item "Context Passing Mandatory" (do `orchestrator.md`), onde o estado do plano original vai acoplado às ferramentas em todas as invocações.

---

## 6. Atenção: Riscos de Quebra de Compatibilidade (Code/Codex)

Caso hajam alterações futuras no framework voltadas apenas para otimizar o Antigravity, **evite terminantemente**:

1. **Destruir o design de Symlinks (`platform_compat.py`):** Arquivos como `squad_manager.py` e os fluxos confiam que as pastas `.claude/` e `.codex/` se manterão resolvidas em simetria ao `.agents/`. A remoção drástica disto comprometerá Code e Codex.
2. **Hardcoding do MCP (Stitch e Inove AI):** O Antigravity usa servidores MCP descritos no `.gemini/mcp.json`. Ferramentas e rotinas atreladas exclusivas a esse JSON que não sejam parametrizadas quebrarão fluxogramas de agentes sendo processados dentro do Claude Code. Valide sua existência ou garanta graceful fallback ("MCP não detectado... avisar usuário").
3. **Modificar Regras Universais por Atalhos:** Inserir orientações no coração do _clean-code_ (skill vitalícia) que beneficiem apenas o parse markdown do Gemini quebrarão a exibição dos comandos pelo Codex CLI ou Claude.

---
**Conclusão:** O framework já é estruturalmente uma Ferrari de elite. O roteamento inteligente auto-invocando scripts Python como *Squad Manager* e *Checklist* estabelece o Antigravity como um ecossistema auto-funcional e orquestrador supremo. A fluidez da experiência depende apenas da rigidez do comportamento do LLM na execução cega da Regra Zero, da execução robusta do Socratic Gate e nas amarrações silenciadas!
