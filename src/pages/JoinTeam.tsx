import { InviteJoin } from '@/pages/InviteJoin';
import { BrandLogo } from '@/components/BrandLogo';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Clock, Calendar, Users } from 'lucide-react';
import { Btn } from '@/components/ds';

type JoinState = 'view' | 'pending';

export function JoinTeam() {
  const [params] = useSearchParams();
  const token = params.get('token');
  if (token) return <InviteJoin key={token} token={token} />;
  return <JoinDemo />;
}

function JoinDemo() {
  const navigate = useNavigate();
  const [state, setState] = useState<JoinState>('view');

  if (state === 'pending') {
    return (
      <div className="min-h-screen bg-white flex justify-center">
        <div className="w-full max-w-[390px] min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center mb-5">
            <span className="text-[24px]">⏳</span>
          </div>
          <p className="text-[18px] font-semibold text-[#111827] mb-2">가입 요청 완료</p>
          <p className="text-[13px] text-[#6B7280] mb-5">
            팀장 또는 공동 팀장이 승인하면 프로젝트에 참여할 수 있습니다.
            승인 전까지는 프로젝트 내용을 볼 수 없습니다.
          </p>
          <div className="w-full border border-[#FDE68A] bg-[#FFFBEB] rounded-md px-4 py-3 text-left mb-6">
            <p className="text-[13px] font-medium text-[#78350F]">HCI 기말 발표 과제</p>
            <p className="text-[11px] text-[#92400E]">인간컴퓨터상호작용 · 가입 요청 완료</p>
          </div>
          <Btn variant="secondary" className="w-full h-10" onClick={() => navigate('/')}>홈으로</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen px-4 py-8">
        <p className="text-xs text-muted-foreground mb-4">초대 화면 샘플입니다. 실제 참여는 초대 링크로 접속해주세요.</p>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <BrandLogo />
        </div>

        {/* Project info */}
        <div className="border border-[#E5E7EB] rounded-md p-4 mb-4">
          <p className="text-[11px] text-[#9CA3AF] mb-1">초대된 프로젝트</p>
          <p className="text-[16px] font-semibold text-[#111827] mb-0.5">HCI 기말 발표 과제</p>
          <p className="text-[12px] text-[#9CA3AF] mb-4">인간컴퓨터상호작용</p>
          <div className="space-y-2">
            {[
              { Icon: Calendar, text: '최종 마감일: 2024년 6월 13일' },
              { Icon: Clock, text: '체크인: 주 3회 (월·수·금) 23:59까지' },
              { Icon: Users, text: '현재 팀원 4명' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Guide */}
        <div className="border border-[#BFDBFE] bg-[#EFF6FF] rounded-md px-4 py-3 mb-5">
          <p className="text-[12px] font-semibold text-[#1E3A8A] mb-1">가입 절차 안내</p>
          <ol className="space-y-1 text-[11px] text-[#1E40AF] list-decimal list-inside">
            <li>로그인 또는 회원가입이 필요합니다</li>
            <li>가입 요청 후 팀장 승인을 기다려주세요</li>
            <li>승인 완료 후 프로젝트에 참여할 수 있습니다</li>
          </ol>
        </div>

        <div className="space-y-2">
          <Btn variant="primary" className="w-full h-11 text-[14px]" onClick={() => setState('pending')}>
            가입 요청하기
          </Btn>
          <Btn variant="secondary" className="w-full h-11 text-[14px]" onClick={() => navigate('/auth')}>
            로그인 / 회원가입
          </Btn>
        </div>
      </div>
    </div>
  );
}
