import json

# Paths
RESULT_JSON = "../result.json"
UNIQUE_IDS_TXT = "../final_unique_question_ids.txt"
OUTPUT_JSON = "../questions1.json"

def load_unique_ids(path):
    with open(path, encoding="utf-8") as f:
        return set(line.strip() for line in f if line.strip())

def filter_questions(result_path, unique_ids):
    with open(result_path, encoding="utf-8") as f:
        data = json.load(f)
    # Filter objects that have an "id" field and its value is in unique_ids
    filtered = [obj for obj in data if isinstance(obj, dict) and obj.get("id") in unique_ids]
    return filtered

def main():
    unique_ids = load_unique_ids(UNIQUE_IDS_TXT)
    filtered = filter_questions(RESULT_JSON, unique_ids)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()