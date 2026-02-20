import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Detect if running from repo (dev) or from npm package (prod)
const repoRoot = join(__dirname, "..", "..");
const agentsDir = join(repoRoot, ".agents");
export const IS_DEV = existsSync(agentsDir);

export const PATHS = {
  agents: join(agentsDir, "agents"),
  skills: join(agentsDir, "skills"),
  workflows: join(agentsDir, "workflows"),
  architecture: join(agentsDir, "ARCHITECTURE.md"),
  instructions: join(agentsDir, "INSTRUCTIONS.md"),
} as const;

export const SERVER_NAME = "inove-ai";
export const SERVER_VERSION = "5.0.1";

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
