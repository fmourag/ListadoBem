# PRD — Product Requirements Document

**Produto:** Lista do Bem
**Versão do documento:** 1.0
**Data:** 2026-11-01
**Responsável:** mantenedor do projeto
**Status:** implementado (MVP em produção)

---

## 1. Contexto e problema

Pequenos negócios e profissionais independentes relatam perda de clientes após
serem alvo de boicote ideológico. Não existe um diretório público, gratuito e
verificável que:

1. reúna quem foi boicotado;
2. comprove o episódio com **referências públicas** (imprensa, parlamentares,
   jornalistas, personalidades);
3. permita ao cidadão **encontrar e contatar diretamente** esses negócios.

Ao mesmo tempo, qualquer solução precisa ser explícita: **não é plataforma de
pagamento**, não cobra por cadastro e não intermedeia a relação comercial.

## 2. Objetivos

| ID | Objetivo | Métrica |
| --- | --- | --- |
| O1 | Publicar um diretório gratuito e verificável | cadastros aprovados com ≥ 1 referência |
| O2 | Dar visibilidade a negócios boicotados | visitas a `/listagem` e cliques de contato |
| O3 | Manter custo próximo de zero | Supabase Free + Vercel Hobby |
| O4 | Ser inequívoco sobre não processar pagamentos | aviso presente em landing, listagem, cadastro e rodapé |

## 3. Não objetivos

- Processar, intermediar ou garantir pagamentos entre usuários e estabelecimentos.
- Cobrar cadastro, mensalidade ou destaque pago.
- Servir de rede social, marketplace ou sistema de entregas.
- Verificar automaticamente a veracidade das referências (a curadoria é humana).
- Armazenar documentos, fotos ou dados bancários.

## 4. Personas

| Persona | Necessidade | Como o produto atende |
| --- | --- | --- |
| Comerciante / prestador | recuperar clientes após boicote | cadastro com referências e card público |
| Artesão / profissional liberal | divulgar trabalho sem custo | mesmo fluxo, tipo e categoria próprios |
| Figura pública / ação social | explicar o boicote e ser encontrada | descrição, referências e contato direto |
| Visitante solidário | apoiar sem cair em golpe | diretório verificado, sem pagamento na plataforma |
| Moderador | aprovar com critério | painel com referências e status |

## 5. Escopo funcional (implementado)

### 5.1 Landing (`/`)

- Hero com proposta de valor e CTA para cadastro/listagem.
- Explicação do fluxo (3 passos) e critérios de verificação.
- Aviso legal “NÃO FAÇA TRANSFERÊNCIAS FINANCEIRAS”.
- Card de contribuição facultativa (PIX) com as 5 cláusulas.
- Links de navegação e rodapé com o mesmo aviso.

**Aceite:** carrega em < 2 s em 4G; aviso visível sem scroll; CTA para `/cadastro`.

**Páginas legais:** `/termos` e `/privacidade` são estáticas, sem JS próprio,
linkadas no rodapé e no aceite do formulário.

### 5.2 Cadastro (`/cadastro`)

Fluxo em 4 etapas, com validação por etapa e resumo final:

1. **Dados básicos** — tipo (comerciante, prestador, artesão, profissional
   liberal, figura pública, **ação social**), nome do estabelecimento ou do profissional,
   CPF/CNPJ **opcional** e **e-mail ou telefone (ao menos um)**.
2. **Atividade e endereço** — categoria, descrição, situação do boicote, CEP,
   logradouro, número, bairro, cidade, UF, link opcional de mídia.
3. **Referências públicas** — mínimo **2**, máximo 6; tipo de fonte, nome, URL
   `http(s)`, título e contexto opcional.
4. **Termos e envio** — resumo, dois consentimentos obrigatórios e protocolo.

**Aceite:** envia sem CPF; recusa sem contato; grava `status = 'pendente'`;
retorna protocolo e mensagem de que nada foi cobrado.

### 5.3 Listagem (`/listagem`)

- Somente cadastros `aprovado`.
- Busca por nome, cidade ou referência pública via `GET ?q=` (server-side, sem
  JavaScript extra).
- Filtros por categoria e UF via `GET` (compartilhável).
- Card com nome público, tipo, categoria, cidade/UF, descrição, referências e
  orientação de contato direto — **sem publicar telefone/e-mail**.
- Estado vazio explicativo.

### 5.4 Moderação (`/admin/moderacao`)

- Acesso por `ADMIN_SECRET` (query `?chave=`), comparação no servidor.
- Lista pendentes com dados e referências.
- Aprovar/rejeitar via Server Actions.
- Banco bloqueia aprovação sem referência pública.

### 5.5 Contribuição facultativa (`/apoie`)

- Página dedicada + card na landing.
- PIX copia-e-cola e QR estático (`/apoie/qr`), sem valor embutido.
- 5 cláusulas obrigatórias e lista de custos cobertos.

## 6. Regras de negócio

| ID | Regra |
| --- | --- |
| RN-01 | Cadastro só é publicado com **≥ 1 referência pública** verificáveis. |
| RN-02 | CPF/CNPJ é **opcional**; se informado, é validado e único. |
| RN-03 | Exige **e-mail OU telefone**; nunca os dois obrigatórios. |
| RN-04 | Todo cadastro nasce `pendente`; status só muda no servidor. |
| RN-05 | A plataforma **não** processa pagamentos entre usuários e estabelecimentos. |
| RN-06 | A contribuição PIX é só para manutenção, facultativa, sem valor fixo e sem benefício. |
| RN-07 | Dados de contato (CPF, e-mail, telefone) nunca aparecem na listagem. |
| RN-08 | O aviso de não transferência aparece em todas as telas principais. |

## 7. Requisitos não funcionais

| Área | Requisito |
| --- | --- |
| Performance | orçamento gzip: landing ≈130 KB, listagem ≈128 KB, cadastro ≈168 KB |
| Acessibilidade | HTML semântico, foco visível, `aria-*` nos erros, contraste AA |
| Privacidade | minimização (CPF opcional), sem analytics/cookies de rastreio |
| Segurança | RLS, service role apenas no servidor, headers, rate limit 5/h/IP |
| Custo | Supabase Free + Vercel Hobby |
| SEO | metadata por rota, `sitemap`/`robots` quando aplicável |
| Manutenção | docs em Markdown, orçamento de contexto para agentes |

## 8. Jornadas

**Cadastro:** landing → “Quero me cadastrar” → 4 etapas → protocolo → análise
humana → aprovação → card público.

**Apoio:** landing/listagem → card do estabelecimento → contato direto
(WhatsApp/e-mail) → compra fora da plataforma.

**Contribuição:** landing/rodapé → `/apoie` → QR ou copia-e-cola → PIX no banco
do usuário → comprovante pessoal (a plataforma não recebe dado de pagamento).

## 9. Métricas de sucesso

- Cadastros aprovados por semana.
- Taxa de aprovação sobre enviados.
- Visitas e cliques de contato em `/listagem`.
- Tempo médio de moderação.
- Custo mensal de infraestrutura (meta: R$ 0 no free tier).

## 10. Fora de escopo (v1)

- Login de usuário e área “minha conta”.
- Edição pública do próprio cadastro.
- Avaliações, comentários e denúncias estruturadas.
- Upload de imagens (mídia é URL externa).
- Notificações por e-mail/WhatsApp automáticas.
- App mobile nativo (o site é responsivo).

## 11. Riscos e mitigação

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Cadastro falso ou difamatório | alto | 1 referência + curadoria humana |
| Vazamento de contato | alto | RLS + nunca expor CPF/e-mail/telefone |
| Confusão com “plataforma de pagamento” | alto | aviso repetido + cláusulas PIX |
| Spam de cadastros | médio | rate limit 5/h/IP + moderação |
| Custo fora do free tier | médio | orçamentos de payload e limites |
| Dependência do Supabase | médio | schema versionado + backup `pg_dump` |

## 12. Roadmap sugerido

1. ~~Páginas de Termos e Privacidade~~ — publicadas em `/termos` e `/privacidade`.
2. Sessão de moderação com cookie `HttpOnly` em vez de chave na URL.
3. CAPTCHA invisível no cadastro.
4. Painel de métricas simples (sem analytics de terceiros).
5. Exportação/portabilidade dos próprios dados.

## 13. Critérios de aceite do MVP

- [x] Landing, cadastro, listagem, moderação e `/apoie` no ar.
- [x] Cadastro sem CPF, com apenas e-mail ou apenas telefone.
- [x] Tipo “Ação social”.
- [x] Aprovação bloqueada sem referência pública.
- [x] Nenhum dado de contato exposto publicamente.
- [x] Aviso de não transferência em todas as telas.
- [x] Páginas de Termos e Privacidade publicadas.


