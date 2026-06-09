import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, RefreshCw, Copy, AlertOctagon } from 'lucide-react';

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
        : prev.length < checkinFreq
          ? [...prev, day]
          : prev
    );
  };

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" /> 대시보드
          </button>
          <div className="h-4 border-l border-border" />
          <h1>프로젝트 설정</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* 기본 정보 */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3>기본 정보</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">프로젝트명</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">수업명</label>
              <input
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">최종 마감일</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>
        </section>

        {/* 체크인 설정 */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3>체크인 설정</h3>

          <div>
            <label className="text-sm font-medium mb-2 block">체크인 주기</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setCheckinFreq(n)}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                    checkinFreq === n ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-sm text-muted-foreground self-center">회/주</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">체크인 요일 ({checkinDays.length}/{checkinFreq})</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                    checkinDays.includes(d) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">체크인 마감 시간</label>
            <input
              type="time"
              value={checkinTime}
              onChange={e => setCheckinTime(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">마감 이후 제출 시 지각 체크인으로 기록됩니다</p>
          </div>
        </section>

        {/* 초대 링크 */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-3">
          <h3>초대 링크 관리</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-muted/30 font-mono text-muted-foreground truncate">
              {inviteLink}
            </div>
            <button onClick={copyLink} className="flex items-center gap-1 px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors shrink-0">
              <Copy className="w-3.5 h-3.5" />
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            링크 재생성
          </button>
          <p className="text-xs text-muted-foreground">
            재생성 시 기존 참여자는 유지되며, 기존 링크로는 새 가입이 불가능합니다.
          </p>
        </section>

        {/* 팀원 관리 이동 */}
        <section className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1">팀원 관리</h3>
              <p className="text-sm text-muted-foreground">가입 승인, 역할 변경, 팀원 내보내기</p>
            </div>
            <button
              onClick={() => navigate('/members')}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors"
            >
              팀원 관리 →
            </button>
          </div>
        </section>

        {/* 저장 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
          >
            {saved ? '저장됨 ✓' : '설정 저장'}
          </button>
        </div>

        {/* 위험 영역 */}
        <section className="border border-red-200 rounded-xl p-6 bg-red-50/50">
          <h3 className="text-red-700 mb-2">위험 영역</h3>
          <p className="text-sm text-muted-foreground mb-4">
            프로젝트를 종료하면 체크인, 작업 수정, 팀원 추가, 설정 변경이 불가능해집니다.
          </p>
          <button
            onClick={() => navigate('/close-project')}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 bg-white text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
          >
            <AlertOctagon className="w-4 h-4" />
            프로젝트 종료
          </button>
        </section>
      </main>
    </div>
  );
}
