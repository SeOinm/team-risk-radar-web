import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { sampleMembers } from '@/data/sampleData';

type RoundStatus = '완료' | '지각' | '누락' | '일부 미업데이트';

const checkinData: { memberId: string; status: RoundStatus; consecutiveMissed: number; lateCount: number; partialCount: number }[] = [
  { memberId: 'm1', status: '완료', consecutiveMissed: 0, lateCount: 0, partialCount: 0 },
  { memberId: 'm3', status: '완료', consecutiveMissed: 0, lateCount: 0, partialCount: 0 },
  { memberId: 'm4', status: '완료', consecutiveMissed: 0, lateCount: 1, partialCount: 0 },
  { memberId: 'm2', status: '누락', consecutiveMissed: 2, lateCount: 0, partialCount: 1 },
];

const rounds = [
  { label: '이번 체크인 (6/5 수)', date: '2024-06-05' },
  { label: '이전 체크인 (6/3 월)', date: '2024-06-03' },
  { label: '이전 체크인 (5/31 금)', date: '2024-05-31' },
];

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

export function CheckinStatus() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" /> 대시보드
          </button>
          <div className="h-4 border-l border-border" />
          <h1>체크인 현황</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* 회차 선택 */}
        <div className="flex gap-2">
          {rounds.map((r, i) => (
            <button
              key={r.date}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                i === 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* 요약 */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: '완료', count: checkinData.filter(c => c.status === '완료').length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
            { label: '지각', count: checkinData.filter(c => c.status === '지각').length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
            { label: '누락', count: checkinData.filter(c => c.status === '누락').length, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
            { label: '일부 미업데이트', count: checkinData.filter(c => c.status === '일부 미업데이트').length, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 팀원별 목록 */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-sm font-medium">팀원별 체크인 현황</p>
          </div>
          <div className="divide-y divide-border">
            {checkinData.map(c => {
              const member = memberMap[c.memberId];
              return (
                <div key={c.memberId} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                      {member.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{member.name}</span>
                        <StatusIcon status={c.status} />
                      </div>
                      {c.consecutiveMissed > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {c.consecutiveMissed}회 연속 누락
                        </div>
                      )}
                      {c.status === '누락' && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                          <p className="font-medium mb-1">담당 작업 영향</p>
                          <p>• 자료 조사 (마감 5/28, 3일 지연 중)</p>
                          <p>• 발표자료 제작 (마감 6/9)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/member/${c.memberId}`)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                  >
                    참여 요약 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 히스토리 테이블 */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-sm font-medium">최근 3회차 체크인 기록</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">팀원</th>
                  {rounds.map(r => (
                    <th key={r.date} className="text-center px-4 py-2 font-medium text-muted-foreground text-xs">{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleMembers.map(m => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-center">
                      {m.id === 'm2' ? <span className="text-red-600 text-xs font-medium">누락</span> : <span className="text-emerald-600 text-xs font-medium">완료</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.id === 'm2' ? <span className="text-red-600 text-xs font-medium">누락</span> : <span className="text-emerald-600 text-xs font-medium">완료</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.id === 'm4' ? <span className="text-amber-600 text-xs font-medium">지각</span> : <span className="text-emerald-600 text-xs font-medium">완료</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusIcon({ status }: { status: RoundStatus }) {
  if (status === '완료') return <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5"><CheckCircle2 className="w-3.5 h-3.5" />완료</span>;
  if (status === '지각') return <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5"><Clock className="w-3.5 h-3.5" />지각</span>;
  if (status === '누락') return <span className="text-xs text-red-600 font-medium flex items-center gap-0.5"><XCircle className="w-3.5 h-3.5" />누락</span>;
  return <span className="text-xs text-orange-600 font-medium flex items-center gap-0.5"><AlertTriangle className="w-3.5 h-3.5" />일부 미업데이트</span>;
}
