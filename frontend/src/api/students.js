import { get, post, put, patch } from './client';

export const getStudents = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return get(`/students${query ? '?' + query : ''}`);
};

export const getStudent = (id) => get(`/students/${id}`);

export const createStudent = (data) => post('/students', data);

export const updateStudent = (id, data) => put(`/students/${id}`, data);

export const archiveStudent = (id) => patch(`/students/${id}/archive`);

export const restoreStudent = (id) => patch(`/students/${id}/restore`);\n