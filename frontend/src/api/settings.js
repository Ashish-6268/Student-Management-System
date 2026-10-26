import { get, post, put } from './client';

export const getClasses = () => get('/settings/classes');
export const addClass = (data) => post('/settings/classes', data);
export const updateClass = (id, data) => put(`/settings/classes/${id}`, data);

export const getBoards = () => get('/settings/boards');
export const addBoard = (data) => post('/settings/boards', data);
export const updateBoard = (id, data) => put(`/settings/boards/${id}`, data);

export const getModes = () => get('/settings/modes');
export const addMode = (data) => post('/settings/modes', data);
export const updateMode = (id, data) => put(`/settings/modes/${id}`, data);

export const getSubjects = () => get('/settings/subjects');
export const addSubject = (data) => post('/settings/subjects', data);
export const updateSubject = (id, data) => put(`/settings/subjects/${id}`, data);

export const getClassSubjects = (classId) => get(`/settings/classes/${classId}/subjects`);
export const updateClassSubjects = (classId, subjectIds) => put(
  `/settings/classes/${classId}/subjects`, 
  { subject_ids: Array.isArray(subjectIds) ? subjectIds : (subjectIds?.subject_ids || []) }
);
