from __future__ import annotations

from pathlib import Path

import fitz
from docx import Document
from fastapi import UploadFile


async def parse_resume_file(file: UploadFile) -> dict:
    filename = file.filename or "resume"
    suffix = Path(filename).suffix.lower()
    content = await file.read()

    if suffix == ".pdf":
        document = fitz.open(stream=content, filetype="pdf")
        text = "\n".join(page.get_text() for page in document)
    elif suffix == ".docx":
        temp_path = Path("/tmp") / filename
        temp_path.write_bytes(content)
        document = Document(str(temp_path))
        text = "\n".join(paragraph.text for paragraph in document.paragraphs)
    else:
        text = content.decode("utf-8", errors="ignore")

    return {
        "filename": filename,
        "size_bytes": len(content),
        "extracted_text": text[:12000],
        "detected_format": suffix.lstrip(".") or "text",
    }
