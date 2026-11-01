# Listado Bem — Rede de Apoio

Landing page e sistema de cadastro do diretório **Rede de Apoio**: comerciantes,
prestadores de serviço, artesãos, profissionais liberais e figuras públicas
vítimas de boicote ideológico.

> **Regra central:** a plataforma é **apenas um diretório**. Ela não processa,
> não recebe e não intermedia pagamentos. Nenhum fluxo coleta valores, chaves
> PIX ou dados bancários.

Este repositório é **autônomo**: nasceu dentro do monorepo das Eleições, mas foi
separado para ter build, deploy e ciclo de vida próprios. Ele **compartilha o
mesmo projeto Supabase**, em tabelas dedicadas (`cadastros_boicote` e
`referencias_publicas`), isoladas por RLS. O app das Eleições continua
funcionando normalmente no mesmo banco.

---

## 1. Stack

| Item        | Escolha                                                              |
| ----------- | -------------------------------------------------------------------- |
| Framework   | Next.js 14 (App Router) + TypeScript strict                          |
| Estilo      | Tailwind CSS 3                                                       |
| Formulários | React Hook Form + Zod (schema único client/server)                   |
| Dados       | `@supabase/supabase-js`: chave publicável + RLS; service role no servidor |
| UI          | `lucide-react` (ícones) e `sonner` (toasts)                          |
| Tipos       | locais em `lib/tipos-dominio.ts` (sem dependência do monorepo)        |

## 2. Rodando localmente

```bash
npm install
copy .env.local.example .env.local    # preencha as 4 variáveis
npm run dev                           # http://localhost:3001
```

Ou dê duplo clique em **`iniciar-listado-bem.bat`**, que instala dependências
quando necessário, valida o `.env.local` e abre o navegador.

Opções do launcher:

```bat
iniciar-listado-bem.bat --check      :: só valida o ambiente
iniciar-listado-bem.bat --clean      :: apaga .next antes de subir
iniciar-listado-bem.bat --restart    :: encerra servidor antigo na porta 3001
iniciar-listado-bem.bat --no-browser :: sobe sem abrir o navegador
```

> Se a página abrir **sem estilo** ou com 404 em `/_next/...`, existe um servidor
> antigo preso na porta 3001 servindo um build que não existe mais. Feche a janela
> dele ou rode `iniciar-listado-bem.bat --restart`.

## 3. Banco de dados (Supabase compartilhado)

O schema está em **`supabase-schema.sql`**. Ele cria:

- `cadastros_boicote` — cadastro principal (`status` default `pendente`);
- `referencias_publicas` — no mínimo 2 por cadastro;
- enums, índices, triggers e **RLS**:
  - `SELECT` público apenas de `status = 'aprovado'`;
  - `INSERT` público sempre forçado a `pendente`;
  - nenhuma política de `UPDATE`/`DELETE` para `anon`;
  - `service_role` recebe `GRANT` explícito (moderação e API);
- trigger que impede aprovar cadastro com menos de 2 referências.

Aplique no **SQL Editor** do Supabase. O arquivo é idempotente.

## 4. Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# server-side apenas (nunca NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
ADMIN_SECRET=uma-chave-longa-e-aleatoria
```

## 5. Rotas

| Rota               | Tipo            | Função                                                   |
| ------------------ | --------------- | -------------------------------------------------------- |
| `/`                | Server          | Landing com hero, regras de segurança e CTA              |
| `/listagem`        | Server (dinâm.) | Grid de aprovados, filtros por categoria e UF            |
| `/cadastro`        | Server + client | Formulário multi-step                                    |
| `/api/cadastro`    | Route Handler   | Valida, checa duplicidade e grava cadastro + referências |
| `/admin/moderacao` | Server + Actions| Painel protegido por `ADMIN_SECRET`                      |

## 6. Formulário

1. **Dados básicos** — tipo, nome completo, nome público, CPF/CNPJ validado,
   e-mail e telefone.
2. **Atividade e endereço** — categoria, descrição, contexto do boicote,
   endereço e link opcional de foto/logo.
3. **Referências públicas** — `useFieldArray`, mínimo **2**, máximo 6, URL
   `http(s)` válida.
4. **Termos e envio** — resumo, aviso de não transferência e consentimentos.

A API revalida com o mesmo schema; o navegador é só conveniência.

## 7. Moderação

- Acesse `/admin/moderacao` e informe a `ADMIN_SECRET`.
- Lista cadastros `pendente` com as referências.
- **Aprovar** / **Rejeitar** são Server Actions que atualizam o status com o
  cliente admin e chamam `revalidatePath('/listagem')`.
- O trigger do banco bloqueia aprovação com menos de 2 referências.

> Para produção, proteja o painel também por Cloudflare Access, Vercel Password
> Protection ou SSO.

## 8. Segurança

- `ANON_KEY` no browser/leitura pública; RLS é a autoridade.
- `SUPABASE_SERVICE_ROLE_KEY` só no servidor, em módulo com `server-only`.
- `status` é sempre definido no servidor (`pendente`).
- CPF/CNPJ único no banco; duplicidade retorna `409`.
- Rate limit simples por IP (5/hora) na API route.
- Headers de segurança em `vercel.json`.

## 9. Estrutura

```
.
├── app
│   ├── admin/moderacao        # painel + Server Actions
│   ├── api/cadastro/route.ts
│   ├── cadastro/page.tsx
│   ├── listagem/page.tsx
│   ├── layout.tsx
│   └── page.tsx               # landing
├── components                 # Aviso, Card, Formulário, Header, Footer
├── lib
│   ├── constants.ts
│   ├── format.ts
│   ├── supabase.ts            # cliente público
│   ├── supabase-admin.ts      # service role (server-only)
│   ├── tipos-dominio.ts       # tipos do domínio
│   ├── tipos.ts
│   └── validation.ts          # schema Zod
├── tools                      # utilitários de verificação (não vão para produção)
├── supabase-schema.sql
└── iniciar-listado-bem.bat
```

## 10. Testes rápidos

```bash
npm run check:admin   # valida a service role (leitura + update no-op)
```

Com o servidor rodando em `localhost:3001`, `node tools/e2e-listado.cjs` executa
o fluxo completo no navegador (cadastro → aprovar → listagem → rejeitar) e apaga
os dados de teste.

## 11. Orçamento de payload (economia de tokens)

Cada byte transferido conta. O app mantém um orçamento explícito de **HTML +
JS + CSS em gzip por rota**, medido como um navegador moderno baixaria
(polyfills `nomodule` não entram).

```bash
npm run dev            # ou npm start, em outro terminal
npm run budget         # mede /, /listagem e /cadastro e falha se estourar
```

Valores de referência (Next 14, build de produção):

| Rota        | HTML  | JS    | CSS   | Total gzip |
| ----------- | ----- | ----- | ----- | ---------- |
| `/`         | 16.3  | 95.6  | 5.7   | **118 KB** |
| `/apoie`    | 16.3  | 95.6  | 5.7   | **118 KB** |
| `/listagem` | 12.0  | 94.4  | 5.7   | **112 KB** |
| `/cadastro` | 8.1   | 140.7 | 5.7   | **155 KB** |

Limites atuais (falham o script): HTML 18/14/11 KB, JS 115/115/165 KB,
CSS 8 KB. O limite de 18 KB na landing cobre as 5 cláusulas legais obrigatórias
do card de contribuição.

Regras que sustentam o orçamento:

- landing, listagem, header e footer são **Server Components** (zero JS próprio);
- só `FormularioCadastro` é client, e é o único que carrega RHF/Zod/sonner;
- `<Toaster>` fica apenas em `/cadastro` (antes estava no layout global e custava
  ~10 KB gzip em todas as rotas);
- o QR PIX é um SVG estático em `/apoie/qr` (gerado no build), não inline no HTML;
- ícones são `lucide-react` tree-shaken por import nomeado; nenhuma fonte externa,
  nenhuma imagem raster, nenhum analytics;
- texto de UI e dados vêm do servidor — o cliente não baixa catálogo de opções.

## 12. Contexto para agentes de IA

O ponto de entrada é **[AGENTS.md](./AGENTS.md)** (~1,3 KB): comandos, mapa de
arquivos, invariantes e armadilhas. Ele evita que um agente leia o repositório
inteiro para tarefas simples.

O formulário foi dividido em etapas para reduzir o custo de leitura:

| Arquivo | Linhas |
| --- | --- |
| `components/FormularioCadastro.tsx` (orquestrador) | ~285 |
| `components/cadastro/EtapaAtividade.tsx` | ~224 |
| `components/cadastro/EtapaReferencias.tsx` | ~209 |
| `components/cadastro/EtapaDados.tsx` | ~150 |
| `components/cadastro/EtapaTermos.tsx` | ~101 |

```bash
npm run context:budget   # falha se AGENTS.md > 6 KB ou arquivo > 400 linhas
```

## 13. Deploy

Veja **[DEPLOY.md](./DEPLOY.md)**.

