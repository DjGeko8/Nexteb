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
    <div className="strato strato-riquadro vecchio" data-strato="vecchio">
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
          <span />
          <span />
        </div>
        {/* Piu' contenuto di prima, e non per riempire: il corpo si fermava a
            un terzo dell'altezza, quindi in S2 due tessere su tre si portavano
            via del grigio vuoto. Un sito che si spacca deve avere qualcosa da
            spaccare in ogni suo punto. */}
        <div className="v-main" data-parte="d">
          <div className="v-banner">★ SITO IN COSTRUZIONE ★</div>
          <div className="v-img">immagine.jpg</div>
          <div className="v-testo" />
          <div className="v-testo" style={{ width: '82%' }} />
          <div className="v-testo" style={{ width: '64%' }} />
          <div className="v-img v-img-2">foto_sede.jpg</div>
          <div className="v-testo" />
          <div className="v-testo" style={{ width: '71%' }} />
        </div>
      </div>
      <div className="v-piede">
        <span>Ultimo aggiornamento: 14/03/2009</span>
        <span>Ottimizzato per 1024×768</span>
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
/** Le tessere in cui il sito si spacca.
 *
 *  Prima avevano un fondo PIATTO scelto a bande — riga 0 scura, riga 1 meno
 *  scura, prime due colonne chiare, resto grigio — e il risultato era che
 *  quando il sito si spaccava non si spaccavano i SUOI pezzi: si spaccava una
 *  scacchiera di quattro tinte. Ora ogni tessera e' una finestra su un unico
 *  disegno del sito vecchio (--dipinto-vecchio), e mostra la fetta che le
 *  compete: chi prende la testata porta via la testata, chi prende il banner
 *  porta via le righe diagonali.
 *
 *  Otto per sei: piu' fitte sembrano rumore, e ogni tessera in piu' e' un nodo
 *  che il palco puo' dover riscrivere a ogni fotogramma. */
export const COLONNE = 8;
export const RIGHE = 6;

export function Tessere() {
  const celle = [];
  for (let r = 0; r < RIGHE; r++) {
    for (let c = 0; c < COLONNE; c++) {
      celle.push(
        <i
          key={`${r}-${c}`}
          data-dx={c - COLONNE / 2 + 0.5}
          data-dy={r - RIGHE / 2 + 0.5}
          style={
            {
              left: `${(c / COLONNE) * 100}%`,
              top: `${(r / RIGHE) * 100}%`,
              width: `${100 / COLONNE}%`,
              height: `${100 / RIGHE}%`,
              // quale fetta del disegno tocca a questa tessera. Il disegno sta
              // in un posto solo (--dipinto-vecchio, in globals.css); qui c'e'
              // solo la finestra da cui lo si guarda.
              '--c': c,
              '--r': r,
            } as React.CSSProperties
          }
        />,
      );
    }
  }
  return (
    <div className="strato strato-riquadro tessere" data-strato="tessere">
      {celle}
    </div>
  );
}

export const QUANTE_PARTICELLE = 70;

export function Particelle() {
  return (
    <div className="strato strato-riquadro particelle" data-strato="particelle">
      {Array.from({ length: QUANTE_PARTICELLE }, (_, i) => (
        <i
          key={i}
          style={
            {
              left: `${(i * 37) % 100}%`,
              top: `${(i * 61) % 100}%`,
              // quanto e' "vicina": detta misura e luce, cosi' lo sciame ha una
              // profondita' invece di essere settanta punti identici.
              '--p': (((i * 29) % 17) / 16).toFixed(3),
            } as React.CSSProperties
          }
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
    <div className="strato strato-riquadro" data-strato="wire">
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
      className={`strato nuovo ${mobile ? 'strato-telefono nuovo-m' : 'strato-riquadro'}`}
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
      {/* Un'icona e due righe dentro ogni scheda: tre rettangoli vuoti si
          leggono come un segnaposto, per bravo che sia il contorno. */}
      <div className="n-col">
        <div>
          <b />
          <u />
          <s />
        </div>
        <div>
          <b />
          <u />
          <s />
        </div>
        <div>
          <b />
          <u />
          <s />
        </div>
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
    <div className="strato strato-telefono schermate" data-strato="schermate">
      {/* Ogni schermata e' alta quanto il telefono. Prima ne riempiva un terzo —
          un titolo e due righe su seicento pixel — e le altre due terzi erano
          fondo: l'app sembrava un'app che non ha ancora caricato. Qui ognuna ha
          il contenuto che una schermata vera avrebbe, e una barra in fondo:
          e' la barra che dice "questo e' un telefono" meglio di ogni altra cosa
          disegnata. */}
      <div className="nastro" data-parte="nastro">
        <div className="schermo">
          <p className="s-tit">Ciao, Marco</p>
          <div className="s-rig" />
          <div className="s-rig" />
          <div className="s-riquadri">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="s-rig" />
          <div className="s-barra">
            <i className="sel" />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="schermo">
          <p className="s-tit">Prenota un appuntamento</p>
          <div className="s-cal">
            {Array.from({ length: 28 }, (_, i) => (
              <i key={i} className={i === 10 ? 'sel' : undefined} />
            ))}
          </div>
          <div className="s-rig" />
          <div className="s-rig" />
          <div className="s-pieno">Conferma</div>
          <div className="s-barra">
            <i />
            <i className="sel" />
            <i />
            <i />
          </div>
        </div>
        <div className="schermo">
          <p className="s-tit">I tuoi ordini</p>
          <div className="s-rig" />
          <div className="s-rig" />
          <div className="s-rig" />
          <div className="s-rig" />
          <div className="s-barra">
            <i />
            <i />
            <i className="sel" />
            <i />
          </div>
        </div>
        <div className="schermo">
          <p className="s-tit">Assistente AI</p>
          <p className="s-bolla ai" data-bolla="0" data-testo={s5.conversazione[0]} />
          <p className="s-bolla io" data-bolla="1" data-testo={s5.conversazione[1]} />
          <p className="s-bolla ai" data-bolla="2" data-testo={s5.conversazione[2]} />
          <div className="s-scrivi" />
          <div className="s-barra">
            <i />
            <i />
            <i />
            <i className="sel" />
          </div>
        </div>
        <div className="schermo">
          <div className="s-ok">
            <span className="s-cerchio">✓</span>
            <p className="s-tit">Prenotazione confermata</p>
            <div className="s-rig" />
          </div>
          <div className="s-barra">
            <i />
            <i className="sel" />
            <i />
            <i />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ S8 --- */
/** Il telefono si distende e torna rettangolo: dentro, al posto delle
 *  schermate, c'e' il DISEGNO del modulo. Resta un disegno — aria-hidden,
 *  nessun elemento che prenda il fuoco — e dura poco: nell'ultimo quarto di S8
 *  si ritira e al suo posto, nello stesso rettangolo e sulla stessa riga
 *  dell'azione, arriva la cosa vera (components/sections/Sezioni.tsx). Un
 *  modulo finto e uno vero a schermo insieme, nel punto in cui si converte,
 *  sarebbero due inviti di cui uno non si puo' usare ne' raggiungere col Tab. */
export function Modulo() {
  const m = sezioni.s8.modulo;
  return (
    <div className="strato strato-riquadro modulo" data-strato="modulo" aria-hidden="true">
      {/* Due fasce, le stesse del foglio vero: quella che si legge e quella che
          si tocca. Il contenitore serve solo a tenere i tre riquadri disegnati
          in una riga sola della griglia. */}
      <div className="modulo-campi">
        <span className="campo">{m.nome}</span>
        <span className="campo">{m.email}</span>
        <span className="campo campo-alto">{m.messaggio}</span>
      </div>
      <span className="campo-invia">{m.invia}</span>
    </div>
  );
}
