<p align="center">
  <img src="../assets/logo.jpg" alt="Inove AI Framework" width="180">
</p>

<h1 align="center">Manual de Uso Oficial — Inove AI Framework</h1>

> **Nota v5+:** O framework volta a ser distribuído como pacote npm local (`@joelbonito/inove-ai-framework`). Cada repositório mantém sua própria pasta `.agents/`, garantindo funcionamento offline e versionamento explícito.

---

## 1. Configuração Rápida (Instalação Local)

### 1.1 Passo único — rodar o instalador

```bash
npx -y @joelbonito/inove-ai-framework init
```

O comando acima:

- Copia `.agents/` (22 agentes, 42 skills, 25 workflows, scripts, squads, skills).
- Sincroniza `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` na raiz do projeto (Claude/Codex/Gemini leem automaticamente).
- Instala os git hooks oficiais (`.agents/scripts/install_git_hooks.sh`).

Use `--force` para sobrescrever uma instalação existente:

```bash
npx -y @joelbonito/inove-ai-framework init --force
```

### 1.2 Atualizar para a versão mais recente

```bash
npm install --save-dev @joelbonito/inove-ai-framework@latest
npx -y @joelbonito/inove-ai-framework init --force
```

Isso garante que seu `.agents/` sempre corresponda ao pacote publicado.

### 1.3 Checklist pós-instalação

Após o comando `init` você deve ver:

```
.agents/                    # núcleo do framework
CLAUDE.md / AGENTS.md / GEMINI.md
docs/ (vazio ou existente)
```

### 1.4 Integração com IDEs e CLIs

- **Claude Code** lê `CLAUDE.md` automaticamente (assim que o arquivo existe na raiz).
- **Codex CLI** usa `AGENTS.md` como ponte e referencia `.agents/INSTRUCTIONS.md`.
- **Antigravity/Gemini** usa `GEMINI.md` + `docs/PROJECT_STATUS.md` para contexto.

Não é necessário configurar MCP ou servidores externos. Basta manter os arquivos na raiz do repositório.

---

## 2. O Ciclo de Vida Perfeito para um Novo Projeto

Agora que a inteligência está rodando, veja o roteiro de ouro para sair do Zero ao App em Produção.

### Passo 1: O "Big Bang" (Planejamento)
Crie uma pasta vazia. Abra a sua IA (Claude ou Cursor) e inicie com o comando absoluto:
> *"No diretório atual, execute o fluxo `/define` para criarmos um MVP de um **Sistema de Gestão de Frota**."*

**O que vai acontecer?**
O Framework acionará os agentes `@project-planner` e `@product-owner`. Sem escrever código, eles criarão as pastas em `docs/` e gerarão 9 documentos mestres: Briefing, PRD, Regras de Segurança, Arquitetura de Banco, o Backlog exato e Mockups de UI (se tiver Stitch).

### Passo 2: O Rito de Passagem (Readiness)
Antes de programar ansiosamente, valide se o planejamento está a prova de balas:
> *"/readiness"*

O Framework vai auditar tudo que acabou de criar, garantir que a paleta de cores não conflita com a marca, que o PRD não tem pontas soltas, e no final, ele constrói o `HANDOFF.md` (o bilhete dourado com as orientações para os codificadores).

### Passo 3: Story Files Automáticos (Backlog Lean)
Na v5 o `/define` já cria um `docs/BACKLOG.md` enxuto **e** todos os arquivos em `docs/stories/` com contexto completo. Você não precisa mais “fatiar” nada manualmente — basta abrir o `PROJECT_STATUS.md`, ver qual story está pendente e entrar direto no arquivo indicado.

**Projetos legados:** se herdou um backlog “gordo” das versões anteriores, execute apenas uma vez:
- `python .agents/scripts/shard_epic.py migrate` → converte o backlog para formato lean e gera os story files.
- `python .agents/scripts/shard_epic.py generate` → reidrata/sincroniza stories específicas (`--story 1.2`) sem destruir o Agent Workspace.

### Passo 4: Execução Focada (Sprint 1)
Agora você programa usando os story files, garantindo 100% de hiperfoco:
> *"Olhe nosso `PROJECT_STATUS.md`. Acione o `@frontend-specialist`, e vamos focar exclusivamente na `@STORY-1-1` que está na pasta de stories. Deixe todas as suas anotações temporárias salvas na 'Área do Agente' no rodapé do arquivo da Story."*

*(Nota: Graças ao AST + Story Files, as IAs trabalham cirurgicamente focadas sem esquecer do contexto global).*

### Passo 5: Fechando a Conta (Track & Finish)
Concluiu a feature com a IA? Nunca se esqueça de fechar a tarefa e atualizar a sua "matriz":
> *"/finish Task 1"* 
> ou
> *"/track"*

Esses comandos atualizam as caixas `[ ]` originais do Backlog, reatualizam a sua **Barra de Progresso (ASCII)** e o seu **`PROJECT_STATUS.md`**. Garantindo que se você for dormir e voltar no dia seguinte, a IA lerá esse Status e saberá exatamente o que ela fez ontem.

---

## 3. Migrando de uma instalação MCP (thin client) para o pacote local

Se você estava usando o `@joelbonito/mcp-server` (sem `.agents/`), siga estes passos para voltar ao pacote completo:

1. **Remova configurações MCP**  
   - Claude Code: `claude mcp remove inove-ai`  
   - Cursor/VS Code: apague a entrada `"inove-ai"` em `.cursor/mcp.json` / `.vscode/mcp.json`.

2. **Recrie os arquivos locais**  
   ```bash
   npx -y @joelbonito/inove-ai-framework init --force
   ```
   Isso copia `.agents/`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` e reinstala os git hooks.

3. **Commit**  
   ```
   git add -A
   git commit -m "chore: voltar para instalacao local do Inove AI"
   ```

Depois disso, todas as instruções e skills vivem dentro do repositório e podem ser versionadas normalmente.

---

## 4. O Ciclo em Projetos Existentes (Manutenção)

Os agentes do framework não servem apenas para "projetos em branco". Se você acabou de assumir um projeto existente (ou herdou código legado), siga estes workflows vitais:

### 💡 3.1 A Fase de Brainstorming (Para Melhorar o Sistema)
Antes de pedir *"adicione a feature X"*, use a metodologia socrática do framework para encontrar soluções melhores que a sua ideia inicial.
> *"/brainstorm Quero adicionar um sistema de chat neste projeto antigo no meu diretório `src/`. Vamos explorar qual a melhor arquitetura e stack."*

A IA não vai escrever código. Ela vai usar a skill `brainstorming` para fazer 3 perguntas afiadas sobre os trade-offs. Após o debate, quando decidir a melhor rota, mova as ideias aprovadas para o seu Backlog através do workflow `/enhance`.

### 🚨 3.2 Como domar Erros Obscuros (Workflow de Debug)
Em projetos antigos, quando tudo quebra e o console explode no seu rosto, não diga *"conserte o erro da linha 42"*. Ative o Método Científico com o `@debugger`:
> *"/debug Meu build do Next.js está quebrando na Vercel com um erro TypeError na classe de Auth e eu não faço ideia do porquê."*

**O que vai acontecer?**
A IA ativará a skill `systematic-debugging`. Ela não vai jogar gambiarras. Ela vai traçar as **Causas Raízes**, levantar hipóteses, pedir evidências (logs) e criar um plano no arquivo `DEBUG-SESSION.md`. Ela só altera arquivos no sistema quando a raiz real do problema for comprovada.

### 🧹 3.3 Melhoria Contínua (Enhance & Review)
Se quiser aplicar Design Patterns ou reformular funções:
*   **Refatorar com Cautela:** 
    > *"/enhance Refatore o componente `Sidebar.tsx` para usar Tailwind puro e remover dependências antigas."*
*   **Revisar antes de subir (Deploy Seguros):** 
    > *"/review Faça uma auditoria visual e de segurança no código que fizemos hoje."* (Injetará regras rigorosas de Clean Code).
*   **Gerar Testes Inexistentes:** 
    > *"/test Implemente uma suíte de testes para toda a minha pasta legado `/utils`."*
    
## 5. O Sistema Nervoso: Roteamento Inteligente & Agentes

Uma das grandes magias do Inove AI Framework é que você **não precisa dar ordens complexas para as IAs adequadas**. O framework possui um sistema de *Intelligent Routing* (Roteamento Inteligente).

### 🧠 Como Funciona o Roteamento Inteligente?
Quando você envia um prompt (Ex: *"Crie um formulário de login seguro"*), o sistema intercepta seu pedido e analisa as palavras-chave usando a skill `intelligent-routing`. Sem você perceber, ele detecta que "Formulário de login" engloba UI e Segurança. Ele então injeta as regras de dois especialistas na mesma resposta silenciosamente: o `@frontend-specialist` (que criará a tela) e o `@security-auditor` (que cuidará dos tokens e sanitização).

### 🤖 O Batalhão (Principais Agentes e suas Skills)

Aqui estão alguns dos seus "funcionários" e o que eles sabem fazer de melhor (suas *skills* nativas):

| Agente | O que ele faz | Skills que ele domina |
|--------|---------------|------------------------|
| `@orchestrator` | O chefe. Coordena tarefas que exigem múltiplos agentes. | `parallel-agents`, `plan-writing` |
| `@project-planner` | Pensa na macroestrutura, nas fases e na arquitetura. | `architecture`, `system-design` |
| `@product-owner` | Traduz dores de negócios em Backlog de features pontuais. | `gap-analysis`, `ux-research` |
| `@frontend-specialist` | O mestre do UI/UX. Constrói componentes bonitos. | `frontend-design`, `tailwind-patterns` |
| `@backend-specialist` | Desenha APIs, rotas e microserviços. | `nodejs-best-practices`, `api-patterns` |
| `@database-architect` | Define schemas e scripts de migração escaláveis. | `database-design` |
| `@security-auditor` | Tenta quebrar e proteger seu app de ponta a ponta. | `red-team-tactics`, `vulnerability-scanner` |
| `@debugger` | Entra em ação na Seção de UTI quando o código falha. | `systematic-debugging` |

*(Aviso: Se você quiser forçar um agente específico, apenas mencione `@nome-do-agente` no seu chat e o Roteamento Automático dará prioridade a ele).*

---

## 6. O Squad Especializado em Automação: N8N

Um "Squad" é uma "Empresa dentro da sua Empresa" focada em um nicho muito técnico. O Inove AI Framework já vem com um Squad dedicado ao **N8N** (A famosa ferramenta Node.js Open-Source de Automação de Workflows).

### 🛠️ Como usar o Squad n8n-automation?
Se você precisa automatizar o Zapier/Make da sua vida, em vez de usar os agentes de web, você chama o esquadrão tático do n8n:

> *"/squad activate n8n-automation"* (Use isso para ligar o Squad no terminal pela 1ª vez).

Depois de ativado, você ganha acesso a fluxos poderosíssimos especializados nele:
1. **`/n8n-scaffold`**: Você diz *"crie um fluxo que lida com dados do stripe"* e e a IA monta o JSON do workflow do zero.
2. **`/n8n-setup`**: A IA entra no seu docker e prepara as credenciais e variáveis sensíveis usando as senhas do seu servidor e configurando a instância do n8n.
3. **`/n8n-debug`**: *"Meu nó do Hubspot falhou no meio do loop!"* A IA entra e conserta os subfluxos JSON do N8N na hora.

*(O membro vital deste squad é o `@n8n-automation-expert` armado com a skill `n8n-orchestration`).*

---

## 7. O Dicionário de Workflows (Slash Commands)

Tudo no framework se move através de "Workflows" (os chamados `/comandos`). Eles são pipelines padronizados. Segue a lista completa de ferramentas:

### 🐣 Origem & Planejamento (Inception)
*   `/define [projeto]` -> Cria os 9 documentos mestre e o Backlog de um projeto. (Obrigatório em projetos novos).
*   `/brainstorm [topico]` -> Abre o modo debate longo e denso. Bom para testar uma arquitetura de nova Ideia Sem código.
*   `/context` -> Se você pegou um projeto de 10 anos atrás, chame isso. O Agente vai ler o projeto antigo e cuspir um `PROJECT_CONTEXT` para padronizar o caos.
*   `/journeys` -> Foca estritamente em Persona e User Flow. Mapeia telas imaginárias com base no caminho do usuário.

### 🚀 Construção (Mão na Massa)
*   `/readiness` -> Checagem pré-vôo. Roda para ver se não esqueceu regras básicas de arquitetura antes de codar o Backend.
*   `/plan [tarefa]` -> Foca na arquitetura exata de UMA tarefa antes dela ser implementada.
*   `/create [feature]` -> Pede a IA para escrever do zero o código de uma funcionalidade nova.
*   `/enhance [arquivos]` -> Pede a IA para melhorar, refatorar ou encurtar um código arcaico que você colou para lá.
*   `/test [rota/arquivo]` -> Gera suítes Jest, Playwright etc., de cobertura de código.

### 🛡️ Defesa e Auditoria (Maintenance)
*   `/debug [texto/print de tela do erro]` -> Rota investigativa do método científico (gera sessão `DEBUG-SESSION.md`).
*   `/review` -> Usa checklist severo de OWASP e Clean Code no PR final de sprint.
*   `/test-book` -> Diferente do `/test`, esse workflow cria o "Caderno do Testador QA" físico em Markdown para pessoas auditarem.

### 📊 Gerenciamento (Ops)
*   `/status` e `/track` -> Atualizam a Barra de Progresso, mostram em que epic a equipe parou e qual a branch do git em `docs/PROJECT_STATUS.md`.
*   `/finish [X]` -> Marca uma checkBox de epic como [X] lá no arquivo oficial e re-gera a barra de status.
*   `/log` -> Regista no sumário do dia a quantidade de tempo e horas gastas (Timesheet) na "Sessão" pelos agentes.
*   `/release` -> Corta a versão e atualiza os CHANGELOGs criando um pacote versionado final.

---

## 8. Resolvendo Problemas de "Contexto Lotado"

Se a sua conversa atual começar a ficar burra ou travar (erro de tokens estourados):
1. Peça para fechar as horas dele: *"/log close"* e dë um *"/track"*
2. Crie uma **NOVA CONVERSA** (Novo chat limpo na sua IA).
3. Comece a nova conversa dizendo apenas: *"Bom dia, leia o `docs/PROJECT_STATUS.md` e o `HANDOFF.md` e vamos continuar onde paramos."*
Como o Status foi atualizado e concentra as chaves principais, a IA recupera a memória integral do projeto na nova Thread economizando centenas de tokens e recomeça o código super rápida!
