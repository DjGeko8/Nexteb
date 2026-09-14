/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sito statico: si pubblica ovunque, niente runtime da mantenere.
  output: 'export',

  // Normalmente vuoto: il sito vive alla radice del suo dominio.
  //
  // Serve solo al campionario, che raccoglie i siti sotto `siti/<nome>/`: li'
  // gli indirizzi assoluti che Next scrive da se' (`/_next/...`, `/media/...`)
  // punterebbero alla radice sbagliata e la pagina uscirebbe senza stile, senza
  // script e senza video — in silenzio, che e' il modo peggiore di rompersi.
  // Si imposta da `npm run build:campionario`, mai a mano.
  basePath: process.env.NEXT_BASE_PATH || undefined,

  trailingSlash: true,
  images: { unoptimized: true },
  // il badge di sviluppo di Next copre l'angolo in basso a sinistra della grafica
  devIndicators: false,
  // La build gira con --webpack: Turbopack va in OOM sulle macchine con poca RAM
  // (documentato in npm run build). Non e' una preferenza, e' un limite misurato.
};
export default nextConfig;
