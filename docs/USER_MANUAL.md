# 📖 Manual de Uso Oficial - Inove AI Framework (Edição MCP)

> **Nota v5+:** Este manual descreve o fluxo de trabalho utilizando o **Inove AI MCP Server**. Com essa arquitetura, você **não precisa mais ter a pasta `.agents` pesada dentro de cada projeto**. O "cérebro" do framework vive globalmente no seu computador e injeta inteligência de forma invisível nos seus workspaces.

---

## 1. Configuração Única (Setup Global)

Você só precisa configurar o MCP uma única vez para a sua IDE ou Ferramenta CLI. Depois disso, todos os projetos vazios que você iniciar já terão os "Superpoderes" dos 21 agentes.

### 💻 Opção A: Usando Claude Code (Recomendado para Arquitetura/Backend)
Abra seu terminal em qualquer pasta e digite:
```bash
claude mcp add inove-ai -- npx -y @joelbonito/mcp-server
```
*Pronto! O Claude puxará a última versão sempre.*

### 🖥️ Opção B: Usando Cursor IDE
1. Abra as Configurações do Cursor (Settings > Features > MCP).
2. Adicione um novo servidor MCP do tipo `command`.
3. Nome: `inove-ai`
4. Comando: `npx -y @joelbonito/mcp-server`
5. Salve e recarregue a janela.

### 🏄 Opção C: Usando Windsurf ou Cline
Qualquer ferramenta compatível com MCP funciona. Basta apontar para o comando `npx -y @joelbonito/mcp-server` como um servidor **stdio**.

*(Sempre que houver atualizações no nosso GitHub oficial, o `npx` garantirá que a versão cacheada mais recente e estável seja executada automaticamente em qualquer um desses editores).*

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

### Passo 3: Fatiando o Monstro (Sharding do Backlog)
Um erro comum é mandar a IA ler um backlog de 500 linhas para codar uma telinha simples. Economize os "tokens" da sua IA fatiando seu Backlog:
> *Rode no seu terminal: `python .agents/scripts/shard_epic.py`*

**O que vai acontecer?**
Ele vai ler seu `BACKLOG.md` gigante e transformá-lo em micro-arquivos dentro da pasta `docs/stories` (ex: `STORY-1-1_login.md`).

### Passo 4: Execução Focada (Sprint 1)
Agora você programa usando os Shards fatiados, garantindo 100% de hiperfoco:
> *"Olhe nosso `PROJECT_STATUS.md`. Acione o `@frontend-specialist`, e vamos focar exclusivamente na `@STORY-1-1` que está na pasta de stories. Deixe todas as suas anotações temporárias salvas na 'Área do Agente' no rodapé do arquivo da Story."*

*(Nota: Graças ao AST e Sharding, as IAs trabalharão cirurgicamente focadas nas tarefas indicadas sem esquecer do contexto global).*

### Passo 5: Fechando a Conta (Track & Finish)
Concluiu a feature com a IA? Nunca se esqueça de fechar a tarefa e atualizar a sua "matriz":
> *"/finish Task 1"* 
> ou
> *"/track"*

Esses comandos atualizam as caixas `[ ]` originais do Backlog, reatualizam a sua **Barra de Progresso (ASCII)** e o seu **`PROJECT_STATUS.md`**. Garantindo que se você for dormir e voltar no dia seguinte, a IA lerá esse Status e saberá exatamente o que ela fez ontem.

---

## 3. Como Migrar Projetos Legados para o MCP Server

Se você possui um projeto antigo rodando o framework na _versão 4 ou inferior_ (com aquela pasta pesada `.agents/` de 15MB copiada localmente), criamos um comando seguro para atualizar sua arquitetura para o novo paradigma **Thin Client (MCP)**.

### 🛠️ O Comando `migrate`

Abra o terminal na raiz do seu projeto antigo e execute:
```bash
npx @joelbonito/inove-ai-framework migrate
```

**O que o comando faz com segurança?**
1. **Backup:** Cria uma pasta `.agents.bak/` com todos os seus arquivos (ignorada no git).
2. **Deleção Cirúrgica:** Remove a pasta `.agents/` atual sem seguir symlinks (via `lstatSync`).
3. **Limpeza de Symlinks:** Apaga referências órfãs (`.claude/agents`, `.codex/skills`, etc).
4. **Injeção Thin Client:** Substitui os antigos `CLAUDE.md`, `GEMINI.md` e `AGENTS.md` de 500 linhas por versões enxutas (~40 linhas) que instruem a IA a buscar as "Tools via MCP".
5. **Auto-Configuração:** Atualiza/Gera arquivos em `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json` e `.gemini/mcp.json` blindando seus servidores anteriores (merge seguro).

### ⚙️ Modos Avançados de Operação

*   **Preview Seguro:** Veja o que será deletado e modificado antes (Dry Run).
    > `npx @joelbonito/inove-ai-framework migrate --dry-run`
*   **Modo Automático:** Migração sem perguntas `[Y/n]` interativas (bom para scripts).
    > `npx @joelbonito/inove-ai-framework migrate --force`
*   **Sem Backup:** Se quiser apagar o `.agents/` nativo permanentemente sem criar o `.bak/`.
    > `npx @joelbonito/inove-ai-framework migrate --no-backup`

Após concluir o comando, basta um commit: `git add -A && git commit -m "chore: migrate to MCP server"`.

---

## 4. O Ciclo em Projetos Existentes (Manutenção)

Os agentes MCP não servem apenas para "projetos em branco". Se você acabou de abrir o MCP Server em um projeto que já existe (ou que herdou de alguém), siga estes workflows vitais:

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
2. **`/n8n-setup`**: A IA entra no seu docker e prepara as credenciais e variáveis sensíveis usando as senhas do seu servidor e configurando o N8N MCP server.
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
