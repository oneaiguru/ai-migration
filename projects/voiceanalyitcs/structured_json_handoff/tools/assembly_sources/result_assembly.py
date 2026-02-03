
from typing import List, Dict


class ResultAssembly:
    def __init__(self):
        """Initialize the ResultAssembly module."""
        self.transcript = []

    def assemble_transcript(self, chunks: List[Dict[str, str]]) -> str:
        """Assemble a complete transcript from transcribed chunks."""
        if not chunks:
            raise ValueError("No chunks provided for assembly.")

        seen_indices = set()
        unique_chunks = [chunk for chunk in chunks if chunk.get("index") not in seen_indices and not seen_indices.add(chunk.get("index"))]

        sorted_chunks = sorted(unique_chunks, key=lambda chunk: chunk.get("index", -1))
        self.transcript = [chunk["text"] for chunk in sorted_chunks if "text" in chunk]

        return " ".join(self.transcript)
