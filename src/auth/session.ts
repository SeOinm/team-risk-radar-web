export const SESSION_KEY = 'risense.auth.session';
export interface AuthSession {
  accessToken: string;
  expiresAt: number;
}
type SessionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function createSessionStore(
  storage?: SessionStorage,
  now: () => number = Date.now,
) {
  let memory: AuthSession | null = null;
  return {
    read(): AuthSession | null {
      let raw: string | null = null;
      try {
        raw = storage?.getItem(SESSION_KEY) ?? null;
      } catch {
        /* private storage: use memory */
      }
      try {
        const value: unknown = raw ? JSON.parse(raw) : memory;
        if (
          value &&
          typeof value === 'object' &&
          'accessToken' in value &&
          'expiresAt' in value &&
          typeof value.accessToken === 'string' &&
          value.accessToken.length > 0 &&
          typeof value.expiresAt === 'number' &&
          Number.isFinite(value.expiresAt) &&
          value.expiresAt > now()
        ) {
          memory = {
            accessToken: value.accessToken,
            expiresAt: value.expiresAt,
          };
          return memory;
        }
      } catch {
        /* malformed or expired session: discard it */
      }
      this.clear();
      return null;
    },
    save(session: AuthSession) {
      memory = session;
      try {
        storage?.setItem(SESSION_KEY, JSON.stringify(session));
      } catch {
        /* current tab still works */
      }
    },
    clear() {
      memory = null;
      try {
        storage?.removeItem(SESSION_KEY);
      } catch {
        /* storage unavailable */
      }
    },
  };
}

function browserStorage(): SessionStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}
export const sessionStore = createSessionStore(browserStorage());
