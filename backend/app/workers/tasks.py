import asyncio
import httpx
from app.workers.celery_app import celery_app
from app.database.session import SessionLocal
from app.models.models import Document, DocumentStatus
from app.services.document_service import extract_text_from_pdf, extract_text_from_image, is_pdf_encrypted
from app.services.gemini_service import extract_transactions
from app.ml.categorizer import rule_based_category, detect_anomalies, detect_duplicates
from app.core.encryption import decrypt
from app.core.logging import get_logger
from app.services.reconciliation_service import reconcile_transactions, derive_statement_dates
from datetime import datetime
import uuid

logger = get_logger(__name__)


@celery_app.task(bind=True, max_retries=3)
def process_document(self, document_id: str, storage_path: str, doc_type: str, encrypted_password: str = None):
    db = SessionLocal()
    doc = None
    try:
        doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
        if not doc:
            return

        doc.status = DocumentStatus.processing
        db.commit()

        # Download file from Supabase Storage
        from app.services.storage_service import download_file
        file_bytes = download_file(storage_path)

        # Decrypt password if provided
        password = None
        if encrypted_password:
            try:
                password = decrypt(encrypted_password)
            except Exception:
                pass

        # Extract text
        if storage_path.lower().endswith((".jpg", ".jpeg", ".png")):
            text = extract_text_from_image(file_bytes)
        else:
            try:
                text = extract_text_from_pdf(file_bytes, password)
            except ValueError as e:
                if "incorrect_password" in str(e):
                    doc.status = DocumentStatus.needs_review
                    doc.error_message = "incorrect_password"
                    db.commit()
                    return
                raise

        # Extract transactions via Gemini
        raw_txns = asyncio.run(extract_transactions(text))

        # Apply rule-based categorization + anomaly/duplicate detection
        enriched = []
        for t in raw_txns:
            cat_result = rule_based_category(t.get("vendor", ""), t.get("type", "expense"))
            if not cat_result:
                cat_result = {"category": t.get("category", "Miscellaneous"), "confidence": t.get("confidence", 50), "prediction_source": "gemini"}
            enriched.append({**t, **cat_result, "anomaly_flag": False, "is_duplicate": False})

        enriched = detect_anomalies(enriched)
        enriched = detect_duplicates(enriched)

        # Save transactions
        start_date, end_date = derive_statement_dates(enriched)
        inserted, duplicates = reconcile_transactions(db, doc, enriched)
        doc.statement_start_date = start_date
        doc.statement_end_date = end_date
        doc.bank_name = next((item.get("bank_name") for item in enriched if item.get("bank_name")), None)
        doc.account_number_masked = next((item.get("account_number_masked") for item in enriched if item.get("account_number_masked")), None)
        balances = [item.get("balance") for item in enriched if item.get("balance") is not None]
        if balances:
            doc.closing_balance = float(balances[-1])
            first = enriched[0]
            first_balance = float(balances[0])
            first_credit = float(first.get("credit") or 0)
            first_debit = float(first.get("debit") or 0)
            doc.opening_balance = first_balance - first_credit + first_debit
        doc.transaction_count = inserted
        doc.processed_at = datetime.utcnow()

        doc.status = DocumentStatus.completed
        db.commit()
        logger.info("document_processed", document_id=document_id, txn_count=inserted, duplicates=duplicates)

    except Exception as e:
        logger.error("document_processing_error", document_id=document_id, error=str(e))
        if doc:
            doc.status = DocumentStatus.failed
            doc.error_message = str(e)
            db.commit()
        raise self.retry(exc=e, countdown=30)
    finally:
        # Clear password from memory
        password = None
        db.close()
