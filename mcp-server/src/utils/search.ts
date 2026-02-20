import type { ContentCache, SearchResult } from "../types.js";

type Scope = "all" | "agents" | "skills" | "workflows";

export function searchContent(
  query: string,
  scope: Scope,
  maxResults: number,
  cache: ContentCache,
): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  if (scope === "all" || scope === "agents") {
    for (const [name, agent] of cache.agents) {
      const matches = findMatches(agent.raw, lowerQuery);
      if (matches.length > 0) {
        results.push({ type: "agent", name, matches });
      }
    }
  }

  if (scope === "all" || scope === "skills") {
    for (const [name, skill] of cache.skills) {
      const matches = findMatches(skill.raw, lowerQuery);
      if (matches.length > 0) {
        results.push({ type: "skill", name, matches });
      }
    }
  }

  if (scope === "all" || scope === "workflows") {
    for (const [name, workflow] of cache.workflows) {
      const matches = findMatches(workflow.raw, lowerQuery);
      if (matches.length > 0) {
        results.push({ type: "workflow", name, matches });
      }
    }
  }

  return results.slice(0, maxResults);
}

function findMatches(content: string, lowerQuery: string, maxPerItem = 3): string[] {
  const lines = content.split("\n");
  const matches: string[] = [];

  for (const line of lines) {
    if (line.toLowerCase().includes(lowerQuery)) {
      matches.push(line.trim());
      if (matches.length >= maxPerItem) break;
    }
  }
  return matches;
}
