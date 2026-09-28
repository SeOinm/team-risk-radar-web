import { useNavigate } from 'react-router';
import { Shield, BarChart3, Users, Zap, ChevronRight } from 'lucide-react';
import { Btn } from '@/components/ds';

const NAV_LINKS = [
  { label: '작업 상세', path: '/task/t2' },
  { label: '대시보드', path: '/dashboard' },
  { label: '작업 보드', path: '/task-board' },
  { label: '체크인 현황', path: '/checkin-status' },
  { label: '타임라인', path: '/timeline' },
  { label: '팀원 체크인', path: '/checkin' },
  { label: '리포트', path: '/report' },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#111827]" />
            <span className="text-[13px] font-semibold text-[#111827]">팀플 리스크 레이더</span>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" size="sm" onClick={() => navigate('/auth')}>로그인</Btn>
            <Btn variant="primary" size="sm" onClick={() => navigate('/auth')}>프로젝트 시작</Btn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span className="text-[11px] font-medium text-[#374151]">대학생 팀 프로젝트 리스크 관리</span>
        </div>
        <h1 className="text-[36px] font-bold text-[#111827] tracking-tight leading-tight mb-4">
          팀 프로젝트의 리스크를<br />
          조기에 발견하세요
        </h1>
        <p className="text-[15px] text-[#6B7280] max-w-xl mx-auto mb-8">
          무임승차, 역할 불균형, 병목, 체크인 누락, 마감 위험을 자동으로 감지하고
          "무엇이 왜 위험한지"를 명확히 설명합니다.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Btn variant="primary" className="h-10 px-6 text-[14px]" onClick={() => navigate('/auth')}>
            팀장으로 시작하기
          </Btn>
          <Btn variant="secondary" className="h-10 px-6 text-[14px]" onClick={() => navigate('/auth')}>
            팀원으로 참여하기
          </Btn>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-3 gap-6">
          {[
            {
              Icon: BarChart3,
              title: '리스크 조기 감지',
              desc: '작업 지연, 역할 편중, 체크인 누락을 자동으로 감지하고 위험 수준을 점수로 표시합니다',
            },
            {
              Icon: Users,
              title: '1분 체크인',
              desc: '팀원들은 간단한 체크인만으로 진행 상황을 공유할 수 있습니다',
            },
            {
              Icon: Zap,
              title: '실행 가능한 인사이트',
              desc: '단순 경고가 아닌 원인·근거·해결 방안을 함께 제공합니다',
            },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#F3F4F6] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-[#374151]" />
              </div>
              <p className="text-[14px] font-semibold text-[#111827]">{title}</p>
              <p className="text-[12px] text-[#6B7280] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo nav */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-4">빠른 둘러보기</p>
        <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="divide-y divide-[#E5E7EB]">
            {NAV_LINKS.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-[#F9FAFB] text-left transition-colors group"
              >
                <span className="text-[13px] font-medium text-[#111827]">{label}</span>
                <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#9CA3AF]" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
