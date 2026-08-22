import uuid
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_user
from app.models.models import Workspace, Document
from app.services.storage_service import store_file, download_file

router = APIRouter(prefix="/storage")


@router.put("/upload/{document_id}")
async def upload_raw(
    document_id: uuid.UUID,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = db.query(Workspace).filter(Workspace.user_id == current_user["id"]).first()
    document = db.query(Document).filter(Document.id == document_id, Document.workspace_id == workspace.id).first() if workspace else None
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    content = await request.body()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    store_file(document.storage_path, content, request.headers.get("content-type", "application/octet-stream"))
    return {"success": True, "storage_path": document.storage_path}


@router.get("/download/{document_id}")
async def download_document(
    document_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = db.query(Workspace).filter(Workspace.user_id == current_user["id"]).first()
    document = db.query(Document).filter(Document.id == document_id, Document.workspace_id == workspace.id).first() if workspace else None
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return Response(content=download_file(document.storage_path), media_type="application/octet-stream", headers={
        "Content-Disposition": f'attachment; filename="{document.filename}"',
    })
