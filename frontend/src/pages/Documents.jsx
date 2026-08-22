import { useEffect, useState } from 'react';
import { Calendar, Download, Eye, FileText, Trash2, Upload, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { documentsApi } from '../services/api/documents';

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : 'Pending extraction';

function StatusBadge({ status }) {
  return <span className={`document-status document-status--${status}`}>{status.replace('_', ' ')}</span>;
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadDocuments = () => {
    setLoading(true);
    documentsApi.list()
      .then(setDocuments)
      .catch(() => setError('Documents will appear here after the backend is connected.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadDocuments, []);

  const download = async (document, open = false) => {
    setActionId(document.id);
    try {
      const blob = await documentsApi.download(document.id);
      const url = URL.createObjectURL(blob);
      if (open) window.open(url, '_blank', 'noopener,noreferrer');
      else {
        const anchor = window.document.createElement('a');
        anchor.href = url;
        anchor.download = document.filename;
        anchor.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('The document could not be downloaded.');
    } finally {
      setActionId(null);
    }
  };

  const remove = async (document) => {
    if (!window.confirm(`Delete ${document.filename}?`)) return;
    setActionId(document.id);
    try {
      await documentsApi.delete(document.id);
      setDocuments(current => current.filter(item => item.id !== document.id));
    } catch {
      setError('The document could not be deleted.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div><h1>Documents</h1><p>Your persistent bank statements and source files</p></div>
        <Link to="/upload" className="glow-btn glow-btn--primary glow-btn--md"><Upload size={15} /> Upload Documents</Link>
      </div>
      {error && <div className="auth-error">{error}</div>}
      {loading ? <div className="empty-state">Loading your documents...</div> : documents.length === 0 ? (
        <div className="empty-state"><FileText size={46} /><h2>No documents yet</h2><p>Upload a bank statement to build your historical financial record.</p><Link to="/upload" className="glow-btn glow-btn--primary glow-btn--md">Upload a Statement</Link></div>
      ) : (
        <div className="documents-list">
          {documents.map((document, index) => (
            <motion.article key={document.id} className="document-row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <div className="document-file-icon"><FileText size={18} /></div>
              <div className="document-main"><strong>{document.filename}</strong><span><Building2 size={12} /> {document.bank_name || 'Bank statement'} <span className="document-dot">•</span> {document.statement_start_date || 'Period pending'} {document.statement_end_date && `to ${document.statement_end_date}`}</span></div>
              <div className="document-meta"><span><Calendar size={12} /> Uploaded {formatDate(document.uploaded_at || document.created_at)}</span><span>{document.transaction_count || 0} transactions</span></div>
              <StatusBadge status={document.status} />
              <div className="document-actions">
                <button className="icon-btn" title="View document" onClick={() => download(document, true)} disabled={actionId === document.id}><Eye size={15} /></button>
                <button className="icon-btn" title="Download document" onClick={() => download(document)} disabled={actionId === document.id}><Download size={15} /></button>
                <button className="icon-btn" title="Delete document" onClick={() => remove(document)} disabled={actionId === document.id}><Trash2 size={15} /></button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </Layout>
  );
}
