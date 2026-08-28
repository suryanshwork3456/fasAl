"""
scripts/ingest.py
------------------
This script builds (or rebuilds) the knowledge base inside the vector
database. It is NOT part of the live API — you run it manually,
from the command line, whenever you add or change documents in
knowledge_base/docs/.

    python -m app.scripts.ingest

WHY IS THIS A SEPARATE SCRIPT INSTEAD OF RUNNING ON EVERY REQUEST?
Embedding text and writing to the database takes time and costs API
calls. Your knowledge base doesn't change on every user request, so
there is no reason to redo this work every time someone uploads a
crop photo. We do it ONCE, ahead of time, and the live API route
only ever READS from the database that this script builds.
"""

import os
import sys

# Ensures project root is on sys.path when running as a standalone script
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.rag.chunking import chunk_text
from app.rag.embeddings import embed_document
from app.rag.vector_store import add_chunk


def ingest_all_documents() -> None:
    """
    Reads every .txt file in settings.KNOWLEDGE_BASE_DIR, splits each one into
    chunks, embeds every chunk, and stores it in the vector database.
    """

    if not os.path.isdir(settings.KNOWLEDGE_BASE_DIR):
        print(f"Knowledge base folder not found: {settings.KNOWLEDGE_BASE_DIR}")
        return

    # Grab every filename in the knowledge base folder that ends in .txt
    filenames = [f for f in os.listdir(settings.KNOWLEDGE_BASE_DIR) if f.endswith(".txt")]

    if not filenames:
        print(f"No .txt files found in {settings.KNOWLEDGE_BASE_DIR}. Nothing to ingest.")
        return

    total_chunks_stored = 0

    # Process one document at a time.
    for filename in filenames:
        file_path = os.path.join(settings.KNOWLEDGE_BASE_DIR, filename)

        with open(file_path, "r", encoding="utf-8") as f:
            document_text = f.read()

        # Step 1: split this document's text into small chunks.
        chunks = chunk_text(
            document_text, 
            chunk_size=settings.CHUNK_SIZE, 
            overlap=settings.CHUNK_OVERLAP
        )

        print(f"{filename}: split into {len(chunks)} chunk(s)")

        # Step 2: embed and store each chunk one by one.
        for i, chunk in enumerate(chunks):
            # A unique ID per chunk, e.g. "tomato_late_blight.txt_0"
            chunk_id = f"{filename}_{i}"

            # Turn this chunk's text into an embedding vector.
            embedding = embed_document(chunk)

            # Store the chunk text + its vector + where it came from.
            # Keeping "source" in metadata means later you can trace
            # any retrieved chunk back to the original file, or filter
            # searches to only look within a specific document.
            add_chunk(
                chunk_id=chunk_id,
                chunk_text=chunk,
                embedding=embedding,
                metadata={"source": filename},
            )

            total_chunks_stored += 1

    print(f"\nDone. Stored {total_chunks_stored} chunks from {len(filenames)} document(s).")


if __name__ == "__main__":
    ingest_all_documents()