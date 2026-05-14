# ProgettoLetterboxD

Aggiungere i file:
1. git add .
2. git commit -m "Descrizione della modifica"
3. git push origin main (oppure master a seconda del nome del ramo principale)

Aggiornare i file con le modifiche fatte dagli altri membri:
1. git pull origin main 
2. git fetch

Controllare tutte le commit del progetto:
1. git log (Ti mostra l'elenco dei commit con autore, data e messaggio. (Premi q per uscire))
2. git log --oneline --graph --all: Una versione "grafica" da terminale che ti mostra le varie ramificazioni (branch) e i commit in modo molto compatto.

Collegamento database al sito:(Chidere a nicu il file sql)
1. apri powershell(qua su visualstudio code)
2. cd backend(cartella presente in teoria nel file del progetto)
3. npm init -y
4. npm install express mysql2 cors dotenv
5. all'interno di letterbox.env sta il campo DB_PASSWORD
6. METTERE LA PASSWORD DELLA CONNESIONE CHE HAI MESSO ALL'INTERNO DI MYSQL WORKBENCH