import fitz  # PyMuPDF
import base64
import json
import sys

def extract_images_as_base64(pdf_path: str) -> list[str]:
    base64_images = []

    # Open the PDF
    doc = fitz.open(pdf_path)

    for page_number in range(len(doc)):
        page = doc[page_number]
        image_list = page.get_images(full=True)

        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]

            # Convert to base64
            encoded_image = base64.b64encode(image_bytes).decode('utf-8')
            base64_images.append(f"data:image/png;base64,{encoded_image}")

    return base64_images

def fill_images_in_json(json_path: str, images_base64: list[str], output_path: str = "result.json"):
    """
    Opens a JSON file containing a list of objects. For each object with an "img" field equal to "",
    fills it with the next base64 image from images_base64. Saves the result to output_path.
    """
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    img_idx = 0
    for obj in data:
        if isinstance(obj, dict) and obj.get("img", None) == "" and img_idx < len(images_base64):
            obj["img"] = images_base64[img_idx]
            img_idx += 1

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Example usage:
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <pdf_file_path> <json_file_path>")
        sys.exit(1)

    pdf_file_path = sys.argv[1]
    json_file_path = sys.argv[2]
    images_base64 = extract_images_as_base64(pdf_file_path)[3:]

    fill_images_in_json(json_file_path, images_base64)
