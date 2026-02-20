import { describe, it, expect, beforeAll } from "vitest";
import { getCache, resetCache } from "../src/loaders/cache.js";
import type { Agent, ContentCache, Skill } from "../src/types.js";

let cache: ContentCache;

beforeAll(async () => {
  resetCache();
  cache = await getCache();
});

// ---------------------------------------------------------------------------
// Full cache integration
// ---------------------------------------------------------------------------
describe("getCache", () => {
  it("should return an object with agents, skills, and workflows maps", () => {
    expect(cache.agents).toBeInstanceOf(Map);
    expect(cache.skills).toBeInstanceOf(Map);
    expect(cache.workflows).toBeInstanceOf(Map);
  });

  it("should return architecture content as a non-empty string", () => {
    expect(typeof cache.architecture).toBe("string");
    expect(cache.architecture.length).toBeGreaterThan(0);
  });

  it("should return instructions content as a non-empty string", () => {
    expect(typeof cache.instructions).toBe("string");
    expect(cache.instructions.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Content counts
// ---------------------------------------------------------------------------
describe("content counts", () => {
  it("should have at least 21 agents", () => {
    expect(cache.agents.size).toBeGreaterThanOrEqual(21);
  });

  it("should have at least 41 skills", () => {
    expect(cache.skills.size).toBeGreaterThanOrEqual(41);
  });

  it("should have at least 22 workflows", () => {
    expect(cache.workflows.size).toBeGreaterThanOrEqual(22);
  });
});

// ---------------------------------------------------------------------------
// Specific agent: debugger
// ---------------------------------------------------------------------------
describe("agent: debugger", () => {
  let agent: Agent;

  beforeAll(() => {
    const found = cache.agents.get("debugger");
    expect(found).toBeDefined();
    agent = found!;
  });

  it("should have name set to 'debugger'", () => {
    expect(agent.meta.name).toBe("debugger");
  });

  it("should have a non-empty description", () => {
    expect(agent.meta.description.length).toBeGreaterThan(0);
  });

  it("should list tools as an array of strings", () => {
    expect(Array.isArray(agent.meta.tools)).toBe(true);
    expect(agent.meta.tools.length).toBeGreaterThan(0);
    expect(agent.meta.tools).toContain("Read");
  });

  it("should list skills as an array of strings", () => {
    expect(Array.isArray(agent.meta.skills)).toBe(true);
    expect(agent.meta.skills).toContain("clean-code");
  });

  it("should have model set", () => {
    expect(agent.meta.model).toBeTruthy();
  });

  it("should have a non-empty body", () => {
    expect(agent.body.length).toBeGreaterThan(0);
  });

  it("should have raw content that includes both frontmatter and body", () => {
    expect(agent.raw).toContain("---");
    expect(agent.raw).toContain("debugger");
  });
});

// ---------------------------------------------------------------------------
// Specific skill: clean-code
// ---------------------------------------------------------------------------
describe("skill: clean-code", () => {
  let skill: Skill;

  beforeAll(() => {
    const found = cache.skills.get("clean-code");
    expect(found).toBeDefined();
    skill = found!;
  });

  it("should have name set to 'clean-code'", () => {
    expect(skill.meta.name).toBe("clean-code");
  });

  it("should have a non-empty description", () => {
    expect(skill.meta.description.length).toBeGreaterThan(0);
  });

  it("should have allowedTools defined", () => {
    expect(skill.meta.allowedTools).toBeDefined();
    expect(Array.isArray(skill.meta.allowedTools)).toBe(true);
  });

  it("should have version set", () => {
    expect(skill.meta.version).toBeDefined();
  });

  it("should have priority set to CRITICAL", () => {
    expect(skill.meta.priority).toBe("CRITICAL");
  });

  it("should have a non-empty body", () => {
    expect(skill.body.length).toBeGreaterThan(0);
  });

  it("should have hasScripts boolean", () => {
    expect(typeof skill.hasScripts).toBe("boolean");
  });

  it("should have subFiles as an array", () => {
    expect(Array.isArray(skill.subFiles)).toBe(true);
  });
});
