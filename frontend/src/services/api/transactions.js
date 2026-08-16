import { api } from './client';

export const transactionsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/transactions${q ? `?${q}` : ''}`);
  },
  get: (id) => api.get(`/api/transactions/${id}`),
  update: (id, data) => api.patch(`/api/transactions/${id}`, data),
  delete: (id) => api.delete(`/api/transactions/${id}`),
  approve: (id) => api.patch(`/api/transactions/${id}`, { status: 'approved' }),
  reject: (id) => api.patch(`/api/transactions/${id}`, { status: 'rejected' }),
};
