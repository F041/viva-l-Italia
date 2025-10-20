// --- SCRIPT PER LA PAGINA ARTICOLO SINGOLO ---
(function() {
    const articoloContenitore = document.getElementById('articolo-singolo-contenitore');
    if (!articoloContenitore) return;

    async function caricaArticolo() {
        try {
            // 1. Leggi l'ID dell'articolo dall'URL
            const params = new URLSearchParams(window.location.search);
            const articleId = params.get('id');

            if (!articleId) {
                throw new Error("ID dell'articolo non specificato nell'URL.");
            }

            const filePath = `notizie/${articleId}.md`;

            // 2. Carica il file Markdown corrispondente
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`File dell'articolo non trovato: ${filePath}`);
            }
            const markdownText = await response.text();
            
            // 3. Estrai metadati e contenuto (stessa logica di notizie.js)
            const match = markdownText.split('---');
            if (match.length < 3) throw new Error("Formato del file Markdown non valido.");

            const frontMatterText = match[1];
            const contentMarkdown = match[2];
            
            const meta = {};
            frontMatterText.trim().split('\n').forEach(line => {
                const [key, ...value] = line.split(':');
                if (key) meta[key.trim()] = value.join(':').trim();
            });

            // 4. Converti il contenuto COMPLETO in HTML
            const contentHtml = marked.parse(contentMarkdown);

            // 5. Imposta il titolo della pagina e popola il contenitore
            document.title = `${meta.title || 'Articolo'} - Viva l'Italia`;
            
            articoloContenitore.innerHTML = `
                <article class="articolo">
                    <h1>${meta.title || 'Senza titolo'}</h1>
                    <div class="meta-info">
                        <span>${meta.date || ''}</span> | <span>${meta.author || ''}</span>
                    </div>
                    ${contentHtml}
                </article>
            `;

            // 6. Riapplica le traduzioni al resto della pagina
            if(window.translatePage) window.translatePage();

        } catch (error) {
            console.error('Errore nel caricamento dell\'articolo:', error);
            articoloContenitore.innerHTML = '<p>Articolo non trovato o errore nel caricamento.</p>';
        }
    }

    if (typeof marked === 'undefined') {
        console.error("Libreria 'marked' non trovata.");
    } else {
        caricaArticolo();
    }
})();