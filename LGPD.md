# LGPD — Privacidade e Proteção de Dados

**Produto:** Lista do Bem
**Versão:** 1.0
**Data:** 2026-11-01
**Público:** titulares, mantenedor, jurídico

> **Status:** a Política de Privacidade e os Termos de Uso já estão publicados em
> `/privacidade` e `/termos`, com links no rodapé e no aceite do formulário.
> Falta definir o domínio e o e-mail oficial do encarregado.

---

## 1. Quem é o controlador

O **mantenedor do projeto Lista do Bem** é o controlador dos dados pessoais
tratados no site. Os provedores de infraestrutura atuam como **operadores**:

| Operador | Serviço | Região |
| --- | --- | --- |
| Supabase | banco PostgreSQL, API e autenticação | `sa-east-1` (São Paulo) |
| Vercel | hospedagem e CDN do site | `gru1` (São Paulo) |
| GitHub | versionamento do código (sem dados de usuários) | EUA |

**Encarregado (DPO):** a definir antes do lançamento.
**Canal do titular:** `privacidade@` + domínio oficial — **TODO**.

## 2. Princípios

- **Finalidade:** dados coletados apenas para cadastro, verificação, publicação
  do diretório e segurança.
- **Minimização:** CPF/CNPJ e contato são **opcionais**; a referência pública é a
  validação do cadastro.
- **Transparência:** o formulário informa o que é público e o que é interno.
- **Segurança:** RLS, service role restrita ao servidor e nenhum dado sensível
  no client.
- **Não discriminação:** o diretório é gratuito e não condiciona acesso a
  contribuição.

## 3. Dados tratados

| Dado | Obrigatório? | Finalidade | Base legal | Público? |
| --- | --- | --- | --- | --- |
| Nome completo | um dos dois | identificação e contato na análise | consentimento (art. 7º, I) | **não** |
| Nome público | um dos dois | publicação do card | consentimento | **sim** |
| CPF/CNPJ | **não** | evitar duplicidade/fraude | consentimento + legítimo interesse (art. 7º, IX) | **nunca** |
| E-mail | não | contato e análise | consentimento | **não** |
| Telefone/WhatsApp | não | contato e análise | consentimento | **não** |
| Cidade/UF | sim | filtro e contexto local | consentimento | **sim** |
| Endereço completo | sim (CEP, rua, nº, bairro) | verificação e eventual contato | consentimento | **não** (exibe só cidade/UF) |
| Descrição da atividade | sim | publicação | consentimento | **sim** |
| Situação do boicote | sim | contexto no card | consentimento | **sim** |
| Referências públicas | sim (1+) | comprovação | consentimento + fonte pública | **sim** |
| Link de mídia (foto/logo) | não | identidade visual | consentimento | **sim** |
| Endereço IP | transitório | rate limit e segurança | legítimo interesse | **não** (memória, sem persistência) |
| Data/hora de criação e status | automático | auditoria e moderação | legítimo interesse | **não** |

**Não coletamos:** dados bancários, cartão, documentos, biometria, localização
precisa, dados de crianças/adolescentes, dados sensíveis (art. 5º, II).

## 4. O que aparece publicamente

A listagem pública mostra **apenas**: nome público, tipo, categoria, cidade/UF,
descrição, contexto do boicote, link de mídia e referências (título, fonte,
link, data).

**Nunca aparecem:** nome completo, CPF/CNPJ, e-mail, telefone, endereço
completo, IP e status interno.

## 5. Cookies e rastreamento

- **Não há** Google Analytics, pixel de rede social, publicidade ou fingerprint.
- **Não há** login de usuário; portanto não há cookie de sessão de titular.
- O acesso administrativo usa chave na URL (não cookie) — ver
  [DOCUMENTACAO-DE-SEGURANCA.md](./DOCUMENTACAO-DE-SEGURANCA.md).
- A Vercel/Supabase podem registrar logs técnicos (IP, horário, user-agent) por
  segurança e operação, conforme contratos dos provedores.

## 6. Compartilhamento

- **Não vendemos** dados.
- Compartilhamos apenas com os operadores acima, para hospedar e operar o site.
- Referências públicas linkam para sites de terceiros; ao clicar, aplicam-se as
  políticas desses sites.
- Autoridades: apenas por obrigação legal ou ordem judicial.

## 7. Transferência internacional

Supabase e Vercel podem processar dados fora do Brasil. A escolha de regiões
`sa-east-1`/`gru1` reduz a latência, mas não garante que todo o tratamento ocorra
em território nacional. Antes do lançamento, formalizar cláusulas contratuais
padrão (art. 33 da LGPD) com os fornecedores.

## 8. Retenção

| Situação | Prazo atual | Recomendação |
| --- | --- | --- |
| Pendente | até moderação | revisar em 90 dias; excluir sem resposta |
| Aprovado | enquanto o diretório existir | revisar anualmente |
| Rejeitado | sem prazo automático | excluir após 12 meses |
| Solicitação de exclusão | imediata | manter apenas registro mínimo da solicitação |

Não há rotina automática de expurgo hoje. A exclusão é manual, pelo painel/SQL,
com registro do pedido.

## 9. Direitos do titular (art. 18)

O titular pode solicitar:

1. confirmação da existência de tratamento;
2. acesso aos dados;
3. correção de dados incompletos ou desatualizados;
4. anonimização, bloqueio ou eliminação de dados desnecessários;
5. portabilidade (formato estruturado);
6. eliminação dos dados tratados com consentimento;
7. informação sobre compartilhamento;
8. revogação do consentimento.

**Como exercer:** enviar mensagem para o canal oficial (TODO) com nome público
do cadastro e o direito solicitado. Prazo de resposta: até 15 dias.

Exclusão de cadastro aprovado remove o card da listagem imediatamente; as
referências públicas permanecem nos sites de origem (não controlamos terceiros).

## 10. Segurança dos dados

- RLS no PostgreSQL: `anon` lê só aprovados e insere só pendentes.
- `service_role` apenas no servidor (`server-only`), nunca no bundle.
- HTTPS em todo o site; headers de segurança em `vercel.json`.
- Rate limit de 5 cadastros/hora por IP.
- Acesso administrativo por segredo longo + recomendação de Cloudflare Access/SSO.

Detalhes em [DOCUMENTACAO-DE-SEGURANCA.md](./DOCUMENTACAO-DE-SEGURANCA.md).

## 11. Incidentes

Em caso de vazamento relevante:

1. conter o incidente (revogar chaves, bloquear acesso, restaurar backup);
2. avaliar risco aos titulares;
3. comunicar a ANPD e os titulares afetados em prazo razoável;
4. registrar causa, impacto e medidas;
5. corrigir a falha e revisar controles.

## 12. Crianças e adolescentes

O serviço é destinado a maiores de 18 anos. Cadastros de menores devem ser
recusados na moderação.

## 13. Alterações

Mudanças materiais exigem nova versão deste documento, aviso no site e, quando
a base legal for consentimento, nova coleta de aceite.

## 14. Pendências antes do lançamento

- [x] Publicar Política de Privacidade e Termos de Uso no site.
- [ ] Definir domínio e e-mail oficial do encarregado.
- [ ] Formalizar cláusulas de transferência internacional.
- [ ] Criar rotina de expurgo (pendentes/rejeitados).
- [x] Adicionar link para a política no rodapé e no formulário.
- [ ] Registrar base legal no momento do aceite (versão do texto).

## 15. Referências

- Lei nº 13.709/2018 (LGPD).
- [PRD.md](./PRD.md) — regras de negócio.
- [DOCUMENTACAO-TECNICA.md](./DOCUMENTACAO-TECNICA.md) — modelo de dados.


