# Marmellata

API per cipolla.marmellata gestite tramite il framework BE fastify con linguaggio javascript. Questa applicazione viene deployata da usa lambda in AWS che dichiara il nostro unico endpoint su API-gateway.

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

# Accedere al container una volta che è up

```
make cli
```

# Eseguire i test

```
make unit-test
```

# Eseguire il linting del codice

```
make lint
```

# Deploy stage

```
make stage-deploy
```

# Cloudwatch dashboard

Questo starterkit comprende una dashboard custom di Cloudwatch per monitorare tutte le risorse comprese. Ogni ambiente (`stage`, `prod`) ha la sua dashboard dedicata in cui vengono mostrate solo le risorse con il tag dell'ambiente. Tutti i file relativi alla dashboard sono contenuti nella cartella `dashboard`, per crearla e gestirla è usato Terraform al momento del deploy del progetto (tramite Github Actions).
É possibile visita le dashboard a questo link:

STAGE dashboard:
https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=Marmellata-STAGE

PROD dashboard:
https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=Marmellata-PROD

# Trattamento dei dati sensibili presenti nella response

All'interno di questo componente esiste la possibilità di mascherare i dati sensibili presenti nella response e che compariranno nella proprietà `out` del log verso ELK
o presenti nella request e che compariranno nella proprietà `in` del log verso ELK.
Per maggiori informazioni consultare la sezione: `Trattamento dati sensibili` del componente.
