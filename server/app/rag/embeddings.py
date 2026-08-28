# """
# embeddings.py
# -------------
# This file has ONE job: turn TEXT into a list of numbers (a "vector",
# also called an "embedding") using Gemini's embedding model.

# WHY DO WE NEED EMBEDDINGS?
# A computer can't compare the "meaning" of two sentences just by
# reading them. But if we convert each sentence into a vector using an
# embedding model, sentences with SIMILAR MEANING end up with vectors
# that are close together in space — even if they don't share any of
# the same words. This is what lets us search "by meaning" instead of
# "by exact keyword match".

# We use the SAME embedding model for two different jobs, and we tell
# Gemini which job we're doing via `task_type`:
#   1. Embedding our knowledge base documents (done once, ahead of time,
#      by scripts/ingest.py) -> task_type="RETRIEVAL_DOCUMENT"
#   2. Embedding the user's query at request time (done on every
#      request, inside rag/retriever.py) -> task_type="RETRIEVAL_QUERY"

# Using the correct task_type for each side measurably improves how
# relevant the search results are — it's a small detail worth keeping.
# """

# from google import genai
# from google.genai import types

# from app.core.config import GEMINI_API_KEY, EMBEDDING_MODEL

# # One shared Gemini client for this whole module, created once when the
# # module is first imported (instead of creating a brand-new client
# # every time we want to embed something).
# client = genai.Client(api_key=GEMINI_API_KEY)


# def embed_document(text: str) -> list[float]:
#     """
#     Turns a piece of KNOWLEDGE BASE text into an embedding vector.
#     Use this only when STORING documents into the vector database
#     (see scripts/ingest.py).
#     """
#     result = client.models.embed_content(
#         model=EMBEDDING_MODEL,
#         contents=text,
#         config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
#     )
#     # `result.embeddings` is a list because Gemini lets you embed many
#     # pieces of text in one call. We only sent one string, so we just
#     # grab the first (and only) result and return its raw number list.
#     return result.embeddings[0].values


# def embed_query(text: str) -> list[float]:
#     """
#     Turns a USER QUERY into an embedding vector.
#     Use this at request time, right before searching the vector
#     database (see rag/retriever.py).
#     """
#     result = client.models.embed_content(
#         model=EMBEDDING_MODEL,
#         contents=text,
#         config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
#     )
#     return result.embeddings[0].values

from google import genai
from google.genai import types

from app.core.config import GEMINI_API_KEY, EMBEDDING_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)


def embed_document(text: str) -> list[float]:
    """
    Turns a piece of KNOWLEDGE BASE text into an embedding vector.
    """
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
    )
    if hasattr(result, "embedding") and result.embedding:
        return result.embedding.values
    return result.embeddings[0].values


def embed_query(text: str) -> list[float]:
    """
    Turns a USER QUERY into an embedding vector.
    """
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
    )
    if hasattr(result, "embedding") and result.embedding:
        return result.embedding.values
    return result.embeddings[0].values