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

  // Static: condensed system prompt with operational rules
  server.resource(
    "system-prompt",
    "inove://system-prompt",
    { mimeType: "text/markdown", description: "Condensed operational rules (Socratic Gate, routing, clean code). Inject into system prompt for full framework behavior." },
    () => {
      const agentList = [...cache.agents.values()]
        .map((a) => `| \`${a.meta.name}\` | ${a.meta.description} | ${a.meta.skills.join(", ")} |`)
        .join("\n");

      const workflowList = [...cache.workflows.entries()]
        .map(([name, w]) => `| \`/${name}\` | ${w.meta.description} |`)
        .join("\n");

      const prompt = `# Inove AI Framework — Operational Rules

> Injected via MCP. These rules govern how you operate with the framework.

## Routing Protocol

When the user asks for help, detect the domain from their request and activate the appropriate agent using the \`activate_agent\` tool. Use \`route_task\` if unsure which agent to pick.

## Socratic Gate (MANDATORY)

For ALL requests involving code, STOP and ASK first:

| Request Type | Strategy | Action |
|---|---|---|
| New Feature / Build | Deep Discovery | ASK minimum 3 strategic questions |
| Edit / Bug Fix | Diagnosis | Present DIAGNOSIS + PROPOSAL → wait for approval → only then edit |
| Vague / Simple | Clarification | Ask Purpose, Users and Scope |

**Never assume.** If 1% is undefined, ASK.

## Clean Code (Global)

- Concise, self-documenting code
- No over-engineering
- Tests mandatory (Unit > Integration > E2E)
- Comments in English, variables/functions in English
- Respond in user's language

## Workflow Invocation

Use the \`execute_workflow\` tool to run slash commands. Available workflows:

| Command | Description |
|---|---|
${workflowList}

## Agent Activation

Use the \`activate_agent\` tool to load an agent's persona, rules and skills. Available agents:

| Agent | Description | Skills |
|---|---|---|
${agentList}

## Backlog Integration

When the user says "implement Epic X" or "implement Story Y.Z":

1. Read \`docs/PROJECT_STATUS.md\` — know which story to open
2. Open story file in \`docs/stories/STORY-*.md\` — full implementation context
3. Validate dependencies (depends_on field must all be done)
4. Activate agent indicated in story file's \`agent\` field
5. Implement following agent rules
6. Run finish_task.py to update backlog + story + PROJECT_STATUS

> Backlog is just an index of checkboxes. Never read it for implementation context.

## Post-Define Flow

After \`/define\`:
1. \`/track\` — Verify progress
2. Start implementing (PROJECT_STATUS tells you which story is next)
`;

      return { contents: [{ uri: "inove://system-prompt", text: prompt, mimeType: "text/markdown" }] };
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
