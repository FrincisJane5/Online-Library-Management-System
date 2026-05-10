// Attendance API calls are made directly via the shared `api` instance in each component.
// AttendanceManagement uses api.get('/attendance') directly.
// PublicAttendance uses api.post('/attendance') directly.
// This file is intentionally minimal — add methods here if you centralize attendance calls.
import api from '../api/axios';

export const attendanceService = {
  getAll: () => api.get('/attendance').then(r => r.data),
};
