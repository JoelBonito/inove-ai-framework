import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { PATHS } from "../constants.js";
import type { Skill, SubFile } from "../types.js";
import { parseSkillFrontmatter } from "./frontmatter.js";

export async function loadAllSkills(): Promise<Map<string, Skill>> {
  const skills = new Map<string, Skill>();
  const entries = await readdir(PATHS.skills);

  const results = await Promise.all(
    entries.map(async (entry) => {
      const skillDir = join(PATHS.skills, entry);
      const info = await stat(skillDir);
      if (!info.isDirectory()) return null;

      const skillFile = join(skillDir, "SKILL.md");
      let skillContent: string;
      try {
        skillContent = await readFile(skillFile, "utf-8");
      } catch {
        return null; // No SKILL.md — skip
      }

      const { meta, body } = parseSkillFrontmatter(skillContent);
      const name = meta.name || entry;

      // Load sub-files (other .md files in the directory)
      const subFiles: SubFile[] = [];
      const dirFiles = await readdir(skillDir);
      for (const f of dirFiles) {
        if (f === "SKILL.md" || !f.endsWith(".md")) continue;
        const content = await readFile(join(skillDir, f), "utf-8");
        subFiles.push({ filename: f, content });
      }

      // Check for scripts/ directory
      let hasScripts = false;
      try {
        const scriptsDir = join(skillDir, "scripts");
        const scriptsInfo = await stat(scriptsDir);
        hasScripts = scriptsInfo.isDirectory();
      } catch {
        // No scripts directory
      }

      // Build concatenated raw content
      let raw = skillContent;
      for (const sub of subFiles) {
        raw += `\n\n---\n\n# ${sub.filename}\n\n${sub.content}`;
      }

      return [name, { meta: { ...meta, name }, body, subFiles, hasScripts, raw }] as const;
    }),
  );

  for (const result of results) {
    if (result) skills.set(result[0], result[1]);
  }
  return skills;
}
