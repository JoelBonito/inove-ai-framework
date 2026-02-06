#!/usr/bin/env python3
"""
Auto Session Manager - Inove AI Framework
Gerencia sessões automaticamente com detecção inteligente.

Uso:
    python .agents/scripts/auto_session.py start [--agent antigravity|claude_code]
    python .agents/scripts/auto_session.py end [--quick] [--activities "..."]
    python .agents/scripts/auto_session.py status
"""

import os
import re
import sys
import json
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from platform_compat import get_agent_source, find_logs_dir

SESSION_FILE = Path(".agents/.session_state.json")


def load_session():
    """Carrega estado da sessão atual."""
    if SESSION_FILE.exists():
        try:
            return json.loads(SESSION_FILE.read_text())
        except json.JSONDecodeError:
            return None
    return None


def save_session(data):
    """Salva estado da sessão."""
    SESSION_FILE.parent.mkdir(parents=True, exist_ok=True)
    SESSION_FILE.write_text(json.dumps(data, indent=2))


def clear_session():
    """Limpa sessão atual."""
    if SESSION_FILE.exists():
        SESSION_FILE.unlink()


def get_project_name() -> str:
    """Detecta o nome do projeto a partir do diretório."""
    cwd = Path.cwd()
    return cwd.name


def update_daily_log_start(session: dict):
    """Atualiza o log diário com início de sessão."""
    logs_dir = find_logs_dir(auto_create=True)
    year_dir = logs_dir / session['date'][:4]
    year_dir.mkdir(parents=True, exist_ok=True)

    log_file = year_dir / f"{session['date']}.md"

    agent_emoji = "🤖" if session['agent'] == "antigravity" else "🔵"

    if log_file.exists():
        content = log_file.read_text(encoding='utf-8')

        # Encontra o último número de sessão
        session_numbers = re.findall(r'^(\d+)\.\s+\d{1,2}:\d{2}', content, re.MULTILINE)
        next_number = max([int(n) for n in session_numbers], default=0) + 1

        # Adiciona nova sessão ao final (antes do rodapé se existir)
        footer_pattern = r'\n---\n\*Última atualização:.*?\*\n?$'
        if re.search(footer_pattern, content):
            content = re.sub(footer_pattern, '', content)

        new_entry = f"\n{next_number}. {session['start_time']} — *(em andamento)* [{agent_emoji} {session['agent']}]\n   - Atividades:\n     - *(sessão ativa)*\n"
        content += new_entry

        # Adiciona rodapé atualizado
        content += f"\n---\n*Última atualização: {datetime.now().strftime('%Y-%m-%d %H:%M')}*\n"

    else:
        # Cria novo arquivo de log
        content = f"""# 📝 LOG DIÁRIO — {session['date']}

- **Data:** {datetime.strptime(session['date'], '%Y-%m-%d').strftime('%d/%m/%Y')}
- **Projeto:** {session['project']}

---

## Sessões

1. {session['start_time']} — *(em andamento)* [{agent_emoji} {session['agent']}]
   - Atividades:
     - *(sessão ativa)*

---
*Última atualização: {datetime.now().strftime('%Y-%m-%d %H:%M')}*
"""

    log_file.write_text(content, encoding='utf-8')


def update_daily_log_end(session: dict):
    """Atualiza o log diário com fim de sessão."""
    logs_dir = find_logs_dir(auto_create=True)
    year_dir = logs_dir / session['date'][:4]
    log_file = year_dir / f"{session['date']}.md"

    if not log_file.exists():
        print(f"⚠️ Arquivo de log não encontrado: {log_file}")
        return

    content = log_file.read_text(encoding='utf-8')

    agent_emoji = "🤖" if session['agent'] == "antigravity" else "🔵"

    # Encontra a sessão em andamento (última com "em andamento")
    pattern = rf'(\d+\.\s+{re.escape(session["start_time"])})\s+—\s+\*\(em andamento\)\*\s+\[{agent_emoji}\s+{session["agent"]}\]\s+- Atividades:\s+- \*\(sessão ativa\)\*'

    if re.search(pattern, content):
        # Monta lista de atividades
        activities_text = "\n     - ".join(session.get('activities', ['Nenhuma atividade registrada']))

        replacement = rf'\1 — {session["end_time"]} ({session["duration"]}) [{agent_emoji} {session["agent"]}]\n   - Atividades:\n     - {activities_text}'

        content = re.sub(pattern, replacement, content)

        # Atualiza rodapé
        content = re.sub(
            r'\*Última atualização:.*?\*',
            f'*Última atualização: {datetime.now().strftime("%Y-%m-%d %H:%M")}*',
            content
        )

        log_file.write_text(content, encoding='utf-8')
    else:
        print(f"⚠️ Sessão iniciada às {session['start_time']} não encontrada no log")


def start_session(agent_override: str = None) -> bool:
    """Inicia nova sessão."""
    existing = load_session()
    if existing and not existing.get("ended"):
        print(f"⚠️ Sessão já em andamento desde {existing['start_time']}")
        print(f"   Agente: {existing['agent']}")
        print(f"   Use 'auto_session.py status' para ver detalhes")
        return False

    now = datetime.now()
    agent = agent_override if agent_override else get_agent_source()

    session = {
        "start_time": now.strftime("%H:%M"),
        "start_datetime": now.isoformat(),
        "date": now.strftime("%Y-%m-%d"),
        "agent": agent,
        "project": get_project_name(),
        "ended": False,
        "activities": []
    }
    save_session(session)

    # Atualizar arquivo de log do dia
    update_daily_log_start(session)

    agent_emoji = "🤖" if agent == "antigravity" else "🔵"
    print(f"✅ Sessão iniciada às {session['start_time']}")
    print(f"   {agent_emoji} Agente: {agent}")
    print(f"   📁 Projeto: {session['project']}")
    return True


def end_session(activities: str = None, quick: bool = False) -> bool:
    """Encerra sessão atual."""
    session = load_session()
    if not session or session.get("ended"):
        print("⚠️ Nenhuma sessão ativa para encerrar.")
        return False

    now = datetime.now()
    session["end_time"] = now.strftime("%H:%M")
    session["end_datetime"] = now.isoformat()
    session["ended"] = True

    if activities:
        session["activities"] = [a.strip() for a in activities.split(";") if a.strip()]
    elif not quick:
        session["activities"] = ["Nenhuma atividade específica registrada"]

    # Calcular duração
    start = datetime.fromisoformat(session["start_datetime"])
    duration = now - start
    hours, remainder = divmod(int(duration.total_seconds()), 3600)
    minutes = remainder // 60
    session["duration"] = f"{hours:02d}:{minutes:02d}"

    # Atualizar arquivo de log do dia
    update_daily_log_end(session)

    # Limpar estado
    clear_session()

    agent_emoji = "🤖" if session['agent'] == "antigravity" else "🔵"
    print(f"✅ Sessão encerrada às {session['end_time']}")
    print(f"   {agent_emoji} Agente: {session['agent']}")
    print(f"   ⏱️ Duração: {session['duration']}")
    if session.get('activities'):
        print(f"   📝 Atividades registradas: {len(session['activities'])}")
    return True


def get_status():
    """Retorna status da sessão atual."""
    session = load_session()
    if not session or session.get("ended"):
        print("📭 Nenhuma sessão ativa.")
        print()
        print("💡 Para iniciar uma sessão: python .agents/scripts/auto_session.py start")
        return None

    now = datetime.now()
    start = datetime.fromisoformat(session["start_datetime"])
    elapsed = now - start
    hours, remainder = divmod(int(elapsed.total_seconds()), 3600)
    minutes = remainder // 60

    agent_emoji = "🤖" if session['agent'] == "antigravity" else "🔵"

    print("📝 Sessão Ativa")
    print()
    print(f"   {agent_emoji} Agente: {session['agent']}")
    print(f"   📁 Projeto: {session['project']}")
    print(f"   🕐 Início: {session['start_time']}")
    print(f"   ⏱️ Tempo decorrido: {hours:02d}:{minutes:02d}")
    print()
    print("💡 Para encerrar: python .agents/scripts/auto_session.py end")

    return session


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    cmd = sys.argv[1].lower()

    if cmd == "start":
        agent_override = None
        if "--agent" in sys.argv:
            idx = sys.argv.index("--agent")
            if idx + 1 < len(sys.argv):
                agent_override = sys.argv[idx + 1]
        start_session(agent_override)

    elif cmd == "end":
        quick = "--quick" in sys.argv
        activities = None
        if "--activities" in sys.argv:
            idx = sys.argv.index("--activities")
            if idx + 1 < len(sys.argv):
                activities = sys.argv[idx + 1]
        end_session(activities, quick)

    elif cmd == "status":
        get_status()

    else:
        print(f"❌ Comando desconhecido: {cmd}")
        print()
        print("Comandos disponíveis: start, end, status")
        sys.exit(1)


if __name__ == "__main__":
    main()
