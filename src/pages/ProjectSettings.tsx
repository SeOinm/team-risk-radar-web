import { useState } from 'react';
import { useNavigate } from 'react-router';
import { RefreshCw, Copy, AlertOctagon } from 'lucide-react';
import { Btn, Input, NavBack } from '@/components/ds';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export function ProjectSettings() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('HCI 기말 발표 과제');
  const [className, setClassName] = useState('인간컴퓨터상호작용');
  const [deadline, setDeadline] = useState('2024-06-13');
  const [checkinFreq, setCheckinFreq] = useState(3);
  const [checkinDays, setCheckinDays] = useState(['월', '수', '금']);
  const [checkinTime, setCheckinTime] = useState('23:59');
  const [inviteLink] = useState('https://riskradar.kr/join/abc123xyz');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleDay = (day: string) => {
    setCheckinDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : prev.length < checkinFreq ? [...prev, day] : prev
    );
  };

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-2xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavBack label="대시보드" onClick={() => navigate('/dashboard')} />
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <span className="text-[13px] font-semibold text-[#111827]">프로젝트 설정</span>
          </div>
          <Btn
            variant="primary"
            size="sm"
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          >
            {saved ? '저장됨 ✓' : '설정 저장'}
          </Btn>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {/* Basic info */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">기본 정보</span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <Input label="프로젝트명" value={title} onChange={e => setTitle(e.target.value)} />
            <Input label="수업명" value={className} onChange={e => setClassName(e.target.value)} />
            <Input label="최종 마감일" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
        </section>

        {/* Check-in settings */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-[12px] font-semibold text-[#374151]">체크인 설정</span>
          </div>
          <div className="px-5 py-4 space-y-4">
            {/* Frequency */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">체크인 주기</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setCheckinFreq(n)}
                    className={`w-9 h-9 rounded-md border text-[13px] font-medium transition-colors ${
                      checkinFreq === n ? 'bg-[#111827] text-white border-[#111827]' : 'border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#374151]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <span className="text-[12px] text-[#9CA3AF] ml-1">회/주</span>
              </div>
            </div>

            {/* Days */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-2">
                체크인 요일 <span className="text-[11px] text-[#9CA3AF] font-normal">({checkinDays.length}/{checkinFreq})</span>
              </label>
              <div className="flex gap-1.5">
                {DAYS.map(d => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`w-9 h-9 rounded-md border text-[12px] font-medium transition-colors ${
                      checkinDays.includes(d) ? 'bg-[#111827] text-white border-[#111827]' : 'border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#374151]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">체크인 마감 시간</label>
              <input
                type="time"
                value={checkinTime}
                onChange={e => setCheckinTime(e.target.value)}
                className="h-8 px-3 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md outline-none focus:ring-1 focus:ring-[#111827]"
              />
              <p className="text-[11px] text-[#9CA3AF] mt-1">마감 이후 제출 시 지각 체크인으로 기록됩니다</p>
            </div>
          </div>
        </section>

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
              <Btn variant="secondary" size="sm" onClick={copyLink}>
                <Copy className="w-3.5 h-3.5" />
                {copied ? '복사됨!' : '복사'}
              </Btn>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              링크 재생성
            </button>
            <p className="text-[11px] text-[#9CA3AF]">
              재생성 시 기존 참여자는 유지되며, 기존 링크로는 새 가입이 불가능합니다.
            </p>
          </div>
        </section>

        {/* Member management */}
        <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[13px] font-medium text-[#111827]">팀원 관리</p>
              <p className="text-[12px] text-[#9CA3AF]">가입 승인, 역할 변경, 팀원 내보내기</p>
            </div>
            <Btn variant="secondary" size="sm" onClick={() => navigate('/members')}>
              팀원 관리 →
            </Btn>
          </div>
        </section>

        {/* Danger zone */}
        <section className="border border-[#FECACA] rounded-md overflow-hidden">
          <div className="px-5 py-3 bg-[#FEF2F2] border-b border-[#FECACA]">
            <span className="text-[12px] font-semibold text-[#991B1B]">위험 영역</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-[13px] text-[#374151] mb-3">
              프로젝트를 종료하면 체크인, 작업 수정, 팀원 추가, 설정 변경이 불가능해집니다.
            </p>
            <Btn
              variant="secondary"
              size="sm"
              onClick={() => navigate('/close-project')}
              className="text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              프로젝트 종료
            </Btn>
          </div>
        </section>
      </main>
    </div>
  );
}
