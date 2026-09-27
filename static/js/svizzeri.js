(function() {
    const listaDonatori = document.querySelector('.lista-donatori');
    if (!listaDonatori) {
        return;
    }

    async function caricaDonatori() {
        try {
            const response = await fetch('static/data/donors.json');
            if (!response.ok) {
                throw new Error(`Impossibile caricare static/data/donors.json: status ${response.status}`);
            }
            const donatori = await response.json();
            if (Array.isArray(donatori) && donatori.length > 0) {
                listaDonatori.innerHTML = '';
                donatori.forEach(nome => {
                    const li = document.createElement('li');
                    li.textContent = nome;
                    listaDonatori.appendChild(li);
                });
            }
        } catch (error) {
            console.warn('Caricamento dinamico dei donatori fallito, mantenuto contenuto statico di fallback:', error);
        }
    }

    caricaDonatori();
})();
