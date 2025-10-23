// --- SCRIPT PER CARICARE DATI DINAMICI (v4 - A PROVA DI FALLIMENTO) ---
(function() {

    async function updateGameSize() {
        // Seleziona i bersagli
        const minElement = document.getElementById('game-size-min-value');
        const recElement = document.getElementById('game-size-rec-value');

        // Se non siamo nella pagina giusta, esci
        if (!minElement || !recElement) {
            return;
        }

        try {
            // Carica il valore per i requisiti minimi
            const responseMin = await fetch('static/data/game_size_current.txt');
            if (responseMin.ok) {
                const value = await responseMin.text();
                minElement.textContent = value.trim();
            }
        } catch (error) {
            console.error('Errore nel caricare game_size_current.txt:', error);
        }

        try {
            // Carica il valore per i requisiti raccomandati
            const responseRec = await fetch('static/data/game_size_estimated.txt');
            if (responseRec.ok) {
                const value = await responseRec.text();
                recElement.textContent = value.trim();
            }
        } catch (error) {
            console.error('Errore nel caricare game_size_estimated.txt:', error);
        }
    }

    // Esegui lo script quando la pagina è caricata
    document.addEventListener('DOMContentLoaded', updateGameSize);

})();