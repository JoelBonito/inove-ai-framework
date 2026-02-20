import type { Agent, ContentLoader, Skill, SubFile, Workflow } from "../types.js";
import { parseAgentFrontmatter, parseSkillFrontmatter, parseWorkflowFrontmatter } from "./frontmatter.js";

// Dynamic import — registry.ts only exists after prebuild
async function loadRegistry() {
  return import("../registry.js");
}

export class EmbeddedLoader implements ContentLoader {
  async loadAgents(): Promise<Map<string, Agent>> {
    const { EMBEDDED_AGENTS } = await loadRegistry();
    const agents = new Map<string, Agent>();

    for (const [key, raw] of Object.entries(EMBEDDED_AGENTS) as [string, string][]) {
      const { meta, body } = parseAgentFrontmatter(raw);
      const name = meta.name || key;
      agents.set(name, { meta: { ...meta, name }, body, raw });
    }
    return agents;
  }

  async loadSkills(): Promise<Map<string, Skill>> {
    const { EMBEDDED_SKILLS } = await loadRegistry();
    const skills = new Map<string, Skill>();

    for (const [key, data] of Object.entries(EMBEDDED_SKILLS) as [string, { skill: string; subFiles: Record<string, string>; hasScripts: boolean }][]) {
      const { meta, body } = parseSkillFrontmatter(data.skill);
      const name = meta.name || key;

      const subFiles: SubFile[] = Object.entries(data.subFiles).map(
        ([filename, content]) => ({ filename, content }),
      );

      let raw = data.skill;
      for (const sub of subFiles) {
        raw += `\n\n---\n\n# ${sub.filename}\n\n${sub.content}`;
      }

      skills.set(name, { meta: { ...meta, name }, body, subFiles, hasScripts: data.hasScripts, raw });
    }
    return skills;
  }

  async loadWorkflows(): Promise<Map<string, Workflow>> {
    const { EMBEDDED_WORKFLOWS } = await loadRegistry();
    const workflows = new Map<string, Workflow>();

    for (const [name, raw] of Object.entries(EMBEDDED_WORKFLOWS) as [string, string][]) {
      const { meta, body } = parseWorkflowFrontmatter(raw);
      workflows.set(name, { meta, body, raw });
    }
    return workflows;
  }

  async loadFile(path: string): Promise<string> {
    const registry = await loadRegistry();
    if (path === "ARCHITECTURE") return registry.EMBEDDED_ARCHITECTURE;
    if (path === "INSTRUCTIONS") return registry.EMBEDDED_INSTRUCTIONS;
    throw new Error(`Unknown embedded file: ${path}`);
  }
}
