import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Shield, Calendar, ChevronRight } from 'lucide-react';
import { RiskBadge, RoleBadge } from '@/components/RiskBadge';
import { projectList } from '@/data/sampleData';

type StatusFilter = '전체' | '진행 중' | '마감일 지남' | '완료';
type RoleFilter = '전체' | '내가 관리' | '내가 팀원';

export function ProjectList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('전체');

  const filtered = projectList.filter(p => {
    const matchStatus =
      statusFilter === '전체' ||
      (statusFilter === '진행 중' && p.status === '진행 중') ||
      (statusFilter === '완료' && p.status === '완료');
    const matchRole =
      roleFilter === '전체' ||
      (roleFilter === '내가 관리' && (p.myRole === '팀장' || p.myRole === '공동 팀장')) ||
      (roleFilter === '내가 팀원' && p.myRole === '팀원');
    return matchStatus && matchRole;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">팀플 리스크 레이더</span>
          </div>
          <button
            onClick={() => navigate('/create-project')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-1">내 프로젝트</h1>
          <p className="text-muted-foreground text-sm">참여 중인 팀 프로젝트를 확인하세요</p>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {(['전체', '진행 중', '마감일 지남', '완료'] as StatusFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  statusFilter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {(['전체', '내가 관리', '내가 팀원'] as RoleFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  roleFilter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filtered.map(project => {
              const isManager = project.myRole === '팀장' || project.myRole === '공동 팀장';
              return (
                <button
                  key={project.id}
                  onClick={() => navigate(isManager ? '/dashboard' : '/member-home')}
                  className="w-full bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="truncate">{project.title}</h3>
                        <RoleBadge role={project.myRole} />
                        {project.status === '완료' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">완료</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{project.className}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          마감 {project.deadline}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {project.status !== '완료' && (
                        <RiskBadge score={project.riskScore} />
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">빠른 이동</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '팀장 대시보드', path: '/dashboard' },
              { label: '팀원 홈', path: '/member-home' },
              { label: '1분 체크인', path: '/checkin' },
              { label: '작업 보드', path: '/task-board' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="p-3 rounded-lg border border-border hover:bg-accent text-sm text-left transition-colors"
              >
                {item.label} →
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
      <p className="font-medium mb-1">참여 중인 프로젝트가 없습니다</p>
      <p className="text-sm text-muted-foreground mb-4">새 프로젝트를 만들거나 팀장에게 초대 링크를 받아보세요.</p>
      <button
        onClick={() => navigate('/create-project')}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
      >
        새 프로젝트 만들기
      </button>
    </div>
  );
}
