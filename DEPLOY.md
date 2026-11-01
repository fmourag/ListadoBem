# Deploy na Vercel (plano Hobby/free)

App Next.js 14 autônomo (App Router). Este repositório é a raiz do projeto —
não é mais um workspace de monorepo.

---

## 1. Pré-requisitos

- Projeto Supabase free com o `supabase-schema.sql` aplicado.
- Repositório no GitHub/GitLab.
- As 4 variáveis de ambiente em mãos.

## 2. Importar o projeto

1. Vercel → **Add New… → Project** → importe este repositório.
2. Em **Configure Project**:

| Campo            | Valor                  |
| ---------------- | ---------------------- |
| Framework Preset | **Next.js**            |
| Root Directory   | `.` (raiz do repo)     |
| Build Command    | `npm run build`        |
| Output Directory | `.next` (padrão)       |
| Install Command  | `npm install` (padrão) |

3. Em **Environment Variables** (Production + Preview):

| Nome                            | Valor                             | Observação                        |
| ------------------------------- | --------------------------------- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://SEU-PROJETO.supabase.co` | pública                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...`              | pública, protegida por RLS        |
| `SUPABASE_SERVICE_ROLE_KEY`     | `sb_secret_...`                   | **Sensitive**, server-side apenas |
| `ADMIN_SECRET`                  | string longa e aleatória          | **Sensitive**, senha do painel    |

4. **Deploy.**

## 3. Domínio e headers

- `vercel.json` define região `gru1`, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy` e `Permissions-Policy`.
- Domínio `.vercel.app` é gratuito; domínio próprio é opcional.
- Ao trocar o domínio, atualize `metadataBase` em `app/layout.tsx`.

## 4. Limites do plano free

| Recurso                  | Limite free      | Impacto aqui                              |
| ------------------------ | ---------------- | ----------------------------------------- |
| Supabase DB              | 500 MB           | cadastro é texto/JSON                     |
| Supabase Storage         | 1 GB             | não usado (mídia é URL externa)           |
| Vercel bandwidth         | 100 GB/mês       | landing + listagem                        |
| Vercel function duration | 10 s (Hobby)     | API faz 2-3 queries curtas                |
| Supabase pausa           | 7 dias sem uso   | manter um ping externo se necessário      |

## 5. Checklist pós-deploy

- [ ] `/` mostra o aviso vermelho/amarelo.
- [ ] `/listagem` responde 200 (vazia ou com aprovados), sem erro de configuração.
- [ ] `/cadastro` conclui as 4 etapas e devolve protocolo.
- [ ] Cadastro novo fica `pendente` e **não** aparece em `/listagem`.
- [ ] `/admin/moderacao` pede `ADMIN_SECRET`; aprovar publica o card com 2 referências.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_SECRET` são **Sensitive** e não
      aparecem em nenhuma variável `NEXT_PUBLIC_*`.

## 6. Rollback

Vercel → **Deployments → (deploy anterior) → Promote to Production**. O banco não
é afetado.
