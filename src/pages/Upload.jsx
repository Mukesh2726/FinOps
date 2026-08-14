import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Image, CheckCircle, X, Lock, Eye, EyeOff } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { MOCK_TRANSACTIONS } from '../data/mockData';

const DOC_TYPES = ['Bank Statement', 'Invoice', 'Bill', 'Receipt', 'Expense Photo'];

function PasswordModal({ onSubmit, onCancel, isRetry }) {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon"><Lock size={24} /></div>
        <h3>{isRetry ? 'Password incorrect' : 'Bank Statement Password'}</h3>
        <p className="modal-sub">
          {isRetry
            ? 'The stored password did not work. Enter the correct password for this statement.'
            : 'This statement is password-protected. Enter the password to unlock it.'}
        </p>
        <div className="pwd-input-wrap">
          <input
            className="input"
            type={show ? 'text' : 'password'}
            placeholder="Statement password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            autoFocus
          />
          <button type="button" className="pwd-toggle" onClick={() => setShow(s => !s)}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="modal-note">
          <Lock size={11} /> Password is stored securely and never shown again.
        </p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" disabled={!pwd.trim()} onClick={() => onSubmit(pwd)}>
            Unlock & Process
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [docType, setDocType] = useState('Bank Statement');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdRetry, setPwdRetry] = useState(false);
  const inputRef = useRef();
  const { setTransactions, hasStatementPassword, saveStatementPassword, tryStoredStatementPassword } = useApp();

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles([...e.dataTransfer.files]);
  };

  const addFiles = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles.map(f => ({ file: f, id: Math.random() }))]);
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const runProcessing = () => {
    setProcessing(true);
    setShowPwdModal(false);
    setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setProcessing(false);
      setDone(true);
    }, 2500);
  };

  const handleProcess = () => {
    if (docType !== 'Bank Statement') {
      runProcessing();
      return;
    }
    // Bank statement: check if stored password exists
    if (tryStoredStatementPassword()) {
      // Simulate: stored password works (95% of the time in real life)
      // For demo, always succeeds if stored. In production, backend would validate.
      runProcessing();
    } else {
      // No stored password — ask user
      setPwdRetry(false);
      setShowPwdModal(true);
    }
  };

  const handlePasswordSubmit = (pwd) => {
    saveStatementPassword(pwd);
    runProcessing();
  };

  const handlePasswordCancel = () => {
    setShowPwdModal(false);
    setPwdRetry(false);
  };

  return (
    <Layout>
      {showPwdModal && (
        <PasswordModal
          isRetry={pwdRetry}
          onSubmit={handlePasswordSubmit}
          onCancel={handlePasswordCancel}
        />
      )}

      <div className="page-header">
        <div><h1>Upload Documents</h1><p>Upload bank statements, invoices, bills, and receipts</p></div>
      </div>

      <div className="upload-layout">
        <div className="upload-main">
          <div className="doc-type-row">
            {DOC_TYPES.map(t => (
              <button key={t} onClick={() => setDocType(t)}
                className={`type-chip ${docType === t ? 'selected' : ''}`}>{t}</button>
            ))}
          </div>

          {docType === 'Bank Statement' && hasStatementPassword() && (
            <div className="pwd-saved-notice">
              <Lock size={13} /> Password saved — will be used automatically for this statement.
            </div>
          )}

          <div className="drop-zone" onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current.click()}>
            <UploadIcon size={40} className="drop-icon" />
            <p>Drag & drop files here, or <span className="link">browse</span></p>
            <p className="drop-sub">Supports PDF, CSV, JPG, PNG</p>
            <input ref={inputRef} type="file" multiple accept=".pdf,.csv,.jpg,.jpeg,.png"
              style={{ display: 'none' }} onChange={e => addFiles([...e.target.files])} />
          </div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map(({ file, id }) => (
                <div key={id} className="file-item">
                  {file.type.startsWith('image') ? <Image size={18} /> : <FileText size={18} />}
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => removeFile(id)} className="icon-btn"><X size={16} /></button>
                </div>
              ))}
            </div>
          )}

          {done ? (
            <div className="upload-success">
              <CheckCircle size={24} />
              {/* FIX: use Link instead of <a href> to prevent full page reload and session loss */}
              <span>AI processed {MOCK_TRANSACTIONS.length} transactions. <Link to="/review">Review now →</Link></span>
            </div>
          ) : (
            <button className="btn-primary btn-full" disabled={files.length === 0 || processing}
              onClick={handleProcess}>
              {processing ? 'AI Processing...' : `Process ${files.length} File${files.length !== 1 ? 's' : ''} with AI`}
            </button>
          )}
        </div>

        <div className="upload-info">
          <h3>What our AI extracts</h3>
          {['Vendor Name', 'Transaction Date', 'Amount & Currency', 'Payment Method', 'Invoice Number', 'Tax Amount'].map(item => (
            <div key={item} className="info-item"><CheckCircle size={14} /><span>{item}</span></div>
          ))}
          <div className="info-divider" />
          <h3>AI Detection</h3>
          {['Duplicate invoices', 'Unusual spending', 'Missing receipts', 'Large transactions'].map(item => (
            <div key={item} className="info-item warn"><span>⚠ {item}</span></div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
