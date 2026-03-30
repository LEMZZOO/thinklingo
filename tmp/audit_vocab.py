import json
import os

WORKSPACE = "/Users/sane/Documents/APPS/english-vocab-app"
DATA_FILE = os.path.join(WORKSPACE, "data", "vocabulary.json")
RAW_FILE = "/tmp/raw_vocab2.json"
OUT_MISSING_EXAMPLES = os.path.join(WORKSPACE, "tmp", "missing_examples.json")
OUT_MISSING_ENTRIES = os.path.join(WORKSPACE, "tmp", "missing_entries.json")

def main():
    os.makedirs(os.path.join(WORKSPACE, "tmp"), exist_ok=True)
    
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        vocab = json.load(f)
        
    with open(RAW_FILE, 'r', encoding='utf-8') as f:
        raw_vocab = json.load(f)
        
    # 1. Missing examples
    missing_es = []
    for entry in vocab:
        if not entry.get('example_sentence_es'):
            missing_es.append({
                'id': entry['id'],
                'english_word': entry['english_word'],
                'example_sentence_en': entry['example_sentence_en']
            })
            
    with open(OUT_MISSING_EXAMPLES, 'w', encoding='utf-8') as f:
        json.dump(missing_es, f, indent=2, ensure_ascii=False)
        
    # 2. Missing entries
    # Track pairs to find EXACT missing entries (since we deduplicated some words)
    vocab_pairs = {(e['english_word'], e['example_sentence_en']) for e in vocab}
    
    missing_entries = []
    for row in raw_vocab:
        pair = (row['english'], row['example_en'])
        if pair not in vocab_pairs:
            missing_entries.append(row)
            
    with open(OUT_MISSING_ENTRIES, 'w', encoding='utf-8') as f:
        json.dump(missing_entries, f, indent=2, ensure_ascii=False)
        
    print(f"Ejemplos faltantes: {len(missing_es)}")
    print(f"Entradas faltantes: {len(missing_entries)}")

if __name__ == '__main__':
    main()
