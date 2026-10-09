import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { projectsApi, DAY_LABELS, ROLE_LABELS, STATUS_LABELS } from '@/api/projects';
import { useApiQuery } from '@/hooks/useApiQuery';
import { Badge, Btn, NavBack, RoleBadgeDs } from '@/components/ds';

export function ProjectDetail() {
  const navigate = useNavigate();
  const { projectId = '' } = useParams();
  const load = useCallback((signal: AbortSignal) => projectsApi.detail(projectId, signal), [projectId]);
  const { data: project, loading, error, retry } = useApiQuery(load);
  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-border flex items-center">
        <NavBack label="목록" onClick={() => navigate('/projects')} />
        <span className="text-[13px] leading-5 font-semibold">프로젝트 상세</span>
        {project && !loading && !error && project.myRole !== 'MEMBER' && project.status !== 'CLOSED' && <Btn className="ml-auto mr-4" onClick={() => navigate(`/projects/${project.id}/settings`)}>프로젝트 설정</Btn>}
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        {loading ? <p role="status">프로젝트를 불러오고 있습니다…</p> : error ? (
          <div className="space-y-3"><p role="alert">{error}</p><Btn onClick={retry}>다시 시도</Btn></div>
        ) : project && (
          <section className="border border-border rounded-md overflow-hidden">
            <div className="p-5 border-b border-border space-y-2">
              <div className="flex gap-2 items-center flex-wrap">
                <h1 className="text-lg font-semibold break-words">{project.title}</h1>
                <RoleBadgeDs role={ROLE_LABELS[project.myRole]} />
                <Badge variant={project.status === 'DONE' ? 'safe' : 'default'}>{STATUS_LABELS[project.status]}</Badge>
              </div>
              {project.className && <p className="text-muted-foreground">{project.className}</p>}
            </div>
            <div className="px-5 pt-4"><Btn className="mr-2" onClick={() => navigate(`/projects/${project.id}/tasks`)}>작업 보드</Btn><Btn onClick={() => navigate(`/projects/${project.id}/members`)}>팀원 {project.myRole === 'MEMBER' ? '목록' : '관리'}</Btn>{project.myRole !== 'MEMBER' && project.status === 'IN_PROGRESS' && <Btn className="ml-2" onClick={() => navigate(`/projects/${project.id}/invite`)}>팀원 초대</Btn>}</div>
            <dl className="p-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 text-sm">
              <dt className="text-muted-foreground">최종 마감일</dt><dd>{project.deadline}</dd>
              <dt className="text-muted-foreground">체크인 주기</dt><dd>주 {project.checkinFrequency}회</dd>
              <dt className="text-muted-foreground">체크인 요일</dt><dd>{project.checkinDays.map(day => DAY_LABELS[day]).join(' · ')}</dd>
              <dt className="text-muted-foreground">체크인 마감 시간</dt><dd>{project.checkinTime.slice(0, 5)}</dd>
            </dl>
            {project.status !== 'IN_PROGRESS' && <p className="px-5 pb-5 text-muted-foreground">{STATUS_LABELS[project.status]}된 프로젝트입니다.</p>}
          </section>
        )}
      </main>
    </div>
  );
}
