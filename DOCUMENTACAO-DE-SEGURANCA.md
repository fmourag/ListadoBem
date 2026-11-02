# Documentação de Segurança

**Produto:** Lista do Bem
**Versão:** 1.0 — 2026-11-01
**Público:** engenharia, segurança, mantenedor
**Classificação:** interno

---

## 1. Escopo e ativos

| Ativo | Sensibilidade | Onde vive |
| --- | --- | --- |
| Dados de contato (nome completo, CPF/CNPJ, e-mail, telefone) | **alta** | Supabase (tabela `cadastros_boicote`) |
| Conteúdo público (nome público, descrição, referências) | baixa | Supabase + páginas |
| `SUPABASE_SERVICE_ROLE_KEY` | **crítica** | Vercel (env Sensitive) |
| `ADMIN_SECRET` | **alta** | Vercel (env Sensitive) |
| Chave PIX de contribuição | pública por natureza | código (`lib/contribuicao.ts`) |
| Disponibilidade do site | média | Vercel/Supabase |

**Fora de escopo:** segurança física, estações de desenvolvimento, segurança dos
provedores (Supabase/Vercel/GitHub), dados de pagamento (não existem).

## 2. Atores e superfícies

| Ator | Capacidade | Superfície |
| --- | --- | --- |
| Visitante anônimo | ler aprovados, enviar cadastro | `/`, `/listagem`, `POST /api/cadastro` |
| Titular do cadastro | enviar dados e referências | `/cadastro` |
| Moderador | aprovar/rejeitar | `/admin/moderacao` + Server Actions |
| Atacante externo | spam, scraping, abuso, tentativa de acesso | todas |
| Insiders/ferramentas | acesso ao repositório e envs | GitHub, Vercel, Supabase |

## 3. Modelo de ameaças

| # | Ameaça | Prob. | Impacto | Controles atuais | Status |
| --- | --- | --- | --- | --- | --- |
| T1 | Vazamento de contato via API pública | média | alto | RLS; projeção sem contato; `service_role` server-only | mitigado |
| T2 | Cadastro falso/difamatório | alta | alto | 2 referências + moderação humana + trigger | mitigado |
| T3 | Spam automatizado | alta | médio | rate limit 5/h/IP + moderação | parcial |
| T4 | Vazamento da service role | baixa | crítico | `server-only`, env Sensitive, sem `NEXT_PUBLIC_` | mitigado |
| T5 | Força bruta no painel | média | alto | segredo longo + comparação no servidor | parcial |
| T6 | Vazamento da chave do admin em logs/URL | média | alto | sessão em cookie HttpOnly; senha só no POST | mitigado |
| T7 | XSS via conteúdo do cadastro | baixa | alto | React escapa; URLs `http(s)`; sem `dangerouslySetInnerHTML` | mitigado |
| T8 | CSRF nas Server Actions | baixa | alto | checagem de origem do Next + chave no form | mitigado |
| T9 | Injeção SQL | baixa | alto | PostgREST parametrizado; sem SQL dinâmico | mitigado |
| T10 | Scraping massivo da listagem | média | baixo | dados já públicos; rate limit não cobre GET | aceito |
| T11 | Dependência comprometida | baixa | alto | lockfile; `npm audit`; revisão de updates | parcial |
| T12 | Queda por abuso de função | baixa | médio | limites Vercel; função curta | parcial |
| T13 | Alteração indevida de status | baixa | alto | service role + trigger + validação de UUID | mitigado |
| T14 | Vazamento por backup | baixa | alto | dumps fora do repo; acesso restrito | parcial |

## 4. Controles implementados

### 4.1 Banco e RLS

- `anon` lê **somente** `status = 'aprovado'`.
- `anon` insere **somente** `status = 'pendente'` (`WITH CHECK`).
- Referências só são visíveis/inseridas conforme o status do cadastro.
- Sem `UPDATE`/`DELETE` para `anon`.
- `service_role` com `GRANT` explícito, usado apenas no servidor.
- Trigger bloqueia aprovação com < 2 referências.

### 4.2 Aplicação

- `lib/supabase-admin.ts` importa `server-only` (build quebra se vazar para o client).
- Zod no cliente **e** no servidor; o cliente é conveniência, não autoridade.
- `status` nunca vem do cliente no insert.
- API responde mensagens genéricas, sem stack trace.
- Links de referência renderizados com `rel="noopener noreferrer nofollow"`.
- Nenhum `dangerouslySetInnerHTML`, `eval` ou script de terceiros.

### 4.3 Cabeçalhos (`next.config.mjs` + `vercel.json`)

| Header | Valor |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; `script-src 'self' 'unsafe-inline'`; `style-src 'self' 'unsafe-inline'`; `img-src 'self' data:`; `connect-src 'self' https://*.supabase.co <origem>`; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`; `object-src 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Todos os headers são emitidos pelo `next.config.mjs` (funcionam local e na
Vercel); o `vercel.json` guarda apenas framework e região. A CSP está em
**enforce**. `X-Frame-Options: DENY` reforça o `frame-ancestors 'none'` em
navegadores antigos. `'unsafe-inline'` é a concessão documentada para a
hidratação do Next; não há `'unsafe-eval'` em produção.

### 4.4 Rate limit

- 5 cadastros por hora por IP, em memória, com janela deslizante simples.
- Chave: `x-forwarded-for` (primeiro IP) ou `x-real-ip`.
- **Limitações:** reinicia com o processo, não é compartilhado entre instâncias e
  pode ser contornado com IPs rotativos. Não protege `GET`.

### 4.5 Moderação

- Login em `/admin/moderacao` valida `ADMIN_SECRET` com `timingSafeEqual` e grava
  um cookie `admin_session` com token `timestamp.HMAC-SHA256`: `HttpOnly`,
  `Secure`, `SameSite=Strict`, `Path=/`, validade de 1 hora.
- O servidor valida a assinatura **e a idade** do token (1 h, tolerância de 60 s),
  então um cookie copiado não vale para sempre.
- A senha nunca vai para a URL; o cookie não é legível por JavaScript.
- Server Actions verificam a sessão antes de tocar no banco e validam UUID;
  `logoutAdmin` expira o cookie.
- Login tem throttle de **5 falhas por 15 min por IP** (em memória).
- Trocar `ADMIN_SECRET` invalida todas as sessões existentes.
- Recomendação: Cloudflare Access, Vercel Password Protection ou SSO.

### 4.6 Dependências e corpo de requisição

- Next.js **15.5.28**, React 18.3, Zod 4 e `@hookform/resolvers` 7.
- `npm audit --omit=dev` retorna **0 vulnerabilidades**. Restam avisos
  moderados em dependências de desenvolvimento (ESLint/minimatch), sem efeito
  no runtime.
- A API lê o corpo com **limite real de 200 KB** (streaming, mesmo sem
  `Content-Length`), evitando payloads gigantes antes do Zod.

## 5. Lacunas e riscos residuais

| Lacuna | Risco | Correção sugerida | Prioridade |
| --- | --- | --- | --- |
| Sem CSP com nonce | `'unsafe-inline'` ainda permite script inline | avaliar nonce/hash quando o Next suportar sem quebrar a hidratação | baixa |
| Rate limit em memória | bypass distribuído | Cloudflare Rate Limiting / Upstash | média |
| Sem CAPTCHA | spam | Turnstile no cadastro | média |
| Sem verificação de e-mail | contato inválido | double opt-in (requer e-mail transacional) | baixa |
| Sem log de auditoria | difícil investigar | tabela `eventos_moderacao` | média |
| Sem WAF | abuso L7 | Cloudflare proxy | baixa |
| Sem CI de segurança | regressão | rodar `npm audit` + `npm run security` no GitHub Actions | baixa |

## 6. Gestão de segredos

| Segredo | Armazenamento | Rotação | Nunca |
| --- | --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel Sensitive + `.env.local` | trimestral ou sob suspeita | no client, em log, em issue |
| `ADMIN_SECRET` | Vercel Sensitive + `.env.local` | ao trocar moderador | em URL pública, print, commit |
| Chave publicável | Vercel + client | sob suspeita | — (pública por design) |

Regras:

- `.env*` está no `.gitignore`; `.env.local.example` só tem placeholders.
- Nunca prefixar segredo com `NEXT_PUBLIC_`.
- Rotacionar em caso de exposição e revisar logs.
- Não colar segredo em ferramentas de IA, issues ou capturas de tela.

## 7. Verificações periódicas

```bash
# dependências
npm audit --omit=dev

# segredos acidentais no repositório
git grep -nE 'sb_secret_[A-Za-z0-9_-]{10,}|eyJhbGciOi|BEGIN [A-Z ]*PRIVATE KEY'

# RLS ativa?
# Supabase → SQL Editor:
select relname, relrowsecurity from pg_class
 where relname in ('cadastros_boicote','referencias_publicas');
```

Checklist mensal:

- [ ] `npm audit` sem crítico/alto.
- [ ] Nenhum segredo em commits recentes.
- [ ] RLS ativa nas duas tabelas.
- [ ] Políticas conferem (select aprovado / insert pendente).
- [ ] `ADMIN_SECRET` e service role não aparecem em logs de aplicação.
- [ ] Backup recente e restauração testada.

## 8. Resposta a incidentes

1. **Detectar** (alerta, relato, log anômalo).
2. **Conter:** revogar chaves, bloquear IP, despublicar cadastro, promover deploy
   anterior.
3. **Erradicar:** corrigir a causa, atualizar dependência, ajustar RLS.
4. **Recuperar:** restaurar backup se necessário; validar smoke test.
5. **Notificar:** ANPD e titulares se houver risco relevante (ver
   [LGPD.md](./LGPD.md)).
6. **Aprender:** post-mortem sem culpa, ação com prazo.

Contatos: manter uma lista offline (fora do repositório) com responsável
técnico, jurídico e provedor.

## 9. Checklist de desenvolvimento seguro

- [ ] Nenhum segredo no diff (`git diff` + grep).
- [ ] Entrada validada no servidor (nunca só no client).
- [ ] `status` e campos administrativos definidos no servidor.
- [ ] Service role só em módulo `server-only`.
- [ ] Links externos com `rel="noopener noreferrer nofollow"`.
- [ ] Nenhum `dangerouslySetInnerHTML` sem sanitização.
- [ ] Erros não vazam detalhes internos ao usuário.
- [ ] Migration revisada (DROP/constraint) e idempotente.
- [ ] Rate limit considerado para novos endpoints.
- [ ] `npm run typecheck && npm run build` verdes.

## 10. Referências

- [DOCUMENTACAO-TECNICA.md](./DOCUMENTACAO-TECNICA.md) — arquitetura e RLS.
- [LGPD.md](./LGPD.md) — dados pessoais e incidentes.
- [PRODUCTION-GUIDE.md](./PRODUCTION-GUIDE.md) — operação e rotação.
- [PRD.md](./PRD.md) — regras de negócio.


