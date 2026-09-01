import io
import os
import json
from fastapi import UploadFile, HTTPException
from fastapi.responses import JSONResponse
from google import genai
from PIL import Image

# Initialize Gemini Client safely — a missing/invalid API key should
# only break THIS feature when someone calls it, not crash the whole
# server at startup (same principle as satellite.py's fallback logic).
try:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    _client_error = None
except Exception as e:
    client = None
    _client_error = str(e)


async def analyze_crop_image(file: UploadFile):
    if client is None:
        raise HTTPException(
            status_code=503,
            detail=f"Crop analysis is unavailable — Gemini client failed to initialize: {_client_error}"
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="File uploaded is not an image.")

    try:
        contents = await file.read()
        image_obj = Image.open(io.BytesIO(contents))

        prompt = """
        Step 1: Inspect the provided image carefully.
        Step 2: Check if this image clearly depicts a crop, leaf, plant, or agricultural field.
        
        IF THE IMAGE IS NOT A CROP/PLANT (e.g., shoe, human, vehicle, animal, document):
        Respond ONLY with this raw JSON:
        {
          "crop_name": "N/A",
          "status": "Invalid Image",
          "disease_name": "N/A",
          "confidence": "Low",
          "symptoms": ["The uploaded image is not a recognized plant or crop."],
          "treatment": ["Please upload a clear picture of your crop or leaf."]
        }

        IF THE IMAGE IS A CROP/PLANT:
        Identify any diseases, deficiencies, or pests and return this raw JSON:
        {
          "crop_name": "Name of plant",
          "status": "Healthy or Diseased",
          "disease_name": "Disease name or N/A",
          "confidence": "High/Medium/Low",
          "symptoms": ["symptom 1", "symptom 2"],
          "treatment": ["treatment step 1", "treatment step 2"]
        }

        Respond ONLY with valid JSON. Do not wrap output in Markdown code blocks.
        """

        # 1. Non-blocking async API call to Gemini
        response = await client.aio.models.generate_content(
            model="gemini-3.6-flash",
            contents=[image_obj, prompt]
        )

        # 2. Clean up Markdown backticks if present
        raw_text = response.text.strip()
        cleaned_text = raw_text.replace(
            "```json", "").replace("```", "").strip()

        # 3. Parse string to Python dict for safe JSON return
        parsed_data = json.loads(cleaned_text)

        return JSONResponse(content=parsed_data)

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini returned unparseable output: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Analysis failed: {str(e)}")
