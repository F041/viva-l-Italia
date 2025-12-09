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
            // 1. Eseguiamo entrambe le richieste di rete in parallelo
            const [contributorsResponse, donationsResponse] = await Promise.all([
                fetch('contributors.txt').catch(e => e), // Continua anche se fallisce
                fetch('donations-log.txt').catch(e => e) // Continua anche se fallisce
            ]);

            // 2. Calcoliamo il totale dalle vendite standard
            let totaleDaVendite = 0;
            if (contributorsResponse.ok) {
                const testoContributori = await contributorsResponse.text();
                const numeroContributori = parseInt(testoContributori.trim(), 10);
                if (!isNaN(numeroContributori)) {
                    totaleDaVendite = numeroContributori * PREZZO_CONTRIBUTO;
                }
            } else {
                console.warn('File contributors.txt non trovato o illeggibile. Ignorato.');
            }

            // 3. Calcoliamo il totale dalle donazioni manuali
            let totaleDaDonazioni = 0;
            if (donationsResponse.ok) {
                const testoDonazioni = await donationsResponse.text();
                const importi = testoDonazioni.trim().split('\n');
                totaleDaDonazioni = importi.reduce((somma, importo) => {
                    const valore = parseFloat(importo.trim());
                    return somma + (isNaN(valore) ? 0 : valore);
                }, 0);
            } else {
                console.warn('File donations-log.txt non trovato o illeggibile. Ignorato.');
            }
            
            // 4. Calcoliamo il totale finale
            const soldiRaccolti = totaleDaVendite + totaleDaDonazioni;
            const percentualeRaccolta = (soldiRaccolti / OBIETTIVO_FINALE) * 100;

            // Formattatori per una visualizzazione pulita
            const formatSoldi = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
            
            // 5. Aggiorna l'interfaccia dopo un breve ritardo per l'animazione
            setTimeout(() => {
                barraProgresso.style.width = `${Math.min(percentualeRaccolta, 100)}%`;
                contatoreSoldi.textContent = `${formatSoldi.format(soldiRaccolti)} / ${formatSoldi.format(OBIETTIVO_FINALE)}`;
                barraTesto.textContent = formatSoldi.format(soldiRaccolti);

                // --- LOGICA PER ATTIVARE LE MILESTONE (invariata) ---
                const milestones = document.querySelectorAll('.milestone');
                milestones.forEach(milestone => {
                    const milestonePercent = parseFloat(milestone.style.left);
                    if (percentualeRaccolta >= milestonePercent) {
                        milestone.classList.add('attivo');
                    } else {
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