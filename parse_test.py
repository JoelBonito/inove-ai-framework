import sys
from pathlib import Path
sys.path.append(".agents/scripts")

with open(".agents/scripts/squad_manager.py") as f:
    code = f.read()

exec(code)
m = _get_manifest("n8n-automation")
print(_get_components(m))
