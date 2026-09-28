import type { BadgeVariant } from '@/lib/risk';
import type { CheckinStatus } from '@/types';
import { useNavigate, useParams } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { sampleMembers, sampleTasks } from '@/data/sampleData';
import { Badge, RoleBadgeDs, StatusChip, ProgressBar, AlertBanner, CheckDot, NavBack } from '@/components/ds';

const statusStyle: Record<string, BadgeVariant> = {
  '안정적으로 참여 중': 'safe',
  '확인 필요': 'caution',
  '작업량 과다': 'danger',
  '배정된 작업 없음': 'default',
  '산출물 근거 부족': 'caution',
  '지연 영향 큼': 'critical',
};

export function MemberParticipation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const member = sampleMembers.find(m => m.id === id) || sampleMembers[1];
  const myTasks = sampleTasks.filter(t => t.assignees.includes(member.id));

  const statusKeys = member.id === 'm2'
    ? ['작업량 과다', '확인 필요']
    : [member.statusLabel];

  const checkinHistory: { date: string; status: CheckinStatus }[] = member.id === 'm2'
    ? [
        { date: '6월 5일 (수)', status: '누락' as const },
        { date: '6월 3일 (월)', status: '누락' as const },
        { date: '5월 31일 (금)', status: '완료' as const },
        { date: '5월 29일 (수)', status: '완료' as const },
        { date: '5월 27일 (월)', status: '완료' as const },
      ]
    : [
        { date: '6월 5일 (수)', status: '완료' as const },
        { date: '6월 3일 (월)', status: '완료' as const },
        { date: '5월 31일 (금)', status: '완료' as const },
      ];

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-3xl mx-auto px-6 w-full flex items-center gap-3">
          <NavBack label="팀원 관리" onClick={() => navigate('/members')} />
          <div className="h-4 w-px bg-[#E5E7EB]" />
          <span className="text-[13px] font-semibold text-[#111827]">팀원 참여 요약</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-5 space-y-5">
        {/* Profile card */}
        <div className="border border-[#E5E7EB] rounded-md p-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[18px] font-semibold text-[#374151]">
              {member.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[15px] font-semibold text-[#111827]">{member.name}</span>
                <RoleBadgeDs role={member.role} />
              </div>
              <p className="text-[12px] text-[#9CA3AF]">가입일 {member.joinDate}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {statusKeys.map(key => (
              <Badge key={key} variant={statusStyle[key] || 'default'}>
                {key}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '담당 작업', value: `${myTasks.length}개`, sub: `전체의 ${member.workload}%` },
            { label: '체크인율', value: `${member.checkinRate}%`, sub: `지각 ${member.lateCheckins}회`, warn: member.checkinRate < 70 },
            { label: '누락 횟수', value: `${member.missedCheckins}회`, sub: member.missedCheckins > 0 ? '연속 누락' : '정상', warn: member.missedCheckins > 0 },
            { label: '산출물', value: `${myTasks.reduce((s, t) => s + t.artifactLinks, 0)}개`, sub: '등록됨' },
          ].map(s => (
            <div key={s.label} className={`border rounded-md p-3 ${s.warn ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E5E7EB]'}`}>
              <p className="text-[11px] text-[#9CA3AF] mb-0.5">{s.label}</p>
              <p className={`text-[18px] font-semibold ${s.warn ? 'text-[#DC2626]' : 'text-[#111827]'}`}>{s.value}</p>
              <p className="text-[11px] text-[#9CA3AF]">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Missed checkin warning */}
        {member.missedCheckins > 0 && (
          <AlertBanner
            level="danger"
            title={`${member.missedCheckins}회 연속 체크인 누락`}
            desc="마지막 체크인: 5월 28일 · 담당 작업의 진행 상황을 확인하기 어렵습니다"
          />
        )}

        {/* Tasks */}
        <section>
          <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">담당 작업 ({myTasks.length}개)</p>
          <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
            {myTasks.length === 0 ? (
              <div className="py-10 text-center text-[12px] text-[#9CA3AF]">배정된 작업이 없습니다</div>
            ) : myTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-[#111827] truncate">{task.title}</span>
                    {task.delayed && (
                      <span className="flex items-center gap-0.5 text-[11px] text-[#EA580C] font-medium">
                        <AlertTriangle className="w-3 h-3" />{task.delayDays}일 지연
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={task.status} />
                    <span className="text-[11px] text-[#9CA3AF]">마감 {task.dueDate.slice(5)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ProgressBar value={task.progress} className="w-16" />
                  <span className="text-[11px] text-[#9CA3AF] w-6">{task.progress}%</span>
                  <button onClick={() => navigate(`/task/${task.id}`)} className="text-[12px] text-[#6B7280] hover:text-[#111827]">
                    상세 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Check-in history */}
        <section>
          <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">최근 체크인 기록</p>
          <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
            {checkinHistory.map(r => (
              <div key={r.date} className="flex items-center justify-between px-4 py-3">
                <span className="text-[12px] text-[#374151]">{r.date}</span>
                <CheckDot done={r.status === '완료'} late={r.status === '지각'} missed={r.status === '누락'} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
