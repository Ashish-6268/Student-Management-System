import React from 'react';

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
    <div className={`card bg-white rounded-lg shadow-sm border border-gray-200 ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}
