import { api } from './client';

export const reportsApi = {
  getPL: (month, year) => api.get(`/api/reports/pl?month=${month}&year=${year}`),
  getBalanceSheet: (month, year) => api.get(`/api/reports/balance-sheet?month=${month}&year=${year}`),
  getCashFlow: (month, year) => api.get(`/api/reports/cashflow?month=${month}&year=${year}`),
};

export const dashboardApi = {
  getSummary: (month, year) => api.get(`/api/dashboard/summary?month=${month}&year=${year}`),
};
