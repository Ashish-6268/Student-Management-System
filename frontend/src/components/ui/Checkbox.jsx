import React from 'react';

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
    <div className={`flex items-center ${className}`}>
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
}\n