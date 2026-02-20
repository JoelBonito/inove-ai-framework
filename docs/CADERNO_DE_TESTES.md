# Caderno de Testes - Inove AI Dev

> **Versão:** 1.0
> **Data:** 2026-02-19
> **Gerado por:** Antigravity
> **Baseado em:** docs/BACKLOG.md

---

## Resumo de Cobertura

| Categoria | Total | Pendentes | Aprovados | Falhas | N/A |
|-----------|-------|-----------|-----------|--------|-----|
| Módulo Autenticação | 3 | 3 | 0 | 0 | 0 |
| Módulo CRM (Pipeline) | 6 | 6 | 0 | 0 | 0 |
| Módulo Projetos | 6 | 6 | 0 | 0 | 0 |
| Módulo Assinaturas | 4 | 4 | 0 | 0 | 0 |
| Módulo Financeiro | 3 | 3 | 0 | 0 | 0 |
| Dashboard & Admin | 2 | 2 | 0 | 0 | 0 |
| **TOTAL** | **24** | **24** | **0** | **0** | **0** |

---

## Story 1.2: Autenticação e Segurança (P0)
> **Origem:** Epic 1
> **Critérios de Aceite:** 3

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 1.2.1 | Login com sucesso | Usuário está registrado | 1. Acessar /login <br> 2. Inserir email/senha corretos | Redireciona p/ dashboard, sessão criada | [ ] |
| 1.2.2 | Falha no login | Sem autenticação | 1. Acessar /login <br> 2. Inserir senha errada | Mostra toast de erro, permanece em /login | [ ] |
| 1.2.3 | Acesso não autorizado | Sessão expirada | 1. Tentar acessar /dashboard direto | Redireciona forçadamente para /login | [ ] |

---

## Story 2.1 & 2.2: Pipeline e CRM (P0)
> **Origem:** Epic 2
> **Critérios de Aceite:** 5

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 2.1.1 | Criar Lead | Logado no sistema | 1. Acessar CRM <br> 2. Preencher form novo deal | Card surge na coluna inicial do Kanban | [ ] |
| 2.1.2 | Form incomum | Logado no sistema | 1. Criar novo deal <br> 2. Omitir campo obrigatório | Validação falha (linha vermelha/toast) | [ ] |
| 2.2.1 | Mover deal | Deal existe | 1. Arrastar deal X para coluna Qualificação | Deal persiste na nova coluna após F5 | [ ] |
| 2.2.2 | Fechar Negócio | Deal existe | 1. Mover deal para Ganho | Abre Modal "Criar Projeto" magicamente | [ ] |
| 2.2.3 | Herdar dados | Modal aberto | 1. Checar campos pré-preenchidos no modal | Traz Nome e Empresa do Lead original | [ ] |

---

## Story 3.1 & 3.3: Gestão de Projetos (P0)
> **Origem:** Epic 3
> **Critérios de Aceite:** 5

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 3.1.1 | Criar Projeto Pós-Ganho | Deal está na calha de Venda | 1. Preencher formulário de sucesso no modal | Projeto aparece na tab de Projetos Ativos | [ ] |
| 3.1.2 | Editar Specs | Projeto criado | 1. Abrir tabs "Specs" <br> 2. Editar documento markdown | Salva corretamente. O texto visualiza renderizado | [ ] |
| 3.1.3 | Gravar Arquitetura | Projeto criado | 1. Ir em Aba "Arquitetura" <br> 2. Escolher Stack e Guardar | A aba sinaliza sucesso, os labels aparecem | [ ] |

---

## Story 3.4 & Epic 4: Transição Meu SaaS (P1)
> **Origem:** Epic 3 e Epic 4
> **Critérios de Aceite:** 5

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 3.4.1 | Fechar projeto e virar contrato | Projeto 100% | 1. Clicar "Tranferir p/ SaaS"<br>2. Setar MRR de $100 | Desaparece do Kanban de Build | [ ] |
| 4.1.1 | Listar Contrato | Contrato existe | 1. Navegar p/ Aba Meu SaaS | O contrato deve listar MRR de $100 e Vencimento | [ ] |
| 4.2.1 | Atualizar contrato | Contrato selecionado | 1. Editar MRR de $100 p/ $150 | Valor reflete instantaneamente na lista | [ ] |
| 4.2.2 | Cálculo de MRR global | Tela Meu SaaS | 1. Checar o topo da interface | Deve somar o valor agregado de todos contratos ativos | [ ] |

---

## Epic 5: Motor Financeiro (P1)
> **Origem:** Epic 5
> **Critérios de Aceite:** 4

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 5.1.1 | Inserir Lançamento Cashflow | Admin Acesso | 1. Ir p/ Aba Finance <br> 2. Lançar 100 EUR e 100 BRL | A grid deve refletir o lançamento simultaneamente | [ ] |
| 5.1.2 | Taxas de Conversão Exata | Taxa preestabelecida na config | 1. Inserir 2 Euros e observar grid BR | A cell exibe o calculado perfeitamente  | [ ] |
| 5.1.3 | Replicação Mensal | Existir mes preenchido | 1. Ir para Mês Anterior<br>2. Clicar "Clonar p/ Atual" | Toda grade deve copiar mantendo tags  | [ ] |

---

## Epic 6: Configurações & Dashboard Principal (P2)
> **Origem:** Epic 6
> **Critérios de Aceite:** 4

### Testes Funcionais
| # | Cenário | Pré-condição | Passos | Resultado Esperado | Status |
|---|---------|--------------|--------|-------------------|--------|
| 6.1.1 | Salvar Chave N8N/Gemini | Master View | 1. Configurações -> API Keys <br> 2. Digitar fake key e Salvar | O firestore deve gravar de modo seguro  | [ ] |
| 6.2.1 | Consistência do Painel Home | Leads e Projetos cadastrados | 1. Subir a Home <br> 2. Ler os 3 cards do topo | MRR e Projetos batem com os logs das abas secundárias | [ ] |

---

## Histórico de Execução

| Data | Executor | Pass | Fail | N/A | Notas |
|------|----------|------|------|-----|-------|
| 2026-02-19 | Antigravity | 0 | 0 | 0 | Geração inicial do caderno. |
