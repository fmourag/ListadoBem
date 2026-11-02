# Deploy na Vercel (plano Hobby/free)

App Next.js 14 autônomo (App Router). Este repositório é a raiz do projeto —
não é workspace de monorepo.

---

## 1. Pré-requisitos

- **Node.js 20+** local (a Vercel usa a versão do projeto).
- Projeto Supabase free com o `supabase-schema.sql` aplicado.
- Repositório no GitHub/GitLab.
- As 4 variáveis de ambiente em mãos.

> **Banco já existente?** Rode o arquivo inteiro: a seção **10.1** derruba o
> `NOT NULL` de `cpf_cnpj`/`email`, cria a constraint
> `cadastros_boicote_contato_check` e adiciona o tipo `acao_social`. É idempotente.

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

- `vercel.json` define região `gru1` e os headers `X-Content-Type-Options`,
  `Referrer-Policy` e `Permissions-Policy`; a **CSP** é emitida pelo
  `next.config.mjs` (enforce), com `frame-ancestors 'none'` no lugar de
  `X-Frame-Options`.
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

> O QR PIX é gerado **no build** (`/apoie/qr`), então não consome function em
> runtime e não adiciona JS ao cliente.

## 5. Checklist pós-deploy

- [ ] `/` mostra o aviso vermelho/amarelo e o card “Apoie esta iniciativa”.
- [ ] `/listagem` responde 200 (vazia ou com aprovados), sem erro de configuração.
- [ ] `/cadastro` conclui as 4 etapas e devolve protocolo.
- [ ] Cadastro **sem CPF, só com e-mail** é aceito (201) e fica `pendente`.
- [ ] Cadastro **sem e-mail e sem telefone** é recusado com mensagem clara.
- [ ] Tipo **“Ação social”** aparece na etapa 1 e é gravado no banco.
- [ ] `/apoie` responde 200, mostra QR 200×200, chave `(21) 97194-3298` e as 5
      cláusulas; os botões copiam chave e payload.
- [ ] Cadastro novo fica `pendente` e **não** aparece em `/listagem`.
- [ ] `/admin/moderacao` pede a senha (`ADMIN_SECRET`), grava cookie HttpOnly e aprovar publica o card com 2 referências.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_SECRET` são **Sensitive** e não
      aparecem em nenhuma variável `NEXT_PUBLIC_*`.

> Checklist completo: [CHECKLIST-DEPLOY.md](./CHECKLIST-DEPLOY.md).
> Smoke automatizado: `node tools/smoke-deploy.cjs https://SEU-DOMINIO`.

## 6. Rollback

Vercel → **Deployments → (deploy anterior) → Promote to Production**. O banco não
é afetado: as migrações são aditivas (`DROP NOT NULL`, nova constraint e novo
valor de enum).
