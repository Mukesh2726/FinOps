import { api } from './client';

export const documentsApi = {
  getUploadUrl: (filename, contentType, docType) =>
    api.post('/api/documents/upload-url', { filename, content_type: contentType, doc_type: docType }),

  uploadToStorage: async (signedUrl, file) => {
    await api.upload(signedUrl, file);
  },

  confirmUpload: (documentId, statementPassword) =>
    api.post(`/api/documents/${documentId}/process`, statementPassword ? { statement_password: statementPassword } : {}),

  list: () => api.get('/api/documents'),

  download: (id) => api.download(`/api/storage/download/${id}`),

  delete: (id) => api.delete(`/api/documents/${id}`),

  getStatus: (id) => api.get(`/api/documents/${id}/status`),

  checkStatementPassword: (documentId) =>
    api.get(`/api/documents/${documentId}/has-password`),
};
