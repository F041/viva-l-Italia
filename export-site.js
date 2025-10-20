/**
 * export-site.js
 *
 * Uso:
 *   node export-site.js                -> esegue sulla cartella corrente
 *   node export-site.js /percorso/dir  -> esegue sulla cartella specificata
 *
 * Produce: C:\Users\Gabriele\Downloads\sito-viva-l-italia\sito-viva-l-italia-export.txt
 *
 * Note:
 * - Include file con estensioni: .html, .js, .css, .md, .json
 * - Esclude la cartella di output (per evitare includere export precedenti),
 *   'node_modules' e '.git'.
 * - Esclude lo stesso script (qualsiasi sia il suo nome) e il file di output.
 */

const fs = require('fs').promises;
const path = require('path');

const ALLOWED_EXT = new Set(['.html', '.js', '.css', '.md', '.json']);

// <- Modifica: output fisso nella cartella specificata
const DEFAULT_OUTPUT_DIR = 'C:\\Users\\Gabriele\\Downloads\\sito-viva-l-italia';
const OUTPUT_FILENAME = 'sito-viva-l-italia-export.txt';

async function collectFiles(rootDir, options = {}) {
    const { scriptFullPath, outputFullPath, ignoreDirBasenames = [] } = options;
    const results = [];

    async function walk(currentDir) {
        let entries;
        try {
            entries = await fs.readdir(currentDir, { withFileTypes: true });
        } catch (err) {
            console.error(`Impossibile leggere la directory ${currentDir}:`, err.message);
            return;
        }

        for (const entry of entries) {
            const fullPath = path.resolve(currentDir, entry.name);

            if (entry.isDirectory()) {
                // ignora cartelle sensibili
                const base = entry.name;
                if (base === 'node_modules' || base === '.git' || ignoreDirBasenames.includes(base)) {
                    continue;
                }
                await walk(fullPath);
            } else if (entry.isFile()) {
                // Escludi lo script stesso e il file di output (se sono nella stessa gerarchia)
                if (scriptFullPath && fullPath === scriptFullPath) continue;
                if (outputFullPath && fullPath === outputFullPath) continue;

                const ext = path.extname(entry.name).toLowerCase();
                if (ALLOWED_EXT.has(ext)) {
                    results.push(fullPath);
                }
            }
        }
    }

    await walk(rootDir);
    results.sort(); // ordine stabile
    return results;
}

function headerFor(filePath, stats) {
    const rel = filePath;
    const size = stats ? `${stats.size} bytes` : 'n/a';
    const mtime = stats ? stats.mtime.toISOString() : 'n/a';
    return [
        '/* ====================================================== */',
        `File: ${rel}`,
        `Size: ${size}`,
        `Modified: ${mtime}`,
        `Path (absolute): ${path.resolve(rel)}`,
        '/* ------------------------------------------------------ */',
        ''
    ].join('\n');
}

async function run() {
    const argDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
    const outputDir = path.resolve(DEFAULT_OUTPUT_DIR);
    const outputFile = path.join(outputDir, OUTPUT_FILENAME);

    // percorso assoluto dello script corrente (es. /.../export-site.js)
    const scriptPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

    console.log(`Scansione della cartella: ${argDir}`);
    console.log(`Scriverò l'export in: ${outputFile}`);
    console.log(`Escluderò dalla scansione: script = ${scriptPath || 'none'}, output = ${outputFile}`);

    const files = await collectFiles(argDir, {
        scriptFullPath: scriptPath,
        outputFullPath: path.resolve(outputFile),
        // escludi la cartella di output nel caso sia sotto argDir
        ignoreDirBasenames: [path.basename(outputDir), 'node_modules', '.git']
    });

    if (files.length === 0) {
        console.warn('Nessun file con estensione .html/.js/.css/.md/.json trovato.');
    } else {
        console.log(`Trovati ${files.length} file. Preparazione export...`);
    }

    // Assicura cartella di output
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
        console.error('Errore creazione cartella di output:', err.message);
        process.exit(1);
    }

    const outStreamParts = [];

    for (const f of files) {
        try {
            const stats = await fs.stat(f);
            const header = headerFor(path.relative(argDir, f), stats);
            let content;
            try {
                content = await fs.readFile(f, 'utf8');
            } catch (readErr) {
                content = `*** ERRORE LETTURA FILE IN UTF-8: ${readErr.message} ***\n`;
            }
            outStreamParts.push(header);
            outStreamParts.push(content);
            outStreamParts.push('\n\n/* =============== END OF FILE =============== */\n\n');
        } catch (err) {
            console.error(`Impossibile processare ${f}:`, err.message);
        }
    }

    const finalText = outStreamParts.join('');
    try {
        await fs.writeFile(outputFile, finalText, 'utf8');
        console.log(`Export completato: ${outputFile}`);
        console.log('Dimensione export:', Buffer.byteLength(finalText, 'utf8'), 'bytes');
    } catch (err) {
        console.error('Errore scrittura file di export:', err.message);
        process.exit(1);
    }
}

run().catch(err => {
    console.error('Errore inaspettato:', err);
    process.exit(1);
});
