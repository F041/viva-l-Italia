(function() {
    const galleriaContenitore = document.getElementById('galleria-contenitore');
    if (!galleriaContenitore) return;

    let mediaItems = []; // Array per memorizzare i dati delle immagini

    async function costruisciGalleria() {
        try {
            const response = await fetch('media-index.json');
            if (!response.ok) throw new Error('File indice dei media non trovato.');
            
            const data = await response.json();
            mediaItems = data.immagini;

            if (!mediaItems || mediaItems.length === 0) {
                galleriaContenitore.innerHTML = "<p>Nessun media da mostrare.</p>";
                return;
            }

            galleriaContenitore.innerHTML = ''; // Pulisci il contenitore

            mediaItems.forEach((item, index) => {
                const elementoMedia = document.createElement('a');
                elementoMedia.href = item.url;
                elementoMedia.className = 'elemento-media hidden';
                elementoMedia.innerHTML = `
                    <img loading="lazy" src="${item.url}" alt="">
                    <div class="overlay-media">
                        <p data-i18n-key="${item.caption_key}"></p>
                    </div>
                `;
                galleriaContenitore.appendChild(elementoMedia);

                if (window.activateAnimationObserver) {
                    window.activateAnimationObserver.observe(elementoMedia);
                }
            });

            // Dopo aver creato gli elementi, riapplica le traduzioni e attiva la lightbox
            if(window.translatePage) window.translatePage();
            attivaLightbox();

        } catch (error) {
            console.error("Errore nella costruzione della galleria:", error);
        }
    }

    function attivaLightbox() {
        const elementiGalleria = document.querySelectorAll('.griglia-media-estesa .elemento-media');
        const lightbox = document.getElementById('lightbox');
        const lightboxImmagine = lightbox.querySelector('.lightbox-immagine');
        const pulsanteChiudi = lightbox.querySelector('.lightbox-chiudi');
        const pulsantePrecedente = lightbox.querySelector('.lightbox-precedente');
        const pulsanteProssimo = lightbox.querySelector('.lightbox-prossimo');
        let indiceAttuale;

        const aggiornaImmagineLightbox = (index) => {
            indiceAttuale = index;
            const urlImmagine = mediaItems[index].url;
            lightboxImmagine.setAttribute('src', urlImmagine);
        };

        const apriLightbox = (index) => {
            lightbox.classList.add('attivo');
            document.body.classList.add('menu-aperto');
            aggiornaImmagineLightbox(index);
        };

        const chiudiLightbox = () => {
            lightbox.classList.remove('attivo');
            document.body.classList.remove('menu-aperto');
            // Rimuoviamo l'ascoltatore quando la lightbox è chiusa
            document.removeEventListener('keydown', gestisciInputTastiera);
        };
        
        const gestisciInputTastiera = (e) => {
            if (e.key === 'ArrowRight') mostraImmagineSuccessiva();
            if (e.key === 'ArrowLeft') mostraImmaginePrecedente();
            if (e.key === 'Escape') chiudiLightbox();
        };


        const mostraImmagineSuccessiva = () => {
            const nuovoIndice = (indiceAttuale + 1) % mediaItems.length;
            aggiornaImmagineLightbox(nuovoIndice);
        };

        const mostraImmaginePrecedente = () => {
            const nuovoIndice = (indiceAttuale - 1 + mediaItems.length) % mediaItems.length;
            aggiornaImmagineLightbox(nuovoIndice);
        };

        elementiGalleria.forEach((elemento, index) => {
            elemento.addEventListener('click', (e) => {
                e.preventDefault();
                apriLightbox(index);
            });
        });

        pulsanteChiudi.addEventListener('click', chiudiLightbox);
        pulsanteProssimo.addEventListener('click', mostraImmagineSuccessiva);
        pulsantePrecedente.addEventListener('click', mostraImmaginePrecedente);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) chiudiLightbox();
        });
    }

    costruisciGalleria();
})();