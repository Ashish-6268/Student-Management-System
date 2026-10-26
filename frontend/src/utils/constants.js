export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  STUDENTS: '/students',
  STUDENT_DETAIL: '/students/:id',
  STUDENT_ADD: '/students/new',
  STUDENT_EDIT: '/students/:id/edit',
  SETTINGS: '/settings',
  NOT_FOUND: '*'
};

export const STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
};

export const PER_PAGE = 10;

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'roll_number', label: 'Roll Number' },
  { value: 'class', label: 'Class' }
];

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc'
};
