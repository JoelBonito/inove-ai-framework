#!/usr/bin/env python3
"""
Validation Script - Inove AI Framework v5.0
============================================
Validates that all framework components are correctly installed.

Usage:
    python .agents/scripts/validate_installation.py
    python .agents/scripts/validate_installation.py --verbose
"""

import sys
from pathlib import Path

# Expected counts (v5.0)
EXPECTED_AGENTS = 21
EXPECTED_SKILLS = 41  # top-level skill dirs with SKILL.md
EXPECTED_WORKFLOWS = 22
EXPECTED_SCRIPTS = 22


def check_exists(path: Path, label: str = "") -> tuple[bool, str]:
    """Check if a file or directory exists."""
    name = label or path.name
    if path.exists():
        return True, f"  OK {name}"
    return False, f"  FAIL {name} - MISSING"


def count_items(directory: Path, pattern: str) -> int:
    """Count items matching pattern in directory."""
    if not directory.exists():
        return 0
    return len(list(directory.glob(pattern)))


def check_symlink(path: Path, label: str) -> tuple[bool, str]:
    """Check if a symlink exists and points to a valid target."""
    if not path.exists() and not path.is_symlink():
        return False, f"  FAIL {label} - MISSING"
    if path.is_symlink():
        target = path.resolve()
        if target.exists():
            return True, f"  OK {label} -> {target.name}/"
        return False, f"  FAIL {label} - BROKEN SYMLINK -> {path.readlink()}"
    return True, f"  OK {label} (direct)"


def validate_installation(verbose: bool = False):
    """Run full framework validation."""
    print("Inove AI Framework v5.0 - Validation")
    print("=" * 60)
    print()

    root = Path(__file__).parent.parent.parent  # project root
    agents_dir = root / ".agents"
    script_dir = agents_dir / "scripts"
    failures = []

    # --- 1. Component Counts ---
    print("[1/7] Component Counts")
    print("-" * 60)

    agent_count = count_items(agents_dir / "agents", "*.md")
    skill_count = count_items(agents_dir / "skills", "*/SKILL.md")
    workflow_count = count_items(agents_dir / "workflows", "*.md")
    script_count = count_items(script_dir, "*.py")

    checks = [
        (agent_count, EXPECTED_AGENTS, "Agents"),
        (skill_count, EXPECTED_SKILLS, "Skills (top-level)"),
        (workflow_count, EXPECTED_WORKFLOWS, "Workflows"),
        (script_count, EXPECTED_SCRIPTS, "Scripts"),
    ]

    for actual, expected, label in checks:
        if actual >= expected:
            print(f"  OK {label}: {actual}/{expected}")
        else:
            msg = f"  FAIL {label}: {actual}/{expected}"
            print(msg)
            failures.append(msg)

    print()

    # --- 2. Core Scripts ---
    print("[2/7] Core Scripts")
    print("-" * 60)

    core_scripts = [
        "auto_session.py", "finish_task.py", "lock_manager.py",
        "progress_tracker.py", "dashboard.py", "checklist.py",
        "platform_compat.py", "session_logger.py", "metrics.py",
        "auto_preview.py", "auto_finish.py", "sync_tracker.py",
        "reminder_system.py", "notifier.py", "project_analyzer.py",
        "generate_web_data.py", "verify_all.py", "validate_traceability.py",
        "validate_installation.py", "_check_runner.py",
        # v5.0 additions
        "squad_manager.py", "recovery.py",
    ]

    for name in core_scripts:
        ok, msg = check_exists(script_dir / name)
        if verbose or not ok:
            print(msg)
        if not ok:
            failures.append(msg)

    if not verbose:
        ok_count = sum(1 for n in core_scripts if (script_dir / n).exists())
        print(f"  {ok_count}/{len(core_scripts)} scripts present")

    print()

    # --- 3. Instruction Files ---
    print("[3/7] Instruction Files")
    print("-" * 60)

    instruction_files = [
        (root / "CLAUDE.md", "CLAUDE.md (Claude Code)"),
        (root / "AGENTS.md", "AGENTS.md (Codex CLI)"),
        (root / "GEMINI.md", "GEMINI.md (Antigravity)"),
        (agents_dir / "INSTRUCTIONS.md", ".agents/INSTRUCTIONS.md (canonical)"),
        (agents_dir / "ARCHITECTURE.md", ".agents/ARCHITECTURE.md"),
        (root / ".claude" / "project_instructions.md", ".claude/project_instructions.md"),
    ]

    for path, label in instruction_files:
        ok, msg = check_exists(path, label)
        print(msg)
        if not ok:
            failures.append(msg)

    print()

    # --- 4. Symlinks ---
    print("[4/7] Platform Symlinks")
    print("-" * 60)

    symlinks = [
        (root / ".claude" / "agents", ".claude/agents/"),
        (root / ".claude" / "skills", ".claude/skills/"),
    ]

    # Codex symlinks (optional — only if .codex/ exists)
    codex_dir = root / ".codex"
    if codex_dir.exists():
        symlinks.extend([
            (codex_dir / "agents", ".codex/agents/"),
            (codex_dir / "skills", ".codex/skills/"),
            (codex_dir / "prompts", ".codex/prompts/"),
        ])

    for path, label in symlinks:
        ok, msg = check_symlink(path, label)
        print(msg)
        if not ok:
            failures.append(msg)

    print()

    # --- 5. Squad System ---
    print("[5/7] Squad System")
    print("-" * 60)

    squad_items = [
        (root / "squads", "squads/"),
        (root / "squads" / "README.md", "squads/README.md"),
        (root / "squads" / ".templates" / "basic" / "squad.yaml", "templates/basic/squad.yaml"),
        (root / "squads" / ".templates" / "specialist" / "squad.yaml", "templates/specialist/squad.yaml"),
        (agents_dir / "workflows" / "squad.md", "workflows/squad.md"),
    ]

    for path, label in squad_items:
        ok, msg = check_exists(path, label)
        print(msg)
        if not ok:
            failures.append(msg)

    # Count active squads
    squads_dir = root / "squads"
    active_squads = [
        d for d in squads_dir.iterdir()
        if d.is_dir() and not d.name.startswith(".") and (d / "squad.yaml").exists()
    ] if squads_dir.exists() else []
    print(f"  Active squads: {len(active_squads)}")

    print()

    # --- 6. Gemini Config ---
    print("[6/7] Gemini CLI Config")
    print("-" * 60)

    gemini_items = [
        (root / ".gemini" / "settings.json", ".gemini/settings.json"),
        (root / ".gemini" / "mcp.json", ".gemini/mcp.json"),
    ]

    for path, label in gemini_items:
        ok, msg = check_exists(path, label)
        print(msg)
        if not ok:
            failures.append(msg)

    # Validate JSON
    import json
    for path, label in gemini_items:
        if path.exists():
            try:
                json.loads(path.read_text())
            except json.JSONDecodeError as e:
                msg = f"  FAIL {label} - INVALID JSON: {e}"
                print(msg)
                failures.append(msg)

    print()

    # --- 7. Recovery System ---
    print("[7/7] Recovery System")
    print("-" * 60)

    ok, msg = check_exists(script_dir / "recovery.py", "recovery.py")
    print(msg)
    if not ok:
        failures.append(msg)

    # Verify recovery imports work
    try:
        sys.path.insert(0, str(script_dir))
        from recovery import with_retry, safe_execute, git_checkpoint, git_rollback  # noqa: F401
        print("  OK recovery imports (with_retry, safe_execute, git_checkpoint, git_rollback)")
    except ImportError as e:
        msg = f"  FAIL recovery import: {e}"
        print(msg)
        failures.append(msg)
    finally:
        if str(script_dir) in sys.path:
            sys.path.remove(str(script_dir))

    print()

    # --- Summary ---
    print("=" * 60)
    if not failures:
        print(f"PASSED - All components validated")
        print(f"  {EXPECTED_AGENTS} agents | {EXPECTED_SKILLS} skills | {EXPECTED_WORKFLOWS} workflows | {EXPECTED_SCRIPTS} scripts")
        print()
        return True
    else:
        print(f"FAILED - {len(failures)} issue(s) found:")
        for f in failures:
            print(f)
        print()
        return False


def main():
    verbose = "--verbose" in sys.argv
    success = validate_installation(verbose)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
