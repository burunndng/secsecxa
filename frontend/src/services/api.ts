const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  parseJson?: boolean;
}

export class ApiError<T = unknown> extends Error {
  constructor(
    public status: number,
    public data: T,
    message?: string
  ) {
    super(message || (typeof data === 'object' && data !== null && 'message' in data ? String((data as any).message) : 'Request failed'));
    this.name = 'ApiError';
  }
}

type RefreshHandler = () => Promise<string | null>;

let accessToken: string | null = null;
let refreshHandler: RefreshHandler | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setRefreshTokenHandler(handler: RefreshHandler | null) {
  refreshHandler = handler;
}

function resolveUrl(endpoint: string) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint}`;
}

async function parseResponse<T>(response: Response, parseJson: boolean) {
  if (response.status === 204 || !parseJson) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as unknown as T;
}

async function makeRequest<T>(endpoint: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const {
    requiresAuth = true,
    parseJson = true,
    headers: customHeaders,
    body,
    ...rest
  } = options;

  const headers = new Headers(customHeaders);

  if (!(body instanceof FormData) && body !== undefined && body !== null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept') && parseJson) {
    headers.set('Accept', 'application/json');
  }

  if (requiresAuth && accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const finalBody = body instanceof FormData || typeof body === 'string' || body === undefined ? body : JSON.stringify(body);

  const response = await fetch(resolveUrl(endpoint), {
    ...rest,
    credentials: rest.credentials ?? 'include',
    headers,
    body: finalBody,
  });

  if (response.status === 401 && requiresAuth && refreshHandler && retry) {
    const newToken = await refreshHandler();
    if (newToken) {
      setAccessToken(newToken);
      return makeRequest(endpoint, options, false);
    }
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.clone().json();
    } catch {
      try {
        errorData = await response.clone().text();
      } catch {
        errorData = { message: response.statusText };
      }
    }
    throw new ApiError(response.status, errorData);
  }

  return parseResponse<T>(response, parseJson);
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    makeRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    makeRequest<T>(endpoint, { ...options, method: 'POST', body: data }),
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    makeRequest<T>(endpoint, { ...options, method: 'PUT', body: data }),
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    makeRequest<T>(endpoint, { ...options, method: 'PATCH', body: data }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    makeRequest<T>(endpoint, { ...options, method: 'DELETE' }),
  getBaseUrl: () => API_BASE_URL,
};
