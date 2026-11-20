import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { matchPath, Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './context';
import { ProjectLoadingScreen } from "@/components/ProjectLoader";
import { Btn } from '@/components/ds';

export function RequireAuth() {
  const { status, error, retry, logout } = useAuth();
  const location = useLocation();
  if (status === 'checking') {
    const isProjectBoard = ['/projects/:projectId', '/projects/:projectId/tasks', '/projects/:projectId/calendar']
      .some(path => matchPath(path, location.pathname));
    return isProjectBoard
      ? <ProjectLoadingScreen />
      : <LoadingSkeleton label="로그인 정보 확인" className="mx-auto max-w-5xl px-6 py-8" />;
  }
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
