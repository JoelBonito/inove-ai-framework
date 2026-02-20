import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ContentCache, AgentSummary } from "../types.js";

export function registerResources(server: McpServer, cache: ContentCache): void {
  // Static: list of all agents as JSON
  server.resource(
    "agents-list",
    "inove://agents",
    { mimeType: "application/json", description: "List of all agents with name, description and skills" },
    () => {
      const list: AgentSummary[] = [...cache.agents.values()].map((a) => ({
        name: a.meta.name,
        description: a.meta.description,
        skills: a.meta.skills,
      }));
      return { contents: [{ uri: "inove://agents", text: JSON.stringify(list, null, 2), mimeType: "application/json" }] };
    },
  );

  // Static: architecture doc
  server.resource(
    "architecture",
    "inove://architecture",
    { mimeType: "text/markdown", description: "Framework architecture documentation" },
    () => ({
      contents: [{ uri: "inove://architecture", text: cache.architecture, mimeType: "text/markdown" }],
    }),
  );

  // Static: instructions doc
  server.resource(
    "instructions",
    "inove://instructions",
    { mimeType: "text/markdown", description: "Framework usage instructions" },
    () => ({
      contents: [{ uri: "inove://instructions", text: cache.instructions, mimeType: "text/markdown" }],
    }),
  );

  // Template: individual agent
  server.resource(
    "agent",
    new ResourceTemplate("inove://agents/{name}", { list: undefined }),
    { mimeType: "text/markdown", description: "Full content of a specific agent" },
    (uri, { name }) => {
      const agent = cache.agents.get(name as string);
      if (!agent) {
        return { contents: [{ uri: uri.href, text: `Agent "${name}" not found`, mimeType: "text/plain" }] };
      }
      return { contents: [{ uri: uri.href, text: agent.raw, mimeType: "text/markdown" }] };
    },
  );

  // Template: individual skill
  server.resource(
    "skill",
    new ResourceTemplate("inove://skills/{name}", { list: undefined }),
    { mimeType: "text/markdown", description: "Full content of a specific skill (SKILL.md + sub-files)" },
    (uri, { name }) => {
      const skill = cache.skills.get(name as string);
      if (!skill) {
        return { contents: [{ uri: uri.href, text: `Skill "${name}" not found`, mimeType: "text/plain" }] };
      }
      return { contents: [{ uri: uri.href, text: skill.raw, mimeType: "text/markdown" }] };
    },
  );

  // Template: individual workflow
  server.resource(
    "workflow",
    new ResourceTemplate("inove://workflows/{name}", { list: undefined }),
    { mimeType: "text/markdown", description: "Full content of a specific workflow" },
    (uri, { name }) => {
      const workflow = cache.workflows.get(name as string);
      if (!workflow) {
        return { contents: [{ uri: uri.href, text: `Workflow "${name}" not found`, mimeType: "text/plain" }] };
      }
      return { contents: [{ uri: uri.href, text: workflow.raw, mimeType: "text/markdown" }] };
    },
  );
}
