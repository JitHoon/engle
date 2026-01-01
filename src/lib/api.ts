// API 유틸리티 함수

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

// 기본 fetch 래퍼
export async function fetcher<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  // URL 파라미터 추가
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

// GET 요청
export function get<T>(endpoint: string, params?: Record<string, string>) {
  return fetcher<T>(endpoint, { method: 'GET', params });
}

// POST 요청
export function post<T>(endpoint: string, data?: unknown) {
  return fetcher<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT 요청
export function put<T>(endpoint: string, data?: unknown) {
  return fetcher<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// PATCH 요청
export function patch<T>(endpoint: string, data?: unknown) {
  return fetcher<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// DELETE 요청
export function del<T>(endpoint: string) {
  return fetcher<T>(endpoint, { method: 'DELETE' });
}
