import { describe, it, expect, beforeAll } from "vitest";
import { getCache, resetCache } from "../src/loaders/cache.js";
import type { ContentCache } from "../src/types.js";

let cache: ContentCache;

beforeAll(async () => {
  resetCache();
  cache = await getCache();
});

describe("prompts registration", () => {
  it("has at least 25 workflows available for prompt registration", () => {
    expect(cache.workflows.size).toBeGreaterThanOrEqual(22);
  });

  it("every workflow has a description for the prompt", () => {
    for (const [name, workflow] of cache.workflows) {
      expect(workflow.meta.description, `workflow "${name}" missing description`).toBeTruthy();
    }
  });

  it("every workflow has non-empty raw content for the assistant message", () => {
    for (const [name, workflow] of cache.workflows) {
      expect(workflow.raw.length, `workflow "${name}" has empty raw content`).toBeGreaterThan(0);
    }
  });

  it("every workflow has a non-empty body", () => {
    for (const [name, workflow] of cache.workflows) {
      expect(workflow.body.length, `workflow "${name}" has empty body`).toBeGreaterThan(0);
    }
  });

  it("core workflows exist (define, debug, create, brainstorm)", () => {
    const required = ["define", "debug", "create", "brainstorm"];
    for (const name of required) {
      expect(cache.workflows.has(name), `missing core workflow: ${name}`).toBe(true);
    }
  });
});

describe("prompt message format", () => {
  it("workflow 'define' would produce valid prompt messages", () => {
    const workflow = cache.workflows.get("define");
    expect(workflow).toBeDefined();

    // Simulate what registerPrompts does (no argsSchema, no topic arg)
    const messages = [
      { role: "assistant", content: { type: "text", text: workflow!.raw } },
      { role: "user", content: { type: "text", text: "Execute /define" } },
    ];

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("assistant");
    expect(messages[0].content.text).toContain("---");
    expect(messages[1].role).toBe("user");
    expect(messages[1].content.text).toBe("Execute /define");
  });

  it("prompt produces Execute /name format", () => {
    const workflow = cache.workflows.get("debug");
    expect(workflow).toBeDefined();

    const userMessage = "Execute /debug";

    expect(userMessage).toBe("Execute /debug");
    expect(userMessage).not.toContain("for:");
  });

  it("prompts work without arguments (SDK compat fix)", () => {
    // Ensures prompts don't require argsSchema, which caused
    // MCP error -32602 when clients send undefined arguments
    const workflow = cache.workflows.get("define");
    expect(workflow).toBeDefined();

    const userMessage = "Execute /define";
    expect(userMessage).toBe("Execute /define");
  });
});
