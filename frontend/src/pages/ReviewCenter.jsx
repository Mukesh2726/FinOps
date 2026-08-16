import { useState, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { transactionsApi } from '../services/api/transactions';
import { CATEGORIES } from '../data/mockData';

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function ReviewCenter() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editCat, setEditCat] = useState('');
  const [filter, setFilter] = useState('all');

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
    await transactionsApi.approve(id);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
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
        <div><h1>Review Center</h1><p>Review and approve AI-categorized transactions</p></div>
        <div className="review-stats">
          <span className="badge badge-warn">{pending} Pending</span>
          <span className="badge badge-green">{approved} Approved</span>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading transactions...</p></div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions yet. <Link to="/upload">Upload documents</Link> to get started.</p>
        </div>
      ) : (
        <>
          <div className="filter-tabs">
            {['all', 'pending', 'approved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`tab ${filter === f ? 'active' : ''}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="txn-table">
            <div className="txn-header">
              <span>Date</span><span>Vendor</span><span>Amount</span>
              <span>Category</span><span>Confidence</span><span>Actions</span>
            </div>
            {filtered.map(t => (
              <div key={t.id} className={`txn-row ${t.status === 'rejected' ? 'rejected' : ''}`}>
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
                  <div className={`confidence-badge ${t.confidence >= 80 ? 'high' : 'low'}`}>
                    {t.confidence}%
                  </div>
                </span>
                <span className="txn-actions">
                  {t.status === 'pending' && (
                    <>
                      {editId === t.id ? (
                        <button className="action-btn green" onClick={() => saveEdit(t.id)}><Check size={14} /></button>
                      ) : (
                        <>
                          <button className="action-btn blue" onClick={() => startEdit(t)}><Edit2 size={14} /></button>
                          <button className="action-btn green" onClick={() => approve(t.id)}><Check size={14} /></button>
                          <button className="action-btn red" onClick={() => reject(t.id)}><X size={14} /></button>
                        </>
                      )}
                    </>
                  )}
                  {t.status === 'approved' && <span className="status-tag approved">Approved</span>}
                  {t.status === 'rejected' && <span className="status-tag rejected">Rejected</span>}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
