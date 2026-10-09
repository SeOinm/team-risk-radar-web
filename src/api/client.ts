import { AuthApiError as ApiError, API_BASE_URL } from './auth.ts';
import { sessionStore } from '../auth/session.ts';
export { ApiError };

export function createApiClient(baseUrl: string, getToken: () => string | undefined, fetcher: typeof fetch = fetch) {
  return async (path: string, options: { method?: string; body?: unknown; signal?: AbortSignal; public?: boolean } = {}): Promise<unknown> => {
    const token = options.public ? undefined : getToken();
    if (!token && !options.public) throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다.');
    let response: Response;
    try {
      response = await fetcher(`${baseUrl.replace(/\/+$/, '')}${path}`, {
        method: options.method ?? 'GET',
        headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        credentials: 'omit', cache: 'no-store',
        signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000),
      });
    } catch (error) {
      if (options.signal?.aborted) throw error;
      throw new ApiError(0, 'NETWORK_ERROR', '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const fields: Record<string, string> = {};
      if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
        for (const [key, value] of Object.entries(data.fieldErrors)) if (typeof value === 'string') fields[key] = value;
      }
      throw new ApiError(response.status, typeof data?.code === 'string' ? data.code : `HTTP_${response.status}`, typeof data?.message === 'string' ? data.message : '요청을 처리하지 못했습니다.', fields);
    }
    return data;
  };
}
export const apiRequest = createApiClient(API_BASE_URL, () => sessionStore.read()?.accessToken);
