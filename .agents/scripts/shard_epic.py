#!/usr/bin/env python3
"""
Shard Epic - Inove AI Framework
Splits BACKLOG.md into individual story files in docs/stories/.

Usage:
    python .agents/scripts/shard_epic.py shard      # Full sharding (default)
    python .agents/scripts/shard_epic.py sync       # Incremental sync
    python .agents/scripts/shard_epic.py status     # Shard health report
    python .agents/scripts/shard_epic.py clean      # Remove orphan shards

Options:
    --epic N          Process only Epic N
    --story N.N       Process only Story N.N
    --force           Overwrite Agent Workspace (destructive)
    --dry-run         Show what would be done without writing
    --backlog PATH    Override backlog path
    --output DIR      Override stories directory (default: docs/stories/)
"""

import re
import sys
import argparse
import hashlib
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))
from platform_compat import find_backlog, get_agent_source
from lock_manager import LockManager
from recovery import git_checkpoint, git_rollback


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def parse_backlog(content: str) -> list[dict]:
    """
    Parse BACKLOG.md into a list of epics with their stories.

    Reuses the same regex pattern as progress_tracker.py for consistency.

    Returns:
        List of dicts: [{epic_num, epic_name, owner, model, stories: [{id, title, status, description}]}]
    """
    epics = []

    epic_pattern = re.compile(
        r"^##\s+Epic\s+(\d+):\s+(.+?)\s*(?:\[OWNER:\s*(.+?)\])?\s*(?:\[MODEL:\s*(.+?)\])?\s*(?:[✅🔴⏳].*)?$",
        re.MULTILINE,
    )

    epic_matches = list(epic_pattern.finditer(content))

    for idx, match in enumerate(epic_matches):
        epic_num = int(match.group(1))
        epic_name = match.group(2).strip()
        epic_owner = match.group(3).strip() if match.group(3) else None
        epic_model = match.group(4).strip() if match.group(4) else None

        start_pos = match.end()
        end_pos = epic_matches[idx + 1].start() if idx + 1 < len(epic_matches) else len(content)
        epic_content = content[start_pos:end_pos]

        stories = _extract_stories(epic_content, epic_num)

        epics.append({
            "epic_num": epic_num,
            "epic_name": epic_name,
            "owner": epic_owner,
            "model": epic_model,
            "stories": stories,
        })

    return epics


def _extract_stories(epic_content: str, epic_num: int) -> list[dict]:
    """Extract stories from an epic's content block."""
    stories = []

    # Match: - [x] **Story N.N:** Title  OR  - [ ] **Story N.N:** Title
    story_pattern = re.compile(
        r"^-\s*\[([ xX])\]\s*\*\*Story\s+(\d+\.\d+):\*\*\s*(.+?)$",
        re.MULTILINE,
    )

    story_matches = list(story_pattern.finditer(epic_content))

    for idx, match in enumerate(story_matches):
        checked = match.group(1).lower() == "x"
        story_id = match.group(2)
        story_title = match.group(3).strip()

        # Extract description (indented lines until next story or end)
        desc_start = match.end()
        desc_end = story_matches[idx + 1].start() if idx + 1 < len(story_matches) else len(epic_content)
        description = epic_content[desc_start:desc_end].strip()

        stories.append({
            "id": story_id,
            "title": story_title,
            "status": "done" if checked else "pending",
            "description": description,
        })

    return stories


# ---------------------------------------------------------------------------
# Content Generation
# ---------------------------------------------------------------------------

def compute_spec_hash(description: str) -> str:
    """MD5 hash of normalized description for change detection."""
    normalized = re.sub(r"\s+", " ", description.strip().lower())
    return hashlib.md5(normalized.encode("utf-8")).hexdigest()[:12]


def _safe_filename(story_id: str, title: str) -> str:
    """
    Generate filename: STORY-{N-N}_{safe-title-30chars}.md

    Dots become hyphens, non-alphanum become hyphens, max 30 chars for title.
    """
    safe_id = story_id.replace(".", "-")
    safe_title = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:30]
    return f"STORY-{safe_id}_{safe_title}.md"


def generate_story_content(story: dict, epic: dict, existing_workspace: str = "") -> str:
    """Generate the markdown content for a story file."""
    status_label = "CONCLUIDO" if story["status"] == "done" else "PENDENTE"
    owner = epic.get("owner") or "unassigned"
    now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    spec_hash = compute_spec_hash(story["description"])

    workspace = existing_workspace or (
        "> AI agents: use this section for temporary notes, checklists, and discoveries.\n"
        "> This section is PRESERVED across re-sharding."
    )

    return (
        f"---\n"
        f'story: "{story["id"]}"\n'
        f'epic: {epic["epic_num"]}\n'
        f'epic_name: "{epic["epic_name"]}"\n'
        f"status: {story['status']}\n"
        f'spec_hash: "{spec_hash}"\n'
        f'generated: "{now}"\n'
        f"---\n"
        f"\n"
        f'# Story {story["id"]}: {story["title"]}\n'
        f"\n"
        f'> **Epic Mae:** Epic {epic["epic_num"]} ({epic["epic_name"]})\n'
        f"> **Status:** {status_label}\n"
        f"> **Owner:** {owner}\n"
        f"\n"
        f"## Especificacoes\n"
        f"\n"
        f'{story["description"]}\n'
        f"\n"
        f"---\n"
        f"\n"
        f"## Agent Workspace\n"
        f"\n"
        f"{workspace}\n"
    )


def extract_agent_workspace(filepath: Path) -> str:
    """
    Extract Agent Workspace section from an existing story file.

    Tolerates both '## Agent Workspace' and '## Area Pessoal do Agente' (legacy).
    """
    if not filepath.exists():
        return ""

    content = filepath.read_text(encoding="utf-8")

    # Try both headers
    for header in ("## Agent Workspace", "## Area Pessoal do Agente"):
        idx = content.find(header)
        if idx != -1:
            # Everything after the header line
            after_header = content[idx + len(header):]
            # Skip the first newline
            if after_header.startswith("\n"):
                after_header = after_header[1:]
            return after_header.strip()

    return ""


# ---------------------------------------------------------------------------
# File Discovery
# ---------------------------------------------------------------------------

def _find_existing_shard(output_dir: Path, story_id: str) -> Path | None:
    """Find an existing shard file for a given story ID, regardless of title slug."""
    safe_id = story_id.replace(".", "-")
    prefix = f"STORY-{safe_id}_"
    for f in output_dir.glob(f"{prefix}*.md"):
        return f
    return None


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def shard_command(args: argparse.Namespace) -> int:
    """Full shard: parse backlog and create/update all story files."""
    lock_mgr = LockManager()
    agent = get_agent_source()

    backlog_path = Path(args.backlog) if args.backlog else find_backlog()
    if not backlog_path or not backlog_path.exists():
        print("❌ BACKLOG.md nao encontrado.")
        print("   Execute /define primeiro para criar o backlog.")
        return 1

    output_dir = Path(args.output)

    if not lock_mgr.wait_for_lock("stories", agent, max_wait=30):
        print("⏳ Recurso 'stories' bloqueado por outro agente. Tente novamente.")
        return 1

    # Git checkpoint before writing
    checkpoint_label = "shard-epic"
    had_checkpoint = False
    if not args.dry_run:
        had_checkpoint = git_checkpoint(checkpoint_label)

    try:
        content = backlog_path.read_text(encoding="utf-8")
        epics = parse_backlog(content)

        if not epics:
            print("⚠️  Nenhum Epic encontrado no backlog.")
            return 1

        # Filter by --epic or --story
        epics = _filter_epics(epics, args)

        if not args.dry_run:
            output_dir.mkdir(parents=True, exist_ok=True)

        created = 0
        updated = 0
        skipped = 0

        for epic in epics:
            for story in epic["stories"]:
                filename = _safe_filename(story["id"], story["title"])
                target = output_dir / filename
                existing = _find_existing_shard(output_dir, story["id"])

                # Preserve Agent Workspace from existing file
                workspace = ""
                source_file = existing or target
                if source_file.exists() and not args.force:
                    workspace = extract_agent_workspace(source_file)

                new_content = generate_story_content(story, epic, workspace)

                if args.dry_run:
                    action = "CREATE" if not (existing or target.exists()) else "UPDATE"
                    print(f"  [DRY-RUN] {action}: {filename}")
                    created += 1
                    continue

                # If existing file has different name (title changed), remove old
                if existing and existing.name != filename:
                    existing.unlink()

                # Check if content actually changed (skip if identical)
                if target.exists():
                    old = target.read_text(encoding="utf-8")
                    old_hash = _extract_frontmatter_field(old, "spec_hash")
                    new_hash = compute_spec_hash(story["description"])
                    if old_hash == new_hash and not args.force:
                        skipped += 1
                        continue
                    updated += 1
                else:
                    created += 1

                target.write_text(new_content, encoding="utf-8")

        # Summary
        total = created + updated + skipped
        print(f"\n📦 Sharding {'(dry-run) ' if args.dry_run else ''}concluido!")
        print(f"   Criados:     {created}")
        print(f"   Atualizados: {updated}")
        print(f"   Inalterados: {skipped}")
        print(f"   Total:       {total}")
        print(f"   Diretorio:   {output_dir}/")
        return 0

    except Exception as e:
        print(f"❌ Erro durante sharding: {e}")
        if had_checkpoint and not args.dry_run:
            print("↩️  Rollback automatico...")
            git_rollback(checkpoint_label)
        return 1

    finally:
        lock_mgr.release_lock("stories", agent)


def sync_command(args: argparse.Namespace) -> int:
    """Incremental sync: only update stories whose spec_hash changed."""
    lock_mgr = LockManager()
    agent = get_agent_source()

    backlog_path = Path(args.backlog) if args.backlog else find_backlog()
    if not backlog_path or not backlog_path.exists():
        print("❌ BACKLOG.md nao encontrado.")
        return 1

    output_dir = Path(args.output)
    if not output_dir.exists():
        print("⚠️  docs/stories/ nao existe. Execute 'shard' primeiro.")
        return 1

    if not lock_mgr.wait_for_lock("stories", agent, max_wait=30):
        print("⏳ Recurso 'stories' bloqueado. Tente novamente.")
        return 1

    try:
        content = backlog_path.read_text(encoding="utf-8")
        epics = parse_backlog(content)
        epics = _filter_epics(epics, args)

        synced = 0
        unchanged = 0

        for epic in epics:
            for story in epic["stories"]:
                existing = _find_existing_shard(output_dir, story["id"])
                if not existing:
                    # New story — create it
                    filename = _safe_filename(story["id"], story["title"])
                    target = output_dir / filename
                    new_content = generate_story_content(story, epic)
                    if not args.dry_run:
                        target.write_text(new_content, encoding="utf-8")
                    print(f"  + {target.name} (novo)")
                    synced += 1
                    continue

                # Compare hashes
                old_content = existing.read_text(encoding="utf-8")
                old_hash = _extract_frontmatter_field(old_content, "spec_hash")
                new_hash = compute_spec_hash(story["description"])

                # Also sync status changes
                old_status = _extract_frontmatter_field(old_content, "status")
                new_status = story["status"]

                if old_hash == new_hash and old_status == new_status:
                    unchanged += 1
                    continue

                workspace = extract_agent_workspace(existing)
                new_content = generate_story_content(story, epic, workspace)

                # Handle filename change (title changed)
                filename = _safe_filename(story["id"], story["title"])
                target = output_dir / filename
                if existing.name != filename:
                    if not args.dry_run:
                        existing.unlink()

                if not args.dry_run:
                    target.write_text(new_content, encoding="utf-8")

                reasons = []
                if old_hash != new_hash:
                    reasons.append("spec")
                if old_status != new_status:
                    reasons.append("status")
                print(f"  ~ {target.name} ({', '.join(reasons)})")
                synced += 1

        print(f"\n🔄 Sync concluido: {synced} atualizados, {unchanged} inalterados")
        return 0

    finally:
        lock_mgr.release_lock("stories", agent)


def status_command(args: argparse.Namespace) -> int:
    """Show shard health: coverage, orphans, staleness."""
    backlog_path = Path(args.backlog) if args.backlog else find_backlog()
    output_dir = Path(args.output)

    if not backlog_path or not backlog_path.exists():
        print("❌ BACKLOG.md nao encontrado.")
        return 1

    content = backlog_path.read_text(encoding="utf-8")
    epics = parse_backlog(content)
    epics = _filter_epics(epics, args)

    # Collect all story IDs from backlog
    backlog_ids = set()
    for epic in epics:
        for story in epic["stories"]:
            backlog_ids.add(story["id"])

    # Collect all story IDs from shards
    shard_ids = set()
    shard_files = {}
    if output_dir.exists():
        for f in output_dir.glob("STORY-*.md"):
            m = re.match(r"STORY-(\d+)-(\d+)_", f.name)
            if m:
                sid = f"{m.group(1)}.{m.group(2)}"
                shard_ids.add(sid)
                shard_files[sid] = f

    covered = backlog_ids & shard_ids
    missing = backlog_ids - shard_ids
    orphans = shard_ids - backlog_ids

    total = len(backlog_ids)
    coverage = (len(covered) / total * 100) if total > 0 else 0

    print(f"📊 Shard Status")
    print(f"   Backlog stories:  {total}")
    print(f"   Shards existentes: {len(shard_ids)}")
    print(f"   Cobertura:        {coverage:.0f}%")
    print()

    if missing:
        print(f"⚠️  Sem shard ({len(missing)}):")
        for sid in sorted(missing):
            print(f"     - Story {sid}")
        print()

    if orphans:
        print(f"🗑️  Orfaos ({len(orphans)}):")
        for sid in sorted(orphans):
            f = shard_files.get(sid)
            print(f"     - {f.name if f else sid}")
        print()

    # Check staleness (spec_hash mismatch)
    stale = []
    for epic in epics:
        for story in epic["stories"]:
            if story["id"] in shard_files:
                shard_content = shard_files[story["id"]].read_text(encoding="utf-8")
                old_hash = _extract_frontmatter_field(shard_content, "spec_hash")
                new_hash = compute_spec_hash(story["description"])
                if old_hash and old_hash != new_hash:
                    stale.append(story["id"])

    if stale:
        print(f"🔄 Desatualizados ({len(stale)}):")
        for sid in sorted(stale):
            print(f"     - Story {sid}")
        print()

    if not missing and not orphans and not stale:
        print("✅ Todos os shards estao sincronizados.")

    return 0


def clean_command(args: argparse.Namespace) -> int:
    """Remove orphan shards (stories that no longer exist in backlog)."""
    backlog_path = Path(args.backlog) if args.backlog else find_backlog()
    output_dir = Path(args.output)

    if not backlog_path or not backlog_path.exists():
        print("❌ BACKLOG.md nao encontrado.")
        return 1

    if not output_dir.exists():
        print("⚠️  docs/stories/ nao existe. Nada a limpar.")
        return 0

    content = backlog_path.read_text(encoding="utf-8")
    epics = parse_backlog(content)

    backlog_ids = set()
    for epic in epics:
        for story in epic["stories"]:
            backlog_ids.add(story["id"])

    removed = 0
    for f in output_dir.glob("STORY-*.md"):
        m = re.match(r"STORY-(\d+)-(\d+)_", f.name)
        if m:
            sid = f"{m.group(1)}.{m.group(2)}"
            if sid not in backlog_ids:
                if args.dry_run:
                    print(f"  [DRY-RUN] REMOVE: {f.name}")
                else:
                    f.unlink()
                    print(f"  🗑️  Removido: {f.name}")
                removed += 1

    if removed == 0:
        print("✅ Nenhum shard orfao encontrado.")
    else:
        print(f"\n🧹 {removed} shard(s) orfao(s) {'seriam removidos' if args.dry_run else 'removidos'}.")

    return 0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _filter_epics(epics: list[dict], args: argparse.Namespace) -> list[dict]:
    """Filter epics/stories based on --epic and --story flags."""
    if args.story:
        epic_num = int(args.story.split(".")[0])
        filtered = []
        for epic in epics:
            if epic["epic_num"] == epic_num:
                epic_copy = dict(epic)
                epic_copy["stories"] = [s for s in epic["stories"] if s["id"] == args.story]
                if epic_copy["stories"]:
                    filtered.append(epic_copy)
        return filtered

    if args.epic:
        return [e for e in epics if e["epic_num"] == int(args.epic)]

    return epics


def _extract_frontmatter_field(content: str, field: str) -> str | None:
    """Extract a field value from YAML frontmatter."""
    m = re.search(rf'^{field}:\s*"?([^"\n]+)"?\s*$', content, re.MULTILINE)
    return m.group(1).strip() if m else None


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="shard_epic",
        description="Splits BACKLOG.md into individual story files in docs/stories/",
    )

    sub = parser.add_subparsers(dest="command")

    # Default command is 'shard' (handled in main)
    shard_p = sub.add_parser("shard", help="Full sharding of backlog")
    sync_p = sub.add_parser("sync", help="Incremental sync (changed stories only)")
    status_p = sub.add_parser("status", help="Shard health report")
    clean_p = sub.add_parser("clean", help="Remove orphan shards")

    # Common options for all subcommands
    for p in (shard_p, sync_p, status_p, clean_p):
        p.add_argument("--epic", type=str, default=None, help="Process only Epic N")
        p.add_argument("--story", type=str, default=None, help="Process only Story N.N")
        p.add_argument("--backlog", type=str, default=None, help="Override backlog path")
        p.add_argument("--output", type=str, default="docs/stories", help="Override stories dir")

    # Shard-specific
    shard_p.add_argument("--force", action="store_true", help="Overwrite Agent Workspace")
    shard_p.add_argument("--dry-run", action="store_true", help="Show actions without writing")

    # Sync-specific
    sync_p.add_argument("--dry-run", action="store_true", help="Show actions without writing")

    # Clean-specific
    clean_p.add_argument("--dry-run", action="store_true", help="Show actions without writing")

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    # Backward compat: no subcommand = shard
    if args.command is None:
        sys.argv.insert(1, "shard")
        args = parser.parse_args()

    commands = {
        "shard": shard_command,
        "sync": sync_command,
        "status": status_command,
        "clean": clean_command,
    }

    handler = commands.get(args.command)
    if handler:
        sys.exit(handler(args))
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
