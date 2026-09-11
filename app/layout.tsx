import type { Metadata, Viewport } from 'next';
import { meta } from '@/content/it';
import './globals.css';

/* Serve a risolvere gli URL assoluti delle anteprime social. Va cambiato con
   il dominio vero: e- l-unico posto in cui compare. */
const SITO = process.env.NEXT_PUBLIC_SITO ?? "https://nexteb.invalid";

export const metadata: Metadata = {
  metadataBase: new URL(SITO),
  title: meta.titolo,
  description: meta.descrizione,
  openGraph: {
    title: meta.titolo,
    description: meta.descrizione,
    type: 'website',
    locale: 'it_IT',
    images: [{ url: '/media/poster.webp', width: 1920, height: 1080, alt: meta.claim }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#020611',
  colorScheme: 'dark',
};

/**
 * Lo snippet che mette `js` su <html> prima del primo paint.
 *
 * Serve perche' lo stato base resti VISIBILE senza JavaScript: lo stato
 * nascosto delle comparse vive solo sotto `html.js`. Se questo non gira, il
 * contenuto c'e' comunque — che e' l'unico modo di non spedire una pagina che
 * puo' restare vuota.
 *
 * `suppressHydrationWarning` sull'elemento <html> non e' facoltativo: React 19
 * confronta esplicitamente gli attributi di <html> in idratazione e senza di
 * quello segnala il mismatch, potendo togliere la classe.
 */
const SNIPPET_JS = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SNIPPET_JS }} />
        <link rel="preload" as="image" href="/media/poster.webp" fetchPriority="high" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/Archivo-Variable.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/InstrumentSans-Variable.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a href="#contenuto" className="salta">
          Vai al contenuto
        </a>
        {children}
      </body>
    </html>
  );
}
