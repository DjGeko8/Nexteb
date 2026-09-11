'use client';

/**
 * Gli strati dentro il telaio.
 *
 * Sono tutti presenti dal primo momento e si scoprono per opacita': il telaio
 * non viene mai svuotato e riempito, cambia solo cosa si vede attraverso.
 * E' la stessa ragione per cui il palco e' fisso — la continuita' dell'oggetto
 * e' la tesi del sito, quindi vale anche dentro.
 */

import { sezioni } from '@/content/it';

/* ------------------------------------------------------------------ S1 --- */
/** Il sito vecchio. Grigio-blu, non beige: il caldo spezzava la grafica.
 *  I grigi sono campionati dal fotogramma del video, H236 S7. */
export function SitoVecchio() {
  return (
    <div className="strato vecchio" data-strato="vecchio">
      <div className="v-testata" data-parte="a">
        <b>La Tua Azienda</b>
        <span>visite: 004213</span>
      </div>
      <div className="v-nav" data-parte="b">
        <span>Home</span>
        <span>Chi siamo</span>
        <span>Prodotti</span>
        <span>Contatti</span>
      </div>
      <div className="v-corpo">
        <div className="v-lato" data-parte="c">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="v-main" data-parte="d">
          <div className="v-banner">★ SITO IN COSTRUZIONE ★</div>
          <div className="v-img">immagine.jpg</div>
          <div className="v-testo" />
          <div className="v-testo" style={{ width: '82%' }} />
          <div className="v-testo" style={{ width: '64%' }} />
        </div>
      </div>
      <div className="v-glitch" data-parte="glitch" />
      <div className="v-rotella" />
      <div className="v-popup" data-parte="popup">
        <div className="v-popup-barra">
          <span>Errore</span>
          <span>✕</span>
        </div>
        <div className="v-popup-corpo">
          <span className="v-popup-segno">⚠</span>
          <span>Errore 404 — Pagina non trovata</span>
        </div>
        <span className="v-popup-ok">OK</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ S2 --- */
/** Le tessere in cui il sito si spacca: prendono le sue tinte, perche' sono
 *  letteralmente i suoi pezzi. Otto per sei: piu' fitte sembrano rumore. */
export const COLONNE = 8;
export const RIGHE = 6;

export function Tessere() {
  const celle = [];
  for (let r = 0; r < RIGHE; r++) {
    for (let c = 0; c < COLONNE; c++) {
      const tinta =
        r === 0 ? '#2A2C3B' : r === 1 ? '#3D3F4E' : c < 2 ? '#D2D3DC' : '#B6B7C2';
      celle.push(
        <i
          key={`${r}-${c}`}
          data-dx={c - COLONNE / 2 + 0.5}
          data-dy={r - RIGHE / 2 + 0.5}
          style={{
            left: `${(c / COLONNE) * 100}%`,
            top: `${(r / RIGHE) * 100}%`,
            width: `${100 / COLONNE}%`,
            height: `${100 / RIGHE}%`,
            background: tinta,
          }}
        />,
      );
    }
  }
  return (
    <div className="strato tessere" data-strato="tessere">
      {celle}
    </div>
  );
}

export const QUANTE_PARTICELLE = 70;

export function Particelle() {
  return (
    <div className="strato particelle" data-strato="particelle">
      {Array.from({ length: QUANTE_PARTICELLE }, (_, i) => (
        <i
          key={i}
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%` }}
          data-sx={((i * 13) % 21) / 10 - 1}
          data-sy={-(((i * 7) % 7) / 10 + 0.3)}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ S3 --- */
/** Il wireframe che si disegna. I rettangoli sono la griglia del sito nuovo:
 *  quando finiscono di disegnarsi, i blocchi ci scattano dentro. */
const FORME = [
  [14, 12, 592, 22],
  [14, 44, 592, 132],
  [14, 188, 192, 72],
  [218, 188, 184, 72],
  [414, 188, 192, 72],
  [14, 276, 420, 8],
] as const;

export function Wireframe() {
  return (
    <div className="strato" data-strato="wire">
      <svg className="wire-svg" viewBox="0 0 620 349" preserveAspectRatio="none" aria-hidden="true">
        {FORME.map(([x, y, w, h]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={w}
            height={h}
            style={{ ['--len' as string]: String(2 * (w + h)) }}
          />
        ))}
      </svg>
    </div>
  );
}

/* --------------------------------------------------------------- S3/S4 --- */
/** Il sito nuovo, nelle due impaginazioni VERE: quella da schermo largo e
 *  quella da telefono. Non e' una che si stira — sono due, e si incrociano in
 *  dissolvenza quando la finestra ha gia' cambiato forma. */
export function SitoNuovo({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={`strato nuovo${mobile ? ' nuovo-m' : ''}`}
      data-strato={mobile ? 'nuovo-m' : 'nuovo'}
    >
      <div className="n-barra">
        {!mobile && (
          <>
            <i />
            <i />
            <i />
          </>
        )}
      </div>
      <div className="n-hero">
        <div className="n-t" />
        <div className="n-s" />
        <div className="n-b" />
      </div>
      <div className="n-col">
        <div />
        <div />
        <div />
      </div>
      {!mobile && <div className="n-rig" />}
    </div>
  );
}

/* ------------------------------------------------------------------ S5 --- */
/** Le schermate dell'app scorrono DENTRO il telefono, che resta fermo.
 *  La conversazione dell'assistente si scrive in HTML sopra, non e' immagine:
 *  cosi' si legge, si seleziona e si traduce. */
export function Schermate() {
  const s5 = sezioni.s5;
  return (
    <div className="strato schermate" data-strato="schermate">
      <div className="nastro" data-parte="nastro">
        <div className="schermo">
          <p className="s-tit">Ciao, Marco</p>
          <div className="s-rig" />
          <div className="s-rig" />
        </div>
        <div className="schermo">
          <p className="s-tit">Prenota un appuntamento</p>
          <div className="s-cal">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} className={i === 3 ? 'sel' : undefined} />
            ))}
          </div>
          <div className="s-rig" />
        </div>
        <div className="schermo">
          <p className="s-tit">I tuoi ordini</p>
          <div className="s-rig" />
          <div className="s-rig" />
        </div>
        <div className="schermo">
          <p className="s-tit">Assistente AI</p>
          <p className="s-bolla ai" data-bolla="0" data-testo={s5.conversazione[0]} />
          <p className="s-bolla io" data-bolla="1" data-testo={s5.conversazione[1]} />
          <p className="s-bolla ai" data-bolla="2" data-testo={s5.conversazione[2]} />
        </div>
        <div className="schermo">
          <div className="s-ok">
            <span className="s-cerchio">✓</span>
            <p className="s-tit">Prenotazione confermata</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ S8 --- */
/** Il telefono si distende e torna rettangolo: dentro, al posto delle
 *  schermate, ci sono i campi. E' la chiusura del cerchio — l'oggetto che si e'
 *  guardato trasformarsi per tutta la pagina e' la cosa in cui si scrive. */
export function Modulo() {
  const m = sezioni.s8.modulo;
  return (
    <div className="strato modulo" data-strato="modulo" aria-hidden="true">
      <span className="campo">{m.nome}</span>
      <span className="campo">{m.email}</span>
      <span className="campo campo-alto">{m.messaggio}</span>
      <span className="campo-invia">{m.invia}</span>
    </div>
  );
}
