import { ProjectLoader } from '@/components/ProjectLoader';
import { projectsApi, type ProjectResponse } from '@/api/projects';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/context';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { X, AlertTriangle } from 'lucide-react';
import { sampleTasks } from '@/data/sampleData';
import { Btn, Divider, NavBack } from '@/components/ds';

export function ProjectClose() {
  const { projectId } = useParams();
  if (projectId) return <ProjectLoader key={projectId} id={projectId}>{(project, reload) => <CloseForm key={`${project.id}:${project.updatedAt}`} project={project} reload={reload} />}</ProjectLoader>;
  return <CloseForm />;
}

function CloseForm({ project, reload }: { project?: ProjectResponse; reload?: () => void }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const canClose = (!project || (project.myRole !== 'MEMBER' && project.status !== 'CLOSED')) && !locked;
  const settingsPath = project ? `/projects/${project.id}/settings` : '/settings';
  const [confirmed, setConfirmed] = useState(false);

  const close = async () => {
    if (!confirmed || !canClose || inFlight.current) return;
    if (!project) { navigate('/projects'); return; }
    inFlight.current = true; setBusy(true); setError('');
    try {
      await projectsApi.close(String(project.id));
      navigate('/projects', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) { logout(); return; }
        if ([403, 404, 409].includes(error.status)) setLocked(true);
      }
      setError(error instanceof Error ? error.message : '프로젝트를 종료하지 못했습니다.');
    } finally { inFlight.current = false; setBusy(false); }
  };

  const incompleteCount = sampleTasks.filter(t => t.status !== '완료' && t.status !== '취소').length;
  const unassignedCount = sampleTasks.filter(t => t.assignees.length === 0).length;

  const statusItems = project ? [
    { label: '미완료 작업', value: '연결 대기', note: '작업 정보 연결 후 확인할 수 있습니다', warn: false },
    { label: '미배정 작업', value: '연결 대기', note: '', warn: false },
    { label: '최근 체크인 누락', value: '통계 연동 보류', note: '', warn: false },
    { label: '취소된 작업', value: '연결 대기', note: '', warn: false },
  ] : [
    {
      label: '미완료 작업',
      value: `${incompleteCount}개`,
      note: incompleteCount > 0 ? '완료 또는 취소되지 않은 작업이 있습니다' : '모든 작업이 완료됐습니다',
      warn: incompleteCount > 0,
    },
    {
      label: '미배정 작업',
      value: `${unassignedCount}개`,
      note: unassignedCount > 0 ? '아직 담당자가 없는 작업이 있습니다' : '',
      warn: unassignedCount > 0,
    },
    { label: '최근 체크인 누락', value: '1명', note: '박서연이 2회 연속 체크인하지 않았습니다', warn: true },
    { label: '취소된 작업', value: '0개', note: '', warn: false },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-2xl mx-auto px-6 w-full flex items-center gap-3">
          <NavBack fallback={settingsPath} />
          <div className="h-4 w-px bg-[#E5E7EB]" />
          <span className="text-[13px] font-semibold text-[#DC2626]">프로젝트 종료</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {project ? <h1 className="text-lg font-semibold">{project.title}</h1> : <p className="text-sm text-muted-foreground">샘플 화면입니다. 실제 프로젝트를 종료하지 않습니다.</p>}
        {project?.myRole === 'MEMBER' && <p role="status">프로젝트 종료는 팀장·공동 팀장만 가능합니다.</p>}
        {project?.status === 'CLOSED' && <p role="status">이미 종료된 프로젝트입니다.</p>}
        {error && <div className="space-y-2"><p role="alert" className="text-destructive">{error}</p><Btn disabled={busy} onClick={reload}>최신 상태 불러오기</Btn></div>}
        {/* Disabled features */}
        <section className="border border-[#FECACA] bg-[#FEF2F2] rounded-md overflow-hidden">
          <div className="px-5 py-3 border-b border-[#FECACA]">
            <span className="text-[12px] font-semibold text-[#991B1B]">종료 후 비활성화되는 기능</span>
          </div>
          <div className="px-5 py-4 space-y-1.5">
            {[
              '체크인 제출',
              '작업 추가 및 수정',
              '담당자 배정 변경',
              '팀원 추가 및 초대',
              '프로젝트 설정 변경',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-[12px] text-[#991B1B]">
                <X className="w-3.5 h-3.5 text-[#FECACA] shrink-0" />
                {item}
              </div>
            ))}
            <p className="text-[11px] text-[#B91C1C] mt-2">{project ? '최종 리포트는 통계 연동 후 제공됩니다.' : '종료 후에도 최종 리포트 조회는 가능합니다.'}</p>
          </div>
        </section>

        {/* Current state summary */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">종료 전 현재 상태</span>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {statusItems.map(item => (
              <div key={item.label} className="flex items-start justify-between gap-3 px-5 py-3">
                <div className="flex items-start gap-2">
                  {item.warn
                    ? <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    : <span className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0">{project ? '—' : '✓'}</span>
                  }
                  <div>
                    <p className="text-[13px] font-medium text-[#111827]">{item.label}</p>
                    {item.note && <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.note}</p>}
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-[#374151] shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Confirmation checkbox */}
        <section className="border border-[#E5E7EB] rounded-md px-5 py-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              disabled={busy || !canClose}
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#D1D5DB]"
            />
            <p className="text-[13px] text-[#374151]">
              위 내용을 모두 확인했으며, 프로젝트를 종료하면 되돌릴 수 없음을 이해합니다.
            </p>
          </label>
        </section>

        <Divider />

        <div className="flex gap-2">
          <Btn variant="secondary" className="flex-1 h-10" disabled={busy} onClick={() => navigate(settingsPath, { replace: true })}>취소</Btn>
          <Btn
            variant="danger"
            className="flex-1 h-10"
            disabled={!confirmed || busy || !canClose}
            onClick={close}
          >
            {busy ? '종료 중…' : '프로젝트 종료'}
          </Btn>
        </div>
      </main>
    </div>
  );
}
