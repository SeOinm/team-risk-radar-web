import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, X, Shield, UserX, ChevronRight, AlertCircle } from 'lucide-react';
import { RoleBadge } from '@/components/RiskBadge';
import { sampleMembers, pendingMembers } from '@/data/sampleData';

export function MemberManage() {
  const navigate = useNavigate();
  const [pendingList, setPendingList] = useState(pendingMembers);
  const [members, setMembers] = useState(sampleMembers);
  const [confirmKick, setConfirmKick] = useState<string | null>(null);

  const approvePending = (id: string) => {
    setPendingList(prev => prev.filter(p => p.id !== id));
  };

  const rejectPending = (id: string) => {
    setPendingList(prev => prev.filter(p => p.id !== id));
  };

  const kickMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setConfirmKick(null);
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" /> 대시보드
          </button>
          <div className="h-4 border-l border-border" />
          <h1>팀원 관리</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* 가입 승인 대기 */}
        {pendingList.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-amber-800">가입 요청 대기 중 ({pendingList.length}명)</h3>
            </div>
            <div className="space-y-3">
              {pendingList.map(p => (
                <div key={p.id} className="bg-white border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-medium text-amber-700">
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.email} · 요청일 {p.requestedAt}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rejectPending(p.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-red-50 text-sm text-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> 거절
                    </button>
                    <button
                      onClick={() => approvePending(p.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm transition-opacity hover:opacity-90"
                    >
                      <Check className="w-3.5 h-3.5" /> 승인
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 팀장 보호 규칙 */}
        <div className="flex items-start gap-2 p-3 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-700">
          <Shield className="w-4 h-4 shrink-0 mt-0.5" />
          <p>팀장 또는 공동 팀장은 최소 1명이 남아있어야 합니다. 다른 팀장은 내보낼 수 없습니다.</p>
        </div>

        {/* 팀원 목록 */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-medium">팀원 목록 ({members.length}명)</p>
          </div>
          <div className="divide-y divide-border">
            {members.map(m => {
              const isCurrentUser = m.id === 'm1'; // 김지훈 (현재 사용자 = 팀장)
              const canKick = !isCurrentUser && m.role !== '팀장';
              const canPromote = m.role === '팀원';

              return (
                <div key={m.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {m.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm">{m.name}</span>
                        <RoleBadge role={m.role} />
                        {isCurrentUser && <span className="text-xs text-muted-foreground">(나)</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>가입일 {m.joinDate}</span>
                        <span>담당 작업 {m.taskCount}개</span>
                        <span>체크인 참여율 {m.checkinRate}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/member/${m.id}`)}
                      className="text-xs text-primary hover:underline flex items-center gap-0.5"
                    >
                      참여 요약 <ChevronRight className="w-3 h-3" />
                    </button>
                    {canPromote && (
                      <button className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-white hover:bg-indigo-50 text-xs text-indigo-600 transition-colors">
                        <Shield className="w-3 h-3" /> 공동 팀장 지정
                      </button>
                    )}
                    {canKick && (
                      <button
                        onClick={() => setConfirmKick(m.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-xs text-red-500 transition-colors"
                      >
                        <UserX className="w-3 h-3" /> 내보내기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 내보내기 확인 모달 */}
        {confirmKick && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-xl">
              <h3 className="mb-2">팀원 내보내기</h3>
              <p className="text-sm text-muted-foreground mb-1">
                {members.find(m => m.id === confirmKick)?.name}님을 프로젝트에서 내보내시겠습니까?
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                담당 작업은 미배정 처리되며, 해당 팀원의 기록은 '탈퇴한 팀원'으로 유지됩니다.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmKick(null)} className="flex-1 py-2 border border-border rounded-lg text-sm">취소</button>
                <button onClick={() => kickMember(confirmKick)} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm">내보내기</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
