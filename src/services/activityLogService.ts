// Import the shared axios instance
import api from '../api/axios';
// Import the ActivityLog type for response typing
import type { ActivityLog } from '../types';

// Optional filters for querying activity logs
export interface LogFilters {
  search?: string;
  action?: string;
  user?: string;
  date_from?: string; // Filter logs from this date (YYYY-MM-DD)
  date_to?: string;   // Filter logs up to this date (YYYY-MM-DD)
}

// activityLogService — fetches admin activity logs
export const activityLogService = {
  // GET /api/activity-logs — fetch all logs, optionally filtered
  // Filters are passed as query parameters (e.g. ?search=book&action=added)
  getAll: (filters: LogFilters = {}) =>
    api.get<ActivityLog[]>('/activity-logs', { params: filters }).then(r => r.data),
};
