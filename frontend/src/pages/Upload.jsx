import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Image, CheckCircle, X, Lock, Eye, EyeOff } from 'lucide-react';
import Layout from '../components/Layout';
import { documentsApi } from '../services/api/documents';

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
          <Lock size={11} /> Password is encrypted and stored securely on the server.
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
  const [txnCount, setTxnCount] = useState(0);
  const [docType, setDocType] = useState('Bank Statement');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdRetry, setPwdRetry] = useState(false);
  const [pendingDocId, setPendingDocId] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles([...e.dataTransfer.files]);
  };

  const addFiles = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles.map(f => ({ file: f, id: Math.random() }))]);
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const uploadAndProcess = async (statementPassword = null) => {
    setProcessing(true);
    setShowPwdModal(false);
    setError('');
    let totalTxns = 0;
    try {
      for (const { file } of files) {
        const docTypeMap = {
          'Bank Statement': 'bank_statement',
          'Invoice': 'invoice',
          'Bill': 'bill',
          'Receipt': 'receipt',
          'Expense Photo': 'receipt',
        };
        // 1. Get signed upload URL + create document record
        const { signed_url, document_id } = await documentsApi.getUploadUrl(
          file.name, file.type, docTypeMap[docType]
        );
        // 2. Upload directly to Supabase Storage
        await documentsApi.uploadToStorage(signed_url, file);
        // 3. Trigger backend processing
        const result = await documentsApi.confirmUpload(document_id, statementPassword);
        totalTxns += result.transaction_count || 0;
      }
      setTxnCount(totalTxns);
      setDone(true);
    } catch (err) {
      if (err.message?.includes('password')) {
        setPwdRetry(true);
        setShowPwdModal(true);
      } else {
        setError(err.message || 'Processing failed');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (docType !== 'Bank Statement') {
      await uploadAndProcess();
      return;
    }
    // For bank statements, check if backend has a stored password
    if (pendingDocId) {
      const { has_password } = await documentsApi.checkStatementPassword(pendingDocId).catch(() => ({ has_password: false }));
      if (has_password) {
        await uploadAndProcess();
        return;
      }
    }
    setPwdRetry(false);
    setShowPwdModal(true);
  };

  const handlePasswordSubmit = (pwd) => uploadAndProcess(pwd);
  const handlePasswordCancel = () => { setShowPwdModal(false); setPwdRetry(false); };

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

          {error && <div className="auth-error">{error}</div>}

          {done ? (
            <div className="upload-success">
              <CheckCircle size={24} />
              <span>AI processed {txnCount} transactions. <Link to="/review">Review now →</Link></span>
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
