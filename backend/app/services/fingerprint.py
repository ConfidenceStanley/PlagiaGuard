# backend/app/services/fingerprint.py

import hashlib
from typing import List, Set


def generate_shingles(text: str, k: int = 5) -> Set[str]:
    """
    Generate k-shingles (k-grams of words) from text.

    A shingle is k consecutive words joined together.

    Example with k=3:
        "the quick brown fox jumps"
        → {"the quick brown", "quick brown fox", "brown fox jumps"}

    Args:
        text: Input text (preprocessed, lowercase)
        k:    Shingle size in words (default 5)

    Returns:
        Set of shingle strings
    """
    words = text.lower().split()

    # Document too short for shingles → return individual words
    if len(words) < k:
        return set(words)

    shingles = set()
    for i in range(len(words) - k + 1):
        shingle = " ".join(words[i : i + k])
        shingles.add(shingle)

    return shingles


def hash_shingle(shingle: str) -> str:
    """Convert a shingle string into an MD5 hash string."""
    return hashlib.md5(shingle.encode("utf-8")).hexdigest()


def generate_fingerprint(text: str, k: int = 5) -> List[str]:
    """
    Generate a document fingerprint as a list of hash strings.

    How it works:
        1. Split text into overlapping k-word shingles
        2. Hash each shingle using MD5
        3. Return all hashes as the fingerprint

    This fingerprint is used to:
        - Quickly compare two documents for similarity
        - Detect copied content in the database
        - Enable fast lookups without full text comparison

    Args:
        text: Preprocessed document text
        k:    Shingle size (default 5)

    Returns:
        List of MD5 hash strings

    Example:
        generate_fingerprint("the quick brown fox")
        → ["a1b2c3...", "d4e5f6...", ...]
    """
    if not text or not text.strip():
        return []

    shingles = generate_shingles(text, k)
    fingerprint = [hash_shingle(s) for s in shingles]

    return fingerprint


def fingerprint_similarity(fp1: List[str], fp2: List[str]) -> float:
    """
    Calculate similarity between two document fingerprints.

    Uses Jaccard similarity:
        similarity = |intersection| / |union|

    Args:
        fp1: Fingerprint of document 1
        fp2: Fingerprint of document 2

    Returns:
        Float between 0.0 (completely different)
                   and 1.0 (identical)
    """
    if not fp1 or not fp2:
        return 0.0

    set1 = set(fp1)
    set2 = set(fp2)

    intersection = len(set1 & set2)
    union = len(set1 | set2)

    if union == 0:
        return 0.0

    return round(intersection / union, 4)