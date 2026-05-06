import api from '../api/axios';
import type { ActivityLog } from '../types';

export interface LogFilters {
  search?: string;
  action?: string;
  user?: string;
}

export const activityLogService = {
  getAll: (filters: LogFilters = {}) =>
    api.get<ActivityLog[]>('/activity-logs', { params: filters }).then(r => r.data),
};
