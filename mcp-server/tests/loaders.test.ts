import { describe, it, expect, beforeAll } from "vitest";
import {
  parseFrontmatter,
  parseAgentFrontmatter,
  parseSkillFrontmatter,
  parseWorkflowFrontmatter,
} from "../src/loaders/frontmatter.js";
import { loadAllAgents } from "../src/loaders/agents.js";
import { loadAllSkills } from "../src/loaders/skills.js";
import { loadAllWorkflows } from "../src/loaders/workflows.js";

// ---------------------------------------------------------------------------
// parseFrontmatter
// ---------------------------------------------------------------------------
describe("parseFrontmatter", () => {
  it("should separate YAML meta from body", () => {
    const content = [
      "---",
      "name: test-agent",
      "description: A test agent",
      "---",
      "",
      "# Body Content",
      "Some text here.",
    ].join("\n");

    const { meta, body } = parseFrontmatter<Record<string, string>>(content);

    expect(meta.name).toBe("test-agent");
    expect(meta.description).toBe("A test agent");
    expect(body).toContain("# Body Content");
    expect(body).toContain("Some text here.");
  });

  it("should return empty meta and full content when frontmatter is missing", () => {
    const content = "# No Frontmatter\n\nJust a markdown file.";

    const { meta, body } = parseFrontmatter<Record<string, string>>(content);

    expect(meta).toEqual({});
    expect(body).toBe(content);
  });

  it("should handle malformed YAML by falling back to key-value parsing", () => {
    // Use a YAML value that will cause the parser to throw (e.g. unquoted colon in value)
    const content = [
      "---",
      "name: test",
      "description: has: colons: that: break: yaml: {{{",
      "---",
      "",
      "Body text",
    ].join("\n");

    const { meta, body } = parseFrontmatter<Record<string, string>>(content);

    expect(meta.name).toBe("test");
    // The fallback parser takes everything after the first colon
    expect(meta.description).toBeDefined();
    expect(body).toBe("Body text");
  });

  it("should handle empty body after frontmatter", () => {
    const content = "---\nname: empty\n---\n";

    const { meta, body } = parseFrontmatter<Record<string, string>>(content);

    expect(meta.name).toBe("empty");
    expect(body).toBe("");
  });
});

// ---------------------------------------------------------------------------
// parseAgentFrontmatter
// ---------------------------------------------------------------------------
describe("parseAgentFrontmatter", () => {
  it("should parse tools and skills as CSV strings", () => {
    const content = [
      "---",
      "name: debugger",
      "description: Debug expert",
      "tools: Read, Grep, Glob, Bash",
      "model: inherit",
      "skills: clean-code, systematic-debugging",
      "---",
      "",
      "# Agent body",
    ].join("\n");

    const { meta, body } = parseAgentFrontmatter(content);

    expect(meta.name).toBe("debugger");
    expect(meta.description).toBe("Debug expert");
    expect(meta.tools).toEqual(["Read", "Grep", "Glob", "Bash"]);
    expect(meta.model).toBe("inherit");
    expect(meta.skills).toEqual(["clean-code", "systematic-debugging"]);
    expect(body).toContain("# Agent body");
  });

  it("should default model to 'inherit' when not specified", () => {
    const content = [
      "---",
      "name: minimal",
      "description: Minimal agent",
      "---",
      "",
      "Body",
    ].join("\n");

    const { meta } = parseAgentFrontmatter(content);

    expect(meta.model).toBe("inherit");
  });

  it("should return empty arrays for missing tools and skills", () => {
    const content = [
      "---",
      "name: barebones",
      "description: No tools or skills",
      "---",
      "",
      "Body",
    ].join("\n");

    const { meta } = parseAgentFrontmatter(content);

    expect(meta.tools).toEqual([]);
    expect(meta.skills).toEqual([]);
  });

  it("should handle YAML array format for tools", () => {
    const content = [
      "---",
      "name: array-agent",
      "description: Uses YAML array",
      "tools:",
      "  - Read",
      "  - Write",
      "skills:",
      "  - clean-code",
      "---",
      "",
      "Body",
    ].join("\n");

    const { meta } = parseAgentFrontmatter(content);

    expect(meta.tools).toEqual(["Read", "Write"]);
    expect(meta.skills).toEqual(["clean-code"]);
  });
});

// ---------------------------------------------------------------------------
// parseSkillFrontmatter
// ---------------------------------------------------------------------------
describe("parseSkillFrontmatter", () => {
  it("should handle allowed-tools key with dash", () => {
    const content = [
      "---",
      "name: clean-code",
      "description: Coding standards",
      "allowed-tools: Read, Write, Edit",
      "version: 2.0",
      "priority: CRITICAL",
      "---",
      "",
      "# Skill body",
    ].join("\n");

    const { meta, body } = parseSkillFrontmatter(content);

    expect(meta.name).toBe("clean-code");
    expect(meta.description).toBe("Coding standards");
    expect(meta.allowedTools).toEqual(["Read", "Write", "Edit"]);
    // YAML parses 2.0 as the number 2, which becomes "2" via String()
    expect(meta.version).toBe("2");
    expect(meta.priority).toBe("CRITICAL");
    expect(body).toContain("# Skill body");
  });

  it("should leave allowedTools undefined when not specified", () => {
    const content = [
      "---",
      "name: simple-skill",
      "description: No tools",
      "---",
      "",
      "Body",
    ].join("\n");

    const { meta } = parseSkillFrontmatter(content);

    expect(meta.allowedTools).toBeUndefined();
  });

  it("should leave version and priority undefined when not specified", () => {
    const content = [
      "---",
      "name: minimal-skill",
      "description: Minimal",
      "---",
      "",
      "Body",
    ].join("\n");

    const { meta } = parseSkillFrontmatter(content);

    expect(meta.version).toBeUndefined();
    expect(meta.priority).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// parseWorkflowFrontmatter
// ---------------------------------------------------------------------------
describe("parseWorkflowFrontmatter", () => {
  it("should extract description from workflow frontmatter", () => {
    const content = [
      "---",
      "description: Create new application command",
      "---",
      "",
      "# /create - Create Application",
    ].join("\n");

    const { meta, body } = parseWorkflowFrontmatter(content);

    expect(meta.description).toBe("Create new application command");
    expect(body).toContain("# /create - Create Application");
  });

  it("should default description to empty string when missing", () => {
    const content = [
      "---",
      "---",
      "",
      "# Workflow with no description",
    ].join("\n");

    const { meta } = parseWorkflowFrontmatter(content);

    expect(meta.description).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Filesystem loaders (integration with real .agents/ files)
// ---------------------------------------------------------------------------
describe("loadAllAgents", () => {
  let agents: Map<string, unknown>;

  beforeAll(async () => {
    agents = await loadAllAgents();
  });

  it("should load agents from the real .agents/agents/ directory", () => {
    expect(agents.size).toBeGreaterThanOrEqual(21);
  });

  it("should include the debugger agent with correct meta", () => {
    expect(agents.has("debugger")).toBe(true);
  });
});

describe("loadAllSkills", () => {
  let skills: Map<string, unknown>;

  beforeAll(async () => {
    skills = await loadAllSkills();
  });

  it("should load skills from the real .agents/skills/ directory", () => {
    expect(skills.size).toBeGreaterThanOrEqual(41);
  });

  it("should include the clean-code skill", () => {
    expect(skills.has("clean-code")).toBe(true);
  });
});

describe("loadAllWorkflows", () => {
  let workflows: Map<string, unknown>;

  beforeAll(async () => {
    workflows = await loadAllWorkflows();
  });

  it("should load workflows from the real .agents/workflows/ directory", () => {
    expect(workflows.size).toBeGreaterThanOrEqual(22);
  });

  it("should include the create workflow", () => {
    expect(workflows.has("create")).toBe(true);
  });
});
