"""Load the pinned open-source multilingual text model for our own inference."""

from libraries_search.config import MODEL_REPO, MODEL_REVISION


def load_model(repo: str = MODEL_REPO, revision: str = MODEL_REVISION):
    """Import heavy inference dependencies only in cloud build or demo runs."""
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(repo, revision=revision, device="cpu", trust_remote_code=False)
