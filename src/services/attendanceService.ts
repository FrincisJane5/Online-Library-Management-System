import api from '../api/axios';
import type { Attendance } from '../types';

export interface AttendancePayload {
  id_number: string;
  name: string;
  course: string;
  year: string;
  purpose: string;
}

export const attendanceService = {
  getAll: () => api.get<Attendance[]>('/attendance').then(r => r.data),
  record: (data: AttendancePayload) => api.post<Attendance>('/attendance', data).then(r => r.data),
};
