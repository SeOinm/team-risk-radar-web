import { useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { authApi, AuthApiError, type FieldErrors } from '@/api/auth';
import { useAuth } from '@/auth/context';
import { validateAuthInput } from '@/auth/validation';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Btn, Input } from '@/components/ds';


type AuthMode = 'login' | 'signup' | 'pending' | 'invalid-link' | 'no-permission' | 'closed-project';

export function AuthScreens() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, notice } = useAuth();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [info, setInfo] = useState('');
  const from: unknown = location.state?.from;
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/auth') ? from : '/projects';
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const switchMode = (next: AuthMode) => {
    if (inFlight.current) return;
    setMode(next);
    setError('');
    setFieldErrors({});
    setInfo('');
    setPassword('');
    setShowPw(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const input = mode === 'signup' ? { email, password, nickname } : { email, password };
    const validation = validateAuthInput(input);
    setFieldErrors(validation);
    setError('');
    setInfo('');
    if (Object.keys(validation).length > 0) return;
    inFlight.current = true;
    setBusy(true);
    try {
      if (mode === 'signup') {
        await authApi.register({ email, password, nickname });
        setEmail(email.trim().toLowerCase());
        setPassword('');
        setShowPw(false);
        setMode('login');
        setInfo('회원가입이 완료되었습니다. 가입한 이메일로 로그인해주세요.');
      } else {
        await login({ email, password });
        setPassword('');
        navigate(destination, { replace: true });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '요청을 처리하지 못했습니다.');
      if (error instanceof AuthApiError) setFieldErrors(error.fieldErrors);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Demo selector bar */}
      <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-6 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-medium text-[#9CA3AF] mr-1">화면 선택</span>
        {([
          ['login', '로그인'],
          ['signup', '회원가입'],
          ['pending', '승인 대기'],
          ['invalid-link', '잘못된 링크'],
          ['no-permission', '권한 없음'],
          ['closed-project', '종료 프로젝트'],
        ] as [AuthMode, string][]).map(([m, label]) => (
          <button
            key={m}
            disabled={busy} onClick={() => switchMode(m)}
            className={`px-2.5 h-7 rounded text-[11px] font-medium border transition-colors ${
              mode === m ? 'bg-[#111827] text-white border-[#111827]' : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F3F4F6]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {mode === 'login' && (
          <div className="w-full max-w-[360px] space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-[#F3F4F6] rounded-md mb-3">
                <Shield className="w-5 h-5 text-[#111827]" />
              </div>
              <p className="text-[18px] font-semibold text-[#111827]">로그인</p>
              <p className="text-[12px] text-[#9CA3AF]">팀플 리스크 레이더</p>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              <Input disabled={busy} autoComplete="email" maxLength={255} aria-invalid={Boolean(fieldErrors.email)} label="이메일" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 주소" />
              <FieldError message={fieldErrors.email} />
              <div className="space-y-1">
                <label htmlFor="login-password" className="block text-[13px] font-medium text-[#374151]">비밀번호</label>
                <div className="relative">
                  <input
                    id="login-password" disabled={busy} autoComplete="current-password" maxLength={72} aria-invalid={Boolean(fieldErrors.password)}
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    className="w-full h-8 px-3 pr-9 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                  <button type="button" disabled={busy} aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'} onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <FieldError message={fieldErrors.password} />
              {error && <p role="alert" className="text-[12px] text-[#DC2626]">{error}</p>}
              {(info || notice) && <p role="status" className="text-[12px] text-[#2563EB]">{info || notice}</p>}
              <Btn type="submit" disabled={busy} variant="primary" className="w-full h-10 text-[13px]">{busy ? '로그인 중…' : '로그인'}</Btn>
            </form>
            <p className="text-center text-[12px] text-[#9CA3AF]">
              계정이 없으신가요?{' '}
              <button disabled={busy} onClick={() => switchMode('signup')} className="text-[#2563EB] hover:underline">회원가입</button>
            </p>
          </div>
        )}

        {mode === 'signup' && (
          <div className="w-full max-w-[360px] space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-[#F3F4F6] rounded-md mb-3">
                <Shield className="w-5 h-5 text-[#111827]" />
              </div>
              <p className="text-[18px] font-semibold text-[#111827]">회원가입</p>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              <Input disabled={busy} autoComplete="nickname" maxLength={50} aria-invalid={Boolean(fieldErrors.nickname)} label="닉네임" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="팀원들에게 표시될 이름" />
              <FieldError message={fieldErrors.nickname} />
              <Input disabled={busy} autoComplete="email" maxLength={255} aria-invalid={Boolean(fieldErrors.email)} label="이메일" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 주소" />
              <FieldError message={fieldErrors.email} />
              <div className="space-y-1">
                <label htmlFor="signup-password" className="block text-[13px] font-medium text-[#374151]">비밀번호</label>
                <div className="relative">
                  <input
                    id="signup-password" disabled={busy} autoComplete="new-password" maxLength={72} aria-invalid={Boolean(fieldErrors.password)}
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="8자 이상"
                    className="w-full h-8 px-3 pr-9 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                  <button type="button" disabled={busy} aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'} onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <FieldError message={fieldErrors.password} />
              <p className="text-[11px] text-[#9CA3AF]">비밀번호는 8~72자, UTF-8 기준 72바이트 이하로 입력해주세요.</p>
              {error && <p role="alert" className="text-[12px] text-[#DC2626]">{error}</p>}
              <Btn type="submit" disabled={busy} variant="primary" className="w-full h-10 text-[13px]">{busy ? '가입 중…' : '가입하기'}</Btn>
            </form>
            <p className="text-center text-[12px] text-[#9CA3AF]">
              이미 계정이 있으신가요?{' '}
              <button disabled={busy} onClick={() => switchMode('login')} className="text-[#2563EB] hover:underline">로그인</button>
            </p>
          </div>
        )}

        {mode === 'pending' && (
          <div className="w-full max-w-[360px] text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FFFBEB] border border-[#FDE68A] rounded-full mb-2">
              <span className="text-[24px]">⏳</span>
            </div>
            <p className="text-[18px] font-semibold text-[#111827]">승인 대기 중</p>
            <p className="text-[13px] text-[#6B7280]">
              팀장 또는 공동 팀장의 승인 후 프로젝트에 참여할 수 있습니다.<br />
              승인이 완료되면 알림을 드립니다.
            </p>
            <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-md px-4 py-3 text-left">
              <p className="text-[13px] font-medium text-[#78350F]">HCI 기말 발표 과제</p>
              <p className="text-[11px] text-[#92400E]">인간컴퓨터상호작용 · 가입 요청 완료</p>
            </div>
            <Btn variant="secondary" className="w-full h-10" onClick={() => navigate('/')}>홈으로</Btn>
          </div>
        )}

        {mode === 'invalid-link' && (
          <ExceptionPanel
            title="잘못된 초대 링크"
            message="초대 링크가 만료되었거나 유효하지 않습니다. 팀장에게 새 링크를 요청해주세요."
            action={{ label: '홈으로', onClick: () => navigate('/') }}
          />
        )}

        {mode === 'no-permission' && (
          <ExceptionPanel
            title="접근 권한이 없습니다"
            message="이 페이지는 팀장 또는 공동 팀장만 접근할 수 있습니다."
            action={{ label: '돌아가기', onClick: () => navigate(-1) }}
          />
        )}

        {mode === 'closed-project' && (
          <ExceptionPanel
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

function ExceptionPanel({ title, message, action, secondary }: {
  title: string;
  message: string;
  action: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div className="w-full max-w-[360px] text-center space-y-4">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FEF2F2] border border-[#FECACA] rounded-full mb-2">
        <span className="text-[24px]">!</span>
      </div>
      <p className="text-[18px] font-semibold text-[#111827]">{title}</p>
      <p className="text-[13px] text-[#6B7280]">{message}</p>
      <div className="space-y-2 pt-2">
        <Btn variant="primary" className="w-full h-10 text-[13px]" onClick={action.onClick}>
          {action.label}
        </Btn>
        {secondary && (
          <Btn variant="secondary" className="w-full h-10 text-[13px]" onClick={secondary.onClick}>
            {secondary.label}
          </Btn>
        )}
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="text-[12px] text-[#DC2626]">{message}</p> : null;
}
