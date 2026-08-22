from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime
from app.models.models import DocumentStatus, DocumentType, TransactionStatus, TransactionType


# ── Workspace ──────────────────────────────────────────────
class WorkspaceSetup(BaseModel):
    name: str
    business_type: str
    plan: str = "growth"


class WorkspaceOut(BaseModel):
    id: UUID4
    name: str
    business_type: str
    plan: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Profile ────────────────────────────────────────────────
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None


# ── Document ───────────────────────────────────────────────
class UploadUrlRequest(BaseModel):
    filename: str
    content_type: str
    doc_type: DocumentType


class UploadUrlResponse(BaseModel):
    signed_url: str
    document_id: UUID4
    storage_path: str


class ProcessRequest(BaseModel):
    statement_password: Optional[str] = None


class DocumentOut(BaseModel):
    id: UUID4
    filename: str
    doc_type: DocumentType
    status: DocumentStatus
    created_at: datetime
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    bank_name: Optional[str] = None
    account_number_masked: Optional[str] = None
    statement_start_date: Optional[str] = None
    statement_end_date: Optional[str] = None
    opening_balance: Optional[float] = None
    closing_balance: Optional[float] = None
    transaction_count: int = 0

    class Config:
        from_attributes = True


class DocumentStatusOut(BaseModel):
    id: UUID4
    status: DocumentStatus
    error_message: Optional[str] = None


# ── Transaction ────────────────────────────────────────────
class TransactionUpdate(BaseModel):
    category: Optional[str] = None
    status: Optional[TransactionStatus] = None
    is_duplicate: Optional[bool] = None


class TransactionOut(BaseModel):
    id: UUID4
    date: str
    transaction_date: str
    vendor: str
    description: Optional[str] = None
    amount: float
    debit: Optional[float] = None
    credit: Optional[float] = None
    balance: Optional[float] = None
    type: TransactionType
    category: Optional[str]
    confidence: int
    prediction_source: Optional[str]
    status: TransactionStatus
    is_duplicate: bool
    anomaly_flag: bool
    anomaly_reason: Optional[str]
    document_id: Optional[UUID4] = None
    workspace_id: UUID4
    fingerprint: Optional[str] = None

    class Config:
        from_attributes = True


class TransactionListOut(BaseModel):
    transactions: List[TransactionOut]
    total: int


# ── Reports ────────────────────────────────────────────────
class ExpenseCategory(BaseModel):
    name: str
    value: float


class PLReport(BaseModel):
    revenue: float
    cogs: float
    gross_profit: float
    expense_categories: List[ExpenseCategory]
    operating_expenses: float
    net_profit: float


class BalanceSheetReport(BaseModel):
    cash_balance: float
    accounts_receivable: float
    total_assets: float
    accounts_payable: float
    other_liabilities: float
    total_liabilities: float
    equity: float


class CashFlowReport(BaseModel):
    revenue: float
    expenses: float
    net_operating: float
    investing: float
    financing: float
    net_change: float


# ── Dashboard ──────────────────────────────────────────────
class DailyData(BaseModel):
    day: int
    revenue: float
    expenses: float


class CashFlowMonth(BaseModel):
    month: str
    inflow: float
    outflow: float


class TopVendor(BaseModel):
    name: str
    amount: float


class DashboardSummary(BaseModel):
    revenue: float
    expenses: float
    net_profit: float
    cash_balance: float
    pending_transactions: int
    outstanding_payments: float
    daily_revenue: List[DailyData]
    expense_by_category: List[ExpenseCategory]
    cash_flow: List[CashFlowMonth]
    top_vendors: List[TopVendor]


# ── Generic responses ──────────────────────────────────────
class SuccessResponse(BaseModel):
    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
