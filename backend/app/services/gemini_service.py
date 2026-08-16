import json
import re
from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

genai.configure(api_key=settings.gemini_api_key)
_model = genai.GenerativeModel("gemini-1.5-flash")

CATEGORIES = [
    "Revenue", "Office Expense", "Marketing Expense", "Software & Subscriptions",
    "Travel & Transport", "Meals & Entertainment", "Payroll", "Rent & Utilities",
    "Cost of Goods Sold", "Professional Services", "Bank Charges", "Miscellaneous",
]

EXTRACTION_PROMPT = """
Extract all financial transactions from the following document text.
Return a JSON array. Each item must have:
  - date: string (YYYY-MM-DD)
  - vendor: string
  - amount: number (positive)
  - type: "income" or "expense"
  - category: one of {categories}
  - confidence: integer 0-100

Return ONLY valid JSON array, no markdown, no explanation.

Document text:
{text}
""".strip()

CATEGORIZE_PROMPT = """
Categorize this transaction into exactly one category from the list below.
Return JSON: {{"category": "...", "confidence": 0-100}}

Categories: {categories}
Vendor: {vendor}
Amount: {amount}
Type: {type}

Return ONLY valid JSON, no markdown.
""".strip()


def _parse_json(text: str) -> Any:
    text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    return json.loads(text)


async def extract_transactions(document_text: str) -> List[Dict]:
    prompt = EXTRACTION_PROMPT.format(
        categories=", ".join(CATEGORIES),
        text=document_text[:12000],
    )
    try:
        response = _model.generate_content(prompt)
        return _parse_json(response.text)
    except Exception as e:
        logger.error("gemini_extraction_failed", error=str(e))
        return []


async def categorize_transaction(vendor: str, amount: float, txn_type: str) -> Dict:
    prompt = CATEGORIZE_PROMPT.format(
        categories=", ".join(CATEGORIES),
        vendor=vendor,
        amount=amount,
        type=txn_type,
    )
    try:
        response = _model.generate_content(prompt)
        result = _parse_json(response.text)
        return {"category": result.get("category", "Miscellaneous"), "confidence": result.get("confidence", 50), "prediction_source": "gemini"}
    except Exception as e:
        logger.error("gemini_categorize_failed", error=str(e))
        return {"category": "Miscellaneous", "confidence": 0, "prediction_source": "fallback"}
