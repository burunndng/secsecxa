import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../../pages/DashboardPage';
import { toolService } from '../../services/tools';
import * as authContext from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/tools', () => ({
  toolService: {
    getTools: vi.fn(),
  },
}));

describe('DashboardPage', () => {
  const mockUser = { id: '1', email: 'user@example.com', username: 'ExampleUser' };
  const mockLogout = vi.fn();
  const getToolsMock = vi.spyOn(toolService, 'getTools');

  beforeEach(() => {
    vi.clearAllMocks();

    (authContext.useAuth as unknown as vi.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    getToolsMock.mockResolvedValue([
      {
        id: 'scanner',
        name: 'Vulnerability Scanner',
        description: 'Scans for vulnerabilities.',
        category: 'Security',
        parameters: [],
      },
      {
        id: 'formatter',
        name: 'Log Formatter',
        description: 'Formats logs.',
        category: 'Utilities',
        parameters: [],
      },
    ]);
  });

  it('renders tool categories and tools', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Utilities')).toBeInTheDocument();
    });

    expect(screen.getByText('Vulnerability Scanner')).toBeInTheDocument();
    expect(screen.getByText('Log Formatter')).toBeInTheDocument();
  });
});
