# Multilingual search model

The first search baseline uses [multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small), pinned in `src/libraries_search/config.py` at revision `614241f622f53c4eeff9890bdc4f31cfecc418b3`. Its model card lists an MIT license and 384-dimensional embeddings. We run the downloaded weights in our own GitHub Actions job and later in our own demo service; Hugging Face does not choose candidates. This is use of an already trained model, not training a new one.

Each book is encoded from `semantic_text` with the required `passage: ` prefix. The query uses `query: `. Vectors are normalized and compared by our code. E5 truncates text after 512 tokens, so long abstracts may lose detail; the source field order preserves titles and subjects first. Low-resource languages may perform worse. The separate keyword index covers exact words, author names, and titles.

The prepared catalog has no query-to-book relevance labels. This phase does not fine-tune E5 or claim that its cosine similarity is a probability. A graph autoencoder was discussed and excluded from the approved baseline.
