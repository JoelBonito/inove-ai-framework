"""Shared fixtures for Inove AI Framework tests."""

import pytest
from pathlib import Path


@pytest.fixture
def project_root():
    """Return the absolute path to the project root directory."""
    return Path(__file__).resolve().parent.parent


@pytest.fixture
def agents_root(project_root):
    """Return the path to the .agents/ directory."""
    return project_root / ".agents"
