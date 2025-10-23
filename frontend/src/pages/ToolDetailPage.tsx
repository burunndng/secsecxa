import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toolService } from '@/services/tools';
import { Button } from '@/components/Button';
import { ToolForm } from '@/components/ToolForm';
import { ExecutionViewer } from '@/components/ExecutionViewer';
import { ToolHistoryTable } from '@/components/ToolHistoryTable';
import type { Tool, ToolExecution } from '@/types';

export function ToolDetailPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [history, setHistory] = useState<ToolExecution[]>([]);

  const loadToolDetails = useCallback(async () => {
    if (!toolId) return;
    try {
      const tools = await toolService.getTools();
      const selectedTool = tools.find((toolItem) => toolItem.id === toolId);
      if (!selectedTool) {
        setError('Tool not found');
        return;
      }
      setTool(selectedTool);
      const historyResponse = await toolService.getHistory(toolId);
      setHistory(historyResponse.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load tool details');
    } finally {
      setLoading(false);
    }
  }, [toolId]);

  useEffect(() => {
    loadToolDetails();
  }, [loadToolDetails]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!toolId) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await toolService.submitJob(toolId, data);
      setActiveJobId(response.jobId);
      await refreshHistory();
    } catch (err: any) {
      setError(err.message || 'Failed to submit job');
    } finally {
      setSubmitting(false);
    }
  };

  const refreshHistory = async () => {
    if (!toolId) return;
    const historyResponse = await toolService.getHistory(toolId);
    setHistory(historyResponse.items);
  };

  const handleExecutionSelect = (execution: ToolExecution) => {
    setActiveJobId(execution.id);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Tool not found</h1>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-primary-600 hover:text-primary-500 font-medium flex items-center"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">{user?.username}</span>
              <Button variant="secondary" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <ToolForm tool={tool} onSubmit={handleSubmit} loading={submitting} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeJobId ? (
              <ExecutionViewer
                toolId={tool.id}
                jobId={activeJobId}
                onComplete={refreshHistory}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                  Submit the form to start a new job and monitor its progress here.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Execution History</h2>
            <Button variant="ghost" onClick={refreshHistory}>
              Refresh
            </Button>
          </div>
          <ToolHistoryTable executions={history} onSelect={handleExecutionSelect} />
        </div>
      </main>
    </div>
  );
}
