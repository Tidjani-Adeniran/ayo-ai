# evaluate_rag.py
import os
import django
from dotenv import load_dotenv

load_dotenv()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from ai_core.utils import search_similar_chunks, generate_rag_response

def run_evaluation():
    test_queries = [
        "What are some natural relaxation tips?",
        "How do I manage daily work-life stress?"
    ]

    print("📊 Running RAG Evaluation Suite...\n")
    for idx, query in enumerate(test_queries, 1):
        print(f"Test Case {idx}: '{query}'")
        
        # 1. Test Retrieval
        chunks = search_similar_chunks(query, top_k=2)
        print(f"  - Retrieved Chunks: {len(chunks)}")
        for c in chunks:
            print(f"    * [{c['document_title']}] (Match: {c['similarity_score']*100:.1f}%)")
        
        # 2. Test Generation
        response = generate_rag_response(query, top_k=2)
        print(f"  - Generated Response Preview: {response[:120]}...\n")

if __name__ == "__main__":
    run_evaluation()