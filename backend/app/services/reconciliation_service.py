import hashlib
import re
from datetime import datetime
from typing import Dict, Iterable, Tuple

from sqlalchemy.orm import Session

from app.models.models import Document, Transaction, TransactionType


def normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def transaction_fingerprint(workspace_id, item: Dict) -> str:
    transaction_date = item.get("transaction_date") or item.get("date") or ""
    transaction_type = item.get("type", "expense")
    amount = item.get("amount", 0)
    debit = item.get("debit") or (amount if transaction_type == "expense" else 0)
    credit = item.get("credit") or (amount if transaction_type == "income" else 0)
    reference = item.get("transaction_reference") or item.get("utr") or ""
    parts = [
        str(workspace_id),
        normalize_text(item.get("account_number_masked")),
        str(transaction_date),
        f"{float(amount):.2f}",
        f"{float(debit or 0):.2f}",
        f"{float(credit or 0):.2f}",
        normalize_text(item.get("vendor")),
        normalize_text(item.get("description")),
        normalize_text(reference),
    ]
    return hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()


def reconcile_transactions(db: Session, document: Document, items: Iterable[Dict]) -> Tuple[int, int]:
    """Insert only new transactions and link duplicates to every source document."""
    inserted = 0
    duplicates = 0
    for item in items:
        transaction_date = item.get("transaction_date") or item.get("date")
        if not transaction_date:
            continue
        amount = abs(float(item.get("amount") or item.get("debit") or item.get("credit") or 0))
        transaction_type = TransactionType(item.get("type", "expense"))
        debit = abs(float(item.get("debit") or (amount if transaction_type == TransactionType.expense else 0)))
        credit = abs(float(item.get("credit") or (amount if transaction_type == TransactionType.income else 0)))
        normalized = {**item, "transaction_date": transaction_date, "amount": amount, "debit": debit, "credit": credit}
        fingerprint = transaction_fingerprint(document.workspace_id, normalized)
        existing = db.query(Transaction).filter(
            Transaction.workspace_id == document.workspace_id,
            Transaction.fingerprint == fingerprint,
        ).first()
        if existing:
            if document not in existing.source_documents:
                existing.source_documents.append(document)
            existing.is_duplicate = True
            duplicates += 1
            continue

        transaction = Transaction(
            workspace_id=document.workspace_id,
            document_id=document.id,
            date=transaction_date,
            transaction_date=transaction_date,
            vendor=item.get("vendor", "Unknown"),
            description=item.get("description"),
            amount=amount,
            debit=debit,
            credit=credit,
            balance=item.get("balance"),
            type=transaction_type,
            category=item.get("category"),
            confidence=int(item.get("confidence", 0)),
            prediction_source=item.get("prediction_source"),
            status="pending",
            is_duplicate=False,
            anomaly_flag=item.get("anomaly_flag", False),
            anomaly_reason=item.get("anomaly_reason"),
            fingerprint=fingerprint,
            transaction_reference=item.get("transaction_reference") or item.get("utr"),
        )
        transaction.source_documents.append(document)
        db.add(transaction)
        inserted += 1
    return inserted, duplicates


def derive_statement_dates(items: Iterable[Dict]) -> tuple[str | None, str | None]:
    dates = []
    for item in items:
        value = item.get("transaction_date") or item.get("date")
        try:
            dates.append(datetime.strptime(value, "%Y-%m-%d").date())
        except (TypeError, ValueError):
            continue
    if not dates:
        return None, None
    return min(dates).isoformat(), max(dates).isoformat()
