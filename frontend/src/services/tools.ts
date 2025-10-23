import { api, getAccessToken } from './api';
import type { Tool, ToolExecution, ExecutionLog } from '@/types';

type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ToolJobResponse {
  jobId: string;
  status: JobStatus;
  submittedAt: string;
}

export interface ToolHistoryFilters {
  status?: JobStatus | 'all';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ToolHistoryResponse {
  total: number;
  items: ToolExecution[];
}

export interface ExecutionStreamEvent {
  type: 'log' | 'stdout' | 'stderr' | 'progress' | 'complete' | 'error';
  message?: string;
  data?: unknown;
  progress?: number;
  timestamp?: string;
  stream?: 'stdout' | 'stderr';
}

export const toolService = {
  getTools(): Promise<Tool[]> {
    return api.get<Tool[]>('/tools');
  },

  submitJob(toolId: string, payload: Record<string, unknown | File>): Promise<ToolJobResponse> {
    const hasFile = Object.values(payload).some((value) => value instanceof File);

    if (hasFile) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, String(item)));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      return api.post<ToolJobResponse>(`/tools/${toolId}/jobs`, formData, {
        headers: {
          // Content-Type will be set automatically by browser when using FormData
        },
      });
    }

    return api.post<ToolJobResponse>(`/tools/${toolId}/jobs`, payload);
  },

  getHistory(toolId: string, filters: ToolHistoryFilters = {}): Promise<ToolHistoryResponse> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters.search) {
      params.set('search', filters.search);
    }
    if (filters.limit) {
      params.set('limit', filters.limit.toString());
    }
    if (filters.offset) {
      params.set('offset', filters.offset.toString());
    }

    const query = params.toString();
    const endpoint = query ? `/tools/${toolId}/jobs?${query}` : `/tools/${toolId}/jobs`;
    return api.get<ToolHistoryResponse>(endpoint);
  },

  subscribeToJob(
    toolId: string,
    jobId: string,
    onEvent: (event: ExecutionStreamEvent) => void,
  ): () => void {
    const baseUrl = api.getBaseUrl();
    const token = getAccessToken();
    const normalizedBase = baseUrl.startsWith('http')
      ? baseUrl.replace(/\/$/, '')
      : `${window.location.origin}${baseUrl.startsWith('/') ? '' : '/'}${baseUrl}`.replace(/\/$/, '');

    let streamUrl = `${normalizedBase}/tools/${toolId}/jobs/${jobId}/stream`;

    if (token) {
      const separator = streamUrl.includes('?') ? '&' : '?';
      streamUrl = `${streamUrl}${separator}access_token=${encodeURIComponent(token)}`;
    }

    const eventSource = new EventSource(streamUrl, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const payload: ExecutionStreamEvent = JSON.parse(event.data);
        onEvent(payload);
      } catch (error) {
        console.error('Failed to parse stream event', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Stream error', error);
      onEvent({ type: 'error', message: 'Stream connection lost' });
      eventSource.close();
    };

    return () => eventSource.close();
  },
};
