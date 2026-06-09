import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Clock, Calendar, Users, AlertCircle } from 'lucide-react';

type JoinState = 'view' | 'pending';

export function JoinTeam() {
  const navigate = useNavigate();
  const [state, setState] = useState<JoinState>('view');

  if (state === 'pending') {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-sm min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="mb-2">가입 요청 완료</h2>
          <p className="text-sm text-muted-foreground mb-5">
            팀장 또는 공동 팀장이 승인하면 프로젝트에 참여할 수 있습니다.
            승인 전까지는 프로젝트 내용을 볼 수 없습니다.
          </p>
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-amber-800 mb-1">HCI 기말 발표 과제</p>
            <p className="text-xs text-amber-700">인간컴퓨터상호작용 · 가입 요청 완료</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 border border-border rounded-xl text-sm text-muted-foreground"
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-sm min-h-screen px-6 py-10">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-semibold">팀플 리스크 레이더</span>
        </div>

        {/* 프로젝트 정보 */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <p className="text-xs text-muted-foreground mb-1">초대된 프로젝트</p>
          <h2 className="mb-0.5">HCI 기말 발표 과제</h2>
          <p className="text-sm text-muted-foreground mb-4">인간컴퓨터상호작용</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>최종 마감일: 2024년 6월 13일</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>체크인: 주 3회 (월·수·금) 23:59까지</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0" />
              <span>현재 팀원 4명</span>
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 text-xs text-sky-700">
          <p className="font-semibold mb-1">가입 절차 안내</p>
          <ol className="space-y-1 list-decimal list-inside">
            <li>로그인 또는 회원가입이 필요합니다</li>
            <li>가입 요청 후 팀장 승인을 기다려주세요</li>
            <li>승인 완료 후 프로젝트에 참여할 수 있습니다</li>
          </ol>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setState('pending')}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
          >
            가입 요청하기
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            로그인 / 회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
