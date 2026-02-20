#!/usr/bin/env python3
"""
Shard Epic - Inove AI Framework
===============================
Fatia e divide o arquivo BACKLOG.md em tarefas individuais (Stories)
na pasta docs/stories/. 
Isso permite que as IAs Mantenham o foco absoluto durante o /plan e /enhance, 
sem precisarem ler milhares de linhas do arquivo completo.

Uso:
    python .agents/scripts/shard_epic.py
"""

import re
import sys
import shutil
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DOCS_DIR = ROOT_DIR / "docs"
BACKLOG_PATH = DOCS_DIR / "BACKLOG.md"
STORIES_DIR = DOCS_DIR / "stories"


def shard_backlog():
    if not BACKLOG_PATH.exists():
        print(f"❌ Erro: Arquivo não encontrado em {BACKLOG_PATH}")
        sys.exit(1)

    print(f"📖 Lendo o arquivo canônico: {BACKLOG_PATH.relative_to(ROOT_DIR)}")
    content = BACKLOG_PATH.read_text(encoding="utf-8")

    # Regex para identificar blocos de Epics
    # Padrão: ## Epic 1: Nome do Epic [OWNER: x]
    epic_pattern = re.compile(
        r"^##\s+Epic\s+(\d+):\s+(.+?)\s*(?:\[OWNER.*?\])?\s*(?:\[MODEL.*?\])?\s*$",
        re.MULTILINE
    )
    
    epic_matches = list(epic_pattern.finditer(content))
    if not epic_matches:
        print("⚠️ Nenhum Epic encontrado no backlog para ser fatiado.")
        sys.exit(1)

    # Limpa a pasta stories antiga (menos a raiz)
    if STORIES_DIR.exists():
        print("🧹 Limpando o diretório de stories antigo...")
        shutil.rmtree(STORIES_DIR)
        
    STORIES_DIR.mkdir(parents=True, exist_ok=True)
    
    total_stories = 0
    
    print("\n🔪 Iniciando Sharding (Fatiamento de Tarefas):")

    for idx, match in enumerate(epic_matches):
        epic_num = match.group(1).strip()
        epic_name = match.group(2).strip()
        
        # Pega o corpo do epic até o inicio do proximo, ou fim do arquivo
        start_pos = match.end()
        end_pos = epic_matches[idx + 1].start() if idx + 1 < len(epic_matches) else len(content)
        epic_body = content[start_pos:end_pos]
        
        # Procura as stories dentro deste epic
        # Padrão: - [ ] **Story 1.1:** Nome da story
        # ou      - [x] **Story 1.2:** Nome
        story_pattern = re.compile(
            r"^\s*-\s*\[([ xX])\]\s*\*\*(Task|Story)\s+([\d\.]+):\*\*\s*(.+)$",
            re.MULTILINE
        )
        
        story_matches = list(story_pattern.finditer(epic_body))
        
        if story_matches:
            print(f"  📦 Epic {epic_num} ({epic_name}): {len(story_matches)} stories detectadas.")
        
        for s_idx, s_match in enumerate(story_matches):
            status = "CONCLUÍDA ✅" if s_match.group(1).strip().lower() == 'x' else "PENDENTE 🔄"
            story_type = s_match.group(2).strip()
            story_num = s_match.group(3).strip()
            story_title = s_match.group(4).strip()
            
            # Pega a sub descrição da story (ballets abaixo dela até a próxima story vazia)
            # Regex match da frente pra traz
            s_start = s_match.end()
            s_end = story_matches[s_idx + 1].start() if s_idx + 1 < len(story_matches) else len(epic_body)
            story_description = epic_body[s_start:s_end].strip()
            
            if not story_description:
                story_description = "_Nenhum detalhe adicional fornecido nesta subtarefa._"

            # Formatação do arquivo MD fatiado
            file_content = [
                f"# 📋 {story_type} {story_num}: {story_title}\n",
                f"> **Epic Mãe:** Epic {epic_num} ({epic_name})",
                f"> **Status no Backlog:** {status}",
                f"> **Gerado em:** {Path(__file__).name}\n",
                "## ⚙️ Especificações e Tarefas\n",
                story_description,
                "\n---\n",
                "## 📝 Área Pessoal do Agente",
                "> *IA, utilize este espaço caso precise fazer reflexões, checklists temporários ou anotar descobertas sobre este shard antes de alterar o código-fonte oficial. Ninguém apagará seu progresso aqui.*"
            ]
            
            # Limpa titulos de nomes ilegais pro OS
            safe_title = "".join(c if c.isalnum() else "-" for c in story_title).strip("-").lower()
            safe_title = re.sub(r"-+", "-", safe_title)
            
            filename = f"STORY-{story_num.replace('.', '-')}_{safe_title[:30]}.md"
            filepath = STORIES_DIR / filename
            
            filepath.write_text("\n".join(file_content), encoding="utf-8")
            total_stories += 1

    print(f"\n✅ Sharding Completo! {total_stories} arquivos gerados em {STORIES_DIR.relative_to(ROOT_DIR)}/")
    print("👉 A partir de agora, mencione '@nome-story' invés de 'Backlog' nos prompts para maior foco.")

if __name__ == "__main__":
    shard_backlog()
