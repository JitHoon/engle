'use client';

import { Button, Skeleton, Stack } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import UserProfile from './UserProfile';

/**
 * 인증 상태 컴포넌트
 *
 * 로그인 상태에 따라 사용자 프로필 또는 로그인 버튼을 표시합니다.
 * 헤더 등에서 사용할 수 있습니다.
 */
export default function AuthStatus() {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중
  if (isLoading) {
    return <Skeleton variant="circular" width={36} height={36} />;
  }

  // 로그인된 상태
  if (isAuthenticated) {
    return <UserProfile />;
  }

  // 로그인되지 않은 상태
  return (
    <Stack direction="row" spacing={1}>
      <Button component={Link} href="/login" variant="outlined" size="small">
        로그인
      </Button>
    </Stack>
  );
}
