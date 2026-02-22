#!/usr/bin/env bash
# =============================================================================
# Caderno de Testes — CLI Interativo do Inove AI Framework v5.2.0
# =============================================================================
#
# Testa todos os comandos do CLI em modo non-interactive.
# O menu interativo (@clack/prompts) requer TTY, portanto os testes
# focam nos comandos diretos e validam outputs esperados.
#
# Uso: bash tests/test_cli_installer.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CLI="${SCRIPT_DIR}/bin/cli.js"
TEMP_BASE="/tmp/inove-cli-tests"
PASS=0
FAIL=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

# ─── Helpers ──────────────────────────────────────────────────────────────────

setup_temp() {
  local name="$1"
  local dir="${TEMP_BASE}/${name}"
  rm -rf "$dir"
  mkdir -p "$dir"
  echo "$dir"
}

setup_temp_git() {
  local name="$1"
  local dir
  dir=$(setup_temp "$name")
  git init "$dir" --quiet
  echo "$dir"
}

assert_contains() {
  local label="$1"
  local output="$2"
  local expected="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$output" | grep -qF -- "$expected"; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}[PASS]${RESET} ${label}"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}[FAIL]${RESET} ${label}"
    echo -e "        ${DIM}Esperado conter: \"${expected}\"${RESET}"
    echo -e "        ${DIM}Output: $(echo "$output" | head -3)${RESET}"
  fi
}

assert_not_contains() {
  local label="$1"
  local output="$2"
  local unexpected="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$output" | grep -qF -- "$unexpected"; then
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}[FAIL]${RESET} ${label}"
    echo -e "        ${DIM}NAO devia conter: \"${unexpected}\"${RESET}"
  else
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}[PASS]${RESET} ${label}"
  fi
}

assert_exit_code() {
  local label="$1"
  local actual="$2"
  local expected="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" -eq "$expected" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}[PASS]${RESET} ${label}"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}[FAIL]${RESET} ${label}"
    echo -e "        ${DIM}Exit code esperado: ${expected}, obtido: ${actual}${RESET}"
  fi
}

assert_file_exists() {
  local label="$1"
  local filepath="$2"
  TOTAL=$((TOTAL + 1))
  if [ -e "$filepath" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}[PASS]${RESET} ${label}"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}[FAIL]${RESET} ${label}"
    echo -e "        ${DIM}Ficheiro nao encontrado: ${filepath}${RESET}"
  fi
}

assert_symlink() {
  local label="$1"
  local linkpath="$2"
  TOTAL=$((TOTAL + 1))
  if [ -L "$linkpath" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}[PASS]${RESET} ${label}"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}[FAIL]${RESET} ${label}"
    echo -e "        ${DIM}Nao e symlink: ${linkpath}${RESET}"
  fi
}

assert_dir_not_exists() {
  local label="$1"
  local dirpath="$2"
  TOTAL=$((TOTAL + 1))
  if [ ! -d "$dirpath" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}[PASS]${RESET} ${label}"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}[FAIL]${RESET} ${label}"
    echo -e "        ${DIM}Diretorio ainda existe: ${dirpath}${RESET}"
  fi
}

# ─── Cleanup ──────────────────────────────────────────────────────────────────

rm -rf "$TEMP_BASE"
mkdir -p "$TEMP_BASE"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║  Caderno de Testes — CLI Inove AI Framework v5.2.0         ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# =============================================================================
# TESTE 1: Help
# =============================================================================

echo -e "${YELLOW}[Teste 1] Comando help${RESET}"

OUTPUT=$(node "$CLI" help 2>&1)
assert_contains "Mostra versao 5.2.0" "$OUTPUT" "5.2.0"
assert_contains "Mostra 'Assistente de Instalacao'" "$OUTPUT" "Assistente de Instalacao"
assert_contains "Mostra opcao install" "$OUTPUT" "install"
assert_contains "Mostra opcao update" "$OUTPUT" "update"
assert_contains "Mostra opcao validate" "$OUTPUT" "validate"
assert_contains "Mostra opcao uninstall" "$OUTPUT" "uninstall"
assert_contains "Mostra 'Gemini / Antigravity'" "$OUTPUT" "Gemini / Antigravity"
assert_not_contains "NAO mostra MCP" "$OUTPUT" "mcp-server"
echo ""

# =============================================================================
# TESTE 2: --help e -h (aliases)
# =============================================================================

echo -e "${YELLOW}[Teste 2] Aliases --help e -h${RESET}"

OUTPUT_HELP=$(node "$CLI" --help 2>&1)
OUTPUT_H=$(node "$CLI" -h 2>&1)
assert_contains "--help mostra ajuda" "$OUTPUT_HELP" "Assistente de Instalacao"
assert_contains "-h mostra ajuda" "$OUTPUT_H" "Assistente de Instalacao"
echo ""

# =============================================================================
# TESTE 3: Version
# =============================================================================

echo -e "${YELLOW}[Teste 3] Comando -v e --version${RESET}"

OUTPUT_V=$(node "$CLI" -v 2>&1)
OUTPUT_VER=$(node "$CLI" --version 2>&1)
assert_contains "-v mostra 5.2.0" "$OUTPUT_V" "5.2.0"
assert_contains "--version mostra 5.2.0" "$OUTPUT_VER" "5.2.0"
echo ""

# =============================================================================
# TESTE 4: Comando migrate (removido)
# =============================================================================

echo -e "${YELLOW}[Teste 4] Comando migrate (removido)${RESET}"

OUTPUT=$(node "$CLI" migrate 2>&1 || true)
EXIT_CODE=$?
assert_contains "Mostra mensagem de remocao" "$OUTPUT" "removido na v5.2"
assert_contains "Sugere update" "$OUTPUT" "update"
assert_contains "Sugere instalar do zero" "$OUTPUT" "instalar do zero"
echo ""

# =============================================================================
# TESTE 5: Comando desconhecido
# =============================================================================

echo -e "${YELLOW}[Teste 5] Comando desconhecido${RESET}"

OUTPUT=$(node "$CLI" foobar 2>&1 || true)
assert_contains "Mostra erro de comando desconhecido" "$OUTPUT" "Comando desconhecido"
assert_contains "Mostra help como fallback" "$OUTPUT" "Assistente de Instalacao"
echo ""

# =============================================================================
# TESTE 6: init (backward compat)
# =============================================================================

echo -e "${YELLOW}[Teste 6] Comando init (backward compat)${RESET}"

DIR=$(setup_temp_git "test-init")
OUTPUT=$(cd "$DIR" && node "$CLI" init 2>&1 || true)
assert_contains "Mostra aviso de deprecacao" "$OUTPUT" "obsoleto"
assert_contains "Sugere install" "$OUTPUT" "install"
# Even though deprecated, it should still run install
assert_file_exists ".agents/ criado pelo init" "$DIR/.agents"
echo ""

# =============================================================================
# TESTE 7: install completo
# =============================================================================

echo -e "${YELLOW}[Teste 7] Instalacao Completa (install)${RESET}"

DIR=$(setup_temp_git "test-install")
OUTPUT=$(cd "$DIR" && node "$CLI" install 2>&1)
EXIT_CODE=$?

assert_exit_code "Exit code 0" "$EXIT_CODE" 0
assert_contains "Mostra 'Instalando'" "$OUTPUT" "Instalando Inove AI Framework"
assert_contains "Mostra '.agents/ copiado'" "$OUTPUT" ".agents/ copiado"
assert_contains "Mostra 'Plataformas'" "$OUTPUT" "plataformas"
assert_contains "Mostra 'Instalacao concluida'" "$OUTPUT" "Instalacao concluida"

# Verificar estrutura
assert_file_exists ".agents/ existe" "$DIR/.agents"
assert_file_exists ".agents/ARCHITECTURE.md" "$DIR/.agents/ARCHITECTURE.md"
assert_file_exists ".agents/INSTRUCTIONS.md" "$DIR/.agents/INSTRUCTIONS.md"
assert_file_exists ".agents/.version" "$DIR/.agents/.version"
assert_file_exists ".agents/agents/" "$DIR/.agents/agents"
assert_file_exists ".agents/skills/" "$DIR/.agents/skills"
assert_file_exists ".agents/workflows/" "$DIR/.agents/workflows"
assert_file_exists ".agents/scripts/" "$DIR/.agents/scripts"
assert_file_exists ".agents/config/" "$DIR/.agents/config"

# Instruction files
assert_file_exists "CLAUDE.md na raiz" "$DIR/CLAUDE.md"
assert_file_exists "AGENTS.md na raiz" "$DIR/AGENTS.md"
assert_file_exists "GEMINI.md na raiz" "$DIR/GEMINI.md"

# Platform symlinks
assert_symlink ".claude/agents e symlink" "$DIR/.claude/agents"
assert_symlink ".claude/skills e symlink" "$DIR/.claude/skills"
assert_file_exists ".claude/project_instructions.md" "$DIR/.claude/project_instructions.md"
assert_symlink ".codex/agents e symlink" "$DIR/.codex/agents"
assert_symlink ".codex/skills e symlink" "$DIR/.codex/skills"
assert_symlink ".codex/prompts e symlink" "$DIR/.codex/prompts"

# Squads
assert_file_exists "squads/ existe" "$DIR/squads"
assert_file_exists "squads/.templates/ existe" "$DIR/squads/.templates"

# Version marker
VERSION_CONTENT=$(cat "$DIR/.agents/.version")
assert_contains ".version contem 5.2.0" "$VERSION_CONTENT" "5.2.0"

# .gitignore entries
if [ -f "$DIR/.gitignore" ]; then
  GITIGNORE=$(cat "$DIR/.gitignore")
  assert_contains ".gitignore tem .agents/locks/" "$GITIGNORE" ".agents/locks/"
  assert_contains ".gitignore tem .agents.bak/" "$GITIGNORE" ".agents.bak/"
fi
echo ""

# =============================================================================
# TESTE 8: install --force (sobrescrever)
# =============================================================================

echo -e "${YELLOW}[Teste 8] Install --force (sobrescrever instalacao existente)${RESET}"

# DIR still has the install from test 7
OUTPUT=$(cd "$DIR" && node "$CLI" install --force 2>&1)
EXIT_CODE=$?
assert_exit_code "Exit code 0 com --force" "$EXIT_CODE" 0
assert_contains "Instalacao funciona com --force" "$OUTPUT" "Instalacao concluida"
echo ""

# =============================================================================
# TESTE 9: install sem --force (erro)
# =============================================================================

echo -e "${YELLOW}[Teste 9] Install sem --force em diretorio com instalacao${RESET}"

OUTPUT=$(cd "$DIR" && node "$CLI" install 2>&1 || true)
assert_contains "Erro indicando .agents/ ja existe" "$OUTPUT" ".agents/ ja existe"
assert_contains "Sugere --force" "$OUTPUT" "--force"
echo ""

# =============================================================================
# TESTE 10: validate apos install
# =============================================================================

echo -e "${YELLOW}[Teste 10] Validate apos install${RESET}"

OUTPUT=$(cd "$DIR" && node "$CLI" validate 2>&1)
EXIT_CODE=$?
assert_exit_code "Exit code 0" "$EXIT_CODE" 0
assert_contains "Mostra [OK] para .agents/" "$OUTPUT" "[OK] .agents/ existe"
assert_contains "Mostra agents/" "$OUTPUT" "agents/"
assert_contains "Mostra skills/" "$OUTPUT" "skills/"
assert_contains "Mostra workflows/" "$OUTPUT" "workflows/"
assert_contains "Mostra CLAUDE.md" "$OUTPUT" "CLAUDE.md"
assert_contains "Mostra AGENTS.md" "$OUTPUT" "AGENTS.md"
assert_contains "Mostra GEMINI.md" "$OUTPUT" "GEMINI.md"
assert_contains "Mostra versao instalada" "$OUTPUT" "Versao instalada: 5.2.0"
assert_contains "Python 3 disponivel" "$OUTPUT" "Python 3 disponivel"
assert_contains "Git detectado" "$OUTPUT" "Repositorio Git"
assert_contains "Mostra Gemini / Antigravity" "$OUTPUT" "Gemini / Antigravity"
assert_not_contains "Zero falhas" "$OUTPUT" "[FALHA]"
echo ""

# =============================================================================
# TESTE 11: update
# =============================================================================

echo -e "${YELLOW}[Teste 11] Update (mesma versao)${RESET}"

OUTPUT=$(cd "$DIR" && node "$CLI" update 2>&1 || true)
assert_contains "Detecta mesma versao" "$OUTPUT" "versao mais recente"
echo ""

# =============================================================================
# TESTE 12: update --force
# =============================================================================

echo -e "${YELLOW}[Teste 12] Update --force${RESET}"

OUTPUT=$(cd "$DIR" && node "$CLI" update --force 2>&1)
EXIT_CODE=$?
assert_exit_code "Exit code 0" "$EXIT_CODE" 0
assert_contains "Mostra 'Atualizando'" "$OUTPUT" "Atualizando"
assert_contains "Backup criado" "$OUTPUT" "Backup criado"
assert_contains "Atualizado com sucesso" "$OUTPUT" "atualizado"

# Verify install is intact after update
assert_file_exists ".agents/ existe apos update" "$DIR/.agents"
assert_file_exists "CLAUDE.md preservado" "$DIR/CLAUDE.md"
assert_symlink "Symlinks recriados" "$DIR/.claude/agents"
echo ""

# =============================================================================
# TESTE 13: uninstall --force
# =============================================================================

echo -e "${YELLOW}[Teste 13] Uninstall --force${RESET}"

DIR_UNINSTALL=$(setup_temp_git "test-uninstall")
# First install
cd "$DIR_UNINSTALL" && node "$CLI" install 2>&1 > /dev/null

# Then uninstall
OUTPUT=$(cd "$DIR_UNINSTALL" && node "$CLI" uninstall --force 2>&1)
EXIT_CODE=$?
assert_exit_code "Exit code 0" "$EXIT_CODE" 0
assert_contains "Mostra 'Desinstalacao concluida'" "$OUTPUT" "Desinstalacao concluida"
assert_dir_not_exists ".agents/ removido" "$DIR_UNINSTALL/.agents"
assert_dir_not_exists "squads/ removido" "$DIR_UNINSTALL/squads"
echo ""

# =============================================================================
# TESTE 14: validate em diretorio vazio
# =============================================================================

echo -e "${YELLOW}[Teste 14] Validate em diretorio sem instalacao${RESET}"

DIR_EMPTY=$(setup_temp "test-empty")
OUTPUT=$(cd "$DIR_EMPTY" && node "$CLI" validate 2>&1 || true)
assert_contains "Detecta .agents/ ausente" "$OUTPUT" "NAO encontrado"
echo ""

# =============================================================================
# TESTE 15: install em diretorio sem git
# =============================================================================

echo -e "${YELLOW}[Teste 15] Install em diretorio sem git${RESET}"

DIR_NOGIT=$(setup_temp "test-no-git")
OUTPUT=$(cd "$DIR_NOGIT" && node "$CLI" install 2>&1)
EXIT_CODE=$?
assert_exit_code "Exit code 0 sem git" "$EXIT_CODE" 0
assert_contains "Instalacao funciona sem git" "$OUTPUT" "Instalacao concluida"
assert_file_exists ".agents/ criado sem git" "$DIR_NOGIT/.agents"
assert_not_contains "Nao tenta instalar git hooks" "$OUTPUT" "Git hooks instalados"
echo ""

# =============================================================================
# TESTE 16: Menu interativo em non-TTY
# =============================================================================

echo -e "${YELLOW}[Teste 16] Menu interativo em terminal non-TTY${RESET}"

OUTPUT=$(echo "" | node "$CLI" 2>&1 || true)
assert_contains "Detecta terminal non-interativo" "$OUTPUT" "nao-interativo"
echo ""

# =============================================================================
# TESTE 17: Conteudo dos ficheiros de instrucao
# =============================================================================

echo -e "${YELLOW}[Teste 17] Conteudo dos ficheiros copiados${RESET}"

# Use the DIR from test 7 (has full install)
CLAUDE_SIZE=$(wc -c < "$DIR/CLAUDE.md" | tr -d ' ')
AGENTS_SIZE=$(wc -c < "$DIR/AGENTS.md" | tr -d ' ')
GEMINI_SIZE=$(wc -c < "$DIR/GEMINI.md" | tr -d ' ')

TOTAL=$((TOTAL + 1))
if [ "$CLAUDE_SIZE" -gt 10000 ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}[PASS]${RESET} CLAUDE.md tem conteudo completo (${CLAUDE_SIZE} bytes)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}[FAIL]${RESET} CLAUDE.md muito pequeno (${CLAUDE_SIZE} bytes — esperado >10000)"
fi

TOTAL=$((TOTAL + 1))
if [ "$AGENTS_SIZE" -gt 5000 ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}[PASS]${RESET} AGENTS.md tem conteudo completo (${AGENTS_SIZE} bytes)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}[FAIL]${RESET} AGENTS.md muito pequeno (${AGENTS_SIZE} bytes — esperado >5000)"
fi

TOTAL=$((TOTAL + 1))
if [ "$GEMINI_SIZE" -gt 5000 ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}[PASS]${RESET} GEMINI.md tem conteudo completo (${GEMINI_SIZE} bytes)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}[FAIL]${RESET} GEMINI.md muito pequeno (${GEMINI_SIZE} bytes — esperado >5000)"
fi

# Pointer file content
POINTER_CONTENT=$(cat "$DIR/.claude/project_instructions.md")
assert_contains "Pointer refere CLAUDE.md" "$POINTER_CONTENT" "CLAUDE.md"
assert_contains "Pointer menciona 'pointer'" "$POINTER_CONTENT" "pointer"
echo ""

# =============================================================================
# TESTE 18: Symlinks apontam para caminhos corretos
# =============================================================================

echo -e "${YELLOW}[Teste 18] Symlinks apontam para caminhos corretos${RESET}"

CLAUDE_AGENTS_TARGET=$(readlink "$DIR/.claude/agents")
CLAUDE_SKILLS_TARGET=$(readlink "$DIR/.claude/skills")
CODEX_AGENTS_TARGET=$(readlink "$DIR/.codex/agents")
CODEX_SKILLS_TARGET=$(readlink "$DIR/.codex/skills")
CODEX_PROMPTS_TARGET=$(readlink "$DIR/.codex/prompts")

assert_contains ".claude/agents -> ../.agents/agents" "$CLAUDE_AGENTS_TARGET" "../.agents/agents"
assert_contains ".claude/skills -> ../.agents/skills" "$CLAUDE_SKILLS_TARGET" "../.agents/skills"
assert_contains ".codex/agents -> ../.agents/agents" "$CODEX_AGENTS_TARGET" "../.agents/agents"
assert_contains ".codex/skills -> ../.agents/skills" "$CODEX_SKILLS_TARGET" "../.agents/skills"
assert_contains ".codex/prompts -> ../.agents/workflows" "$CODEX_PROMPTS_TARGET" "../.agents/workflows"
echo ""

# =============================================================================
# TESTE 19: Contagem de componentes
# =============================================================================

echo -e "${YELLOW}[Teste 19] Contagem de componentes instalados${RESET}"

AGENT_COUNT=$(ls "$DIR/.agents/agents/" | wc -l | tr -d ' ')
SKILL_COUNT=$(ls -d "$DIR/.agents/skills/"*/ 2>/dev/null | wc -l | tr -d ' ')
WORKFLOW_COUNT=$(ls "$DIR/.agents/workflows/" | wc -l | tr -d ' ')
SCRIPT_COUNT=$(ls "$DIR/.agents/scripts/" | wc -l | tr -d ' ')

TOTAL=$((TOTAL + 1))
if [ "$AGENT_COUNT" -ge 21 ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}[PASS]${RESET} Agentes: ${AGENT_COUNT} (esperado >= 21)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}[FAIL]${RESET} Agentes: ${AGENT_COUNT} (esperado >= 21)"
fi

TOTAL=$((TOTAL + 1))
if [ "$SKILL_COUNT" -ge 41 ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}[PASS]${RESET} Skills: ${SKILL_COUNT} (esperado >= 41)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}[FAIL]${RESET} Skills: ${SKILL_COUNT} (esperado >= 41)"
fi

TOTAL=$((TOTAL + 1))
if [ "$WORKFLOW_COUNT" -ge 22 ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}[PASS]${RESET} Workflows: ${WORKFLOW_COUNT} (esperado >= 22)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}[FAIL]${RESET} Workflows: ${WORKFLOW_COUNT} (esperado >= 22)"
fi

TOTAL=$((TOTAL + 1))
if [ "$SCRIPT_COUNT" -ge 22 ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}[PASS]${RESET} Scripts: ${SCRIPT_COUNT} (esperado >= 22)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}[FAIL]${RESET} Scripts: ${SCRIPT_COUNT} (esperado >= 22)"
fi
echo ""

# =============================================================================
# TESTE 20: Idempotencia do validate
# =============================================================================

echo -e "${YELLOW}[Teste 20] Validate nao altera ficheiros${RESET}"

BEFORE=$(find "$DIR/.agents" -type f | sort | md5)
cd "$DIR" && node "$CLI" validate 2>&1 > /dev/null
AFTER=$(find "$DIR/.agents" -type f | sort | md5)

TOTAL=$((TOTAL + 1))
if [ "$BEFORE" = "$AFTER" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}[PASS]${RESET} Validate nao modificou ficheiros"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}[FAIL]${RESET} Validate modificou ficheiros"
fi
echo ""

# =============================================================================
# Cleanup
# =============================================================================

rm -rf "$TEMP_BASE"

# =============================================================================
# Summary
# =============================================================================

echo -e "${BOLD}══════════════════════════════════════════════════════════════${RESET}"
echo ""
if [ "$FAIL" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}TODOS OS TESTES PASSARAM${RESET}"
else
  echo -e "  ${RED}${BOLD}ALGUNS TESTES FALHARAM${RESET}"
fi
echo ""
echo -e "  Total:  ${TOTAL}"
echo -e "  ${GREEN}Passou: ${PASS}${RESET}"
echo -e "  ${RED}Falhou: ${FAIL}${RESET}"
echo ""
echo -e "${BOLD}══════════════════════════════════════════════════════════════${RESET}"
echo ""

exit "$FAIL"
