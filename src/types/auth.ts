import type { User, Session } from '@supabase/supabase-js';

// 사용자 정보 타입
export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

// Auth Context 상태 타입
export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// 로그인 자격 증명
export interface SignInCredentials {
  email: string;
  password: string;
}

// 회원가입 자격 증명
export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}

// Auth Context 액션 타입
export interface AuthContextType extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

// Supabase User를 AuthUser로 변환
export function mapSupabaseUser(user: User | null): AuthUser | null {
  if (!user) return null;

  // 사용자 메타데이터에서 정보 추출
  const metadata = user.user_metadata || {};

  return {
    id: user.id,
    email: user.email || null,
    displayName: metadata.display_name || metadata.full_name || metadata.name || null,
    emailVerified: user.email_confirmed_at !== null,
  };
}
