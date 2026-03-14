"""
NLLB Translation service.
Uses facebook/nllb-200-distilled-600M to translate non-English text to English
before sending it to the LLM for analysis.
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

# Lazy singletons
_translator = None
_tokenizer = None
_model_load_error: str | None = None


def _load_model():
    """Load the NLLB pipeline once."""
    global _translator, _tokenizer, _model_load_error

    if _translator is not None:
        return

    if _model_load_error is not None:
        raise RuntimeError(_model_load_error)

    try:
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        from core.config import NLLB_MODEL_NAME

        logger.info("Loading NLLB model '%s' …", NLLB_MODEL_NAME)
        _tokenizer = AutoTokenizer.from_pretrained(NLLB_MODEL_NAME)
        _translator = AutoModelForSeq2SeqLM.from_pretrained(NLLB_MODEL_NAME)
        logger.info("NLLB model loaded successfully.")
    except Exception as exc:
        _model_load_error = str(exc)
        logger.error("Failed to load NLLB: %s", exc)
        raise


def is_nllb_available() -> bool:
    """Check whether transformers is installed."""
    try:
        from transformers import AutoTokenizer  # noqa
        return True
    except ImportError:
        return False


def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translate *text* from *source_lang* (frontend short code, e.g. 'ar')
    into English.  If source_lang is already 'en', return text unchanged.
    """
    from core.config import NLLB_LANG_MAP

    if source_lang == "en":
        return text

    src_code = NLLB_LANG_MAP.get(source_lang)
    if src_code is None:
        logger.warning("Unknown language code '%s', skipping translation.", source_lang)
        return text

    _load_model()

    target_code = NLLB_LANG_MAP["en"]  # eng_Latn

    try:
        _tokenizer.src_lang = src_code  # type: ignore[union-attr]
        inputs = _tokenizer(text, return_tensors="pt", truncation=True, max_length=512)  # type: ignore[misc]

        # Get the target language id for forced_bos_token_id
        target_lang_id = _tokenizer.convert_tokens_to_ids(target_code)  # type: ignore[union-attr]

        translated_tokens = _translator.generate(  # type: ignore[union-attr]
            **inputs,
            forced_bos_token_id=target_lang_id,
            max_new_tokens=512,
        )
        result: str = _tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]  # type: ignore[union-attr]
        logger.info("Translated %s → en  (%d chars → %d chars)", source_lang, len(text), len(result))
        return result
    except Exception as exc:
        logger.error("Translation failed: %s", exc)
        return text  # graceful fallback — use original text
