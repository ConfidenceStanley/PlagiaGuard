# backend/app/services/preprocessor.py

import re
import string
from typing import List


def clean_text(raw_text: str) -> str:
    """
    Step 1: Basic cleaning of raw extracted text.

    Operations:
        - Collapse 3+ newlines into 2
        - Replace tabs with spaces
        - Remove non-printable/special characters
        - Collapse multiple spaces into one
        - Strip each line

    Args:
        raw_text: Raw text straight from extractor

    Returns:
        Cleaned but still human-readable text
    """
    if not raw_text:
        return ""

    # Collapse excessive newlines
    text = re.sub(r"\n{3,}", "\n\n", raw_text)

    # Replace tabs with a single space
    text = re.sub(r"\t", " ", text)

    # Keep only: letters, digits, spaces, and basic punctuation
    text = re.sub(r"[^\w\s\.\,\!\?\;\:\'\"\-\(\)]", " ", text)

    # Collapse multiple spaces into one
    text = re.sub(r" {2,}", " ", text)

    # Strip whitespace from each line
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(lines)

    return text.strip()


def count_words(text: str) -> int:
    """Count words in a text string."""
    if not text:
        return 0
    return len(text.split())


def extract_sentences(text: str) -> List[str]:
    """
    Split text into individual sentences.

    Strategy:
        Split on sentence-ending punctuation followed
        by whitespace and an uppercase letter.

    Filters out:
        Sentences shorter than 5 words (likely noise)

    Args:
        text: Cleaned text

    Returns:
        List of sentence strings
    """
    if not text:
        return []

    # Split at sentence boundaries
    pattern = re.compile(r"(?<=[.!?])\s+(?=[A-Z])")
    raw_sentences = pattern.split(text)

    # Filter very short fragments
    sentences = [
        s.strip()
        for s in raw_sentences
        if len(s.strip().split()) >= 5
    ]

    return sentences


def preprocess_for_detection(text: str) -> str:
    """
    Step 2: Normalize text for similarity detection.

    Operations:
        - Lowercase everything
        - Remove all punctuation
        - Collapse whitespace

    Note:
        We intentionally KEEP stop words (the, is, and...)
        because removing them causes false positives in
        similarity detection algorithms.

    Args:
        text: Cleaned human-readable text

    Returns:
        Normalized text ready for TF-IDF / BERT / Jaccard
    """
    if not text:
        return ""

    # Lowercase
    text = text.lower()

    # Remove all punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))

    # Collapse all whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def get_text_statistics(raw_text: str, clean_text_content: str) -> dict:
    """
    Calculate document statistics.

    Args:
        raw_text:          Original extracted text
        clean_text_content: Cleaned version of the text

    Returns:
        {
            "word_count":              3420,
            "sentence_count":          145,
            "char_count":              18500,
            "avg_words_per_sentence":  23.6,
            "paragraph_count":         42
        }
    """
    sentences = extract_sentences(raw_text)
    word_count = count_words(clean_text_content)
    sentence_count = len(sentences)
    char_count = len(raw_text)

    paragraphs = [
        p.strip()
        for p in raw_text.split("\n\n")
        if p.strip()
    ]
    paragraph_count = len(paragraphs)

    avg_words = (
        round(word_count / sentence_count, 1)
        if sentence_count > 0
        else 0
    )

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "char_count": char_count,
        "avg_words_per_sentence": avg_words,
        "paragraph_count": paragraph_count,
    }


def process_document(raw_text: str) -> dict:
    """
    Full preprocessing pipeline for an uploaded document.

    Pipeline:
        raw text
            → clean_text()         human-readable cleaned version
            → extract_sentences()  list of individual sentences
            → preprocess_for_detection()  normalized for algorithms
            → get_text_statistics()  word count, sentence count, etc.

    Args:
        raw_text: Raw text from text_extractor.py

    Returns:
        {
            "clean_text":      "Cleaned readable text...",
            "detection_text":  "normalized lowercase text...",
            "sentences":       ["sentence one", "sentence two", ...],
            "stats": {
                "word_count": 3420,
                "sentence_count": 145,
                "char_count": 18500,
                "avg_words_per_sentence": 23.6,
                "paragraph_count": 42
            }
        }
    """
    # Step 1: Clean
    cleaned = clean_text(raw_text)

    # Step 2: Extract sentences BEFORE lowercasing
    #         (sentence splitter relies on uppercase letters)
    sentences = extract_sentences(cleaned)

    # Step 3: Normalize for detection algorithms
    detection_ready = preprocess_for_detection(cleaned)

    # Step 4: Calculate statistics
    stats = get_text_statistics(raw_text, cleaned)

    return {
        "clean_text": cleaned,
        "detection_text": detection_ready,
        "sentences": sentences,
        "stats": stats,
    }