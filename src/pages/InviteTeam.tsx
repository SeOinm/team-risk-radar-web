import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Copy, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { RoleBadge } from '@/components/RiskBadge';
import { sampleMembers, pendingMembers } from '@/data/sampleData';

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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">팀원 초대</h1>
          <p className="text-muted-foreground">초대 링크를 공유하면 팀원이 가입 요청을 보낼 수 있습니다</p>
        </div>

        <div className="space-y-5">
          {/* 초대 링크 */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="mb-3">초대 링크</h3>
            <div className="flex gap-2 mb-2">
              <div className="flex-1 px-3 py-2.5 bg-muted/30 rounded-lg font-mono text-sm text-muted-foreground border border-border truncate">
                {inviteLink}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '복사됨!' : '복사'}
              </button>
            </div>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              링크 재생성
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              재생성 시 기존 참여자는 유지되며, 기존 링크로는 새 가입이 불가능합니다.
            </p>
          </div>

          {/* 가입 승인 대기 */}
          {pendingList.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-amber-800">승인 대기 중 ({pendingList.length}명)</h3>
              </div>
              {pendingList.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.email} · 요청일 {p.requestedAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingList(prev => prev.filter(x => x.id !== p.id))}
                      className="px-3 py-1.5 border border-border bg-white rounded-lg text-xs text-red-600 hover:bg-red-50"
                    >
                      거절
                    </button>
                    <button
                      onClick={() => setPendingList(prev => prev.filter(x => x.id !== p.id))}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs"
                    >
                      승인
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 참여 팀원 */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>참여 팀원</h3>
              <span className="text-sm text-muted-foreground">{sampleMembers.length}명</span>
            </div>
            <div className="space-y-2">
              {sampleMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {m.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{m.name}</span>
                        <RoleBadge role={m.role} />
                      </div>
                      <p className="text-xs text-muted-foreground">가입일 {m.joinDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
