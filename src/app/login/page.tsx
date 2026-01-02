'use client';

import { useState } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { LoginForm, ForgotPasswordForm } from '@/components';

/**
 * 로그인 페이지
 *
 * 이메일/비밀번호 로그인을 제공합니다.
 */
export default function LoginPage() {
  const router = useRouter();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLoginSuccess = () => {
    router.push('/apps');
  };

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
              {showForgotPassword ? '비밀번호 재설정' : '계정에 로그인하세요'}
            </Typography>
          </Box>

          {showForgotPassword ? (
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          ) : (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          )}
        </Paper>

        {/* 하단 링크 */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            로그인하면{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'primary.main', textDecoration: 'underline' }}
            >
              이용약관
            </Typography>
            {' 및 '}
            <Typography
              component="span"
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
