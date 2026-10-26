import { get, post, put, patch } from './client';

export const getStudents = (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      cleanParams[key] = val;
    }
  });
  const query = new URLSearchParams(cleanParams).toString();
  return get(`/students${query ? '?' + query : ''}`);
};

export const getStudent = (id) => get(`/students/${id}`);

export const createStudent = (data) => post('/students', data);

export const updateStudent = (id, data) => put(`/students/${id}`, data);

export const archiveStudent = (id) => patch(`/students/${id}/archive`);

export const restoreStudent = (id) => patch(`/students/${id}/restore`);
