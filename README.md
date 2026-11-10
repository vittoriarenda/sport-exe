# SPORT.EXE — THE SERT PROTOCOL

Un mini-videogioco di compleanno per Michele: il SERT indaga sulla sua passione per gli sport improbabili e finisce per finanziarla con un buono Decathlon. Interfaccia da sistema operativo segreto, tre test, quiz, XP, achievement, audio arcade e biglietto PNG scaricabile.

## File

- `index.html`: struttura accessibile e interfaccia del dossier.
- `style.css`: stile responsive, pixel art SVG, animazioni e modalità movimento ridotto.
- `script.js`: macchina a stati, quiz, audio Web Audio, Konami Code, coriandoli ed esportazione Canvas PNG.
- `config.js`: destinatario, amici, importo, brand, audio e animazioni.
- `README.md`: istruzioni.

Nessuna installazione, compilazione, dipendenza JavaScript, API o backend. I font Google sono facoltativi: senza connessione vengono usati i font di sistema. La grafica è inclusa nel codice, senza immagini esterne.

## Personalizzare

Aprire `config.js` con un editor di testo:

```js
recipientName: "Michele", // nome del destinatario
groupName: "SERT",       // gruppo che firma il regalo
giftBrand: "Decathlon",
giftAmount: null,         // nessun importo; impostare ad esempio 100 per 100,00 €
friends: ["Vittoria", "Aurora", "Myriam", "Michele S", "Armando", "Martina", "Totò"],
enableSounds: true,
enableAnimations: true
```

Usare preferibilmente un numero per l'importo, senza simbolo euro. Un testo è accettato come etichetta personalizzata. `null` non mostra alcun valore o importo fittizio. Non inserire codici regalo reali: al riscatto il gioco spiega che il codice verrà consegnato separatamente. L'assenza di backend significa che il bottone non attiva né acquista un vero buono.

## Giocare e testare

Aprire `index.html` nel browser, anche direttamente dal computer. Per un test HTTP con Node.js, dalla cartella del progetto si può usare `npx --yes serve .` (questo comando scarica solo uno strumento di sviluppo facoltativo).

1. Attendere l'avvio o scegliere **Salta avvio**; accettare il proprio destino.
2. Attendere o saltare la scansione e avviare il test sportivo.
3. Provare risposte sbagliate: mostrano errori diversi e si può riprovare, senza azzerare XP o progressi. Le risposte corrette sono **D, A, A**. Ogni domanda assegna 100 XP una sola volta.
4. Scegliere ciascuna delle quattro ossessioni in partite diverse e controllare la battuta personalizzata. La scelta assegna altri 100 XP.
5. Saltare o attendere l'elaborazione; sbloccare il finanziamento. Il finale assegna gli ultimi 100 XP e mostra 500 XP totali, tre badge e il regalo.
6. Provare **Riscatta il tuo loot**, **Salva il tuo achievement** (PNG locale) e **Rigioca** (azzera la partita).
7. Con `giftAmount: null` verificare l'assenza dell'importo; con `giftAmount: 100` verificare 100,00 € nel finale e nel PNG.
8. Verificare a 360 px e su desktop: niente scorrimento orizzontale, pulsanti touch, tabulazione e attivazione dei pulsanti con Invio/Spazio. Nessun timer limita le risposte.
9. Attivare/disattivare l'audio: parte solo dopo un'interazione. Attivare il movimento ridotto nel sistema operativo oppure usare `enableAnimations: false` per disattivare animazioni e coriandoli.
10. Inserire **↑ ↑ ↓ ↓ ← → ← → B A** per l'easter egg. Aprire la console del browser e verificare l'assenza di errori.

L'esperienza è pensata per circa 3–4 minuti con lettura e scelte tranquille; si può giocare più rapidamente saltando le sequenze. I progressi restano solo nella sessione corrente: ricaricare riavvia il gioco. Il PNG è un biglietto grafico generato con Canvas, con premio, dedica e firme; non è una cattura pixel per pixel del DOM e non include codici riscattabili. Su alcuni browser mobili il download viene aperto come immagine da salvare.

## Pubblicare su GitHub Pages

1. Creare un repository GitHub e caricare questi cinque file nella root. Non è necessario un framework o un file `package.json`.
2. In **Settings → Pages → Build and deployment**, scegliere **Deploy from a branch**.
3. Selezionare il branch `main` e la cartella **/ (root)**, quindi **Save**.
4. Attendere il completamento del deploy e aprire il link indicato da GitHub Pages, normalmente `https://NOMEUTENTE.github.io/NOMEREPOSITORY/`.
5. Completare una partita da telefono prima di condividere il link con Michele.

CSS e script usano percorsi relativi e funzionano anche nei sottopercorsi dei repository. Tutto ciò che viene pubblicato è leggibile dai visitatori: mantenere separato il vero codice del buono.

## Aggiornare dopo la pubblicazione

Modificare `config.js` o gli altri file, salvare e inviare un commit al branch pubblicato. GitHub Pages aggiorna automaticamente il sito. Dopo il deploy ricaricare la pagina (se serve con Ctrl+F5) e verificare il finale. Per aggiornare solo l'importo basta cambiare `giftAmount`.
