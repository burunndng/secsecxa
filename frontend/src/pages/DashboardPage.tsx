import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toolService } from '@/services/tools';
import { Button } from '@/components/Button';
import type { Tool } from '@/types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const fetchedTools = await toolService.getTools();
      setTools(fetchedTools);
    } catch (err: any) {
      setError(err.message || 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const groupToolsByCategory = (): Record<string, Tool[]> => {
    return tools.reduce((acc, tool) => {
      const category = tool.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);
  };

  const handleToolClick = (tool: Tool) => {
    navigate(`/tools/${tool.id}`);
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

  const categorizedTools = groupToolsByCategory();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Toolkit Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">Hello, {user?.username}!</span>
              <Button variant="secondary" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {Object.entries(categorizedTools).map(([category, categoryTools]) => (
          <section key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{category}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition cursor-pointer border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      {tool.icon && (
                        <div className="flex-shrink-0">
                          <span className="text-3xl">{tool.icon}</span>
                        </div>
                      )}
                      <div className={tool.icon ? 'ml-5' : ''}>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{tool.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3">
                    <div className="text-sm">
                      <span className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-500">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {tools.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No tools available at the moment.</p>
          </div>
        )}
      </main>
    </div>
  );
}
