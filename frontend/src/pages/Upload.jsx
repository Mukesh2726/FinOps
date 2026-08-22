import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Image, CheckCircle, X, Lock, Eye, EyeOff, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { documentsApi } from '../services/api/documents';

const DOC_TYPES = ['Bank Statement', 'Invoice', 'Bill', 'Receipt', 'Expense Photo'];

const STEPS = [
  'Reading document',
  'Extracting transactions',
  'Identifying vendors',
  'Categorizing expenses',
  'Checking duplicates',
  'Detecting anomalies',
  'Updating reports',
];

function PasswordModal({ onSubmit, onCancel, isRetry }) {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  return (
    <div className="modal-overlay">
      <motion.div className="modal-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
        <div className="modal-icon"><Lock size={24} /></div>
        <h3>{isRetry ? 'Password incorrect' : 'Bank Statement Password'}</h3>
        <p className="modal-sub">
          {isRetry
            ? 'The stored password did not work. Enter the correct password for this statement.'
            : 'This statement is password-protected. Enter the password to unlock it.'}
        </p>
        <div className="pwd-input-wrap">
          <input className="input" type={show ? 'text' : 'password'} placeholder="Statement password"
            value={pwd} onChange={e => setPwd(e.target.value)} autoFocus />
          <button type="button" className="pwd-toggle" onClick={() => setShow(s => !s)}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="modal-note"><Lock size={11} /> Password is encrypted and stored securely.</p>
        <div className="modal-actions">
          <button className="glow-btn glow-btn--ghost glow-btn--sm" onClick={onCancel}>Cancel</button>
          <button className="glow-btn glow-btn--primary glow-btn--sm" disabled={!pwd.trim()} onClick={() => onSubmit(pwd)}>
            Unlock & Process
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ProcessingView({ currentStep }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="processing-steps">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-glow)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={18} style={{ color: 'var(--primary-light)' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text3)' }}>AI is understanding your financial document...</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text)' }}>This usually takes 10–30 seconds</div>
        </div>
      </div>
      {STEPS.map((step, i) => (
        <div key={step} className={`processing-step ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}>
          <div className="step-dot" />
          <span>{step}</span>
          {i < currentStep && <CheckCircle size={13} style={{ color: 'var(--green)', marginLeft: 'auto' }} />}
        </div>
      ))}
    </motion.div>
  );
}

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [txnCount, setTxnCount] = useState(0);
  const [docType, setDocType] = useState('Bank Statement');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdRetry, setPwdRetry] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); addFiles([...e.dataTransfer.files]); };
  const addFiles = (newFiles) => setFiles(prev => [...prev, ...newFiles.map(f => ({ file: f, id: Math.random() }))]);
  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const simulateSteps = () => {
    let step = 0;
    setCurrentStep(0);
    const interval = setInterval(() => {
      step++;
      if (step >= STEPS.length) { clearInterval(interval); return; }
      setCurrentStep(step);
    }, 1800);
    return interval;
  };

  const uploadAndProcess = async (statementPassword = null) => {
    setProcessing(true);
    setShowPwdModal(false);
    setError('');
    const stepInterval = simulateSteps();
    let totalTxns = 0;
    try {
      for (const { file } of files) {
        const docTypeMap = { 'Bank Statement': 'bank_statement', 'Invoice': 'invoice', 'Bill': 'bill', 'Receipt': 'receipt', 'Expense Photo': 'receipt' };
        const { signed_url, document_id } = await documentsApi.getUploadUrl(file.name, file.type, docTypeMap[docType]);
        await documentsApi.uploadToStorage(signed_url, file);
        const result = await documentsApi.confirmUpload(document_id, statementPassword);
        totalTxns += result.transaction_count || 0;
      }
      setTxnCount(totalTxns);
      setCurrentStep(STEPS.length);
      setTimeout(() => setDone(true), 600);
    } catch (err) {
      clearInterval(stepInterval);
      if (err.message?.includes('password')) { setPwdRetry(true); setShowPwdModal(true); }
      else setError(err.message || 'Processing failed');
    } finally {
      clearInterval(stepInterval);
      setProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (docType !== 'Bank Statement') { await uploadAndProcess(); return; }
    setPwdRetry(false);
    setShowPwdModal(true);
  };

  return (
    <Layout>
      {showPwdModal && <PasswordModal isRetry={pwdRetry} onSubmit={uploadAndProcess} onCancel={() => { setShowPwdModal(false); setPwdRetry(false); }} />}

      <div className="page-header">
        <div>
          <h1>Upload Documents</h1>
          <p>Upload bank statements, invoices, bills, and receipts for AI processing</p>
        </div>
      </div>

      <div className="upload-layout">
        <div className="upload-main">
          <div className="doc-type-row">
            {DOC_TYPES.map(t => (
              <button key={t} onClick={() => setDocType(t)} className={`type-chip ${docType === t ? 'selected' : ''}`}>{t}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {processing ? (
              <ProcessingView key="processing" currentStep={currentStep} />
            ) : done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="upload-success">
                <CheckCircle size={24} />
                <span>AI processed <strong>{txnCount} transactions</strong>. <Link to="/documents">View documents</Link> or <Link to="/review">review transactions</Link>.</span>
              </motion.div>
            ) : (
              <motion.div key="dropzone"
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => inputRef.current.click()}
                whileHover={{ borderColor: 'var(--primary)' }}
              >
                <UploadIcon size={44} className="drop-icon" />
                <p>Drag & drop files here, or <span className="link">browse</span></p>
                <p className="drop-sub">Supports PDF, CSV, JPG, PNG</p>
                <input ref={inputRef} type="file" multiple accept=".pdf,.csv,.jpg,.jpeg,.png"
                  style={{ display: 'none' }} onChange={e => addFiles([...e.target.files])} />
              </motion.div>
            )}
          </AnimatePresence>

          {!processing && !done && files.length > 0 && (
            <div className="file-list">
              {files.map(({ file, id }) => (
                <motion.div key={id} className="file-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  {file.type.startsWith('image') ? <Image size={18} /> : <FileText size={18} />}
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => removeFile(id)} className="icon-btn"><X size={16} /></button>
                </motion.div>
              ))}
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          {!processing && !done && (
            <button className="glow-btn glow-btn--primary glow-btn--full glow-btn--md"
              disabled={files.length === 0} onClick={handleProcess}>
              <Brain size={16} />
              {`Process ${files.length || ''} File${files.length !== 1 ? 's' : ''} with AI`}
            </button>
          )}
        </div>

        <div className="upload-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={14} style={{ color: 'var(--primary-light)' }} />
            <h3>What our AI extracts</h3>
          </div>
          {['Vendor Name', 'Transaction Date', 'Amount & Currency', 'Payment Method', 'Invoice Number', 'Tax Amount'].map(item => (
            <div key={item} className="info-item"><CheckCircle size={13} /><span>{item}</span></div>
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
