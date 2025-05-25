import json
import sys
from collections import defaultdict

def load_questions(filename):
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

def main(input_file, unique_file, count_file):
    questions = load_questions(input_file)
    # Use the question text as the key for uniqueness
    seen = {}
    counts = defaultdict(int)
    for q in questions:
        key = q.get("question", "").strip()
        if not key:
            continue
        counts[key] += 1
        if key not in seen:
            seen[key] = q

    # Write unique questions (full question objects)
    with open(unique_file, "w", encoding="utf-8") as f:
        json.dump(list(seen.values()), f, ensure_ascii=False, indent=2)

    # Write questions with counts (only question text and count)
    counted = [
        {"question": k, "count": v}
        for k, v in sorted(counts.items(), key=lambda x: -x[1])
    ]
    with open(count_file, "w", encoding="utf-8") as f:
        json.dump(counted, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python merge_jsons.py input.json unique.json counts.json")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3])