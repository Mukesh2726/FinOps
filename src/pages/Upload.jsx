import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, Image, CheckCircle, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { MOCK_TRANSACTIONS } from '../data/mockData';

const DOC_TYPES = ['Bank Statement', 'Invoice', 'Bill', 'Receipt', 'Expense Photo'];

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [docType, setDocType] = useState('Bank Statement');
  const inputRef = useRef();
  const { setTransactions } = useApp();

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles([...e.dataTransfer.files]);
  };

  const addFiles = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles.map(f => ({ file: f, id: Math.random() }))]);
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleProcess = () => {
    setProcessing(true);
    setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setProcessing(false);
      setDone(true);
    }, 2500);
  };

  return (
    <Layout>
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

          {done ? (
            <div className="upload-success">
              <CheckCircle size={24} />
              <span>AI processed {MOCK_TRANSACTIONS.length} transactions. <a href="/review">Review now →</a></span>
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
