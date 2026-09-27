(function() {
    // Selezioniamo gli elementi dell'interfaccia una sola volta
    const barraProgresso = document.getElementById('barra-progresso');
    const contatoreSoldi = document.getElementById('contatore-soldi');
    const barraTesto = document.getElementById('barra-testo');

    // Controlliamo che tutti gli elementi necessari esistano prima di procedere
    if (!barraProgresso || !contatoreSoldi || !barraTesto) {
        return;
    }

    // Valori di riserva, usati solo se static/data/crowdfunding.json non è disponibile
    const PREZZO_CONTRIBUTO_PREDEFINITO = 19.43;
    const OBIETTIVO_FINALE_PREDEFINITO = 50000;

    // Costanti del crowdfunding, caricate da static/data/crowdfunding.json
    let prezzoContributo = PREZZO_CONTRIBUTO_PREDEFINITO;
    let obiettivoFinale = OBIETTIVO_FINALE_PREDEFINITO;
    let milestonesConfigurate = [];

    // Il caricamento è condiviso con script.js, così la richiesta avviene una sola volta
    const caricaCostantiCrowdfunding = async () => {
        if (typeof window.caricaConfigCrowdfunding !== 'function') {
            console.warn('Costanti del crowdfunding non disponibili: uso i valori predefiniti.');
            return;
        }

        const config = await window.caricaConfigCrowdfunding();
        if (!config) return;

        if (typeof config.prezzoContributo === 'number') prezzoContributo = config.prezzoContributo;
        if (typeof config.obiettivoFinale === 'number') obiettivoFinale = config.obiettivoFinale;
        if (Array.isArray(config.milestones)) milestonesConfigurate = config.milestones;
    };

    // Posiziona le milestone sulla barra in base al loro importo obiettivo
    const posizionaMilestone = () => {
        if (!obiettivoFinale) return;

        milestonesConfigurate.forEach(milestone => {
            if (!milestone || !milestone.key || typeof milestone.target !== 'number') return;

            const elemento = document.querySelector(`.milestone[data-milestone-key="${milestone.key}"]`);
            if (!elemento) {
                console.warn(`Milestone "${milestone.key}" non presente nella pagina.`);
                return;
            }

            elemento.dataset.milestoneTarget = `${milestone.target}`;
            elemento.style.left = `${(milestone.target / obiettivoFinale) * 100}%`;
        });
    };

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
                    totaleDaVendite = numeroContributori * prezzoContributo;
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
            const percentualeRaccolta = obiettivoFinale ? (soldiRaccolti / obiettivoFinale) * 100 : 0;

            // Formattatori per una visualizzazione pulita
            const formatSoldi = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
            
            // 5. Aggiorna l'interfaccia dopo un breve ritardo per l'animazione
            setTimeout(() => {
                barraProgresso.style.width = `${Math.min(percentualeRaccolta, 100)}%`;
                contatoreSoldi.textContent = `${formatSoldi.format(soldiRaccolti)} / ${formatSoldi.format(obiettivoFinale)}`;
                barraTesto.textContent = formatSoldi.format(soldiRaccolti);

                // --- ATTIVAZIONE DELLE MILESTONE ---
                const milestones = document.querySelectorAll('.milestone');
                milestones.forEach(milestone => {
                    const target = parseFloat(milestone.dataset.milestoneTarget);

                    // Con l'importo obiettivo noto confrontiamo direttamente i soldi raccolti,
                    // altrimenti ripieghiamo sulla posizione percentuale sulla barra
                    const raggiunta = isNaN(target)
                        ? percentualeRaccolta >= parseFloat(milestone.style.left)
                        : soldiRaccolti >= target;

                    milestone.classList.toggle('attivo', raggiunta);
                });

            }, 500);

        } catch (error) {
            console.error('Errore durante l\'aggiornamento della barra di finanziamento:', error);
            contatoreSoldi.textContent = 'Errore nel caricamento dati.';
            barraTesto.textContent = 'Errore';
        }
    }

    // Avvia la funzione: prima le costanti del crowdfunding, poi il calcolo dei fondi
    (async () => {
        await caricaCostantiCrowdfunding();
        posizionaMilestone();
        aggiornaBarraFinanziamento();
    })();

})();