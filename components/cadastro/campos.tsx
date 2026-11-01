/** Helpers de formulário compartilhados pelas etapas do cadastro. */

export function mensagemDeErro(erro: unknown): string | undefined {
  if (erro && typeof erro === 'object' && 'message' in erro) {
    const mensagem = (erro as { message?: unknown }).message;
    if (typeof mensagem === 'string' && mensagem.length > 0) return mensagem;
  }
  return undefined;
}

export function ErroCampo({ id, mensagem }: { id: string; mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-semibold text-perigo-700">
      {mensagem}
    </p>
  );
}
