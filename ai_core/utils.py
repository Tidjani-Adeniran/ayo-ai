import os
import math
import pdfplumber
from pypdf import PdfReader
from google import genai
from google.genai import types
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
    """
    Extracts raw text from all pages of a PDF file.
    Uses pdfplumber as the primary parser for complex font encodings, falling back to pypdf.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found at path: {file_path}")

    extracted_text = ""

    # Primary strategy: pdfplumber (best for custom font encodings and multi-column streams)
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as pdfplumber_err:
        print(f"⚠️ pdfplumber extraction notice for {file_path}: {pdfplumber_err}")

    # Fallback strategy: pypdf
    if not extracted_text.strip():
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as pypdf_err:
            print(f"⚠️ pypdf extraction notice for {file_path}: {pypdf_err}")

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
    """Generates a 768-dimensional vector embedding using gemini-embedding-001."""
    if not text or not text.strip():
        return []

    client = get_genai_client()

    try:
        response = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        if hasattr(response, 'embeddings') and response.embeddings:
            return response.embeddings[0].values
        return []
    except Exception as e:
        print(f"Embedding API Error: {e}")
        return []


def generate_conversational_query(user_query: str, history_context: str) -> str:
    """
    Phase 11: Rewrites a follow-up user query into a standalone search query 
    using conversation history so pgvector can retrieve relevant chunks.
    """
    if not history_context or not history_context.strip():
        return user_query

    client = get_genai_client()
    prompt = f"""Given the conversation history below, rewrite the latest user input into a clear, standalone search query that resolves any pronouns or missing context (e.g., 'it', 'that tea', 'that exercise'). Return ONLY the rewritten standalone query, with no extra pleasantries or quotation marks.

Conversation History:
{history_context}

Latest User Input: {user_query}

Standalone Search Query:"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        rewritten = response.text.strip() if response.text else user_query
        print(f"🔄 Original Query: '{user_query}' --> Rewritten Query: '{rewritten}'")
        return rewritten
    except Exception as e:
        print(f"Query Rewriting Error: {e}")
        return user_query


def search_similar_chunks(query: str, top_k: int = 3) -> list[dict]:
    """
    1. Converts user prompt into a 768-dimensional query vector.
    2. Queries Neon PostgreSQL using pgvector's native HNSW index (CosineDistance).
    3. Returns top_k highest scoring chunks with similarity match percentages.
    """
    from pgvector.django import CosineDistance
    from .models import DocumentChunk

    query_vector = generate_embedding(query)
    if not query_vector:
        return []

    chunks = (
        DocumentChunk.objects
        .exclude(embedding__isnull=True)
        .annotate(distance=CosineDistance('embedding', query_vector))
        .order_by('distance')[:top_k]
    )

    results = []
    for chunk in chunks:
        similarity = 1.0 - float(chunk.distance)
        results.append({
            'chunk_id': chunk.id,
            'document_title': chunk.document.title if chunk.document else "Uploaded Document",
            'chunk_index': chunk.chunk_index,
            'content': chunk.content,
            'similarity_score': round(similarity, 4)
        })

    return results


def generate_rag_response(user_query: str, top_k: int = 3) -> str:
    """
    Phase 9 RAG Pipeline:
    1. Retrieves top_k relevant document chunks via native pgvector HNSW index.
    2. Constructs a context-grounded system prompt.
    3. Generates a grounded response via Gemini LLM.
    """
    client = get_genai_client()
    
    matched_chunks = search_similar_chunks(user_query, top_k=top_k)
    
    if not matched_chunks:
        context_block = "No reference document chunks found."
    else:
        context_block = "\n\n---\n\n".join(
            [f"[Document Chunk {i+1}]: {item['content']}" for i, item in enumerate(matched_chunks)]
        )

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
    
    
def search_similar_journals(user, query: str, top_k: int = 2) -> list[dict]:
    """
    Performs Personal RAG:
    1. Converts user prompt into a 768-dimensional query vector.
    2. Queries Neon PostgreSQL for the authenticated user's journal entries using pgvector (CosineDistance).
    3. Enforces strict user data isolation so users only search their own private entries.
    """
    from pgvector.django import CosineDistance
    from .models import JournalEntry

    query_vector = generate_embedding(query)
    if not query_vector:
        return []

    # CRITICAL SECURITY FILTER: .filter(user=user) ensures data isolation
    entries = (
        JournalEntry.objects
        .filter(user=user)
        .exclude(embedding__isnull=True)
        .annotate(distance=CosineDistance('embedding', query_vector))
        .order_by('distance')[:top_k]
    )

    results = []
    for entry in entries:
        similarity = 1.0 - float(entry.distance)
        results.append({
            'entry_id': entry.id,
            'title': entry.title or "Untitled Reflection",
            'content': entry.content,
            'similarity_score': round(similarity, 4),
            'created_at': entry.created_at.strftime("%Y-%m-%d")
        })

    return results