ProgettoLetterboxD


Aggiungere i file:
git add .
git commit -m "Descrizione della modifica"
git push origin main (oppure master a seconda del nome del ramo principale)

Aggiornare i file con le modifiche fatte dagli altri membri:
git pull origin main
git fetch

Controllare tutte le commit del progetto:
git log (Ti mostra l'elenco dei commit con autore, data e messaggio. (Premi q per uscire))
git log --oneline --graph --all: Una versione "grafica" da terminale che ti mostra le varie ramificazioni (branch) e i commit in modo molto compatto.



MYSQL
Fase 1: Cambiare la password nel Database
In questa fase entri nel database e gli dici: "Da ora in poi, per questo utente, usa quest'altra password".
Apri MySQL Workbench ed entra nella tua connessione abituale usando la vecchia password.
Una volta dentro, apri una nuova scheda query (clicca sull'icona del foglio col fulmine in alto a sinistra).
Copia e incolla questo comando:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'LaTuaNuovaPassword';
(Nota: Se il tuo utente non è root, sostituiscilo con il tuo nome utente. Se non lo sai, di solito per i progetti universitari o locali è quasi sempre root).
Esegui il comando cliccando sul fulmine nella barra degli strumenti.
Sotto, nel pannello "Output", dovresti vedere una spunta verde che conferma l'operazione.
Ora digita ed esegui anche questo comando (serve a rendere effettivo il cambio immediatamente):
FLUSH PRIVILEGES;
Chiudi completamente la scheda della connessione (clicca sulla "x" della tab in alto).

Fase 2: Aggiornare MySQL Workbench
Ora che il database ha la nuova password, se provi a rientrare, Workbench fallirà perché proverà a usare ancora quella vecchia che ha salvato in memoria.
Torna alla schermata iniziale di Workbench (quella dove vedi il quadratino della connessione).
Non cliccare col tasto sinistro per entrare. Clicca invece col tasto destro sul quadratino della tua connessione.
Seleziona la voce Edit Connection....
Nella finestra che si apre, cerca la riga Password e clicca sul tasto Clear Saved Password (questo serve a cancellare la vecchia password "dimenticata" dal programma).
Ora clicca sul tasto Store in Vault... (proprio accanto a dove hai cliccato prima).
Inserisci la nuova password che hai scelto nella Fase 1 e dai OK.
Clicca in basso a destra su Test Connection. Se appare il messaggio "Successfully made the MySQL connection", hai finito!
Clicca su Close e ora puoi rientrare normalmente nella tua connessione.