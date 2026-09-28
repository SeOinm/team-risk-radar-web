import { useNavigate } from 'react-router';
import { sampleTasks, sampleMembers } from '@/data/sampleData';
import { StatusChip, ProgressBar, CheckDot, NavBack } from '@/components/ds';

const myMemberId = 'm4';
const myMember = sampleMembers.find(m => m.id === myMemberId)!;
const myTasks = sampleTasks.filter(t => t.assignees.includes(myMemberId));

const checkinHistory = [
  { date: '6월 5일 (수)', status: '완료' as const, note: '발표 대본 파트 분배 완료' },
  { date: '6월 3일 (월)', status: '완료' as const, note: '' },
  { date: '5월 31일 (금)', status: '지각' as const, note: '대본 작성 중' },
  { date: '5월 29일 (수)', status: '완료' as const, note: '' },
  { date: '5월 27일 (월)', status: '완료' as const, note: '' },
];

export function MemberRecord() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {/* Header */}
        <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-10 flex items-center px-4">
          <NavBack label="홈" onClick={() => navigate('/member-home')} />
          <span className="text-[13px] font-semibold text-[#111827] ml-2">내 참여 기록</span>
        </header>

        <div className="px-4 py-4 space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[14px] font-semibold text-[#374151]">
              {myMember.name[0]}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#111827]">{myMember.name}</p>
              <p className="text-[11px] text-[#9CA3AF]">{myMember.role} · HCI 기말 발표 과제</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-[#E5E7EB] rounded-md p-3 text-center">
              <p className="text-[18px] font-semibold text-[#111827]">{myMember.checkinRate}%</p>
              <p className="text-[11px] text-[#9CA3AF]">체크인율</p>
            </div>
            <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-md p-3 text-center">
              <p className="text-[18px] font-semibold text-[#D97706]">{myMember.lateCheckins}</p>
              <p className="text-[11px] text-[#9CA3AF]">지각</p>
            </div>
            <div className="border border-[#E5E7EB] rounded-md p-3 text-center">
              <p className="text-[18px] font-semibold text-[#111827]">{myMember.missedCheckins}</p>
              <p className="text-[11px] text-[#9CA3AF]">누락</p>
            </div>
          </div>

          {/* My tasks */}
          <section>
            <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">
              내 담당 작업 ({myTasks.length}개)
            </p>
            {myTasks.length === 0 ? (
              <div className="border border-dashed border-[#E5E7EB] rounded-md py-8 text-center">
                <p className="text-[12px] text-[#9CA3AF]">배정된 작업이 없습니다</p>
              </div>
            ) : (
              <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
                {myTasks.map(task => (
                  <div key={task.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium text-[#111827]">{task.title}</span>
                      <StatusChip status={task.status} />
                    </div>
                    <ProgressBar value={task.progress} className="mb-1" />
                    <p className="text-[11px] text-[#9CA3AF]">{task.progress}%</p>
                    {task.subTasks.filter(st => st.assigneeId === myMemberId).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#E5E7EB] space-y-1">
                        {task.subTasks.filter(st => st.assigneeId === myMemberId).map(st => (
                          <div key={st.id} className="flex items-center gap-1.5">
                            <span className={`text-[11px] ${st.completed ? 'line-through text-[#9CA3AF]' : 'text-[#374151]'}`}>
                              {st.completed ? '✓ ' : '○ '}{st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Check-in history */}
          <section>
            <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">체크인 기록</p>
            <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
              {checkinHistory.map(r => (
                <div key={r.date} className="flex items-start justify-between px-4 py-3">
                  <div>
                    <p className="text-[12px] text-[#374151]">{r.date}</p>
                    {r.note && <p className="text-[11px] text-[#9CA3AF] mt-0.5">{r.note}</p>}
                  </div>
                  <CheckDot
                    done={r.status === '완료'}
                    late={r.status === '지각'}
                    missed={false}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Team report note */}
          <div className="border border-[#E5E7EB] rounded-md px-4 py-3">
            <p className="text-[11px] text-[#9CA3AF]">
              전체 팀 리포트는 팀장 및 공동 팀장만 조회할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
