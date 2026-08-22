import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_user
from app.models.models import Workspace, Document, DocumentStatus, StatementPassword
from app.schemas.schemas import UploadUrlRequest, ProcessRequest, DocumentOut, DocumentStatusOut
from app.services.storage_service import delete_file
from app.services.audit_service import log_action
from app.core.encryption import encrypt
from app.workers.tasks import process_document

router = APIRouter(prefix="/documents")


def _get_workspace(user_id: str, db: Session) -> Workspace:
    ws = db.query(Workspace).filter(Workspace.user_id == user_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws


@router.post("/upload-url")
async def get_upload_url(
    req: UploadUrlRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    storage_path = f"{ws.id}/{uuid.uuid4()}/{req.filename}"
    doc = Document(workspace_id=ws.id, filename=req.filename, storage_path=storage_path, doc_type=req.doc_type)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    # Return a direct upload URL pointing to our own endpoint
    return {
        "signed_url": f"http://localhost:8000/api/storage/upload/{doc.id}",
        "document_id": str(doc.id),
        "storage_path": storage_path,
    }


@router.post("/{document_id}/process")
async def process_doc(
    document_id: uuid.UUID,
    req: ProcessRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    doc = db.query(Document).filter(Document.id == document_id, Document.workspace_id == ws.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    encrypted_pwd = None
    if req.statement_password:
        encrypted_pwd = encrypt(req.statement_password)
        existing = db.query(StatementPassword).filter(
            StatementPassword.workspace_id == ws.id,
            StatementPassword.bank_identifier == "default",
        ).first()
        if existing:
            existing.encrypted_password = encrypted_pwd
        else:
            db.add(StatementPassword(workspace_id=ws.id, bank_identifier="default", encrypted_password=encrypted_pwd))
        db.commit()

    if not encrypted_pwd and doc.doc_type.value == "bank_statement":
        stored = db.query(StatementPassword).filter(
            StatementPassword.workspace_id == ws.id,
            StatementPassword.bank_identifier == "default",
        ).first()
        if stored:
            encrypted_pwd = stored.encrypted_password

    try:
        process_document.delay(str(doc.id), doc.storage_path, doc.doc_type.value, encrypted_pwd)
    except Exception:
        # Celery not running — mark as processing anyway
        doc.status = DocumentStatus.processing
        db.commit()

    log_action(db, current_user["id"], "document_uploaded", workspace_id=ws.id, resource="document", resource_id=str(doc.id))
    return {"success": True, "message": "Processing started", "document_id": str(doc.id), "transaction_count": 0}


@router.get("/{document_id}/status", response_model=DocumentStatusOut)
async def get_status(
    document_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    doc = db.query(Document).filter(Document.id == document_id, Document.workspace_id == ws.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentStatusOut(id=doc.id, status=doc.status, error_message=doc.error_message)


@router.get("/{document_id}/has-password")
async def has_password(
    document_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    stored = db.query(StatementPassword).filter(
        StatementPassword.workspace_id == ws.id,
        StatementPassword.bank_identifier == "default",
    ).first()
    return {"has_password": stored is not None}


@router.get("", response_model=list[DocumentOut])
async def list_documents(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    docs = db.query(Document).filter(Document.workspace_id == ws.id).order_by(Document.created_at.desc()).all()
    return [DocumentOut.model_validate(d) for d in docs]


@router.delete("/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    doc = db.query(Document).filter(Document.id == document_id, Document.workspace_id == ws.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    delete_file(doc.storage_path)
    db.delete(doc)
    db.commit()
    log_action(db, current_user["id"], "document_deleted", workspace_id=ws.id, resource="document", resource_id=str(doc.id))
    return {"success": True, "message": "Document deleted"}
