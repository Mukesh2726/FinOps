import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_user
from app.models.models import Workspace, Transaction, TrainingExample
from app.schemas.schemas import TransactionUpdate, TransactionOut, TransactionListOut
from app.services.audit_service import log_action

router = APIRouter(prefix="/transactions")


def _get_workspace(user_id: str, db: Session) -> Workspace:
    ws = db.query(Workspace).filter(Workspace.user_id == user_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws


@router.get("", response_model=TransactionListOut)
async def list_transactions(
    status: str = Query(None),
    search: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    q = db.query(Transaction).filter(Transaction.workspace_id == ws.id)
    if status:
        q = q.filter(Transaction.status == status)
    if search:
        q = q.filter(Transaction.vendor.ilike(f"%{search}%"))
    total = q.count()
    txns = q.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    return TransactionListOut(transactions=[TransactionOut.model_validate(t) for t in txns], total=total)


@router.get("/{transaction_id}", response_model=TransactionOut)
async def get_transaction(
    transaction_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    txn = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.workspace_id == ws.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return TransactionOut.model_validate(txn)


@router.patch("/{transaction_id}", response_model=TransactionOut)
async def update_transaction(
    transaction_id: uuid.UUID,
    data: TransactionUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    txn = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.workspace_id == ws.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    old_category = txn.category
    if data.category is not None:
        txn.category = data.category
    if data.status is not None:
        txn.status = data.status
    if data.is_duplicate is not None:
        txn.is_duplicate = data.is_duplicate

    # Store training example if category was corrected
    if data.category and data.category != old_category:
        example = TrainingExample(
            workspace_id=ws.id,
            transaction_id=txn.id,
            vendor=txn.vendor,
            amount=txn.amount,
            ai_category=old_category,
            corrected_category=data.category,
        )
        db.add(example)
        log_action(db, current_user["id"], "category_changed", workspace_id=ws.id,
                   resource="transaction", resource_id=str(txn.id),
                   old_value={"category": old_category}, new_value={"category": data.category})

    if data.status:
        log_action(db, current_user["id"], f"transaction_{data.status.value}", workspace_id=ws.id,
                   resource="transaction", resource_id=str(txn.id))

    db.commit()
    db.refresh(txn)
    return TransactionOut.model_validate(txn)


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    txn = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.workspace_id == ws.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(txn)
    db.commit()
    log_action(db, current_user["id"], "transaction_deleted", workspace_id=ws.id, resource="transaction", resource_id=str(transaction_id))
    return {"success": True, "message": "Transaction deleted"}
