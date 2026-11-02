# PRODUCTION GUIDE — Deploy e Operação

**Produto:** Lista do Bem
**Versão:** 1.1 — 2026-11-02
**Público:** DevOps, mantenedor
**Objetivo:** colocar e manter o site em produção gastando R$ 0 (free tier).

---

## 1. Ambientes

| Ambiente | URL | Banco | Uso |
| --- | --- | --- | --- |
| Local | `http://localhost:3001` | Supabase do projeto | desenvolvimento |
| Preview | `*.vercel.app` (branch) | Supabase do projeto | revisão |
| Produção | https://listado-bem.vercel.app | Supabase do projeto | público |

### Deploy atual

| Item | Valor |
| --- | --- |
| URL | https://listado-bem.vercel.app |
| Data | 2026-11-02 |
| Commit em produção | `bd3bd53` |
| Deployment | `dpl_3LPL7vbLJ9xLqbwW6CLHvuAuWg7p` |
| Smoke | 75/75 PASS |
| CI | verde no GitHub Actions |

> As variáveis precisam ter **valores reais**. Em 2026-11-02 a UI salvou URL/anon
> com placeholder e service/admin vazios; o deploy subiu sem Supabase e sem login.
> Confira o tamanho da URL (~40 chars) e, após qualquer ajuste, faça **Redeploy
> sem cache**. A prova rápida é a CSP conter `https://<projeto>.supabase.co` em
> `connect-src` (o fallback é `https://*.supabase.co`).

> **Atenção:** preview e produção compartilham o mesmo banco. Cadastros criados
> em preview aparecem na moderação de produção. Se precisar isolar, crie um
> segundo projeto Supabase e configure as variáveis por ambiente na Vercel.

## 2. Pré-requisitos

- Node.js 20+ e npm.
- Conta Supabase (free) e Vercel (Hobby).
- Repositório no GitHub.
- Domínio (opcional).

## 3. Banco de dados

1. Crie o projeto no Supabase (região **South America (São Paulo)**).
2. Abra **SQL Editor** e execute `supabase-schema.sql` inteiro.
3. Confirme:

```sql
select column_name, is_nullable
  from information_schema.columns
 where table_name = 'cadastros_boicote'
   and column_name in ('cpf_cnpj', 'email', 'telefone');
-- esperado: cpf_cnpj YES, email YES, telefone YES

select e.enumlabel
  from pg_type t join pg_enum e on e.enumtypid = t.oid
 where t.typname = 'tipo_cadastro_boicote';
-- esperado incluir acao_social
```

4. Em **Authentication → Policies**, confirme as 4 políticas do schema
   (select/insert de cadastros e referências).
5. Em **Project Settings → API**, copie URL, chave publicável e
   `service_role`.

**Migração de banco existente:** a seção 10.1 do schema é idempotente e aplica
`DROP NOT NULL`, a constraint de contato e o novo valor de enum.

## 4. Variáveis de ambiente

| Nome | Onde | Sensível? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | não |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | não (RLS protege) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local (server) | **sim** |
| `ADMIN_SECRET` | Vercel + local (server) | **sim** |

Regras:

- `service_role` e `ADMIN_SECRET` **nunca** com prefixo `NEXT_PUBLIC_`.
- Na Vercel, marcar as duas como **Sensitive**.
- Gerar `ADMIN_SECRET` com 32+ caracteres aleatórios:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

## 5. Deploy na Vercel

1. **Add New → Project** e importe o repositório.
2. Configuração:

| Campo | Valor |
| --- | --- |
| Framework | Next.js |
| Root Directory | `.` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

3. Adicione as 4 variáveis (Production + Preview).
4. **Deploy**.
5. Configure o domínio em **Settings → Domains**.
6. Atualize `metadataBase` em `app/layout.tsx` se o domínio mudar.

## 6. Verificação pré-deploy (local)

```bash
npm ci
npm run typecheck
npm run build
npm start            # em outro terminal
npm run budget
npm run context:budget
```

Opcional, com banco real:

```bash
npm run check:admin
node tools/e2e-listado.cjs
node tools/e2e-cadastro.cjs
node tools/e2e-contato.cjs
node tools/e2e-pix.cjs
npm run test:csp
npm run security
node tools/smoke-deploy.cjs http://127.0.0.1:3001
```

> Cada suíte consome o rate limit (5 cadastros/hora/IP). Reinicie o servidor
> entre suítes ou rode em horários diferentes.

## 7. Smoke test pós-deploy

Automatizado (só HTTP, sem banco):

```bash
node tools/smoke-deploy.cjs https://SEU-DOMINIO
```

> Os headers de segurança são emitidos pelo `next.config.mjs`, então valem
> também no `next start` local — não há SKIP por ambiente.

| Verificação | Esperado |
| --- | --- |
| `GET /` | 200, aviso de não transferência visível |
| `GET /listagem` | 200 (vazia ou com aprovados) |
| `GET /cadastro` | 200, 4 etapas, tipo “Ação social” |
| `POST /api/cadastro` sem contato | 422 |
| cadastro só com e-mail | 201, status `pendente` |
| `GET /apoie` | 200, QR e chave |
| `GET /apoie/qr` | 200 `image/svg+xml` |
| `/admin/moderacao` | pede senha; aprovar publica |
| Resposta HTTP | header `Content-Security-Policy` (enforce), sem violações no console |

## 8. Monitoramento e logs

- **Vercel → Deployments → Functions**: erros 5xx e duração da API.
- **Vercel → Logs**: requisições, status e região.
- **Supabase → Reports**: conexões, uso de disco e erros.
- Alertas gratuitos: e-mail da Vercel para falha de deploy; Supabase para uso.
- Métricas de produto: consultas SQL manuais (sem analytics de terceiros).

```sql
-- funil simples
select status, count(*) from public.cadastros_boicote group by status;
```

## 9. Backup e restauração

Free tier não tem PITR. Faça dump periódico com a `DIRECT_URL`:

```powershell
$env:PGPASSWORD = ""   # se a URL já contém a senha, deixe vazio
pg_dump "$env:DIRECT_URL" --no-owner --no-privileges -f "backup-$(Get-Date -Format yyyyMMdd).sql"
```

Restauração:

```bash
psql "$DIRECT_URL" -f backup-20261101.sql
```

Recomendação: dump semanal automatizado (Task Scheduler/GitHub Actions) e guarda
fora do repositório. Teste a restauração em um projeto Supabase de teste.

## 10. Rotação de segredos

| Segredo | Como rotacionar | Efeito |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → *Rotate* | atualizar Vercel e redeploy |
| `ADMIN_SECRET` | gerar novo, atualizar Vercel, redeploy | invalida o painel antigo |
| Chave publicável | Supabase → API → *Rotate* | atualizar Vercel |

Após rotacionar, rode `npm run check:admin` e um cadastro de teste.

## 11. Runbook de incidentes

### Site fora do ar (5xx)

1. Vercel → Deployment atual → **Logs**.
2. Verifique variáveis de ambiente e status do Supabase.
3. Se o último deploy quebrou: **Promote** do deploy anterior.
4. Confirme `GET /` e `GET /listagem`.

### Banco indisponível ou pausado

1. Supabase → **Restore project** (free pausa após 7 dias sem uso).
2. Confirme conexões e RLS.
3. Rode o smoke test.

### Spam ou abuso

1. Bloqueie o IP no Cloudflare/Vercel (se houver proxy).
2. Rejeite os cadastros no painel.
3. Se necessário, reduza temporariamente o limite em `app/api/cadastro/route.ts`.
4. Registre horário, volume e origem.

### Vazamento de segredo

1. Rotacione imediatamente o segredo exposto.
2. Revise logs de acesso e alterações no banco.
3. Comunique conforme [LGPD.md](./LGPD.md).
4. Abra post-mortem e ajuste controles.

### Rollback de aplicação

Vercel → **Deployments** → deploy anterior → **Promote to Production**.
O banco não é afetado; migrações são aditivas.

## 12. Limitações conhecidas

| Limitação | Impacto | Mitigação |
| --- | --- | --- |
| Rate limit em memória | reinicia com o processo e não é global | Cloudflare/WAF ou KV |
| CSP com `'unsafe-inline'` | reduz defesa contra XSS inline | avaliar nonce/hash em versões futuras do Next |
| Sem verificação de e-mail | contato pode ser inválido | conferência humana na moderação |

### CI ativo (GitHub Actions)

O workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) roda em todo
`push` e `pull_request` e falha no primeiro erro:

- `typecheck`, `build`, `context:budget`, `budget`, `test:csp`, `responsive` e
  `security`;
- Node 20 com **cache do npm** e Chromium instalado via Playwright;
- variáveis **dummy** (nenhum segredo real) e `SEC_SKIP_RLS=1`: o CI valida
  headers, auth, API e CSP; a RLS é exercitada localmente com o Supabase real.

## 13. Manutenção

| Frequência | Tarefa |
| --- | --- |
| Diária | conferir erros 5xx e fila de moderação |
| Semanal | backup `pg_dump`; revisar pendentes antigos |
| Mensal | `npm audit`, atualizar dependências, revisar acessos |
| Trimestral | testar restauração; revisar LGPD e segredos |
| Anual | renovar domínio; revisar políticas e retenção |

## 14. Custos

| Item | Free tier | Custo atual |
| --- | --- | --- |
| Supabase | 500 MB DB, pausa em 7 dias | R$ 0 |
| Vercel Hobby | 100 GB banda, funções 10 s | R$ 0 |
| Domínio | opcional | ~R$ 40/ano |

## 15. Referências

- [DEPLOY.md](./DEPLOY.md) — passo a passo resumido.
- [CHECKLIST-DEPLOY.md](./CHECKLIST-DEPLOY.md) — checklist completo de go-live.
- [DOCUMENTACAO-TECNICA.md](./DOCUMENTACAO-TECNICA.md) — arquitetura.
- [DOCUMENTACAO-DE-SEGURANCA.md](./DOCUMENTACAO-DE-SEGURANCA.md) — controles.


