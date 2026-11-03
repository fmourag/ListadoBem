# Busca semanal automática

Rotina que procura matérias novas sobre listas de boicote político e abre uma
**issue de revisão** com os candidatos. Ela **não cadastra nem publica** nada:
nome, cidade, categoria e referência continuam sendo conferidos por uma pessoa.

## Quando roda

- **Toda segunda-feira, 08:00 (America/Sao_Paulo)** — cron `0 11 * * 1` em UTC.
- Manualmente em **Actions → Busca semanal → Run workflow**.

## O que faz

1. Consulta o RSS de notícias do Bing com 5 buscas (`"lista de boicote"`,
   `"boicote político"`, empresários, comerciantes, profissionais).
2. Mantém itens dos últimos **10 dias**.
3. Descarta esportes/entretenimento e notícias sem contexto de comércio ou
   profissão.
4. Remove links repetidos na mesma execução e, se `SUPABASE_URL` +
   `SUPABASE_ANON_KEY` estiverem configurados, links já usados como referência.
5. Gera `relatorios/busca-semanal/AAAA-MM-DD.md`.
6. Abre uma issue `Busca semanal — DD/MM/AAAA` quando há candidatos e guarda o
   relatório como artifact por 90 dias.

## Rodar localmente

```bash
npm run busca:semanal
```

Variáveis opcionais:

| Variável | Padrão | Uso |
| --- | --- | --- |
| `BUSCA_DIAS` | `10` | janela de datas |
| `BUSCA_MAX` | `20` | itens por consulta |
| `SUPABASE_URL` | — | deduplicar contra referências existentes |
| `SUPABASE_ANON_KEY` | — | idem |

## Configurar deduplicação no GitHub

Em **Settings → Secrets and variables → Actions**, crie:

- `SUPABASE_URL` — `https://SEU-PROJETO.supabase.co`
- `SUPABASE_ANON_KEY` — chave anon pública

Sem esses secrets a rotina funciona; apenas não consulta o banco.

## Limitações

- O RSS do Bing não cobre todo o conteúdo e pode variar.
- O filtro é por título/descrição; a matéria ainda precisa ser lida.
- A rotina **não extrai nomes** automaticamente: o relatório é uma fila de
  leitura, não um cadastro.
- A decisão de cadastrar e publicar continua manual, com a referência pública
  como validação.
