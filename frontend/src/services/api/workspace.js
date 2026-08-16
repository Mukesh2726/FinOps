import { api } from './client';

export const profileApi = {
  get: () => api.get('/api/profile'),
  update: (data) => api.patch('/api/profile', data),
};

export const workspaceApi = {
  get: () => api.get('/api/workspace'),
  setup: (data) => api.post('/api/workspace/setup', data),
};
