import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, X, Shield, UserX } from 'lucide-react';
import { sampleMembers, pendingMembers } from '@/data/sampleData';
import { Btn, RoleBadgeDs, AlertBanner, Divider, NavBack } from '@/components/ds';

export function MemberManage() {
  const navigate = useNavigate();
  const [pendingList, setPendingList] = useState(pendingMembers);
  const [members, setMembers] = useState(sampleMembers);
  const [confirmKick, setConfirmKick] = useState<string | null>(null);

  const approvePending = (id: string) => setPendingList(prev => prev.filter(p => p.id !== id));
  const rejectPending = (id: string) => setPendingList(prev => prev.filter(p => p.id !== id));
  const kickMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setConfirmKick(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-3xl mx-auto px-6 w-full flex items-center gap-3">
          <NavBack label="대시보드" onClick={() => navigate('/dashboard')} />
          <div className="h-4 w-px bg-[#E5E7EB]" />
          <span className="text-[13px] font-semibold text-[#111827]">팀원 관리</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-5 space-y-5">
        {/* Pending approvals */}
        {pendingList.length > 0 && (
          <section>
            <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">
              가입 요청 ({pendingList.length}명)
            </p>
            <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-md overflow-hidden divide-y divide-[#FDE68A]">
              {pendingList.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[12px] font-semibold text-[#92400E] shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-[#111827]">{p.name}</span>
                    <p className="text-[11px] text-[#9CA3AF]">{p.email} · 요청일 {p.requestedAt}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Btn variant="secondary" size="sm" onClick={() => rejectPending(p.id)}>
                      <X className="w-3 h-3" /> 거절
                    </Btn>
                    <Btn variant="primary" size="sm" onClick={() => approvePending(p.id)}>
                      <Check className="w-3 h-3" /> 승인
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Leader protection note */}
        <AlertBanner
          level="info"
          title="팀장·공동 팀장은 최소 1명이 남아있어야 합니다"
          desc="다른 팀장 역할의 팀원은 내보낼 수 없습니다."
        />

        {/* Member list */}
        <section>
          <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">
            팀원 목록 ({members.length}명)
          </p>
          <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
            {members.map(m => {
              const isCurrentUser = m.id === 'm1';
              const canKick = !isCurrentUser && m.role !== '팀장';
              const canPromote = m.role === '팀원';

              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[12px] font-semibold text-[#374151] shrink-0">
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-medium text-[#111827]">{m.name}</span>
                      <RoleBadgeDs role={m.role} />
                      {isCurrentUser && <span className="text-[11px] text-[#9CA3AF]">(나)</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#9CA3AF]">
                      <span>가입 {m.joinDate}</span>
                      <span>작업 {m.taskCount}개</span>
                      <span>체크인 {m.checkinRate}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => navigate(`/member/${m.id}`)}
                      className="text-[12px] text-[#6B7280] hover:text-[#111827]"
                    >
                      참여 요약 →
                    </button>
                    {canPromote && (
                      <Btn variant="secondary" size="sm">
                        <Shield className="w-3 h-3" /> 공동 팀장
                      </Btn>
                    )}
                    {canKick && (
                      <Btn variant="secondary" size="sm" onClick={() => setConfirmKick(m.id)}
                        className="text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]">
                        <UserX className="w-3 h-3" /> 내보내기
                      </Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Kick confirm modal */}
      {confirmKick && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#E5E7EB] p-6 max-w-sm w-full">
            <h3 className="text-[15px] font-semibold text-[#111827] mb-2">팀원 내보내기</h3>
            <p className="text-[13px] text-[#374151] mb-1">
              {members.find(m => m.id === confirmKick)?.name}님을 프로젝트에서 내보내시겠습니까?
            </p>
            <p className="text-[12px] text-[#9CA3AF] mb-5">
              담당 작업은 미배정 처리되며, 해당 팀원의 기록은 탈퇴한 팀원으로 유지됩니다.
            </p>
            <Divider className="mb-4" />
            <div className="flex gap-2">
              <Btn variant="secondary" className="flex-1" onClick={() => setConfirmKick(null)}>취소</Btn>
              <Btn variant="danger" className="flex-1" onClick={() => kickMember(confirmKick)}>내보내기</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
