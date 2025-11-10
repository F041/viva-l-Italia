// Transizione pagina
(function() {
  const overlay = document.createElement('div');
  overlay.id = 'page-transition-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: #000; z-index: 10000;
    opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
  `;
  document.body.appendChild(overlay);

  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      overlay.style.pointerEvents = 'all';
      overlay.style.opacity = '1';
      await new Promise(r => setTimeout(r, 400));
      window.location.href = link.href;
    });
  });
})();


// === CONSOLE SEGRETA PER EASTER EGG ===
(function() {
  console.log("🎮 Console di Viva l'Italia inizializzata. Premi '\\' o '~' per aprirla.");
  
  // Crea il pannello con flexbox per gestione overflow
  const consolePanel = document.createElement('div');
  consolePanel.id = 'dev-console';
  consolePanel.style.cssText = `
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: auto !important;
    max-height: 40vh !important;
    min-height: 150px !important;
    background: rgba(0,0,0,0.98) !important;
    color: #c8a45c !important;
    font-family: 'Courier New', monospace !important;
    font-size: 14px !important;
    padding: 10px !important;
    display: none !important;
    z-index: 99999 !important; /* Massima priorità */
    border-top: 3px solid var(--accent) !important;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.8) !important;
    will-change: transform !important;
    backdrop-filter: blur(5px) !important;
    flex-direction: column !important;
  `;
  
  consolePanel.innerHTML = `
    <div class="console-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #333;">
      <span style="font-weight:bold;color:var(--accent);">CONSOLE </span>
      <button id="console-close" style="background:none;border:none;color:#c8a45c;font-size:18px;cursor:pointer;padding:0 5px;">×</button>
    </div>
    <div class="console-output" style="flex:1;overflow-y:auto;margin-bottom:10px;padding:5px;background:#0a0a0a;min-height:80px;max-height:25vh;"></div>
    <input type="text" class="console-input" style="width:100%;background:#111;border:1px solid #333;color:var(--accent);padding:8px;font-family:inherit;" placeholder="> Digita comando e premi INVIO...">
  `;
  document.body.appendChild(consolePanel);

  const consoleOutput = consolePanel.querySelector('.console-output');
  const consoleInput = consolePanel.querySelector('.console-input');

  // Lista comandi
  const commands = {
    godmode: () => { 
      document.body.style.filter = 'brightness(1.8) saturate(1.5) contrast(1.2)';
      return 'GODMODE ACTIVATED - Schermo saturetato e brillante';
    },
    version: () => 'VIVA L\'ITALIA v0.7.3-alpha Build 20251023',
    help: () => 'Comandi disponibili: godmode, version, help, clear, reset',
    clear: () => {
      consoleOutput.innerHTML = '';
      return 'Console pulita';
    },
    reset: () => {
      document.body.style.filter = 'none';
      return 'Effetti resettati';
    }
  };

  // Listener per APRIRE/CHIUDERE la console
  // Usa e.code per rilevare la posizione fisica del tasto (Backquote = tasto sotto ESC)
  window.addEventListener('keydown', (e) => {
    // DEBUG: Mostra in console del browser cosa premi
    console.log("TASTO PREMUTO:", e.key, "| CODE:", e.code);
    
    // Apri/chiudi con il tasto sotto ESC (Backquote)
    if (e.code === 'Backquote') {
      e.preventDefault();
      const isVisible = consolePanel.style.display === 'block';
      consolePanel.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        consoleInput.focus();
        consoleOutput.innerHTML += '<div style="color:#888">Console aperta. Scrivi "help" per i comandi.</div>';
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      }
    }
    
    // Chiudi anche con ESC
    if (e.key === 'Escape' && consolePanel.style.display === 'block') {
      consolePanel.style.display = 'none';
    }
  });

  // Listener per ESEGUIRE comando
  consoleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = consoleInput.value.trim().toLowerCase();
      
      // Mostra comando inserito
      consoleOutput.innerHTML += `<div style="color:#aaa">> ${consoleInput.value}</div>`;
      
      // Esegui e mostra output
      const output = commands[cmd] || (() => `Comando non trovato: "${cmd}". Scrivi "help".`);
      const result = typeof output === 'string' ? output : output();
      consoleOutput.innerHTML += `<div style="color:var(--accent)">${result}</div>`;
      
      // Scrolla in basso e pulisci input
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
      consoleInput.value = '';
    }
  });
})();

window.addEventListener('keydown', (e) => {
  // Converte il tasto in base al layout
  const key = e.key;
  const code = e.code;
  
  // ~ per layout ANSI (USA)
  // \ per layout ISO (Europa)
  // Inoltre: tolgo il preventDefault per non bloccare la scrittura
  if (key === '~' || key === '\\' || code === 'Backquote') {
    consolePanel.style.display = consolePanel.style.display === 'none' ? 'block' : 'none';
    if (consolePanel.style.display === 'block') {
      consoleInput.focus();
      e.preventDefault(); // Blocca solo se stiamo aprendo la console
    }
  }
});

// Aggiungi anche il supporto per ESC (molto europeo)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && consolePanel.style.display === 'block') {
    consolePanel.style.display = 'none';
  }
});


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