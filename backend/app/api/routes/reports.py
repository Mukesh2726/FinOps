from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.database.session import get_db
from app.core.auth import get_current_user
from app.models.models import Workspace, Transaction, TransactionStatus, TransactionType
from app.schemas.schemas import PLReport, BalanceSheetReport, CashFlowReport, DashboardSummary, ExpenseCategory
from fastapi import HTTPException
from collections import defaultdict
import calendar

router = APIRouter()

MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


def _get_workspace(user_id: str, db: Session) -> Workspace:
    ws = db.query(Workspace).filter(Workspace.user_id == user_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws


def _approved_txns(ws_id, month: int | None, year: int | None, db: Session, from_date: str | None = None, to_date: str | None = None):
    query = db.query(Transaction).filter(
        Transaction.workspace_id == ws_id,
        Transaction.status == TransactionStatus.approved,
    )
    if from_date:
        query = query.filter(Transaction.date >= from_date)
    if to_date:
        query = query.filter(Transaction.date <= to_date)
    if not from_date and not to_date and month and year:
        query = query.filter(Transaction.date.like(f"{year}-{month:02d}-%"))
    return query.order_by(Transaction.date.asc()).all()


@router.get("/reports/pl", response_model=PLReport)
async def get_pl(
    month: int | None = Query(None, ge=1, le=12),
    year: int | None = Query(None, ge=2000),
    from_date: str | None = Query(None, alias="from"),
    to_date: str | None = Query(None, alias="to"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    txns = _approved_txns(ws.id, month, year, db, from_date, to_date)
    revenue = sum(t.amount for t in txns if t.type == TransactionType.income)
    expenses_by_cat = defaultdict(float)
    for t in txns:
        if t.type == TransactionType.expense:
            expenses_by_cat[t.category or "Miscellaneous"] += t.amount
    total_expenses = sum(expenses_by_cat.values())
    cogs = expenses_by_cat.get("Cost of Goods Sold", 0)
    op_expenses = total_expenses - cogs
    return PLReport(
        revenue=revenue,
        cogs=cogs,
        gross_profit=revenue - cogs,
        expense_categories=[ExpenseCategory(name=k, value=v) for k, v in expenses_by_cat.items()],
        operating_expenses=op_expenses,
        net_profit=revenue - total_expenses,
    )


@router.get("/reports/balance-sheet", response_model=BalanceSheetReport)
async def get_balance_sheet(
    month: int | None = Query(None, ge=1, le=12),
    year: int | None = Query(None, ge=2000),
    as_of: str | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    txns = _approved_txns(ws.id, month, year, db, to_date=as_of)
    revenue = sum(t.amount for t in txns if t.type == TransactionType.income)
    expenses = sum(t.amount for t in txns if t.type == TransactionType.expense)
    cash = revenue - expenses
    ar = revenue * 0.2
    total_assets = cash + ar
    ap = expenses * 0.15
    other_liab = expenses * 0.05
    total_liab = ap + other_liab
    return BalanceSheetReport(
        cash_balance=cash, accounts_receivable=ar, total_assets=total_assets,
        accounts_payable=ap, other_liabilities=other_liab, total_liabilities=total_liab,
        equity=total_assets - total_liab,
    )


@router.get("/reports/cashflow", response_model=CashFlowReport)
async def get_cashflow(
    month: int | None = Query(None, ge=1, le=12),
    year: int | None = Query(None, ge=2000),
    from_date: str | None = Query(None, alias="from"),
    to_date: str | None = Query(None, alias="to"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    txns = _approved_txns(ws.id, month, year, db, from_date, to_date)
    revenue = sum(t.amount for t in txns if t.type == TransactionType.income)
    expenses = sum(t.amount for t in txns if t.type == TransactionType.expense)
    investing = -(expenses * 0.05)
    financing = -(expenses * 0.08)
    return CashFlowReport(
        revenue=revenue, expenses=expenses,
        net_operating=revenue - expenses,
        investing=investing, financing=financing,
        net_change=revenue - expenses + investing + financing,
    )


@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = _get_workspace(current_user["id"], db)
    txns = _approved_txns(ws.id, month, year, db)
    all_txns = db.query(Transaction).filter(Transaction.workspace_id == ws.id).all()

    revenue = sum(t.amount for t in txns if t.type == TransactionType.income)
    expenses = sum(t.amount for t in txns if t.type == TransactionType.expense)
    pending_count = sum(1 for t in all_txns if t.status.value == "pending")

    # Daily breakdown
    daily: dict = defaultdict(lambda: {"revenue": 0.0, "expenses": 0.0})
    for t in txns:
        try:
            day = int(t.date.split("-")[2])
        except Exception:
            continue
        if t.type == TransactionType.income:
            daily[day]["revenue"] += t.amount
        else:
            daily[day]["expenses"] += t.amount
    days_in_month = calendar.monthrange(year, month)[1]
    daily_revenue = [{"day": d, "revenue": daily[d]["revenue"], "expenses": daily[d]["expenses"]} for d in range(1, days_in_month + 1)]

    # Expense by category
    exp_cat: dict = defaultdict(float)
    for t in txns:
        if t.type == TransactionType.expense:
            exp_cat[t.category or "Miscellaneous"] += t.amount

    # Top vendors
    vendor_totals: dict = defaultdict(float)
    for t in txns:
        vendor_totals[t.vendor] += t.amount
    top_vendors = sorted([{"name": k, "amount": v} for k, v in vendor_totals.items()], key=lambda x: -x["amount"])[:5]

    # Annual cash flow
    cash_flow = []
    for m in range(1, 13):
        m_txns = db.query(Transaction).filter(
            Transaction.workspace_id == ws.id,
            Transaction.status == TransactionStatus.approved,
            Transaction.date.like(f"{year}-{m:02d}-%"),
        ).all()
        cash_flow.append({
            "month": MONTHS_SHORT[m - 1],
            "inflow": sum(t.amount for t in m_txns if t.type == TransactionType.income),
            "outflow": sum(t.amount for t in m_txns if t.type == TransactionType.expense),
        })

    return DashboardSummary(
        revenue=revenue, expenses=expenses, net_profit=revenue - expenses,
        cash_balance=revenue - expenses,
        pending_transactions=pending_count,
        outstanding_payments=expenses * 0.15,
        daily_revenue=daily_revenue,
        expense_by_category=[ExpenseCategory(name=k, value=v) for k, v in exp_cat.items()],
        cash_flow=cash_flow,
        top_vendors=top_vendors,
    )
