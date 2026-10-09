import os
import math
from pypdf import PdfReader
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def get_genai_client():
    """Initializes and returns the GenAI client using the GEMINI_API_KEY environment variable."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is missing in .env file.")
    return genai.Client(api_key=api_key)


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
    - chunk_size: Character length of each chunk.
    - overlap: Character overlap between consecutive chunks to maintain context boundaries.
    """
    if not text:
        return []

    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap to prevent infinite looping.")

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        
        start += (chunk_size - overlap)

    return chunks


def generate_embedding(text: str) -> list[float]:
    """Generates a vector embedding for a given text string using gemini-embedding-001."""
    if not text or not text.strip():
        return []

    client = get_genai_client()

    try:
        response = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
        )
        if hasattr(response, 'embeddings') and response.embeddings:
            return response.embeddings[0].values
        return []
    except Exception as e:
        print(f"Embedding API Error: {e}")
        raise e


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """
    Calculates cosine similarity between two equal-length numerical vectors.
    Formula: (A · B) / (||A|| * ||B||)
    Returns score between -1.0 (opposite) and 1.0 (identical meaning).
    """
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude_vec1 = math.sqrt(sum(a * a for a in vec1))
    magnitude_vec2 = math.sqrt(sum(b * b for b in vec2))

    if magnitude_vec1 == 0 or magnitude_vec2 == 0:
        return 0.0

    return dot_product / (magnitude_vec1 * magnitude_vec2)


def search_similar_chunks(query: str, top_k: int = 3) -> list[dict]:
    """
    1. Converts user prompt into a query vector.
    2. Compares query vector against all saved DocumentChunks using cosine similarity.
    3. Returns the top_k highest scoring chunks.
    """
    from .models import DocumentChunk

    query_vector = generate_embedding(query)
    if not query_vector:
        return []

    chunks = DocumentChunk.objects.exclude(embedding__isnull=True)

    scored_chunks = []
    for chunk in chunks:
        score = cosine_similarity(query_vector, chunk.embedding)
        scored_chunks.append({
            'chunk_id': chunk.id,
            'document_title': chunk.document.title if chunk.document else "Uploaded Document",
            'chunk_index': chunk.chunk_index,
            'content': chunk.content,
            'similarity_score': score
        })

    # Sort in descending order (highest similarity first)
    scored_chunks.sort(key=lambda x: x['similarity_score'], reverse=True)

    return scored_chunks[:top_k]


def generate_rag_response(user_query: str, top_k: int = 3) -> str:
    """
    Phase 9 RAG Pipeline:
    1. Retrieves top_k relevant document chunks via vector search.
    2. Constructs a context-grounded system prompt.
    3. Generates a grounded response via Gemini LLM.
    """
    client = get_genai_client()
    
    # 1. Retrieve relevant chunks
    matched_chunks = search_similar_chunks(user_query, top_k=top_k)
    
    if not matched_chunks:
        context_block = "No reference document chunks found."
    else:
        context_block = "\n\n---\n\n".join(
            [f"[Document Chunk {i+1}]: {item['content']}" for i, item in enumerate(matched_chunks)]
        )

    # 2. Build the RAG Grounded System Prompt
    rag_prompt = f"""You are ayo-ai, an empathetic and culturally grounded wellbeing companion.
Answer the user's question using ONLY the provided context passages below.
If the context does not contain enough information to answer fully, answer using what is available and gently note any limitation.

CONTEXT PASSAGES:
{context_block}

USER QUESTION:
{user_query}

ANSWER:"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=rag_prompt,
        )
        return response.text
    except Exception as e:
        print(f"RAG Generation Error: {e}")
        return "I encountered an error while referencing my knowledge base. Please try again."