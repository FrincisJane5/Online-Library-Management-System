import api from '../api/axios';

export interface DateRange {
  start?: string;
  end?: string;
}

export const reportService = {
  attendance: (range: DateRange = {}) =>
    api.get('/reports/attendance', { params: range }).then(r => r.data),

  borrowing: (range: DateRange = {}) =>
    api.get('/reports/borrowing', { params: range }).then(r => r.data),

  inventory: () =>
    api.get('/reports/inventory').then(r => r.data),

  overdue: (range: DateRange = {}) =>
    api.get('/reports/overdue', { params: range }).then(r => r.data),
};
