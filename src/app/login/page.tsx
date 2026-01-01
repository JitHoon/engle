'use client';

import { Box, Container, Typography, Paper, Divider, Alert } from '@mui/material';
import { useAuth } from '@/contexts';
import GoogleLoginButton from '@/components/GoogleLoginButton';

/**
 * 로그인 페이지
 *
 * Google OAuth를 사용한 로그인을 제공합니다.
 */
export default function LoginPage() {
  const { error, clearError } = useAuth();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          {/* 로고/타이틀 */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={500}
              gutterBottom
            >
              Engle
            </Typography>
            <Typography color="text.secondary">
              계정에 로그인하세요
            </Typography>
          </Box>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Google 로그인 버튼 */}
          <GoogleLoginButton />

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              또는
            </Typography>
          </Divider>

          {/* 추가 로그인 옵션 (확장 가능) */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            다른 로그인 방법은 준비 중입니다.
          </Typography>
        </Paper>

        {/* 하단 링크 */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            로그인하면{' '}
            <Typography
              component="a"
              href="/terms"
              variant="body2"
              sx={{ color: 'primary.main', textDecoration: 'underline' }}
            >
              이용약관
            </Typography>
            {' 및 '}
            <Typography
              component="a"
              href="/privacy"
              variant="body2"
              sx={{ color: 'primary.main', textDecoration: 'underline' }}
            >
              개인정보처리방침
            </Typography>
            에 동의하는 것으로 간주됩니다.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
