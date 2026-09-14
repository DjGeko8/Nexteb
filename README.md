# Nexteb

Sito one-page dello studio Nexteb. Un racconto solo, raccontato due volte: il video in
apertura lo mostra, lo scorrimento lo fa rivivere all'utente.

**Stato: struttura completa.** Impianto, preloader, testata, hero e le otto sezioni ci sono
e funzionano. Mancano i dati del cliente e le pagine legali — l'elenco è in fondo.

---

## Avvio

```bash
npm install
npm run dev          # http://localhost:8330
```

```bash
npm run verifica     # tipi + vocabolario del movimento + segnaposto
npm run build        # esporta il sito statico in out/
```

> **Spegni il server di sviluppo prima di compilare.** Su una macchina da 8 GB i due processi
> non ci stanno insieme: con `next dev` acceso restano ~0,8 GB liberi e la build muore di
> memoria, anche con webpack. Spento, la stessa build passa in 14 secondi.
>
> E non incanalare la build in `tail`: quando crolla, il messaggio vero sta *sopra* lo stack.
> `npm run build > build.log 2>&1` e poi cerca nel file.

---

## Com'è fatto

**L'architettura è "il telaio".** Un rettangolo nasce nella hero e non viene mai distrutto:
cambia contenuto, proporzioni e distanza fino a diventare il modulo di contatto. Il palco è
`position: fixed`, quindi **non serve nessun pin di ScrollTrigger** — niente si aggancia
perché niente si è mai sganciato.

**Il palco è grande quanto lo schermo.** Il video si apre a tutto schermo; nella seconda metà
della hero il ritaglio si chiude sul *riquadro* (16:9, 62vw), che è la finestra in cui vive il
racconto; in S4 lo stesso ritaglio si stringe fino al *telefono* (9:19,5). Non si scala mai
niente: si cambia quanta parte del palco si vede, con `clip-path: inset()`. Una scala non
uniforme schiaccerebbe il contenuto, una uniforme non potrebbe cambiare le proporzioni.

Le due misure le calcola `lib/racconto.ts` (`misureRiquadro`, `misureTelefono`) e il palco le
scrive sulla **radice** come `--rq-w/--rq-h` e `--tel-w/--tel-h`: **una fonte, tanti lettori** — il
ritaglio in JavaScript, l'impaginazione degli strati in CSS, e il finale, che sta fuori dal palco e
deve allinearsi al riquadro senza riscriversi i numeri per conto suo. Se divergessero, il disegno si vedrebbe a
fette. Solo il video è a tutta pagina: gli altri strati sono disegni tarati sulla larghezza del
riquadro, e stirarli a tutto schermo li ridurrebbe a una pagina vuota con la scritta piccola in
mezzo — quindi restano della loro misura, centrati, e il ritaglio li scopre.

```
app/            layout, pagina, fogli di stile
  globals.css     LA FONTE DEI TOKEN: colori, caratteri, durate, curve
  componenti.css  stili dei componenti
  titoli.css      i titoli, che stanno tutti nello stesso punto
  chiusura.css    il bottone in fondo
components/
  brand/          Logo, Luce (la sorgente di luce del documento)
  layout/         Testata, PannelloContatti, Preloader
  hero/           VideoHero, BarraCapitoli, Sovrimpressione
  palco/          Palco (il telaio e il suo pilota), Strati (cosa c'e' dentro)
  sections/       Sezioni (le otto corse e i tre pannelli)
config/hero.ts    sorgenti del video, capitoli, poster
content/it.ts     TUTTI i testi. Nessuna stringa dentro un componente
lib/              gsap (nucleo), plugin (a richiesta), lenis, blocco, inerte,
                  segnaposti, racconto (la mappa delle sezioni)
scripts/          i cancelli
public/media/     video codificati e poster
```

### La fine

S8 è l'unica sezione che lascia vedere il palco, ed è dove il racconto chiude il cerchio: il
telefono si riapre nel riquadro, il disegno del modulo si tiene un momento da solo, poi si ritira e
al suo posto — **nello stesso rettangolo e sulla stessa riga dell'azione** — arrivano la frase vera
e l'unico bottone vero. Prima quella coreografia si svolgeva dietro il fondo opaco di `.pannello` e
non l'aveva vista mai nessuno.

Tre cose la reggono, e nessuna è cosmetica:

- **il palcoscenico appiccicato** (`.finale-palco`, `position: sticky; height: 100dvh`). Il palco è
  centrato nel *viewport*, il contenuto di una sezione più alta di uno schermo è centrato nella
  *sezione*: i due centri erano sfalsati di **metà della corsa**. Non è un margine sbagliato, è
  aritmetica — ed è il motivo per cui S8 non si era mai potuta allungare (allungarla peggiorava lo
  sfasamento della metà di quel che guadagnava). Con lo sticky i due centri coincidono a ogni
  avanzamento e a ogni finestra, e S8 è passata da 150 a 220vh: la corsa utile da 50 a 120vh;
- **la griglia condivisa.** `--linea-azione` e `--aria-riquadro` stanno in `globals.css` e le
  leggono *sia* il disegno dentro il telaio (`app/palco.css`) *sia* il foglio vero
  (`app/sezioni.css`). Per questo «il bottone atterra dove stava la capsula» è una proprietà del
  codice e non una coincidenza misurata una volta;
- **il ripiego.** `--scoperto` e `--consegna` li scrive solo l'atto `s8`, sulla sola sezione che li
  usa. Dove non li scrive nessuno il CSS cade su `0` e `1`, cioè fondo pieno e contenuto visibile.
  Il caso pericoloso non è «JavaScript spento» — lì `html.js` non c'è e le guardie scattano — ma
  «JavaScript acceso e il pezzo di GSAP non arrivato», o il fondo pagina raggiunto con un salto:
  casi in cui il palco è rimasto al primo fotogramma, cioè al **poster** del video, dove il bianco
  farebbe 1,88:1.

Il piede sta fuori dal foglio, su un letto di `--color-nero`: i dati obbligatori vogliono un fondo
di luminanza nota e nessun movimento sopra. Vanno giudicati **con i `tbd()` addosso** — in quel
stato il tratteggio li porta a 4,64:1 sul letto, e sarebbero stati 4,49:1 sul fondo del riquadro.

### Gli strati disegnati (S1-S5)

Il telaio mostra cinque disegni in CSS e SVG: il sito vecchio, le sue tessere, il wireframe, il
sito nuovo, le schermate dell'app. Due regole li governano, e sono state pagate.

**Una superficie si dichiara col contorno, non col riempimento.** I quattro fondi scuri della
tavolozza stanno entro 1,16 l'uno dall'altro — `abisso → notte` è **1,09:1**, cioè niente. Gli
strati erano scritti come se esistesse una scala di grigi scuri: tre blocchi del sito nuovo a
1,09:1, le righe del telefono a 1,09:1, il calendario a 1,09:1. Roba disegnata che nessuno poteva
vedere, e uno schermo del telefono che sembrava spento. Ora si usano `--contorno` (2,78:1) e
`--contorno-acceso` (4,73:1), definiti in `globals.css` insieme alla scala e al motivo.

**Le fasce sono proporzionali, non in pixel.** Tutti e cinque avevano `align-content: start` e
altezze fisse tarate su un riquadro più piccolo: il contenuto si accucciava nel terzo superiore.
In S2 il danno si moltiplicava — il sito vecchio riempiva un terzo, quindi trentadue tessere su
quarantotto si portavano via del grigio vuoto quando si spaccava.

**Le tessere sono i pezzi del sito vecchio, davvero.** Prima avevano un fondo piatto scelto a bande
e la pagina si spaccava in una scacchiera di quattro tinte. Ora c'è **un disegno solo**
(`--dipinto-vecchio`) e ogni tessera è una finestra sulla propria fetta: chi prende la testata porta
via la testata, chi prende il banner porta via le righe diagonali. La pianta del sito vecchio
(`--vec-testata`, `--vec-nav`, `--vec-piede`, `--vec-lato`) sta in un posto solo e la leggono in
due: l'impaginazione vera e il disegno. Se divergessero, il sito si spaccherebbe in pezzi di un
altro sito.

---

## Sostituire le cose

| Cosa | Dove |
|---|---|
| **Testi** | `content/it.ts`, tutti insieme |
| **Logo** | `components/brand/Logo.tsx`, un file solo |
| **Contatti** | `content/it.ts` → `contatti`, sostituendo i `tbd()` |
| **Colori** | `app/globals.css`, blocco `@theme`. Mai dentro un componente |
| **Capitoli del video** | `config/hero.ts` |
| **Misure di riquadro e telefono** | `lib/racconto.ts`. Mai duplicate in CSS |
| **Endpoint del form** | variabile `NEXT_PUBLIC_FORM_ENDPOINT` |
| **Dominio** | variabile `NEXT_PUBLIC_SITO` (senza, resta `.invalid` e il sito non si indicizza) |

### Sostituire il video

Il montaggio si rifà con due comandi dalla cartella `../intro`, poi uno da qui:

```bash
bash ../intro/cerca-giunzioni.sh  # dove tagliare: cerca i fotogrammi che combaciano
bash ../intro/monta-intro.sh      # monta le 7 clip: 1 → 3 → 2 → 4 → 5 → 6 → 7
bash ../intro/grada-vecchio.sh    # porta il sito vecchio in grigio-blu
npm run media                     # da lì alle tre codifiche + il poster
```

`npm run media` scrive in `public/media/` due copie dello stesso filmato — **largo** (1600 px,
per lo schermo grande dove il video sta a tutto schermo) e **stretto** (1280, sotto gli 820 px
di finestra) — più il poster. Poi si aggiornano durata e capitoli in `config/hero.ts`.

Perché due copie e non una: **Cloudflare non serve richieste parziali sugli asset statici**, il
file si scarica sempre intero, anche da chi se ne va dopo tre secondi. Ogni megabyte è pagato
da tutti. Ma con il video a tutto schermo una copia stretta ingrandita si vede — la finta
interfaccia dentro il filmato ha testo piccolo, ed è la prima cosa che si sfalda.

**Un pezzo solo, e i tagli sono misurati.** Le sette clip non condividono il fotogramma di
giunzione — verificato, non supposto: la matrice PSNR di tutte le 49 coppie coda/testa non supera
gli 11,9 dB, e due fotogrammi identici darebbero infinito. Condividono la *scena*, non l'immagine.
Quindi `cerca-giunzioni.sh` cerca, per ogni giunzione, la coppia che differisce di meno dentro una
finestra **che il racconto consente** — lasciata libera, la ricerca voleva far partire la clip 7 a
metà saltandone l'apertura del logo, solo perché quell'inquadratura somigliava alla fine della 6.
I pixel non sanno la storia.

Il residuo a quei punti decide il trattamento, e non è lo stesso per tutti: sotto 40 (su 255)
**stacco netto**, sopra 65 una dissolvenza di otto fotogrammi. Due giunzioni su sei sono stacchi, e
sono invisibili — prima erano tutte dissolvenze da mezzo secondo, che su due inquadrature quasi
uguali non uniscono: sfocano, e per un attimo si vedono due monitor sovrapposti.

Due cose da sapere sul filmato attuale:

- **il giro non passa dal nero.** Testa e coda avevano una dissolvenza dal nero, messa perché
  il ciclo non avesse stacco: insieme duravano quasi un secondo, e a ogni giro quel secondo si
  leggeva come una pausa. Tolte — l'ultima scena e la prima sono entrambe scure, quindi lo
  stacco diretto regge da sé;
- **dal secondo 28,3 porta il testo impresso dentro** — «Vuole viverlo», i tre vantaggi,
  «Web. App. Esperienza.», il claim e il bottone disegnato. La sovrimpressione del sito tace
  da lì in poi. Se il video cambia, `sovrimpressioneFinoA` in `config/hero.ts` è l'unico
  numero da rivedere — ed è cambiato con il rimontaggio: era 28,3 su un filmato da 38,17 s, ora è
  22,6 su uno da 31,75.

---

## I cancelli

Un controllo che si può fare solo aprendo il sito e guardando non viene fatto quasi mai.

| Comando | Cosa impedisce |
|---|---|
| `npm run verifica-movimento` | Durate, curve e px scritti a mano invece che presi dai token |
| `npm run verifica-segnaposto` | Pubblicare con ragione sociale o P.IVA mancanti |
| `npm run typecheck` | Tutto il resto |

Per una deroga legittima si scrive `movimento-ok: <motivo>` in un commento sopra la riga. Il
motivo è obbligatorio: una deroga senza spiegazione è una svista.

---

## Le regole che il codice segue

1. **Tre durate e tre curve per tutto il sito**, nominate per ruolo. È ciò che fa muovere il
   sito «con una mano sola» invece che con dieci velocità diverse.
2. **Entrata e uscita scritte due volte**: i pannelli entrano lenti e morbidi, escono rapidi.
3. **Lo stato base è quello visibile.** Lo stato nascosto vive solo sotto `html.js`. Senza
   JavaScript non sparisce niente — e il velo del preloader si toglie da solo dopo 8 secondi
   anche se il JavaScript non parte mai.
4. **Il movimento ridotto si ascolta**, non si legge una volta: chi cambia impostazione a
   sito aperto lo vede calmarsi senza ricaricare.
5. **I plugin di GSAP si caricano a richiesta.** Tenerli nel carico iniziale costava 31 KB
   gzip per roba che la hero non usa. Il JS iniziale sta a **169,0 KB gzip**, sotto il tetto
   di 180.

---

## Pubblicare su Cloudflare

Il sito è un export statico: **non c'è niente da eseguire sul server**. Il Worker non esegue
codice, serve solo file — quindi non può sforare i 10 ms di CPU e non costa a ogni visita.

La configurazione sta in `wrangler.jsonc` e viaggia con il repository: `assets.directory`
punta a `out`, `not_found_handling` manda gli indirizzi sbagliati alla 404 generata da Next,
e `html_handling` serve `/cartella/` senza redirect inutili.

**Impostazioni di Workers Builds** (nel pannello, una volta sola):

| Campo | Valore |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| Versione di Node | presa da `.node-version` |

**Variabili**, da impostare nelle Settings del Worker:

| Variabile | Cosa fa |
|---|---|
| `NEXT_PUBLIC_SITO` | il dominio vero. **Senza, il sito si pubblica con `noindex`** — è voluto: un'anteprima indicizzata è difficile da togliere dai motori |
| `NEXT_PUBLIC_FORM_ENDPOINT` | l'indirizzo a cui il modulo invia |

Attenzione a una cosa che sorprende sempre: essendo variabili `NEXT_PUBLIC_`, vengono lette
**al momento della build** e finiscono dentro l'HTML. Cambiarle nel pannello non basta —
serve una nuova build.

E per la stessa ragione `wrangler.jsonc` **non dichiara alcun blocco `vars`**: un blocco in
chiaro nel file sostituisce a ogni rilascio quelle impostate nel pannello, e una variabile
aggiunta come segreto sparirebbe al primo deploy successivo, in silenzio.

`public/_headers` viaggia con la build e porta la CSP e le regole di cache: file con
l'impronta nel nome per sempre, video un mese. La CSP non ammette **nessun dominio di terzi**
— è ciò che tiene vera l'assenza del banner cookie.

Per pubblicare a mano, da locale: `npm run cf:deploy`.

---

## Cosa manca

- Ragione sociale e P.IVA (bloccanti: `npm run verifica-segnaposto` esce con errore)
- Email, telefono, WhatsApp, zona di lavoro
- Endpoint del form, o ripiego `mailto:`
- Pagine Privacy e Cookie
- Logo definitivo
- Dominio

---

## Note

I tre file video in `public/media/` pesano ~26 MB. Stanno nel repository perché servono a
compilare e pubblicare, e nessuno supera i limiti di GitHub — ma se il filmato cambierà spesso
conviene spostarli su Git LFS o su uno spazio esterno.
