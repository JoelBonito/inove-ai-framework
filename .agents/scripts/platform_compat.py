#!/usr/bin/env python3
"""
Inove AI Framework - Platform Compatibility Helper
Provides utilities for multi-platform support (Claude Code + Codex CLI + Antigravity/Gemini)

Usage:
    from platform_compat import get_agent_root, get_agent_source

    root = get_agent_root()  # Returns Path to .agents/
    source = get_agent_source()  # Returns 'claude_code', 'codex', 'antigravity', or 'unknown'

Supported Platforms:
    - Claude Code: CLAUDE.md → .agents/
    - Codex CLI: AGENTS.md → .codex/ (symlinks to .agents/)
    - Antigravity/Gemini: GEMINI.md → .agents/
"""

import os
from pathlib import Path
from typing import Optional


def get_agent_root() -> Path:
    """
    Returns the path to the agents directory.
    Compatible with both Claude Code (.agents/) and legacy (.agent/).

    Returns:
        Path: Path to the agents root directory
    """
    # Check possible locations in order of preference
    candidates = [".agents", ".agent", ".codex"]

    for candidate in candidates:
        path = Path(candidate)
        if path.exists() and path.is_dir():
            # For .codex, resolve symlinks to get actual path
            if candidate == ".codex":
                skills_path = path / "skills"
                if skills_path.is_symlink():
                    resolved = skills_path.resolve().parent
                    if resolved.exists():
                        return resolved
            return path

    # Default to .agents even if it doesn't exist
    return Path(".agents")


def get_agent_source() -> str:
    """
    Detects which AI tool is currently executing.

    Returns:
        str: 'codex', 'claude_code', 'antigravity', or 'unknown'
    """
    # Check environment variables set by tools
    if os.environ.get("CODEX_SESSION"):
        return "codex"

    if os.environ.get("CLAUDE_CODE_SESSION"):
        return "claude_code"

    # Check for Antigravity/Gemini
    if os.environ.get("ANTIGRAVITY_SESSION") or os.environ.get("GEMINI_SESSION"):
        return "antigravity"

    # Fallback to explicit environment variable
    return os.environ.get("AGENT_SOURCE", "unknown")


def find_backlog(root_path: Optional[Path] = None) -> Optional[Path]:
    """
    Finds the backlog file in known locations.

    Args:
        root_path: Optional root path to search from. Defaults to current directory.

    Returns:
        Path to backlog file or None if not found.
    """
    base = root_path or Path(".")
    candidates = [
        base / "docs" / "BACKLOG.md",
        base / "BACKLOG.md",
        base / "docs" / "planning" / "BACKLOG.md",
    ]
    # Also search for alternative names
    docs_path = base / "docs"
    if docs_path.exists():
        candidates.extend(docs_path.rglob("global-task-list.md"))
        candidates.extend(docs_path.rglob("task-list.md"))

    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def find_logs_dir(auto_create: bool = False) -> Optional[Path]:
    """
    Finds the session logs directory.

    Args:
        auto_create: If True, creates the default directory when not found.

    Returns:
        Path to logs directory, or None if not found and auto_create is False.
    """
    candidates = [
        Path("docs/08-Logs-Sessoes"),
        Path("Docs/08-Logs-Sessoes"),
        Path("logs"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate

    if auto_create:
        default_dir = Path("docs/08-Logs-Sessoes")
        default_dir.mkdir(parents=True, exist_ok=True)
        return default_dir

    return None


def get_config_path(platform: str = None) -> Path:
    """
    Returns the path to the configuration file for the specified platform.

    Args:
        platform: 'codex', 'claude', or None (auto-detect)

    Returns:
        Path: Path to the configuration file
    """
    root = get_agent_root()

    if platform is None:
        platform = get_agent_source()

    config_map = {
        "codex": root / "config" / "codex.toml",
        "claude_code": root / "config" / "claude.json",
        "antigravity": root / "config" / "antigravity.json",
    }

    return config_map.get(platform, root / "config" / "codex.toml")


def get_skills_path() -> Path:
    """Returns the path to the skills directory."""
    return get_agent_root() / "skills"


def get_agents_path() -> Path:
    """Returns the path to the agents directory."""
    return get_agent_root() / "agents"


def get_workflows_path() -> Path:
    """Returns the path to the workflows directory."""
    return get_agent_root() / "workflows"


def get_scripts_path() -> Path:
    """Returns the path to the scripts directory."""
    return get_agent_root() / "scripts"


# ---------------------------------------------------------------------------
# Log Parsing Utilities (used by dashboard.py, sync_tracker.py)
# ---------------------------------------------------------------------------

import re
from datetime import datetime, timedelta
from typing import List, Dict, NamedTuple


class Session(NamedTuple):
    """Represents a work session parsed from daily log files."""
    date: str
    project: str
    start: str
    end: str
    duration_minutes: int
    activities: List[str]
    agent_source: str = "unknown"


def _parse_duration(duration_str: str) -> int:
    """Converts 'HH:MM' to minutes."""
    match = re.match(r"(\d{1,2}):(\d{2})", duration_str)
    if match:
        return int(match.group(1)) * 60 + int(match.group(2))
    return 0


def parse_log_file(filepath: Path) -> List[Session]:
    """Extracts sessions from a daily log markdown file."""
    content = filepath.read_text(encoding="utf-8")

    date_match = re.search(r"LOG DI[AÁ]RIO\s*[—–-]\s*(\d{4}-\d{2}-\d{2})", content)
    project_match = re.search(r"- Projeto:\s*(.+)", content)

    if not date_match:
        return []

    date = date_match.group(1)
    project = project_match.group(1).strip() if project_match else "Unknown"

    sessions: List[Session] = []
    session_pattern = re.compile(
        r"^\d+\.\s+(\d{1,2}:\d{2})\s*[—–-]\s*(\d{1,2}:\d{2})\s*\((\d{1,2}:\d{2})\)\s*(?:\[.*?([a-z_]+)\])?",
        re.MULTILINE | re.IGNORECASE,
    )

    for match in session_pattern.finditer(content):
        start_pos = match.end()
        next_match = session_pattern.search(content, start_pos)
        end_pos = next_match.start() if next_match else len(content)
        section = content[start_pos:end_pos]
        activities = re.findall(r"^\s+-\s+(.+)$", section, re.MULTILINE)

        sessions.append(Session(
            date=date,
            project=project,
            start=match.group(1),
            end=match.group(2),
            duration_minutes=_parse_duration(match.group(3)),
            activities=activities,
            agent_source=match.group(4) or "unknown",
        ))

    return sessions


def get_logs_in_range(logs_dir: Path, start_date: datetime, end_date: datetime) -> List[Session]:
    """Returns all sessions in a date range."""
    all_sessions: List[Session] = []
    for year_dir in logs_dir.iterdir():
        if not year_dir.is_dir():
            continue
        for log_file in year_dir.glob("*.md"):
            try:
                file_date = datetime.strptime(log_file.stem, "%Y-%m-%d")
            except ValueError:
                continue
            if start_date.date() <= file_date.date() <= end_date.date():
                all_sessions.extend(parse_log_file(log_file))
    return sorted(all_sessions, key=lambda s: (s.date, s.start))


def get_last_activity_by_agent(logs_dir: Path, days_back: int = 7) -> Dict[str, dict]:
    """Returns last activity per agent over the last N days."""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    sessions = get_logs_in_range(logs_dir, start_date, end_date)

    agent_stats: Dict[str, dict] = {}
    for session in sessions:
        agent = session.agent_source
        if agent not in agent_stats:
            agent_stats[agent] = {
                "last_session": session,
                "last_activity": session.activities[-1] if session.activities else "No activity",
                "total_time_week": 0,
                "sessions_count": 0,
            }
        current = agent_stats[agent]
        if session.date > current["last_session"].date or (
            session.date == current["last_session"].date
            and session.start > current["last_session"].start
        ):
            current["last_session"] = session
            current["last_activity"] = session.activities[-1] if session.activities else "No activity"
        current["total_time_week"] += session.duration_minutes
        current["sessions_count"] += 1

    return agent_stats


# For backwards compatibility
AGENT_ROOT = get_agent_root()
AGENT_SOURCE = get_agent_source()


if __name__ == "__main__":
    # Self-test when run directly
    print("Inove AI Framework - Platform Compatibility Helper")
    print("=" * 50)
    print(f"Agent Root: {get_agent_root()}")
    print(f"Agent Source: {get_agent_source()}")
    print(f"Skills Path: {get_skills_path()}")
    print(f"Agents Path: {get_agents_path()}")
    print(f"Workflows Path: {get_workflows_path()}")
    print(f"Config Path: {get_config_path()}")
