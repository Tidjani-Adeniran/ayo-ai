# ai_core/tools.py
from .models import JournalEntry

def create_journal_entry(title: str, content: str, user=None) -> dict:
    """
    Creates and saves a new private journal entry for the user.
    
    Args:
        title: Short descriptive title for the journal entry.
        content: The detailed body/reflection text of the entry.
    """
    if not user or not user.is_authenticated:
        return {
            "success": False,
            "message": "User authentication required to save journal entries."
        }

    try:
        entry = JournalEntry.objects.create(
            user=user,
            title=title,
            content=content
        )
        # Note: Saving triggers the model's custom save() which automatically generates vector embeddings via pgvector!
        return {
            "success": True,
            "message": f"Journal entry '{entry.title}' saved successfully.",
            "entry_id": entry.id
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to save journal entry: {str(e)}"
        }