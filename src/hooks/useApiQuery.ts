import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/context';

export function useApiQuery<T>(load: (signal: AbortSignal) => Promise<T>, keepDataOnRetry = false, enabled = true) {
  const { logout } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ data: T | null; error: string; loading: boolean; initialLoading: boolean }>({ data: null, error: '', loading: true, initialLoading: true });
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void Promise.resolve().then(async () => {
      if (controller.signal.aborted) return;
      setState(current => ({ ...current, data: keepDataOnRetry ? current.data : null, error: '', loading: true }));
      try {
        const data = await load(controller.signal);
        if (!controller.signal.aborted) setState({ data, error: '', loading: false, initialLoading: false });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) logout();
        else setState({ data: null, error: error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.', loading: false, initialLoading: false });
      }
    });
    return () => controller.abort();
  }, [load, attempt, logout, keepDataOnRetry, enabled]);
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  const updateData = useCallback((update: (current: T | null) => T | null) => {
    setState(current => ({ ...current, data: update(current.data) }));
  }, []);
  return { ...state, retry, updateData };
}
