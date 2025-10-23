import React, { useEffect, useState, useRef } from 'react';
import { toolService, ExecutionStreamEvent } from '@/services/tools';
import type { ExecutionLog } from '@/types';

interface ExecutionViewerProps {
  toolId: string;
  jobId: string;
  onComplete?: () => void;
}

export function ExecutionViewer({ toolId, jobId, onComplete }: ExecutionViewerProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [status, setStatus] = useState<'pending' | 'running' | 'completed' | 'failed'>('pending');
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = toolService.subscribeToJob(
      toolId,
      jobId,
      (event: ExecutionStreamEvent) => {
        switch (event.type) {
          case 'log':
            if (event.message) {
              setLogs((prev) => [
                ...prev,
                {
                  timestamp: event.timestamp || new Date().toISOString(),
                  level: 'info',
                  message: event.message,
                },
              ]);
            }
            break;

          case 'stdout':
          case 'stderr':
            if (event.message) {
              setLogs((prev) => [
                ...prev,
                {
                  timestamp: event.timestamp || new Date().toISOString(),
                  level: event.type === 'stderr' ? 'error' : 'info',
                  message: event.message,
                  stream: event.type,
                },
              ]);
            }
            break;

          case 'progress':
            setStatus('running');
            if (typeof event.progress === 'number') {
              setProgress(event.progress);
            }
            break;

          case 'complete':
            setStatus('completed');
            setResult(event.data);
            setProgress(100);
            onComplete?.();
            break;

          case 'error':
            setStatus('failed');
            setError(event.message || 'An error occurred');
            break;
        }
      }
    );

    return () => unsubscribe();
  }, [toolId, jobId, onComplete]);

  useEffect(() => {
    if (logsEndRef.current && typeof logsEndRef.current.scrollIntoView === 'function') {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'running':
        return 'Running';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Execution Status</h3>
        <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
      </div>

      {status === 'running' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-400">Waiting for output...</div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`mb-1 ${
                log.level === 'error' || log.stream === 'stderr'
                  ? 'text-red-400'
                  : log.level === 'warn'
                  ? 'text-yellow-400'
                  : 'text-gray-100'
              }`}
            >
              <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-red-800 font-semibold mb-2">Error</h4>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h4 className="text-green-800 font-semibold mb-2">Result</h4>
          <pre className="text-green-700 text-sm overflow-x-auto whitespace-pre-wrap">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
