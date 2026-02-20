import YAML from "yaml";
import type { AgentMeta, SkillMeta, WorkflowMeta } from "../types.js";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseFrontmatter<T>(content: string): { meta: T; body: string } {
  const match = content.match(FRONTMATTER_RE);
  if (!match) {
    return { meta: {} as T, body: content };
  }
  let meta: T;
  try {
    meta = YAML.parse(match[1]) as T;
  } catch {
    // Fallback: parse key-value pairs manually for YAML with unquoted special chars
    const result: Record<string, string> = Object.create(null);
    for (const line of match[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        result[key] = val;
      }
    }
    meta = result as T;
  }
  const body = match[2].trim();
  return { meta, body };
}

function splitCsv(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function parseAgentFrontmatter(content: string): { meta: AgentMeta; body: string } {
  const { meta, body } = parseFrontmatter<Record<string, unknown>>(content);
  return {
    meta: {
      name: String(meta.name ?? ""),
      description: String(meta.description ?? ""),
      tools: splitCsv(meta.tools),
      model: String(meta.model ?? "inherit"),
      skills: splitCsv(meta.skills),
    },
    body,
  };
}

export function parseSkillFrontmatter(content: string): { meta: SkillMeta; body: string } {
  const { meta, body } = parseFrontmatter<Record<string, unknown>>(content);
  return {
    meta: {
      name: String(meta.name ?? ""),
      description: String(meta.description ?? ""),
      allowedTools: meta["allowed-tools"] ? splitCsv(meta["allowed-tools"]) : undefined,
      version: meta.version != null ? String(meta.version) : undefined,
      priority: meta.priority != null ? String(meta.priority) : undefined,
    },
    body,
  };
}

export function parseWorkflowFrontmatter(content: string): { meta: WorkflowMeta; body: string } {
  const { meta, body } = parseFrontmatter<Record<string, unknown>>(content);
  return {
    meta: {
      description: String(meta.description ?? ""),
    },
    body,
  };
}
