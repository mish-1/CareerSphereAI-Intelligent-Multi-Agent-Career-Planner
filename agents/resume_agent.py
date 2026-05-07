"""Resume optimization agent."""

from __future__ import annotations

import io
from pathlib import Path

from backend.services.llm import generate_response
from docx import Document
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from utils.text import clamp_score, normalize_text, overlap_score, tokenize, unique_preserve_order


ACTION_VERBS = [
    "Developed",
    "Built",
    "Designed",
    "Improved",
    "Optimized",
    "Implemented",
    "Delivered",
    "Automated",
]


def _rewrite_bullet(bullet: str, job_terms: list[str]) -> str:
    bullet = normalize_text(bullet)
    if not bullet:
        return bullet
    if bullet[0].islower():
        bullet = bullet[0].upper() + bullet[1:]
    if not any(char.isdigit() for char in bullet) and job_terms:
        bullet += f" and aligned it to {job_terms[0]} goals"
    if not any(bullet.startswith(verb) for verb in ACTION_VERBS):
        bullet = f"Implemented {bullet[0].lower() + bullet[1:]}" if bullet else bullet
    return bullet.rstrip(".") + "."


def _extract_bullets(text: str) -> list[str]:
    bullets = []
    for line in normalize_text(text).split("\n"):
        candidate = line.strip("-• \t")
        if candidate:
            bullets.append(candidate)
    return bullets or [normalize_text(text)]


def _generate_docx(content: str, output_path: Path) -> str:
    document = Document()
    for paragraph in content.split("\n"):
        document.add_paragraph(paragraph)
    document.save(output_path)
    return str(output_path)


def _generate_pdf(content: str, output_path: Path) -> str:
    pdf = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    y = height - 40
    for line in content.split("\n"):
        pdf.drawString(40, y, line[:110])
        y -= 14
        if y < 40:
            pdf.showPage()
            y = height - 40
    pdf.save()
    return str(output_path)


async def optimize_resume(resume_text: str, job_description: str) -> dict:
    resume_text = normalize_text(resume_text)
    job_description = normalize_text(job_description)
    resume_terms = tokenize(resume_text)
    job_terms = tokenize(job_description)
    missing_keywords = unique_preserve_order([term for term in job_terms if term not in resume_terms])[:12]

    bullets = _extract_bullets(resume_text)
    rewritten_bullets = [_rewrite_bullet(bullet, missing_keywords) for bullet in bullets]
    optimized_resume = "\n".join(rewritten_bullets)

    ats_score = clamp_score(55 + overlap_score(resume_terms, job_terms) * 0.45)
    prompt = f"Rewrite this resume content to be stronger, more quantified, and ATS-optimized. Resume: {resume_text}. Job: {job_description}"
    try:
        llm_rewrite = await generate_response("deepseek/deepseek-chat-v3-0324", prompt)
    except Exception:
        llm_rewrite = optimized_resume

    export_dir = Path(".artifacts")
    export_dir.mkdir(parents=True, exist_ok=True)
    docx_path = _generate_docx(llm_rewrite, export_dir / "career_resume.docx")
    pdf_path = _generate_pdf(llm_rewrite, export_dir / "career_resume.pdf")

    return {
        "optimized_resume": llm_rewrite,
        "ats_score": ats_score,
        "keyword_gap_analysis": missing_keywords,
        "docx_path": docx_path,
        "pdf_path": pdf_path,
        "rewrite_notes": [
            "Bullets are rewritten to start with stronger action language.",
            "Keyword gaps are derived from the target job description.",
        ],
    }
