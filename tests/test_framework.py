"""
Tests for the Inove AI Framework core structure and configuration.

Validates that the framework has the expected directory layout, agent
definitions, skill modules, workflow files, and generated web data.
"""

import json
import sys
from pathlib import Path

import pytest
import yaml


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MIN_AGENTS = 20
MIN_SKILLS = 35
MIN_WORKFLOWS = 15
BRIDGE_FILES = ["CLAUDE.md", "AGENTS.md", "GEMINI.md"]
REQUIRED_SUBDIRS = ["agents", "skills", "workflows", "scripts"]
GENERATED_JSON_FILES = ["agents.json", "skills.json", "workflows.json"]


# ===========================================================================
# 1. Framework structure
# ===========================================================================


class TestFrameworkStructure:
    """Verify the top-level directory layout of the framework."""

    def test_agents_directory_exists(self, agents_root):
        """The .agents/ directory must exist."""
        assert agents_root.is_dir(), f".agents/ not found at {agents_root}"

    @pytest.mark.parametrize("subdir", REQUIRED_SUBDIRS)
    def test_required_subdirectories_exist(self, agents_root, subdir):
        """Each required subdirectory must exist inside .agents/."""
        path = agents_root / subdir
        assert path.is_dir(), f".agents/{subdir}/ not found"

    def test_minimum_agent_count(self, agents_root):
        """Framework must ship with at least {MIN_AGENTS} agents."""
        agents = list((agents_root / "agents").glob("*.md"))
        assert len(agents) >= MIN_AGENTS, (
            f"Expected >= {MIN_AGENTS} agents, found {len(agents)}"
        )

    def test_minimum_skill_count(self, agents_root):
        """Framework must ship with at least {MIN_SKILLS} skills."""
        skills = [
            d for d in (agents_root / "skills").iterdir() if d.is_dir()
        ]
        assert len(skills) >= MIN_SKILLS, (
            f"Expected >= {MIN_SKILLS} skills, found {len(skills)}"
        )

    def test_minimum_workflow_count(self, agents_root):
        """Framework must ship with at least {MIN_WORKFLOWS} workflows."""
        workflows = list((agents_root / "workflows").glob("*.md"))
        assert len(workflows) >= MIN_WORKFLOWS, (
            f"Expected >= {MIN_WORKFLOWS} workflows, found {len(workflows)}"
        )

    @pytest.mark.parametrize("filename", BRIDGE_FILES)
    def test_bridge_files_exist(self, project_root, filename):
        """Bridge instruction files must exist in the project root."""
        path = project_root / filename
        assert path.is_file(), f"Bridge file {filename} not found"


# ===========================================================================
# 2. Agent validation
# ===========================================================================


def _parse_frontmatter(filepath: Path) -> dict:
    """Extract YAML frontmatter from a markdown file.

    Expects files that start with '---' and end the block with '---'.
    Returns an empty dict when no valid frontmatter is found.
    """
    text = filepath.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    try:
        return yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError:
        return {}


class TestAgentValidation:
    """Each agent .md file must have valid YAML frontmatter."""

    @pytest.fixture
    def agent_files(self, agents_root):
        return sorted((agents_root / "agents").glob("*.md"))

    def test_all_agents_have_frontmatter(self, agent_files):
        """Every agent file must contain parseable YAML frontmatter."""
        missing = []
        for f in agent_files:
            fm = _parse_frontmatter(f)
            if not fm:
                missing.append(f.name)
        assert not missing, (
            f"Agents without valid frontmatter: {missing}"
        )

    def test_all_agents_have_name(self, agent_files):
        """Every agent frontmatter must include a 'name' field."""
        missing = []
        for f in agent_files:
            fm = _parse_frontmatter(f)
            if "name" not in fm:
                missing.append(f.name)
        assert not missing, (
            f"Agents missing 'name' in frontmatter: {missing}"
        )

    def test_all_agents_have_description(self, agent_files):
        """Every agent frontmatter must include a 'description' field."""
        missing = []
        for f in agent_files:
            fm = _parse_frontmatter(f)
            if "description" not in fm:
                missing.append(f.name)
        assert not missing, (
            f"Agents missing 'description' in frontmatter: {missing}"
        )


# ===========================================================================
# 3. Skill validation
# ===========================================================================


class TestSkillValidation:
    """Each skill directory must contain a SKILL.md file."""

    @pytest.fixture
    def skill_dirs(self, agents_root):
        return sorted(
            d for d in (agents_root / "skills").iterdir() if d.is_dir()
        )

    def test_all_skills_have_skill_md(self, skill_dirs):
        """Every skill directory must contain a SKILL.md file."""
        missing = []
        for d in skill_dirs:
            if not (d / "SKILL.md").is_file():
                missing.append(d.name)
        assert not missing, (
            f"Skills missing SKILL.md: {missing}"
        )


# ===========================================================================
# 4. Workflow validation
# ===========================================================================


class TestWorkflowValidation:
    """Each workflow .md file must have content."""

    @pytest.fixture
    def workflow_files(self, agents_root):
        return sorted((agents_root / "workflows").glob("*.md"))

    def test_all_workflows_are_non_empty(self, workflow_files):
        """Every workflow file must have non-zero content."""
        empty = []
        for f in workflow_files:
            if f.stat().st_size == 0:
                empty.append(f.name)
        assert not empty, f"Empty workflow files: {empty}"


# ===========================================================================
# 5. Platform compatibility
# ===========================================================================


class TestPlatformCompat:
    """Tests for the platform_compat.py helper module."""

    @pytest.fixture(autouse=True)
    def _add_scripts_to_path(self, agents_root):
        """Temporarily add .agents/scripts/ to sys.path."""
        scripts_dir = str(agents_root / "scripts")
        sys.path.insert(0, scripts_dir)
        yield
        sys.path.remove(scripts_dir)

    def test_get_agent_source_returns_string(self):
        """get_agent_source() must return a non-empty string."""
        from platform_compat import get_agent_source

        result = get_agent_source()
        assert isinstance(result, str)
        assert len(result) > 0

    def test_get_agent_source_known_values(self):
        """Without env vars, get_agent_source() returns 'unknown'."""
        import os
        from importlib import reload

        # Clear relevant env vars to get deterministic result
        env_keys = [
            "CODEX_SESSION",
            "CLAUDE_CODE_SESSION",
            "ANTIGRAVITY_SESSION",
            "GEMINI_SESSION",
            "AGENT_SOURCE",
        ]
        saved = {k: os.environ.pop(k, None) for k in env_keys}
        try:
            import platform_compat

            reload(platform_compat)
            result = platform_compat.get_agent_source()
            assert result == "unknown"
        finally:
            for k, v in saved.items():
                if v is not None:
                    os.environ[k] = v

    def test_get_agent_root_returns_path(self):
        """get_agent_root() must return a Path object."""
        from platform_compat import get_agent_root

        result = get_agent_root()
        assert isinstance(result, Path)


# ===========================================================================
# 6. Generated web data
# ===========================================================================


class TestGeneratedData:
    """Validate the generated JSON files used by the web app."""

    @pytest.fixture
    def generated_dir(self, project_root):
        return project_root / "web" / "src" / "data" / "generated"

    @pytest.mark.parametrize("filename", GENERATED_JSON_FILES)
    def test_generated_json_exists(self, generated_dir, filename):
        """Generated JSON file must exist."""
        path = generated_dir / filename
        assert path.is_file(), (
            f"{filename} not found in {generated_dir}. "
            "Run: python .agents/scripts/generate_web_data.py"
        )

    @pytest.mark.parametrize("filename", GENERATED_JSON_FILES)
    def test_generated_json_is_valid(self, generated_dir, filename):
        """Generated JSON file must be parseable."""
        path = generated_dir / filename
        if not path.is_file():
            pytest.skip(f"{filename} not generated yet")
        text = path.read_text(encoding="utf-8")
        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            pytest.fail(f"{filename} contains invalid JSON: {exc}")
        assert data, f"{filename} is empty"
