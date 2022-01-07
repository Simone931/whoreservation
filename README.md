# Who's Your Stylist reservations

API per whoisyourstylist gestite tramite il framework BE fastify con linguaggio javascript.

# Cosa comprende

* suite di unit test
* suite di linting
* file di configurazione per integrazione con backstage
* file serverless.yml per la dichiarazione di una lambda che è possibile deployare su AWS

# Come lavorare in locale

Per eseguire il deploy della tua lambda e quindi la rotta di esempio presente nello starterkit lancia:

```
make
```

verrà istanziato un container che eseguirà l'applicazione e potrai interrogare l'indirizzo: 

```
http://{nome-componente}.loc:3000
```

# Come lavorare in locale con API KEYS

Se al momento della creazione del componente si utilizza l'API KEYS per interrogare l'API di esempio si potrà utilizzare questo comando:

```
curl -H 'x-api-key: {valore-api-key-in-locale}' http://{nome-componente}.loc:3000/example
```

il `{valore-api-key-in-locale}` è possibile recuperarlo eseguendo un `make logs` e prendendo il valore alla voce:

```
offline: Key with token:  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

# Trattamento dei dati sensibili presenti nella response

All'interno di questo componente esiste la possibilità di mascherare i dati sensibili presenti nella response e che compariranno nella proprietà `out` del log verso ELK
o presenti nella request e che compariranno nella proprietà `in` del log verso ELK.
Per maggiori informazioni consultare la sezione: `Trattamento dati sensibili` del componente.
