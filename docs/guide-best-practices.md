# 🚀 Guia Prático: Como Trabalhar com o Antigravity Kit

Este guia define o fluxo de trabalho ideal para maximizar a produtividade e qualidade usando o framework Antigravity.

---

## 💎 A Regra de Ouro

> **"Planeje Primeiro, Codifique Depois."**

O erro mais comum é pular direto para o código. O framework pune a pressa e recompensa o planejamento.
**Sempre comece com um plano (`/plan`) para qualquer tarefa que envolva mais de 1 arquivo.**

---

## 1. Fluxos de Trabalho Principais

Escolha o fluxo baseado no seu objetivo atual:

### 🌟 A. Criar Projeto do Zero (`/create`)
Use quando: O diretório está vazio ou você quer iniciar um novo app.

1.  **Comando**: Execute `/create "nome do app e descrição"`
2.  **Agente**: O `project-planner` assumirá.
3.  **Ação**: Ele vai entrevistar você (Gate Socrático). Responda às perguntas.
4.  **Resultado**: Ele cria um `PLAN-novo-app.md`.
5.  **Aprovação**: Você lê o plano e digita "Aprovo".
6.  **Execução**: O `orchestrator` chama os especialistas (`frontend`, `backend`, `database`) para executar o plano.

### ⚡ B. Criar Nova Feature (`/enhance` + `/plan`)
Use quando: O projeto já existe e você quer adicionar algo novo (ex: "Adicionar Dark Mode").

1.  **Planejamento**: `/plan "adicionar dark mode"`
    *   O `project-planner` analisa o código atual e cria `docs/PLAN-dark-mode.md`.
2.  **Revisão**: Verifique se ele considerou todas as dependências.
3.  **Execução**:
    *   Se for simples (só CSS): Peça "Implemente o plano PLAN-dark-mode.md".
    *   Se for complexo (CSS + Banco + User Prefs): `/orchestrate "Implementar dark mode seguindo PLAN-dark-mode.md"`

### 🐛 C. Resolver Bugs (`/debug`)
Use quando: Algo quebrou e você não sabe a causa raiz.

1.  **Comando**: `/debug "descrição do erro e sintomas"`
2.  **Agente**: O `debugger` assume.
3.  **Processo**: Ele vai seguir o método científico (Hipótese -> Teste -> Conclusão).
4.  **Correção**: Ele propõe a correção e o teste de regressão.

### 🚀 D. Deploy em Produção (`/deploy`)
Use quando: O código está pronto para ir ao ar.

1.  **Comando**: `/deploy`
2.  **Checklist**: O `devops-engineer` roda scripts de verificação (testes, lint, security).
3.  **Ação**: Se tudo passar, ele executa o comando de build e deploy configurado.

---

## 2. Quando usar o `/orchestrate`?

O comando `/orchestrate` é sua "arma secreta" para tarefas complexas. Use-o quando a tarefa tocar em **mais de uma área** (Front + Back, Back + Banco, etc.).

**Exemplo de uso:**
> "Preciso criar um painel de admin (Frontend) que liste usuários do banco (Backend/DB) e permita banir usuários (Segurança)."

Se você pedir isso diretamente a um agente comum, ele pode se perder.
**Com `/orchestrate`**: O `orchestrator` divide a tarefa:
1.  `database-architect` cria a query.
2.  `backend-specialist` cria a API.
3.  `frontend-specialist` cria a tela.
4.  `security-auditor` verifica se a rota de banir está segura.

---

## 3. Comandos Essenciais do Dia a Dia

| Comando | Para que serve | Dica Pro |
| :--- | :--- | :--- |
| **`/status`** | Vê o estado atual do projeto | Use ao voltar de uma pausa para lembrar onde parou. |
| **`/preview`** | Sobe o servidor local | Use `/preview start` para ver seu app rodando. |
| **`/test`** | Roda testes | Use `/test "nome-arquivo"` para testar só o que mexeu. |
| **`/ui-ux-pro-max`** | Gera Design System | Use no início para definir cores e fontes profissionais. |

---

## 4. O Checklist da Vitória (Verificação)

Antes de considerar uma tarefa "pronta", garanta que os scripts de verificação passaram. O framework tem scripts automáticos para isso:

1.  **Lint e Tipos**: `python .agent/skills/lint-and-validate/scripts/lint_runner.py .`
2.  **Segurança**: `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
3.  **Testes**: `/test`

**Se os scripts passarem, seu código é sólido.**
