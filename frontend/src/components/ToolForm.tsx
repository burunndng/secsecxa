import React, { useState, FormEvent } from 'react';
import { Input } from './Form/Input';
import { TextArea } from './Form/TextArea';
import { Select } from './Form/Select';
import { Checkbox } from './Form/Checkbox';
import { FileInput } from './Form/FileInput';
import { Button } from './Button';
import type { Tool, ToolParameter } from '@/types';

interface ToolFormProps {
  tool: Tool;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  loading?: boolean;
}

export function ToolForm({ tool, onSubmit, loading = false }: ToolFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initialData: Record<string, unknown> = {};
    tool.parameters.forEach((param) => {
      if (param.default !== undefined && param.default !== null) {
        initialData[param.name] = param.default;
        return;
      }

      if (param.type === 'boolean') {
        initialData[param.name] = false;
      } else if (param.type === 'number') {
        initialData[param.name] = '';
      } else if (param.type === 'select' && param.options?.length) {
        const [firstOption] = param.options;
        initialData[param.name] =
          typeof firstOption === 'string' ? firstOption : firstOption.value;
      } else if (param.type === 'file') {
        initialData[param.name] = null;
      } else {
        initialData[param.name] = '';
      }
    });
    return initialData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (param: ToolParameter, value: unknown): string | null => {
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      (param.type === 'file' && !(value instanceof File));

    if (param.required && isEmpty) {
      return `${param.label || param.name} is required`;
    }

    if (isEmpty || !param.validation) {
      return null;
    }

    const { validation } = param;
    const stringValue = typeof value === 'string' ? value : String(value);

    if (validation.min !== undefined && param.type === 'number') {
      const numValue = Number(value);
      if (!Number.isNaN(numValue) && numValue < validation.min) {
        return validation.message || `Minimum value is ${validation.min}`;
      }
    }

    if (validation.max !== undefined && param.type === 'number') {
      const numValue = Number(value);
      if (!Number.isNaN(numValue) && numValue > validation.max) {
        return validation.message || `Maximum value is ${validation.max}`;
      }
    }

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(stringValue)) {
        return validation.message || 'Invalid format';
      }
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    tool.parameters.forEach((param) => {
      const error = validateField(param, formData[param.name]);
      if (error) {
        newErrors[param.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit(formData);
  };

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const normalizeOptions = (options: ToolParameter['options']): Array<{ value: string; label: string }> => {
    if (!options) return [];
    return options.map((opt) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );
  };

  const renderField = (param: ToolParameter) => {
    const commonProps = {
      required: param.required,
      error: errors[param.name],
      helperText: param.description,
    };

    const label = param.label || param.name;

    switch (param.type) {
      case 'text':
        return (
          <TextArea
            key={param.name}
            label={label}
            placeholder={param.placeholder}
            value={String(formData[param.name] || '')}
            onChange={(e) => handleChange(param.name, e.target.value)}
            {...commonProps}
          />
        );

      case 'select':
        return (
          <Select
            key={param.name}
            label={label}
            value={String(formData[param.name] || '')}
            options={normalizeOptions(param.options)}
            onChange={(e) => handleChange(param.name, e.target.value)}
            {...commonProps}
          />
        );

      case 'boolean':
        return (
          <Checkbox
            key={param.name}
            label={label}
            checked={Boolean(formData[param.name])}
            onChange={(e) => handleChange(param.name, e.target.checked)}
            helperText={param.description}
          />
        );

      case 'file':
        return (
          <FileInput
            key={param.name}
            label={label}
            onFileChange={(file) => handleChange(param.name, file)}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <Input
            key={param.name}
            type="number"
            label={label}
            placeholder={param.placeholder}
            value={String(formData[param.name] ?? '')}
            onChange={(e) => {
              const numericValue = e.target.valueAsNumber;
              handleChange(
                param.name,
                Number.isNaN(numericValue) ? e.target.value : numericValue
              );
            }}
            min={param.validation?.min}
            max={param.validation?.max}
            {...commonProps}
          />
        );

      default:
        return (
          <Input
            key={param.name}
            type="text"
            label={label}
            placeholder={param.placeholder}
            value={String(formData[param.name] || '')}
            onChange={(e) => handleChange(param.name, e.target.value)}
            {...commonProps}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tool.name}</h2>
      {tool.description && <p className="text-gray-600 dark:text-gray-400 mb-6">{tool.description}</p>}
      
      {tool.parameters.map(renderField)}
      
      <div className="flex justify-end pt-4">
        <Button type="submit" loading={loading} disabled={loading}>
          Run Tool
        </Button>
      </div>
    </form>
  );
}
