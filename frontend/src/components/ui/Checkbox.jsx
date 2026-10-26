import React, { forwardRef } from 'react';

const Checkbox = forwardRef(function Checkbox({
  label,
  name,
  checked,
  onChange,
  disabled,
  className = '',
  register,
  ...rest
}, ref) {
  const checkboxName = name || rest.name;
  const registerProps = register && typeof register === 'function' ? register(checkboxName) : {};

  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={checkboxName}
        name={checkboxName}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
        {...registerProps}
        {...rest}
        ref={ref || registerProps.ref}
      />
      {label && (
        <label htmlFor={checkboxName} className="ml-2 text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
    </div>
  );
});

export default Checkbox;
