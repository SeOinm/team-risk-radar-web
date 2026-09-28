import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckSquare, Square, Clock, AlertTriangle, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { sampleTasks, sampleMembers } from '@/data/sampleData';
import { SizeBadgeDs, StatusChip, ProgressBar, Btn } from '@/components/ds';

const myMember = sampleMembers.find(m => m.id === 'm4')!; // 최유진 (팀원)
const myTasks = sampleTasks.filter(t => t.assignees.includes(myMember.id) && t.status !== '취소');
const unassignedTasks = sampleTasks.filter(t => t.assignees.length === 0 && t.status !== '완료' && t.status !== '취소');

export function MemberHome() {
  const navigate = useNavigate();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const todayCheckinDue = true;
  const alreadyCheckedIn = false;

  const toggleExpand = (id: string) => {
    const next = new Set(expandedTasks);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedTasks(next);
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {/* Header */}
        <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-10 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#111827]" />
            <span className="text-[13px] font-semibold text-[#111827]">팀플 리스크 레이더</span>
          </div>
          <button onClick={() => navigate('/projects')} className="text-[12px] text-[#6B7280]">목록</button>
        </header>

        <div className="px-4 py-4 space-y-5">
          {/* Project info */}
          <div>
            <p className="text-[11px] text-[#9CA3AF] mb-0.5">현재 프로젝트</p>
            <p className="text-[15px] font-semibold text-[#111827]">HCI 기말 발표 과제</p>
            <p className="text-[12px] text-[#9CA3AF]">인간컴퓨터상호작용 · 마감 6월 13일</p>
          </div>

          {/* Check-in card */}
          {todayCheckinDue && !alreadyCheckedIn ? (
            <div className="border-2 border-[#111827] rounded-md p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#111827]" />
                <span className="text-[13px] font-semibold text-[#111827]">오늘 체크인 마감 23:59</span>
              </div>
              <p className="text-[12px] text-[#6B7280] mb-3">작업 진행 상황을 1분 안에 공유해요</p>
              <Btn variant="primary" className="w-full h-10 text-[13px]" onClick={() => navigate('/checkin')}>
                1분 체크인 하기
              </Btn>
            </div>
          ) : (
            <div className="border border-[#BBF7D0] bg-[#F0FDF4] rounded-md p-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#14532D]">● 오늘 체크인 완료</span>
              </div>
              <p className="text-[12px] text-[#6B7280] mt-1">다음 체크인: 6월 9일 (월)</p>
            </div>
          )}

          {/* My tasks */}
          <section>
            <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">내 담당 작업</p>
            {myTasks.length === 0 ? (
              <div className="border border-dashed border-[#E5E7EB] rounded-md py-10 text-center">
                <p className="text-[12px] text-[#9CA3AF]">배정된 작업이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myTasks.map(task => {
                  const isExpanded = expandedTasks.has(task.id);
                  return (
                    <div key={task.id} className="border border-[#E5E7EB] rounded-md overflow-hidden">
                      <button
                        className="w-full px-4 py-3 text-left"
                        onClick={() => toggleExpand(task.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <SizeBadgeDs size={task.size} />
                              <span className="text-[13px] font-medium text-[#111827] truncate">{task.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusChip status={task.status} />
                              <span className="text-[11px] text-[#9CA3AF]">마감 {task.dueDate.slice(5)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {task.delayed && <AlertTriangle className="w-3.5 h-3.5 text-[#EA580C]" />}
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
                              : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                            }
                          </div>
                        </div>
                        <ProgressBar value={task.progress} className="mt-2" />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[#E5E7EB] px-4 py-3 bg-[#F9FAFB]">
                          {task.subTasks.length > 0 && (
                            <div className="space-y-1.5 mb-3">
                              {task.subTasks.map(st => (
                                <div key={st.id} className="flex items-center gap-2">
                                  {st.completed
                                    ? <CheckSquare className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                                    : <Square className="w-3.5 h-3.5 text-[#D1D5DB] shrink-0" />
                                  }
                                  <span className={`text-[12px] ${st.completed ? 'line-through text-[#9CA3AF]' : 'text-[#374151]'}`}>
                                    {st.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => navigate(`/my-task/${task.id}`)}
                            className="text-[12px] text-[#6B7280] hover:text-[#111827]"
                          >
                            상세 보기 →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Unassigned tasks (read-only) */}
          {unassignedTasks.length > 0 && (
            <section>
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">미배정 작업</p>
              <p className="text-[11px] text-[#9CA3AF] mb-2">담당 배정은 팀장에게 문의하세요</p>
              <div className="space-y-1.5">
                {unassignedTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between px-4 py-2.5 border border-dashed border-[#E5E7EB] rounded-md">
                    <div className="flex items-center gap-2">
                      <SizeBadgeDs size={task.size} />
                      <span className="text-[12px] text-[#374151]">{task.title}</span>
                    </div>
                    <span className="text-[11px] text-[#9CA3AF]">마감 {task.dueDate.slice(5)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* My record link */}
          <div className="pb-6">
            <button
              onClick={() => navigate('/my-record')}
              className="w-full py-3 border border-[#E5E7EB] rounded-md text-[12px] text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
            >
              내 참여 기록 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
