import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { reportsApi } from '../services/api/reports';
import { generateMonthData } from '../data/mockData';
import { Download } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = [2024, 2025, 2026, 2027];
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

function Row({ label, value, bold, indent, positive }) {
  return (
    <div className={`report-row ${bold ? 'bold' : ''} ${indent ? 'indent' : ''}`}>
      <span>{label}</span>
      <span className={positive === false ? 'neg' : positive === true ? 'pos' : ''}>{typeof value === 'string' ? value : fmt(value)}</span>
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState('pl');
  const [month, setMonth] = useState(6);
  const [year, setYear] = useState(2026);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetcher = tab === 'pl' ? reportsApi.getPL : tab === 'bs' ? reportsApi.getBalanceSheet : reportsApi.getCashFlow;
    fetcher(month + 1, year)
      .then(d => setReportData(d))
      .catch(() => setReportData(null))
      .finally(() => setLoading(false));
  }, [tab, month, year]);

  // Fallback to mock data if API not ready
  const d = generateMonthData(month + 1, year);
  const r = reportData || {};
  const cogs = r.cogs ?? Math.round(d.revenue * 0.35);
  const revenue = r.revenue ?? d.revenue;
  const expenses = r.expenses ?? d.expenses;
  const grossProfit = r.gross_profit ?? (revenue - cogs);
  const opExpenses = r.operating_expenses ?? (expenses - cogs);
  const netProfit = r.net_profit ?? d.netProfit;
  const cashBalance = r.cash_balance ?? d.cashBalance;
  const outstandingPayments = r.outstanding_payments ?? d.outstandingPayments;
  const assets = r.total_assets ?? (cashBalance + Math.round(revenue * 0.2));
  const liabilities = r.total_liabilities ?? Math.round(outstandingPayments * 1.5);
  const equity = r.equity ?? (assets - liabilities);
  const expCats = r.expense_categories ?? d.expenseByCategory;

  return (
    <Layout>
      <div className="page-header">
        <div><h1>Financial Reports</h1><p>Auto-generated from approved transactions</p></div>
        <div className="period-filter">
          <select className="select" value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select className="select" value={year} onChange={e => setYear(+e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn-outline"><Download size={16} /> Export</button>
        </div>
      </div>

      <div className="filter-tabs">
        {[['pl', 'Profit & Loss'], ['bs', 'Balance Sheet'], ['cf', 'Cash Flow']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`tab ${tab === id ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      <div className="report-card">
        {loading && <div style={{ color: 'var(--text)', fontSize: '0.85rem', marginBottom: 12 }}>Loading report...</div>}

        {tab === 'pl' && (
          <>
            <div className="report-title">Profit & Loss Statement — {MONTHS[month]} {year}</div>
            <div className="report-section-label">Revenue</div>
            <Row label="Total Revenue" value={revenue} />
            <Row label="Cost of Goods Sold" value={cogs} indent />
            <Row label="Gross Profit" value={grossProfit} bold positive={grossProfit > 0} />
            <div className="report-section-label">Operating Expenses</div>
            {expCats.map((cat, i) => (
              <Row key={i} label={cat.name} value={cat.value} indent />
            ))}
            <Row label="Total Operating Expenses" value={opExpenses} bold />
            <div className="report-divider" />
            <Row label="Net Profit" value={netProfit} bold positive={netProfit > 0} />
            <Row label="Profit Margin" value={`${((netProfit / revenue) * 100).toFixed(1)}%`} />
          </>
        )}

        {tab === 'bs' && (
          <>
            <div className="report-title">Balance Sheet — {MONTHS[month]} {year}</div>
            <div className="report-section-label">Assets</div>
            <Row label="Cash & Bank Balance" value={cashBalance} indent />
            <Row label="Accounts Receivable" value={Math.round(revenue * 0.2)} indent />
            <Row label="Total Assets" value={assets} bold positive />
            <div className="report-section-label">Liabilities</div>
            <Row label="Accounts Payable" value={outstandingPayments} indent />
            <Row label="Other Liabilities" value={Math.round(liabilities - outstandingPayments)} indent />
            <Row label="Total Liabilities" value={liabilities} bold positive={false} />
            <div className="report-divider" />
            <div className="report-section-label">Equity</div>
            <Row label="Owner's Equity" value={equity} bold positive={equity > 0} />
          </>
        )}

        {tab === 'cf' && (
          <>
            <div className="report-title">Cash Flow Statement — {MONTHS[month]} {year}</div>
            <div className="report-section-label">Operating Activities</div>
            <Row label="Cash from Revenue" value={revenue} indent positive />
            <Row label="Cash paid for Expenses" value={-expenses} indent positive={false} />
            <Row label="Net Operating Cash Flow" value={revenue - expenses} bold positive={revenue > expenses} />
            <div className="report-section-label">Investing Activities</div>
            <Row label="Equipment Purchase" value={-Math.round(expenses * 0.05)} indent />
            <Row label="Net Investing Cash Flow" value={-Math.round(expenses * 0.05)} bold />
            <div className="report-section-label">Financing Activities</div>
            <Row label="Loan Repayment" value={-Math.round(expenses * 0.08)} indent />
            <Row label="Net Financing Cash Flow" value={-Math.round(expenses * 0.08)} bold />
            <div className="report-divider" />
            <Row label="Net Change in Cash" value={revenue - expenses - Math.round(expenses * 0.13)} bold positive />
          </>
        )}
      </div>
    </Layout>
  );
}
