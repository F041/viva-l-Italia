(function() {
    const articoliContenitore = document.getElementById('articoli-contenitore');
    if (!articoliContenitore) return;

    // Definiamo l'observer qui, per essere sicuri che esista
    const observer = window.activateAnimationObserver || new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('show');
        });
    });

    async function caricaERenderizzaNotizie() {
        try {
            const indexResponse = await fetch('notizie-index.json');
            if (!indexResponse.ok) throw new Error('File indice delle notizie non trovato.');
            
            const indexData = await indexResponse.json();
            const filesNotizie = indexData.articoli;

            if (!filesNotizie || filesNotizie.length === 0) {
                articoliContenitore.innerHTML = '<p data-i18n-key="news_no_articles">Nessuna notizia al momento.</p>';
                return;
            }

            articoliContenitore.innerHTML = '';

            for (const file of filesNotizie) {
                const response = await fetch(file);
                if (!response.ok) continue;
                
                const markdownText = await response.text();
                
                const match = markdownText.split('---');
                if (match.length < 3) continue;

                const frontMatterText = match[1];
                const contentMarkdown = match[2];
                
                const meta = {};
                frontMatterText.trim().split('\n').forEach(line => {
                    const [key, ...value] = line.split(':');
                    if (key) meta[key.trim()] = value.join(':').trim();
                });

                const articleId = file.split('/').pop().replace('.md', '');
                
                const maxChars = 350;
                let estrattoMarkdown;
                const cleanContent = contentMarkdown.trim().replace(/^(#+\s*.*?\n*)+/g, '');

                if (cleanContent.length <= maxChars) {
                    estrattoMarkdown = cleanContent;
                } else {
                    let truncated = cleanContent.substring(0, maxChars);
                    truncated = truncated.substring(0, Math.min(truncated.length, truncated.lastIndexOf(" ")));
                    estrattoMarkdown = truncated + "...";
                }
                
                const estrattoHtml = marked.parse(estrattoMarkdown);

                const articoloElement = document.createElement('article');
                articoloElement.className = 'articolo hidden';
                articoloElement.innerHTML = `
                    <h2><a href="articolo.html?id=${articleId}">${meta.title || 'Senza titolo'}</a></h2>
                    <div class="meta-info">
                        <span>${meta.date || ''}</span> | <span>${meta.author || ''}</span>
                    </div>
                    <div class="estratto-articolo">${estrattoHtml}</div>
                    <a href="articolo.html?id=${articleId}" class="leggi-tutto-btn" data-i18n-key="news_read_more">
                        Leggi tutto
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path></svg>
                    </a>
                `;

                articoliContenitore.appendChild(articoloElement);
                observer.observe(articoloElement);
            }

            // QUESTA ERA LA RIGA MANCANTE
            if (window.translatePage) {
                window.translatePage();
            }

        } catch (error) {
            console.error('Impossibile caricare le notizie:', error);
            articoliContenitore.innerHTML = '<p>Errore nel caricamento delle notizie.</p>';
        }
    }

    if (typeof marked === 'undefined') {
        console.error("Libreria 'marked' non trovata.");
    } else {
        caricaERenderizzaNotizie();
    }
})();