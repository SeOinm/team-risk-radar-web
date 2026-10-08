import type {
  FieldErrors,
  LoginRequest,
  RegisterRequest,
} from '../api/auth.ts';

export function validateAuthInput(
  input: LoginRequest | RegisterRequest,
): FieldErrors {
  const errors: FieldErrors = {};
  const email = input.email.trim();
  if (
    !email ||
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = '올바른 이메일 주소를 입력해주세요. (최대 255자)';
  }
  // Password whitespace is intentional input; never trim or normalize it.
  if (!input.password) errors.password = '비밀번호를 입력해주세요.';
  else if (
    input.password.length > 72 ||
    new TextEncoder().encode(input.password).length > 72
  ) {
    errors.password =
      '비밀번호는 UTF-8 기준 72바이트 이하여야 합니다. 한글은 여러 바이트를 사용합니다.';
  } else if ('nickname' in input && input.password.length < 8) {
    errors.password = '비밀번호는 8자 이상이어야 합니다.';
  }
  if (
    'nickname' in input &&
    (!input.nickname.trim() || input.nickname.trim().length > 50)
  ) {
    errors.nickname = '닉네임은 공백 제거 후 1~50자로 입력해주세요.';
  }
  return errors;
}
