# Backlog do Produto: Inove AI Dev

**Última Atualização:** 2026-01-26
**Status Geral:** 6 Epics | 100% Concluído ✅
**Meta:** MVP "End-to-End" (Pipeline -> Projeto -> SaaS)

---

## Epic 1: Core & Infraestrutura (P0) [OWNER: claude_code] [MODEL: opus-4-5]
*Fundação do sistema, autenticação e layout base.*

- [x] **Story 1.1:** Setup Inicial e Design System
  - [x] Implementar tema "Deep Space" (Tailwind tokens).
  - [x] Criar componentes base (Buttons, Cards, Inputs) no padrão Shadcn/UI customizado.
  - [x] Configurar Layout Global (Sidebar Fixa + Topbar + Main Area).
- [x] **Story 1.2:** Autenticação e Segurança
  - [x] Configurar Firebase Auth (Login/Logout).
  - [x] Implementar Protected Routes (React Router).
  - [x] Definir Firestore Rules básicas (Isolamento por userId).

---

## Epic 2: Pipeline de Vendas (CRM) (P0) [OWNER: claude_code] [MODEL: opus-4-5]
*Gestão de Leads e conversão em projetos.*

- [x] **Story 2.1:** Gestão de Clientes
  - [x] CRUD de Clientes (Empresa + Interlocutores).
  - [x] Listagem de clientes com filtros básicos.
- [x] **Story 2.2:** Kanban de Deals
  - [x] Criar quadro Kanban (Leads, Qualificação, Proposta, Negociação, Fechado/Ganho, Perdido).
  - [x] Implementar Drag & Drop para mover cards de estágio.
  - [x] Modal de "Novo Deal" e Edição rápida.
- [x] **Story 2.3:** Conversão Deal -> Projeto
  - [x] Automatismo: Ao mover para "Ganho", abrir modal "Criar Projeto".
  - [x] Herdar dados do cliente para o novo projeto draft.

---

## Epic 3: Gestão de Projetos (Execution) (P0) [OWNER: claude_code] [MODEL: opus-4-5]
*O coração do sistema. Gestão técnica e financeira da entrega.*

- [x] **Story 3.1:** Dashboard do Projeto (7-Tabs)
  - [x] Implementar navegação interna do projeto (Visão Geral, Specs, Arq, etc).
  - [x] Aba **Visão Geral**: Header com status, progresso e próximas ações.
- [x] **Story 3.2:** Orçamentação Manual
  - [x] Aba **Orçamento**: Formulário de custos (Horas, Infra, APIs).
  - *Nota: Integração com IA adiada para pós-MVP.*
- [x] **Story 3.3:** Especificação e Arquitetura
  - [x] Aba **Specs**: Editor Markdown para escopo e features.
  - [x] Aba **Arquitetura**: Editor visual/lista para Stack, DB e APIs.
- [x] **Story 3.4:** Transição para SaaS
  - [x] Wizard de conversão: Ao "Marcar como Ganho", abre modal para definir MRR e criar contrato.
  - [x] Projeto sai do Kanban e aparece em "Meu SaaS" como contrato ativo.

---

## Epic 4: Módulo Meu SaaS (Recorrência) (P1) [OWNER: claude_code] [MODEL: sonnet]
*Gestão de contratos ativos e LTV.*

- [x] **Story 4.1:** Listagem de Assinaturas
  - [x] Tabela de contratos ativos (Cliente, Valor, Vencimento).
  - [x] Filtros por status (Ativo, Churn, Atrasado).
- [x] **Story 4.2:** Gestão do Contrato
  - [x] Detalhe do contrato: Histórico de pagamentos e dados de cobrança.
  - [x] Edição de valor mensal e data de cobrança.
  - [x] **BONUS:** Aba Assinantes com cálculo automático de MRR.

---

## Epic 5: Financeiro Unificado (P1) [OWNER: antigravity] [MODEL: gemini-2.0]
*Visão consolidada de caixa.*

- [x] **Story 5.1:** Motor Financeiro
  - [x] Página Finance com abas (Vendas, Despesas PT, Despesas BR).
  - [x] Matriz Excel-like para lançamentos.
  - [x] Suporte bi-moeda (EUR/BRL) com taxa de câmbio.
  - [x] Replicação de mês anterior.
  - *Nota: Stories 5.1/5.2 originais foram refatoradas para o Motor Financeiro personalizado.*

---

## Epic 6: Configurações & Dashboard (P2) [OWNER: antigravity] [MODEL: gemini-2.0]
*Configurações do sistema e dashboard principal.*

- [x] **Story 6.1:** Configurações do Sistema
  - [x] Gestão de Perfil Admin.
  - [x] Gerenciamento de Chaves de API (Gemini, etc).
- [x] **Story 6.2:** Dashboard Principal (Home)
  - [x] Cards de KPI: MRR, Projetos Ativos, Pipeline Value.
  - [x] Gráfico de tendência de receita.

---

## Resumo de Progresso

| Epic | Stories | Concluídas | Status |
|------|---------|------------|--------|
| **1. Core & Infra** | 2 | 2 | 🟢 DONE (100%) |
| **2. Pipeline (CRM)** | 3 | 3 | 🟢 DONE (100%) |
| **3. Projetos** | 4 | 4 | 🟢 DONE (100%) |
| **4. Meu SaaS** | 2 | 2 | 🟢 DONE (100%) |
| **5. Financeiro** | 1 | 1 | 🟢 DONE (100%) |
| **6. Configurações** | 2 | 2 | 🟢 DONE (100%) |
| **TOTAL** | **14** | **14** | **100%** |
