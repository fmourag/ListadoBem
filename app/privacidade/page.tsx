import type { Metadata } from 'next';
import Link from 'next/link';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidade — Listado Bem',
  description:
    'Como a Lista do Bem trata seus dados: o que é público, o que fica privado, bases legais, retenção, cookies e direitos do titular conforme a LGPD.',
  alternates: { canonical: '/privacidade' },
};

const ATUALIZADO_EM = '1 de novembro de 2026';

const DADOS = [
  { dado: 'Nome completo', obrigatorio: 'Um dos dois', publico: 'Não', uso: 'Identificação e contato na análise' },
  { dado: 'Nome público', obrigatorio: 'Um dos dois', publico: 'Sim', uso: 'Publicação do card no diretório' },
  { dado: 'CPF ou CNPJ', obrigatorio: 'Não', publico: 'Nunca', uso: 'Evitar cadastros duplicados' },
  { dado: 'E-mail', obrigatorio: 'Opcional', publico: 'Não', uso: 'Contato e verificação' },
  { dado: 'Telefone / WhatsApp', obrigatorio: 'Opcional', publico: 'Não', uso: 'Contato e verificação' },
  { dado: 'Endereço', obrigatorio: 'Sim', publico: 'Só cidade/UF', uso: 'Verificação e contexto local' },
  { dado: 'Descrição e contexto', obrigatorio: 'Sim', publico: 'Sim', uso: 'Conteúdo do card' },
  { dado: 'Referências públicas', obrigatorio: 'Mínimo 1', publico: 'Sim', uso: 'Comprovação do boicote' },
  { dado: 'Link de mídia', obrigatorio: 'Não', publico: 'Sim', uso: 'Identidade visual (URL externa)' },
  { dado: 'Endereço IP', obrigatorio: 'Automático', publico: 'Não', uso: 'Limite de tentativas e segurança' },
] as const;

export default function PrivacidadePage() {
  return (
    <div className="container-page py-12 sm:py-14">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-black uppercase tracking-widest text-esmeralda-700">
          Privacidade e LGPD
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-marinho-950 sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-sm text-marinho-600">
          Última atualização: {ATUALIZADO_EM}. Esta política explica quais dados a Lista do Bem
          trata, por quê, com quem compartilha e como você pode exercer seus direitos.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-esmeralda-200 bg-esmeralda-50 p-4">
          <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-esmeralda-700" />
          <p className="text-sm font-semibold leading-relaxed text-marinho-900">
            Seus dados de contato (nome completo, CPF/CNPJ, e-mail, telefone e endereço completo)
            nunca aparecem na listagem pública. A plataforma não vende dados e não usa rastreadores
            de terceiros.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-marinho-950">1. Controlador</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            O controlador dos dados é o mantenedor do projeto <strong>Lista do Bem / Listado
            Bem</strong>. Contato geral:{' '}
            <a className="font-semibold text-esmeralda-800 underline decoration-esmeralda-300 underline-offset-2 hover:text-esmeralda-900" href="mailto:contato@listadobem.com">
              contato@listadobem.com
            </a>
            . Encarregado de dados (DPO):{' '}
            <a className="font-semibold text-esmeralda-800 underline decoration-esmeralda-300 underline-offset-2 hover:text-esmeralda-900" href="mailto:privacidade@listadobem.com">
              privacidade@listadobem.com
            </a>
            .
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">2. Dados coletados</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Dados coletados, obrigatoriedade e visibilidade</caption>
              <thead>
                <tr className="border-b border-marinho-200 text-xs uppercase tracking-wide text-marinho-500">
                  <th scope="col" className="py-2 pr-3 font-bold">Dado</th>
                  <th scope="col" className="py-2 pr-3 font-bold">Obrigatório</th>
                  <th scope="col" className="py-2 pr-3 font-bold">Público?</th>
                  <th scope="col" className="py-2 font-bold">Finalidade</th>
                </tr>
              </thead>
              <tbody>
                {DADOS.map((linha) => (
                  <tr key={linha.dado} className="border-b border-marinho-100 align-top">
                    <th scope="row" className="py-2 pr-3 font-semibold text-marinho-900">{linha.dado}</th>
                    <td className="py-2 pr-3 text-marinho-700">{linha.obrigatorio}</td>
                    <td className={`py-2 pr-3 font-semibold ${linha.publico === 'Não' || linha.publico === 'Nunca' ? 'text-perigo-700' : 'text-esmeralda-700'}`}>
                      {linha.publico}
                    </td>
                    <td className="py-2 text-marinho-700">{linha.uso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-marinho-500">
            A listagem exibe apenas nome público, tipo, categoria, cidade/UF, descrição, contexto e
            referências. O endereço completo fica restrito à análise.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">3. Dados que não coletamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li>Dados bancários, de cartão, chaves de pagamento ou comprovantes.</li>
            <li>Documentos, fotos ou arquivos enviados ao servidor (mídia é apenas URL externa).</li>
            <li>Dados pessoais sensíveis (saúde, biometria, origem racial, religião, política).</li>
            <li>Localização precisa, contatos do celular ou lista de e-mails.</li>
            <li>Dados de crianças e adolescentes; o serviço é destinado a maiores de 18 anos.</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-marinho-700">
            <strong>CPF/CNPJ é opcional:</strong> se você informar, ele é usado apenas para evitar
            duplicidade e nunca é exibido publicamente.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">4. Finalidade</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Tratamos os dados para manter um diretório público de negócios que relataram boicote
            ideológico, permitir a curadoria das referências e viabilizar o contato direto entre o
            público e o estabelecimento — sempre fora da plataforma.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Também usamos o endereço IP, de forma transitória, para limitar tentativas abusivas de
            cadastro e proteger o serviço.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">5. Base legal</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li>
              <strong>Consentimento</strong> (art. 7º, I, da LGPD): para publicar o cadastro e os
              dados escolhidos para exibição.
            </li>
            <li>
              <strong>Legítimo interesse</strong> (art. 7º, IX): para segurança, prevenção a fraude
              e limite de tentativas.
            </li>
            <li>
              <strong>Obrigação legal ou regulatória</strong>: quando houver determinação de
              autoridade competente.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">6. Compartilhamento</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Não vendemos nem alugamos dados. O tratamento é operado por provedores de
            infraestrutura:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li><strong>Supabase</strong> — banco de dados e API (região São Paulo).</li>
            <li><strong>Vercel</strong> — hospedagem e CDN (região São Paulo).</li>
            <li><strong>GitHub</strong> — versionamento do código, sem dados de titulares.</li>
          </ul>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Também podemos compartilhar dados por obrigação legal ou ordem judicial. Referências
            linkam para sites de terceiros, que têm políticas próprias.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">7. Retenção</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li><strong>Aprovado:</strong> enquanto o cadastro estiver publicado no diretório.</li>
            <li><strong>Pendente:</strong> até a conclusão da análise.</li>
            <li><strong>Rejeitado:</strong> pelo tempo necessário à auditoria da moderação.</li>
            <li><strong>Exclusão:</strong> sob demanda, pelos canais de contato.</li>
          </ul>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Pedidos de exclusão removem o card da listagem. As referências públicas continuam nos
            sites de origem, que não controlamos.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">8. Direitos do titular</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Nos termos do art. 18 da LGPD, você pode solicitar:
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li>confirmação da existência de tratamento;</li>
            <li>acesso aos dados;</li>
            <li>correção de dados incompletos ou desatualizados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>portabilidade em formato estruturado;</li>
            <li>eliminação dos dados tratados com consentimento;</li>
            <li>informação sobre compartilhamento;</li>
            <li>revogação do consentimento.</li>
          </ol>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Envie o pedido para o canal do encarregado com o nome público do cadastro. O prazo de
            resposta é de até 15 dias.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">9. Cookies</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Não usamos cookies de análise, publicidade ou rastreamento. Não há login de usuário,
            portanto não há cookie de sessão de titular. Provedores de infraestrutura podem
            registrar logs técnicos (IP, data/hora, navegador) para segurança e operação.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">10. Segurança</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Adotamos controles proporcionais ao risco:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-marinho-700">
            <li>Row Level Security (RLS): o público lê apenas cadastros aprovados.</li>
            <li>A chave administrativa fica somente no servidor e nunca vai ao navegador.</li>
            <li>HTTPS em todo o site e cabeçalhos de segurança.</li>
            <li>Limite de 5 cadastros por hora por IP.</li>
            <li>Moderação humana antes de qualquer publicação.</li>
          </ul>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Em caso de incidente relevante, comunicaremos a ANPD e os titulares afetados, conforme
            a LGPD.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">11. Alterações nesta política</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Mudanças materiais geram nova versão, com atualização da data no topo. Quando a base
            legal for consentimento, poderemos solicitar novo aceite. O uso contínuo após a
            publicação indica ciência da versão vigente.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-marinho-950">12. Contato do encarregado</h2>
          <p className="mt-2 text-sm leading-relaxed text-marinho-700">
            Para exercer direitos ou tirar dúvidas sobre privacidade, escreva para{' '}
            <a className="font-semibold text-esmeralda-800 underline decoration-esmeralda-300 underline-offset-2 hover:text-esmeralda-900" href="mailto:privacidade@listadobem.com">
              privacidade@listadobem.com
            </a>
            . Consulte também os{' '}
            <Link href="/termos" className="font-semibold text-esmeralda-800 underline decoration-esmeralda-300 underline-offset-2 hover:text-esmeralda-900">
              Termos de Uso
            </Link>
            .
          </p>
          <p className="mt-4 flex items-center gap-2 text-xs text-marinho-500">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Versão 1.0 — publicada em {ATUALIZADO_EM}.
          </p>
        </section>
      </article>
    </div>
  );
}

