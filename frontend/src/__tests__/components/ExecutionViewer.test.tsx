import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ExecutionViewer } from '../../components/ExecutionViewer';
import { toolService } from '../../services/tools';

vi.mock('../../services/tools', () => ({
  toolService: {
    subscribeToJob: vi.fn(),
  },
}));

describe('ExecutionViewer', () => {
  const callbacks: Array<(event: any) => void> = [];

  beforeEach(() => {
    callbacks.length = 0;
    vi.mocked(toolService.subscribeToJob).mockImplementation((toolId, jobId, callback) => {
      callbacks.push(callback);
      return () => {};
    });
  });

  it('renders initial state', () => {
    render(<ExecutionViewer toolId="tool-id" jobId="job-id" />);

    expect(screen.getByText(/execution status/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it('updates status and logs based on stream events', () => {
    render(<ExecutionViewer toolId="tool-id" jobId="job-id" />);

    expect(toolService.subscribeToJob).toHaveBeenCalledWith(
      'tool-id',
      'job-id',
      expect.any(Function)
    );

    const eventCallback = callbacks[0];

    act(() => {
      eventCallback({ type: 'progress', progress: 50 });
    });
    expect(screen.getByText(/running/i)).toBeInTheDocument();

    act(() => {
      eventCallback({ type: 'stdout', message: 'Processing...' });
    });
    expect(screen.getByText(/processing/i)).toBeInTheDocument();

    act(() => {
      eventCallback({ type: 'complete', data: { result: 'success' } });
    });
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /result/i })).toBeInTheDocument();
  });
});
