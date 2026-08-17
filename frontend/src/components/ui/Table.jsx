import React from 'react';
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
    <div className={`overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
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
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : 'hover:bg-gray-50'}`}
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
}\n