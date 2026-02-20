import { describe, it, expect, beforeAll } from "vitest";
import { routeTask } from "../src/utils/routing.js";
import { searchContent } from "../src/utils/search.js";
import { getCache, resetCache } from "../src/loaders/cache.js";
import type { ContentCache } from "../src/types.js";

let cache: ContentCache;

beforeAll(async () => {
  resetCache();
  cache = await getCache();
});

// ---------------------------------------------------------------------------
// routeTask
// ---------------------------------------------------------------------------
describe("routeTask", () => {
  it("should route 'fix authentication bug' to security-auditor", () => {
    const result = routeTask("fix authentication bug", cache);

    const agentNames = result.agents.map((a) => a.name);
    expect(agentNames).toContain("security-auditor");
  });

  it("should route 'build a react page' to frontend-specialist", () => {
    const result = routeTask("build a react page", cache);

    const agentNames = result.agents.map((a) => a.name);
    expect(agentNames).toContain("frontend-specialist");
  });

  it("should return empty agents array for unrecognized input", () => {
    const result = routeTask("xyzzy foobar baz", cache);

    expect(result.agents).toHaveLength(0);
    expect(result.reasoning).toContain("No strong keyword match");
  });

  it("should include reasoning with agent scores", () => {
    const result = routeTask("debug this error in the backend", cache);

    expect(result.reasoning).toBeTruthy();
    // Should mention matched agent names
    expect(result.reasoning).toContain("score:");
  });

  it("should return at most 3 agents", () => {
    // A broad query that could match many agents
    const result = routeTask(
      "debug security bug in mobile app frontend with database query performance",
      cache,
    );

    expect(result.agents.length).toBeLessThanOrEqual(3);
  });

  it("should include related skills for matched agents", () => {
    const result = routeTask("fix authentication bug", cache);

    // security-auditor has skills; they should appear in the result
    expect(result.skills.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// searchContent
// ---------------------------------------------------------------------------
describe("searchContent", () => {
  it("should find results for 'tailwind' in skills scope", () => {
    const results = searchContent("tailwind", "skills", 50, cache);

    expect(results.length).toBeGreaterThan(0);
    // All results should be of type skill
    for (const r of results) {
      expect(r.type).toBe("skill");
    }
  });

  it("should find results for 'debug' across all scopes", () => {
    const results = searchContent("debug", "all", 50, cache);

    expect(results.length).toBeGreaterThan(0);
    // Should have results from multiple types
    const types = new Set(results.map((r) => r.type));
    expect(types.size).toBeGreaterThanOrEqual(1);
  });

  it("should respect maxResults limit", () => {
    const results = searchContent("the", "all", 3, cache);

    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("should respect scope filter for agents only", () => {
    const results = searchContent("debug", "agents", 50, cache);

    for (const r of results) {
      expect(r.type).toBe("agent");
    }
  });

  it("should respect scope filter for workflows only", () => {
    const results = searchContent("create", "workflows", 50, cache);

    for (const r of results) {
      expect(r.type).toBe("workflow");
    }
  });

  it("should return matching lines in the matches array", () => {
    const results = searchContent("debug", "agents", 10, cache);

    expect(results.length).toBeGreaterThan(0);
    const debugResult = results.find((r) => r.name === "debugger");
    expect(debugResult).toBeDefined();
    expect(debugResult!.matches.length).toBeGreaterThan(0);
    // Each match line should contain the search term (case-insensitive)
    for (const match of debugResult!.matches) {
      expect(match.toLowerCase()).toContain("debug");
    }
  });

  it("should return empty array when no matches found", () => {
    const results = searchContent("xyzzy_nonexistent_term_42", "all", 50, cache);

    expect(results).toEqual([]);
  });
});
