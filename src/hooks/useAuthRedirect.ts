import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';

interface UseAuthRedirectOptions {
  /** 인증 필요 여부 (true: 로그인 필요, false: 비로그인 필요) */
  requireAuth: boolean;
  /** 리다이렉트 경로 */
  redirectTo: string;
}

/**
 * 인증 상태에 따른 리다이렉트 훅
 *
 * @example
 * // 로그인이 필요한 페이지에서 사용
 * useAuthRedirect({ requireAuth: true, redirectTo: '/login' });
 *
 * @example
 * // 로그인 페이지에서 사용 (이미 로그인된 경우 리다이렉트)
 * useAuthRedirect({ requireAuth: false, redirectTo: '/dashboard' });
 */
export function useAuthRedirect({
  requireAuth,
  redirectTo,
}: UseAuthRedirectOptions) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      // 로그인이 필요한데 인증되지 않은 경우
      router.push(redirectTo);
    } else if (!requireAuth && isAuthenticated) {
      // 비로그인 상태가 필요한데 인증된 경우
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  return { isLoading, isAuthenticated };
}
