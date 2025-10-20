(function() {
    // Selezioniamo gli elementi dell'interfaccia una sola volta
    const barraProgresso = document.getElementById('barra-progresso');
    const contatoreSoldi = document.getElementById('contatore-soldi');
    const barraTesto = document.getElementById('barra-testo');

    // Controlliamo che tutti gli elementi necessari esistano prima di procedere
    if (!barraProgresso || !contatoreSoldi || !barraTesto) {
        return;
    }

    // Costanti del crowdfunding
    const PREZZO_CONTRIBUTO = 19.43;
    const OBIETTIVO_FINALE = 2000000;

    // Funzione asincrona per caricare i dati e aggiornare la UI
    async function aggiornaBarraFinanziamento() {
        try {
            // 1. Carica il file di testo
            const response = await fetch('contributors.txt');
            if (!response.ok) {
                throw new Error('File contributors.txt non trovato.');
            }
            const testo = await response.text();
            
            // 2. Calcola i valori
            const numeroContributori = parseInt(testo.trim(), 10);
            if (isNaN(numeroContributori)) {
                throw new Error('Il contenuto del file non è un numero valido.');
            }
            
            const soldiRaccolti = numeroContributori * PREZZO_CONTRIBUTO;
            const percentualeRaccolta = (soldiRaccolti / OBIETTIVO_FINALE) * 100;

            // Formattatori per una visualizzazione pulita
            const formatSoldi = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
            
            // 3. Aggiorna l'interfaccia dopo un breve ritardo per l'animazione
            setTimeout(() => {
                barraProgresso.style.width = `${Math.min(percentualeRaccolta, 100)}%`;
                contatoreSoldi.textContent = `${formatSoldi.format(soldiRaccolti)} / ${formatSoldi.format(OBIETTIVO_FINALE)}`;
                barraTesto.textContent = formatSoldi.format(soldiRaccolti);

                // ---  LOGICA PER ATTIVARE LE MILESTONE ---
                const milestones = document.querySelectorAll('.milestone');
                milestones.forEach(milestone => {
                    // Estraiamo il valore numerico dalla posizione 'left' in percentuale
                    const milestonePercent = parseFloat(milestone.style.left);
                    
                    // Se la percentuale raccolta è maggiore o uguale a quella della milestone...
                    if (percentualeRaccolta >= milestonePercent) {
                        // ...la attiviamo.
                        milestone.classList.add('attivo');
                    } else {
                        // Altrimenti, ci assicuriamo che non sia attiva.
                        milestone.classList.remove('attivo');
                    }
                });

            }, 500);

        } catch (error) {
            console.error('Errore durante l\'aggiornamento della barra di finanziamento:', error);
            contatoreSoldi.textContent = 'Errore nel caricamento dati.';
            barraTesto.textContent = 'Errore';
        }
    }

    // Avvia la funzione
    aggiornaBarraFinanziamento();

})();