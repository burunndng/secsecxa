import React, { InputHTMLAttributes, useState, forwardRef, useRef, useImperativeHandle } from 'react';

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  onFileChange?: (file: File | null) => void;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ label, error, helperText, className = '', id, onFileChange, ...props }, ref) => {
    const [fileName, setFileName] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);

    const fileInputId = id || `file-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFileName(file?.name || '');
      onFileChange?.(file);
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={fileInputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center space-x-2">
          <label
            htmlFor={fileInputId}
            className={`
              px-4 py-2 border rounded-md cursor-pointer inline-block
              bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary-500
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${className}
            `}
          >
            <span className="text-sm text-gray-700">Choose file</span>
            <input
              ref={inputRef}
              id={fileInputId}
              type="file"
              className="sr-only"
              onChange={handleChange}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${fileInputId}-error` : helperText ? `${fileInputId}-helper` : undefined}
              {...props}
            />
          </label>
          {fileName && (
            <span className="text-sm text-gray-600 truncate max-w-xs">{fileName}</span>
          )}
        </div>
        {error && (
          <p id={`${fileInputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${fileInputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
