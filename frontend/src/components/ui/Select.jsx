import React, { forwardRef } from 'react';

const Select = forwardRef(function Select({
  label,
  name,
  options = [],
  error,
  register,
  placeholder,
  disabled,
  className = '',
  ...rest
}, ref) {
  const selectName = name || rest.name;
  const registration = typeof register === 'function' && selectName ? register(selectName) : {};
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectName} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectName}
        name={selectName}
        disabled={disabled}
        className={`input-field w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 bg-white ${
          error 
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${className}`}
        {...registration}
        {...rest}
        ref={ref || registration.ref}
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
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
});

export default Select;
