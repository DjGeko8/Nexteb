#!/usr/bin/env bash
#
# Dal master gradato alle tre codifiche che il sito serve davvero.
#
# Il montaggio si fa in ../intro (monta-intro.sh, poi grada-vecchio.sh). Questo
# script prende SOLO l'uscita di quello e la prepara per il web.
#
# Il numero che comanda tutte le scelte qui sotto: Cloudflare NON serve
# richieste parziali sugli asset statici. Il file si scarica sempre INTERO,
# anche da chi se ne va dopo tre secondi. Ogni megabyte e' pagato da tutti.
#
# Da qui le due sorgenti e non una sola:
#   - "largo" (1600 px) per lo schermo grande, dove il video sta A TUTTO
#     SCHERMO e una copia stretta ingrandita si vede: la finta interfaccia
#     dentro il filmato ha testo piccolo, ed e' la prima cosa che si sfalda;
#   - "stretto" (1280 px) sotto gli 820, dove i pixel in piu' non li vedrebbe
#     nessuno e la connessione e' quasi sempre peggiore.
#
# Uso:  npm run media
set -euo pipefail

# ffmpeg installato con winget non finisce nel PATH di questa shell.
GYAN="/c/Users/Io/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin"
[ -d "$GYAN" ] && PATH="$PATH:$GYAN"

qui="$(cd "$(dirname "$0")/.." && pwd)"
master="${MASTER:-$qui/../intro/intro-montata-grigia.mp4}"
fuori="$qui/public/media"

[ -f "$master" ] || { echo "manca il master: $master" >&2; exit 1; }
mkdir -p "$fuori"

echo "master: $master"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,nb_frames -show_entries format=duration \
  -of default=nw=1 "$master"

# Il poster e' l'elemento LCP. NON e' il primo fotogramma: il filmato apre su
# una scena scura e un poster nero non dice niente. E' preso a 1,6 s, dove il
# sito vecchio riempie il campo.
echo "-> poster"
# -quality (non -q:v): per il WebP la scala e' 0-100 e piu' alto e' meglio.
# Con -q:v 2 il poster usciva a 18 KB e si sfaldava — ed e' l'immagine LCP,
# cioe' l'unica che qualcuno vede di sicuro.
ffmpeg -y -v error -ss 1.6 -i "$master" -frames:v 1 -quality 88 "$fuori/poster.webp"
ffmpeg -y -v error -ss 1.6 -i "$master" -frames:v 1 -c:v libaom-av1 -crf 32 -still-picture 1 "$fuori/poster.avif"

# -an ovunque: l'audio non c'e' e un flusso vuoto costa comunque intestazioni.
# +faststart mette il moov in testa, se no il browser deve scaricare tutto
# prima di poter cominciare — che con `preload` e' tempo perso a schermo nero.
echo "-> largo, mp4"
ffmpeg -y -v error -i "$master" \
  -vf "scale=1600:-2:flags=lanczos" \
  -c:v libx264 -crf 24 -preset slow -profile:v high -level 4.0 -pix_fmt yuv420p \
  -g 96 -movflags +faststart -an "$fuori/intro-largo.mp4"

echo "-> largo, webm"
ffmpeg -y -v error -i "$master" \
  -vf "scale=1600:-2:flags=lanczos" \
  -c:v libvpx-vp9 -crf 33 -b:v 0 -row-mt 1 -tile-columns 2 -speed 2 \
  -g 96 -an "$fuori/intro-largo.webm"

echo "-> stretto, mp4"
ffmpeg -y -v error -i "$master" \
  -vf "scale=1280:-2:flags=lanczos" \
  -c:v libx264 -crf 26 -preset slow -profile:v high -level 3.1 -pix_fmt yuv420p \
  -g 96 -movflags +faststart -an "$fuori/intro-stretto.mp4"

echo
echo "--- fatto ---"
ls -l "$fuori"
echo
echo "Ricordarsi: se la durata e' cambiata, in config/hero.ts vanno rivisti"
echo "\`durata\`, i \`capitoli\` e \`sovrimpressioneFinoA\`."
