import React from 'react';

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
        className={`input-field w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
          error 
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${className}`}
        {...(register ? register(name) : {})}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error?.message || error}</p>
      )}
    </div>
  );
}\n