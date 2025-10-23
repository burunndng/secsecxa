import React from 'react';
import type { ToolExecution } from '@/types';

interface ToolHistoryTableProps {
  executions: ToolExecution[];
  onSelect: (execution: ToolExecution) => void;
}

export function ToolHistoryTable({ executions, onSelect }: ToolHistoryTableProps) {
  if (executions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No executions yet. Run the tool to see the history here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job ID
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Completed
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Parameters
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {executions.map((execution) => (
            <tr
              key={execution.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(execution)}
            >
              <td className="px-4 py-4 text-sm font-medium text-primary-600">
                {execution.id}
              </td>
              <td className="px-4 py-4 text-sm">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    execution.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : execution.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {execution.status}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">
                {new Date(execution.startedAt).toLocaleString()}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">
                {execution.completedAt ? new Date(execution.completedAt).toLocaleString() : '—'}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(execution.parameters, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
