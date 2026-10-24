export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: Record<string, string>;

  constructor(message: string, status: number, code?: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensures HTTP-only session cookies are sent and received
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network connection to BookMyStudio API failed.';
    throw new ApiError(message, 0, 'NETWORK_ERROR');
  }

  let data: Record<string, unknown> | null = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = (await response.json()) as Record<string, unknown>;
    } catch {
      data = null;
    }
  } else {
    const text = await response.text();
    data = { text };
  }

  if (!response.ok) {
    const errorMessage =
      (data?.error as string) ||
      (data?.message as string) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(
      errorMessage,
      response.status,
      data?.code as string | undefined,
      data?.details as Record<string, string> | undefined
    );
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
