// Import the shared axios instance so all requests use the same base URL and headers
import api from '../api/axios';

// attendanceService — centralizes attendance-related API calls
// Note: AttendanceManagement and PublicAttendance also call the API directly in some places.
// This service is intentionally minimal — add methods here if you centralize attendance calls.
export const attendanceService = {
  // Fetch all attendance records from GET /api/attendance
  getAll: () => api.get('/attendance').then(r => r.data),
};
