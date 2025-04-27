from flask import Flask, request, jsonify
import pytesseract
from PIL import Image
import io

app = Flask(_name_)

@app.route('/processBloodReport', methods=['POST'])
def process_blood_report():
    try:
        # Get the image file from the request
        image_file = request.files['image']
        image = Image.open(io.BytesIO(image_file.read()))

        # Preprocess the image (convert to grayscale)
        image = image.convert('L')

        # Use Tesseract to extract text
        extracted_text = pytesseract.image_to_string(image)

        # Parse the extracted text to organize the data
        lines = extracted_text.split('\n')
        data = {}

        # Keywords to look for in the text (with possible OCR variations)
        keywords = [
            "TRIGLYCERIDES",
            "SERUM.CHOLESTEROL",
            "HDL.CHOLESTEROL",
            "LDL.CHOLESTEROL",
            "VLDL.CHOLESTEROL",
            "NON-HDL CHOLESTEROL",
        ]

        # Find the RESULT(S) section
        results_section_started = False
        for line in lines:
            if "RESULT(S)" in line:
                results_section_started = True
                continue  # Skip the line containing "RESULT(S)"

            if results_section_started:
                # Check if the line contains a value (e.g., "935 mg/dl")
                if "mg/dl" in line or "N/A" in line:
                    # Extract the value
                    value = line.strip()
                    # Assign the value to the corresponding keyword
                    if keywords:
                        data[keywords.pop(0)] = value

        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if _name_ == '_main_':
    app.run(debug=True)