import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Shield, ChevronRight } from 'lucide-react';
import { projectList } from '@/data/sampleData';
import { Btn, Badge, RiskScore, RoleBadgeDs, FilterTabs, Divider } from '@/components/ds';

type StatusFilter = '전체' | '진행 중' | '완료';
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
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#111827]" />
          <span className="text-[13px] font-semibold text-[#111827] tracking-tight">팀플 리스크 레이더</span>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="ghost" size="sm" onClick={() => navigate('/auth')}>로그인</Btn>
          <Btn variant="primary" size="sm" onClick={() => navigate('/create-project')}>
            <Plus className="w-3.5 h-3.5" /> 새 프로젝트
          </Btn>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Page heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[18px] font-semibold text-[#111827] tracking-tight">내 프로젝트</h1>
            <p className="text-[13px] text-[#6B7280] mt-0.5">참여 중인 팀 프로젝트</p>
          </div>
          <span className="text-[12px] text-[#9CA3AF]">{projectList.length}개</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5">
          <FilterTabs<StatusFilter>
            options={[
              { label: '전체', value: '전체' },
              { label: '진행 중', value: '진행 중' },
              { label: '완료', value: '완료' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterTabs<RoleFilter>
            options={[
              { label: '전체', value: '전체' },
              { label: '내가 관리', value: '내가 관리' },
              { label: '내가 팀원', value: '내가 팀원' },
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        </div>

        {/* Project list — Linear/GitHub style */}
        <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[13px] text-[#374151] font-medium mb-1">표시할 프로젝트가 없습니다</p>
              <p className="text-[12px] text-[#9CA3AF]">새 프로젝트를 만들거나 필터를 변경해보세요</p>
            </div>
          ) : (
            filtered.map((project, i) => {
              const isManager = project.myRole === '팀장' || project.myRole === '공동 팀장';
              return (
                <div key={project.id}>
                  {i > 0 && <Divider />}
                  <button
                    onClick={() => navigate(isManager ? '/dashboard' : '/member-home')}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#F9FAFB] transition-colors text-left group"
                  >
                    {/* Status dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                      style={{
                        backgroundColor: project.status === '완료' ? '#16A34A' : '#2563EB',
                      }}
                    />

                    {/* Project info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium text-[#111827] truncate">{project.title}</span>
                        <RoleBadgeDs role={project.myRole} />
                      </div>
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                        {project.className} · 마감 {project.deadline}
                      </p>
                    </div>

                    {/* Right meta */}
                    <div className="flex items-center gap-3 shrink-0">
                      {project.status === '완료' ? (
                        <Badge variant="safe">완료</Badge>
                      ) : (
                        <RiskScore score={project.riskScore} />
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors" />
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Quick nav for demo */}
        <div className="mt-10">
          <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">데모 화면 이동</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: '팀장 대시보드', path: '/dashboard' },
              { label: '팀원 홈', path: '/member-home' },
              { label: '1분 체크인', path: '/checkin' },
              { label: '작업 보드', path: '/task-board' },
              { label: '타임라인', path: '/timeline' },
              { label: '체크인 현황', path: '/checkin-status' },
              { label: '팀원 관리', path: '/members' },
              { label: '최종 리포트', path: '/report' },
              { label: '프로젝트 설정', path: '/settings' },
              { label: '인증 화면', path: '/auth' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-between px-3 py-2 rounded-md border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[12px] text-[#374151] transition-colors"
              >
                {item.label}
                <ChevronRight className="w-3 h-3 text-[#D1D5DB]" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
