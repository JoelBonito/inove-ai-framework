#!/usr/bin/env python3
"""
Session Logger - Antigravity Kit
Gerencia logs de sessão e gera resumos semanais/mensais detalhados.

Uso:
    python .agents/scripts/session_logger.py summary [--week|--month]
    python .agents/scripts/session_logger.py show [AAAA-MM-DD]
"""

import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import NamedTuple, List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from platform_compat import get_agent_source, find_logs_dir


class Session(NamedTuple):
    """Representa uma sessão de trabalho."""
    date: str
    project: str
    start: str
    end: str
    duration_minutes: int
    activities: List[str]
    agent_source: str = "antigravity"  # default para backward compatibility


def parse_duration(duration_str: str) -> int:
    """Converte 'HH:MM' para minutos."""
    match = re.match(r"(\d{1,2}):(\d{2})", duration_str)
    if match:
        hours, minutes = int(match.group(1)), int(match.group(2))
        return hours * 60 + minutes
    return 0


def format_duration(minutes: int) -> str:
    """Converte minutos para 'HH:MM'."""
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"


def parse_log_file(filepath: Path) -> List[Session]:
    """Extrai sessões de um arquivo de log."""
    content = filepath.read_text(encoding="utf-8")
    
    # Extrair data e projeto
    date_match = re.search(r"LOG DIÁRIO — (\d{4}-\d{2}-\d{2})", content)
    project_match = re.search(r"- Projeto:\s*(.+)", content)
    
    if not date_match:
        return []
        
    date = date_match.group(1)
    project = project_match.group(1).strip() if project_match else "Desconhecido"
    
    sessions = []

    # Regex para sessões: N. HH:MM — HH:MM (HH:MM) [🤖 agent_name] (campo agent opcional)
    session_pattern = re.compile(
        r"^\d+\.\s+(\d{1,2}:\d{2})\s*[—–-]\s*(\d{1,2}:\d{2})\s*\((\d{1,2}:\d{2})\)\s*(?:\[.*?([a-z_]+)\])?",
        re.MULTILINE | re.IGNORECASE
    )

    for match in session_pattern.finditer(content):
        start = match.group(1)
        end = match.group(2)
        duration = parse_duration(match.group(3))
        agent = match.group(4) if match.group(4) else "antigravity"  # default se não especificado
        
        # Extrair atividades após essa sessão
        start_pos = match.end()
        next_session = session_pattern.search(content, start_pos)
        end_pos = next_session.start() if next_session else len(content)
        
        section = content[start_pos:end_pos]
        activities = re.findall(r"^\s+-\s+(.+)$", section, re.MULTILINE)

        sessions.append(Session(
            date=date,
            project=project,
            start=start,
            end=end,
            duration_minutes=duration,
            activities=activities,
            agent_source=agent
        ))
    
    return sessions


def get_logs_in_range(logs_dir: Path, start_date: datetime, end_date: datetime) -> List[Session]:
    """Obtém todas as sessões em um intervalo de datas."""
    all_sessions = []
    
    for year_dir in logs_dir.iterdir():
        if not year_dir.is_dir():
            continue
        
        for log_file in year_dir.glob("*.md"):
            try:
                file_date = datetime.strptime(log_file.stem, "%Y-%m-%d")
            except ValueError:
                continue
            
            if start_date.date() <= file_date.date() <= end_date.date():
                sessions = parse_log_file(log_file)
                all_sessions.extend(sessions)
    
    return sorted(all_sessions, key=lambda s: (s.date, s.start))


def get_last_activity_by_agent(logs_dir: Path, days_back: int = 7) -> Dict[str, dict]:
    """
    Retorna última atividade de cada agente nos últimos N dias.

    Returns:
        Dict com chave = agent_source e valor = {
            'last_session': Session,
            'last_activity': str,
            'total_time_week': int (minutos),
            'sessions_count': int
        }
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)

    sessions = get_logs_in_range(logs_dir, start_date, end_date)

    agent_stats: Dict[str, dict] = {}

    for session in sessions:
        agent = session.agent_source

        if agent not in agent_stats:
            agent_stats[agent] = {
                'last_session': session,
                'last_activity': session.activities[-1] if session.activities else 'Nenhuma atividade registrada',
                'total_time_week': 0,
                'sessions_count': 0
            }

        # Atualiza se esta sessão é mais recente
        if session.date > agent_stats[agent]['last_session'].date or \
           (session.date == agent_stats[agent]['last_session'].date and
            session.start > agent_stats[agent]['last_session'].start):
            agent_stats[agent]['last_session'] = session
            agent_stats[agent]['last_activity'] = session.activities[-1] if session.activities else 'Nenhuma atividade registrada'

        # Acumula tempo e sessões
        agent_stats[agent]['total_time_week'] += session.duration_minutes
        agent_stats[agent]['sessions_count'] += 1

    return agent_stats


def extract_key_metrics(sessions: List[Session]) -> dict:
    """Extrai Épicos concluídos e Progresso percentual das atividades."""
    completed_epics = set()
    latest_progress = "N/A"
    
    progress_regex = re.compile(r"Progresso.*?:.*?(\d+%)", re.IGNORECASE)
    epic_done_regex = re.compile(r"(Epic|Épico)\s+\d+.*?(DONE|Concluído|Marked as DONE)", re.IGNORECASE)
    
    # Regex para detecção geral de menções (ex: "Epic 1", "Story 2.3")
    mention_regex = re.compile(r"(Epic\s*\d+|Story\s*\d+\.\d+)", re.IGNORECASE)
    mentioned_items = set()

    for session in sessions:
        for activity in session.activities:
            # Check for Epics Done
            if epic_done_regex.search(activity):
                clean_epic = re.sub(r"[\*\-]", "", activity).strip()
                completed_epics.add(clean_epic)
            
            # Check for Progress
            prog_match = progress_regex.search(activity)
            if prog_match:
                latest_progress = prog_match.group(1)
                
            # Check for Mentions
            mentions = mention_regex.findall(activity)
            for m in mentions:
                mentioned_items.add(m)
                
    return {
        "epics": sorted(list(completed_epics)),
        "progress": latest_progress,
        "mentions": sorted(list(mentioned_items))
    }


def generate_structured_report(sessions: List[Session], start_date: datetime, end_date: datetime) -> str:
    """Gera o relatório estruturado conforme solicitado."""
    if not sessions:
        return "❌ Nenhuma sessão encontrada no período."

    # 1. Total de Horas
    total_minutes = sum(s.duration_minutes for s in sessions)
    
    # 2. Dias Trabalhados
    days_stats: Dict[str, int] = {}
    for s in sessions:
        days_stats[s.date] = days_stats.get(s.date, 0) + s.duration_minutes
        
    # 3. Projetos
    projects_stats: Dict[str, dict] = {}
    for s in sessions:
        if s.project not in projects_stats:
            projects_stats[s.project] = {"sessions": 0, "minutes": 0}
        projects_stats[s.project]["sessions"] += 1
        projects_stats[s.project]["minutes"] += s.duration_minutes

    # 4. Métricas (Epics e Progresso)
    metrics = extract_key_metrics(sessions)

    # --- Construção do Relatório ---
    lines = [
        f"# 📊 Relatório Semanal de Atividades",
        "",
        f"**Período:** {start_date.strftime('%d/%m/%Y')} a {end_date.strftime('%d/%m/%Y')}",
        "",
        "## Resumo Geral",
        f"- **Total de Horas Trabalhadas:** {format_duration(total_minutes)}",
        f"- **Progresso do Projeto:** {metrics['progress']}",
        "",
        "## Dias Trabalhados",
    ]
    
    for date, minutes in sorted(days_stats.items()):
        dt = datetime.strptime(date, "%Y-%m-%d")
        weekday = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][int(dt.strftime("%w"))] # %w 0=Sunday
        # Ajuste Python: weekday() 0=Monday, strftime %w 0=Sunday.
        # Vamos usar weekday() para ser seguro com locale
        wk_names = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
        wk_idx = dt.weekday()
        
        lines.append(f"- **{date} ({wk_names[wk_idx]}):** {format_duration(minutes)}")

    lines.extend([
        "",
        "## Projetos Trabalhados",
    ])

    for proj, stats in projects_stats.items():
        lines.append(f"- **{proj}**")
        lines.append(f"  - Sessões: {stats['sessions']}")
        lines.append(f"  - Tempo Total: {format_duration(stats['minutes'])}")

    lines.extend([
        "",
        "## Entregas e Conquistas",
    ])
    
    if metrics["mentions"]:
        lines.extend([
            "### Itens Trabalhados (Detectados)",
            "Os seguintes itens foram mencionados nos logs:",
        ])
        # Group by type for better display
        epics_mentions = [m for m in metrics["mentions"] if m.lower().startswith("epic")]
        stories_mentions = [m for m in metrics["mentions"] if m.lower().startswith("story")]
        
        if epics_mentions:
            lines.append(f"- **Épicos:** {', '.join(epics_mentions)}")
        if stories_mentions:
            lines.append(f"- **Stories:** {', '.join(stories_mentions)}")
        lines.append("")

    lines.append("### Épicos Concluídos")

    if metrics["epics"]:
        for epic in metrics["epics"]:
            lines.append(f"- {epic}")
    else:
        lines.append("- Nenhum épico explicitamente marcado como concluído neste período.")

    lines.extend([
        "",
        "---",
        f"*Gerado automaticamente em {datetime.now().strftime('%Y-%m-%d %H:%M')}*",
    ])

    return "\n".join(lines)


def cmd_summary(args: List[str]):
    """Comando: summary --week ou --month"""
    logs_dir = find_logs_dir()
    if not logs_dir:
        print("❌ Diretório de logs não encontrado.")
        sys.exit(1)
    
    today = datetime.now()
    
    if "--month" in args:
        start_date = today.replace(day=1)
        period_name = "mensal"
    else:  # Default: --week
        # Começa na segunda-feira da semana atual se hoje for semana útil, 
        # ou ajusta conforme lógica de negócio. Vamos pegar últimos 7 dias ou from monday?
        # Geralmente relatório semanal é da semana atual (Seg-Sex/Dom)
        start_date = today - timedelta(days=today.weekday())
        period_name = "semanal"
    
    end_date = today
    
    # Se o usuário passou datas manuais? (Opcional futuro)
    
    print(f"📖 Analisando logs de {start_date.date()} a {end_date.date()}...")
    
    sessions = get_logs_in_range(logs_dir, start_date, end_date)
    report = generate_structured_report(sessions, start_date, end_date)
    
    filename = f"relatorio-{period_name}-{today.strftime('%Y-%m-%d')}.md"
    output_path = logs_dir / filename
    output_path.write_text(report, encoding="utf-8")
    
    print(report)
    print()
    print(f"✅ Relatório salvo em: {output_path}")


def cmd_show(args: List[str]):
    """Comando: show [AAAA-MM-DD]"""
    logs_dir = find_logs_dir()
    if not logs_dir:
        print("❌ Diretório de logs não encontrado.")
        sys.exit(1)
    
    if args:
        date = args[0]
    else:
        date = datetime.now().strftime("%Y-%m-%d")
    
    year = date[:4]
    log_file = logs_dir / year / f"{date}.md"
    
    if not log_file.exists():
        print(f"❌ Log não encontrado: {log_file}")
        sys.exit(1)
    
    print(log_file.read_text(encoding="utf-8"))


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)
    
    command = sys.argv[1]
    args = sys.argv[2:]
    
    if command == "summary":
        cmd_summary(args)
    elif command == "show":
        cmd_show(args)
    else:
        print(f"❌ Comando desconhecido: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
