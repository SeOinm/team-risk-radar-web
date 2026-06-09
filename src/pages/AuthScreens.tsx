import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'pending' | 'invalid-link' | 'no-permission' | 'closed-project';

export function AuthScreens() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 화면 선택 탭 (데모용) */}
      <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground font-medium">화면 선택:</span>
        {([
          ['login', '로그인'],
          ['signup', '회원가입'],
          ['pending', '승인 대기'],
          ['invalid-link', '잘못된 링크'],
          ['no-permission', '권한 없음'],
          ['closed-project', '종료된 프로젝트'],
        ] as [AuthMode, string][]).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2 py-1 rounded border transition-colors ${mode === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-accent'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {mode === 'login' && (
          <div className="w-full max-w-sm space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h2>로그인</h2>
              <p className="text-sm text-muted-foreground">팀플 리스크 레이더</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="이메일 주소"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">비밀번호</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card pr-10"
                  />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => navigate('/projects')}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
              >
                로그인
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              계정이 없으신가요?{' '}
              <button onClick={() => setMode('signup')} className="text-primary hover:underline">회원가입</button>
            </p>
          </div>
        )}

        {mode === 'signup' && (
          <div className="w-full max-w-sm space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h2>회원가입</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">닉네임</label>
                <input
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="팀원들에게 표시될 이름"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="이메일 주소"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">비밀번호</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="8자 이상"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card pr-10"
                  />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => navigate('/join')}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
              >
                가입하기
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <button onClick={() => setMode('login')} className="text-primary hover:underline">로그인</button>
            </p>
          </div>
        )}

        {mode === 'pending' && (
          <div className="w-full max-w-sm text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-2">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h2>승인 대기 중</h2>
            <p className="text-sm text-muted-foreground">
              팀장 또는 공동 팀장의 승인 후 프로젝트에 참여할 수 있습니다.<br />
              승인이 완료되면 알림을 드립니다.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <p className="text-sm font-medium text-amber-800 mb-1">HCI 기말 발표 과제</p>
              <p className="text-xs text-amber-700">인간컴퓨터상호작용 · 가입 요청 완료</p>
            </div>
            <button onClick={() => navigate('/')} className="w-full py-3 border border-border rounded-xl text-sm hover:bg-accent transition-colors">
              홈으로
            </button>
          </div>
        )}

        {mode === 'invalid-link' && (
          <ExceptionState
            icon="error"
            title="잘못된 초대 링크"
            message="초대 링크가 만료되었거나 유효하지 않습니다. 팀장에게 새 링크를 요청해주세요."
            action={{ label: '홈으로', onClick: () => navigate('/') }}
          />
        )}

        {mode === 'no-permission' && (
          <ExceptionState
            icon="error"
            title="접근 권한이 없습니다"
            message="이 페이지는 팀장 또는 공동 팀장만 접근할 수 있습니다."
            action={{ label: '돌아가기', onClick: () => navigate(-1) }}
          />
        )}

        {mode === 'closed-project' && (
          <ExceptionState
            icon="lock"
            title="종료된 프로젝트"
            message="이 프로젝트는 이미 종료되었습니다. 체크인, 작업 수정, 설정 변경이 불가능합니다. 최종 리포트는 조회할 수 있습니다."
            action={{ label: '최종 리포트 보기', onClick: () => navigate('/report') }}
            secondary={{ label: '목록으로', onClick: () => navigate('/projects') }}
          />
        )}
      </div>
    </div>
  );
}

function ExceptionState({
  icon, title, message, action, secondary
}: {
  icon: 'error' | 'lock';
  title: string;
  message: string;
  action: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div className="w-full max-w-sm text-center space-y-4">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${icon === 'error' ? 'bg-red-100' : 'bg-slate-100'}`}>
        <AlertCircle className={`w-8 h-8 ${icon === 'error' ? 'text-red-500' : 'text-slate-500'}`} />
      </div>
      <h2>{title}</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="space-y-2 pt-2">
        <button onClick={action.onClick} className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
          {action.label}
        </button>
        {secondary && (
          <button onClick={secondary.onClick} className="w-full py-3 border border-border rounded-xl text-sm hover:bg-accent transition-colors">
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}
