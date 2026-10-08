export interface UserResponse {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest extends LoginRequest {
  nickname: string;
}
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}
export type FieldErrors = Record<string, string>;

export class AuthApiError extends Error {
  status: number;
  code: string;
  fieldErrors: FieldErrors;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const messages: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다. 로그인해주세요.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  INVALID_PASSWORD: '비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.',
  INVALID_REQUEST: '입력한 정보를 확인해주세요.',
  UNAUTHORIZED: '로그인이 만료되었습니다. 다시 로그인해주세요.',
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isUser(value: unknown): value is UserResponse {
  return (
    isObject(value) &&
    typeof value.id === 'number' &&
    typeof value.email === 'string' &&
    typeof value.nickname === 'string' &&
    typeof value.createdAt === 'string'
  );
}

// Separate factory makes HTTP behavior testable without contacting the deployed server.
export function createAuthApi(baseUrl: string, fetcher: typeof fetch = fetch) {
  const base = baseUrl.replace(/\/+$/, '');
  async function request(
    path: string,
    body?: LoginRequest | RegisterRequest,
    token?: string,
    signal?: AbortSignal,
  ): Promise<unknown> {
    let response: Response;
    try {
      response = await fetcher(`${base}/auth/${path}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'omit',
        cache: 'no-store',
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(15_000)])
          : AbortSignal.timeout(15_000),
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new AuthApiError(
        0,
        'NETWORK_ERROR',
        '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
      );
    }
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const code =
        isObject(payload) && typeof payload.code === 'string'
          ? payload.code
          : `HTTP_${response.status}`;
      const fieldErrors: FieldErrors = {};
      if (isObject(payload) && isObject(payload.fieldErrors)) {
        for (const [field, message] of Object.entries(payload.fieldErrors)) {
          if (typeof message === 'string') fieldErrors[field] = message;
        }
      }
      const serverMessage =
        isObject(payload) && typeof payload.message === 'string'
          ? payload.message
          : undefined;
      throw new AuthApiError(
        response.status,
        code,
        messages[code] ||
          serverMessage ||
          '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
        fieldErrors,
      );
    }
    return payload;
  }
  const invalidResponse = () =>
    new AuthApiError(
      502,
      'INVALID_RESPONSE',
      '서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
    );
  return {
    async register(input: RegisterRequest): Promise<UserResponse> {
      const result = await request('register', {
        ...input,
        email: input.email.trim().toLowerCase(),
        nickname: input.nickname.trim(),
      });
      if (!isUser(result)) throw invalidResponse();
      return result;
    },
    async login(
      input: LoginRequest,
      signal?: AbortSignal,
    ): Promise<LoginResponse> {
      const result = await request(
        'login',
        { ...input, email: input.email.trim().toLowerCase() },
        undefined,
        signal,
      );
      if (
        !isObject(result) ||
        typeof result.accessToken !== 'string' ||
        !result.accessToken ||
        result.tokenType !== 'Bearer' ||
        typeof result.expiresIn !== 'number' ||
        !Number.isFinite(result.expiresIn) ||
        result.expiresIn <= 0 ||
        !Number.isSafeInteger(result.expiresIn) ||
        !isUser(result.user)
      )
        throw invalidResponse();
      return result as unknown as LoginResponse;
    },
    async me(token: string, signal?: AbortSignal): Promise<UserResponse> {
      const result = await request('me', undefined, token, signal);
      if (!isUser(result)) throw invalidResponse();
      return result;
    },
  };
}

const deployedApi = 'https://168.138.213.117.sslip.io/api';
const configuredUrl = import.meta.env?.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = configuredUrl || (import.meta.env?.DEV ? '/api' : deployedApi);
export const authApi = createAuthApi(API_BASE_URL);
