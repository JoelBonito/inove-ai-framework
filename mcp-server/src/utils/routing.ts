import { ROUTING_KEYWORDS } from "../constants.js";
import type { ContentCache, RouteResult, AgentSummary, SkillSummary } from "../types.js";

export function routeTask(request: string, cache: ContentCache): RouteResult {
  const normalized = request.toLowerCase();

  const scores: { name: string; score: number }[] = [];
  for (const [agent, keywords] of Object.entries(ROUTING_KEYWORDS)) {
    const score = keywords.filter((kw) => normalized.includes(kw)).length;
    if (score > 0) scores.push({ name: agent, score });
  }

  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, 3);

  const agents: AgentSummary[] = top.map(({ name }) => {
    const agent = cache.agents.get(name);
    return {
      name,
      description: agent?.meta.description ?? "",
      skills: agent?.meta.skills ?? [],
    };
  });

  const skillNames = new Set(agents.flatMap((a) => a.skills));
  const skills: SkillSummary[] = [...skillNames]
    .map((name) => {
      const skill = cache.skills.get(name);
      return skill ? { name, description: skill.meta.description } : null;
    })
    .filter((s): s is SkillSummary => s !== null);

  const reasoning = top.length > 0
    ? `Matched ${top.map((t) => `${t.name} (score: ${t.score})`).join(", ")} based on keyword analysis of: "${request}"`
    : `No strong keyword match found for: "${request}". Consider using search_content for broader results.`;

  return { agents, skills, reasoning };
}
