import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Clock, AlertCircle, Brain, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import { dashboardApi } from '../services/api/reports';
import { useApp } from '../context/useApp';
import { useSubscription } from '../hooks/useSubscription';
import SubscriptionBadge from '../components/pricing/SubscriptionBadge';
import { formatUsage } from '../config/subscriptionPlans';
import NoFinancialData from '../components/ui/NoFinancialData';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = [2024, 2025, 2026, 2027];
const COLORS = ['#6366f1','#a855f7','#06b6d4','#22c55e','#f97316','#f43f5e'];
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const AI_INSIGHTS = [
  { icon: '⚡', type: 'alert', title: 'Spending Alert', text: 'Marketing expenses increased 24% this month compared to last month.' },
  { icon: '📈', type: 'growth', title: 'Growth Opportunity', text: 'Your revenue has increased consistently for 4 months. Consider scaling operations.' },
  { icon: '⚠️', type: 'anomaly', title: 'Anomaly Detected', text: 'A ₹82,000 transaction is significantly higher than your normal AWS spending.' },
  { icon: '💡', type: 'tip', title: 'Recommendation', text: 'Reducing software expenses by 8% could improve your monthly margin by ₹12,000.' },
];

function SubscriptionSummary({ currentPlan, subscription, usage }) {
  return (
    <motion.div className="subscription-summary glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="subscription-summary-main">
        <div className="subscription-summary-icon"><CreditCard size={17} /></div>
        <div><span className="summary-label">Current Plan</span><strong>{currentPlan?.name}</strong><span>{currentPlan?.priceLabel}/month</span></div>
      </div>
      <div className="subscription-summary-detail"><span>Plan status</span><SubscriptionBadge status={subscription?.status} /></div>
      <div className="subscription-summary-detail"><span>Next renewal</span><strong>{subscription?.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Loading...'}</strong></div>
      <div className="subscription-summary-detail"><span>Companies</span><strong>{usage?.companies ? `${usage.companies.used} / ${formatUsage(usage.companies.limit)}` : 'Loading...'}</strong></div>
    </motion.div>
  );
}

function MetricCard({ label, numValue, icon: Icon, color, change, positive, index }) {
  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
    >
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <div className={`metric-icon icon-${color}`}><Icon size={17} /></div>
      </div>
      <div className="metric-value">
        <AnimatedNumber value={numValue} prefix="₹" />
      </div>
      {change && (
        <div className={`metric-change ${positive ? 'positive' : 'neutral'}`}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change} vs last month
        </div>
      )}
    </motion.div>
  );
}

function InsightCard({ icon, type, title, text, index }) {
  return (
    <motion.div
      className="insight-card"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
    >
      <div className={`insight-icon insight-icon--${type}`}>{icon}</div>
      <div>
        <div className="insight-title">{title}</div>
        <div className="insight-text">{text}</div>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem' }}>
      <div style={{ color: 'var(--text2)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useApp();
  const { currentPlan, subscription, usage } = useSubscription();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(2026);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardApi.getSummary(month + 1, year)
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [month, year]);

  const d = data;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  if (!data) {
    return (
      <Layout>
        <div className="dashboard-greeting">
          <h1>{greeting}, <span className="gradient-text">{firstName}</span> 👋</h1>
          <p>Here's your financial overview for {MONTHS[month]} {year}</p>
        </div>
        <SubscriptionSummary currentPlan={currentPlan} subscription={subscription} usage={usage} />
        {loading ? <div className="empty-state">Loading your financial data...</div> : <NoFinancialData />}
      </Layout>
    );
  }

  const metrics = [
    { label: 'Total Revenue', numValue: d.revenue, icon: TrendingUp, color: 'green', change: '+12.4%', positive: true },
    { label: 'Total Expenses', numValue: d.expenses, icon: TrendingDown, color: 'red', change: '+3.1%', positive: false },
    { label: 'Net Profit', numValue: d.netProfit, icon: DollarSign, color: 'blue', change: '+18.2%', positive: true },
    { label: 'Cash Balance', numValue: d.cashBalance, icon: Wallet, color: 'purple', change: '+5.7%', positive: true },
    { label: 'Pending Txns', numValue: d.pendingTransactions, icon: Clock, color: 'orange', change: '' },
    { label: 'Outstanding', numValue: d.outstandingPayments, icon: AlertCircle, color: 'yellow', change: '' },
  ];

  return (
    <Layout>
      <div className="dashboard-greeting">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {greeting}, <span className="gradient-text">{firstName}</span> 👋
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
          Here's your financial overview for {MONTHS[month]} {year}
        </motion.p>
      </div>

      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="period-filter">
          <select className="select" value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select className="select" value={year} onChange={e => setYear(+e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {loading && <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>Updating...</span>}
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((m, i) => <MetricCard key={m.label} {...m} index={i} />)}
      </div>

      {/* AI Insights */}
      <div className="ai-insights-section">
        <div className="ai-insights-header">
          <div className="ai-badge"><Brain size={11} /> AI Insights</div>
          <h3>AI Financial Insights</h3>
        </div>
        <div className="insights-grid">
          {AI_INSIGHTS.map((ins, i) => <InsightCard key={ins.title} {...ins} index={i} />)}
        </div>
      </div>

      <div className="charts-row">
        <motion.div className="chart-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <h3>Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={d.dailyRevenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#rev)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#exp)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="chart-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <h3>Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={d.expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {d.expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(_value) => fmt(_value)} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="charts-row">
        <motion.div className="chart-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
          <h3>Cash Flow — Annual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.cashFlow}>
              <defs>
                <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                </linearGradient>
                <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="inflow" fill="url(#inflow)" radius={[4, 4, 0, 0]} name="Inflow" />
              <Bar dataKey="outflow" fill="url(#outflow)" radius={[4, 4, 0, 0]} name="Outflow" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="chart-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <h3>Top Vendors</h3>
          <div className="vendor-list">
            {d.topVendors.map((v, i) => (
              <motion.div key={v.name} className="vendor-row"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}>
                <div className="vendor-rank">{i + 1}</div>
                <div className="vendor-name">{v.name}</div>
                <div className="vendor-bar-wrap">
                  <div className="vendor-bar" style={{ width: `${(v.amount / d.topVendors[0].amount) * 100}%` }} />
                </div>
                <div className="vendor-amount">{fmt(v.amount)}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
