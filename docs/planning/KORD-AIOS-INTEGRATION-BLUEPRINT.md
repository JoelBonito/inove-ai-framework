# Kord AIOS Integration Blueprint — Implementações Futuras para o MCP Server

> **Status:** Visão Arquitetural Futura
> **Prioridade:** Media/Longo Prazo (Fase Opcional Pós-MVP do MCP Server)
> **Data de Criação:** 2026-02-20
> **Inspiração Direta:** Plataforma Kord AIOS (Engine de Plugin baseado em OpenCode/LSP)

---

## 1. Visão Geral (Por que integrar?)

Após a análise da arquitetura do [Kord AIOS](https://github.com/GDSDN/kord-aios), ficou evidente que, embora o **Inove AI Framework** brilhe pela gestão de projeto engenhada em Markdown, o Kord possui recursos técnicos muito valiosos na manipulação direta de código e paralelismo.

A nossa estratégia não será transformar o Inove em um executor pesado (mantendo as nossas dependências apenas no Python 3), mas sim extrair os "Superpoderes" do Kord diretamente para o projeto do nosso futuro **Inove MCP Server**. Desta forma, mantemos o Inove universal, portátil, e o MCP ganha novas ferramentas matadoras para oferecer às IAs.

---

## 2. Abstraindo o Poder do Kord: Top 3 Recursos a Integrar no MCP

### 2.1. LSP (Language Server Protocol) e AST-Grep como Ferramentas (Tools MCP)
O Kord brilha não ao editar código "como um arquivo de texto normal", mas entendendo a sua árvore de sintaxe abstrata (AST).

**A Implementação no nosso MCP Server:**
Adicionar ao `src/core/tools.ts` as ferramentas derivadas de LSP:
- `lsp_diagnostics`: Permitir a IA "ver" linhas sublinhadas de vermelho com erros de código TypeScript/React *antes* de finalizar a tarefa.
- `lsp_rename_symbol`: Em vez da IA usar o script pesado de sed/replace, ela fará um rename global garantido através de AST-Grep.
- `lsp_find_references`: A IA pode saber instantaneamente onde aquela função está sendo chamada no código sem ter que fazer full-text search no diretório.

### 2.2. Executores em Background (Hooks Transparentes no MCP)
Como o Kord delega pequenas pesquisas a LLMs baratos (ex: Flash, Grok) enquanto o orquestrador (Claude) lida com a lógica principal, o Inove MCP pode ganhar esse superpoder de roteamento transparente.

**A Implementação no nosso MCP Server:**
Adicionar Hooks (Interceptadores) de Lifecycle dentro do Node.js/MCP:
- `Auto-Context Injector Hook`: Sempre que a IA pedir a leitura de um arquivo X, o MCP silenciosamente também empacota (injects) os arquivos associados ou README da mesma pasta sem a IA "perder tokens" pedindo tudo, garantindo que o Claude e Codex não reincidam nos mesmos bugs.
- `Auto-Grep Truncator Hook`: Se uma pesquisa global ou saída de terminal tiver 20.000 linhas, quebrar automaticamente em resumos inteligentes ou exibir apenas um excerto de Preview sem estourar a Context Window do Claude Codex.

### 2.3. Anti-Padrões Proibidos (Code Guard / Validator Hooks)
O Kord possui um sistema duro de validação para a IA. Se a IA tenta colocar comentários genéricos ("Here is your updated code") e apagar o resto original de um grande arquivo, ele bloqueia!

**A Implementação no nosso MCP Server:**
- Adicionar ao nosso Workflow e Skills o validador "Comment Checker".
- Quando o `finish_task.py` for acionado ou o MCP realizar um `diff` no código, rejeitar a submissão e pedir para a IA tentar colocar apenas as lógicas novas, validando uma política firme de `"No // ... rest of code"` e mantendo as estruturas das dependências intocáveis.

---

## 3. Road-map (Casamento de Plataformas)

Esta arquitetura não fará parte do "MVP do MCP-Server", que é atualmente o encapsulamento dos nossos 21 agentes e 41 skills no SDK 1.2+ do TypeScript. 

Ele servirá como **"Fase 4: Code Engine Intelligence"**:
- **Passo A:** Pesquisa de bibliotecas nativas de Node-AST ou `ast-grep` compatíveis com Windows e MacOS para injetar no `package.json` do `@inove-ai/mcp-server`.
- **Passo B:** Criação dos 4 conectores vitais LSP (Rename, Definition, Diagnostics e References).
- **Passo C:** Atualizar a nossa documentação do `AGENTS.md` e `CLAUDE.md` ensinando as IAs ativas (Antigravity/Codex/Claude) que elas detém agora os poderes de um AST local através da Tool `lsp_X`.

---
*Gerado por @orchestrator na data da exploração da v1 Kord AIOS.*
