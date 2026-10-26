import React from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  message,
  description,
  action
}) {
  const desc = message || description;
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-dashed border-gray-300 h-64">
      {Icon && (React.isValidElement(Icon) ? Icon : <Icon className="w-12 h-12 text-gray-300 mb-4" />)}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {desc && <p className="text-sm text-gray-500 max-w-sm mb-6">{desc}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
