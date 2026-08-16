import { api } from './client';
import { supabase } from '../supabase';

export const documentsApi = {
  getUploadUrl: (filename, contentType, docType) =>
    api.post('/api/documents/upload-url', { filename, content_type: contentType, doc_type: docType }),

  uploadToStorage: async (signedUrl, file) => {
    const res = await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    if (!res.ok) throw new Error('Storage upload failed');
  },

  confirmUpload: (documentId, statementPassword) =>
    api.post(`/api/documents/${documentId}/process`, statementPassword ? { statement_password: statementPassword } : {}),

  list: () => api.get('/api/documents'),

  getStatus: (id) => api.get(`/api/documents/${id}/status`),

  checkStatementPassword: (documentId) =>
    api.get(`/api/documents/${documentId}/has-password`),
};
