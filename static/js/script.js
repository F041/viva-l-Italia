// --- BLOCCO MENU HAMBURGER ---
(function () {
    const btn = document.querySelector('.icona-menu-hamburger');
    const menu = document.querySelector('.contenitore-menu-desktop');

    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        const attivo = menu.classList.toggle('attivo');
        btn.classList.toggle('attivo', attivo);
        btn.setAttribute('aria-expanded', attivo ? 'true' : 'false');
        document.body.classList.toggle('menu-aperto', attivo);
    });

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            if (menu.classList.contains('attivo')) {
                menu.classList.remove('attivo');
                btn.classList.remove('attivo');
                btn.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-aperto');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('attivo')) {
            menu.classList.remove('attivo');
            btn.classList.remove('attivo');
            btn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-aperto');
            btn.focus();
        }
    });
})();

// --- BLOCCO ANIMAZIONI ALLO SCORRIMENTO ---
(function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    
    window.activateAnimationObserver = observer;
})();

// --- BLOCCO LINK ATTIVO NELLA NAVIGAZIONE (SCROLLSPY) ---
(function () {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.link-navigazione a[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.link-navigazione a[href="#${id}"]`);
                navLinks.forEach(link => link.classList.remove('attivo'));
                if (activeLink) {
                    activeLink.classList.add('attivo');
                }
            }
        });
    }, {
        threshold: 0.5
    });

    sections.forEach(section => observer.observe(section));
})();

// --- BLOCCO PULSANTE "TORNA SU" ---
(function () {
    const pulsanteTornaSu = document.querySelector('.pulsante-torna-su');
    if (!pulsanteTornaSu) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            pulsanteTornaSu.classList.add('visibile');
        } else {
            pulsanteTornaSu.classList.remove('visibile');
        }
    });
})();

// --- BLOCCO INTERNAZIONALIZZAZIONE (I18N) ---
(function() {
    let translations = {};
    const supportedLangs = ['it', 'en'];
    const defaultLang = 'it';

    const loadTranslations = async (lang) => {
        const response = await fetch(`./static/lang/${lang}.json`);
        if (!response.ok) throw new Error(`File di traduzione non trovato: ${lang}.json`);
        translations = await response.json();
    };

    const translatePage = () => {
        document.querySelectorAll('[data-i18n-key]').forEach(element => {
            const key = element.getAttribute('data-i18n-key');
            if (translations[key]) {
                element.innerHTML = translations[key];
            }
        });
    };
    window.translatePage = translatePage;
    
    const updateLangSelector = (lang) => {
        document.querySelectorAll('[data-lang]').forEach(link => {
            link.classList.remove('attivo');
            if (link.getAttribute('data-lang') === lang) {
                link.classList.add('attivo');
            }
        });
    };
    
    const setLanguage = async (lang) => {
        try {
            await loadTranslations(lang);
            translatePage();
            updateLangSelector(lang);

            // Logica per cambiare il link del form di supporto
            const pulsanteSupporto = document.querySelector('.pulsante-cta-supporto');
            if (pulsanteSupporto) {
                const linkFormIT = "https://docs.google.com/forms/d/e/1FAIpQLSeFVVcPyeEjTpxi0AQTGsS3zAvPGHszouZFbRHGyh5gL5vN0A/viewform?usp=header";
                const linkFormEN = "https://docs.google.com/forms/d/e/1FAIpQLSdRbYH4BVieqrLOuuAGLF7cY6v_3mIlf2iO-YEdFj8mHFyxTA/viewform?usp=dialog";

                if (lang === 'en') {
                    pulsanteSupporto.href = linkFormEN;
                } else {
                    pulsanteSupporto.href = linkFormIT;
                }
            }

            localStorage.setItem('userLanguage', lang);
            console.log(`Lingua impostata a: ${lang}`);

            document.dispatchEvent(new Event('languageChanged'));
        } catch (error) {
            console.error(`Errore nell'impostare la lingua ${lang}:`, error);
        }
    };
    
    const initializeI18n = () => {
        const savedLang = localStorage.getItem('userLanguage');
        const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
        let langToLoad = savedLang || browserLang;
        
        if (!supportedLangs.includes(langToLoad)) {
            langToLoad = defaultLang;
        }

        setLanguage(langToLoad);
    };

    document.querySelectorAll('[data-lang]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const newLang = link.getAttribute('data-lang');
            setLanguage(newLang);
        });
    });

    initializeI18n();
})();

// --- FIX PER L'ALTEZZA 100VH SUI BROWSER MOBILI ---
(function() {
    const setVhVariable = () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVhVariable();
    window.addEventListener('resize', setVhVariable);
})();

// --- BLOCCO LINK ATTIVO NELLA NAVIGAZIONE (PAGINA CORRENTE) ---
(function() {
    const paginaCorrente = window.location.pathname.split('/').pop();

    if (paginaCorrente === '' || paginaCorrente === 'index.html') {
        return;
    }

    const linkNavigazione = document.querySelectorAll('.link-navigazione a');

    linkNavigazione.forEach(link => {
        const hrefLink = link.getAttribute('href').split('/').pop();
        if (hrefLink === paginaCorrente) {
            link.classList.add('attivo');
        }
    });
})();

(function() {
    const barraNavigazione = document.querySelector('.barra-navigazione');
    if (!barraNavigazione) return;

    const sogliaScroll = 10; // Riduciamo la soglia per un effetto più rapido

    const gestisciStatoNavigazione = () => {
        // Controlliamo se la pagina è più corta della finestra
        const paginaCorta = document.body.scrollHeight <= window.innerHeight;
        
        // Applichiamo la classe 'scrolled' se l'utente ha scrollato O se la pagina è corta
        if (window.scrollY > sogliaScroll || paginaCorta) {
            barraNavigazione.classList.add('scrolled');
        } else {
            barraNavigazione.classList.remove('scrolled');
        }
    };

    // Aggiungiamo gli ascoltatori per gli eventi giusti
    window.addEventListener('scroll', gestisciStatoNavigazione);
    window.addEventListener('resize', gestisciStatoNavigazione); // Nuovo: si attiva al ridimensionamento

    // Eseguiamo la funzione una volta al caricamento per impostare lo stato iniziale
    gestisciStatoNavigazione();
})();