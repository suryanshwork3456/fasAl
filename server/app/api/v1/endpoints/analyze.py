# # """
# # routes/analyze.py
# # ------------------
# # This is your original route, restructured to use RAG (Retrieval-
# # Augmented Generation). The public behavior is the same as before:
# # upload an image, get back a JSON diagnosis. What changed is HOW we
# # get to that answer.

# # OLD FLOW (one Gemini call):
# #     image -> Gemini -> final JSON

# # NEW FLOW (two Gemini calls, with a retrieval step in between):
# #     image -> Gemini (extract crop + symptoms as plain text)
# #           -> use that text to search our knowledge base
# #           -> image + retrieved knowledge -> Gemini -> final JSON

# # WHY TWO CALLS?
# # Our knowledge base is TEXT (chunks of disease guides). We can't search
# # it using an image directly - a vector database compares text
# # embeddings, not pixels. So the first Gemini call's only job is to
# # translate the image into a short text description we CAN search with.
# # The second call is the one that actually produces the answer, now
# # backed by real reference material instead of relying purely on the
# # model's memory.
# # """

# # import io
# # import json

# # from fastapi import APIRouter, UploadFile, HTTPException
# # from fastapi.responses import JSONResponse
# # from google import genai
# # from PIL import Image

# # from app.core.config import GEMINI_API_KEY, GENERATION_MODEL
# # from app.rag.retriever import retrieve_relevant_chunks

# # router = APIRouter()

# # # Same Gemini client setup as your original code.
# # client = genai.Client(api_key=GEMINI_API_KEY)

# # # The exact JSON shape we always return, for both valid and invalid
# # # images. Keeping it as a constant means the "invalid image" shortcut
# # # below and the final Gemini prompt both stay in sync with each other.
# # INVALID_IMAGE_RESPONSE = {
# #     "crop_name": "N/A",
# #     "status": "Invalid Image",
# #     "disease_name": "N/A",
# #     "confidence": "Low",
# #     "symptoms": ["The uploaded image is not a recognized plant or crop."],
# #     "treatment": ["Please upload a clear picture of your crop or leaf."],
# # }


# # @router.post("/analyze")
# # async def analyze_crop_image(file: UploadFile):
# #     if not file.content_type.startswith("image/"):
# #         raise HTTPException(status_code=400, detail="File uploaded is not an image.")

# #     try:
# #         contents = await file.read()
# #         image_obj = Image.open(io.BytesIO(contents))

# #         # ------------------------------------------------------------
# #         # STEP 1: EXTRACTION
# #         # Ask Gemini a small, focused question: what crop is this, and
# #         # what symptoms are visible? We deliberately do NOT ask for a
# #         # diagnosis yet. This step's only job is to produce a short
# #         # piece of TEXT that we can use to search our knowledge base.
# #         # ------------------------------------------------------------
# #         extraction_prompt = """
# #         Look at this image and respond with ONLY plain text (no JSON, no markdown).

# #         If the image does NOT clearly show a crop, leaf, plant, or agricultural
# #         field (for example: a shoe, a person, a vehicle, a document), respond
# #         with exactly this text and nothing else:
# #         NOT_A_CROP

# #         If the image DOES show a crop/plant, respond with 1-2 short sentences
# #         naming the crop and describing exactly what you visually see
# #         (leaf color, spots, wilting, discoloration pattern, pests, etc).
# #         Do not diagnose a disease yet, just describe what is visible.
# #         """

# #         extraction_response = await client.aio.models.generate_content(
# #             model=GENERATION_MODEL,
# #             contents=[image_obj, extraction_prompt],
# #         )
# #         extracted_description = extraction_response.text.strip()

# #         # If Gemini decided this isn't a crop image at all, stop here.
# #         # There is no point retrieving knowledge or making a second
# #         # Gemini call for something that isn't a plant.
# #         if extracted_description == "NOT_A_CROP":
# #             return JSONResponse(content=INVALID_IMAGE_RESPONSE)

# #         # ------------------------------------------------------------
# #         # STEP 2: RETRIEVAL
# #         # Use the short description from Step 1 as a search query
# #         # against our knowledge base of disease/deficiency guides.
# #         # This returns a list of the most relevant text chunks
# #         # (or an empty list if the knowledge base hasn't been built
# #         # yet, or nothing relevant was found).
# #         # ------------------------------------------------------------
# #         relevant_chunks = retrieve_relevant_chunks(extracted_description)

# #         # Turn the list of chunks into one text block we can paste
# #         # into the next prompt. Separating chunks with "---" makes it
# #         # visually clear to the model where one reference ends and
# #         # the next begins.
# #         if relevant_chunks:
# #             retrieved_context = "\n---\n".join(relevant_chunks)
# #         else:
# #             # Being explicit about "nothing found" is important -
# #             # otherwise the model might not realize the knowledge base
# #             # came up empty and could fill the gap with a guess.
# #             retrieved_context = "No matching reference material was found."

# #         # ------------------------------------------------------------
# #         # STEP 3: AUGMENTED GENERATION
# #         # This is your original prompt, with one addition: a
# #         # "Reference material" section containing what we retrieved
# #         # in Step 2. Gemini is told to ground its answer in this
# #         # material when possible, instead of relying only on what it
# #         # already knows.
# #         # ------------------------------------------------------------
# #         final_prompt = f"""
# #         You are a crop health assistant. Use the reference material below,
# #         together with the image, to identify any disease, deficiency, or
# #         pest issue. If the reference material does not clearly cover what
# #         you see in the image, rely on your own knowledge instead, but
# #         prefer the reference material when it applies.

# #         Reference material:
# #         {retrieved_context}

# #         Visible symptoms already noted: {extracted_description}

# #         Respond ONLY with this raw JSON, no markdown code blocks:
# #         {{
# #           "crop_name": "Name of plant",
# #           "status": "Healthy or Diseased",
# #           "disease_name": "Disease name or N/A",
# #           "confidence": "High/Medium/Low",
# #           "symptoms": ["symptom 1", "symptom 2"],
# #           "treatment": ["treatment step 1", "treatment step 2"]
# #         }}
# #         """

# #         final_response = await client.aio.models.generate_content(
# #             model=GENERATION_MODEL,
# #             contents=[image_obj, final_prompt],
# #         )

# #         # Same cleanup + parsing as your original code.
# #         raw_text = final_response.text.strip()
# #         cleaned_text = raw_text.replace("```json", "").replace("```", "").strip()
# #         parsed_data = json.loads(cleaned_text)

# #         return JSONResponse(content=parsed_data)

# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")




# import io
# import json

# from fastapi import APIRouter, Depends, UploadFile, HTTPException
# from fastapi.responses import JSONResponse
# from google import genai
# from PIL import Image
# from sqlalchemy.orm import Session

# from app.core.config import GEMINI_API_KEY, GENERATION_MODEL
# from app.rag.retriever import retrieve_relevant_chunks
# from app.db.session import get_db
# from app.models.crop import CropAnalysis  # adjust import path if your model lives elsewhere

# router = APIRouter()

# # Same Gemini client setup as your original code.
# client = genai.Client(api_key=GEMINI_API_KEY)

# # The exact JSON shape we always return, for both valid and invalid
# # images. Keeping it as a constant means the "invalid image" shortcut
# # below and the final Gemini prompt both stay in sync with each other.
# INVALID_IMAGE_RESPONSE = {
#     "crop_name": "N/A",
#     "status": "Invalid Image",
#     "disease_name": "N/A",
#     "confidence": "Low",
#     "symptoms": ["The uploaded image is not a recognized plant or crop."],
#     "treatment": ["Please upload a clear picture of your crop or leaf."],
# }


# @router.post("/analyze")
# async def analyze_crop_image(file: UploadFile, db: Session = Depends(get_db)):
#     if not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="File uploaded is not an image.")

#     try:
#         contents = await file.read()
#         image_obj = Image.open(io.BytesIO(contents))

#         # ------------------------------------------------------------
#         # STEP 1: EXTRACTION
#         # Ask Gemini a small, focused question: what crop is this, and
#         # what symptoms are visible? We deliberately do NOT ask for a
#         # diagnosis yet. This step's only job is to produce a short
#         # piece of TEXT that we can use to search our knowledge base.
#         # ------------------------------------------------------------
#         extraction_prompt = """
#         Look at this image and respond with ONLY plain text (no JSON, no markdown).

#         If the image does NOT clearly show a crop, leaf, plant, or agricultural
#         field (for example: a shoe, a person, a vehicle, a document), respond
#         with exactly this text and nothing else:
#         NOT_A_CROP

#         If the image DOES show a crop/plant, respond with 1-2 short sentences
#         naming the crop and describing exactly what you visually see
#         (leaf color, spots, wilting, discoloration pattern, pests, etc).
#         Do not diagnose a disease yet, just describe what is visible.
#         """

#         extraction_response = await client.aio.models.generate_content(
#             model=GENERATION_MODEL,
#             contents=[image_obj, extraction_prompt],
#         )
#         extracted_description = extraction_response.text.strip()

#         # If Gemini decided this isn't a crop image at all, stop here.
#         # There is no point retrieving knowledge or making a second
#         # Gemini call for something that isn't a plant.
#         #
#         # NOTE: we deliberately do NOT save this to the database - an
#         # "invalid image" result isn't a real crop analysis, so it
#         # would just pollute the crop_analyses table with junk rows.
#         if extracted_description == "NOT_A_CROP":
#             return JSONResponse(content=INVALID_IMAGE_RESPONSE)

#         # ------------------------------------------------------------
#         # STEP 2: RETRIEVAL
#         # Use the short description from Step 1 as a search query
#         # against our knowledge base of disease/deficiency guides.
#         # This returns a list of the most relevant text chunks
#         # (or an empty list if the knowledge base hasn't been built
#         # yet, or nothing relevant was found).
#         # ------------------------------------------------------------
#         relevant_chunks = retrieve_relevant_chunks(extracted_description)

#         # Turn the list of chunks into one text block we can paste
#         # into the next prompt. Separating chunks with "---" makes it
#         # visually clear to the model where one reference ends and
#         # the next begins.
#         if relevant_chunks:
#             retrieved_context = "\n---\n".join(relevant_chunks)
#         else:
#             # Being explicit about "nothing found" is important -
#             # otherwise the model might not realize the knowledge base
#             # came up empty and could fill the gap with a guess.
#             retrieved_context = "No matching reference material was found."

#         # ------------------------------------------------------------
#         # STEP 3: AUGMENTED GENERATION
#         # This is your original prompt, with one addition: a
#         # "Reference material" section containing what we retrieved
#         # in Step 2. Gemini is told to ground its answer in this
#         # material when possible, instead of relying only on what it
#         # already knows.
#         # ------------------------------------------------------------
#         final_prompt = f"""
#         You are a crop health assistant. Use the reference material below,
#         together with the image, to identify any disease, deficiency, or
#         pest issue. If the reference material does not clearly cover what
#         you see in the image, rely on your own knowledge instead, but
#         prefer the reference material when it applies.

#         Reference material:
#         {retrieved_context}

#         Visible symptoms already noted: {extracted_description}

#         Respond ONLY with this raw JSON, no markdown code blocks:
#         {{
#           "crop_name": "Name of plant",
#           "status": "Healthy or Diseased",
#           "disease_name": "Disease name or N/A",
#           "confidence": "High/Medium/Low",
#           "symptoms": ["symptom 1", "symptom 2"],
#           "treatment": ["treatment step 1", "treatment step 2"]
#         }}
#         """

#         final_response = await client.aio.models.generate_content(
#             model=GENERATION_MODEL,
#             contents=[image_obj, final_prompt],
#         )

#         # Same cleanup + parsing as your original code.
#         raw_text = final_response.text.strip()
#         cleaned_text = raw_text.replace("```json", "").replace("```", "").strip()
#         parsed_data = json.loads(cleaned_text)

#         # ------------------------------------------------------------
#         # STEP 4: PERSISTENCE
#         # Save the parsed result to the crop_analyses table. This is
#         # the piece that was missing before - Gemini's answer was
#         # being returned to the client but never written to the DB.
#         #
#         # We build the row from parsed_data with .get(...) fallbacks
#         # so a slightly malformed Gemini response (e.g. a missing key)
#         # doesn't crash the whole request - it just falls back to a
#         # safe default instead of raising a KeyError.
#         # ------------------------------------------------------------
#         db_record = CropAnalysis(
#             crop_name=parsed_data.get("crop_name", "Unknown"),
#             status=parsed_data.get("status", "Unknown"),
#             disease_name=parsed_data.get("disease_name", "N/A"),
#             confidence=parsed_data.get("confidence", "Low"),
#             symptoms=parsed_data.get("symptoms", []),
#             treatment=parsed_data.get("treatment", []),
#         )

#         db.add(db_record)
#         db.commit()
#         # refresh() pulls back the DB-generated fields (id, created_at)
#         # onto db_record so we can include them in the response below.
#         db.refresh(db_record)

#         # Include the DB id in the response so the frontend can
#         # reference/link back to this saved record if needed.
#         parsed_data["id"] = db_record.id

#         return JSONResponse(content=parsed_data)

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

import io
import json

from fastapi import APIRouter, Depends, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from google import genai
from PIL import Image
from sqlalchemy.orm import Session

from app.core.config import GEMINI_API_KEY, GENERATION_MODEL
from app.rag.retriever import retrieve_relevant_chunks
from app.db.session import get_db
from app.models.crop import CropAnalysis
from app.models.user import User
from app.api.v1.endpoints.deps_auth import get_current_user

router = APIRouter()

client = genai.Client(api_key=GEMINI_API_KEY)

INVALID_IMAGE_RESPONSE = {
    "crop_name": "N/A",
    "status": "Invalid Image",
    "disease_name": "N/A",
    "confidence": "Low",
    "symptoms": ["The uploaded image is not a recognized plant or crop."],
    "treatment": ["Please upload a clear picture of your crop or leaf."],
}


@router.post("/analyze")
async def analyze_crop_image(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded is not an image.")

    try:
        contents = await file.read()
        image_obj = Image.open(io.BytesIO(contents))

        # ------------------------------------------------------------
        # STEP 1: EXTRACTION
        # ------------------------------------------------------------
        extraction_prompt = """
        Look at this image and respond with ONLY plain text (no JSON, no markdown).

        If the image does NOT clearly show a crop, leaf, plant, or agricultural
        field (for example: a shoe, a person, a vehicle, a document), respond
        with exactly this text and nothing else:
        NOT_A_CROP

        If the image DOES show a crop/plant, respond with 1-2 short sentences
        naming the crop and describing exactly what you visually see
        (leaf color, spots, wilting, discoloration pattern, pests, etc).
        Do not diagnose a disease yet, just describe what is visible.
        """

        extraction_response = await client.aio.models.generate_content(
            model=GENERATION_MODEL,
            contents=[image_obj, extraction_prompt],
        )
        extracted_description = extraction_response.text.strip()

        if extracted_description == "NOT_A_CROP":
            return JSONResponse(content=INVALID_IMAGE_RESPONSE)

        # ------------------------------------------------------------
        # STEP 2: RETRIEVAL
        # ------------------------------------------------------------
        relevant_chunks = retrieve_relevant_chunks(extracted_description)

        if relevant_chunks:
            retrieved_context = "\n---\n".join(relevant_chunks)
        else:
            retrieved_context = "No matching reference material was found."

        # ------------------------------------------------------------
        # STEP 3: AUGMENTED GENERATION
        # ------------------------------------------------------------
        final_prompt = f"""
        You are a crop health assistant. Use the reference material below,
        together with the image, to identify any disease, deficiency, or
        pest issue. If the reference material does not clearly cover what
        you see in the image, rely on your own knowledge instead, but
        prefer the reference material when it applies.

        Reference material:
        {retrieved_context}

        Visible symptoms already noted: {extracted_description}

        Respond ONLY with this raw JSON, no markdown code blocks:
        {{
          "crop_name": "Name of plant",
          "status": "Healthy or Diseased",
          "disease_name": "Disease name or N/A",
          "confidence": "High/Medium/Low",
          "symptoms": ["symptom 1", "symptom 2"],
          "treatment": ["treatment step 1", "treatment step 2"]
        }}
        """

        final_response = await client.aio.models.generate_content(
            model=GENERATION_MODEL,
            contents=[image_obj, final_prompt],
        )

        raw_text = final_response.text.strip()
        cleaned_text = raw_text.replace("```json", "").replace("```", "").strip()
        parsed_data = json.loads(cleaned_text)

        # ------------------------------------------------------------
        # STEP 4: PERSISTENCE — scoped to the logged-in user
        # ------------------------------------------------------------
        db_record = CropAnalysis(
            user_id=current_user.id,
            crop_name=parsed_data.get("crop_name", "Unknown"),
            status=parsed_data.get("status", "Unknown"),
            disease_name=parsed_data.get("disease_name", "N/A"),
            confidence=parsed_data.get("confidence", "Low"),
            symptoms=parsed_data.get("symptoms", []),
            treatment=parsed_data.get("treatment", []),
        )

        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        parsed_data["id"] = db_record.id

        return JSONResponse(content=parsed_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")