/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sito statico: si pubblica ovunque, niente runtime da mantenere.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // il badge di sviluppo di Next copre l'angolo in basso a sinistra della grafica
  devIndicators: false,
  // La build gira con --webpack: Turbopack va in OOM sulle macchine con poca RAM
  // (documentato in npm run build). Non e' una preferenza, e' un limite misurato.
};
export default nextConfig;
