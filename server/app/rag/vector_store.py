"""
vector_store.py
----------------
This file wraps ChromaDB, which is our VECTOR DATABASE — the place
where we store every knowledge-base chunk together with its embedding
vector, and where we search for the chunks closest in meaning to a
given query vector.

WHY WRAP IT INSTEAD OF USING CHROMA DIRECTLY EVERYWHERE?
If we ever swap ChromaDB for a different vector database later (e.g.
Pinecone or pgvector, when this goes to production), we only need to
rewrite THIS file. Nothing else in the app needs to change, because
the rest of the app only calls the functions defined here.
"""

import chromadb

from app.core.config import VECTOR_DB_DIR, COLLECTION_NAME

# A PersistentClient saves the database to a folder on disk
# (VECTOR_DB_DIR), so the data survives server restarts.
# This line runs once, when this file is first imported.
_client = chromadb.PersistentClient(path=VECTOR_DB_DIR)

# get_or_create_collection: if a collection with this name already
# exists on disk, reuse it. Otherwise, create a fresh empty one.
_collection = _client.get_or_create_collection(name=COLLECTION_NAME)


def add_chunk(chunk_id: str, chunk_text: str, embedding: list[float], metadata: dict) -> None:
    """
    Stores ONE chunk of text into the vector database.

    Parameters
    ----------
    chunk_id : str
        A unique ID for this chunk (e.g. "tomato_late_blight_0").
    chunk_text : str
        The actual chunk text, so we can retrieve the readable text
        later (the database stores this alongside its vector).
    embedding : list[float]
        The embedding vector for this chunk, produced by
        rag/embeddings.py's embed_document().
    metadata : dict
        Extra information about this chunk, e.g. {"source": "tomato_late_blight.txt"}.
        Metadata lets us filter search results later
        (e.g. "only search within tomato-related documents").
    """
    _collection.add(
        ids=[chunk_id],
        documents=[chunk_text],
        embeddings=[embedding],
        metadatas=[metadata],
    )


def query(embedding: list[float], top_k: int) -> list[str]:
    """
    Searches the vector database for the `top_k` chunks whose vectors
    are closest (most similar in meaning) to the given query embedding.

    Parameters
    ----------
    embedding : list[float]
        The query's embedding vector, produced by
        rag/embeddings.py's embed_query().
    top_k : int
        How many matching chunks to return.

    Returns
    -------
    list[str]
        The matching chunk texts, best match first.
    """
    results = _collection.query(
        query_embeddings=[embedding],
        n_results=top_k,
    )

    # Chroma's response is structured for BATCH queries (many queries
    # at once), so results are nested one level deeper than you'd
    # expect. Since we only ever send ONE query embedding at a time,
    # we always want the first (index 0) result list.
    matched_documents = results["documents"][0]
    return matched_documents


def collection_is_empty() -> bool:
    """
    Returns True if no documents have been ingested yet.
    Useful so the API route can respond gracefully instead of
    crashing when someone forgets to run the ingestion script.
    """
    return _collection.count() == 0
