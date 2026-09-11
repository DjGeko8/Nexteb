'use client';

/**
 * IL PALCO — il telaio che attraversa tutto il sito.
 *
 * Un rettangolo nasce nella hero e non viene mai distrutto: cambia contenuto,
 * proporzioni e distanza fino a diventare il modulo di contatto. Per questo il
 * palco e' `position: fixed` e non serve NESSUN pin di ScrollTrigger — niente
 * si aggancia perche' niente si e' mai sganciato. Otto sezioni con otto pin
 * sarebbero otto oggetti diversi che si somigliano; questo e' un oggetto solo.
 *
 * Nota sul metodo: da qui in giu' NON si passa per lo stato di React. Un
 * `scrub` chiama la funzione a ogni fotogramma, e far ridisegnare l'albero
 * sessanta volte al secondo per muovere un `clip-path` e' il modo piu' sicuro
 * di perdere i 60 fps. Si scrivono le custom property direttamente sul nodo,
 * che e' poi quello che GSAP fa da se'.
 */

import { useEffect, useRef } from 'react';
import { VideoHero } from '@/components/hero/VideoHero';
import {
  Modulo,
  Particelle,
  Schermate,
  SitoNuovo,
  SitoVecchio,
  Tessere,
  Wireframe,
} from './Strati';
import { caricaPlugin } from '@/lib/gsap';
import { SEZIONI, fin, fra, misureTelefono, px, type IdSezione } from '@/lib/racconto';

type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  pronto: boolean;
  onTempo: (s: number) => void;
  onSezione: (id: IdSezione, p: number) => void;
};

export function Palco({ videoRef, pronto, onTempo, onSezione }: Props) {
  const guscio = useRef<HTMLDivElement>(null);
  const telaio = useRef<HTMLDivElement>(null);
  const scocca = useRef<SVGSVGElement>(null);
  const avvisa = useRef(onSezione);
  avvisa.current = onSezione;

  useEffect(() => {
    const g = guscio.current;
    const t = telaio.current;
    if (!g || !t) return;

    const q = <E extends Element>(sel: string) => t.querySelector<E>(sel);
    const strati = new Map<string, HTMLElement>();
    t.querySelectorAll<HTMLElement>('[data-strato]').forEach((el) => {
      strati.set(el.dataset.strato!, el);
    });

    const tessere = Array.from(t.querySelectorAll<HTMLElement>('[data-strato="tessere"] i'));
    const particelle = Array.from(t.querySelectorAll<HTMLElement>('[data-strato="particelle"] i'));
    const rettangoli = Array.from(t.querySelectorAll<SVGRectElement>('.wire-svg rect'));
    const bolle = Array.from(t.querySelectorAll<HTMLElement>('[data-bolla]'));
    const guscioTel = scocca.current?.querySelector<SVGRectElement>('[data-guscio]') ?? null;
    const tacca = scocca.current?.querySelector<SVGLineElement>('[data-tacca]') ?? null;

    if (guscioTel) {
      const L = guscioTel.getTotalLength?.() ?? 1000;
      guscioTel.style.setProperty('--len', String(L));
    }
    tacca?.style.setProperty('--len', '50');

    /* ----------------------------------------------------- primitive --- */
    const mostra = (m: Record<string, number>) => {
      for (const [nome, el] of strati) {
        el.style.opacity = String(m[nome] ?? 0);
      }
    };
    const clip = (l: number, r: number, alto: number, basso: number, rad: number) => {
      t.style.setProperty('--l', px(l));
      t.style.setProperty('--r', px(r));
      t.style.setProperty('--t', px(alto));
      t.style.setProperty('--b', px(basso));
      t.style.setProperty('--rad', px(rad));
    };
    const scala = (s: number, alza: number) => {
      g.style.setProperty('--scala', s.toFixed(3));
      g.style.setProperty('--alza', px(alza));
    };
    const vis = (v: number) => g.style.setProperty('--vis', v.toFixed(3));
    const disegnaScocca = (v: number, vTacca: number) => {
      guscioTel?.style.setProperty('--dis', v.toFixed(3));
      tacca?.style.setProperty('--dis', vTacca.toFixed(3));
    };
    const parte = (nome: string) => q<HTMLElement>(`[data-parte="${nome}"]`);

    /**
     * Le misure del telefono, scritte come variabili sul telaio.
     *
     * Servono agli strati impaginati alla larghezza del telefono invece che a
     * quella del telaio. Prima erano container query: facevano la stessa cosa
     * ma ririsolvevano a ogni fotogramma, e con la conversazione che si scrive
     * dentro bastavano a bloccare il renderer. Qui si calcolano quando la
     * finestra cambia, cioe' quasi mai.
     */
    const misura = () => {
      const m = misureTelefono(g.offsetWidth, g.offsetHeight);
      t.style.setProperty('--tel-w', px(g.offsetWidth - m.lato * 2));
      t.style.setProperty('--tel-h', px(g.offsetHeight));
    };
    misura();
    // ResizeObserver e non solo 'resize': al primo giro il guscio non ha ancora
    // la misura definitiva (i caratteri devono ancora arrivare) e le variabili
    // resterebbero stantie per sempre, senza che niente lo segnali.
    const osserva = new ResizeObserver(() => misura());
    osserva.observe(g);

    /**
     * Il titolo della sezione.
     *
     * Con `position: sticky` e basta, il titolo che esce resta appiccicato
     * mentre entra quello dopo, e per un istante se ne leggono due. Qui
     * l'opacita' segue l'avanzamento: entra nel primo quarto, esce nell'ultimo,
     * e fra una sezione e l'altra resta un momento in cui non c'e' nessun
     * titolo — che e' quello che fa sembrare il cambio una cosa sola.
     */
    const titoli = new Map<string, HTMLElement>();
    for (const { id } of SEZIONI) {
      const el = document.querySelector<HTMLElement>(`[data-sezione="${id}"] .corsa-testo`);
      if (el) titoli.set(id, el);
    }
    const titolo = (id: string, p: number) => {
      const el = titoli.get(id);
      if (!el) return;
      el.style.opacity = (fin(p, 0.08, 0.26) * (1 - fin(p, 0.8, 0.95))).toFixed(3);
    };

    /* ------------------------------------------------------ sezioni --- */
    const atto: Record<IdSezione, (p: number) => void> = {
      hero(p) {
        mostra({ video: 1 });
        clip(0, 0, 0, 0, 6);
        vis(1);
        scala(fra(1, 0.94, fin(p, 0.55, 1)), 0);
        disegnaScocca(0, 0);
      },

      s1(p) {
        const d = fin(p, 0, 0.25);
        mostra({ video: 1 - d, vecchio: d });
        clip(0, 0, 0, 0, 6);
        vis(1);
        scala(fra(0.94, 1, fin(p, 0, 0.3)), 0);

        // i livelli scivolano fuori allineamento: il sito non si rompe di
        // colpo, si scolla — che e' come invecchiano davvero
        const s = fin(p, 0.3, 0.95);
        parte('a')?.style.setProperty('transform', `translateX(${px(fra(0, -14, s))})`);
        parte('b')?.style.setProperty('transform', `translateX(${px(fra(0, 10, s))})`);
        parte('c')?.style.setProperty('transform', `translate(${px(fra(0, -6, s))}, ${px(fra(0, 9, s))})`);
        parte('d')?.style.setProperty('transform', `translateY(${px(fra(0, -7, s))})`);
        parte('glitch')?.style.setProperty('--gl', (fin(p, 0.55, 0.8) * 0.5).toFixed(2));
        parte('popup')?.style.setProperty('--pop', fin(p, 0.5, 0.62).toFixed(3));
      },

      s2(p) {
        const esplode = fin(p, 0.1, 0.72);
        const opTessere = fin(p, 0, 0.12) * (1 - fin(p, 0.62, 0.86));
        const opParticelle = fin(p, 0.45, 0.7) * (1 - fin(p, 0.85, 1));

        mostra({
          vecchio: 1 - fin(p, 0, 0.12),
          tessere: opTessere,
          particelle: opParticelle,
        });
        clip(0, 0, 0, 0, 6);
        vis(1);
        scala(1, 0);

        // Quarantotto tessere e settanta particelle: se lo strato non si vede,
        // scriverci sopra e' lavoro buttato che il browser paga lo stesso. La
        // prima versione le riscriveva tutte a ogni fotogramma e ha bloccato
        // il renderer — il taglio non e' un'ottimizzazione, e' una correzione.
        if (opTessere > 0.01) {
          tessere.forEach((el, i) => {
            const dx = Number(el.dataset.dx ?? 0);
            const dy = Number(el.dataset.dy ?? 0);
            const k = Math.max(0, Math.min(1, esplode * 1.35 - (i / tessere.length) * 0.35));
            el.style.transform =
              `translate3d(${px(dx * k * 90)}, ${px(dy * k * 70)}, ${(k * -260).toFixed(0)}px)` +
              ` rotateX(${(dy * k * 42).toFixed(1)}deg) rotateY(${(dx * k * 34).toFixed(1)}deg)`;
            el.style.opacity = (1 - k * 0.9).toFixed(3);
          });
        }

        if (opParticelle > 0.01) {
          const pp = fin(p, 0.45, 1);
          const op = (Math.sin(pp * Math.PI) * 0.9).toFixed(3);
          particelle.forEach((el) => {
            const sx = Number(el.dataset.sx ?? 0);
            const sy = Number(el.dataset.sy ?? 0);
            el.style.transform = `translate3d(${px(sx * pp * 60)}, ${px(sy * pp * 90)}, 0)`;
            el.style.opacity = op;
          });
        }
      },

      s3(p) {
        const dis = fin(p, 0.05, 0.45);
        mostra({
          wire: fin(p, 0, 0.08) * (1 - fin(p, 0.6, 0.85)),
          nuovo: fin(p, 0.45, 0.75),
        });
        clip(0, 0, 0, 0, 6);
        vis(1);
        scala(1, 0);
        rettangoli.forEach((r, i) => {
          r.style.setProperty('--dis', fin(dis, i * 0.09, i * 0.09 + 0.5).toFixed(3));
        });
        // lo sweep di luce che riempie il sito appena finito
        q<HTMLElement>('.n-hero')?.style.setProperty('--sweep', fra(-1, 1, fin(p, 0.7, 0.95)).toFixed(3));
      },

      s4(p) {
        const m = misureTelefono(g.offsetWidth, g.offsetHeight);
        const stretta = fin(p, 0.15, 0.45);
        const incrocio = fin(p, 0.45, 0.6);
        const disegno = fin(p, 0.55, 0.8);
        const finale = fin(p, 0.8, 1);

        mostra({ nuovo: 1 - incrocio, 'nuovo-m': incrocio });
        clip(
          fra(0, m.lato, stretta),
          fra(0, m.lato, stretta),
          fra(0, m.vert, stretta),
          fra(0, m.vert, stretta),
          fra(6, 24, stretta),
        );
        // la barra del browser si spegne per prima: da qui non e' piu' "un
        // sito in una finestra", e' un oggetto
        q<HTMLElement>('[data-strato="nuovo"] .n-barra')?.style.setProperty(
          'opacity',
          (1 - fin(p, 0, 0.15)).toFixed(2),
        );
        disegnaScocca(disegno, fin(p, 0.7, 0.85));
        scala(fra(1, 0.86, finale), fra(0, -16, finale));
        vis(1);
      },

      s5(p) {
        const m = misureTelefono(g.offsetWidth, g.offsetHeight);
        mostra({ 'nuovo-m': 1 - fin(p, 0, 0.12), schermate: fin(p, 0, 0.12) });
        clip(m.lato, m.lato, m.vert, m.vert, 24);
        scala(0.86, -16);
        vis(1 - fin(p, 0.92, 1));
        disegnaScocca(1, 1);

        const avanz = fin(p, 0.08, 0.95);
        parte('nastro')?.style.setProperty('--y', (avanz * 4 * g.offsetHeight).toFixed(1));

        // la conversazione si scrive: e' HTML, non un'immagine
        // Riscrivere textContent forza il layout: si tocca solo quando il
        // numero di caratteri cambia davvero, non a ogni fotogramma.
        const scritto = fin(p, 0.45, 0.78);
        bolle.forEach((b, k) => {
          const testo = b.dataset.testo ?? '';
          const suo = fin(scritto, k * 0.3, k * 0.3 + 0.28);
          const quanti = Math.round(testo.length * suo);
          if (b.dataset.quanti !== String(quanti)) {
            b.dataset.quanti = String(quanti);
            b.textContent = testo.slice(0, quanti);
          }
          b.style.opacity = suo > 0 ? '1' : '0';
        });
      },

      s6(p) {
        // il telaio riposa: e' l'unica sezione senza. Se ci fosse ovunque
        // smetterebbe di essere un oggetto e diventerebbe un tic.
        vis(1 - fin(p, 0, 0.18));
      },

      s7() {
        vis(0);
      },

      s8(p) {
        const m = misureTelefono(g.offsetWidth, g.offsetHeight);
        const apre = fin(p, 0.12, 0.55);
        mostra({ schermate: 1 - fin(p, 0.1, 0.35), modulo: fin(p, 0.18, 0.5) });
        clip(
          fra(m.lato, 0, apre),
          fra(m.lato, 0, apre),
          fra(m.vert, 0, apre),
          fra(m.vert, 0, apre),
          fra(24, 6, apre),
        );
        disegnaScocca(1 - apre, 1 - apre);
        scala(fra(0.86, 1, apre), fra(-16, 0, apre));
        vis(fin(p, 0.04, 0.18));
      },
    };

    /* -------------------------------------------------- registrazione --- */
    let vivo = true;
    const disfa: Array<() => void> = [];

    caricaPlugin().then(({ ScrollTrigger }) => {
      if (!vivo) return;

      for (const { id } of SEZIONI) {
        const bersaglio = document.querySelector<HTMLElement>(`[data-sezione="${id}"]`);
        if (!bersaglio) continue;

        const st = ScrollTrigger.create({
          trigger: bersaglio,
          // 'bottom top' e non 'bottom bottom': con quest-ultimo la corsa
          // utile e- (altezza sezione - altezza schermo), cioe- 30vh su una
          // sezione da 130vh — l-animazione sfreccia e finisce subito. Cosi-
          // invece l-avanzamento dura esattamente quanto la sezione.
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            atto[id](self.progress);
            titolo(id, self.progress);
            avvisa.current(id, self.progress);
          },
        });
        disfa.push(() => st.kill());
      }

      ScrollTrigger.refresh();
    });

    // stato iniziale: la hero a zero, prima che ScrollTrigger esista
    atto.hero(0);

    return () => {
      vivo = false;
      osserva.disconnect();
      disfa.forEach((f) => f());
    };
  }, []);

  return (
    <div className="palco">
      <div className="telaio-guscio" ref={guscio}>
        <div className="telaio" ref={telaio}>
          <div className="strato" data-strato="video">
            <VideoHero videoRef={videoRef} pronto={pronto} onTempo={onTempo} />
          </div>
          <SitoVecchio />
          <Tessere />
          <Particelle />
          <Wireframe />
          <SitoNuovo />
          <SitoNuovo mobile />
          <Schermate />
          <Modulo />
        </div>

        {/* La scocca sta FUORI dal telaio ritagliato: dentro verrebbe tagliata
            anche lei, ed e' proprio il bordo che deve restare intero. */}
        <svg
          className="scocca"
          ref={scocca}
          viewBox="0 0 620 349"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <rect data-guscio x="230" y="0" width="160" height="349" rx="24" ry="24" />
          <line data-tacca x1="285" y1="13" x2="335" y2="13" />
        </svg>
      </div>
    </div>
  );
}
