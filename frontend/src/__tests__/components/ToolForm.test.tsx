import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolForm } from '../../components/ToolForm';
import type { Tool } from '../../types';

const mockTool: Tool = {
  id: 'test-tool',
  name: 'Test Tool',
  description: 'A test tool',
  category: 'Testing',
  parameters: [
    {
      name: 'input',
      type: 'string',
      required: true,
      description: 'Test input',
    },
    {
      name: 'count',
      type: 'number',
      required: false,
      default: 1,
      validation: {
        min: 1,
        max: 10,
      },
    },
  ],
};

describe('ToolForm', () => {
  it('renders tool name and description', () => {
    const handleSubmit = vi.fn();
    render(<ToolForm tool={mockTool} onSubmit={handleSubmit} />);

    expect(screen.getByText('Test Tool')).toBeInTheDocument();
    expect(screen.getByText('A test tool')).toBeInTheDocument();
  });

  it('renders form fields based on tool parameters', () => {
    const handleSubmit = vi.fn();
    render(<ToolForm tool={mockTool} onSubmit={handleSubmit} />);

    expect(screen.getByLabelText(/input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/count/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const handleSubmit = vi.fn();
    render(<ToolForm tool={mockTool} onSubmit={handleSubmit} />);

    const submitButton = screen.getByRole('button', { name: /run tool/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn();
    render(<ToolForm tool={mockTool} onSubmit={handleSubmit} />);

    const inputField = screen.getByLabelText(/input/i);
    await userEvent.type(inputField, 'test value');

    const submitButton = screen.getByRole('button', { name: /run tool/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'test value',
          count: 1,
        })
      );
    });
  });
});
