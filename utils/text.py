from __future__ import annotations

import re
from collections import Counter


STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
    "you",
    "your",
}


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value.strip())


def tokenize(value: str | None) -> list[str]:
    if not value:
        return []
    return [token for token in re.findall(r"[a-zA-Z0-9+.#-]+", value.lower()) if token not in STOPWORDS]


def unique_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            ordered.append(item)
    return ordered


def top_keywords(texts: list[str], limit: int = 12) -> list[str]:
    counter: Counter[str] = Counter()
    for text in texts:
        counter.update(tokenize(text))
    return [keyword for keyword, _ in counter.most_common(limit)]


def overlap_score(source_terms: list[str], target_terms: list[str]) -> float:
    if not source_terms or not target_terms:
        return 0.0
    source = set(source_terms)
    target = set(target_terms)
    overlap = len(source & target)
    return round((overlap / max(len(target), 1)) * 100, 2)


def clamp_score(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, round(value, 2)))
