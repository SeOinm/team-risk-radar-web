import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { sampleMembers } from '@/data/sampleData';
import { CheckDot, NavBack } from '@/components/ds';

type RoundStatus = '완료' | '지각' | '누락' | '일부 미업데이트';

const checkinData: { memberId: string; status: RoundStatus; consecutiveMissed: number }[] = [
  { memberId: 'm1', status: '완료', consecutiveMissed: 0 },
  { memberId: 'm3', status: '완료', consecutiveMissed: 0 },
  { memberId: 'm4', status: '지각', consecutiveMissed: 0 },
  { memberId: 'm2', status: '누락', consecutiveMissed: 2 },
];

const rounds = [
  { label: '이번 체크인', sub: '6/5 수', date: '2024-06-05' },
  { label: '이전 체크인', sub: '6/3 월', date: '2024-06-03' },
  { label: '이전 체크인', sub: '5/31 금', date: '2024-05-31' },
];

const historyData: Record<string, ('완료' | '지각' | '누락')[]> = {
  'm1': ['완료', '완료', '완료'],
  'm2': ['누락', '누락', '완료'],
  'm3': ['완료', '완료', '완료'],
  'm4': ['지각', '완료', '완료'],
};

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

export function CheckinStatus() {
  const navigate = useNavigate();
  const [selectedRound, setSelectedRound] = useState(0);

  const done = checkinData.filter(c => c.status === '완료').length;
  const late = checkinData.filter(c => c.status === '지각').length;
  const missed = checkinData.filter(c => c.status === '누락').length;

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-4xl mx-auto px-6 w-full flex items-center gap-3">
          <NavBack label="대시보드" onClick={() => navigate('/dashboard')} />
          <div className="h-4 w-px bg-[#E5E7EB]" />
          <span className="text-[13px] font-semibold text-[#111827]">체크인 현황</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-5 space-y-5">
        {/* Round selector */}
        <div className="flex items-center gap-1">
          {rounds.map((r, i) => (
            <button
              key={r.date}
              onClick={() => setSelectedRound(i)}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-[12px] font-medium border transition-colors ${
                selectedRound === i
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]'
              }`}
            >
              {r.label}
              <span className={`text-[11px] ${selectedRound === i ? 'text-white/70' : 'text-[#9CA3AF]'}`}>{r.sub}</span>
            </button>
          ))}
        </div>

        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-[#E5E7EB] rounded-md p-4">
            <p className="text-[22px] font-semibold text-[#16A34A]">{done}</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5">완료</p>
          </div>
          <div className="border border-[#E5E7EB] rounded-md p-4">
            <p className="text-[22px] font-semibold text-[#D97706]">{late}</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5">지각</p>
          </div>
          <div className="border border-[#E5E7EB] rounded-md p-4">
            <p className="text-[22px] font-semibold text-[#DC2626]">{missed}</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5">누락</p>
          </div>
        </div>

        {/* Member detail list */}
        <section>
          <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">팀원별 현황</p>
          <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
            {checkinData.map(c => {
              const member = memberMap[c.memberId];
              return (
                <div key={c.memberId} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[12px] font-semibold text-[#374151] shrink-0">
                        {member.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#111827]">{member.name}</span>
                          <CheckDot
                            done={c.status === '완료'}
                            late={c.status === '지각'}
                            missed={c.status === '누락'}
                          />
                          {c.consecutiveMissed > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-[#DC2626]">
                              <AlertTriangle className="w-3 h-3" />{c.consecutiveMissed}회 연속 누락
                            </span>
                          )}
                        </div>
                        {c.status === '누락' && (
                          <div className="mt-1.5 text-[11px] text-[#9A3412] bg-[#FFF7ED] border border-[#FED7AA] rounded px-2 py-1.5">
                            <p className="font-medium mb-0.5">담당 작업 영향</p>
                            <p>· 자료 조사 (마감 5/28, 3일 지연 중)</p>
                            <p>· 발표자료 제작 (마감 6/9)</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/member/${c.memberId}`)}
                      className="text-[12px] text-[#6B7280] hover:text-[#111827] whitespace-nowrap shrink-0 mt-0.5"
                    >
                      참여 요약 →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* History table */}
        <section>
          <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">최근 3회차 기록</p>
          <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF]">팀원</th>
                  {rounds.map(r => (
                    <th key={r.date} className="text-center px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF]">
                      {r.sub}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {sampleMembers.map(m => (
                  <tr key={m.id}>
                    <td className="px-4 py-2.5 text-[12px] font-medium text-[#374151]">{m.name}</td>
                    {(historyData[m.id] || ['완료', '완료', '완료']).map((s, i) => (
                      <td key={i} className="px-4 py-2.5 text-center">
                        <CheckDot
                          done={s === '완료'}
                          late={s === '지각'}
                          missed={s === '누락'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
