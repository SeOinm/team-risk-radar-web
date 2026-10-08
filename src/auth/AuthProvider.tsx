import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  authApi,
  AuthApiError,
  type LoginRequest,
  type UserResponse,
} from '@/api/auth';
import { AuthContext, type AuthStatus } from './context';
import { sessionStore, type AuthSession } from './session';

interface AuthState {
  status: AuthStatus;
  user: UserResponse | null;
  session: AuthSession | null;
  error: string;
  notice: string;
}
const anonymous: AuthState = {
  status: 'anonymous',
  user: null,
  session: null,
  error: '',
  notice: '',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const session = sessionStore.read();
    return {
      ...anonymous,
      session,
      status: session ? 'checking' : 'anonymous',
    };
  });
  const revision = useRef(0);
  const request = useRef<AbortController | null>(null);

  const clearSession = useCallback((notice = '') => {
    revision.current++;
    request.current?.abort();
    sessionStore.clear();
    setState({ ...anonymous, notice });
  }, []);

  const restore = useCallback(async () => {
    const current = ++revision.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const session = sessionStore.read();
    // Defer updates so StrictMode's cancelled initialization cannot overwrite a new session.
    await Promise.resolve();
    if (current !== revision.current) return;
    if (!session) {
      setState(anonymous);
      return;
    }
    setState({ ...anonymous, session, status: 'checking' });
    try {
      const user = await authApi.me(session.accessToken, controller.signal);
      if (current !== revision.current) return;
      if (session.expiresAt <= Date.now()) {
        clearSession('로그인이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }
      setState({ ...anonymous, session, user, status: 'authenticated' });
    } catch (error) {
      if (current !== revision.current || controller.signal.aborted) return;
      if (error instanceof AuthApiError && error.status === 401) {
        clearSession('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        setState({
          ...anonymous,
          session,
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : '로그인 정보를 확인하지 못했습니다.',
        });
      }
    }
  }, [clearSession]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return restore();
    });
    return () => {
      active = false;
      request.current?.abort();
    };
  }, [restore]);

  const login = useCallback(async (input: LoginRequest) => {
    const current = ++revision.current;
    request.current?.abort();
    sessionStore.clear();
    setState(anonymous);
    const controller = new AbortController();
    request.current = controller;
    const response = await authApi.login(input, controller.signal);
    if (current !== revision.current) return;
    const session = {
      accessToken: response.accessToken,
      expiresAt: Date.now() + response.expiresIn * 1000,
    };
    sessionStore.save(session);
    setState({
      ...anonymous,
      session,
      user: response.user,
      status: 'authenticated',
    });
  }, []);

  // A timer covers active tabs, visibility/focus covers suspended background tabs.
  useEffect(() => {
    if (!state.session) return;
    const expiresAt = state.session.expiresAt;
    const expire = () => {
      if (Date.now() >= expiresAt)
        clearSession('로그인이 만료되었습니다. 다시 로그인해주세요.');
    };
    const timer = setTimeout(
      expire,
      Math.min(Math.max(expiresAt - Date.now(), 0), 2_147_483_647),
    );
    window.addEventListener('focus', expire);
    document.addEventListener('visibilitychange', expire);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', expire);
      document.removeEventListener('visibilitychange', expire);
    };
  }, [state.session, clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        status: state.status,
        error: state.error,
        notice: state.notice,
        login,
        logout: () => clearSession(),
        retry: restore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
