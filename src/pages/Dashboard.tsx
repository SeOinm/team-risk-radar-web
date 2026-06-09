import { useNavigate } from 'react-router';
import { RiskGauge } from '@/components/RiskGauge';
import { RiskBadge, RoleBadge } from '@/components/RiskBadge';
import { SizeBadge } from '@/components/SizeBadge';
import {
  AlertCircle, TrendingUp, Users, Clock, AlertTriangle, BarChart3,
  CheckCircle2, XCircle, GitBranch, Info, ChevronRight
} from 'lucide-react';
import { sampleMembers, sampleTasks, pendingMembers } from '@/data/sampleData';

const riskCards = [
  {
    type: '체크인',
    icon: Clock,
    title: '체크인 참여율 낮음',
    detail: '박서연 2회 연속 체크인 누락',
    color: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-700' },
  },
  {
    type: '일정',
    icon: AlertTriangle,
    title: '지연 작업 발생',
    detail: '자료 조사 3일 지연',
    color: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-500', badge: 'bg-orange-100 text-orange-700' },
  },
  {
    type: '미배정',
    icon: Users,
    title: '담당자 없는 작업',
    detail: '발표 연습: 담당자 미배정',
    color: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
  },
  {
    type: '막힘',
    icon: AlertCircle,
    title: '막힘 작업 없음',
    detail: '현재 막힘 상태인 작업이 없습니다',
    color: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  },
  {
    type: '편중',
    icon: BarChart3,
    title: '작업량 편중',
    detail: '박서연 47% 담당 중',
    color: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
  },
  {
    type: '의존성',
    icon: GitBranch,
    title: '선행 작업 지연',
    detail: '자료 조사 → 보고서 초안, 발표자료 미시작',
    color: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
  },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-0.5">HCI 기말 발표 과제</h1>
              <p className="text-sm text-muted-foreground">
                인간컴퓨터상호작용 · 마감일 6월 13일 · 체크인 월·수·금 23:59
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => navigate('/task-board')} className="px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm">작업 보드</button>
              <button onClick={() => navigate('/timeline')} className="px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm">타임라인</button>
              <button onClick={() => navigate('/checkin-status')} className="px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm">체크인 현황</button>
              <button onClick={() => navigate('/members')} className="px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm">팀원 관리</button>
              <button onClick={() => navigate('/report')} className="px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm">최종 리포트</button>
              <button onClick={() => navigate('/settings')} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm">설정</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* 왼쪽 메인 */}
          <div className="col-span-8 space-y-6">
            {/* 리스크 점수 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start gap-6">
                <RiskGauge score={71} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2>팀 리스크</h2>
                    <RiskBadge score={71} />
                    <span className="flex items-center gap-1 text-sm text-red-500 font-medium">
                      <TrendingUp className="w-4 h-4" /> +9
                    </span>
                  </div>
                  {/* 진단 신뢰도 */}
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      <span className="font-semibold">진단 신뢰도 보통</span> — 박서연 체크인 기록 부족으로 일부 진단의 정확도가 낮을 수 있습니다.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    지난 체크인 대비 리스크가 증가했습니다. 아래 항목들을 확인해주세요.
                  </p>
                </div>
              </div>
            </section>

            {/* 오늘 확인할 항목 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h3 className="mb-4">오늘 확인할 항목</h3>
              <div className="space-y-3">
                <AlertItem
                  level="danger"
                  title="박서연이 2회 연속 체크인하지 않았습니다"
                  detail="마지막 체크인: 5월 28일 · 담당 작업: 자료 조사, 발표자료 제작"
                  actionLabel="체크인 현황 보기"
                  onAction={() => navigate('/checkin-status')}
                />
                <AlertItem
                  level="danger"
                  title="자료 조사 담당자 업데이트 부족"
                  detail="3일 지연 중 · 진행률 25% · 보고서 초안·발표자료 제작에 영향"
                  actionLabel="작업 상세 보기"
                  onAction={() => navigate('/task/t2')}
                />
                <AlertItem
                  level="caution"
                  title="미배정 작업 1개"
                  detail="발표 연습 — 담당자가 없습니다"
                  actionLabel="작업 보드에서 배정"
                  onAction={() => navigate('/task-board')}
                />
                {pendingMembers.length > 0 && (
                  <AlertItem
                    level="caution"
                    title={`가입 승인 요청 ${pendingMembers.length}명`}
                    detail={`${pendingMembers.map(p => p.name).join(', ')}이 가입을 요청했습니다`}
                    actionLabel="팀원 관리에서 승인"
                    onAction={() => navigate('/members')}
                  />
                )}
              </div>
            </section>

            {/* 주요 리스크 카드 6종 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h3 className="mb-4">주요 리스크 현황</h3>
              <div className="grid grid-cols-3 gap-3">
                {riskCards.map(card => {
                  const Icon = card.icon;
                  return (
                    <div key={card.type} className={`p-4 rounded-xl border ${card.color.bg} ${card.color.border}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${card.color.icon}`} />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.color.badge}`}>
                          {card.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{card.title}</p>
                      <p className="text-xs text-muted-foreground">{card.detail}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 병목 작업 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h3 className="mb-4">핵심 병목</h3>
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4>자료 조사</h4>
                      <SizeBadge size="L" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">3일 지연</span>
                    </div>
                    <p className="text-sm text-muted-foreground">담당: 박서연 · 진행률 25% · 마감 5월 28일</p>
                  </div>
                  <button onClick={() => navigate('/task/t2')} className="text-xs text-primary hover:underline shrink-0">상세 →</button>
                </div>
                <div className="h-2 bg-red-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '25%' }} />
                </div>
                <div>
                  <p className="text-xs font-medium text-red-800 mb-1">영향받는 작업</p>
                  <div className="flex gap-2">
                    {['보고서 초안', '발표자료 제작'].map(t => (
                      <span key={t} className="px-2 py-1 rounded-lg bg-white border border-red-200 text-xs text-red-700">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="col-span-4 space-y-5">
            {/* 팀원 */}
            <section className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3>팀원</h3>
                <button onClick={() => navigate('/members')} className="text-xs text-primary hover:underline">관리 →</button>
              </div>
              <div className="space-y-2">
                {sampleMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => navigate(`/member/${member.id}`)}
                    className="w-full flex items-center justify-between hover:bg-muted/40 rounded-lg p-1.5 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {member.name[0]}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-sm font-medium">{member.name}</span>
                          <RoleBadge role={member.role} />
                        </div>
                        <p className="text-xs text-muted-foreground">{member.statusLabel}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  </button>
                ))}
                {pendingMembers.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <button
                      onClick={() => navigate('/members')}
                      className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-medium text-amber-600">
                        {pendingMembers[0].name[0]}
                      </div>
                      <div className="text-left">
                        <span className="text-sm">{pendingMembers[0].name}</span>
                        <span className="text-xs text-amber-600 block">승인 대기 중</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 체크인 */}
            <section className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3>오늘 체크인</h3>
                <button onClick={() => navigate('/checkin-status')} className="text-xs text-primary hover:underline">전체 →</button>
              </div>
              <div className="space-y-2">
                {[
                  { name: '김지훈', done: true },
                  { name: '이도현', done: true },
                  { name: '최유진', done: true },
                  { name: '박서연', done: false, missed: 2 },
                ].map(c => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-sm">{c.name}</span>
                    {c.done ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 완료
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> {c.missed}회 누락
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">완료 3명 / 누락 1명</div>
            </section>

            {/* 작업 배분 */}
            <section className="bg-card rounded-xl border border-border p-5">
              <h3 className="mb-4">작업 배분</h3>
              <div className="space-y-3">
                {sampleMembers.map(m => (
                  <div key={m.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{m.name}</span>
                      <span className={`text-sm font-semibold ${m.workload > 30 ? 'text-orange-600' : ''}`}>{m.workload}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${m.workload}%`,
                          backgroundColor: m.workload > 30 ? 'oklch(0.65 0.16 40)' : 'oklch(0.65 0.15 145)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 작업 현황 */}
            <section className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3>작업 현황</h3>
                <button onClick={() => navigate('/task-board')} className="text-xs text-primary hover:underline">전체 →</button>
              </div>
              <div className="space-y-1">
                {sampleTasks.slice(0, 5).map(task => (
                  <button
                    key={task.id}
                    onClick={() => navigate(`/task/${task.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {task.delayed && <AlertTriangle className="w-3 h-3 text-orange-500 shrink-0" />}
                      <span className="text-sm truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <SizeBadge size={task.size} />
                      <span className="text-xs text-muted-foreground w-8 text-right">{task.progress}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function AlertItem({
  level, title, detail, actionLabel, onAction
}: {
  level: 'danger' | 'caution';
  title: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const styles = {
    danger: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', Icon: AlertCircle },
    caution: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', Icon: AlertTriangle },
  };
  const s = styles[level];
  const Icon = s.Icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg} ${s.border}`}>
      <Icon className={`w-4 h-4 ${s.icon} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium mb-0.5 text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
        {actionLabel && onAction && (
          <button onClick={onAction} className="text-xs text-primary hover:underline mt-1">{actionLabel} →</button>
        )}
      </div>
    </div>
  );
}
