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
import {
  SEZIONI,
  fin,
  fra,
  misureRiquadro,
  misureTelefono,
  px,
  type IdSezione,
} from '@/lib/racconto';

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
     * IL CANALE VERSO IL FINALE — due numeri, e basta.
     *
     * Lo stato del telaio (apertura, scala, opacita') vive sulle custom
     * property del guscio e del ritaglio, e il finale non discende da nessuno
     * dei due: non puo' leggerlo. Invece di allargare quelle variabili a tutto
     * il documento — che vorrebbe dire invalidare la radice sessanta volte al
     * secondo — il palco scrive due soli numeri, e li scrive SULLA SEZIONE che
     * li usa:
     *   --scoperto  quanto il fondo del pannello finale si e' ritirato
     *   --consegna  quanto la cosa vera ha preso il posto del disegno
     *
     * Li scrive SOLO l'atto s8, e s7 li rimette a zero. Dove non li scrive
     * nessuno le variabili non esistono e il CSS cade sui ripieghi 0 e 1, cioe'
     * sulla pagina di oggi: pannello opaco, contenuto visibile. E' il verso
     * giusto proprio nei casi che nessuno prova — JavaScript spento, il chunk
     * di ./plugin che non arriva, il fondo pagina raggiunto con un salto — dove
     * `html.js` c'e' GIA' e una guardia appesa a lui non scatterebbe, mentre il
     * palco e' rimasto al fotogramma di atto.hero(0): video a tutto schermo.
     * Per la stessa ragione non si infila `scopri` dentro `vis`: vis(1) lo
     * chiama anche atto.hero(0), che gira sempre.
     */
    const sezFinale = document.querySelector<HTMLElement>('[data-sezione="s8"]');
    let consegnato = '';
    const scopri = (v: number) => sezFinale?.style.setProperty('--scoperto', v.toFixed(3));
    const consegna = (v: number) => {
      sezFinale?.style.setProperty('--consegna', v.toFixed(3));
      // Il bottone vero non deve essere premibile mentre il foglio e'
      // invisibile, ma la soglia sta in BASSO e non in alto: con una soglia
      // alta resterebbe una finestra di scorrimento in cui la capsula si vede
      // quasi piena, si tocca e non succede niente — nel punto di conversione e
      // senza nemmeno uno stato hover a smentirlo. Meglio un bersaglio appena
      // visibile che funziona. L'attributo si riscrive solo quando cambia
      // davvero: e' uno stato, non un fotogramma.
      const stato = v > 0.01 ? 'si' : 'no';
      if (sezFinale && consegnato !== stato) {
        consegnato = stato;
        sezFinale.dataset.consegnato = stato;
      }
    };

    /**
     * Nel ramo a movimento ridotto una dissolvenza diventa uno SCATTO: qui lo
     * scorrimento non muove un disegno, muove il testo vero e l'unica chiamata
     * all'azione, e la regola del progetto dice che nel ramo ridotto
     * un'animazione non si spegne — si sostituisce con qualcosa che comunica lo
     * stesso stato. Si rilegge a ogni fotogramma, quindi segue la preferenza
     * anche se cambia a sito aperto.
     */
    const menoMoto = matchMedia('(prefers-reduced-motion: reduce)');
    const dissolve = (v: number) => (menoMoto.matches ? (v >= 0.5 ? 1 : 0) : v);

    /**
     * LE DUE MISURE, calcolate in un posto solo.
     *
     * Il palco e' grande quanto lo schermo. Il RIQUADRO e' la finestra 16:9 in
     * cui vive il racconto; il TELEFONO e' quello che il riquadro diventa. Le
     * due misure servono sia al ritaglio (in JavaScript) sia all'impaginazione
     * degli strati (in CSS), e se divergessero il disegno si vedrebbe a fette.
     * Per questo si scrivono come variabili sulla radice: una fonte, tanti
     * lettori — il palco, gli strati, e chi sta fuori dal palco.
     *
     * Prima erano container query: facevano la stessa cosa ma ririsolvevano a
     * ogni fotogramma, e con la conversazione che si scrive dentro bastavano a
     * bloccare il renderer. Qui si calcolano quando la finestra cambia.
     */
    let RQ = misureRiquadro(g.offsetWidth, g.offsetHeight);
    let TEL = misureTelefono(g.offsetWidth, g.offsetHeight);

    /** Dove siamo, per poter ridipingere dopo un ridimensionamento. */
    const ultimo = { id: 'hero' as IdSezione, p: 0 };
    /** Riempita quando `atto` esiste: misura() gira anche prima. */
    let ridipingi = () => {};

    const misura = () => {
      const w = g.offsetWidth;
      const h = g.offsetHeight;
      if (!w || !h) return;
      RQ = misureRiquadro(w, h);
      TEL = misureTelefono(w, h);
      // Sulla RADICE, non sul guscio: le stesse misure servono anche a chi sta
      // fuori dal palco — il finale deve potersi allineare al riquadro senza
      // riscriversi i numeri per conto suo, che e' esattamente il modo in cui
      // CSS e JavaScript cominciano a divergere.
      const r = document.documentElement.style;
      r.setProperty('--rq-w', px(RQ.w));
      r.setProperty('--rq-h', px(RQ.h));
      r.setProperty('--tel-w', px(TEL.w));
      r.setProperty('--tel-h', px(TEL.h));
      vestiScocca();
      // Il ritaglio e' scritto in pixel: dopo un ridimensionamento quei pixel
      // sono di un'altra finestra. Si ridipinge il punto in cui siamo, se no
      // il telaio resta della misura di prima finche' non si scorre.
      ridipingi();
    };

    /**
     * La scocca prende il viewBox dalla misura vera del telefono.
     *
     * Con un viewBox fisso e `preserveAspectRatio="none"` il tratto si
     * deformerebbe — spesso sui lati corti, sottile su quelli lunghi — e gli
     * angoli si ovalizzerebbero. Cosi' invece il rapporto combacia sempre.
     */
    const vestiScocca = () => {
      const sv = scocca.current;
      if (!sv || !guscioTel || !tacca) return;
      const w = TEL.w;
      const h = TEL.h;
      sv.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);
      guscioTel.setAttribute('x', '0.75');
      guscioTel.setAttribute('y', '0.75');
      guscioTel.setAttribute('width', Math.max(0, w - 1.5).toFixed(1));
      guscioTel.setAttribute('height', Math.max(0, h - 1.5).toFixed(1));
      tacca.setAttribute('x1', (w / 2 - 25).toFixed(1));
      tacca.setAttribute('x2', (w / 2 + 25).toFixed(1));
      guscioTel.style.setProperty('--len', String(guscioTel.getTotalLength?.() ?? 1000));
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
      /**
       * Il video si apre A TUTTO SCHERMO, e nell'ultima meta' della hero lo
       * schermo si CHIUDE sul riquadro.
       *
       * Prima qui c'era un `scala(1 -> 0.94)`: allontanava il telaio mentre si
       * usciva. A tutto schermo la stessa cosa scoprirebbe il fondo sui
       * quattro lati — una cornice nera che compare dal niente. Chiudere il
       * ritaglio dice la stessa cosa (il filmato si fa da parte) senza mai
       * staccare il video dai bordi, e consegna alla sezione dopo un riquadro
       * gia' della misura giusta.
       */
      hero(p) {
        const chiude = fin(p, 0.5, 1);
        mostra({ video: 1 });
        clip(
          fra(0, RQ.lato, chiude),
          fra(0, RQ.lato, chiude),
          fra(0, RQ.vert, chiude),
          fra(0, RQ.vert, chiude),
          fra(0, 6, chiude),
        );
        vis(1);
        scala(1, 0);
        disegnaScocca(0, 0);
      },

      s1(p) {
        const d = fin(p, 0, 0.25);
        mostra({ video: 1 - d, vecchio: d });
        clip(RQ.lato, RQ.lato, RQ.vert, RQ.vert, 6);
        vis(1);
        scala(1, 0);

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
        clip(RQ.lato, RQ.lato, RQ.vert, RQ.vert, 6);
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
        clip(RQ.lato, RQ.lato, RQ.vert, RQ.vert, 6);
        vis(1);
        scala(1, 0);
        rettangoli.forEach((r, i) => {
          r.style.setProperty('--dis', fin(dis, i * 0.09, i * 0.09 + 0.5).toFixed(3));
        });
        // lo sweep di luce che riempie il sito appena finito
        q<HTMLElement>('.n-hero')?.style.setProperty('--sweep', fra(-1, 1, fin(p, 0.7, 0.95)).toFixed(3));
      },

      s4(p) {
        const stretta = fin(p, 0.15, 0.45);
        const incrocio = fin(p, 0.45, 0.6);
        const disegno = fin(p, 0.55, 0.8);
        const finale = fin(p, 0.8, 1);

        mostra({ nuovo: 1 - incrocio, 'nuovo-m': incrocio });
        clip(
          fra(RQ.lato, TEL.lato, stretta),
          fra(RQ.lato, TEL.lato, stretta),
          fra(RQ.vert, TEL.vert, stretta),
          fra(RQ.vert, TEL.vert, stretta),
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
        mostra({ 'nuovo-m': 1 - fin(p, 0, 0.12), schermate: fin(p, 0, 0.12) });
        clip(TEL.lato, TEL.lato, TEL.vert, TEL.vert, 24);
        scala(0.86, -16);
        vis(1 - fin(p, 0.92, 1));
        disegnaScocca(1, 1);

        const avanz = fin(p, 0.08, 0.95);
        // quattro schermate, e una schermata e' alta quanto il TELEFONO — non
        // quanto lo schermo, che ora e' tutt'altra misura
        parte('nastro')?.style.setProperty('--y', (avanz * 4 * TEL.h).toFixed(1));

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
        // Il fondo del finale torna pieno e il foglio si spegne PRIMA che S8
        // entri in scena. Il palcoscenico di S8 e' appiccicato in cima alla sua
        // sezione, quindi claim e bottone salgono da sotto gia' nell'ultima
        // mezza schermata di S7: senza queste due righe comparirebbero a piena
        // opacita' sopra il pannello del Metodo per poi spegnersi di scatto.
        scopri(0);
        consegna(0);
      },

      /**
       * TRE TEMPI, non un guizzo.
       *
       *   1. p 0,10 -> 0,46 — il telefono si riapre nel riquadro. Sono 43vh di
       *      scorrimento contro i 21 di prima: con la corsa a 50vh la chiusura
       *      del cerchio durava, in pixel scrollati, un quinto dello smontaggio
       *      di S2. Il disegno del modulo entra DURANTE l'apertura, non dopo,
       *      cosi' la finestra che si allarga scopre una cosa che c'e' gia' —
       *      prima fra l'uscita delle schermate e l'ingresso del modulo
       *      restavano venti vh di rettangolo vuoto, che e' il modo piu' rapido
       *      di far sembrare una trasformazione un errore di caricamento.
       *   2. p 0,46 -> 0,62 — a geometria ferma il modulo si TIENE, da solo, al
       *      centro dello schermo: l'unico momento della pagina in cui S8 e'
       *      sola in campo.
       *   3. p 0,62 -> 0,78 — LA CONSEGNA. Un numero solo governa il cambio: il
       *      disegno esce e la cosa vera entra, nello stesso rettangolo e sulla
       *      stessa riga dell'azione. Da 0,78 a 1 non si muove piu' niente, e
       *      non per pigrizia: la pagina si chiude su un fotogramma stabile
       *      anche dove il fondo pagina non coincide al pixel con p=1 (iOS).
       *
       * `scopri` e `vis` sono lo stesso numero: il pannello del finale si
       * ritira esattamente mentre il telaio si accende, quindi i due cambi si
       * leggono come uno solo e non c'e' nessun lampo al giunto con S7. E
       * siccome `mostra` qui mette il video a 0, non esiste un fotogramma in
       * cui il pannello sia trasparente e dietro ci sia il filmato.
       */
      s8(p) {
        const vista = fin(p, 0.02, 0.12);
        const apre = fin(p, 0.1, 0.46);
        const passa = dissolve(fin(p, 0.62, 0.78));

        mostra({
          schermate: 1 - fin(p, 0.08, 0.26),
          modulo: fin(p, 0.2, 0.4) * (1 - passa),
        });
        clip(
          fra(TEL.lato, RQ.lato, apre),
          fra(TEL.lato, RQ.lato, apre),
          fra(TEL.vert, RQ.vert, apre),
          fra(TEL.vert, RQ.vert, apre),
          fra(24, 6, apre),
        );
        disegnaScocca(1 - apre, 1 - apre);
        scala(fra(0.86, 1, apre), fra(-16, 0, apre));
        vis(vista);
        scopri(vista);
        consegna(passa);
      },
    };

    ridipingi = () => atto[ultimo.id](ultimo.p);

    /* -------------------------------------------------- registrazione --- */
    let vivo = true;
    const disfa: Array<() => void> = [];

    caricaPlugin().then(({ ScrollTrigger }) => {
      if (!vivo) return;

      const ultima = SEZIONI[SEZIONI.length - 1]!.id;

      for (const { id } of SEZIONI) {
        const bersaglio = document.querySelector<HTMLElement>(`[data-sezione="${id}"]`);
        if (!bersaglio) continue;

        const st = ScrollTrigger.create({
          trigger: bersaglio,
          // 'bottom top' e non 'bottom bottom': con quest-ultimo la corsa
          // utile e- (altezza sezione - altezza schermo), cioe- 30vh su una
          // sezione da 130vh — l-animazione sfreccia e finisce subito. Cosi-
          // invece l-avanzamento dura esattamente quanto la sezione.
          //
          // L-ULTIMA fa eccezione, e non per gusto: 'bottom top' vorrebbe che
          // il fondo della sezione salisse fino in cima allo schermo, ma sotto
          // non c-e- piu- pagina da scorrere. Il documento finisce prima, e
          // l-avanzamento si ferma a un terzo — l-ultimo atto non arriva mai
          // in fondo, senza che niente lo segnali. Per l-ultima sezione il
          // finale raggiungibile e- 'bottom bottom'.
          start: 'top top',
          end: id === ultima ? 'bottom bottom' : 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            ultimo.id = id;
            ultimo.p = self.progress;
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
            anche lei, ed e' proprio il bordo che deve restare intero.
            Misure e viewBox li scrive `vestiScocca` dalla misura vera del
            telefono — qui ci sono solo i valori del primo fotogramma. */}
        <svg className="scocca" ref={scocca} viewBox="0 0 155 349" aria-hidden="true">
          <rect data-guscio x="0.75" y="0.75" width="153.5" height="347.5" rx="24" ry="24" />
          <line data-tacca x1="52.5" y1="13" x2="102.5" y2="13" />
        </svg>
      </div>
    </div>
  );
}
