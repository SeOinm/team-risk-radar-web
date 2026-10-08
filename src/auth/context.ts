import { createContext, useContext } from 'react';
import type { LoginRequest, UserResponse } from '@/api/auth';
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous' | 'error';
export interface AuthContextValue {
  user: UserResponse | null;
  status: AuthStatus;
  error: string;
  notice: string;
  login: (input: LoginRequest) => Promise<void>;
  logout: () => void;
  retry: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextValue | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider가 필요합니다.');
  return value;
}
