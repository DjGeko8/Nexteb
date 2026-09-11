import type { Metadata, Viewport } from 'next';
import { meta } from '@/content/it';
import './globals.css';

/**
 * Il dominio. Serve a risolvere gli URL assoluti delle anteprime social, ed e'
 * l'unico posto in cui compare.
 *
 * Finche' non e' quello vero si usa un dominio riservato (RFC 2606) e il sito
 * si pubblica con `noindex`: un'anteprima finita nei motori e' difficile da
 * togliere, e nel frattempo compete con il sito vero. Si riattiva da solo
 * appena NEXT_PUBLIC_SITO ha un valore.
 *
 * Attenzione: e' una variabile NEXT_PUBLIC_, quindi viene letta AL MOMENTO
 * DELLA BUILD e finisce dentro l'HTML. Cambiarla nel pannello non basta:
 * serve una nuova build.
 */
const SITO = process.env.NEXT_PUBLIC_SITO ?? 'https://nexteb.invalid';
const inAnteprima = SITO.includes('.invalid');

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
  robots: inAnteprima ? { index: false, follow: false } : { index: true, follow: true },
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
