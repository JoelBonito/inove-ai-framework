# MCP Server — Plano de Implementacao Detalhado

> **Status:** Pendente
> **Prioridade:** Baixa (implementar apos outras alteracoes ao framework)
> **Data:** 2026-02-19
> **Agentes consultados:** @orchestrator, @project-planner, @backend-specialist (skill mcp-builder), @product-owner

---

## 1. Objetivo

Distribuir o Inove AI Framework como **MCP server unico** — o unico canal de distribuicao. Expoe os 21 agentes, 41 skills e 22 workflows como resources, tools e prompts via protocolo MCP. Setup em 30 segundos, zero disk usage por projeto, atualizacoes automaticas.

O pacote npm anterior (`@inove-ai/inove-ai-framework` com `npx init`) sera **deprecated**. O MCP server substitui completamente a abordagem file-copy.

**Package unico:** `@inove-ai/mcp-server`
**SDK:** `@modelcontextprotocol/sdk` v1.26.0+
**Runtime:** Node.js 22+, ESM-only, TypeScript

---

## 2. Decisoes Arquitecturais (ADRs)

### ADR-001: Localizacao do Codigo

**Decisao:** Novo directorio `mcp-server/` na raiz do repositorio.

**Razao:** `.agents/` e conteudo puro (markdown, scripts). `mcp-server/` e codigo aplicacional (TypeScript). Segue o padrao existente do repo (`web/`, `bin/`, `tests/`, `squads/`).

**Rejeitado:** Dentro de `.agents/` (mistura conteudo com codigo) ou `bin/` (build system diferente).

### ADR-002: Bundling de Conteudo

**Decisao:** Conteudo embedado em build-time via `registry.ts` gerado.

Como o MCP server e o unico canal de distribuicao (ADR-006), o conteudo de `.agents/` e embedado no build. Isto garante que o pacote npm e self-contained — `npx @inove-ai/mcp-server` funciona sem acesso ao repo.

| Modo | Fonte de Conteudo | Razao |
|------|-------------------|-------|
| npm (stdio) | Embedding em build-time via `registry.ts` | Pacote self-contained, funciona em qualquer maquina |
| Dev local (stdio) | Leitura do filesystem em runtime | Desenvolvimento rapido, sem rebuild |
| Remote (Workers) | Mesmo `registry.ts` embedado | Cloudflare Workers nao tem filesystem |

**Conteudo total:** ~2.6MB de markdown (dentro do limite de 10MB do Workers).

**Detecao automatica:** Em dev (`tsx src/index.ts`), usa `FsLoader` (filesystem). Em prod (`node dist/index.js` via npx), usa `EmbeddedLoader` (registry.ts). A detecao e feita verificando se `.agents/` existe no diretorio pai.

### ADR-003: Abstraccao de Transporte

**Decisao:** Interface `ContentLoader` que abstrai a fonte de dados.

```
ContentLoader interface
    |
    +-- FsLoader        (stdio: le .agents/ do disco)
    +-- EmbeddedLoader  (Workers: le de registry.ts gerado)
```

Handlers MCP (resources, tools, prompts) sao funcoes puras que recebem `ContentLoader`. Entrypoints (`index.ts` para stdio, `worker.ts` para SSE) ligam o loader e transporte corretos.

**Selecao automatica de loader:**
- Se `.agents/` existe no diretorio pai → `FsLoader` (dev local)
- Caso contrario → `EmbeddedLoader` (npm/Workers)

### ADR-004: Dependencias

**Apenas 3 dependencias runtime:**

| Package | Versao | Proposito |
|---------|--------|-----------|
| `@modelcontextprotocol/sdk` | ^1.26.0 | SDK oficial MCP |
| `yaml` | ^2.7.0 | Parse YAML frontmatter |
| `zod` | ^3.24.0 | Validacao de input dos tools |

### ADR-005: Hosting Remoto

**Decisao:** Cloudflare Workers (Phase 3).

**Razao:** Edge deployment global, free tier generoso, cold starts rapidos (<50ms), mais barato que Vercel para SSE streaming.

### ADR-006: Distribuicao MCP-Only

**Decisao:** MCP server como unico canal de distribuicao. Deprecar `@inove-ai/inove-ai-framework` (file-copy via `npx init`).

**Razao:**
- **Redundancia eliminada:** Dois pacotes npm com propositos sobrepostos nao fazem sentido. O MCP server ja e distribuido via npm (`npx @inove-ai/mcp-server`).
- **Zero disk usage:** Conteudo servido via protocolo MCP, sem copia de ~15MB por projeto.
- **Atualizacoes automaticas:** `npx` busca sempre a versao mais recente. Sem necessidade de re-run `init`.
- **Compatibilidade universal:** Claude Code, Cursor, VS Code, Windsurf, Cline — todos suportam MCP.
- **Manutencao simplificada:** Um unico pacote para manter, publicar e versionar.

**Rejeitado:** Manter ambos os canais (file-copy + MCP) — duplicacao de esforco, confusao para utilizadores sobre qual usar.

**Trade-off aceite:** Utilizadores perdem a capacidade de customizar agentes/skills localmente. Mitigacao: quem precisar pode clonar o repo e apontar o MCP para o filesystem local.

**Migracao:** Publicar versao final do pacote antigo com `console.warn` a redirecionar para o MCP server. Manter deprecated por 6 meses antes de unpublish.

---

## 3. Estrutura de Ficheiros

```
inove-ai-framework/                    # Repo existente
├── .agents/                           # Conteudo (inalterado)
├── bin/cli.js                         # DEPRECATED — redireciona para MCP server
├── web/                               # Site docs existente (inalterado)
│
├── mcp-server/                        # NOVO — unico canal de distribuicao
│   ├── package.json                   # @inove-ai/mcp-server
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   │
│   ├── src/
│   │   ├── index.ts                   # Entrypoint stdio (npx)
│   │   ├── worker.ts                  # Entrypoint Cloudflare Workers (Phase 3)
│   │   ├── types.ts                   # Interfaces TypeScript
│   │   ├── constants.ts               # Paths, versao, routing keywords
│   │   │
│   │   ├── loaders/
│   │   │   ├── frontmatter.ts         # Parser YAML frontmatter
│   │   │   ├── agents.ts              # Carrega 21 agentes de .agents/agents/
│   │   │   ├── skills.ts              # Carrega 41 skills de .agents/skills/
│   │   │   ├── workflows.ts           # Carrega 22 workflows de .agents/workflows/
│   │   │   └── cache.ts               # Cache in-memory (1x no startup)
│   │   │
│   │   ├── core/
│   │   │   ├── resources.ts           # 6 MCP resources registados
│   │   │   ├── tools.ts               # 8 MCP tools registados
│   │   │   └── prompts.ts             # 22 MCP prompts registados
│   │   │
│   │   └── utils/
│   │       ├── routing.ts             # Keyword -> agent mapping
│   │       └── search.ts              # Full-text search
│   │
│   ├── scripts/
│   │   └── bundle-content.ts          # Gera registry.ts (prebuild — embeda conteudo de .agents/)
│   │
│   └── tests/
│       ├── loaders.test.ts
│       ├── tools.test.ts
│       ├── prompts.test.ts
│       └── server.test.ts             # Integracao end-to-end
│
└── .github/workflows/
    └── mcp-server.yml                 # CI/CD (Phase 2)
```

**Estimativa:** ~640 linhas TypeScript, 13 ficheiros de codigo

---

## 4. Especificacao MCP

### 4.1 Resources (6)

| URI | Tipo | Mime | Descricao |
|-----|------|------|-----------|
| `inove://agents` | Static | application/json | JSON com lista dos 21 agentes (name, description, skills) |
| `inove://agents/{name}` | Template | text/markdown | Conteudo completo de um agente (frontmatter + body) |
| `inove://skills/{name}` | Template | text/markdown | SKILL.md + todos sub-files concatenados |
| `inove://workflows/{name}` | Template | text/markdown | Conteudo completo de um workflow |
| `inove://architecture` | Static | text/markdown | .agents/ARCHITECTURE.md |
| `inove://instructions` | Static | text/markdown | .agents/INSTRUCTIONS.md |

### 4.2 Tools (8)

| Tool | Input Schema | Output | Descricao |
|------|-------------|--------|-----------|
| `list_agents` | `{}` | `AgentSummary[]` JSON | Lista 21 agentes com name, description, skills[] |
| `list_skills` | `{}` | `SkillSummary[]` JSON | Lista 41 skills com name, description |
| `list_workflows` | `{}` | `WorkflowSummary[]` JSON | Lista 22 workflows com name, description |
| `get_agent` | `{ name: string }` | Markdown text | Conteudo completo do agente |
| `get_skill` | `{ name: string }` | Markdown text | SKILL.md + sub-files concatenados |
| `get_workflow` | `{ name: string }` | Markdown text | Conteudo completo do workflow |
| `route_task` | `{ request: string }` | `RouteResult` JSON | Recomenda agentes + skills baseado em keywords |
| `search_content` | `{ query: string, scope?: "all"\|"agents"\|"skills"\|"workflows", max_results?: number }` | `SearchResult[]` JSON | Busca full-text em todo o conteudo |

### 4.3 Prompts (22)

Um prompt por workflow: `define`, `debug`, `create`, `brainstorm`, `enhance`, `deploy`, `test`, `track`, `status`, `log`, `finish`, `orchestrate`, `plan`, `preview`, `ui-ux-pro-max`, `review`, `test-book`, `release`, `squad`, `context`, `readiness`, `journeys`.

Cada prompt:
- Aceita argumento opcional `{ topic?: string }`
- Retorna 2 mensagens: assistant (workflow como system context) + user ("Execute /{name} for: {topic}")

---

## 5. Types TypeScript

```typescript
// src/types.ts

export interface AgentMeta {
  name: string;
  description: string;
  tools: string[];
  model: string;
  skills: string[];
}

export interface Agent {
  meta: AgentMeta;
  body: string;          // Markdown body apos frontmatter
  raw: string;           // Ficheiro completo
}

export interface SkillMeta {
  name: string;
  description: string;
  allowedTools?: string[];
  version?: string;
  priority?: string;
}

export interface SubFile {
  filename: string;
  content: string;
}

export interface Skill {
  meta: SkillMeta;
  body: string;          // SKILL.md body
  subFiles: SubFile[];   // Ficheiros .md adicionais
  hasScripts: boolean;   // Se existe scripts/
  raw: string;           // Tudo concatenado
}

export interface WorkflowMeta {
  description: string;
}

export interface Workflow {
  meta: WorkflowMeta;
  body: string;
  raw: string;
}

// Respostas dos tools
export interface AgentSummary {
  name: string;
  description: string;
  skills: string[];
}

export interface SkillSummary {
  name: string;
  description: string;
}

export interface WorkflowSummary {
  name: string;
  description: string;
}

export interface RouteResult {
  agents: AgentSummary[];
  skills: SkillSummary[];
  reasoning: string;
}

export interface SearchResult {
  type: "agent" | "skill" | "workflow";
  name: string;
  matches: string[];
}
```

---

## 6. Routing Keywords (constants.ts)

Mapa de keywords para agentes (mesmo do CLAUDE.md/INSTRUCTIONS.md):

```typescript
export const ROUTING_KEYWORDS: Record<string, string[]> = {
  "frontend-specialist": ["ui", "componente", "pagina", "frontend", "react", "tailwind", "css", "layout"],
  "backend-specialist": ["api", "endpoint", "backend", "servidor", "server", "node", "express", "fastapi"],
  "database-architect": ["database", "schema", "query", "migracao", "sql", "prisma", "drizzle"],
  "mobile-developer": ["mobile", "ios", "android", "react native", "flutter", "app"],
  "security-auditor": ["auth", "seguranca", "vulnerabilidade", "owasp", "security", "jwt"],
  "debugger": ["bug", "erro", "nao funciona", "debug", "error", "crash"],
  "qa-automation-engineer": ["teste", "e2e", "ci/cd", "test", "playwright", "jest"],
  "devops-engineer": ["deploy", "docker", "infraestrutura", "ci", "cd", "kubernetes"],
  "product-owner": ["requisitos", "user story", "backlog", "mvp", "product"],
  "ux-researcher": ["ux", "user flow", "wireframe", "jornada", "usabilidade"],
  "performance-optimizer": ["performance", "lento", "slow", "otimizar", "optimize", "lighthouse"],
  "seo-specialist": ["seo", "meta tags", "sitemap", "ranking", "google"],
  "documentation-writer": ["documentacao", "docs", "readme", "manual"],
  "code-archaeologist": ["legacy", "refatorar", "refactor", "divida tecnica", "tech debt"],
  "orchestrator": ["orquestrar", "multi-agente", "coordenar", "complexo"],
  "project-planner": ["arquitetura", "architecture", "sistema", "design system"],
  "product-manager": ["brief", "discovery", "requisito"],
  "penetration-tester": ["pentest", "invasao", "exploit", "security test"],
  "game-developer": ["game", "jogo", "unity", "godot"],
  "test-engineer": ["unit test", "integration test", "tdd", "test strategy"],
  "explorer-agent": ["analise", "codebase", "overview", "explore"],
};
```

---

## 7. Configuracao do Package

### package.json

```json
{
  "name": "@inove-ai/mcp-server",
  "version": "5.0.1",
  "description": "MCP server for Inove AI Framework — 21 agents, 41 skills, 22 workflows",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "inove-mcp": "dist/index.js"
  },
  "scripts": {
    "prebuild": "tsx scripts/bundle-content.ts",
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.26.0",
    "yaml": "^2.7.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  },
  "engines": {
    "node": ">=22.0.0"
  },
  "files": [
    "dist/"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## 8. Implementacao por Ficheiro

### 8.1 src/loaders/frontmatter.ts (~40 linhas)

Parse YAML frontmatter de ficheiros .md. Funcoes:
- `parseFrontmatter<T>(content: string): { meta: T; body: string }`
- `parseAgentFrontmatter(content: string): { meta: AgentMeta; body: string }`
- `splitCsv(value: string): string[]` — converte "tool1, tool2" em ["tool1", "tool2"]

Usa regex `/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/` para separar frontmatter do body.

### 8.2 src/loaders/agents.ts (~30 linhas)

- `loadAllAgents(): Promise<Map<string, Agent>>` — le todos os .md de PATHS.agents
- `loadAgent(name: string): Promise<Agent | null>` — le um agente especifico

### 8.3 src/loaders/skills.ts (~50 linhas)

- `loadAllSkills(): Promise<Map<string, Skill>>` — le todos os diretorios de PATHS.skills
- `loadSkill(name: string): Promise<Skill | null>` — le SKILL.md + sub-files + verifica scripts/

Concatenacao de skill: SKILL.md body primeiro, depois cada sub-file separado por `\n\n---\n\n# {filename}\n\n`.

### 8.4 src/loaders/workflows.ts (~30 linhas)

- `loadAllWorkflows(): Promise<Map<string, Workflow>>` — le todos os .md de PATHS.workflows
- `loadWorkflow(name: string): Promise<Workflow | null>` — le um workflow especifico

Nome derivado do filename (ex: "define.md" -> "define").

### 8.5 src/loaders/cache.ts (~25 linhas)

```typescript
export interface ContentCache {
  agents: Map<string, Agent>;
  skills: Map<string, Skill>;
  workflows: Map<string, Workflow>;
  architecture: string;
  instructions: string;
}
```

- `getCache(): Promise<ContentCache>` — carrega tudo 1x no startup com `Promise.all()`
- Singleton: segunda chamada retorna cache existente

### 8.6 src/core/resources.ts (~70 linhas)

Regista 6 resources no McpServer:
- 2 static (architecture, instructions)
- 1 static list (agents-list como JSON)
- 3 templates parametrizados (agents/{name}, skills/{name}, workflows/{name})

### 8.7 src/core/tools.ts (~100 linhas)

Regista 8 tools no McpServer com schemas Zod inline:
- 3 list tools (sem input)
- 3 get tools (input: { name: z.string() })
- route_task (input: { request: z.string() })
- search_content (input: { query, scope?, max_results? })

### 8.8 src/utils/routing.ts (~40 linhas)

`routeTask(request: string, cache: ContentCache): RouteResult`

Algoritmo:
1. Normaliza request para lowercase
2. Para cada agente, conta quantas keywords aparecem no request
3. Ordena por score decrescente
4. Retorna top 3 agentes com skills associadas + reasoning

### 8.9 src/utils/search.ts (~35 linhas)

`searchContent(query, scope, maxResults, cache): SearchResult[]`

Algoritmo:
1. Para cada item no scope, split por linhas
2. Filtra linhas que contem a query (case-insensitive)
3. Retorna ate 3 matched lines por item
4. Limita a maxResults total

### 8.10 src/core/prompts.ts (~60 linhas)

Regista 22 prompts (um por workflow) com:
- Nome = nome do workflow
- Argumento opcional `{ topic?: string }`
- Retorna: assistant message (workflow markdown) + user message ("Execute /{name} for: {topic}")

### 8.11 src/index.ts (~20 linhas)

Entry point:
1. `await getCache()` — pre-warm
2. Cria `McpServer` com nome e versao
3. `registerResources(server)`
4. `registerTools(server)`
5. `registerPrompts(server)`
6. Conecta via `StdioServerTransport`

---

## 9. Fases de Entrega

### Phase 1: MVP (implementacao do servidor)

**Objetivo:** Servidor stdio funcional com todas as capabilities.

| Step | Tarefa | Agente Recomendado | Skill |
|------|--------|-------------------|-------|
| 1 | Scaffold (package.json, tsconfig) | backend-specialist | nodejs-best-practices |
| 2 | types.ts + constants.ts | backend-specialist | mcp-builder |
| 3 | loaders (frontmatter, agents, skills, workflows, cache) | backend-specialist | mcp-builder |
| 4 | core/resources.ts | backend-specialist | mcp-builder |
| 5 | utils (routing, search) | backend-specialist | mcp-builder |
| 6 | core/tools.ts | backend-specialist | mcp-builder |
| 7 | core/prompts.ts | backend-specialist | mcp-builder |
| 8 | index.ts (entry point) | backend-specialist | mcp-builder |
| 9 | Testes unitarios | test-engineer | testing-patterns |
| 10 | Teste integracao (server completo) | test-engineer | testing-patterns |

**Grafo de dependencias:**
```
Step 1 ──┐
Step 2 ──┤
         ├── Step 3 ── Step 4 ──┐
         │            Step 5 ──┤
         │            Step 6 ──┤── Step 8 ── Step 10
         │            Step 7 ──┘
         └── Step 9
```

### Phase 2: Publicacao + Deprecacao

| Step | Tarefa | Agente |
|------|--------|--------|
| 11 | Criar org @inove-ai no npm (se nao existir) | manual |
| 12 | Configurar 2FA/token para publish | manual |
| 13 | `npm publish --access public` do `@inove-ai/mcp-server` | devops-engineer |
| 14 | Deprecar `@inove-ai/inove-ai-framework` com `npm deprecate` + versao final com aviso | devops-engineer |
| 15 | Atualizar README.md — remover instrucoes `npx init`, so MCP | documentation-writer |
| 16 | Atualizar `bin/cli.js` — mostrar aviso de deprecacao a redirecionar para MCP | backend-specialist |
| 17 | GitHub Actions CI/CD para testes + publish | devops-engineer |

**Deprecacao do pacote antigo:**
```bash
# Publicar versao final com aviso
cd bin/ && npm version major && npm publish
# Marcar como deprecated no registry
npm deprecate "@inove-ai/inove-ai-framework" "Deprecated. Use MCP server: claude mcp add inove-ai -- npx @inove-ai/mcp-server"
```

### Phase 3: Cloud (futuro)

| Step | Tarefa | Agente |
|------|--------|--------|
| 18 | src/worker.ts (entrypoint Cloudflare Workers — reutiliza `EmbeddedLoader` da Phase 1) | backend-specialist |
| 19 | wrangler.toml + deploy | devops-engineer |
| 20 | GitHub Actions deploy automatico | devops-engineer |

> **Nota:** `scripts/bundle-content.ts` ja faz parte da Phase 1 (step `prebuild`), pois o pacote npm tambem precisa de conteudo embedado. A Phase 3 reutiliza o mesmo mecanismo.

---

## 10. Experiencia do Utilizador Final

### Claude Code (30 segundos)

```bash
# Adicionar MCP server
claude mcp add inove-ai -- npx @inove-ai/mcp-server

# Uso numa conversa
User: "List available agents"
Claude: [chama list_agents] -> 21 agentes

User: "Help me debug this React bug"
Claude: [chama route_task] -> debugger + frontend-specialist
        [chama get_agent("debugger")] -> carrega persona
        -> Inicia debug sistematico
```

### Cursor / VS Code

```json
// .cursor/mcp.json ou .vscode/mcp.json
{
  "mcpServers": {
    "inove-ai": {
      "command": "npx",
      "args": ["-y", "@inove-ai/mcp-server"]
    }
  }
}
```

### Cloud (Phase 3)

```json
{
  "mcpServers": {
    "inove-ai": {
      "url": "https://inove-mcp.workers.dev/sse"
    }
  }
}
```

---

## 11. Fluxo de Atualizacoes

| Cenario | Acao Necessaria |
|---------|-----------------|
| Editar agente existente | `npm run build && npm publish` (re-embeda conteudo) |
| Adicionar novo agente | `npm run build && npm publish` (auto-descoberto no prebuild) |
| Adicionar nova skill | `npm run build && npm publish` (auto-descoberto no prebuild) |
| Adicionar novo workflow | `npm run build && npm publish` (auto-descoberto + prompt criado) |
| Mudar logica do server | Editar TypeScript → `npm run build && npm publish` |
| Deploy cloud | Push para GitHub → Actions faz build + deploy automatico |
| Dev local (contribuidores) | `npm run dev` — usa FsLoader, alteracoes refletidas em tempo real |

**Regra:** Alteracoes a conteudo (.agents/) requerem um `npm publish` para que utilizadores via `npx` vejam a nova versao. Em dev local (`npm run dev`), alteracoes sao imediatas.

**CI/CD automatizado (recomendado):** GitHub Actions faz `npm run build && npm publish` em cada push para main, eliminando a necessidade de publish manual.

---

## 12. Verificacao Final

- [ ] `cd mcp-server && npm install` — instala sem erros
- [ ] `npm run typecheck` — TypeScript compila
- [ ] `npm run build` — gera dist/
- [ ] `npm test` — testes passam
- [ ] `node dist/index.js` — server inicia e responde a initialize
- [ ] `claude mcp add inove-ai -- node dist/index.js` — Claude Code conecta
- [ ] `list_agents` retorna 21 agentes
- [ ] `list_skills` retorna 41 skills
- [ ] `list_workflows` retorna 22 workflows
- [ ] `get_agent("debugger")` retorna conteudo completo
- [ ] `get_skill("clean-code")` retorna SKILL.md + sub-files
- [ ] `get_workflow("define")` retorna workflow completo
- [ ] `route_task("fix authentication bug")` recomenda security-auditor
- [ ] `search_content("tailwind")` encontra resultados relevantes
- [ ] 22 prompts listados e invocaveis
- [ ] `inove://architecture` retorna ARCHITECTURE.md
- [ ] Security scan: `python .agents/skills/vulnerability-scanner/scripts/security_scan.py mcp-server/`
- [ ] `npm pack --dry-run` mostra apenas `dist/` (sem conteudo externo)
- [ ] `npx @inove-ai/mcp-server` funciona sem acesso ao repo (conteudo embedado)
- [ ] Pacote antigo `@inove-ai/inove-ai-framework` mostra deprecation warning

---

## 13. Riscos

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Bundle embedado excede 10MB | Nao faz deploy Workers | Excluir .shared/ e scripts Python do bundle |
| MCP SDK breaking changes | Server para de funcionar | Pintar versao do SDK, testes de integracao |
| Conteudo desatualizado no npm | Utilizadores veem versao antiga | CI re-bundle + publish em cada push para main |
| Scripts Python nao executaveis via MCP | Funcionalidade reduzida | Scripts listados como metadata; execucao requer clone local |
| npm org @inove-ai nao criada | Nao publica | Criar org antes de Phase 2 |
| Migracao de utilizadores do pacote antigo | Confusao, instalacoes duplicadas | Deprecation notice no pacote antigo + periodo de 6 meses |
| Perda de customizacao local | Utilizadores nao podem editar agentes | Documentar como usar FsLoader com clone local |

---

## 14. Metricas de Sucesso (3 meses apos lancamento)

| Metrica | Target |
|---------|--------|
| npm downloads semanais | 500+ |
| Setup time | < 30 segundos |
| Disk usage por projeto | 0 MB (vs ~15MB com file-copy) |
| Tool response time | < 500ms |
| Error rate | < 1% |
| Agentes acedidos por semana | Todos os 21 |
