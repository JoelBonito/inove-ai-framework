import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ContentCache } from "../types.js";

export function registerPrompts(server: McpServer, cache: ContentCache): void {
  for (const [name, workflow] of cache.workflows) {
    server.prompt(
      name,
      workflow.meta.description || `Execute the /${name} workflow`,
      { topic: z.string().optional().describe("Topic or context for this workflow") },
      ({ topic }) => ({
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
              text: topic
                ? `Execute /${name} for: ${topic}`
                : `Execute /${name}`,
            },
          },
        ],
      }),
    );
  }
}
