from sqlalchemy.orm import Session
from app.models.models import AuditLog
from typing import Optional
import json


def log_action(
    db: Session,
    user_id: str,
    action: str,
    workspace_id=None,
    resource: Optional[str] = None,
    resource_id: Optional[str] = None,
    old_value=None,
    new_value=None,
):
    entry = AuditLog(
        user_id=user_id,
        workspace_id=workspace_id,
        action=action,
        resource=resource,
        resource_id=str(resource_id) if resource_id else None,
        old_value=json.dumps(old_value) if old_value is not None else None,
        new_value=json.dumps(new_value) if new_value is not None else None,
    )
    db.add(entry)
    db.commit()
