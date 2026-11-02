# AGENTS.md — leia só isto antes de mexer no app

Diretório **Listado Bem / Rede de Apoio**: Next.js 14 (App Router) + Tailwind +
Supabase. É um diretório de estabelecimentos; **nunca** processa pagamentos entre
usuário e estabelecimento. A única exceção é a contribuição facultativa de
manutenção (PIX em `/apoie`).

## Comandos

| Ação | Comando |
| --- | --- |
| Dev | `npm run dev` (porta 3001) |
| Build / start | `npm run build` · `npm start` |
| Tipos | `npm run typecheck` |
| Service role | `npm run check:admin` |
| Payload (gzip/rota) | `npm run budget` (com servidor no ar) |
| Contexto (docs/arquivos) | `npm run context:budget` |
| E2E navegador | `node tools/e2e-listado.cjs` · `e2e-cadastro.cjs` · `e2e-pix.cjs` |
| E2E regras de contato (API) | `node tools/e2e-contato.cjs` |
| Launcher Windows | `iniciar-listado-bem.bat [--check\|--clean\|--restart]` |

## Mapa (leia o mínimo)

```
app/
  page.tsx                    landing (Server)
  cadastro/page.tsx           formulário + Toaster
  apoie/page.tsx              página da contribuição
  apoie/qr/route.ts           SVG do QR gerado no build
  listagem/page.tsx           grid aprovados + filtros (GET form)
  admin/moderacao/            painel (ADMIN_SECRET) + actions.ts
  api/cadastro/route.ts       POST: Zod → duplicidade → insert
components/
  FormularioCadastro.tsx      orquestrador (estado, etapas, envio)
  cadastro/Etapa*.tsx         dados, atividade, referências, termos
  cadastro/campos.tsx         ErroCampo + mensagemDeErro
  AvisoNaoTransferencia.tsx   aviso legal (compact/full/barra/destaque)
  ContribuicaoPIX.tsx         card PIX (server; QR via /apoie/qr)
  BotaoCopiarPix.tsx          client mínimo (clipboard + ✓ Copiado)
  CardEstabelecimento.tsx     card público
lib/
  validation.ts               schema Zod único (client + server)
  constants.ts                valores canônicos + rótulos
  contribuicao.ts             chave PIX, payload, cláusulas
  pix-generator.ts            EMVCo + CRC16 (sem dependência externa)
  supabase.ts / supabase-admin.ts   público / service role (server-only)
  tipos-dominio.ts / types.ts tipos do domínio
supabase-schema.sql           tabelas, enums, RLS, triggers (idempotente)
```

## Invariantes — não quebre

1. **Sem pagamentos a estabelecimentos**: nada de cobrança por cadastro nem repasse
   a quem está listado. Existe **uma** contribuição facultativa para manutenção
   (`lib/contribuicao.ts`, UI `components/ContribuicaoPIX.tsx`), sempre com as 5
   cláusulas de `CONTRIBUICAO_PONTOS` (não é cadastro, não é para loja, não é
   obrigatória, não dá benefício, valor livre). O texto do aviso está em
   `components/AvisoNaoTransferencia.tsx` e deve aparecer nas telas.
2. **Mínimo de 2 referências públicas** com URL `http(s)`: validado no Zod,
   reforçado pela API e pelo trigger de aprovação.
3. **Contato**: CPF/CNPJ é **opcional**; exige-se **e-mail OU telefone**. O banco
   tem a constraint `cadastros_boicote_contato_check`.
4. **Status só no servidor** (`pendente`); o client nunca aprova.
5. **RLS**: `anon` lê só `aprovado`, insere só `pendente`; `service_role` tem
   `GRANT` explícito. Nunca use service role no client (`server-only`).
6. **`ADMIN_SECRET`** protege `/admin/moderacao`; nunca prefixe com `NEXT_PUBLIC_`.

## Economia de tokens (diretriz do projeto)

- **Payload**: orçamento em `tools/budget.cjs` (gzip, navegador moderno). Landing
  ≈118 KB, listagem ≈113 KB, cadastro ≈155 KB. Landing/listagem são Server
  Components; só o formulário e o botão de copiar são client. `<Toaster>` vive
  apenas em `/cadastro`; o QR é estático em `/apoie/qr`. Se aumentar JS, reduza
  antes de subir o limite.
- **Contexto de agente**: este arquivo é a porta de entrada (~4,6 KB). Prefira ler
  um arquivo de etapa (100–230 linhas) a ler o formulário inteiro.
  `tools/context-budget.cjs` falha se `AGENTS.md` crescer além de 6 KB ou se
  algum arquivo passar de 400 linhas.

## Gotchas

- **Um servidor por vez**: `next build` com `next dev` aberto corrompe `.next`
  (assets 404/sem CSS). Use `iniciar-listado-bem.bat --restart` ou `--clean`.
- O rate limit da API é **5 cadastros/hora por IP**; rode cada E2E com o servidor
  recém-iniciado.
- A listagem não pode ser cacheada (`cache: 'no-store'` em `lib/supabase.ts`).
- **Este repositório é o único app ativo.** O `apps/web` do monorepo das Eleições
  (`..\Eleições Progressistas`) é **legado**, não deve ser executado nem alterado.
  O monorepo antigo está arquivado em `..\_arquivado-Eleições-Presidenciais-2026`.
- Verificação mínima antes de concluir: `npm run typecheck`, `npm run build`,
  `npm run budget` e os E2E relevantes.


