import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ContentCache } from "../types.js";

export function registerPrompts(server: McpServer, cache: ContentCache): void {
  for (const [name, workflow] of cache.workflows) {
    server.prompt(
      name,
      workflow.meta.description || `Execute the /${name} workflow`,
      () => ({
        messages: [
          {
            role: "assistant" as const,
            content: {
              type: "text" as const,
              text: workflow.raw,
            },
          },
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Execute /${name}`,
            },
          },
        ],
      }),
    );
  }
}
