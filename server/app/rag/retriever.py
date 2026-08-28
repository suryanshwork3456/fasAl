"""
retriever.py
------------
This file is the ONE function the rest of the app should call when it
wants relevant knowledge for a query. It ties together:
  1. embeddings.py  -> turn the query text into a vector
  2. vector_store.py -> search the vector database with that vector

Keeping this as a separate "retriever" layer (instead of calling
embeddings + vector_store directly from the API route) means the
route code stays clean, and later you can make retrieval smarter
(e.g. add metadata filtering, re-ranking, hybrid search) by editing
ONLY this file.
"""

from app.core.config import TOP_K_RESULTS
from app.rag.embeddings import embed_query
from app.rag.vector_store import query as vector_store_query, collection_is_empty


def retrieve_relevant_chunks(query_text: str) -> list[str]:
    """
    Given a plain-text query (e.g. a description of a plant's
    symptoms), returns the most relevant chunks of knowledge from
    our knowledge base.

    Parameters
    ----------
    query_text : str
        A short piece of text describing what we're looking for.
        In our crop app, this will be the crop name + symptoms that
        Gemini extracted from the uploaded image.

    Returns
    -------
    list[str]
        The most relevant chunk texts. Returns an empty list if the
        knowledge base hasn't been built yet, so callers can handle
        that case instead of crashing.
    """

    # Guard clause: if nobody has run scripts/ingest.py yet, the
    # database is empty. Trying to search an empty collection isn't
    # an error, but there's nothing useful to return, so we short
    # circuit here.
    if collection_is_empty():
        return []

    # Step 1: turn the query text into an embedding vector.
    query_embedding = embed_query(query_text)

    # Step 2: ask the vector database for the closest-matching chunks.
    relevant_chunks = vector_store_query(query_embedding, top_k=TOP_K_RESULTS)

    return relevant_chunks
