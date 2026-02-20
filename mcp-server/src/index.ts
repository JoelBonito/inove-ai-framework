#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { getCache } from "./loaders/cache.js";
import { registerResources } from "./core/resources.js";
import { registerTools } from "./core/tools.js";
import { registerPrompts } from "./core/prompts.js";

async function main() {
  const cache = await getCache();

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerResources(server, cache);
  registerTools(server, cache);
  registerPrompts(server, cache);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
