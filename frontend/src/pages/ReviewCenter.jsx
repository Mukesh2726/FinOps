import { useState, useEffect } from 'react';
import { Check, X, Edit2, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import ConfidenceBadge from '../components/ui/ConfidenceBadge';
import { transactionsApi } from '../services/api/transactions';
import { CATEGORIES } from '../data/mockData';

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function ReviewCenter() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editCat, setEditCat] = useState('');
  const [filter, setFilter] = useState('all');
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    transactionsApi.list()
      .then(data => setTransactions(data.transactions || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(t =>
    filter === 'all' ? true : filter === 'pending' ? t.status === 'pending' : t.status === 'approved'
  );

  const approve = async (id) => {
    setApproving(id);
    await transactionsApi.approve(id);
    setTimeout(() => {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
      setApproving(null);
    }, 500);
  };

  const reject = async (id) => {
    await transactionsApi.reject(id);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
  };

  const startEdit = (t) => { setEditId(t.id); setEditCat(t.category); };

  const saveEdit = async (id) => {
    await transactionsApi.update(id, { category: editCat, status: 'approved' });
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, category: editCat, status: 'approved' } : t));
    setEditId(null);
  };

  const pending = transactions.filter(t => t.status === 'pending').length;
  const approved = transactions.filter(t => t.status === 'approved').length;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div className="ai-badge"><Brain size={11} /> AI Review Center</div>
          </div>
          <h1>Review Center</h1>
          <p>Review and approve AI-categorized transactions</p>
        </div>
        <div className="review-stats">
          <span className="badge badge-warn">{pending} Pending</span>
          <span className="badge badge-green">{approved} Approved</span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="glass-card" style={{ height: 56, borderRadius: 10 }}>
              <div className="skeleton" style={{ height: '100%', borderRadius: 10 }} />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Brain size={48} style={{ color: 'var(--text)', marginBottom: 16, opacity: 0.4 }} />
          <p>No transactions yet. <Link to="/upload">Upload documents</Link> to get started.</p>
        </motion.div>
      ) : (
        <>
          <div className="filter-tabs">
            {['all', 'pending', 'approved'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`tab ${filter === f ? 'active' : ''}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="txn-table">
            <div className="txn-header">
              <span>Date</span><span>Vendor</span><span>Amount</span>
              <span>Category</span><span>Confidence</span><span>Actions</span>
            </div>
            <AnimatePresence>
              {filtered.map((t, i) => (
                <motion.div
                  key={t.id}
                  className={`txn-row ${t.status === 'rejected' ? 'rejected' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: t.status === 'rejected' ? 0.35 : 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <span className="txn-date">{t.date}</span>
                  <span className="txn-vendor">{t.vendor}</span>
                  <span className={`txn-amount ${t.type === 'income' ? 'income' : 'expense'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                  <span className="txn-category">
                    {editId === t.id ? (
                      <select className="select-sm" value={editCat} onChange={e => setEditCat(e.target.value)}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : t.category}
                  </span>
                  <span>
                    <ConfidenceBadge confidence={t.confidence} />
                  </span>
                  <span className="txn-actions">
                    {t.status === 'pending' && (
                      <>
                        {editId === t.id ? (
                          <button className="action-btn green" onClick={() => saveEdit(t.id)}><Check size={13} /></button>
                        ) : (
                          <>
                            <button className="action-btn blue" onClick={() => startEdit(t)}><Edit2 size={13} /></button>
                            <button className="action-btn green" onClick={() => approve(t.id)}>
                              {approving === t.id ? <span className="btn-spinner" style={{ borderTopColor: 'var(--green)' }} /> : <Check size={13} />}
                            </button>
                            <button className="action-btn red" onClick={() => reject(t.id)}><X size={13} /></button>
                          </>
                        )}
                      </>
                    )}
                    {t.status === 'approved' && <span className="status-tag approved">Approved</span>}
                    {t.status === 'rejected' && <span className="status-tag rejected">Rejected</span>}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </Layout>
  );
}
