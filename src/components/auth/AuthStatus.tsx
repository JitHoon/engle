'use client';

import { Box, Skeleton } from '@mui/material';
import { useAuth } from '@/contexts';
import GoogleLoginButton from './GoogleLoginButton';
import UserProfile from './UserProfile';

interface AuthStatusProps {
  showName?: boolean;
}

/**
 * 인증 상태에 따라 로그인 버튼 또는 사용자 프로필을 표시하는 컴포넌트
 */
export default function AuthStatus({ showName = true }: AuthStatusProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showName && <Skeleton variant="text" width={100} />}
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    );
  }

  // 인증 상태에 따라 다른 컴포넌트 렌더링
  if (isAuthenticated) {
    return <UserProfile showName={showName} />;
  }

  return <GoogleLoginButton variant="outlined" size="medium" />;
}
