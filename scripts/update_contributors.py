import gspread
import os
import json

# Valori che, nella colonna "donato", indicano che il contributo NON è stato pagato
VALORI_FALSI = {'', 'no', 'n', 'false', '0', 'non ancora', 'non pagato', '-', 'nd', 'none', 'null'}


def conta_pagamenti(worksheet, etichetta):
    """
    Conta le righe del foglio in cui la colonna "donato" è valorizzata.
    Se la colonna non esiste, conta tutte le righe (compatibilità con fogli vecchi).
    """
    records = worksheet.get_all_records()
    if not records:
        print(f"Foglio {etichetta}: nessuna risposta.")
        return 0

    # Intestazioni ignorando maiuscole/minuscole e spazi: "Donato", "donato ", "Donato?"
    chiave_donato = next(
        (k for k in records[0].keys() if str(k).strip().lower().startswith('donato')),
        None
    )

    if chiave_donato is None:
        print(f"AVVISO: foglio {etichetta} senza colonna 'donato' (colonne: {list(records[0].keys())}). Conto tutte le righe.")
        return len(records)

    pagati = 0
    for record in records:
        valore = record.get(chiave_donato)
        if isinstance(valore, bool):
            e_pagato = valore
        else:
            testo = str(valore if valore is not None else '').strip().lower()
            e_pagato = testo not in VALORI_FALSI
        if e_pagato:
            pagati += 1

    print(f"Foglio {etichetta}: {pagati} pagamenti su {len(records)} risposte.")
    return pagati


def update_contributor_count():
    """
    Si connette a Google Sheets, conta le righe dei due fogli
    che hanno la colonna "donato" valorizzata e aggiorna contributors.txt.
    """
    try:
        # --- 1. Autenticazione ---
        # Carica le credenziali dal segreto di GitHub
        creds_json = os.environ.get('GCP_SA_KEY')
        if not creds_json:
            raise ValueError("La variabile d'ambiente GCP_SA_KEY non è stata trovata.")
            
        creds_dict = json.loads(creds_json)
        gc = gspread.service_account_from_dict(creds_dict)
        
        print("Autenticazione con Google Sheets riuscita.")

        # --- 2. Lettura dei dati ---
        sheet_id_it = os.environ.get('SHEET_ID_IT')
        sheet_id_en = os.environ.get('SHEET_ID_EN')

        if not sheet_id_it or not sheet_id_en:
            raise ValueError("ID dei fogli di calcolo non trovati nelle variabili d'ambiente.")

        # Foglio Italiano
        spreadsheet_it = gc.open_by_key(sheet_id_it)
        worksheet_it = spreadsheet_it.sheet1
        count_it = conta_pagamenti(worksheet_it, 'IT')
        print(f"Contributori pagati nel foglio italiano: {count_it}.")

        # Foglio Inglese
        spreadsheet_en = gc.open_by_key(sheet_id_en)
        worksheet_en = spreadsheet_en.sheet1
        count_en = conta_pagamenti(worksheet_en, 'EN')
        print(f"Contributori pagati nel foglio inglese: {count_en}.")

        # --- 3. Calcolo e scrittura ---
        total_contributors = count_it + count_en
        print(f"Totale contributori pagati calcolato: {total_contributors}")

        output_file = 'contributors.txt'
        with open(output_file, 'w') as f:
            f.write(str(total_contributors))
            
        print(f"File '{output_file}' aggiornato con il valore {total_contributors}.")

    except Exception as e:
        print(f"Errore durante l'esecuzione dello script: {e}")
        exit(1) # Esce con un codice di errore per far fallire la Action

if __name__ == "__main__":
    update_contributor_count()