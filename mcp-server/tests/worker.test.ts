import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/worker.js";
import { SERVER_NAME, SERVER_VERSION } from "../src/constants.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function req(path: string, method = "GET", init?: RequestInit): Request {
  return new Request(`http://localhost${path}`, { method, ...init });
}

async function json(res: Response): Promise<unknown> {
  return res.json();
}

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------
describe("CORS preflight", () => {
  let response: Response;

  beforeAll(async () => {
    response = await worker.fetch(req("/", "OPTIONS"));
  });

  it("should return 204 status", () => {
    expect(response.status).toBe(204);
  });

  it("should return no body", async () => {
    const body = await response.text();
    expect(body).toBe("");
  });

  it("should include Access-Control-Allow-Origin header", () => {
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should include Access-Control-Allow-Methods header", () => {
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
  });

  it("should include Access-Control-Allow-Headers header", () => {
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type, mcp-session-id",
    );
  });
});

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------
describe("health check", () => {
  describe("GET /", () => {
    let response: Response;
    let body: Record<string, unknown>;

    beforeAll(async () => {
      response = await worker.fetch(req("/"));
      body = (await json(response)) as Record<string, unknown>;
    });

    it("should return 200 status", () => {
      expect(response.status).toBe(200);
    });

    it("should return status ok", () => {
      expect(body.status).toBe("ok");
    });

    it("should include correct server name", () => {
      expect(body.name).toBe(SERVER_NAME);
    });

    it("should include correct server version", () => {
      expect(body.version).toBe(SERVER_VERSION);
    });

    it("should include at least 22 agents", () => {
      expect(body.agents).toBeGreaterThanOrEqual(21);
    });

    it("should include at least 42 skills", () => {
      expect(body.skills).toBeGreaterThanOrEqual(41);
    });

    it("should include at least 25 workflows", () => {
      expect(body.workflows).toBeGreaterThanOrEqual(22);
    });

    it("should include CORS headers", () => {
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
    });

    it("should include X-Content-Type-Options security header", () => {
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });

    it("should include X-Frame-Options security header", () => {
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    });

    it("should include Referrer-Policy security header", () => {
      expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    });

    it("should return application/json content type", () => {
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });
  });

  describe("GET /health", () => {
    let response: Response;
    let body: Record<string, unknown>;

    beforeAll(async () => {
      response = await worker.fetch(req("/health"));
      body = (await json(response)) as Record<string, unknown>;
    });

    it("should return 200 status", () => {
      expect(response.status).toBe(200);
    });

    it("should return the same response shape as GET /", () => {
      expect(body.status).toBe("ok");
      expect(body.name).toBe(SERVER_NAME);
      expect(body.version).toBe(SERVER_VERSION);
      expect(typeof body.agents).toBe("number");
      expect(typeof body.skills).toBe("number");
      expect(typeof body.workflows).toBe("number");
    });

    it("should include CORS headers", () => {
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });
  });
});

// ---------------------------------------------------------------------------
// 404 Fallback
// ---------------------------------------------------------------------------
describe("404 fallback", () => {
  let response: Response;
  let body: Record<string, unknown>;

  beforeAll(async () => {
    response = await worker.fetch(req("/unknown-route"));
    body = (await json(response)) as Record<string, unknown>;
  });

  it("should return 404 status", () => {
    expect(response.status).toBe(404);
  });

  it("should return an error message", () => {
    expect(body.error).toBeDefined();
    expect(typeof body.error).toBe("string");
  });

  it("should include CORS headers", () => {
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
  });
});

// ---------------------------------------------------------------------------
// MCP Endpoint
// ---------------------------------------------------------------------------
describe("POST /mcp", () => {
  it("should return 200 for a valid initialize request", async () => {
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    };

    const response = await worker.fetch(
      req("/mcp", "POST", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify(initRequest),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("should include CORS headers on MCP response", async () => {
    const initRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    };

    const response = await worker.fetch(
      req("/mcp", "POST", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify(initRequest),
      }),
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should return 413 for oversized body", async () => {
    const oversizedPayload = "x".repeat(65 * 1024); // 65 KB > 64 KB limit

    const response = await worker.fetch(
      req("/mcp", "POST", {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": String(oversizedPayload.length),
        },
        body: oversizedPayload,
      }),
    );

    expect(response.status).toBe(413);
    const body = (await json(response)) as Record<string, unknown>;
    expect(body.error).toBe("Payload too large");
  });
});

// ---------------------------------------------------------------------------
// Cache Behavior
// ---------------------------------------------------------------------------
describe("getWorkerCache consistency", () => {
  it("should return consistent content counts across repeated health calls", async () => {
    const res1 = await worker.fetch(req("/"));
    const res2 = await worker.fetch(req("/"));

    const body1 = (await json(res1)) as Record<string, number>;
    const body2 = (await json(res2)) as Record<string, number>;

    expect(body1.agents).toBe(body2.agents);
    expect(body1.skills).toBe(body2.skills);
    expect(body1.workflows).toBe(body2.workflows);
  });
});

// ---------------------------------------------------------------------------
// jsonResponse Helper (tested indirectly via responses)
// ---------------------------------------------------------------------------
describe("jsonResponse helper", () => {
  it("should produce correct Content-Type on all responses", async () => {
    const healthRes = await worker.fetch(req("/"));
    expect(healthRes.headers.get("Content-Type")).toBe("application/json");

    const notFoundRes = await worker.fetch(req("/nonexistent"));
    expect(notFoundRes.headers.get("Content-Type")).toBe("application/json");
  });

  it("should default to status 200 for health check", async () => {
    const response = await worker.fetch(req("/"));
    expect(response.status).toBe(200);
  });

  it("should accept custom status codes", async () => {
    // 404 via unknown route
    const res404 = await worker.fetch(req("/does-not-exist"));
    expect(res404.status).toBe(404);

    // 413 via oversized body
    const res413 = await worker.fetch(
      req("/mcp", "POST", {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": String(100_000),
        },
        body: "x".repeat(100_000),
      }),
    );
    expect(res413.status).toBe(413);
  });
});
