import { useCallback, type ReactNode } from 'react';
import { projectsApi, type ProjectResponse } from '@/api/projects';
import { useApiQuery } from '@/hooks/useApiQuery';
import { Btn, NavBack } from '@/components/ds';

export function ProjectLoader({ id, children }: { id: string; children: (project: ProjectResponse, reload: () => void) => ReactNode }) {
  const load = useCallback((signal: AbortSignal) => projectsApi.detail(id, signal), [id]);
  const { data, loading, error, retry } = useApiQuery(load);
  if (loading || error || !data || String(data.id) !== id) return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-border"><NavBack fallback="/projects" /></header>
      <main className="max-w-2xl mx-auto p-6 space-y-3">
        {error ? <><p role="alert">{error}</p><Btn onClick={retry}>다시 시도</Btn></> : <p role="status">프로젝트를 불러오고 있습니다…</p>}
      </main>
    </div>
  );
  return children(data, retry);
}
