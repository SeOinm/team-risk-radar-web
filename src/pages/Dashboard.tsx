import { useNavigate } from 'react-router';
import { AlertCircle, TrendingUp, Users, Clock, AlertTriangle, BarChart3, GitBranch, ChevronRight, Settings } from 'lucide-react';
import { sampleMembers, sampleTasks, pendingMembers } from '@/data/sampleData';
import { Btn, Badge, RiskScore, RoleBadgeDs, SizeBadgeDs, StatusChip, ProgressBar, AlertBanner, Divider } from '@/components/ds';

const riskCards = [
  { type: '체크인', icon: Clock, title: '참여율 낮음', detail: '박서연 2회 연속 누락', level: 'danger' as const },
  { type: '일정', icon: AlertTriangle, title: '지연 작업', detail: '자료 조사 3일 지연', level: 'caution' as const },
  { type: '미배정', icon: Users, title: '담당자 없음', detail: '발표 연습 미배정', level: 'caution' as const },
  { type: '막힘', icon: AlertCircle, title: '막힘 없음', detail: '현재 막힘 작업 없음', level: 'safe' as const },
  { type: '편중', icon: BarChart3, title: '작업량 편중', detail: '박서연 47% 담당', level: 'caution' as const },
  { type: '의존성', icon: GitBranch, title: '의존성 위험', detail: '자료조사 → 보고서·발표자료', level: 'caution' as const },
];

const riskCardStyle = {
  danger: { dot: '#DC2626', bg: 'bg-[#FEF2F2] border-[#FECACA]', title: 'text-[#991B1B]', sub: 'text-[#B91C1C]' },
  caution: { dot: '#D97706', bg: 'bg-[#FFFBEB] border-[#FDE68A]', title: 'text-[#78350F]', sub: 'text-[#92400E]' },
  safe: { dot: '#16A34A', bg: 'bg-[#F0FDF4] border-[#BBF7D0]', title: 'text-[#14532D]', sub: 'text-[#166534]' },
};

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/projects')} className="text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors">
              ← 내 프로젝트
            </button>
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <span className="text-[13px] font-semibold text-[#111827]">HCI 기말 발표 과제</span>
            <Badge variant="outline" className="text-[#6B7280]">인간컴퓨터상호작용</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Btn variant="ghost" size="sm" onClick={() => navigate('/task-board')}>작업 보드</Btn>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/timeline')}>타임라인</Btn>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/checkin-status')}>체크인 현황</Btn>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/members')}>팀원 관리</Btn>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/report')}>리포트</Btn>
            <Btn variant="secondary" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="w-3.5 h-3.5" />
            </Btn>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-5">
          {/* Left main column */}
          <div className="col-span-8 space-y-5">

            {/* Risk summary row */}
            <div className="flex items-center gap-5 p-4 border border-[#E5E7EB] rounded-md">
              {/* Score */}
              <div className="shrink-0">
                <RiskScoreCircle score={71} />
              </div>
              <div className="h-12 w-px bg-[#E5E7EB] shrink-0" />
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 flex-1">
                <StatCol label="리스크 변화" value="+9" valueClass="text-[#DC2626]" sub="지난 체크인 대비" />
                <StatCol label="마감까지" value="16일" sub="2024-06-13" />
                <StatCol label="전체 진행률" value="21%" sub="완료 1 / 전체 7" />
              </div>
              <div className="h-12 w-px bg-[#E5E7EB] shrink-0" />
              {/* Confidence */}
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-[#9CA3AF] mb-1">진단 신뢰도</p>
                <Badge variant="caution">보통</Badge>
              </div>
            </div>

            {/* Confidence note */}
            <AlertBanner
              level="caution"
              title="진단 신뢰도 보통"
              desc="박서연 체크인 기록 부족으로 일부 진단의 정확도가 낮을 수 있습니다."
            />

            {/* Today's alerts */}
            <section>
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">오늘 확인할 항목</p>
              <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
                <AlertRow
                  level="danger"
                  title="박서연이 2회 연속 체크인하지 않았습니다"
                  detail="마지막 체크인 5/28 · 담당: 자료 조사, 발표자료 제작"
                  action="체크인 현황"
                  onAction={() => navigate('/checkin-status')}
                />
                <Divider />
                <AlertRow
                  level="danger"
                  title="자료 조사 3일 지연, 업데이트 부족"
                  detail="진행률 25% · 보고서 초안·발표자료 제작에 영향"
                  action="작업 상세"
                  onAction={() => navigate('/task/t2')}
                />
                <Divider />
                <AlertRow
                  level="caution"
                  title="발표 연습 — 담당자 미배정"
                  detail="마감 6/12까지 배정이 필요합니다"
                  action="작업 보드"
                  onAction={() => navigate('/task-board')}
                />
                {pendingMembers.length > 0 && (
                  <>
                    <Divider />
                    <AlertRow
                      level="caution"
                      title={`가입 승인 요청 ${pendingMembers.length}명 — ${pendingMembers.map(p => p.name).join(', ')}`}
                      detail=""
                      action="팀원 관리"
                      onAction={() => navigate('/members')}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Risk cards grid */}
            <section>
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">주요 리스크 현황</p>
              <div className="grid grid-cols-3 gap-2">
                {riskCards.map(card => {
                  const Icon = card.icon;
                  const s = riskCardStyle[card.level];
                  return (
                    <div key={card.type} className={`p-3 rounded-md border ${s.bg}`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                        <span className={`text-[11px] font-semibold ${s.title}`}>{card.type}</span>
                        <Icon className={`w-3 h-3 ${s.title} ml-auto`} />
                      </div>
                      <p className={`text-[12px] font-medium ${s.title}`}>{card.title}</p>
                      <p className={`text-[11px] mt-0.5 ${s.sub} opacity-80`}>{card.detail}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Bottleneck task */}
            <section>
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">핵심 병목</p>
              <div className="border border-[#FECACA] rounded-md bg-[#FEF2F2] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#991B1B]">자료 조사</span>
                      <SizeBadgeDs size="L" />
                      <Badge variant="critical">3일 지연</Badge>
                    </div>
                    <p className="text-[12px] text-[#B91C1C]">담당: 박서연 · 진행률 25% · 마감 5/28</p>
                  </div>
                  <Btn variant="ghost" size="sm" onClick={() => navigate('/task/t2')} className="text-[#991B1B] shrink-0">
                    상세 →
                  </Btn>
                </div>
                <ProgressBar value={25} className="mt-3 mb-2" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#991B1B] font-medium">영향받는 작업:</span>
                  {['보고서 초안', '발표자료 제작'].map(t => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#FECACA] text-[#991B1B]">{t}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <div className="col-span-4 space-y-4">

            {/* Members */}
            <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <span className="text-[12px] font-semibold text-[#374151]">팀원</span>
                <button onClick={() => navigate('/members')} className="text-[12px] text-[#6B7280] hover:text-[#111827]">관리 →</button>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {sampleMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => navigate(`/member/${member.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9FAFB] transition-colors group text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[12px] font-semibold text-[#374151] shrink-0">
                      {member.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-[#111827]">{member.name}</span>
                        <RoleBadgeDs role={member.role} />
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] truncate">{member.statusLabel}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-[#D1D5DB] group-hover:text-[#9CA3AF] shrink-0" />
                  </button>
                ))}
                {pendingMembers.length > 0 && (
                  <button
                    onClick={() => navigate('/members')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFFBEB] transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[12px] font-semibold text-[#92400E] shrink-0">
                      {pendingMembers[0].name[0]}
                    </div>
                    <div className="flex-1">
                      <span className="text-[12px] text-[#111827]">{pendingMembers[0].name}</span>
                      <p className="text-[11px] text-[#D97706]">승인 대기 중</p>
                    </div>
                  </button>
                )}
              </div>
            </section>

            {/* Today check-in */}
            <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <span className="text-[12px] font-semibold text-[#374151]">오늘 체크인</span>
                <button onClick={() => navigate('/checkin-status')} className="text-[12px] text-[#6B7280] hover:text-[#111827]">전체 →</button>
              </div>
              <div className="px-4 py-3 space-y-2">
                {[
                  { name: '김지훈', done: true },
                  { name: '이도현', done: true },
                  { name: '최유진', done: true },
                  { name: '박서연', done: false },
                ].map(c => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-[12px] text-[#374151]">{c.name}</span>
                    {c.done ? (
                      <span className="text-[11px] font-medium text-[#16A34A]">● 완료</span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#DC2626]">○ 2회 누락</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <p className="text-[11px] text-[#9CA3AF]">완료 3명 / 누락 1명</p>
              </div>
            </section>

            {/* Workload distribution */}
            <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <span className="text-[12px] font-semibold text-[#374151]">작업량 배분</span>
              </div>
              <div className="px-4 py-3 space-y-3">
                {sampleMembers.map(m => (
                  <div key={m.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[#374151]">{m.name}</span>
                      <span className={`text-[12px] font-semibold ${m.workload > 30 ? 'text-[#EA580C]' : 'text-[#374151]'}`}>
                        {m.workload}%
                      </span>
                    </div>
                    <ProgressBar value={m.workload} />
                  </div>
                ))}
              </div>
            </section>

            {/* Tasks */}
            <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <span className="text-[12px] font-semibold text-[#374151]">작업 현황</span>
                <button onClick={() => navigate('/task-board')} className="text-[12px] text-[#6B7280] hover:text-[#111827]">전체 →</button>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {sampleTasks.slice(0, 5).map(task => (
                  <button
                    key={task.id}
                    onClick={() => navigate(`/task/${task.id}`)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-[#F9FAFB] transition-colors text-left"
                  >
                    <SizeBadgeDs size={task.size} />
                    <span className="flex-1 text-[12px] text-[#374151] truncate">{task.title}</span>
                    <StatusChip status={task.status} />
                    {task.delayed && <AlertTriangle className="w-3 h-3 text-[#EA580C] shrink-0" />}
                  </button>
                ))}
              </div>
            </section>

            {/* Risk score trend (simple) */}
            <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <span className="text-[12px] font-semibold text-[#374151]">리스크 추이</span>
              </div>
              <div className="px-4 py-3">
                <RiskScore score={71} />
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-3 h-3 text-[#DC2626]" />
                  <span className="text-[12px] text-[#DC2626] font-medium">+9 (지난 체크인 대비)</span>
                </div>
                <div className="mt-3 flex items-end gap-1 h-10">
                  {[42, 55, 63, 68, 62, 71].map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${(v / 100) * 100}%`,
                        backgroundColor: v >= 70 ? '#EA580C' : v >= 50 ? '#D97706' : '#2563EB',
                        opacity: i === 5 ? 1 : 0.5,
                      }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-1">최근 6회 체크인</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCol({ label, value, valueClass = 'text-[#111827]', sub }: { label: string; value: string; valueClass?: string; sub: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#9CA3AF] mb-0.5">{label}</p>
      <p className={`text-[18px] font-semibold tracking-tight ${valueClass}`}>{value}</p>
      <p className="text-[11px] text-[#9CA3AF]">{sub}</p>
    </div>
  );
}

function RiskScoreCircle({ score }: { score: number }) {
  const color = score >= 70 ? '#EA580C' : score >= 50 ? '#D97706' : '#2563EB';
  return (
    <div className="text-center">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" stroke="#E5E7EB" strokeWidth="4" fill="none" />
          <circle
            cx="28" cy="28" r="24"
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${(score / 100) * 150.8} 150.8`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[14px] font-bold text-[#111827]" style={{ color }}>{score}</span>
        </div>
      </div>
      <p className="text-[11px] text-[#9CA3AF] mt-1">리스크</p>
    </div>
  );
}

function AlertRow({ level, title, detail, action, onAction }: {
  level: 'danger' | 'caution';
  title: string;
  detail: string;
  action?: string;
  onAction?: () => void;
}) {
  const dot = level === 'danger' ? '#DC2626' : '#D97706';
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: dot }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#111827]">{title}</p>
        {detail && <p className="text-[12px] text-[#6B7280] mt-0.5">{detail}</p>}
      </div>
      {action && onAction && (
        <button onClick={onAction} className="text-[12px] text-[#6B7280] hover:text-[#111827] shrink-0 whitespace-nowrap">
          {action} →
        </button>
      )}
    </div>
  );
}
