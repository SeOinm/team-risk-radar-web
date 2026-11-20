import { useCallback, type ReactNode } from 'react';
import { projectsApi, type ProjectResponse } from '@/api/projects';
import { useApiQuery } from '@/hooks/useApiQuery';
import { Btn, NavBack } from '@/components/ds';

export function ProjectLoader({ id, pending = false, children }: { id: string; pending?: boolean; children: (project: ProjectResponse, reload: () => void) => ReactNode }) {
  const load = useCallback((signal: AbortSignal) => projectsApi.detail(id, signal), [id]);
  const { data, loading, error, retry } = useApiQuery(load);
  if (error) return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-border"><NavBack fallback="/projects" /></header>
      <main className="mx-auto max-w-2xl space-y-3 p-6">
        <p role="alert">{error}</p><Btn onClick={retry}>다시 시도</Btn>
      </main>
    </div>
  );
  if (loading || pending || !data || String(data.id) !== id) return <ProjectLoadingScreen />;
  return children(data, retry);
}

export function ProjectLoadingScreen() {
  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-border"><NavBack fallback="/projects" /></header>
      <main className="mx-auto max-w-6xl space-y-6 p-6" aria-busy="true">
        <span className="sr-only" role="status">프로젝트 로딩 중</span>
        <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
          <div className="h-6 w-44 max-w-full rounded-md bg-muted" />
          <div className="h-48 rounded-xl border border-border bg-muted/60" />
        </div>
      </main>
    </div>
  );
}
