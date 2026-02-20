// Agent frontmatter metadata
export interface AgentMeta {
  name: string;
  description: string;
  tools: string[];
  model: string;
  skills: string[];
}

export interface Agent {
  meta: AgentMeta;
  body: string;
  raw: string;
}

// Skill frontmatter metadata
export interface SkillMeta {
  name: string;
  description: string;
  allowedTools?: string[];
  version?: string;
  priority?: string;
}

export interface SubFile {
  filename: string;
  content: string;
}

export interface Skill {
  meta: SkillMeta;
  body: string;
  subFiles: SubFile[];
  hasScripts: boolean;
  raw: string;
}

// Workflow frontmatter metadata
export interface WorkflowMeta {
  description: string;
}

export interface Workflow {
  meta: WorkflowMeta;
  body: string;
  raw: string;
}

// Tool response types
export interface AgentSummary {
  name: string;
  description: string;
  skills: string[];
}

export interface SkillSummary {
  name: string;
  description: string;
}

export interface WorkflowSummary {
  name: string;
  description: string;
}

export interface RouteResult {
  agents: AgentSummary[];
  skills: SkillSummary[];
  reasoning: string;
}

export interface SearchResult {
  type: "agent" | "skill" | "workflow";
  name: string;
  matches: string[];
}

// Content cache (loaded once at startup)
export interface ContentCache {
  agents: Map<string, Agent>;
  skills: Map<string, Skill>;
  workflows: Map<string, Workflow>;
  architecture: string;
  instructions: string;
}

// Content loader abstraction (ADR-003)
export interface ContentLoader {
  loadAgents(): Promise<Map<string, Agent>>;
  loadSkills(): Promise<Map<string, Skill>>;
  loadWorkflows(): Promise<Map<string, Workflow>>;
  loadFile(path: string): Promise<string>;
}
