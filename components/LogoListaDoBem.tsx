interface LogoListaDoBemProps {
  /** Classes de tamanho (ex.: `h-10 w-10`). */
  className?: string;
  /** Sufixo único para o gradiente quando há mais de um logo na página. */
  id?: string;
}

/**
 * Marca da Lista do Bem: fachada de loja com coração.
 *
 * - telhado = comércio local / estabelecimento;
 * - coração = apoio e verificação humana;
 * - esmeralda + ouro = paleta oficial do produto.
 *
 * É decorativo: o nome acessível vem do link/texto ao lado.
 */
export function LogoListaDoBem({ className = 'h-10 w-10', id = 'logo' }: LogoListaDoBemProps) {
  const gradiente = `ra-logo-${id}`;

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradiente} x1="6" y1="2" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b96a" />
          <stop offset="0.55" stopColor="#059652" />
          <stop offset="1" stopColor="#05603a" />
        </linearGradient>
      </defs>

      <rect width="48" height="48" rx="13" fill={`url(#${gradiente})`} />
      <rect
        x="2.75"
        y="2.75"
        width="42.5"
        height="42.5"
        rx="10.5"
        fill="none"
        stroke="#fcd34d"
        strokeOpacity="0.32"
        strokeWidth="1"
      />

      {/* telhado */}
      <path
        d="M9.5 23.4 24 11.6l14.5 11.8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* toldo */}
      <path d="M12.6 25.6h22.8" stroke="#fcd34d" strokeWidth="2.6" strokeLinecap="round" />

      {/* corpo da loja */}
      <path
        d="M13.4 28.4c0-1 .8-1.8 1.8-1.8h17.6c1 0 1.8.8 1.8 1.8v9.4c0 .9-.7 1.6-1.6 1.6H15c-.9 0-1.6-.7-1.6-1.6Z"
        fill="#ffffff"
      />

      {/* coração */}
      <path
        d="M24 38.1c-4-2.4-6.1-4.6-6.1-7 0-1.8 1.4-3.2 3.2-3.2 1.1 0 2.1.5 2.9 1.4.8-.9 1.8-1.4 2.9-1.4 1.8 0 3.2 1.4 3.2 3.2 0 2.4-2.1 4.6-6.1 7Z"
        fill="#f5c518"
      />
    </svg>
  );
}


