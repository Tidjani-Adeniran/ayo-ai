# ai_core/tools.py
from .models import JournalEntry

def create_journal_entry(user, title: str, content: str) -> dict:
    """
    Creates and saves a new private journal entry for the user.
    
    Args:
        user: The authenticated Django User object.
        title: Short descriptive title for the journal entry.
        content: The detailed body/reflection text of the entry.
    """
    try:
        entry = JournalEntry.objects.create(
            user=user,
            title=title,
            content=content
        )
        # Note: Saving triggers the model's custom save() which automatically generates vector embeddings!
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