'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type AuthContextType,
  type AuthState,
  type SignInCredentials,
  type SignUpCredentials,
  mapSupabaseUser,
} from '@/types/auth';

// 초기 상태
const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider 컴포넌트
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);
  const supabase = createClient();

  // Supabase Auth 상태 변경 감지
  useEffect(() => {
    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            error: error.message,
          });
          return;
        }

        const user = mapSupabaseUser(session?.user ?? null);
        setState({
          user,
          session,
          isLoading: false,
          isAuthenticated: !!session,
          error: null,
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    initializeAuth();

    // Auth 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = mapSupabaseUser(session?.user ?? null);

      setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: !!session,
        error: null,
      });

      // 이벤트별 처리 (필요시 확장)
      if (event === 'SIGNED_IN') {
        console.log('User signed in');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // 이메일/비밀번호 로그인
  const signIn = useCallback(
    async ({ email, password }: SignInCredentials) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        // onAuthStateChange가 상태를 업데이트함
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '로그인에 실패했습니다.';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [supabase.auth]
  );

  // 회원가입
  const signUp = useCallback(
    async ({ email, password, displayName }: SignUpCredentials) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        });

        if (error) {
          throw error;
        }

        // 이메일 확인이 필요한 경우 메시지 표시를 위해 상태 업데이트
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '회원가입에 실패했습니다.';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [supabase.auth]
  );

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // onAuthStateChange가 상태를 업데이트함
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '로그아웃에 실패했습니다.';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [supabase.auth]);

  // 비밀번호 재설정 이메일 전송
  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
          throw error;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '비밀번호 재설정 이메일 전송에 실패했습니다.';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [supabase.auth]
  );

  // 에러 초기화
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
