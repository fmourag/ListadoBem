import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { PIX_PAYLOAD } from '@/lib/contribuicao';

/** Gerado no build; servido como asset estático cacheável. */
export const dynamic = 'force-static';

export async function GET() {
  const svg = await QRCode.toString(PIX_PAYLOAD, {
    type: 'svg',
    margin: 1,
    width: 200,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b1e33', light: '#ffffff' },
  });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
