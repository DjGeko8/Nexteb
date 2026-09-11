'use client';

/**
 * Le sezioni.
 *
 * S1-S5 sono spazi di scorrimento: il contenuto visibile e' il telaio, che
 * sta altrove ed e' fermo. Qui c'e' solo il TEMPO della storia e il testo che
 * l'accompagna — perche' il testo dev'essere vero HTML, leggibile senza
 * JavaScript e trovabile da un motore di ricerca.
 *
 * S6-S8 hanno contenuto vero, che scorre sopra il palco mentre il telaio
 * riposa.
 */

import { useCallback, useRef, useState } from 'react';
import { sezioni, eroe, piede } from '@/content/it';
import { SEZIONI } from '@/lib/racconto';
import { eSegnaposto } from '@/lib/segnaposti';

const altezza = (id: string) => `${SEZIONI.find((s) => s.id === id)?.vh ?? 100}vh`;

/* ------------------------------------------------------------------------ */
/** Uno spazio di scorrimento con il suo titolo. Il titolo e' nel documento,
 *  non disegnato: senza JavaScript resta, e i motori lo leggono. */
function Corsa({
  id,
  titolo,
  testo,
}: {
  id: string;
  titolo: string;
  testo?: string;
}) {
  return (
    <section className="corsa" data-sezione={id} style={{ height: altezza(id) }}>
      <div className="corsa-testo">
        <h2>{titolo}</h2>
        {testo && <p>{testo}</p>}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ S6 --- */
function Servizi() {
  const ante = useRef<HTMLDivElement>(null);
  const [taglio, setTaglio] = useState(50);
  const trascina = useRef(false);

  const segui = useCallback((e: React.PointerEvent) => {
    const el = ante.current;
    if (!el || e.pointerType === 'touch') return;
    el.style.setProperty('--x', `${e.clientX}px`);
    el.style.setProperty('--y', `${e.clientY}px`);
    el.dataset.on = 'si';
  }, []);

  const esci = useCallback(() => {
    if (ante.current) ante.current.dataset.on = 'no';
  }, []);

  const taglia = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTaglio(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
  };

  return (
    <section className="pannello servizi-sez" data-sezione="s6" style={{ height: altezza('s6') }}>
      <div className="contenitore">
        <h2 className="sezione-titolo">{sezioni.s6.titolo}</h2>

        {/* Quattro righe tipografiche, non quattro schede uguali: le schede
            sono il modo piu' rapido di far sembrare un sito un modello. */}
        <div className="servizi" onPointerLeave={esci}>
          {sezioni.s6.voci.map((v) => (
            <article
              key={v.nome}
              className="servizio"
              onPointerMove={segui}
              onPointerEnter={segui}
            >
              <h3>{v.nome}</h3>
              <p>{v.testo}</p>

              {'confronto' in v && v.confronto && (
                <div
                  className="confronto"
                  style={{ ['--taglio' as string]: `${taglio}%` }}
                  onPointerDown={(e) => {
                    trascina.current = true;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    taglia(e);
                  }}
                  onPointerMove={(e) => {
                    if (trascina.current) taglia(e);
                  }}
                  onPointerUp={() => {
                    trascina.current = false;
                  }}
                  role="slider"
                  aria-label="Confronto fra il sito prima e dopo"
                  aria-valuenow={Math.round(taglio)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') setTaglio((t) => Math.max(0, t - 5));
                    if (e.key === 'ArrowRight') setTaglio((t) => Math.min(100, t + 5));
                  }}
                >
                  <span className="lato prima">{sezioni.s6.prima}</span>
                  <span className="lato dopo">{sezioni.s6.dopo}</span>
                  <span className="maniglia" />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* L'anteprima segue il cursore: esiste solo dove c'e' un cursore. */}
      <div className="anteprima" ref={ante} data-on="no" aria-hidden="true">
        <span />
        <span style={{ width: '70%' }} />
        <span style={{ width: '85%' }} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ S7 --- */
/** Una vera sequenza, quindi la numerazione sarebbe giustificata — ma quattro
 *  parole su una linea che si disegna dicono la stessa cosa senza contarla. */
function Metodo() {
  return (
    <section className="pannello metodo-sez" data-sezione="s7" style={{ height: altezza('s7') }}>
      <div className="contenitore metodo">
        <h2 className="sezione-titolo">{sezioni.s7.titolo}</h2>
        <svg className="linea-svg" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
          <line x1="10" y1="30" x2="990" y2="30" style={{ ['--len' as string]: '980' }} />
        </svg>
        <ol className="tappe">
          {sezioni.s7.tappe.map((t) => (
            <li key={t.nome} className="tappa">
              <i aria-hidden="true" />
              <b>{t.nome}</b>
              <span>{t.testo}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ S8 --- */
function Finale({ onContatti }: { onContatti: () => void }) {
  const seguiCursore = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const b = e.currentTarget;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--cx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
  }, []);

  const ragione = piede.ragioneSociale;
  const piva = piede.piva;

  return (
    <section className="pannello finale-sez" data-sezione="s8" style={{ height: altezza('s8') }}>
      <div className="contenitore finale">
        <p className="claim">{sezioni.s8.claim}</p>

        <button
          type="button"
          className="bottone-grande"
          onClick={onContatti}
          onPointerMove={seguiCursore}
        >
          {eroe.contattaci}
        </button>

        <footer className="piede">
          <span className={eSegnaposto(ragione) ? 'tbd' : undefined}>{ragione}</span>
          <span className={eSegnaposto(piva) ? 'tbd' : undefined}>P.IVA {piva}</span>
          <a href="/privacy/">{piede.privacy}</a>
          <a href="/cookie/">{piede.cookie}</a>
          <span>{piede.anno}</span>
        </footer>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
export function Sezioni({ onContatti }: { onContatti: () => void }) {
  return (
    <>
      <Corsa id="s1" titolo={sezioni.s1.titolo} testo={sezioni.s1.testo} />
      <Corsa id="s2" titolo={sezioni.s2.titolo} testo={sezioni.s2.testo} />
      <Corsa id="s3" titolo={sezioni.s3.titolo} testo={sezioni.s3.testo} />
      <Corsa id="s4" titolo={sezioni.s4.titolo} testo={sezioni.s4.testo} />
      <Corsa id="s5" titolo={sezioni.s5.titolo} testo={sezioni.s5.testo} />
      <Servizi />
      <Metodo />
      <Finale onContatti={onContatti} />
    </>
  );
}
