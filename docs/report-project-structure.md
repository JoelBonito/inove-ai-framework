# Relatório de Estrutura do Projeto: Antigravity Kit

Este relatório detalha a análise da documentação do projeto, catalogando a função de cada Agente, Skill e Workflow disponíveis no sistema.

---

## 1. 🤖 Agentes Especialistas (20)

Os agentes são personas de IA especializadas com regras, ferramentas e contextos específicos para atuar em diferentes domínios do desenvolvimento.

| Agente | Função Principal | Gatilhos & Quando Usar |
| :--- | :--- | :--- |
| **`orchestrator`** | **Coordenação Geral**. Gerencia tarefas complexas que exigem múltiplos agentes. Garante o cumprimento do protocolo de orquestração (min 3 agentes). | Tarefas complexas, "orchestrate", coordenação multi-domínio. Sempre verifica `Plan.md` antes de agir. |
| **`project-planner`** | **Planejamento**. Analisa requisições, quebra em tarefas, determina tech stack e cria o arquivo `PLAN.md`. | Início de projetos, "plan", "roadmap", quebra de tarefas. **Não escreve código.** |
| **`frontend-specialist`** | **UI/UX & Frontend**. Especialista em React, Tailwind, Next.js. Foco em performance, acessibilidade e design system. | Componentes, CSS, Design, React, "frontend". Proibido de tocar em backend ou testes (exceto os de UI). |
| **`backend-specialist`** | **API & Server**. Construção de lógica de servidor, APIs (REST/GraphQL), segurança e integração de banco de dados. | API, server, Node.js, Python, Auth. |
| **`mobile-developer`** | **Mobile**. Desenvolvimento iOS/Android com React Native ou Flutter. Foco em UX nativa e performance mobile. | Apps móveis, React Native, Flutter, iOS, Android. |
| **`database-architect`** | **Dados**. Design de schema, otimização de queries, migrações e escolha de banco de dados (SQL/NoSQL). | Schema, SQL, Migrations, Postgres, modelagem de dados. |
| **`security-auditor`** | **Segurança Defensiva**. Revisão de código, auditoria de vulnerabilidades e conformidade (OWASP). | Audit, revisão de segurança, Auth flow, vulnerabilidades. |
| **`penetration-tester`** | **Segurança Ofensiva**. Simula ataques, testes de penetração e exploração de falhas. | Pentest, "hack", "exploit", red team. |
| **`test-engineer`** | **Testes (Unit/Int)**. Estratégia de testes, TDD, cobertura e correções de testes. | Testes unitários, cobertura, Jest, Vitest. |
| **`qa-automation-engineer`** | **QA & E2E**. Automação de testes de ponta a ponta (Playwright/Cypress) e pipelines de CI/CD. | E2E, Playwright, Cypress, regressão visual, pipeline de testes. |
| **`devops-engineer`** | **Infra & Deploy**. Gerenciamento de servidores, CI/CD, Docker e processos de deploy/rollback. | Deploy, produção, CI/CD, Docker, infraestrutura. |
| **`performance-optimizer`** | **Performance**. Otimização de Core Web Vitals, bundle size e velocidade de execução. | Lighthouse, lentidão, otimização, "slow", benchmarks. |
| **`seo-specialist`** | **SEO & GEO**. Otimização para buscadores (Google) e motores generativos (AI Search). | SEO, meta tags, ranking, schema, visibilidade. |
| **`game-developer`** | **Jogos**. Desenvolvimento de jogos 2D/3D (Unity, Godot, Web) e mecânicas de jogo. | Games, Unity, Godot, mecânicas, shaders. |
| **`debugger`** | **Resolução de Bugs**. Análise de causa raiz, debugging sistemático e correção de erros complexos. | Bugs, crashes, erros, "não funciona", investigação. |
| **`code-archaeologist`** | **Legado**. Análise, documentação e refatoração segura de código antigo ou complexo. | Código legado, refatoração, engenharia reversa, "explain code". |
| **`explorer-agent`** | **Discovery**. Mapeamento de codebase, análise de arquitetura e dependências. | Auditoria inicial, "map codebase", entender projeto desconhecido. |
| **`documentation-writer`** | **Documentação**. Criação de README, API docs e guias técnicos. **Só atua sob demanda explícita.** | "Write docs", README, documentação de API. |
| **`product-manager`** | **Produto**. Definição de requisitos, User Stories, critérios de aceite e priorização (PRD). | Requisitos, user stories, escopo, funcionalidades. |
| **`product-owner`** | **Estratégia de Produto**. Priorização de backlog, MVP, requisitos de negócio e roadmap. | Backlog, MVP, PRD, stakeholder, priorização. |

---

## 2. 🧩 Skills (36)

Módulos de conhecimento que fornecem instruções e princípios específicos para os agentes.

### Frontend & Design
- **`frontend-design`**: Princípios de design, layouts e estética (sem templates prontos).
- **`mobile-design`**: UX/UI específico para toque e telas pequenas.
- **`react-best-practices`**: React/Next.js performance (57 regras Vercel Engineering).
- **`tailwind-patterns`**: Uso avançado de Tailwind CSS v4.
- **`ui-ux-pro-max`**: Design system generativo com 50+ estilos.
- **`web-design-guidelines`**: Audit de UI contra Web Interface Guidelines.

### Backend & Dados
- **`api-patterns`**: Design REST, GraphQL, tRPC.
- **`nodejs-best-practices`**: Async, segurança e arquitetura em Node.
- **`python-patterns`**: Padrões Pythonicos, FastAPI/Django.
- **`database-design`**: Modelagem, normalização e índices.

### Infra & Segurança
- **`server-management`**: Administração de sistemas Linux/Windows.
- **`deployment-procedures`**: Estratégias de deploy seguro.
- **`vulnerability-scanner`**: Análise de vulnerabilidades conhecidas.
- **`red-team-tactics`**: Táticas de ataque e exploração.

### Qualidade & Metodologia
- **`clean-code`**: Padrões de código limpo e legível.
- **`testing-patterns`**: Pirâmide de testes e estratégias.
- **`webapp-testing`**: Testes focados em aplicações web.
- **`tdd-workflow`**: Workflow Red-Green-Refactor.
- **`code-review-checklist`**: Diretrizes para revisão de código.
- **`systematic-debugging`**: Processo científico de debug.
- **`performance-profiling`**: Análise de gargalos.

### Planejamento & Outros
- **`app-builder`**: Orquestrador de criação de apps.
- **`architecture`**: Decisões arquiteturais e ADRs.
- **`plan-writing`**: Como escrever planos de implementação eficazes.
- **`brainstorming`**: Técnicas de exploração de ideias.
- **`behavioral-modes`**: Modos de operação da IA.
- **`intelligent-routing`**: Seleção automática de agentes.
- **`mcp-builder`**: Criação de servidores MCP.
- **`documentation-templates`**: Padrões de documentação.
- **`i18n-localization`**: Internacionalização.
- **`seo-fundamentals`**: Bases de SEO técnico.
- **`geo-fundamentals`**: Otimização para IA (Generative Engine Optimization).
- **`game-development`**: Desenvolvimento de jogos.
- **`bash-linux`**: Automação e scripts Bash.
- **`powershell-windows`**: Automação PowerShell.

---

## 3. 🔄 Workflows (11)

Comandos de barra (`/comando`) que executam procedimentos padronizados.

| Workflow | Descrição |
| :--- | :--- |
| **`/brainstorm`** | **Exploração**. Gera múltiplas opções e abordagens para um problema antes da implementação. |
| **`/create`** | **Criação**. Inicia um novo projeto do zero. Analisa requisitos, planeja e orquestra a construção inicial. |
| **`/debug`** | **Investigação**. Modo estruturado de resolução de problemas: Sintoma -> Hipóteses -> Testes -> Causa Raiz -> Correção. |
| **`/deploy`** | **Produção**. Executa checklist pré-deploy, build e implantação segura. Suporta verificação e rollback. |
| **`/enhance`** | **Melhoria**. Adiciona funcionalidades ou atualiza um projeto existente de forma iterativa. |
| **`/orchestrate`** | **Orquestração**. Coordena **no mínimo 3 agentes** para tarefas complexas. Segue fases estritas de Planejamento e Implementação. |
| **`/plan`** | **Planejamento**. Gera o arquivo `PLAN.md` usando o `project-planner`. **Não escreve código**, apenas planeja. |
| **`/preview`** | **Servidor Local**. Gerencia o servidor de desenvolvimento (start/stop/status) para visualização do projeto. |
| **`/status`** | **Dashboard**. Mostra o estado atual do projeto, stack tecnológico, agentes ativos e progresso das tarefas. |
| **`/test`** | **Testes**. Gera, executa e analisa cobertura de testes. Pode criar novos testes ou rodar suítes existentes. |
| **`/ui-ux-pro-max`** | **Design System**. Gera sistemas de design completos (paletas, tipografia, componentes) baseados em keywords do projeto. |
