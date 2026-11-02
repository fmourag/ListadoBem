# Documentação Técnica

**Produto:** Listado Bem / Rede de Apoio
**Versão:** 1.1 — 2026-11-01
**Público:** engenharia
**Escopo:** arquitetura, banco, API, validação, PIX, build e testes

---

## 1. Visão geral

Aplicação **Next.js 14 (App Router)** monolítica, com renderização no servidor
por padrão e ilhas de cliente apenas onde há interação. Persistência no
**Supabase (PostgreSQL + PostgREST)** com RLS. Sem backend separado.

```
Navegador
  │ HTTPS
  ▼
Next.js na Vercel (região gru1)
  ├─ Server Components ──► Supabase (anon + RLS)  [leitura pública]
  ├─ Route Handler /api/cadastro ──► Supabase (service role) [insert + refs]
  ├─ Server Actions /admin ──► Supabase (service role) [update status]
  └─ /apoie/qr (estático) ──► SVG gerado no build
```

## 2. Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 14.2 (App Router) |
| UI | React 18.3, Tailwind CSS 3.4 |
| Formulários | React Hook Form 7 + `@hookform/resolvers` + Zod 3 |
| Dados | `@supabase/supabase-js` 2 |
| Ícones/toasts | `lucide-react`, `sonner` |
| QR | `qrcode` (server-side) |
| Linguagem | TypeScript strict |
| Deploy | Vercel Hobby (região `gru1`) |

## 3. Rotas e renderização

| Rota | Tipo | Cache |
| --- | --- | --- |
| `/` | Server Component | estática no build |
| `/listagem` | Server Component | `force-dynamic`, `revalidate = 0`, `fetchCache = force-no-store` |
| `/cadastro` | Server + client (`FormularioCadastro`) | estática + hidratação |
| `/apoie` | Server Component | estática |
| `/apoie/qr` | Route Handler | `force-static` + `Cache-Control: public, max-age=86400` |
| `/termos` | Server Component | estática no build |
| `/privacidade` | Server Component | estática no build |
| `/api/cadastro` | Route Handler (Node) | `force-dynamic`, `no-store` |
| `/admin/moderacao` | Server Component + Server Actions | dinâmica |

O cliente Supabase de servidor força `cache: 'no-store'` em todo `fetch`, para
que aprovações apareçam imediatamente.

## 4. Estrutura de pastas

```
app/            rotas, layout, metadata, API e actions
components/     UI (server) + FormularioCadastro e BotaoCopiarPix (client)
lib/            Zod, constantes, tipos, Supabase, PIX, formatação
tools/          budget, context-budget, check-admin, E2E (Playwright)
supabase-schema.sql
```

## 5. Modelo de dados

### 5.1 `public.cadastros_boicote`

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `tipo_cadastro` | enum | `comerciante`, `prestador_servico`, `artesao`, `profissional_liberal`, `figura_publica`, `acao_social` |
| `nome_completo` | text | 5–160, **não público** |
| `nome_publico` | text | 3–160 |
| `cpf_cnpj` | text | **opcional**, único, 11/14 dígitos, **nunca público** |
| `email` | text | **opcional**, regex simples |
| `telefone` | text | **opcional**, 10–20 |
|  |  | **CHECK:** `email is not null or telefone is not null` |
| `categoria` | text | lista fixa de 12 valores |
| `descricao_atividade` | text | 40–1200 |
| `endereco` | jsonb | objeto `{cep, logradouro, numero, complemento, bairro, cidade, estado, pais}` |
| `situacao_boicote` | text | 40–1500 |
| `midia` | jsonb | array `{tipo,url,descricao}` |
| `status` | enum | `pendente` (default), `aprovado`, `rejeitado`, `suspenso` |
| `criado_em` / `atualizado_em` | timestamptz | `atualizado_em` via trigger |

### 5.2 `public.referencias_publicas`

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | uuid | PK |
| `cadastro_id` | uuid | FK `on delete cascade` |
| `tipo_fonte` | enum | `jornal`, `blog`, `parlamentar`, `jornalista`, `personalidade` |
| `nome_fonte` | text | 3–160 |
| `link_referencia` | text | `http(s)` |
| `titulo_referencia` | text | 5–200 |
| `data_publicacao` | date | opcional |
| `descricao_contexto` | text | opcional, ≤ 600 |

### 5.3 Índices

`status`, `categoria`, `(endereco->>'estado')`, `criado_em desc`,
`referencias_publicas(cadastro_id)`.

### 5.4 Funções e triggers

| Objeto | Função |
| --- | --- |
| `boicote_cadastro_status(uuid)` | lê status ignorando RLS (usado nas políticas de referências) |
| `descartar_cadastro_pendente(uuid, text)` | compensação: apaga pendente recente |
| `boicote_validar_aprovacao()` + `trg_..._validar_aprovacao` | bloqueia aprovação com < 2 referências (`check_violation`) |
| trigger `trg_cadastros_boicote_atualizado` | atualiza `atualizado_em` |

### 5.5 RLS

| Tabela | Política | Regra |
| --- | --- | --- |
| cadastros | `..._select_aprovados` | `using (status = 'aprovado')` |
| cadastros | `..._insert_publico` | `with check (status = 'pendente')` |
| referências | `..._select_aprovadas` | status do cadastro = `aprovado` |
| referências | `..._insert_pendente` | status do cadastro = `pendente` |

Não há política de `UPDATE`/`DELETE` para `anon`. `service_role` recebe `GRANT`
explícito e ignora RLS.

## 6. API — `POST /api/cadastro`

**Runtime:** Node.js · **Limite de corpo:** 200 KB (header `content-length`).

### 6.1 Requisição

```json
{
  "tipo_cadastro": "acao_social",
  "nome_completo": "Maria da Silva",
  "nome_publico": "Projeto Sementes",
  "cpf_cnpj": "",
  "email": "maria@example.com",
  "telefone": "",
  "categoria": "servicos",
  "descricao_atividade": "Projeto social que ... (40+ caracteres)",
  "endereco": { "cep": "01001-000", "logradouro": "Rua A", "numero": "10", "bairro": "Centro", "cidade": "São Paulo", "estado": "SP" },
  "situacao_boicote": "Descrição do episódio ... (40+ caracteres)",
  "referencias": [
    { "tipo_fonte": "jornal", "nome_fonte": "Jornal X", "link_referencia": "https://...", "titulo_referencia": "Matéria" },
    { "tipo_fonte": "blog", "nome_fonte": "Blog Y", "link_referencia": "https://...", "titulo_referencia": "Post" }
  ],
  "aceite_termos": true,
  "aceite_aviso_nao_transferencia": true
}
```

### 6.2 Respostas

| Status | Quando | Corpo |
| --- | --- | --- |
| 201 | sucesso | `{ ok: true, id, status: "pendente", mensagem }` |
| 400 | JSON inválido | `{ ok: false, mensagem }` |
| 413 | corpo > 200 KB | `{ ok: false, mensagem }` |
| 422 | Zod falhou | `{ ok: false, mensagem, erros: { campo: [..] } }` |
| 409 | CPF/CNPJ já existe | `{ ok: false, mensagem }` |
| 429 | > 5 por IP/hora | `{ ok: false, mensagem }` |
| 500 | erro de banco | `{ ok: false, mensagem }` |

### 6.3 Fluxo interno

1. valida tamanho e JSON;
2. `cadastroSchema.safeParse` (mesmo schema do cliente);
3. rate limit em memória por `x-forwarded-for`/`x-real-ip` (5/hora);
4. cliente admin (service role) ou fallback anon;
5. se CPF/CNPJ informado, consulta duplicidade (inclui pendentes);
6. `insert` do cadastro com `status: 'pendente'` fixo;
7. `insert` das referências;
8. se as referências falharem, chama `descartar_cadastro_pendente` e retorna 500.

## 7. Validação (Zod — `lib/validation.ts`)

| Campo | Regra |
| --- | --- |
| `tipo_cadastro` | enum (6 valores) |
| `nome_completo` | 5–160 |
| `nome_publico` | 3–160 |
| `cpf_cnpj` | opcional; se preenchido, 11/14 dígitos com DV |
| `email` | opcional; se preenchido, regex |
| `telefone` | opcional; se preenchido, 10+ dígitos |
| contato | `superRefine`: e-mail **ou** telefone obrigatório (erro no campo e-mail) |
| `categoria` | enum (12 valores) |
| `descricao_atividade` | 40–1200 |
| `endereco.cep` | `00000-000` |
| `endereco.estado` | UF válida |
| `situacao_boicote` | 40–1500 |
| `referencias` | 2–6; link `http(s)`; título 5+ |
| consentimentos | ambos `true` |

## 8. PIX (contribuição facultativa)

- **Chave:** `+5521971943298` (E.164), exibida `(21) 97194-3298`.
- **Beneficiário:** `Fernando Goncalves` · **Cidade:** `Rio de Janeiro`.
- **TXID:** `***` (sem identificador específico).
- **Sem tag 54:** o payload não carrega valor; o pagador escolhe a quantia.

### 8.1 BR Code (EMVCo)

| Tag | Conteúdo |
| --- | --- |
| `00` | `01` (payload format) |
| `26` | conta: `00=br.gov.bcb.pix`, `01=chave` |
| `52` | `0000` (MCC genérico) |
| `53` | `986` (BRL) |
| `58` | `BR` |
| `59` | nome (≤ 25) |
| `60` | cidade (≤ 15) |
| `62` | `05=txid` |
| `63` | CRC16 |

CRC16-CCITT: polinômio `0x1021`, inicial `0xFFFF`, sobre `payload + "6304"`.

### 8.2 QR

`GET /apoie/qr` gera SVG 200×200 (`errorCorrectionLevel: M`, margem 1, cores
`#0b1e33`/`#ffffff`) a partir de `PIX_PAYLOAD`, com `dynamic = 'force-static'` e
cache de 1 dia. O componente usa `<img width={200} height={200}>`, sem JS.

## 9. Moderação

- Página `/admin/moderacao?chave=...` compara a chave com `ADMIN_SECRET` no
  servidor (comparação simples de string).
- Server Actions (`aprovarCadastro`, `rejeitarCadastro`) usam `timingSafeEqual`,
  validam UUID, atualizam o status com service role e chamam `revalidatePath`.
- O trigger do banco é a última barreira contra aprovação sem 2 referências.

## 10. Build, performance e testes

| Ferramenta | Comando | Limite |
| --- | --- | --- |
| Tipos | `npm run typecheck` | 0 erros |
| Build | `npm run build` | sucesso |
| Payload | `npm run budget` | HTML 18/14/11 KB; JS 115/115/165 KB; CSS 8 KB |
| Contexto | `npm run context:budget` | AGENTS ≤ 6 KB/1600 tokens; arquivo ≤ 400 linhas; README ≤ 12 KB |

E2E (Playwright + Supabase admin): `e2e-listado`, `e2e-cadastro`, `e2e-contato`,
`e2e-pix`. Todos limpam os próprios dados.

## 11. Decisões e limitações

- **Sem ORM:** consultas diretas via supabase-js; tipos locais.
- **Sem cache na listagem:** prioriza consistência após moderação.
- **Rate limit em memória:** simples e sem custo; não é distribuído.
- **Admin por chave na URL:** simples, porém aparece em logs/histórico.
- **Sem CSP:** headers básicos apenas.
- **Sem upload:** mídia é URL externa.
- **Sem verificação de e-mail:** curadoria humana cobre.

## 12. Referências

- [README.md](./README.md) — visão geral.
- [DOCUMENTACAO-DE-SEGURANCA.md](./DOCUMENTACAO-DE-SEGURANCA.md) — ameaças.
- [PRODUCTION-GUIDE.md](./PRODUCTION-GUIDE.md) — operação.
- `supabase-schema.sql` — fonte da verdade do banco.
