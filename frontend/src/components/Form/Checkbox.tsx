import React, { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  helperText?: string;
}

export function Checkbox({ label, helperText, className = '', id, ...props }: CheckboxProps) {
  const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...props}
        />
      </div>
      <div className="text-sm">
        <label htmlFor={checkboxId} className="font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {helperText && <p className="text-gray-500 dark:text-gray-400 mt-1">{helperText}</p>}
      </div>
    </div>
  );
}
