// Import the shared axios instance
import api from '../api/axios';

// Optional date range filter used by most report endpoints
export interface DateRange {
  start?: string; // Start date in YYYY-MM-DD format
  end?: string;   // End date in YYYY-MM-DD format
}

// reportService — all report-related API calls
export const reportService = {
  // GET /api/reports/attendance — attendance report, optionally filtered by date range
  attendance: (range: DateRange = {}) =>
    api.get('/reports/attendance', { params: range }).then(r => r.data),

  // GET /api/reports/borrowing — borrowing report, optionally filtered by date range
  borrowing: (range: DateRange = {}) =>
    api.get('/reports/borrowing', { params: range }).then(r => r.data),

  // GET /api/reports/inventory — full book inventory report (no date filter needed)
  inventory: () =>
    api.get('/reports/inventory').then(r => r.data),

  // GET /api/reports/overdue — overdue books report, optionally filtered by date range
  overdue: (range: DateRange = {}) =>
    api.get('/reports/overdue', { params: range }).then(r => r.data),

  // GET /api/reports/department-attendance — attendance grouped by course/department
  departmentAttendance: (range: DateRange = {}) =>
    api.get('/reports/department-attendance', { params: range }).then(r => r.data),
};
