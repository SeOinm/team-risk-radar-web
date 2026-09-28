import { useNavigate } from 'react-router';
import { Link as LinkIcon } from 'lucide-react';
import { sampleMembers } from '@/data/sampleData';
import { Badge, RoleBadgeDs, NavBack } from '@/components/ds';

const projectSummary = {
  name: 'HCI 기말 발표 과제',
  course: '인간컴퓨터상호작용',
  startDate: '2024-04-01',
  endDate: '2024-06-13',
  totalTasks: 7,
  completedTasks: 1,
  totalCheckins: 15,
  completedCheckins: 12,
};

const memberSummary = [
  { id: 'm1', checkinRate: 100, completedTasks: 1, delayedTasks: 0, lateCheckins: 0, missedCheckins: 0, artifactLinks: 2 },
  { id: 'm2', checkinRate: 40, completedTasks: 0, delayedTasks: 1, lateCheckins: 0, missedCheckins: 2, artifactLinks: 0 },
  { id: 'm3', checkinRate: 100, completedTasks: 0, delayedTasks: 0, lateCheckins: 0, missedCheckins: 0, artifactLinks: 0 },
  { id: 'm4', checkinRate: 80, completedTasks: 0, delayedTasks: 0, lateCheckins: 1, missedCheckins: 0, artifactLinks: 0 },
];

const outputs = [
  { taskName: '주제 확정', assignee: '김지훈', date: '2024-05-01', link: 'https://docs.google.com/...' },
  { taskName: '자료 조사', assignee: '박서연', date: '2024-05-30', link: 'https://docs.google.com/...' },
];

const blockedHistory = [
  { taskName: '자료 조사', assignee: '박서연', date: '2024-05-28', reason: '자료 부족', resolved: false },
];

const checkinMissedHistory = [
  { name: '박서연', date: '2024-06-03', consecutive: 1 },
  { name: '박서연', date: '2024-06-05', consecutive: 2 },
];

const cancelledTasks: { title: string; cancelledAt: string }[] = [];
const assigneeChanges: { taskName: string; from: string; to: string; date: string }[] = [];

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

export function FinalReport() {
  const navigate = useNavigate();
  const checkinRate = Math.round((projectSummary.completedCheckins / projectSummary.totalCheckins) * 100);

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center justify-between px-6">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavBack label="대시보드" onClick={() => navigate('/dashboard')} />
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <span className="text-[13px] font-semibold text-[#111827]">최종 리포트</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF]">PDF 내보내기는 MVP 이후 제공 예정</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">

        {/* Project Summary */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">프로젝트 요약</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-[16px] font-semibold text-[#111827] mb-1">{projectSummary.name}</p>
            <p className="text-[12px] text-[#9CA3AF] mb-4">{projectSummary.course} · {projectSummary.startDate} ~ {projectSummary.endDate}</p>
            <div className="grid grid-cols-4 gap-4">
              <Stat label="팀원" value={`${sampleMembers.length}명`} />
              <Stat label="작업 완료" value={`${projectSummary.completedTasks}/${projectSummary.totalTasks}`} />
              <Stat label="체크인 완료율" value={`${checkinRate}%`} warn={checkinRate < 70} />
              <Stat label="지연 작업" value="1개" warn />
            </div>
          </div>
        </section>

        {/* Member summary */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">팀원별 참여 요약</span>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {memberSummary.map((ms) => {
              const member = memberMap[ms.id];
              if (!member) return null;
              return (
                <div key={ms.id} className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[12px] font-semibold text-[#374151]">
                      {member.name[0]}
                    </div>
                    <span className="text-[13px] font-medium text-[#111827]">{member.name}</span>
                    <RoleBadgeDs role={member.role} />
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    <Stat label="체크인율" value={`${ms.checkinRate}%`} warn={ms.checkinRate < 70} />
                    <Stat label="완료 작업" value={`${ms.completedTasks}개`} />
                    <Stat label="지연 작업" value={`${ms.delayedTasks}개`} warn={ms.delayedTasks > 0} />
                    <Stat label="지각 체크인" value={`${ms.lateCheckins}회`} warn={ms.lateCheckins > 1} />
                    <Stat label="누락 체크인" value={`${ms.missedCheckins}회`} warn={ms.missedCheckins > 0} />
                    <Stat label="산출물" value={`${ms.artifactLinks}개`} warn={ms.artifactLinks === 0} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Artifacts */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">산출물 근거</span>
          </div>
          {outputs.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-[#9CA3AF]">등록된 산출물이 없습니다</div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {outputs.map((o, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-[#111827]">{o.taskName}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{o.assignee} · {o.date}</p>
                  </div>
                  <a href={o.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[12px] text-[#2563EB] hover:underline">
                    <LinkIcon className="w-3 h-3" /> 링크 보기
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Blocked history */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">막힘 기록</span>
          </div>
          {blockedHistory.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-[#9CA3AF]">막힘 기록이 없습니다</div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {blockedHistory.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-[#111827]">{r.taskName}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{r.assignee} · {r.date} · 사유: {r.reason}</p>
                  </div>
                  <Badge variant={r.resolved ? 'safe' : 'caution'}>
                    {r.resolved ? '해결됨' : '미해결'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Check-in missed history */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">체크인 누락 기록</span>
          </div>
          {checkinMissedHistory.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-[#9CA3AF]">모든 팀원이 정기적으로 체크인에 참여했습니다</div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {checkinMissedHistory.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[13px] text-[#111827]">{r.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#9CA3AF]">{r.date}</span>
                    <Badge variant="critical">연속 {r.consecutive}회 누락</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cancelled tasks */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">취소 작업 기록</span>
          </div>
          {cancelledTasks.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-[#9CA3AF]">취소된 작업이 없습니다</div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {cancelledTasks.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[13px] text-[#9CA3AF] line-through">{t.title}</span>
                  <span className="text-[11px] text-[#9CA3AF]">{t.cancelledAt}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Assignee changes */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">담당자 변경 이력</span>
          </div>
          {assigneeChanges.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-[#9CA3AF]">담당자 변경 이력이 없습니다</div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {assigneeChanges.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <span className="text-[13px] text-[#111827]">{c.taskName}</span>
                    <span className="text-[12px] text-[#9CA3AF] ml-2">{c.from} → {c.to}</span>
                  </div>
                  <span className="text-[11px] text-[#9CA3AF]">{c.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`p-2.5 rounded-md border ${warn ? 'bg-[#FEF2F2] border-[#FECACA]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}>
      <p className="text-[10px] text-[#9CA3AF] mb-0.5">{label}</p>
      <p className={`text-[14px] font-semibold ${warn ? 'text-[#DC2626]' : 'text-[#111827]'}`}>{value}</p>
    </div>
  );
}
