#!/usr/bin/env python3
"""
Progress Tracker - Antigravity Kit
Analisa o backlog de tarefas e gera uma barra de progresso visual.

Uso:
    python .agents/scripts/progress_tracker.py [caminho_backlog]

Se nenhum caminho for fornecido, procura automaticamente em:
    - docs/BACKLOG.md
    - docs/*/global-task-list.md
"""

import re
import sys
from datetime import datetime
from pathlib import Path
from typing import NamedTuple

sys.path.insert(0, str(Path(__file__).parent))
from platform_compat import find_backlog


class Epic(NamedTuple):
    """Representa um Epic com suas métricas."""
    name: str
    total: int
    done: int
    owner: str = None  # Agente responsável pelo Epic
    model: str = None  # Modelo AI preferencial (opus-4-5, sonnet, etc)

    @property
    def percent(self) -> float:
        return (self.done / self.total * 100) if self.total > 0 else 0


def parse_backlog(content: str) -> list[Epic]:
    """
    Analisa o conteúdo do backlog e extrai Epics com suas tarefas.

    Formato esperado:
        ## Epic N: Nome do Epic [OWNER: agent_name] [MODEL: opus-4-5]
        - [x] **Story N.N:** Título
        - [ ] **Story N.N:** Título
    """
    epics: list[Epic] = []

    # Regex para encontrar Epics com ownership e model opcionais
    # Captura: nome do epic, owner (se existir) e model (se existir)
    epic_pattern = re.compile(
        r"^##\s+Epic\s+\d+:\s+(.+?)\s*(?:\[OWNER:\s*(.+?)\])?\s*(?:\[MODEL:\s*(.+?)\])?\s*(?:[✅🔴⏳].*)?$",
        re.MULTILINE
    )

    # Divide o conteúdo por Epics
    epic_matches = list(epic_pattern.finditer(content))

    for idx, match in enumerate(epic_matches):
        epic_name = match.group(1).strip()
        epic_owner = match.group(2).strip() if match.group(2) else None
        epic_model = match.group(3).strip() if match.group(3) else None

        # Extrai o conteúdo do Epic (até o próximo Epic ou fim do documento)
        start_pos = match.end()
        end_pos = epic_matches[idx + 1].start() if idx + 1 < len(epic_matches) else len(content)
        epic_content = content[start_pos:end_pos]

        # Conta tarefas (Stories e Subtarefas)
        done = len(re.findall(r"^\s*-\s*\[x\]", epic_content, re.MULTILINE | re.IGNORECASE))
        pending = len(re.findall(r"^\s*-\s*\[\s\]", epic_content, re.MULTILINE))
        total = done + pending

        if total > 0:
            epics.append(Epic(name=epic_name, total=total, done=done, owner=epic_owner, model=epic_model))

    return epics


def generate_bar(percent: float, width: int = 20) -> str:
    """Gera uma barra de progresso ASCII."""
    filled = int(width * percent / 100)
    empty = width - filled
    return "█" * filled + "░" * empty


def generate_progress_report(epics: list[Epic]) -> str:
    """Gera o conteúdo do arquivo progress-bar.md."""
    total_tasks = sum(e.total for e in epics)
    done_tasks = sum(e.done for e in epics)
    global_percent = (done_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Encontra próxima tarefa (primeiro Epic não 100%)
    next_task = ""
    for epic in epics:
        if epic.percent < 100:
            next_task = f"**{epic.name}**"
            break
    
    lines = [
        "# 📊 Barra de Progresso do Projeto",
        "",
        f"**Última Atualização:** {now} (America/Sao_Paulo)",
        "",
        "---",
        "",
        "## Progresso Geral",
        "",
        "```",
        f"{generate_bar(global_percent)} {global_percent:.2f}%",
        "```",
        "",
        "| Métrica | Valor |",
        "|---------|-------|",
        f"| **Tarefas Concluídas** | {done_tasks} |",
        f"| **Total de Tarefas** | {total_tasks} |",
        f"| **Percentual** | {global_percent:.2f}% |",
        "",
        "---",
        "",
        "## Progresso por Epic",
        "",
        "| Epic | Owner | Model | Progresso | Visual |",
        "|------|-------|-------|-----------|--------|",
    ]

    for epic in epics:
        bar = generate_bar(epic.percent)
        status = "✅" if epic.percent == 100 else ""
        owner_emoji = ""
        if epic.owner:
            owner_emoji = "🤖" if epic.owner == "antigravity" else "🔵"
            owner_display = f"{owner_emoji} {epic.owner}"
        else:
            owner_display = "—"
        model_display = epic.model if epic.model else "—"
        lines.append(f"| {epic.name} {status} | {owner_display} | {model_display} | {epic.percent:.0f}% | {bar} |")
    
    lines.extend([
        "",
        "---",
        "",
    ])
    
    if next_task:
        lines.extend([
            "## Próximo Foco",
            "",
            f"{next_task}",
            "",
            "---",
            "",
        ])
    
    lines.append("*Gerado automaticamente pelo workflow `/track`*")
    
    return "\n".join(lines)


def main():
    # Determina o caminho do backlog
    if len(sys.argv) > 1:
        backlog_path = Path(sys.argv[1])
    else:
        backlog_path = find_backlog()
    
    if not backlog_path or not backlog_path.exists():
        print("❌ Nenhum arquivo de backlog encontrado.")
        print("   Execute /define primeiro para criar a estrutura do projeto.")
        sys.exit(1)
    
    print(f"📖 Lendo: {backlog_path}")
    
    content = backlog_path.read_text(encoding="utf-8")
    epics = parse_backlog(content)
    
    if not epics:
        print("⚠️  Nenhum Epic encontrado no backlog.")
        print("   Verifique se o formato está correto (## Epic N: Nome)")
        sys.exit(1)
    
    # Gera o relatório
    report = generate_progress_report(epics)
    
    # Salva em docs/progress-bar.md
    output_path = Path("docs/progress-bar.md")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report, encoding="utf-8")
    
    # Exibe resumo
    total = sum(e.total for e in epics)
    done = sum(e.done for e in epics)
    percent = (done / total * 100) if total > 0 else 0
    
    print()
    print("📊 **Progresso Atualizado!**")
    print()
    print(f"{generate_bar(percent)} {percent:.1f}%")
    print()
    print(f"Concluídas: {done}/{total}")
    print()
    print("Por Epic:")
    for epic in epics:
        status = "✅" if epic.percent == 100 else "🔄"
        meta_text = ""
        if epic.owner:
            owner_emoji = "🤖" if epic.owner == "antigravity" else "🔵"
            meta_text = f" [{owner_emoji} {epic.owner}]"
        if epic.model:
            meta_text += f" [🧠 {epic.model}]"
        print(f"  {status} {epic.name}{meta_text}: {epic.percent:.0f}% ({epic.done}/{epic.total})")
    print()
    print(f"✅ Arquivo gerado: {output_path}")


if __name__ == "__main__":
    main()
