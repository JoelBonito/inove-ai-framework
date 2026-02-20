import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ContentCache } from "../types.js";
import { routeTask } from "../utils/routing.js";
import { searchContent } from "../utils/search.js";

export function registerTools(server: McpServer, cache: ContentCache): void {
  // list_agents
  server.tool(
    "list_agents",
    "List all available agents with name, description and skills",
    {},
    () => {
      const list = [...cache.agents.values()].map((a) => ({
        name: a.meta.name,
        description: a.meta.description,
        skills: a.meta.skills,
      }));
      return { content: [{ type: "text" as const, text: JSON.stringify(list, null, 2) }] };
    },
  );

  // list_skills
  server.tool(
    "list_skills",
    "List all available skills with name and description",
    {},
    () => {
      const list = [...cache.skills.values()].map((s) => ({
        name: s.meta.name,
        description: s.meta.description,
      }));
      return { content: [{ type: "text" as const, text: JSON.stringify(list, null, 2) }] };
    },
  );

  // list_workflows
  server.tool(
    "list_workflows",
    "List all available workflows (slash commands) with name and description",
    {},
    () => {
      const list = [...cache.workflows.entries()].map(([name, w]) => ({
        name,
        description: w.meta.description,
      }));
      return { content: [{ type: "text" as const, text: JSON.stringify(list, null, 2) }] };
    },
  );

  // get_agent
  server.tool(
    "get_agent",
    "Get full content of a specific agent by name",
    { name: z.string().describe("Agent name (e.g. 'debugger', 'frontend-specialist')") },
    ({ name }) => {
      const agent = cache.agents.get(name);
      if (!agent) {
        return { content: [{ type: "text" as const, text: `Agent "${name}" not found. Use list_agents to see available agents.` }], isError: true };
      }
      return { content: [{ type: "text" as const, text: agent.raw }] };
    },
  );

  // get_skill
  server.tool(
    "get_skill",
    "Get full content of a specific skill (SKILL.md + sub-files concatenated)",
    { name: z.string().describe("Skill name (e.g. 'clean-code', 'mcp-builder')") },
    ({ name }) => {
      const skill = cache.skills.get(name);
      if (!skill) {
        return { content: [{ type: "text" as const, text: `Skill "${name}" not found. Use list_skills to see available skills.` }], isError: true };
      }
      return { content: [{ type: "text" as const, text: skill.raw }] };
    },
  );

  // get_workflow
  server.tool(
    "get_workflow",
    "Get full content of a specific workflow (slash command)",
    { name: z.string().describe("Workflow name (e.g. 'define', 'debug', 'create')") },
    ({ name }) => {
      const workflow = cache.workflows.get(name);
      if (!workflow) {
        return { content: [{ type: "text" as const, text: `Workflow "${name}" not found. Use list_workflows to see available workflows.` }], isError: true };
      }
      return { content: [{ type: "text" as const, text: workflow.raw }] };
    },
  );

  // route_task
  server.tool(
    "route_task",
    "Recommend the best agents and skills for a given task based on keyword analysis",
    { request: z.string().describe("Description of the task (e.g. 'fix authentication bug', 'build a dashboard')") },
    ({ request }) => {
      const result = routeTask(request, cache);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // search_content
  server.tool(
    "search_content",
    "Full-text search across all framework content (agents, skills, workflows)",
    {
      query: z.string().describe("Search query"),
      scope: z.enum(["all", "agents", "skills", "workflows"]).default("all").describe("Scope to search in"),
      max_results: z.number().int().min(1).max(50).default(10).describe("Maximum results to return"),
    },
    ({ query, scope, max_results }) => {
      const results = searchContent(query, scope, max_results, cache);
      return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
    },
  );
}
