import { BrandLogo } from '@/components/BrandLogo';
import { useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { authApi, AuthApiError, type FieldErrors } from '@/api/auth';
import { useAuth } from '@/auth/context';
import { validateAuthInput } from '@/auth/validation';
import { Eye, EyeOff } from 'lucide-react';
import { Btn, Input } from '@/components/ds';


type AuthMode = 'login' | 'signup';

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
      <div className="flex-1 flex items-center justify-center p-6">
        {mode === 'login' && (
          <div className="w-full max-w-[360px] space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-[#F3F4F6] rounded-md mb-3">
                <BrandLogo symbolOnly />
              </div>
              <p className="text-[18px] font-semibold text-[#111827]">로그인</p>
              <img src="/brand/risense-wordmark.svg" alt="Risense" width={317} height={71} className="h-5 w-auto mx-auto mt-2" />
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
                <BrandLogo symbolOnly />
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

      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="text-[12px] text-[#DC2626]">{message}</p> : null;
}
