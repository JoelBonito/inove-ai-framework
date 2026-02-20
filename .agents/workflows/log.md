---
description: Gerencia logs de sessão de trabalho. Sub-comandos: start, end, show. Registra atividades e gera resumo diário.
---

# Workflow: /log

> **Propósito:** Registrar sessões de trabalho de forma manual e consistente, criando relatórios diários estruturados.

## Regras Críticas

1. **FUSO HORÁRIO** — Sempre usar America/Sao_Paulo para registro de horários.
2. **AGUARDAR RESPOSTA** — No `/log end`, perguntar atividades e aguardar resposta do usuário antes de fechar.
3. **ESTRUTURA CONSISTENTE** — Manter o formato padrão de log diário (data, sessões, resumo).
4. **ARQUIVO POR DIA** — Um único arquivo por dia no formato `AAAA-MM-DD.md`.

## Sub-comandos

| Comando | Descrição |
|---------|-----------|
| `/log start` | Inicia uma nova sessão de trabalho |
| `/log end` | Encerra a sessão atual e registra atividades |
| `/log show` | Exibe o log do dia atual |
| `/log summary` | Gera resumo semanal/mensal |

---

## Estrutura de Arquivos

```
docs/
└── 08-Logs-Sessoes/
    ├── README.md           ← Índice de logs
    └── {ANO}/
        └── {AAAA-MM-DD}.md ← Log diário
```

---

## Fluxo: `/log start`

### Passo 1: Obter Data/Hora Atual
- Data: `AAAA-MM-DD`
- Hora: `HH:MM` (24h, America/Sao_Paulo)

### Passo 2: Verificar/Criar Arquivo do Dia
- Caminho: `docs/08-Logs-Sessoes/{ANO}/{AAAA-MM-DD}.md`
- Se não existir, criar com template:

```markdown
# LOG DIÁRIO — AAAA-MM-DD
- Projeto: {nome do projeto}
- Fuso: America/Sao_Paulo

## Sessões

1. HH:MM — ??:?? (??:??)
   - Atividades:
     - [sessão em andamento...]

## Resumo do Dia
- Início do dia: HH:MM
- Fim do dia: ??:??
- Tempo total: ??:??
```

### Passo 3: Adicionar Nova Sessão
Se o arquivo já existe, adicionar nova entrada:

```markdown
N. HH:MM — ??:?? (??:??)
   - Atividades:
     - [sessão em andamento...]
```

### Passo 4: Confirmar ao Usuário

```markdown
✅ **Sessão iniciada!**

📅 Data: AAAA-MM-DD
⏰ Início: HH:MM
📄 Arquivo: docs/08-Logs-Sessoes/{ANO}/{AAAA-MM-DD}.md

Quando terminar, use `/log end` para registrar as atividades.
```

---

## Fluxo: `/log end`

### Passo 1: Perguntar Atividades

```markdown
📝 **O que foi feito nesta sessão?**

Liste as atividades realizadas (pode ser em formato livre, vou estruturar):
```

**AGUARDE** a resposta do usuário.

### Passo 2: Atualizar Arquivo do Dia

1. Localizar a sessão em andamento (última com `??:??`)
2. Substituir hora de fim com hora atual
3. Calcular duração (fim - início)
4. Adicionar atividades formatadas como bullets

### Passo 3: Atualizar Resumo do Dia

```markdown
## Resumo do Dia
- Início do dia: {menor hora de início}
- Fim do dia: {maior hora de fim}
- Tempo total: {soma de todas as durações}
```

### Passo 4: Seção Opcional de Arquivos

Se houver arquivos criados/modificados durante a sessão, adicionar:

```markdown
## Arquivos Criados/Modificados

### Novos Arquivos:
- `path/to/file1.tsx`
- `path/to/file2.ts`

### Arquivos Modificados:
- `path/to/existing.tsx` - Descrição da mudança
```

### Passo 5: Confirmar ao Usuário

```markdown
✅ **Sessão encerrada!**

📅 Data: AAAA-MM-DD
⏰ Período: HH:MM — HH:MM (XX:XX)
📊 Tempo total do dia: XX:XX

📄 Log atualizado: docs/08-Logs-Sessoes/{ANO}/{AAAA-MM-DD}.md
```

---

## Fluxo: `/log show`

Exibe o conteúdo do log do dia atual de forma resumida:

```markdown
📋 **Log de Hoje (AAAA-MM-DD)**

**Sessões:**
1. 09:00 — 11:30 (02:30) - Setup inicial, configuração de ambiente
2. 14:00 — 16:45 (02:45) - Implementação do módulo de autenticação

**Tempo Total:** 05:15
```

---

## Fluxo: `/log summary`

Gera um resumo consolidado:

```markdown
📊 **Resumo Semanal (DD/MM — DD/MM)**

| Dia | Sessões | Tempo |
|-----|---------|-------|
| Seg | 3 | 05:30 |
| Ter | 2 | 04:15 |
| Qua | 4 | 06:00 |
| **Total** | **9** | **15:45** |
```

---

## Formato do Log Diário (Completo)

```markdown
# LOG DIÁRIO — AAAA-MM-DD
- Projeto: {nome}
- Fuso: America/Sao_Paulo

## Sessões

1. HH:MM — HH:MM (HH:MM)
   - Atividades:
     - Atividade 1
     - Atividade 2
     - **FIX**: Descrição do bug corrigido
     - **Início do Epic N:** Nome do Epic

2. HH:MM — HH:MM (HH:MM)
   - Atividades:
     - Atividade 3

## Resumo do Dia
- Início do dia: HH:MM
- Fim do dia: HH:MM
- Tempo total: HH:MM

## Arquivos Criados/Modificados

### Novos Arquivos:
- `path/file.tsx`

### Arquivos Modificados:
- `path/file.tsx` - Descrição
```

---

## Integração com Outros Workflows

Ao usar `/log end`, sugerir:

```markdown
💡 **Dica:** Execute `/track` para atualizar a barra de progresso do projeto.
```

---

## Exemplo de Uso

```
Usuário: /log start
Agente: ✅ Sessão iniciada! (16:30)

[... trabalho acontece ...]

Usuário: /log end
Agente: 📝 O que foi feito nesta sessão?

Usuário: Implementei o login com Firebase, criei o componente AuthForm, e corrigi bug de validação

Agente: ✅ Sessão encerrada! (18:45)
        Duração: 02:15
        Log atualizado.
```
