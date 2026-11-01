# AGENTS.md — leia só isto antes de mexer no app

Diretório **Listado Bem / Rede de Apoio**: Next.js 14 (App Router) + Tailwind +
Supabase. É um diretório de estabelecimentos; **nunca** processa pagamentos.

## Comandos

| Ação | Comando |
| --- | --- |
| Dev | `npm run dev` (porta 3001) |
| Build / start | `npm run build` · `npm start` |
| Tipos | `npm run typecheck` |
| Service role | `npm run check:admin` |
| Payload (gzip/rota) | `npm run budget` (com servidor no ar) |
| Contexto (docs/arquivos) | `npm run context:budget` |
| E2E navegador | `node tools/e2e-listado.cjs` · `node tools/e2e-cadastro.cjs` |
| Launcher Windows | `iniciar-listado-bem.bat [--check\|--clean\|--restart]` |

## Mapa (leia o mínimo)

```
app/
  page.tsx                    landing (Server; sem JS próprio)
  cadastro/page.tsx           monta o formulário + Toaster
  apoie/page.tsx              página dedicada da contribuição
  apoie/qr/route.ts           SVG do QR gerado no build
  listagem/page.tsx           grid aprovados + filtros (GET form)
  admin/moderacao/            painel protegido por ADMIN_SECRET
    page.tsx                  lista pendentes
    actions.ts                aprovar/rejeitar (Server Actions)
  api/cadastro/route.ts       POST: Zod → duplicidade → insert
components/
  FormularioCadastro.tsx      orquestrador (estado, etapas, envio)
  cadastro/Etapa*.tsx         uma etapa por arquivo (dados, atividade, refs, termos)
  cadastro/campos.tsx         ErroCampo + mensagemDeErro
  AvisoNaoTransferencia.tsx   aviso legal (variantes compact/full/barra/destaque)
  CardEstabelecimento.tsx     card público
  ContribuicaoPIX.tsx         card PIX (server; QR via /apoie/qr)
  BotaoCopiarPix.tsx          client mínimo (clipboard + ✓ Copiado)
lib/
  validation.ts               schema Zod único (client + server)
  constants.ts                valores canônicos do domínio
  supabase.ts / supabase-admin.ts   público / service role (server-only)
  tipos-dominio.ts            tipos do domínio
supabase-schema.sql           tabelas, enums, RLS, triggers (idempotente)
```

## Invariantes — não quebre

1. **Sem pagamentos a estabelecimentos**: nada de cobrança por cadastro nem repasse a
   quem está listado. Existe **uma** contribuição facultativa para manutenção
   (`lib/contribuicao.ts`, UI `components/ContribuicaoPIX.tsx`), sempre com as 5
   cláusulas de `CONTRIBUICAO_PONTOS`. O texto do aviso existe
   em `components/AvisoNaoTransferencia.tsx` e deve ser repetido nas telas.
2. **Mínimo de 2 referências públicas** com URL `http(s)` válida: validado no
   `lib/validation.ts`, reforçado pela API e pelo trigger de aprovação no banco.
3. **Status só é definido no servidor** (`pendente`); o client nunca aprova.
4. **RLS**: `anon` lê só `aprovado`, insere só `pendente`; `service_role` recebe
   `GRANT` explícito. Nunca use service role no client (`server-only`).
5. **`ADMIN_SECRET`** protege `/admin/moderacao`; nunca prefixe com `NEXT_PUBLIC_`.

## Economia de tokens (diretriz do projeto)

- **Payload**: orçamento em `tools/budget.cjs` (gzip, navegador moderno). Landing ≈118 KB, listagem ≈112 KB, cadastro ≈155 KB. Landing/listagem são
  Server Components; só o formulário e o botão de copiar são client. `<Toaster>` vive apenas
  em `/cadastro`; o QR é estático em `/apoie/qr`.
  Se aumentar JS, reduza antes de subir o limite.
- **Contexto de agente**: este arquivo é a porta de entrada (~1,3 KB). Prefira
  ler um arquivo de etapa (100–230 linhas) a ler o formulário inteiro.
  `tools/context-budget.cjs` falha se `AGENTS.md` crescer ou se algum arquivo
  passar de 400 linhas.

## Gotchas

- **Um servidor por vez**: `next build` com `next dev` aberto corrompe `.next`
  (assets 404/sem CSS). Use `iniciar-listado-bem.bat --restart` ou `--clean`.
- A landing é dinâmica por causa do Supabase; não cacheie query de listagem
  (`cache: 'no-store'` já aplicado em `lib/supabase.ts`).
- O monorepo das Eleições foi removido em 2026-11-01; este repo é a única fonte
  de verdade. Backup do trabalho não versionado: `..\_backup-eleicoes-20261101\`.
- Verificação mínima antes de concluir: `npm run typecheck`, `npm run build`,
  `npm run budget` e um E2E.




