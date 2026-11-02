# Manual do Usuário

**Produto:** Lista do Bem
**Público:** visitantes, estabelecimentos, moderadores
**Versão:** 1.0 — 2026-11-01

---

## 1. O que é a Lista do Bem

Um diretório público e gratuito de comerciantes, prestadores de serviço,
artesãos, profissionais liberais, figuras públicas e **ações sociais** que
sofreram boicote ideológico.

Cada cadastro publicado apresenta **pelo menos duas referências públicas** que
comprovam o episódio. A plataforma **não vende, não cobra e não intermedeia
pagamentos**: o contato e a compra acontecem direto com o estabelecimento.

> **Aviso importante:** não faça transferências financeiras para a plataforma
> achando que está pagando um estabelecimento. A única contribuição existente é
> facultativa e serve para manter o site (veja a seção 6).

---

## 2. Para quem quer se cadastrar

### 2.1 Antes de começar

Tenha em mãos:

- nome completo e o **nome público** do negócio/profissional;
- **e-mail ou telefone/WhatsApp** (pelo menos um);
- categoria e uma descrição honesta da atividade;
- endereço (CEP, rua, número, bairro, cidade e UF);
- **duas ou mais referências públicas** com link acessível.

CPF ou CNPJ é **opcional**. Se você informar, ele serve apenas para evitar
cadastros duplicados e **nunca** aparece publicamente.

### 2.2 Passo 1 — Dados básicos

1. Escolha o **tipo de cadastro**: comerciante, prestador(a) de serviço,
   artesão/artesã, profissional liberal, figura pública ou **ação social**.
2. Preencha nome completo e nome público (como aparece na fachada ou no perfil).
3. Se quiser, informe CPF/CNPJ.
4. Informe **e-mail ou telefone/WhatsApp** — um dos dois basta.
5. Clique em **Continuar**.

> Se aparecer “Informe e-mail ou telefone/WhatsApp”, preencha pelo menos um dos
> campos. Se aparecer erro de CPF/CNPJ, corrija os números **ou deixe em branco**.

### 2.3 Passo 2 — Atividade e endereço

1. Escolha a categoria que mais se aproxima da sua atividade.
2. Descreva o que você faz (mínimo 40 caracteres).
3. Conte o que aconteceu (contexto do boicote, mínimo 40 caracteres).
4. Preencha o endereço. O CEP pode ser digitado com ou sem hífen.
5. Opcional: cole o link de uma foto ou logo (URL pública).

### 2.4 Passo 3 — Referências públicas

Este é o critério central de verificação.

- **Mínimo 2**, máximo 6 referências.
- Cada referência precisa de:
  - **tipo de fonte**: jornal/veículo, blog, parlamentar, jornalista ou
    personalidade pública;
  - **nome da fonte** (veículo ou pessoa);
  - **link público** começando com `https://` (ou `http://`);
  - **título** da matéria/post/publicação;
  - data e contexto são opcionais.

**O que vale como referência:** matéria jornalística, post de blog, nota de
parlamentar, publicação de jornalista ou de personalidade pública que
mencione o boicote.

**O que não vale:** print sem link, grupo privado, publicação apagada, perfil
anônimo, link quebrado ou que não trate do caso.

### 2.5 Passo 4 — Revisão e envio

1. Confira o resumo (nome público, categoria, local e número de referências).
2. Leia o aviso de não transferência.
3. Marque os dois consentimentos:
   - veracidade das informações e aceite dos termos/privacidade;
   - entendimento de que a plataforma não processa pagamentos.
4. Clique em **Enviar cadastro**.

Você verá uma tela de protocolo. O cadastro fica **pendente** e **não aparece**
na listagem até a análise humana.

### 2.6 Depois do envio

- A equipe confere as referências e o conteúdo.
- **Aprovado:** o card entra em `/listagem`.
- **Rejeitado:** continua fora do diretório; você pode corrigir e enviar de novo.
- A plataforma não envia e-mail automático — acompanhe pelo contato que você
  informou ou reenvie com os ajustes.

---

## 3. Para quem quer encontrar e apoiar

1. Acesse **Estabelecimentos verificados** (`/listagem`).
2. Use a **busca** por nome, cidade ou referência pública, ou filtre por
   **categoria** e **UF** — tudo fica na URL e pode ser compartilhado.
3. Abra o card: você verá nome público, tipo, categoria, cidade/UF, descrição,
   contexto do boicote e as referências (até 3; as demais são contadas).
4. Clique nas referências para conferir as fontes.
5. **Contato:** a plataforma **não publica telefone nem e-mail** dos cadastros.
   Procure o negócio pelo nome na sua cidade (Google, Instagram, WhatsApp) ou
   vá até o endereço. O contato é sempre direto, sem intermediação.

> A plataforma não cobra nada do visitante e não recebe pagamentos em nome do
> estabelecimento.

---

## 4. Para o moderador

1. Abra `/admin/moderacao`.
2. Informe a **chave de acesso** (`ADMIN_SECRET`) e clique em **Entrar**.
3. A lista mostra os cadastros **pendentes**, com dados e referências.
4. Use **Aprovar** ou **Rejeitar**.
5. A aprovação só funciona com **2 ou mais referências** (o banco bloqueia).
6. A listagem pública é atualizada na hora.

**Boas práticas de moderação:**

- abra todos os links e confirme que tratam do caso;
- recuse conteúdo ofensivo, dados pessoais de terceiros ou acusação sem fonte;
- não aprove com uma única referência, mesmo que pareça suficiente;
- registre o motivo da rejeição no contato com o solicitante.

> Em produção, proteja o painel também por Cloudflare Access, Vercel Password
> Protection ou SSO. A chave na URL aparece em logs e histórico do navegador.

---

## 5. Privacidade dos seus dados

| Dado | Aparece publicamente? |
| --- | --- |
| Nome público, tipo, categoria, cidade/UF, descrição, contexto | **Sim** |
| Referências (título, fonte, link) | **Sim** |
| Nome completo | Não |
| CPF/CNPJ | **Nunca** |
| E-mail e telefone | Não |
| Endereço completo | Não (só cidade/UF) |

Você pode pedir correção ou exclusão pelos canais de contato do projeto. Veja
[LGPD.md](./LGPD.md).

---

## 6. Contribuição facultativa via PIX

A contribuição ajuda a pagar servidor, banco de dados, domínio, hospedagem e
desenvolvimento. Ela **não** é pagamento de cadastro nem transferência para
estabelecimentos.

### Como contribuir

1. Acesse **Apoie a iniciativa** (`/apoie`) ou use o card na landing.
2. Escolha uma das formas:
   - **QR Code:** abra o app do seu banco e escaneie;
   - **Copia e cola:** clique em “Copiar código PIX” e cole no seu banco;
   - **Chave:** `(21) 97194-3298` (beneficiário **Fernando Goncalves**).
3. Digite **qualquer valor** — o código não tem valor embutido.
4. Confirme no seu banco.

### Regras

- Não é obrigatória.
- Não desbloqueia benefícios: a listagem continua gratuita para todos.
- Não é reembolsável pela plataforma.
- O comprovante fica com você; a plataforma não recebe dados do seu pagamento.

> Se alguém pedir transferência em nome de um estabelecimento da lista, é golpe.
> Pague somente ao próprio estabelecimento, pelo canal que ele indicar.

---

## 7. Perguntas frequentes

**Preciso pagar para me cadastrar?**
Não. Cadastro, listagem e consulta são gratuitos.

**Preciso de CNPJ?**
Não. CPF/CNPJ é opcional.

**Posso cadastrar só com e-mail?**
Sim. E-mail **ou** telefone/WhatsApp, um dos dois.

**Quantas referências preciso?**
No mínimo duas, com link público que trate do boicote.

**Meu telefone vai aparecer?**
Não. A plataforma não publica contato; o visitante encontra o negócio pelo nome.

**Quanto tempo leva a análise?**
Depende da fila de moderação. Não há prazo automático.

**A plataforma recebe meu pagamento?**
Não. Ela não processa pagamentos entre usuário e estabelecimento.

**O PIX é para o estabelecimento?**
Não. É só para a manutenção do site, e é facultativo.

**Como excluo meu cadastro?**
Solicite pelos canais de contato do projeto; veja [LGPD.md](./LGPD.md).

---

## 8. Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| “Informe e-mail ou telefone” | ambos vazios | preencha um dos dois |
| “CPF ou CNPJ inválido” | dígitos errados | corrija ou deixe em branco |
| “Link inválido” | falta `https://` ou link quebrado | use a URL completa da matéria |
| “Menos de 2 referências” | etapa 3 incompleta | adicione outra fonte |
| Cadastro não aparece | ainda pendente ou rejeitado | aguarde a análise / corrija |
| Painel não abre | chave incorreta ou ausente | confira `ADMIN_SECRET` |
| Erro 429 ao enviar | muitas tentativas por hora | aguarde e tente novamente |


