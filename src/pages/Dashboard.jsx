import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Clock, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { generateMonthData } from '../data/mockData';
import { useInView } from '../hooks/useInView';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = [2024, 2025, 2026, 2027];
const COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#06b6d4','#22c55e'];

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function MetricCard({ label, value, icon: Icon, color, change, index }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`metric-card metric-${color} ${visible ? 'animate-in' : 'pre-animate'}`}
      style={{ transitionDelay: `${index * 60}ms` }}>
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <div className={`metric-icon icon-${color}`}><Icon size={18} /></div>
      </div>
      <div className="metric-value">{value}</div>
      {change && <div className="metric-change positive">{change} vs last month</div>}
    </div>
  );
}

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(2026);
  const data = generateMonthData(month + 1, year);

  const metrics = [
    { label: 'Total Revenue', value: fmt(data.revenue), icon: TrendingUp, color: 'green', change: '+12.4%' },
    { label: 'Total Expenses', value: fmt(data.expenses), icon: TrendingDown, color: 'red', change: '+3.1%' },
    { label: 'Net Profit', value: fmt(data.netProfit), icon: DollarSign, color: 'blue', change: '+18.2%' },
    { label: 'Cash Balance', value: fmt(data.cashBalance), icon: Wallet, color: 'purple', change: '+5.7%' },
    { label: 'Pending Txns', value: data.pendingTransactions, icon: Clock, color: 'orange', change: '' },
    { label: 'Outstanding', value: fmt(data.outstandingPayments), icon: AlertCircle, color: 'yellow', change: '' },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Financial overview for your business</p>
        </div>
        <div className="period-filter">
          <select className="select" value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select className="select" value={year} onChange={e => setYear(+e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="period-label">
        Showing data for <strong>{MONTHS[month]} {year}</strong>
      </div>

      <div className="metrics-grid">
        {metrics.map((m, i) => <MetricCard key={m.label} {...m} index={i} />)}
      </div>

      <div className="charts-row">
        <div className="chart-card chart-card--animate">
          <h3>Revenue vs Expenses — Daily</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.dailyRevenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#rev)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#exp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card--animate" style={{ animationDelay: '100ms' }}>
          <h3>Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card chart-card--animate" style={{ animationDelay: '150ms' }}>
          <h3>Cash Flow — Annual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.cashFlow}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="inflow" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card--animate" style={{ animationDelay: '200ms' }}>
          <h3>Top Vendors</h3>
          <div className="vendor-list">
            {data.topVendors.map((v, i) => (
              <div key={v.name} className="vendor-row" style={{ animationDelay: `${250 + i * 60}ms` }}>
                <div className="vendor-rank">{i + 1}</div>
                <div className="vendor-name">{v.name}</div>
                <div className="vendor-bar-wrap">
                  <div className="vendor-bar" style={{ width: `${(v.amount / data.topVendors[0].amount) * 100}%` }} />
                </div>
                <div className="vendor-amount">{fmt(v.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
