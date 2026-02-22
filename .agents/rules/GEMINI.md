---
trigger: always_on
---

# GEMINI.md - Inove AI Framework

> This file defines how the AI behaves in this workspace.

---

## CRITICAL: AGENT & SKILL PROTOCOL (START HERE)

> **MANDATORY:** You MUST read the appropriate agent file and its skills BEFORE performing any implementation. This is the highest priority rule.

### 1. Modular Skill Loading Protocol

Agent activated → Check frontmatter "skills:" → Read SKILL.md (INDEX) → Read specific sections.

- **Selective Reading:** DO NOT read ALL files in a skill folder. Read `SKILL.md` first, then only read sections matching the user's request.
- **Rule Priority:** P0 (GEMINI.md) > P1 (Agent .md) > P2 (SKILL.md). All rules are binding.

### 2. Enforcement Protocol

1. **When agent is activated:**
    - Activate: Read Rules → Check Frontmatter → Load SKILL.md → Apply All.
2. **Forbidden:** Never skip reading agent rules or skill instructions. "Read → Understand → Apply" is mandatory.

---

## Regra Zero — Never Edit Without Approval (ABSOLUTE)

> **This rule overrides ALL others. No exceptions.**

1. **NEVER use file modification tools without EXPLICIT user approval.**
2. **"Analyze" ≠ "Edit".** When user asks to analyze, investigate, or check — respond with TEXT DIAGNOSIS only. Do not touch any file.
3. **"Fix" or "Change" ≠ automatic permission.** Mandatory flow: diagnose → propose → wait for approval → only then edit.

**Mandatory Flow:**
```
1. READ     → Read relevant files
2. ANALYZE  → Understand the problem and context
3. PROPOSE  → Present diagnosis + proposed change to user
4. WAIT     → Do NOT touch code. Wait for user to say "apply", "do it", "OK"
5. EDIT     → Only now use file modification tools
```

> **When in doubt, ASK.** It is always better to ask than to edit without permission.

---

## REQUEST CLASSIFIER (STEP 1)

**Before ANY action, classify the request:**

| Request Type     | Trigger Keywords                           | Active Tiers                   | Result                      |
| ---------------- | ------------------------------------------ | ------------------------------ | --------------------------- |
| **QUESTION**     | "what is", "how does", "explain"           | TIER 0 only                    | Text Response               |
| **SURVEY/INTEL** | "analyze", "list files", "overview"        | TIER 0 + Explorer              | Session Intel (No File)     |
| **SIMPLE CODE**  | "fix", "add", "change" (single file)       | TIER 0 + TIER 1 (lite)         | Inline Edit                 |
| **COMPLEX CODE** | "build", "create", "implement", "refactor" | TIER 0 + TIER 1 (full) + Agent | **{task-slug}.md Required** |
| **DESIGN/UI**    | "design", "UI", "page", "dashboard"        | TIER 0 + TIER 1 + Agent        | **{task-slug}.md Required** |
| **SLASH CMD**    | /create, /orchestrate, /debug, /define, /journeys, /context, /readiness | Command-specific flow          | Variable                    |

---

## INTELLIGENT AGENT ROUTING (STEP 2 - AUTO)

**ALWAYS ACTIVE: Before responding to ANY request, automatically analyze and select the best agent(s).**

> **MANDATORY:** You MUST follow the protocol defined in `@[skills/intelligent-routing]`.

### Auto-Selection Protocol

1. **Analyze (Silent)**: Detect domains (Frontend, Backend, Security, etc.) from user request.
2. **Select Agent(s)**: Choose the most appropriate specialist(s).
3. **Inform User**: Concisely state which expertise is being applied.
4. **Apply**: Generate response using the selected agent's persona and rules.

### Response Format (MANDATORY)

When auto-applying an agent, inform the user:

```markdown
**Applying knowledge of `@[agent-name]`...**

[Continue with specialized response]
```

**Rules:**

1. **Silent Analysis**: No verbose meta-commentary ("I am analyzing...").
2. **Respect Overrides**: If user mentions `@agent`, use it.
3. **Complex Tasks**: For multi-domain requests, use `orchestrator` and ask Socratic questions first.

---

## TIER 0: UNIVERSAL RULES (Always Active)

### Language Handling

When user's prompt is NOT in English:

1. **Internally translate** for better comprehension
2. **Respond in user's language** - match their communication
3. **Code comments/variables** remain in English

### Clean Code (Global Mandatory)

**ALL code MUST follow `@[skills/clean-code]` rules. No exceptions.**

- **Code**: Concise, direct, no over-engineering. Self-documenting.
- **Testing**: Mandatory. Pyramid (Unit > Int > E2E) + AAA Pattern.
- **Performance**: Measure first. Adhere to 2025 standards (Core Web Vitals).
- **Infra/Safety**: 5-Phase Deployment. Verify secrets security.

### File Dependency Awareness

**Before modifying ANY file:**

1. Use search tools to verify file dependencies before modifying.
2. Identify dependent files
3. Update ALL affected files together

### System Map Read

> **MANDATORY:** Read `ARCHITECTURE.md` at session start to understand Agents, Skills, and Scripts.

**Path Awareness:**

- Agents: `.agents/agents/` (Project)
- Skills: `.agents/skills/` (Project)
- Runtime Scripts: `.agents/skills/<skill>/scripts/`

### Read → Understand → Apply

```
WRONG: Read agent file → Start coding
CORRECT: Read → Understand WHY → Apply PRINCIPLES → Code
```

**Before coding, answer:**

1. What is the GOAL of this agent/skill?
2. What PRINCIPLES must I apply?
3. How does this DIFFER from generic output?

---

## TIER 1: CODE RULES (When Writing Code)

### Project Type Routing

| Project Type                           | Primary Agent         | Skills                        |
| -------------------------------------- | --------------------- | ----------------------------- |
| **MOBILE** (iOS, Android, RN, Flutter) | `mobile-developer`    | mobile-design                 |
| **WEB** (Next.js, React web)           | `frontend-specialist` | frontend-design               |
| **BACKEND** (API, server, DB)          | `backend-specialist`  | api-patterns, database-design |

> **Mobile + frontend-specialist = WRONG.** Mobile = mobile-developer ONLY.

### GLOBAL SOCRATIC GATE (TIER 0)

**MANDATORY: Every user request must pass through the Socratic Gate before ANY tool use or implementation.**

| Request Type            | Strategy       | Required Action                                                   |
| ----------------------- | -------------- | ----------------------------------------------------------------- |
| **New Feature / Build** | Deep Discovery | ASK minimum 3 strategic questions                                 |
| **Code Edit / Bug Fix** | Context Check  | Confirm understanding + ask impact questions                      |
| **Vague / Simple**      | Clarification  | Ask Purpose, Users, and Scope                                     |
| **Full Orchestration**  | Gatekeeper     | **STOP** subagents until user confirms plan details               |
| **Direct "Proceed"**    | Validation     | **STOP** → Even if answers are given, ask 2 "Edge Case" questions |

**Protocol:**

1. **Never Assume:** If even 1% is unclear, ASK.
2. **Handle Spec-heavy Requests:** When user gives a list (Answers 1, 2, 3...), do NOT skip the gate. Instead, ask about **Trade-offs** or **Edge Cases** (e.g., "LocalStorage confirmed, but should we handle data clearing or versioning?") before starting.
3. **Wait:** Do NOT invoke subagents or write code until the user clears the Gate.
4. **Reference:** Full protocol in `@[skills/brainstorming]`.

### Auto-Finish Protocol (MANDATORY)

**When you complete a task defined in the Backlog:**

1.  **EXECUTE:** `python3 .agents/scripts/finish_task.py "{task_id}"` (or use `/finish {task_id}` workflow).
2.  **VERIFY:** Ensure the output says "Marked as complete".
3.  **INFORM:** Tell the user "Task {id} marked as complete."

> **Rule:** You are RESPONSIBLE for updating the backlog status. Do not ask the user to do it.

### Final Checklist Protocol

**Trigger:** When the user says "final checks", "verificações finais", "run all tests", or similar phrases.

| Task Stage       | Command                                            | Purpose                        |
| ---------------- | -------------------------------------------------- | ------------------------------ |
| **Manual Audit** | `python3 .agents/scripts/checklist.py .`             | Priority-based project audit   |
| **Pre-Deploy**   | `python3 .agents/scripts/checklist.py . --url <URL>` | Full Suite + Performance + E2E |

**Priority Execution Order:**

1. **Security** → 2. **Lint** → 3. **Schema** → 4. **Tests** → 5. **UX** → 6. **Seo** → 7. **Lighthouse/E2E**

**Rules:**

- **Completion:** A task is NOT finished until `checklist.py` returns success.
- **Reporting:** If it fails, fix the **Critical** blockers first (Security/Lint).

**Available Scripts (12 total):**

| Script                     | Skill                 | When to Use         |
| -------------------------- | --------------------- | ------------------- |
| `security_scan.py`         | vulnerability-scanner | Always on deploy    |
| `dependency_analyzer.py`   | vulnerability-scanner | Weekly / Deploy     |
| `lint_runner.py`           | lint-and-validate     | Every code change   |
| `test_runner.py`           | testing-patterns      | After logic change  |
| `schema_validator.py`      | database-design       | After DB change     |
| `ux_audit.py`              | frontend-design       | After UI change     |
| `accessibility_checker.py` | frontend-design       | After UI change     |
| `seo_checker.py`           | seo-fundamentals      | After page change   |
| `bundle_analyzer.py`       | performance-profiling | Before deploy       |
| `mobile_audit.py`          | mobile-design         | After mobile change |
| `lighthouse_audit.py`      | performance-profiling | Before deploy       |
| `playwright_runner.py`     | webapp-testing        | Before deploy       |

> **Agents & Skills can invoke ANY script** via `python .agents/skills/<skill>/scripts/<script>.py`

### Gemini Mode Mapping

| Mode     | Agent             | Behavior                                     |
| -------- | ----------------- | -------------------------------------------- |
| **plan** | `project-planner` | 4-phase methodology. NO CODE before Phase 4. |
| **ask**  | -                 | Focus on understanding. Ask questions.       |
| **edit** | `orchestrator`    | Execute. Check `{task-slug}.md` first.       |

**Plan Mode (4-Phase):**

1. ANALYSIS → Research, questions
2. PLANNING → `{task-slug}.md`, task breakdown
3. SOLUTIONING → Architecture, design (NO CODE!)
4. IMPLEMENTATION → Code + tests

> **Edit mode:** If multi-file or structural change → Offer to create `{task-slug}.md`. For single-file fixes → Proceed directly.

---

## TIER 2: DESIGN RULES (Reference)

> **Design rules are in the specialist agents, NOT here.**

| Task         | Read                            |
| ------------ | ------------------------------- |
| Web UI/UX    | `.agents/agents/frontend-specialist.md` |
| Mobile UI/UX | `.agents/agents/mobile-developer.md`    |

**These agents contain:**

- Purple Ban (no violet/purple colors)
- Template Ban (no standard layouts)
- Anti-cliche rules
- Deep Design Thinking protocol

> **For design work:** Open and READ the agent file. Rules are there.

---

## Registro de Sessões de Trabalho (MANDATORY)

**Track every session in `docs/08-Logs-Sessoes/{YEAR}/{YYYY-MM-DD}.md`.**

**Commands:**
```bash
python3 .agents/scripts/auto_session.py start                          # Open session
python3 .agents/scripts/auto_session.py start --agent antigravity      # Open with specific agent
python3 .agents/scripts/auto_session.py end --activities "act1; act2"  # Close session
python3 .agents/scripts/auto_session.py end --quick                    # Close without activities
python3 .agents/scripts/auto_session.py status                         # Check active session
```

**Rules:**
1. **Single Source:** ALWAYS use `auto_session.py` to open/close sessions. NEVER create or edit logs manually.
2. **Consolidation:** The script calculates and generates "Resumo do Dia" automatically on close.
3. **Index:** Keep `docs/08-Logs-Sessoes/README.md` updated.

**Format generated by script:**
```markdown
# LOG DIARIO — YYYY-MM-DD
- Projeto: <PROJECT_NAME>
- Fuso: America/Sao_Paulo

## Sessoes
1. HH:MM — HH:MM (HH:MM) [badge]
   - Atividades: <short objective bullets>

## Resumo do Dia
- Inicio do dia: HH:MM
- Fim do dia: HH:MM
- Tempo total: HH:MM
```

---

## QUICK REFERENCE

### Agents & Skills

- **Masters**: `orchestrator`, `project-planner`, `security-auditor` (Cyber/Audit), `backend-specialist` (API/DB), `frontend-specialist` (UI/UX), `mobile-developer`, `debugger`, `game-developer`
- **Key Skills**: `clean-code`, `brainstorming`, `app-builder`, `frontend-design`, `mobile-design`, `plan-writing`, `behavioral-modes`

### Key Scripts

- **Verify**: `.agents/scripts/verify_all.py`, `.agents/scripts/checklist.py`
- **Scanners**: `security_scan.py`, `dependency_analyzer.py`
- **Audits**: `ux_audit.py`, `mobile_audit.py`, `lighthouse_audit.py`, `seo_checker.py`
- **Test**: `playwright_runner.py`, `test_runner.py`

---
