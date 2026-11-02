# CHECKLIST-DEPLOY.md — Checklist de deploy na Vercel

**Produto:** Lista do Bem
**Versão:** 1.1 — 2026-11-02
**Público:** DevOps / mantenedor

## 0. Deploy atual

- [x] URL: https://listado-bem.vercel.app
- [x] Build/deploy de produção READY na Vercel.
- [x] Smoke: 75/75 PASS.
- [x] `/listagem` sem erro de Supabase e login admin OK.
- [x] 4 envs com valores reais (Production + Preview).
- [x] CI verde no GitHub Actions.

---

## 1. Antes do deploy (local)

- [ ] `git status` limpo e commit revisado.
- [ ] CI verde no GitHub Actions (push/PR) — `.github/workflows/ci.yml`.
- [ ] `npm ci` sem erros.
- [ ] `npm run typecheck` — 0 erros.
- [ ] `npm run build` — concluído.
- [ ] `npm start` em outro terminal.
- [ ] `npm run budget` — todas as rotas dentro.
- [ ] `npm run context:budget` — dentro.
- [ ] `npm run test:csp` — CSP enforce, 0 violações.
- [ ] `npm run security` — headers, cookie, RLS e força bruta OK.
- [ ] `npm run responsive` — sem overflow de 320 a 1920 px.
- [ ] 4 envs com valores reais (URL/anon/service/admin), não vazios.
- [ ] `node tools/smoke-deploy.cjs http://127.0.0.1:3001` — 100% PASS.
- [ ] E2E: `e2e-listado`, `e2e-cadastro`, `e2e-contato`, `e2e-pix` (servidor recém-iniciado por suíte).

## 2. Supabase

- [ ] Projeto na região **South America (São Paulo)**.
- [ ] `supabase-schema.sql` aplicado (idempotente).
- [ ] Migração **10.1** aplicada em banco existente.
- [ ] `select` público só de `aprovado`; `insert` só `pendente`.
- [ ] `service_role` com `GRANT` explícito.
- [ ] Trigger de aprovação com < 2 referências ativo.
- [ ] Backup recente (`pg_dump`) guardado fora do repositório.

## 3. Vercel — projeto

- [ ] Repositório importado.
- [ ] **Framework Preset:** Next.js.
- [ ] **Root Directory:** `.`.
- [ ] **Build Command:** `npm run build`.
- [ ] **Output Directory:** `.next`.
- [ ] **Install Command:** `npm install`.
- [ ] Região `gru1` (definida em `vercel.json`).

## 4. Vercel — variáveis (Production + Preview)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — pública.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — pública.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — **Sensitive**.
- [ ] `ADMIN_SECRET` — **Sensitive**, 32+ caracteres aleatórios.
- [ ] Nenhum segredo com prefixo `NEXT_PUBLIC_`.
- [ ] Valores conferidos contra `.env.local.example` (sem copiar segredo real para o repositório).

## 5. Deploy

- [ ] Deploy de produção concluído sem erro de build.
- [ ] Domínio configurado e HTTPS ativo.
- [ ] `metadataBase` atualizado em `app/layout.tsx` se o domínio mudou.
- [ ] Deploy anterior disponível para rollback.

## 6. Smoke test pós-deploy

```bash
node tools/smoke-deploy.cjs https://SEU-DOMINIO
```

| Item | Esperado |
| --- | --- |
| `/` | 200, aviso de não transferência |
| `/listagem` | 200 |
| `/cadastro` | 200, tipo “Ação social” |
| `/apoie` | 200, QR e chave |
| `/apoie/qr` | 200 `image/svg+xml` |
| `/termos` | 200 |
| `/privacidade` | 200 |
| `/admin/moderacao` | 200, formulário de senha |
| `/api/cadastro` (GET) | 405 |
| Headers | CSP enforce, `nosniff`, `Referrer-Policy`, `Permissions-Policy`; sem `X-Powered-By` |

## 7. Validação funcional (manual, com banco)

- [ ] Login no painel com `ADMIN_SECRET`.
- [ ] Cadastro de teste **sem CPF, só e-mail** → protocolo e status `pendente`.
- [ ] Cadastro sem contato → erro claro.
- [ ] Aprovar publica na listagem; rejeitar mantém fora.
- [ ] Cookie `admin_session` com `HttpOnly`, `Secure`, `SameSite=Strict`, 1 h.
- [ ] Contribuição PIX: QR abre, copia e cola funciona.
- [ ] Remover cadastros de teste.

## 8. Segurança

- [ ] Nenhum segredo no bundle: buscar `sb_secret` e `ADMIN_SECRET` no HTML/JS públicos.
- [ ] `/admin/moderacao` não indexa (`robots: noindex`).
- [ ] CSP sem `unsafe-eval` em produção.
- [ ] Rate limit de 5 cadastros/hora por IP ativo.
- [ ] `ADMIN_SECRET` não aparece em URLs nem logs.

## 9. Pós-deploy imediato

- [ ] `node tools/smoke-deploy.cjs https://SEU-DOMINIO` → 100% PASS.
- [ ] Conferir logs da Vercel (sem 5xx).
- [ ] Conferir Reports do Supabase (conexões e disco).
- [ ] Avisar o time e registrar data/hora do deploy.

## 10. Rollback

1. Vercel → **Deployments** → deploy anterior → **Promote to Production**.
2. Reexecutar o smoke test.
3. O banco não é afetado: migrações são aditivas (`DROP NOT NULL`, constraint e enum).

## 11. Referências

- [PRODUCTION-GUIDE.md](./PRODUCTION-GUIDE.md)
- [DEPLOY.md](./DEPLOY.md)
- [DOCUMENTACAO-DE-SEGURANCA.md](./DOCUMENTACAO-DE-SEGURANCA.md)


