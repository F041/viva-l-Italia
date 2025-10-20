import gspread
import os
import json

def update_contributor_count():
    """
    Si connette a Google Sheets, conta le righe dei due fogli,
    somma i totali e aggiorna il file contributors.txt.
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
        count_it = len(worksheet_it.get_all_records()) # Conta solo le righe con dati, ignorando l'header
        print(f"Trovate {count_it} risposte nel foglio italiano.")

        # Foglio Inglese
        spreadsheet_en = gc.open_by_key(sheet_id_en)
        worksheet_en = spreadsheet_en.sheet1
        count_en = len(worksheet_en.get_all_records())
        print(f"Trovate {count_en} risposte nel foglio inglese.")

        # --- 3. Calcolo e scrittura ---
        total_contributors = count_it + count_en
        print(f"Totale contributori calcolato: {total_contributors}")

        output_file = 'contributors.txt'
        with open(output_file, 'w') as f:
            f.write(str(total_contributors))
            
        print(f"File '{output_file}' aggiornato con il valore {total_contributors}.")

    except Exception as e:
        print(f"Errore durante l'esecuzione dello script: {e}")
        exit(1) # Esce con un codice di errore per far fallire la Action

if __name__ == "__main__":
    update_contributor_count()