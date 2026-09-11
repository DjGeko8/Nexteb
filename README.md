# Nexteb

Sito one-page dello studio Nexteb. Un racconto solo, raccontato due volte: il video in
apertura lo mostra, lo scorrimento lo fa rivivere all'utente.

**Stato: in costruzione.** Impianto, preloader, testata e hero sono fatti. Le sezioni S1–S8
arrivano nell'ordine della storia.

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
config/hero.ts    sorgenti del video, capitoli, poster
content/it.ts     TUTTI i testi. Nessuna stringa dentro un componente
lib/              gsap (nucleo), plugin (a richiesta), lenis, blocco, inerte, segnaposti
scripts/          i cancelli
public/media/     video codificati e poster
```

---

## Sostituire le cose

| Cosa | Dove |
|---|---|
| **Testi** | `content/it.ts`, tutti insieme |
| **Logo** | `components/brand/Logo.tsx`, un file solo |
| **Contatti** | `content/it.ts` → `contatti`, sostituendo i `tbd()` |
| **Colori** | `app/globals.css`, blocco `@theme`. Mai dentro un componente |
| **Capitoli del video** | `config/hero.ts` |
| **Endpoint del form** | variabile `NEXT_PUBLIC_FORM_ENDPOINT` |
| **Dominio** | variabile `NEXT_PUBLIC_SITO` (senza, resta `.invalid` e il sito non si indicizza) |

### Sostituire il video

Il montaggio si rifà con due comandi, dalla cartella `../intro`:

```bash
bash monta-intro.sh      # monta le 7 clip: 1 → 3 → 2 → 4 → 5 → 6 (tagliato) → 7
bash grada-vecchio.sh    # porta il sito vecchio in grigio-blu, sfuma testa e coda
```

Poi si copiano le uscite in `public/media/` e si aggiornano i capitoli in `config/hero.ts`.

Due cose da sapere sul filmato attuale:

- **entra dal nero e si spegne nel nero**, quindi `loop` basta e il giro non ha stacco. La
  continuità è risolta nel file, non con un espediente nella pagina;
- **dal secondo 28,3 porta il testo impresso dentro** — «Vuole viverlo», i tre vantaggi,
  «Web. App. Esperienza.», il claim e il bottone disegnato. La sovrimpressione del sito tace
  da lì in poi. Se il video cambia, `sovrimpressioneFinoA` in `config/hero.ts` è l'unico
  numero da rivedere.

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
   gzip per roba che la hero non usa. Il JS iniziale sta a **163,9 KB gzip**, sotto il tetto
   di 180.

---

## Cosa manca

- Sezioni S1–S8
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
