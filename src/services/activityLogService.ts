// Import the shared axios instance
import api from '../api/axios';
// Import the ActivityLog type for response typing
import type { ActivityLog } from '../types';

// Optional filters for querying activity logs
export interface LogFilters {
  search?: string; // Free-text search across log fields
  action?: string; // Filter by action type (e.g. "Book Added")
  user?: string;   // Filter by the user who performed the action
}

// activityLogService — fetches admin activity logs
export const activityLogService = {
  // GET /api/activity-logs — fetch all logs, optionally filtered
  // Filters are passed as query parameters (e.g. ?search=book&action=added)
  getAll: (filters: LogFilters = {}) =>
    api.get<ActivityLog[]>('/activity-logs', { params: filters }).then(r => r.data),
};
