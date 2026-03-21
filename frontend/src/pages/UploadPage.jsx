import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UploadPage = () => {

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/upload`);

      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch docs:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document? All associated AI context will be removed.')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/upload/${id}`);

      fetchDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document');
    }
  };

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus('idle');
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API_BASE_URL}/upload`, formData, {

        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      setMessage(`Successfully processed ${file.name}.`);
      setFile(null);
      fetchDocuments(); // Refresh list
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to upload document.');
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Documents</h1>
        <p className="subtitle">Upload PDFs or Text files to train your assistant.</p>
      </header>

      <div className="grid-layout">
        <div className="upload-section glass">
          <label className="drag-zone">
            <input type="file" onChange={handleFileChange} accept=".pdf,.txt" hidden />
            <div className="zone-content">
              {file ? (
                <div className="file-info animate-fade">
                  <FileText size={48} color="var(--primary)" />
                  <p className="file-name">{file.name}</p>
                </div>
              ) : (
                <div className="placeholder-content">
                  <Upload size={48} color="var(--text-muted)" />
                  <p>Select a file to upload or replace</p>
                </div>
              )}
            </div>
          </label>

          <div className="upload-actions">
            <button 
              className="btn btn-primary" 
              disabled={!file || status === 'uploading'}
              onClick={handleUpload}
            >
              {status === 'uploading' ? (
                <><Loader2 className="spinner" /> Processing...</>
              ) : (
                <>Upload Document</>
              )}
            </button>
          </div>

          {message && (
            <div className={`status-msg ${status} animate-fade`}>
              {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className="list-section glass">
          <div className="section-header">
            <h3>Knowledge Base</h3>
            {isLoadingDocs && <Loader2 className="spinner" size={16} />}
          </div>
          
          <div className="doc-list">
            {documents.length === 0 && !isLoadingDocs ? (
              <p className="empty-msg">No documents uploaded yet.</p>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="doc-item animate-fade">
                  <div className="doc-icon"><FileText size={20} /></div>
                  <div className="doc-meta">
                    <p className="doc-name">{doc.name}</p>
                    <p className="doc-date">{new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`doc-status ${doc.status}`}>{doc.status}</div>
                  <button className="del-btn" onClick={() => handleDelete(doc.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .grid-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px; align-items: start; }
        .page-header { margin-bottom: 32px; }
        .subtitle { color: var(--text-muted); margin-top: 4px; }
        .upload-section, .list-section { padding: 32px; border-radius: var(--radius-lg); min-height: 400px; }
        .drag-zone { 
          display: block; 
          border: 2px dashed var(--border); 
          border-radius: var(--radius-md); 
          padding: 40px; 
          text-align: center; 
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .drag-zone:hover { border-color: var(--primary); }
        .zone-content { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .file-name { font-weight: 600; margin-top: 8px; font-size: 0.9rem; word-break: break-all; }
        .upload-actions { margin-top: 24px; display: flex; justify-content: stretch; }
        .upload-actions .btn { width: 100%; }
        .status-msg { margin-top: 20px; padding: 12px; border-radius: var(--radius-sm); display: flex; gap: 10px; align-items: center; font-size: 0.9rem; }
        .status-msg.success { background: rgba(16, 185, 129, 0.1); color: var(--accent); border: 1px solid var(--accent); }
        .status-msg.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; }
        
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .doc-list { display: flex; flex-direction: column; gap: 12px; }
        .doc-item { display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); transition: border-color 0.2s; }
        .doc-item:hover { border-color: var(--primary); }
        .doc-icon { color: var(--text-muted); }
        .doc-meta { flex-grow: 1; }
        .doc-name { font-weight: 500; font-size: 0.95rem; margin-bottom: 2px; }
        .doc-date { font-size: 0.75rem; color: var(--text-muted); }
        .doc-status { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; font-weight: 700; width: 80px; text-align: center; }
        .doc-status.completed { background: rgba(16, 185, 129, 0.2); color: var(--accent); }
        .doc-status.processing { background: rgba(99, 102, 241, 0.2); color: var(--primary); }
        .del-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s; }
        .del-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .empty-msg { text-align: center; color: var(--text-muted); padding: 40px; }
        .spinner { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default UploadPage;
