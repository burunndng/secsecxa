export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  parameters: ToolParameter[];
}

export interface ToolParameter {
  name: string;
  label?: string;
  placeholder?: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'text' | 'file';
  required: boolean;
  description?: string;
  default?: any;
  options?: Array<string | { label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ToolExecution {
  id: string;
  toolId: string;
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  stream?: 'stdout' | 'stderr';
}

export interface ExecutionProgress {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  logs: ExecutionLog[];
  result?: any;
  error?: string;
}

export interface ToolCategory {
  name: string;
  description: string;
  tools: Tool[];
}
