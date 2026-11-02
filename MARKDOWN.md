# MARKDOWN.md — Convenções da documentação

**Objetivo:** manter os documentos do projeto consistentes, curtos e fáceis de
revisar por pessoas e por agentes de IA.
**Versão:** 1.0 — 2026-11-01

---

## 1. Mapa da documentação

| Documento | Para quê | Público |
| --- | --- | --- |
| [README.md](./README.md) | visão geral, stack, rotas e orçamentos | todos |
| [PRD.md](./PRD.md) | requisitos de produto e critérios de aceite | produto/engenharia |
| [MANUAL-DO-USUARIO.md](./MANUAL-DO-USUARIO.md) | passo a passo para quem usa | usuários e suporte |
| [LGPD.md](./LGPD.md) | dados pessoais, bases legais e direitos | jurídico/privacidade |
| [PRODUCTION-GUIDE.md](./PRODUCTION-GUIDE.md) | deploy, operação e incidentes | DevOps |
| [DOCUMENTACAO-TECNICA.md](./DOCUMENTACAO-TECNICA.md) | arquitetura, banco, API e PIX | engenharia |
| [DOCUMENTACAO-DE-SEGURANCA.md](./DOCUMENTACAO-DE-SEGURANCA.md) | modelo de ameaças e controles | segurança/engenharia |
| [AGENTS.md](./AGENTS.md) | contexto mínimo para agentes de IA | agentes |
| [DEPLOY.md](./DEPLOY.md) | deploy rápido na Vercel | DevOps |

> **Regra:** cada assunto tem um dono. Não duplique tabela de variáveis em cinco
> arquivos — referencie o documento dono.

## 2. Nomes de arquivos

- Markdown em **MAIÚSCULAS** quando for documento de raiz (`README`, `PRD`).
- Use **hífen**, não espaço: `MANUAL-DO-USUARIO.md`.
- Sem acentos no nome do arquivo (`DOCUMENTACAO`, não `DOCUMENTAÇÃO`).
- Um arquivo por assunto; se passar de ~250 linhas, divida por seção.

## 3. Estrutura padrão

```markdown
# Título

**Produto:** …  **Versão:** 1.0  **Data:** AAAA-MM-DD  **Público:** …

---

## 1. Contexto
## 2. …
## N. Referências
```

- Um único `#` (H1) por arquivo.
- Seções numeradas (`## 1.`) em documentos longos.
- Não pule níveis (`##` → `####`).
- Linha em branco antes e depois de tabela, lista e bloco de código.

## 4. Tabelas

Use tabelas para comparações, não para parágrafos.

```markdown
| Coluna | O que significa |
| --- | --- |
| `status` | `pendente`, `aprovado`, `rejeitado`, `suspenso` |
```

- Sempre alinhe o separador (`| --- |`).
- Código inline entre crases: `NEXT_PUBLIC_SUPABASE_URL`.
- Evite célula com quebra de linha.

## 5. Código e comandos

- Bloco com linguagem: ` ```bash `, ` ```ts `, ` ```sql `, ` ```json `.
- Comandos longos em uma linha por comando; nada de `$` no início.
- Caminhos Windows com barras invertidas dentro de crase: `D:\...\ListadoBem`.
- Nunca cole segredo real em exemplo; use `sb_secret_...`, `SEU-PROJETO`.

## 6. Links

- Relativo, com `./`: `[LGPD.md](./LGPD.md)`.
- Link para código com caminho relativo: `[validação](./lib/validation.ts)`.
- Links externos com `https://` e texto descritivo (evite “clique aqui”).
- Âncoras em minúsculas: `#3-regras-de-negócio`.

## 7. Destaques e avisos

Use blockquote para avisos, com rótulo em negrito:

```markdown
> **Atenção:** a plataforma não processa pagamentos.
```

Tipos aceitos: **Atenção**, **Importante**, **Dica**, **Nota**, **TODO**.
Não use emoji como sinalização (quebra leitores de tela e diffs).

## 8. Listas e checklists

- `-` para listas; `1.` para passos ordenados.
- Checklist só quando houver acompanhamento real: `- [ ]` / `- [x]`.
- Um item = uma ideia; evite parágrafos dentro de item.

## 9. Linguagem

- Português do Brasil, voz ativa, frases curtas.
- “A plataforma não processa pagamentos” — nunca “a plataforma não processa
  pagamentos, exceto PIX” sem explicar a contribuição facultativa.
- Prefira “você” no manual e impessoal na documentação técnica.
- Datas em `AAAA-MM-DD`; valores em R$ quando monetários.
- Evite gírias, superlativos e promessas não implementadas (“em breve” só com
  aviso explícito).

## 10. Template para novo documento

```markdown
# Título do documento

**Produto:** Listado Bem / Rede de Apoio
**Versão:** 1.0
**Data:** AAAA-MM-DD
**Público:** …

---

## 1. Contexto

## 2. Conteúdo

## N. Referências

- [README.md](./README.md)
```

## 11. Checklist de revisão

- [ ] H1 único e nome do arquivo coerente com o título.
- [ ] Nenhum segredo, token, e-mail pessoal ou CPF real.
- [ ] Comandos testados ou claramente marcados como exemplo.
- [ ] Links internos abrem (arquivo existe).
- [ ] Tabelas alinhadas e sem célula vazia ambígua.
- [ ] Regra de negócio crítica repetida de forma consistente
      (2 referências, contato mínimo, sem pagamentos).
- [ ] `npm run context:budget` continua passando (README ≤ 12 KB,
      `AGENTS.md` ≤ 6 KB).

## 12. Ferramentas

| Ferramenta | Uso |
| --- | --- |
| VS Code + preview | visualizar Markdown |
| `markdownlint` (extensão) | estilo e headings |
| `prettier --check .` | consistência de formatação |
| `npm run context:budget` | limite de tamanho da documentação |

## 13. Versionamento da documentação

- Mudou comportamento? Atualize o documento dono **no mesmo commit**.
- Mudou schema? Atualize `DOCUMENTACAO-TECNICA.md` e `LGPD.md` (se afetar dados).
- Mudou deploy? Atualize `PRODUCTION-GUIDE.md` e `DEPLOY.md`.
- Mudou regra de contato/CPF? Atualize PRD, manual, técnica e segurança.

## 14. Referências

- [README.md](./README.md)
- [AGENTS.md](./AGENTS.md)
