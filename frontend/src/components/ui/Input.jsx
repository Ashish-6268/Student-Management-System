import React, { forwardRef } from 'react';

const Input = forwardRef(function Input({
  label,
  name,
  type = 'text',
  error,
  register,
  placeholder,
  disabled,
  className = '',
  ...rest
}, ref) {
  const inputName = name || rest.name;
  const registration = typeof register === 'function' && inputName ? register(inputName) : {};
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputName} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputName}
        name={inputName}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        className={`input-field w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
          error 
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${className}`}
        {...registration}
        {...rest}
        ref={ref || registration.ref}
      />
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
});

export default Input;
