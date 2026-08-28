"""
chunking.py
-----------
This file has ONE job: take a long piece of text (like a full disease
guide) and cut it into smaller "chunks".

WHY DO WE CHUNK TEXT AT ALL?
Vector databases work best when each stored entry is about ONE focused
idea. If we stored an entire multi-page document as a single entry,
then searching for "yellow leaves" would return the WHOLE document —
most of which has nothing to do with yellow leaves. Chunking keeps
each stored piece small and specific, so search results stay relevant.
"""

from typing import List


def chunk_text(text: str, chunk_size: int, overlap: int) -> List[str]:
    """
    Splits a long string into a list of smaller overlapping chunks.

    Parameters
    ----------
    text : str
        The full text of a document (e.g. the content of a .txt file).
    chunk_size : int
        How many WORDS should go into each chunk.
    overlap : int
        How many words from the END of one chunk are repeated at the
        START of the next chunk. This stops us from losing context if
        an important sentence happens to fall right on a chunk boundary.

    Returns
    -------
    List[str]
        A list of text chunks, each `chunk_size` words long
        (the last chunk may be shorter).
    """

    # Step 1: split the whole document into individual words.
    # This is a very simple way to measure "how much text" we have.
    # (Good enough for a basic system — production systems often use
    # a proper tokenizer instead of word-splitting, but the idea is
    # exactly the same.)
    words = text.split()

    chunks = []
    start_index = 0

    # Step 2: slide a "window" across the list of words.
    # Each loop grabs `chunk_size` words starting at `start_index`,
    # turns them back into a sentence, and saves that as one chunk.
    while start_index < len(words):
        end_index = start_index + chunk_size
        chunk_words = words[start_index:end_index]
        chunk_string = " ".join(chunk_words)
        chunks.append(chunk_string)

        # Step 3: move the window forward for the next chunk.
        # We subtract `overlap` so the next chunk starts a little
        # BEFORE the previous one ended — this creates the overlap.
        start_index += chunk_size - overlap

    return chunks