#!/usr/bin/env python3
"""
Squad Manager - Inove AI Framework
===================================
Manages squads: reusable packages of agents + skills + workflows.

Usage:
    python .agents/scripts/squad_manager.py create <name> [--template basic|specialist]
    python .agents/scripts/squad_manager.py list
    python .agents/scripts/squad_manager.py validate <name>
    python .agents/scripts/squad_manager.py activate <name>
    python .agents/scripts/squad_manager.py deactivate <name>
    python .agents/scripts/squad_manager.py info <name>
    python .agents/scripts/squad_manager.py export <name>
"""

import sys
import os
import shutil
import argparse
import tarfile
from pathlib import Path

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False


# Paths
FRAMEWORK_ROOT = Path(__file__).resolve().parent.parent.parent
SQUADS_DIR = FRAMEWORK_ROOT / "squads"
TEMPLATES_DIR = SQUADS_DIR / ".templates"
AGENTS_DIR = FRAMEWORK_ROOT / ".agents"


def _parse_yaml(filepath: Path) -> dict:
    """Parse a YAML file. Falls back to basic parsing if PyYAML not installed."""
    text = filepath.read_text(encoding="utf-8")
    if HAS_YAML:
        return yaml.safe_load(text) or {}
    # Minimal YAML parser for squad.yaml (flat keys + simple lists)
    result = {}
    current_key = None
    current_list = None
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("- "):
            if current_list is not None:
                current_list.append(stripped[2:].strip().strip('"').strip("'"))
            continue
        if ":" in stripped:
            key, _, val = stripped.partition(":")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if val:
                # Navigate nested keys
                indent = len(line) - len(line.lstrip())
                if indent == 0:
                    result[key] = val
                    current_key = key
                    current_list = None
                else:
                    if current_key and isinstance(result.get(current_key), dict):
                        result[current_key][key] = val
                    else:
                        result[key] = val
                    current_list = None
            else:
                indent = len(line) - len(line.lstrip())
                if indent == 0:
                    result[key] = {}
                    current_key = key
                    current_list = None
                else:
                    # This is a nested key that might contain a list
                    if current_key and isinstance(result.get(current_key), dict):
                        result[current_key][key] = []
                        current_list = result[current_key][key]
                    else:
                        result[key] = []
                        current_list = result[key]
    return result


def _get_squad_dir(name: str) -> Path:
    return SQUADS_DIR / name


def _get_manifest(name: str) -> dict:
    squad_dir = _get_squad_dir(name)
    manifest_path = squad_dir / "squad.yaml"
    if not manifest_path.exists():
        print(f"Error: squad.yaml not found in {squad_dir}")
        sys.exit(1)
    return _parse_yaml(manifest_path)


def _get_components(manifest: dict) -> dict:
    """Extract components from manifest."""
    components = manifest.get("components", {})
    if not isinstance(components, dict):
        components = {}
    return {
        "agents": components.get("agents", []) or [],
        "skills": components.get("skills", []) or [],
        "workflows": components.get("workflows", []) or [],
        "scripts": components.get("scripts", []) or [],
    }


def cmd_create(name: str, template: str = "basic"):
    """Create a new squad from template."""
    squad_dir = _get_squad_dir(name)
    if squad_dir.exists():
        print(f"Error: Squad '{name}' already exists at {squad_dir}")
        sys.exit(1)

    template_dir = TEMPLATES_DIR / template
    if not template_dir.exists():
        print(f"Error: Template '{template}' not found at {template_dir}")
        sys.exit(1)

    # Copy template
    shutil.copytree(template_dir, squad_dir)

    # Update squad.yaml with the actual name
    manifest_path = squad_dir / "squad.yaml"
    content = manifest_path.read_text(encoding="utf-8")
    content = content.replace("name: my-squad", f"name: {name}")
    manifest_path.write_text(content, encoding="utf-8")

    print(f"Squad '{name}' created at {squad_dir}")
    print(f"Template: {template}")
    print(f"\nNext steps:")
    print(f"  1. Edit squads/{name}/squad.yaml")
    print(f"  2. Add agents, skills, workflows")
    print(f"  3. Run: python .agents/scripts/squad_manager.py validate {name}")
    print(f"  4. Run: python .agents/scripts/squad_manager.py activate {name}")


def cmd_list():
    """List all squads with status."""
    if not SQUADS_DIR.exists():
        print("No squads directory found.")
        return

    squads = [
        d for d in SQUADS_DIR.iterdir()
        if d.is_dir() and not d.name.startswith(".")
    ]

    if not squads:
        print("No squads found.")
        print(f"\nCreate one with: python .agents/scripts/squad_manager.py create <name>")
        return

    print(f"{'Name':<25} {'Version':<10} {'Components':<20} {'Status':<10}")
    print("-" * 65)

    for squad_dir in sorted(squads):
        manifest_path = squad_dir / "squad.yaml"
        if not manifest_path.exists():
            print(f"{squad_dir.name:<25} {'?':<10} {'No manifest':<20} {'invalid':<10}")
            continue

        manifest = _parse_yaml(manifest_path)
        components = _get_components(manifest)
        n_agents = len(components["agents"])
        n_skills = len(components["skills"])
        n_workflows = len(components["workflows"])
        comp_str = f"{n_agents}A {n_skills}S {n_workflows}W"

        # Check if active (any symlinks pointing to this squad)
        is_active = False
        for agent_name in components["agents"]:
            link_path = AGENTS_DIR / "agents" / f"{agent_name}.md"
            if link_path.is_symlink():
                target = link_path.resolve()
                if str(squad_dir) in str(target):
                    is_active = True
                    break

        status = "active" if is_active else "inactive"
        version = manifest.get("version", "?")
        print(f"{squad_dir.name:<25} {version:<10} {comp_str:<20} {status:<10}")


def cmd_validate(name: str):
    """Validate squad integrity."""
    squad_dir = _get_squad_dir(name)
    if not squad_dir.exists():
        print(f"Error: Squad '{name}' not found at {squad_dir}")
        sys.exit(1)

    manifest = _get_manifest(name)
    components = _get_components(manifest)
    errors = []
    warnings = []

    # Check manifest required fields
    for field in ["name", "version", "description"]:
        if not manifest.get(field):
            errors.append(f"Missing required field '{field}' in squad.yaml")

    # Validate agents
    for agent_name in components["agents"]:
        agent_file = squad_dir / "agents" / f"{agent_name}.md"
        if not agent_file.exists():
            errors.append(f"Agent '{agent_name}' declared but file not found: {agent_file}")
        else:
            content = agent_file.read_text(encoding="utf-8")
            if not content.startswith("---"):
                warnings.append(f"Agent '{agent_name}' missing frontmatter")

    # Validate skills
    for skill_name in components["skills"]:
        skill_dir = squad_dir / "skills" / skill_name
        skill_file = skill_dir / "SKILL.md"
        if not skill_dir.exists():
            errors.append(f"Skill '{skill_name}' declared but directory not found: {skill_dir}")
        elif not skill_file.exists():
            errors.append(f"Skill '{skill_name}' missing SKILL.md: {skill_file}")

    # Validate workflows
    for wf_name in components["workflows"]:
        wf_file = squad_dir / "workflows" / f"{wf_name}.md"
        if not wf_file.exists():
            errors.append(f"Workflow '{wf_name}' declared but file not found: {wf_file}")

    # Check dependencies
    deps = manifest.get("dependencies", {})
    core_skills = deps.get("core_skills", []) if isinstance(deps, dict) else []
    if isinstance(core_skills, list):
        for skill in core_skills:
            core_skill_dir = AGENTS_DIR / "skills" / skill
            if not core_skill_dir.exists():
                warnings.append(f"Core skill dependency '{skill}' not found in framework")

    # Report
    print(f"Validating squad '{name}'...")
    print()

    if errors:
        print(f"ERRORS ({len(errors)}):")
        for e in errors:
            print(f"  [ERROR] {e}")
    if warnings:
        print(f"\nWARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"  [WARN] {w}")

    if not errors and not warnings:
        print("VALID: All checks passed.")
    elif not errors:
        print(f"\nVALID with {len(warnings)} warning(s).")
    else:
        print(f"\nINVALID: {len(errors)} error(s) found.")
        sys.exit(1)


def cmd_activate(name: str):
    """Activate squad by creating symlinks into .agents/."""
    squad_dir = _get_squad_dir(name)
    if not squad_dir.exists():
        print(f"Error: Squad '{name}' not found at {squad_dir}")
        sys.exit(1)

    manifest = _get_manifest(name)
    components = _get_components(manifest)
    created = []

    # Create agent symlinks
    for agent_name in components["agents"]:
        src = squad_dir / "agents" / f"{agent_name}.md"
        dst = AGENTS_DIR / "agents" / f"{agent_name}.md"
        if dst.exists() and not dst.is_symlink():
            print(f"  SKIP: {dst} already exists as a regular file (core agent?)")
            continue
        if dst.is_symlink():
            dst.unlink()
        if src.exists():
            rel_src = os.path.relpath(src, dst.parent)
            os.symlink(rel_src, dst)
            created.append(f"agents/{agent_name}.md")

    # Create skill symlinks
    for skill_name in components["skills"]:
        src = squad_dir / "skills" / skill_name
        dst = AGENTS_DIR / "skills" / skill_name
        if dst.exists() and not dst.is_symlink():
            print(f"  SKIP: {dst} already exists as a regular directory (core skill?)")
            continue
        if dst.is_symlink():
            dst.unlink()
        if src.exists():
            rel_src = os.path.relpath(src, dst.parent)
            os.symlink(rel_src, dst)
            created.append(f"skills/{skill_name}/")

    # Create workflow symlinks
    for wf_name in components["workflows"]:
        src = squad_dir / "workflows" / f"{wf_name}.md"
        dst = AGENTS_DIR / "workflows" / f"{wf_name}.md"
        if dst.exists() and not dst.is_symlink():
            print(f"  SKIP: {dst} already exists as a regular file (core workflow?)")
            continue
        if dst.is_symlink():
            dst.unlink()
        if src.exists():
            rel_src = os.path.relpath(src, dst.parent)
            os.symlink(rel_src, dst)
            created.append(f"workflows/{wf_name}.md")

    if created:
        print(f"Squad '{name}' activated. Symlinks created:")
        for c in created:
            print(f"  .agents/{c}")
    else:
        print(f"Squad '{name}': no symlinks created (components may already exist as core).")


def cmd_deactivate(name: str):
    """Deactivate squad by removing symlinks."""
    squad_dir = _get_squad_dir(name)
    if not squad_dir.exists():
        print(f"Error: Squad '{name}' not found at {squad_dir}")
        sys.exit(1)

    manifest = _get_manifest(name)
    components = _get_components(manifest)
    removed = []

    # Remove agent symlinks
    for agent_name in components["agents"]:
        dst = AGENTS_DIR / "agents" / f"{agent_name}.md"
        if dst.is_symlink():
            target = dst.resolve()
            if str(squad_dir) in str(target):
                dst.unlink()
                removed.append(f"agents/{agent_name}.md")

    # Remove skill symlinks
    for skill_name in components["skills"]:
        dst = AGENTS_DIR / "skills" / skill_name
        if dst.is_symlink():
            target = dst.resolve()
            if str(squad_dir) in str(target):
                dst.unlink()
                removed.append(f"skills/{skill_name}/")

    # Remove workflow symlinks
    for wf_name in components["workflows"]:
        dst = AGENTS_DIR / "workflows" / f"{wf_name}.md"
        if dst.is_symlink():
            target = dst.resolve()
            if str(squad_dir) in str(target):
                dst.unlink()
                removed.append(f"workflows/{wf_name}.md")

    if removed:
        print(f"Squad '{name}' deactivated. Symlinks removed:")
        for r in removed:
            print(f"  .agents/{r}")
    else:
        print(f"Squad '{name}': no active symlinks found.")


def cmd_info(name: str):
    """Show squad details."""
    squad_dir = _get_squad_dir(name)
    if not squad_dir.exists():
        print(f"Error: Squad '{name}' not found at {squad_dir}")
        sys.exit(1)

    manifest = _get_manifest(name)
    components = _get_components(manifest)

    print(f"Squad: {manifest.get('name', name)}")
    print(f"Version: {manifest.get('version', '?')}")
    print(f"Description: {manifest.get('description', '?')}")
    print(f"Author: {manifest.get('author', '?')}")
    print(f"Path: {squad_dir}")
    print()
    print(f"Components:")
    print(f"  Agents ({len(components['agents'])}):")
    for a in components["agents"]:
        exists = (squad_dir / "agents" / f"{a}.md").exists()
        print(f"    {'[OK]' if exists else '[!!]'} {a}")
    print(f"  Skills ({len(components['skills'])}):")
    for s in components["skills"]:
        exists = (squad_dir / "skills" / s / "SKILL.md").exists()
        print(f"    {'[OK]' if exists else '[!!]'} {s}")
    print(f"  Workflows ({len(components['workflows'])}):")
    for w in components["workflows"]:
        exists = (squad_dir / "workflows" / f"{w}.md").exists()
        print(f"    {'[OK]' if exists else '[!!]'} {w}")

    # Check activation status
    is_active = False
    for agent_name in components["agents"]:
        link_path = AGENTS_DIR / "agents" / f"{agent_name}.md"
        if link_path.is_symlink():
            target = link_path.resolve()
            if str(squad_dir) in str(target):
                is_active = True
                break
    print(f"\nStatus: {'ACTIVE' if is_active else 'INACTIVE'}")

    # Show dependencies
    deps = manifest.get("dependencies", {})
    if isinstance(deps, dict):
        core_skills = deps.get("core_skills", [])
        if core_skills:
            print(f"\nCore Dependencies: {', '.join(core_skills)}")

    # Show platform support
    platforms = manifest.get("platforms", {})
    if isinstance(platforms, dict):
        supported = [p for p, v in platforms.items() if v]
        if supported:
            print(f"Platforms: {', '.join(supported)}")


def cmd_export(name: str):
    """Export squad as .tar.gz."""
    squad_dir = _get_squad_dir(name)
    if not squad_dir.exists():
        print(f"Error: Squad '{name}' not found at {squad_dir}")
        sys.exit(1)

    output_file = SQUADS_DIR / f"{name}.tar.gz"
    with tarfile.open(output_file, "w:gz") as tar:
        tar.add(squad_dir, arcname=name)

    print(f"Squad '{name}' exported to {output_file}")
    print(f"Size: {output_file.stat().st_size / 1024:.1f} KB")


def main():
    parser = argparse.ArgumentParser(
        description="Squad Manager - Inove AI Framework",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  create <name>          Create new squad from template
  list                   List all squads
  validate <name>        Validate squad integrity
  activate <name>        Activate squad (create symlinks)
  deactivate <name>      Deactivate squad (remove symlinks)
  info <name>            Show squad details
  export <name>          Export squad as .tar.gz
        """
    )
    parser.add_argument("command", choices=[
        "create", "list", "validate", "activate", "deactivate", "info", "export"
    ])
    parser.add_argument("name", nargs="?", help="Squad name")
    parser.add_argument("--template", default="basic", choices=["basic", "specialist"],
                        help="Template to use for create (default: basic)")

    args = parser.parse_args()

    # Ensure squads directory exists
    SQUADS_DIR.mkdir(exist_ok=True)

    if args.command == "list":
        cmd_list()
    elif args.command in ("validate", "activate", "deactivate", "info", "export", "create"):
        if not args.name:
            print(f"Error: '{args.command}' requires a squad name.")
            sys.exit(1)
        if args.command == "create":
            cmd_create(args.name, args.template)
        elif args.command == "validate":
            cmd_validate(args.name)
        elif args.command == "activate":
            cmd_activate(args.name)
        elif args.command == "deactivate":
            cmd_deactivate(args.name)
        elif args.command == "info":
            cmd_info(args.name)
        elif args.command == "export":
            cmd_export(args.name)


if __name__ == "__main__":
    main()
