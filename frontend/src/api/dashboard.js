import { get } from './client';

export const getStats = () => get('/dashboard/stats');
export const getStudentsByClass = () => get('/dashboard/students-by-class');
export const getStudentsByBoard = () => get('/dashboard/students-by-board');
export const getRecentStudents = () => get('/dashboard/recent-students');\n