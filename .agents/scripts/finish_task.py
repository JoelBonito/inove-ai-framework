#!/usr/bin/env python3
import sys
import re
from pathlib import Path
import datetime

# Importar LockManager
sys.path.insert(0, str(Path(__file__).parent))
from lock_manager import LockManager
from platform_compat import get_agent_source, find_backlog
from recovery import git_checkpoint, git_rollback


def check_epic_ownership(content: str, task_id: str, agent_source: str, force: bool) -> tuple[bool, str]:
    """
    Verifica se o agente tem permissão para modificar a tarefa baseado no ownership do Epic.

    Returns:
        (allow, message) - allow=True se pode prosseguir, message com aviso se houver
    """
    # Extrai Epic ID da task_id (ex: "3.1" -> Epic 3, "2.3" -> Epic 2)
    clean_id = task_id.lower().replace("story", "").replace("epic", "").strip()

    # Tenta extrair o número do Epic
    epic_num_match = re.match(r'^(\d+)', clean_id)
    if not epic_num_match:
        return True, ""  # Não conseguiu determinar Epic, permite

    epic_num = epic_num_match.group(1)

    # Procura pelo Epic no conteúdo
    epic_pattern = re.compile(
        rf"^##\s+Epic\s+{epic_num}:\s+(.+?)\s*(?:\[OWNER:\s*(.+?)\])?\s*(?:[✅🔴⏳].*)?$",
        re.MULTILINE
    )

    epic_match = epic_pattern.search(content)
    if not epic_match:
        return True, ""  # Epic não encontrado ou sem owner, permite

    epic_owner = epic_match.group(2).strip() if epic_match.group(2) else None

    if not epic_owner:
        return True, ""  # Sem owner definido, permite

    if epic_owner == agent_source:
        return True, ""  # Owner correto, permite

    # Owner diferente
    if force:
        return True, f"⚠️ Epic {epic_num} pertence a '{epic_owner}', mas prosseguindo com --force."
    else:
        return False, f"⚠️ Epic {epic_num} pertence a '{epic_owner}'. Use --force para sobrescrever."


def mark_task_complete(backlog_path: Path, task_id: str, force: bool = False) -> tuple[bool, str]:
    """Marca uma tarefa como concluída no backlog."""
    lock_mgr = LockManager()
    agent_source = get_agent_source()

    # Tenta adquirir lock com espera
    if not lock_mgr.wait_for_lock("backlog", agent_source, max_wait=30):
        return False, "⏳ BACKLOG bloqueado por outro agente. Tente novamente em alguns instantes."

    try:
        content = backlog_path.read_text(encoding="utf-8")
    except Exception as e:
        lock_mgr.release_lock("backlog", agent_source)
        return False, f"Erro ao ler o arquivo: {e}"

    # Verifica ownership (modo soft)
    allow, ownership_msg = check_epic_ownership(content, task_id, agent_source, force)
    if not allow:
        lock_mgr.release_lock("backlog", agent_source)
        return False, ownership_msg

    # Regex flexível para IDs (ex: "3.1", "Story 3.1", "Epic 1")
    # Tenta casar: "- [ ] **Story {task_id}:" ou "- [ ] **{task_id}:"
    # O task_id pode vir como "3.1" ou "Story 3.1". Vamos limpar.
    
    clean_id = task_id.lower().replace("story", "").replace("epic", "").strip()
    
    # Padrões para tentar encontrar a task
    # 1. "- [ ] **Story 3.1:**"
    # 2. "- [ ] **Epic 1:**"
    # 3. "- [ ] 3.1:"
    
    patterns = [
        # Match exato de Story/Epic com ID
        (rf"(-\s*\[)\s*(\]\s*\*\*(?:Story|Epic)\s+{re.escape(clean_id)}:)", r"\1x\2"),
        # Match apenas do ID (caso o usuário mande "3.1" e no texto esteja "**3.1:**")
        (rf"(-\s*\[)\s*(\]\s*\*\*{re.escape(clean_id)}:)", r"\1x\2"),
    ]

    new_content = content
    found = False

    for pattern, replacement in patterns:
        # Verifica se existe antes de substituir para saber se achou
        if re.search(pattern, new_content, re.IGNORECASE):
            new_content = re.sub(pattern, replacement, new_content, flags=re.IGNORECASE)
            found = True
            # Se achou e substituiu, para (assume IDs únicos ou substitui todos se repetido, 
            # mas o break aqui é para não aplicar múltiplos patterns na mesma linha se eles se sobreporem)
            # Na verdade, re.sub substitui todas as ocorrências.
            break

    if not found:
        lock_mgr.release_lock("backlog", agent_source)
        return False, f"Tarefa '{task_id}' não encontrada ou já concluída."

    try:
        backlog_path.write_text(new_content, encoding="utf-8")
        success_msg = f"Tarefa '{task_id}' marcada como concluída em {backlog_path.name}."
        # Adiciona mensagem de ownership se houver
        if ownership_msg:
            success_msg = f"{ownership_msg}\n{success_msg}"
        return True, success_msg
    except Exception as e:
        return False, f"Erro ao salvar arquivo: {e}"
    finally:
        # Sempre libera o lock ao final
        lock_mgr.release_lock("backlog", agent_source)

def main():
    if len(sys.argv) < 2:
        print("❌ Uso: python finish_task.py <TASK_ID> [--force]")
        print("Exemplo: python finish_task.py '3.1'")
        print()
        print("Opções:")
        print("  --force    Força a marcação mesmo se houver aviso de ownership")
        sys.exit(1)

    task_id = sys.argv[1]
    force = "--force" in sys.argv
    root = Path.cwd()

    backlog_file = find_backlog(root_path=root)
    if not backlog_file:
        print("❌ Arquivo BACKLOG.md não encontrado em ./docs ou ./docs/planning")
        sys.exit(1)

    # Create git checkpoint before modifying backlog
    checkpoint_label = f"finish-task-{task_id}"
    had_changes = git_checkpoint(checkpoint_label)
    if not had_changes:
        import subprocess as _sp
        try:
            _sp.run(["git", "rev-parse", "--git-dir"],
                    capture_output=True, check=True)
        except (FileNotFoundError, _sp.CalledProcessError):
            print("ℹ️ Git não inicializado — checkpoint desativado. Backlog será editado sem safety net.")

    success, message = mark_task_complete(backlog_file, task_id, force)

    if success:
        print(f"✅ {message}")
    else:
        print(f"⚠️ {message}")
        # Rollback if we created a checkpoint
        if had_changes:
            git_rollback(checkpoint_label)
        sys.exit(1)

if __name__ == "__main__":
    main()
