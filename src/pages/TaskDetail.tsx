import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Link as LinkIcon, AlertCircle, AlertTriangle, RotateCcw, XCircle, CheckSquare, Square } from 'lucide-react';
import { sampleTasks, sampleMembers } from '@/data/sampleData';
import { Btn, Badge, RiskScore, SizeBadgeDs, StatusChip, ProgressBar, AlertBanner, Divider, NavBack } from '@/components/ds';

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

const checkinHistory = [
  { date: '2024-05-30', status: '진행 중', progress: 25, note: '논문 5편 검토 완료. 추가 자료 필요', outputLink: 'https://docs.google.com/...' },
  { date: '2024-05-28', status: '진행 중', progress: 10, note: '주제 관련 논문 리스트 작성', outputLink: null },
];

export function TaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const task = sampleTasks.find(t => t.id === id) || sampleTasks[1];
  const [cancelled, setCancelled] = useState(task.cancelled ?? false);

  const prereqTasks = task.prerequisiteIds.map(pid => sampleTasks.find(t => t.id === pid)).filter(Boolean);
  const dependentTasks = sampleTasks.filter(t => t.prerequisiteIds.includes(task.id));

  const subTaskDoneRatio = task.subTasks.length > 0
    ? Math.round((task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100)
    : null;
  const progressGap = subTaskDoneRatio !== null ? Math.abs(task.progress - subTaskDoneRatio) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavBack label="뒤로" onClick={() => navigate(-1)} />
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <div className="flex items-center gap-2">
              <span className={`text-[13px] font-semibold text-[#111827] ${cancelled ? 'line-through text-[#9CA3AF]' : ''}`}>
                {task.title}
              </span>
              <SizeBadgeDs size={task.size} />
              {task.delayed && <Badge variant="danger">{task.delayDays}일 지연</Badge>}
              {cancelled && <Badge variant="default">취소됨</Badge>}
              <RiskScore score={task.riskScore} />
            </div>
          </div>
          <div>
            {!cancelled ? (
              <Btn variant="secondary" size="sm" onClick={() => setCancelled(true)}>
                <XCircle className="w-3.5 h-3.5" /> 작업 취소
              </Btn>
            ) : (
              <Btn variant="secondary" size="sm" onClick={() => setCancelled(false)}>
                <RotateCcw className="w-3.5 h-3.5" /> 복구
              </Btn>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-5">
          {/* Left main */}
          <div className="col-span-2 space-y-4">

            {/* Risk explanation */}
            <section>
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">리스크 원인</p>
              <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
                <div className="flex items-start gap-3 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-[#111827] mb-0.5">핵심 병목 작업</p>
                    <p className="text-[12px] text-[#6B7280] mb-1.5">이 작업이 완료되지 않으면 후속 작업 {dependentTasks.length}개가 시작되지 못합니다</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {dependentTasks.map(t => (
                        <span key={t.id} className="text-[11px] px-2 py-0.5 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]">{t.title}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-[#111827] mb-0.5">담당자 업데이트 부족</p>
                    <p className="text-[12px] text-[#6B7280]">박서연이 2회 연속 체크인하지 않았습니다. 작업 진행 상황을 확인하기 어렵습니다.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Progress analysis */}
            <section>
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">진행률 분석</p>
              <div className="border border-[#E5E7EB] rounded-md p-4">
                <div className="flex items-center gap-6 mb-3">
                  {subTaskDoneRatio !== null && (
                    <div>
                      <p className="text-[11px] text-[#9CA3AF] mb-0.5">하위 작업 완료율</p>
                      <p className="text-[20px] font-semibold text-[#111827]">{subTaskDoneRatio}%</p>
                      <p className="text-[11px] text-[#9CA3AF]">{task.subTasks.filter(st => st.completed).length}/{task.subTasks.length}개</p>
                    </div>
                  )}
                  <div className="h-10 w-px bg-[#E5E7EB]" />
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] mb-0.5">표시 진행률</p>
                    <p className="text-[20px] font-semibold text-[#111827]">{task.progress}%</p>
                    <p className="text-[11px] text-[#9CA3AF]">체크인 기준</p>
                  </div>
                </div>
                <ProgressBar value={task.progress} />
                {progressGap >= 30 && (
                  <div className="mt-3">
                    <AlertBanner
                      level="caution"
                      title={`하위 작업 완료율과 표시 진행률 차이 ${progressGap}%p`}
                      desc="진행률 재확인이 필요합니다."
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Sub-tasks */}
            {task.subTasks.length > 0 && (
              <section>
                <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">하위 작업</p>
                <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
                  {task.subTasks.map(st => (
                    <div key={st.id} className="flex items-center gap-3 px-4 py-2.5">
                      {st.completed
                        ? <CheckSquare className="w-4 h-4 text-[#16A34A] shrink-0" />
                        : <Square className="w-4 h-4 text-[#D1D5DB] shrink-0" />
                      }
                      <span className={`flex-1 text-[13px] ${st.completed ? 'line-through text-[#9CA3AF]' : 'text-[#374151]'}`}>
                        {st.title}
                      </span>
                      <span className="text-[11px] text-[#9CA3AF]">{memberMap[st.assigneeId]?.name || '미배정'}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Checkin history */}
            <section>
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">체크인 이력</p>
              {checkinHistory.length === 0 ? (
                <div className="border border-[#E5E7EB] rounded-md py-8 text-center">
                  <p className="text-[12px] text-[#9CA3AF]">체크인 기록이 없습니다</p>
                </div>
              ) : (
                <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
                  {checkinHistory.map((ch, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-medium text-[#111827]">{ch.date}</span>
                        <StatusChip status={ch.status} />
                        <Badge variant="default">{ch.progress}%</Badge>
                      </div>
                      {ch.note && <p className="text-[12px] text-[#6B7280]">{ch.note}</p>}
                      {ch.outputLink && (
                        <a href={ch.outputLink} className="flex items-center gap-1 text-[12px] text-[#2563EB] hover:underline mt-1">
                          <LinkIcon className="w-3 h-3" /> 산출물 링크
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Task info */}
            <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <span className="text-[12px] font-semibold text-[#374151]">작업 정보</span>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <MetaRow label="담당자">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {task.assignees.length === 0 ? (
                      <span className="text-[12px] text-[#9CA3AF] italic">미배정</span>
                    ) : (
                      task.assignees.map(aid => (
                        <span key={aid} className="text-[11px] px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[#374151]">
                          {memberMap[aid]?.name}
                        </span>
                      ))
                    )}
                  </div>
                </MetaRow>
                <Divider />
                <MetaRow label="마감일">
                  <span className={`text-[12px] ${task.delayed ? 'text-[#DC2626] font-medium' : 'text-[#374151]'}`}>
                    {task.dueDate}
                  </span>
                </MetaRow>
                <Divider />
                <MetaRow label="상태">
                  <StatusChip status={cancelled ? '취소' : task.status} />
                </MetaRow>
                <Divider />
                <MetaRow label="크기">
                  <SizeBadgeDs size={task.size} />
                </MetaRow>
                <Divider />
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1.5">진행률</p>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={task.progress} className="flex-1" />
                    <span className="text-[12px] font-semibold text-[#111827]">{task.progress}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Prerequisites */}
            {prereqTasks.length > 0 && (
              <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <span className="text-[12px] font-semibold text-[#374151]">선행 작업</span>
                </div>
                <div className="divide-y divide-[#E5E7EB]">
                  {prereqTasks.map(t => t && (
                    <div key={t.id} className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-[#111827]">{t.title}</span>
                        <StatusChip status={t.status} />
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                        {t.assignees.map(id => memberMap[id]?.name).join(', ') || '미배정'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dependents */}
            {dependentTasks.length > 0 && (
              <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <span className="text-[12px] font-semibold text-[#374151]">후속 작업</span>
                </div>
                <div className="divide-y divide-[#E5E7EB]">
                  {dependentTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/task/${t.id}`)}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#F9FAFB] transition-colors"
                    >
                      <span className="text-[12px] text-[#111827]">{t.title}</span>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                        {t.assignees.map(id => memberMap[id]?.name).join(', ') || '미배정'}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Artifacts */}
            <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <span className="text-[12px] font-semibold text-[#374151]">산출물 ({task.artifactLinks}개)</span>
              </div>
              <div className="px-4 py-3">
                {task.artifactLinks === 0 ? (
                  <p className="text-[12px] text-[#9CA3AF]">등록된 산출물이 없습니다</p>
                ) : (
                  <div className="space-y-1.5">
                    {Array.from({ length: task.artifactLinks }).map((_, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <LinkIcon className="w-3 h-3 text-[#9CA3AF]" />
                        <span className="text-[12px] text-[#2563EB] hover:underline cursor-pointer">산출물 링크 {i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-[#9CA3AF] shrink-0">{label}</span>
      <div>{children}</div>
    </div>
  );
}
