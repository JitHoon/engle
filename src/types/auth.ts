import type { User, Session } from '@supabase/supabase-js';

// 사용자 정보 타입
export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: string | null;
}

// Auth Context 상태 타입
export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Auth Context 액션 타입
export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Supabase User를 AuthUser로 변환
export function mapSupabaseUser(user: User | null): AuthUser | null {
  if (!user) return null;

  // provider 정보 추출
  const provider = user.app_metadata?.provider || null;

  // 사용자 메타데이터에서 정보 추출
  const metadata = user.user_metadata || {};

  return {
    id: user.id,
    email: user.email || null,
    displayName: metadata.full_name || metadata.name || null,
    photoURL: metadata.avatar_url || metadata.picture || null,
    emailVerified: user.email_confirmed_at !== null,
    provider,
  };
}
