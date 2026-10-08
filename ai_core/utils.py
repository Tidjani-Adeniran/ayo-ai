import os
from pypdf import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from all pages of a PDF file."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found at path: {file_path}")

    reader = PdfReader(file_path)
    extracted_text = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text + "\n"
    
    return extracted_text.strip()


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """
    Splits text into overlapping chunks.
    - chunk_size: Number of characters per chunk.
    - overlap: Number of characters shared between consecutive chunks to maintain context.
    """
    if not text:
        return []

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        
        # Move forward by (chunk_size - overlap)
        start += (chunk_size - overlap)

    return [c for c in chunks if c]  # Return non-empty chunks