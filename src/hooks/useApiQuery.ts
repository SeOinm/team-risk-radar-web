import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/context';

export function useApiQuery<T>(load: (signal: AbortSignal) => Promise<T>) {
  const { logout } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ data: T | null; error: string; loading: boolean }>({ data: null, error: '', loading: true });
  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(async () => {
      if (controller.signal.aborted) return;
      setState({ data: null, error: '', loading: true });
      try {
        const data = await load(controller.signal);
        if (!controller.signal.aborted) setState({ data, error: '', loading: false });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) logout();
        else setState({ data: null, error: error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.', loading: false });
      }
    });
    return () => controller.abort();
  }, [load, attempt, logout]);
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  return { ...state, retry };
}
