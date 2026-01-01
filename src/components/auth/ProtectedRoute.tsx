'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/contexts';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * 보호된 라우트 래퍼 컴포넌트
 *
 * 클라이언트 사이드에서 추가적인 인증 체크를 수행합니다.
 * 미들웨어와 함께 사용하여 이중 보호를 제공합니다.
 *
 * 주의: 미들웨어에서 이미 보호하고 있다면 이 컴포넌트는 선택적입니다.
 */
export default function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  // 로딩 중
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 인증되지 않은 경우 (리다이렉트 전)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
