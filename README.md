# Lista do Bem

Landing page e sistema de cadastro do diretório **Lista do Bem**: comerciantes,
prestadores de serviço, artesãos, profissionais liberais, figuras públicas e
**ações sociais** vítimas de boicote ideológico.

> **Regra central:** a plataforma é **apenas um diretório**. Ela não processa
> pagamentos entre usuários e estabelecimentos, não recebe valores por cadastro e
> não intermedeia a relação comercial. Existe **uma** exceção explícita: a
> contribuição **facultativa** para manutenção da infraestrutura, em `/apoie`.

Este repositório é **o único app ativo**: tem build, deploy e ciclo de vida
próprios, sem depender de monorepo. Ele **compartilha o mesmo projeto Supabase**
com o app das Eleições, em tabelas dedicadas (`cadastros_boicote` e
`referencias_publicas`), isoladas por RLS. O `apps/web` do monorepo é uma cópia
**legada** e não deve ser usada.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [PRD.md](./PRD.md) | requisitos e regras |
| [MANUAL-DO-USUARIO.md](./MANUAL-DO-USUARIO.md) | passo a passo do usuário |
| [LGPD.md](./LGPD.md) | dados e direitos |
| [PRODUCTION-GUIDE.md](./PRODUCTION-GUIDE.md) | deploy e operação |
| [DOCUMENTACAO-TECNICA.md](./DOCUMENTACAO-TECNICA.md) | arquitetura e API |
| [DOCUMENTACAO-DE-SEGURANCA.md](./DOCUMENTACAO-DE-SEGURANCA.md) | ameaças e controles |
| [MARKDOWN.md](./MARKDOWN.md) | convenções de escrita |
| [DEPLOY.md](./DEPLOY.md) | deploy rápido |

---

## 1. Stack

| Item        | Escolha                                                              |
| ----------- | -------------------------------------------------------------------- |
| Framework   | Next.js 15 (App Router) + TypeScript strict                          |
| Estilo      | Tailwind CSS 3                                                       |
| Formulários | React Hook Form + Zod (schema único client/server)                   |
| Dados       | `@supabase/supabase-js`: chave publicável + RLS; service role no servidor |
| UI          | `lucide-react` (ícones) e `sonner` (toasts)                          |
| QR PIX      | `qrcode` no servidor (SVG gerado no build, sem JS no cliente)        |
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
- **CPF/CNPJ opcional** (único quando informado);
- **contato mínimo**: `email is not null or telefone is not null`
  (constraint `cadastros_boicote_contato_check`);
- trigger que impede aprovar cadastro com menos de 2 referências.

Aplique no **SQL Editor** do Supabase. O arquivo é idempotente: a seção **10.1**
migra bancos antigos (derruba `NOT NULL` de CPF/e-mail, cria a constraint e o tipo
`acao_social`).

## 4. Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# server-side apenas (nunca NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
ADMIN_SECRET=uma-chave-longa-e-aleatoria
```

## 5. Rotas

| Rota               | Tipo             | Função                                                    |
| ------------------ | ---------------- | --------------------------------------------------------- |
| `/`                | Server           | Landing com hero, regras de segurança e CTA               |
| `/listagem`        | Server (dinâm.)  | Busca e filtros (categoria, UF, referência)              |
| `/cadastro`        | Server + client  | Formulário multi-step                                     |
| `/apoie`           | Server           | Página da contribuição facultativa (PIX)                  |
| `/apoie/qr`        | Route Handler    | SVG do QR PIX gerado no build                             |
| `/termos`          | Server (estática)| Termos de Uso                                            |
| `/privacidade`     | Server (estática)| Política de Privacidade (LGPD)                           |
| `/api/cadastro`    | Route Handler    | Valida, checa duplicidade e grava cadastro + referências  |
| `/admin/moderacao` | Server + Actions | Login por `ADMIN_SECRET` + cookie HttpOnly               |

## 6. Formulário

1. **Dados básicos** — tipo, nome completo, nome público, CPF/CNPJ **opcional**
   e **e-mail ou telefone (pelo menos um dos dois)**.
2. **Atividade e endereço** — categoria, descrição, contexto do boicote,
   endereço e link opcional de foto/logo.
3. **Referências públicas** — `useFieldArray`, mínimo **2**, máximo 6, URL
   `http(s)` válida.
4. **Termos e envio** — resumo, aviso de não transferência e consentimentos.

Tipos disponíveis: comerciante, prestador de serviço, artesão, profissional
liberal, figura pública e **ação social** (projetos, coletivos, igrejas, ONGs).

A API revalida com o mesmo schema; o navegador é só conveniência.

## 7. Contribuição facultativa (PIX)

Fica em `/apoie` e em um card discreto na landing. Regras exibidas ao usuário:

1. não é pagamento por cadastro;
2. não é transferência para estabelecimentos;
3. não é obrigatória;
4. não desbloqueia benefícios — a listagem continua pública e gratuita;
5. é 100% voluntária, de qualquer valor.

A chave é `+5521971943298` (exibida como `(21) 97194-3298`), beneficiário
**Fernando Goncalves**, Rio de Janeiro. O payload EMVCo é montado em
`lib/pix-generator.ts` **sem o campo 54 (valor)**, então o pagador escolhe a
quantia. O QR é um SVG estático em `/apoie/qr`.

> O aviso vermelho **“NÃO FAÇA TRANSFERÊNCIAS FINANCEIRAS”** continua valendo
> para os estabelecimentos. A contribuição é só para a manutenção do site.

## 8. Moderação

- Acesse `/admin/moderacao` e informe a senha (`ADMIN_SECRET`).
- Lista cadastros `pendente` com as referências.
- **Aprovar** / **Rejeitar** são Server Actions que atualizam o status com o
  cliente admin e chamam `revalidatePath('/listagem')`.
- O trigger do banco bloqueia aprovação com menos de 2 referências.

> Para produção, proteja o painel também por Cloudflare Access, Vercel Password
> Protection ou SSO.

## 9. Segurança

- `ANON_KEY` no browser/leitura pública; RLS é a autoridade.
- `SUPABASE_SERVICE_ROLE_KEY` só no servidor, em módulo com `server-only`.
- `status` é sempre definido no servidor (`pendente`).
- CPF/CNPJ é opcional e único quando informado; duplicidade retorna `409`; o
  banco exige e-mail ou telefone (constraint `cadastros_boicote_contato_check`).
- A chave PIX é pública por natureza (serve para receber), mas só aparece em
  `/apoie` e na landing — nunca é usada para cobrança de cadastro.
- Rate limit simples por IP (5/hora) na API route.
- CSP enforce + headers em `vercel.json`.

## 10. Estrutura

```
.
├── app
│   ├── admin/moderacao        # painel + Server Actions
│   ├── api/cadastro/route.ts
│   ├── apoie/page.tsx         # página da contribuição
│   ├── apoie/qr/route.ts      # SVG do QR (gerado no build)
│   ├── cadastro/page.tsx
│   ├── listagem/page.tsx
│   ├── layout.tsx
│   └── page.tsx               # landing
├── components
│   ├── cadastro/Etapa*.tsx    # uma etapa por arquivo
│   ├── AvisoNaoTransferencia.tsx
│   ├── BotaoCopiarPix.tsx
│   ├── ContribuicaoPIX.tsx
│   ├── CardEstabelecimento.tsx
│   └── SiteHeader/SiteFooter
├── lib
│   ├── constants.ts
│   ├── contribuicao.ts        # chave, payload e cláusulas
│   ├── pix-generator.ts       # EMVCo + CRC16
│   ├── supabase.ts            # cliente público
│   ├── supabase-admin.ts      # service role (server-only)
│   ├── tipos-dominio.ts       # tipos do domínio
│   ├── tipos.ts / types.ts
│   └── validation.ts          # schema Zod
├── tools                      # testes e orçamentos (não vão para produção)
├── supabase-schema.sql
└── iniciar-listado-bem.bat
```

## 11. Testes e verificações

```bash
npm run typecheck      # tsc --noEmit
npm run check:admin    # service role: leitura + update no-op
npm run test:csp       # CSP enforce (servidor no ar)
```

Com o servidor em `localhost:3001`:

| Script | Cobre |
| --- | --- |
| `node tools/e2e-listado.cjs` | landing → pendente → aprovar → listagem → rejeitar |
| `node tools/e2e-cadastro.cjs` | formulário de 4 etapas sem CPF, só e-mail |
| `node tools/e2e-contato.cjs` | API: e-mail, telefone, nenhum (422), CPF inválido (422) |
| `node tools/e2e-pix.cjs` | QR, cópia da chave/payload, CRC16, cláusulas |
| `npm run test:csp` | header CSP, diretivas e zero violações |

> O rate limit de 5 cadastros/hora por IP é real: rode cada suíte com o servidor
> recém-iniciado para não esbarrar em `429`.

## 12. Orçamento de payload (economia de tokens)

Cada byte transferido conta. O app mantém um orçamento explícito de **HTML +
JS + CSS em gzip por rota**, medido como um navegador moderno baixaria
(polyfills `nomodule` não entram).

```bash
npm run dev            # ou npm start, em outro terminal
npm run budget         # mede /, /listagem e /cadastro e falha se estourar
```

Valores de referência (Next 15, build de produção):

| Rota        | HTML  | JS    | CSS   | Total gzip |
| ----------- | ----- | ----- | ----- | ---------- |
| `/`         | 18.1  | 105.7 | 6.7   | **130 KB** |
| `/apoie`    | 18.1  | 105.7 | 6.7   | **130 KB** |
| `/listagem` | 17.2  | 104.5 | 6.7   | **128 KB** |
| `/cadastro` | 9.5   | 151.4 | 6.7   | **168 KB** |

Limites atuais (falham o script): HTML 19/18/11 KB, JS 115/115/165 KB,
CSS 8 KB. O limite de 19 KB cobre as 5 cláusulas e a busca no HTML.

Regras que sustentam o orçamento:

- landing, listagem, header e footer são **Server Components** (zero JS próprio);
- só o formulário e o botão de copiar são client; o formulário é o único que carrega RHF/Zod/sonner;
- `<Toaster>` fica apenas em `/cadastro`;
- o QR PIX é um SVG estático em `/apoie/qr`, não inline no HTML;
- ícones tree-shaken; sem fonte externa, imagem raster ou analytics;
- texto e dados vêm do servidor; o cliente não baixa catálogo.

## 13. Contexto para agentes de IA

O ponto de entrada é **[AGENTS.md](./AGENTS.md)** (~4,6 KB): comandos, mapa de
arquivos, invariantes e armadilhas. Ele evita que um agente leia o repositório
inteiro para tarefas simples.

O formulário foi dividido em etapas para reduzir o custo de leitura:

| Arquivo | Linhas |
| --- | --- |
| `components/FormularioCadastro.tsx` (orquestrador) | ~285 |
| `components/cadastro/EtapaAtividade.tsx` | ~224 |
| `components/cadastro/EtapaReferencias.tsx` | ~209 |
| `components/cadastro/EtapaDados.tsx` | ~151 |
| `components/cadastro/EtapaTermos.tsx` | ~101 |

```bash
npm run context:budget   # falha se AGENTS.md > 6 KB ou arquivo > 400 linhas
```

## 14. Deploy

Veja **[DEPLOY.md](./DEPLOY.md)**.





