/**
 * Cloudflare Workers entrypoint for Inove AI MCP Server.
 * Serves the same 22 agents, 42 skills, 25 workflows as the stdio server
 * via Streamable HTTP transport (stateless, public).
 *
 * WARNING: This module must NOT import paths.ts or cache.ts — they use node:fs.
 * Use EmbeddedLoader directly for Worker-compatible content loading.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  WebStandardStreamableHTTPServerTransport,
} from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { EmbeddedLoader } from "./loaders/embedded.js";
import { registerResources } from "./core/resources.js";
import { registerTools } from "./core/tools.js";
import { registerPrompts } from "./core/prompts.js";
import type { ContentCache } from "./types.js";

const MAX_BODY_SIZE = 64 * 1024; // 64 KB — generous for JSON-RPC

// Module-level cache — Promise-based singleton to prevent race conditions on cold start
let cachePromise: Promise<ContentCache> | null = null;

function getWorkerCache(): Promise<ContentCache> {
  if (!cachePromise) {
    cachePromise = (async () => {
      const loader = new EmbeddedLoader();
      const [agents, skills, workflows, architecture, instructions] = await Promise.all([
        loader.loadAgents(),
        loader.loadSkills(),
        loader.loadWorkflows(),
        loader.loadFile("ARCHITECTURE"),
        loader.loadFile("INSTRUCTIONS"),
      ]);
      return { agents, skills, workflows, architecture, instructions };
    })().catch((err) => {
      cachePromise = null; // Allow retry on next request
      throw err;
    });
  }
  return cachePromise;
}

// CORS: Wildcard is intentional — this is a public, read-only, credential-free API.
// MCP clients (Claude Desktop, Cursor, VS Code) connect from any origin.
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, mcp-session-id",
};

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...SECURITY_HEADERS },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);

      // CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } });
      }

      // Health check
      if (url.pathname === "/" || url.pathname === "/health") {
        const c = await getWorkerCache();
        return jsonResponse({
          status: "ok",
          name: SERVER_NAME,
          version: SERVER_VERSION,
          agents: c.agents.size,
          skills: c.skills.size,
          workflows: c.workflows.size,
        });
      }

      // MCP endpoint
      if (url.pathname === "/mcp") {
        // Body size guard — prevent DoS via oversized payloads
        const contentLength = parseInt(request.headers.get("content-length") ?? "0", 10);
        if (contentLength > MAX_BODY_SIZE) {
          return jsonResponse({ error: "Payload too large" }, 413);
        }

        const c = await getWorkerCache();

        const server = new McpServer({
          name: SERVER_NAME,
          version: SERVER_VERSION,
        });

        registerResources(server, c);
        registerTools(server, c);
        registerPrompts(server, c);

        const transport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: undefined, // Stateless — no session management
        });

        await server.connect(transport);

        const response = await transport.handleRequest(request);
        if (!response) {
          return jsonResponse({ error: "Invalid MCP request" }, 400);
        }

        // Inject CORS + security headers into MCP response
        const headers = new Headers(response.headers);
        for (const [key, value] of Object.entries({ ...CORS_HEADERS, ...SECURITY_HEADERS })) {
          headers.set(key, value);
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return jsonResponse({ error: "Not found. Use /mcp for MCP protocol or / for health check." }, 404);
    } catch (error) {
      return jsonResponse(
        { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
};
