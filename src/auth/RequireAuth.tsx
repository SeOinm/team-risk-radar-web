import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './context';
import { Btn } from '@/components/ds';

export function RequireAuth() {
  const { status, error, retry, logout } = useAuth();
  const location = useLocation();
  if (status === 'checking')
    return (
      <p role="status" className="p-8 text-sm text-[#6B7280]">
        로그인 정보를 확인하고 있습니다…
      </p>
    );
  if (status === 'error')
    return (
      <div className="p-8 space-y-3">
        <p role="alert" className="text-sm text-[#DC2626]">
          {error}
        </p>
        <Btn onClick={() => void retry()}>다시 시도</Btn>{' '}
        <Btn onClick={logout}>로그인 화면으로</Btn>
      </div>
    );
  if (status !== 'authenticated')
    return (
      <Navigate
        to="/auth"
        state={{ from: location.pathname + location.search + location.hash }}
        replace
      />
    );
  return <Outlet />;
}
