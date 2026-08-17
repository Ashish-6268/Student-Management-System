const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const files = {
  'utils/constants.js': `export const ROUTES = {
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
`,

  'utils/formatters.js': `export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const truncate = (str, maxLen) => {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
};
`,

  'api/client.js': `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
  }

  if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
    if (!headers.has('Content-Type') && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, config);

    if (response.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export const get = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' });
export const post = (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body: data instanceof FormData || data instanceof URLSearchParams ? data : JSON.stringify(data) });
export const put = (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body: data instanceof FormData || data instanceof URLSearchParams ? data : JSON.stringify(data) });
export const patch = (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body: data instanceof FormData || data instanceof URLSearchParams ? data : JSON.stringify(data) });
export const del = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' });
`,

  'api/auth.js': `import { post, get } from './client';

export const login = async (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  
  return post('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const getMe = () => get('/auth/me');
`,

  'api/students.js': `import { get, post, put, patch } from './client';

export const getStudents = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return get(\`/students\${query ? '?' + query : ''}\`);
};

export const getStudent = (id) => get(\`/students/\${id}\`);

export const createStudent = (data) => post('/students', data);

export const updateStudent = (id, data) => put(\`/students/\${id}\`, data);

export const archiveStudent = (id) => patch(\`/students/\${id}/archive\`);

export const restoreStudent = (id) => patch(\`/students/\${id}/restore\`);
`,

  'api/settings.js': `import { get, post, put } from './client';

export const getClasses = () => get('/settings/classes');
export const addClass = (data) => post('/settings/classes', data);
export const updateClass = (id, data) => put(\`/settings/classes/\${id}\`, data);

export const getBoards = () => get('/settings/boards');
export const addBoard = (data) => post('/settings/boards', data);
export const updateBoard = (id, data) => put(\`/settings/boards/\${id}\`, data);

export const getModes = () => get('/settings/modes');
export const addMode = (data) => post('/settings/modes', data);
export const updateMode = (id, data) => put(\`/settings/modes/\${id}\`, data);

export const getSubjects = () => get('/settings/subjects');
export const addSubject = (data) => post('/settings/subjects', data);
export const updateSubject = (id, data) => put(\`/settings/subjects/\${id}\`, data);

export const getClassSubjects = (classId) => get(\`/settings/classes/\${classId}/subjects\`);
export const updateClassSubjects = (classId, subjectIds) => put(\`/settings/classes/\${classId}/subjects\`, subjectIds);
`,

  'api/dashboard.js': `import { get } from './client';

export const getStats = () => get('/dashboard/stats');
export const getStudentsByClass = () => get('/dashboard/students-by-class');
export const getStudentsByBoard = () => get('/dashboard/students-by-board');
export const getRecentStudents = () => get('/dashboard/recent-students');
`,

  'context/ToastContext.jsx': `import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={\`flex items-center gap-3 min-w-[300px] p-4 rounded-lg shadow-lg bg-white border-l-4 transform transition-all duration-300 ease-out translate-x-0 opacity-100 \${
              toast.type === 'success' ? 'border-green-500' :
              toast.type === 'error' ? 'border-red-500' :
              'border-blue-500'
            }\`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            
            <span className="flex-1 text-sm font-medium text-gray-800">{toast.message}</span>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
`,

  'context/AuthContext.jsx': `import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getMe } from '../api/auth';
import { ROUTES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('access_token', data.access_token);
    setToken(data.access_token);
    const userData = await getMe();
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    window.location.href = ROUTES.LOGIN;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
`,

  'hooks/useAuth.js': `import { useAuth } from '../context/AuthContext';
export default useAuth;
`,

  'hooks/useFetch.js': `import { useState, useEffect, useCallback } from 'react';

export default function useFetch(fetchFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    let isMounted = true;
    
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchFn();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err.message || 'Something went wrong');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    run();
    
    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, isLoading, error, refetch: execute };
}
`,

  'hooks/useDebounce.js': `import { useState, useEffect } from 'react';

export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
`,

  'components/ui/Button.jsx': `import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'btn-primary bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'btn-secondary bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const classes = \`\${baseClasses} \${variants[variant]} \${sizes[size]} \${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} \${className}\`;

  return (
    <button
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
}
`,

  'components/ui/Input.jsx': `import React from 'react';

export default function Input({
  label,
  name,
  type = 'text',
  error,
  register,
  placeholder,
  disabled,
  className = '',
  ...rest
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        className={\`input-field w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 \${
          error 
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } \${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} \${className}\`}
        {...(register ? register(name) : {})}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error?.message || error}</p>
      )}
    </div>
  );
}
`,

  'components/ui/Select.jsx': `import React from 'react';

export default function Select({
  label,
  name,
  options = [],
  error,
  register,
  placeholder,
  disabled,
  className = '',
  ...rest
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={name}
        disabled={disabled}
        className={\`input-field w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 bg-white \${
          error 
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } \${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} \${className}\`}
        {...(register ? register(name) : {})}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error?.message || error}</p>
      )}
    </div>
  );
}
`,

  'components/ui/Checkbox.jsx': `import React from 'react';

export default function Checkbox({
  label,
  name,
  checked,
  onChange,
  disabled,
  className = '',
  register,
  ...rest
}) {
  const registerProps = register ? register(name) : {};
  
  return (
    <div className={\`flex items-center \${className}\`}>
      <input
        id={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
        {...registerProps}
        {...rest}
      />
      {label && (
        <label htmlFor={name} className="ml-2 text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
    </div>
  );
}
`,

  'components/ui/Card.jsx': `import React from 'react';

export default function Card({
  children,
  className = '',
  padding = 'md'
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={\`card bg-white rounded-lg shadow-sm border border-gray-200 \${paddings[padding]} \${className}\`}>
      {children}
    </div>
  );
}
`,

  'components/ui/Badge.jsx': `import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  className = ''
}) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${variants[variant]} \${className}\`}>
      {children}
    </span>
  );
}
`,

  'components/ui/Spinner.jsx': `import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({
  size = 'md',
  className = ''
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={\`flex justify-center items-center \${className}\`}>
      <Loader2 className={\`animate-spin text-blue-600 \${sizes[size]}\`} />
    </div>
  );
}
`,

  'components/ui/Table.jsx': `import React from 'react';
import Spinner from './Spinner';

export default function Table({
  columns = [],
  data = [],
  emptyMessage = 'No data found',
  loading = false,
  onRowClick,
  className = ''
}) {
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white border border-gray-200 rounded-lg">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={\`overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm \${className}\`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={\`\${onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : 'hover:bg-gray-50'}\`}
              >
                {columns.map((col, colIndex) => (
                  <td key={col.key || colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
`,

  'components/ui/Modal.jsx': `import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className={\`relative bg-white rounded-xl shadow-2xl w-full \${sizes[size]} transform transition-all flex flex-col max-h-[90vh]\`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
`,

  'components/ui/Pagination.jsx': `import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-1 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
          disabled={page === '...'}
          className={\`px-3 py-1.5 rounded-md text-sm font-medium \${
            page === currentPage
              ? 'bg-blue-600 text-white border border-blue-600'
              : page === '...'
              ? 'text-gray-500 cursor-default'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }\`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
`,

  'components/layout/Sidebar.jsx': `import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Students', path: ROUTES.STUDENTS, icon: Users },
    { name: 'Settings', path: ROUTES.SETTINGS, icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-blue-600">SMS</span>
          <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Student Management</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                \`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors \${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }\`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={\`w-5 h-5 mr-3 \${isActive ? 'text-blue-700' : 'text-gray-400'}\`} />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-400">v1.0</p>
      </div>
    </aside>
  );
}
`,

  'components/layout/Header.jsx': `import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex-1">
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block">
            {user?.name || 'Admin'}
          </span>
        </div>

        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
`,

  'components/layout/PageHeader.jsx': `import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && (
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {action}
        </div>
      )}
    </div>
  );
}
`,

  'components/shared/ProtectedRoute.jsx': `import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import Spinner from '../ui/Spinner';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
`,

  'components/shared/SearchBar.jsx': `import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) {
  return (
    <div className={\`relative \${className}\`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
      />
    </div>
  );
}
`,

  'components/shared/ConfirmDialog.jsx': `import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="mt-2">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
`,

  'components/shared/EmptyState.jsx': `import React from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  message,
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-dashed border-gray-300 h-64">
      {Icon && <Icon className="w-12 h-12 text-gray-300 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
`,

  'components/shared/ErrorBoundary.jsx': `import React from 'react';
import Button from '../ui/Button';
import { AlertOctagon } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred. Please try reloading the page.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="primary">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
`,

  'layouts/AuthLayout.jsx': `import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import Spinner from '../components/ui/Spinner';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">SMS Login</h2>
          <p className="mt-2 text-sm text-gray-600">Student Management System</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
`,

  'layouts/MainLayout.jsx': `import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`,

  'pages/LoginPage.jsx': `import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      showToast('Logged in successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="admin@example.com"
          register={register}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          register={register}
          error={errors.password}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
      >
        Sign in
      </Button>
    </form>
  );
}
`,

  'pages/NotFoundPage.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-9xl font-extrabold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="primary">Go to Dashboard</Button>
      </Link>
    </div>
  );
}
`,

  'main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,

  'App.jsx': `import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/shared/ErrorBoundary';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Placeholders
const DashboardPage = () => <div className="p-4 bg-white rounded shadow">Dashboard Placeholder</div>;
const StudentsPage = () => <div className="p-4 bg-white rounded shadow">Students Placeholder</div>;
const StudentForm = () => <div className="p-4 bg-white rounded shadow">Student Form Placeholder</div>;
const StudentDetail = () => <div className="p-4 bg-white rounded shadow">Student Detail Placeholder</div>;
const SettingsPage = () => <div className="p-4 bg-white rounded shadow">Settings Placeholder</div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'students',
            element: <StudentsPage />,
          },
          {
            path: 'students/new',
            element: <StudentForm />,
          },
          {
            path: 'students/:id',
            element: <StudentDetail />,
          },
          {
            path: 'students/:id/edit',
            element: <StudentForm />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
`
};

for (const [relativePath, content] of Object.entries(files)) {
  const fullPath = path.join(srcDir, relativePath);
  const dirName = path.dirname(fullPath);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim() + '\\n', 'utf8');
}

// Delete default Vite files
const appCssPath = path.join(srcDir, 'App.css');
const indexCssPath = path.join(srcDir, 'index.css');

if (fs.existsSync(appCssPath)) fs.unlinkSync(appCssPath);
if (fs.existsSync(indexCssPath)) fs.unlinkSync(indexCssPath);

console.log('All files created successfully.');
