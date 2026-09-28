import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Copy, RefreshCw, Check, X } from 'lucide-react';
import { sampleMembers, pendingMembers } from '@/data/sampleData';
import { Btn, RoleBadgeDs, Divider } from '@/components/ds';

export function InviteTeam() {
  const navigate = useNavigate();
  const [inviteLink] = useState('https://riskradar.kr/join/abc123xyz');
  const [copied, setCopied] = useState(false);
  const [pendingList, setPendingList] = useState(pendingMembers);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-6 h-full flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#111827]">팀원 초대</span>
          <p className="text-[12px] text-[#9CA3AF]">HCI 기말 발표 과제</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        {/* Invite link */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">초대 링크</span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 h-8 flex items-center border border-[#E5E7EB] rounded-md bg-[#F9FAFB]">
                <span className="text-[12px] text-[#9CA3AF] font-mono truncate">{inviteLink}</span>
              </div>
              <Btn variant={copied ? 'primary' : 'secondary'} size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '복사됨' : '복사'}
              </Btn>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] text-[#6B7280] hover:text-[#111827]">
              <RefreshCw className="w-3.5 h-3.5" />
              링크 재생성
            </button>
            <p className="text-[11px] text-[#9CA3AF]">
              재생성 시 기존 참여자는 유지되며, 기존 링크로는 새 가입이 불가능합니다.
            </p>
          </div>
        </section>

        {/* Pending approvals */}
        {pendingList.length > 0 && (
          <section className="border border-[#FDE68A] bg-[#FFFBEB] rounded-md overflow-hidden">
            <div className="px-5 py-3 border-b border-[#FDE68A]">
              <span className="text-[12px] font-semibold text-[#78350F]">승인 대기 ({pendingList.length}명)</span>
            </div>
            <div className="divide-y divide-[#FDE68A]">
              {pendingList.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[12px] font-semibold text-[#92400E] shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-[#111827]">{p.name}</span>
                    <p className="text-[11px] text-[#9CA3AF]">{p.email} · {p.requestedAt}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Btn variant="secondary" size="sm" onClick={() => setPendingList(prev => prev.filter(x => x.id !== p.id))}>
                      <X className="w-3 h-3" /> 거절
                    </Btn>
                    <Btn variant="primary" size="sm" onClick={() => setPendingList(prev => prev.filter(x => x.id !== p.id))}>
                      <Check className="w-3 h-3" /> 승인
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Members */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">참여 팀원</span>
            <span className="text-[12px] text-[#9CA3AF]">{sampleMembers.length}명</span>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {sampleMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[12px] font-semibold text-[#374151] shrink-0">
                  {m.name[0]}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#111827]">{m.name}</span>
                  <RoleBadgeDs role={m.role} />
                </div>
                <span className="text-[11px] text-[#9CA3AF] ml-auto">가입 {m.joinDate}</span>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        <Btn variant="primary" className="w-full h-11 text-[14px]" onClick={() => navigate('/dashboard')}>
          대시보드로 이동
        </Btn>
      </main>
    </div>
  );
}
