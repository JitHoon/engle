'use client';

import { Box, Container } from '@mui/material';
import { LoginCard } from '@/components';
import { useAuthRedirect } from '@/hooks';

export default function LoginPage() {
  // 이미 로그인된 경우 홈으로 리다이렉트
  const { isLoading } = useAuthRedirect({
    requireAuth: false,
    redirectTo: '/',
  });

  if (isLoading) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        backgroundColor: 'grey.50',
      }}
    >
      <Container maxWidth="sm">
        <LoginCard
          title="Engle에 오신 것을 환영합니다"
          subtitle="Google 계정으로 간편하게 로그인하세요"
        />
      </Container>
    </Box>
  );
}
