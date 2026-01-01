'use client';

import { Box, Paper, Typography, Divider, Alert } from '@mui/material';
import { useAuth } from '@/contexts';
import GoogleLoginButton from './GoogleLoginButton';

interface LoginCardProps {
  title?: string;
  subtitle?: string;
}

/**
 * 로그인 카드 컴포넌트 - 로그인 페이지에서 사용
 */
export default function LoginCard({
  title = '로그인',
  subtitle = '계정에 로그인하여 계속하세요',
}: LoginCardProps) {
  const { error, clearError } = useAuth();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        width: '100%',
        mx: 'auto',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <GoogleLoginButton fullWidth variant="outlined" size="large" />

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          또는
        </Typography>
      </Divider>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로
        간주됩니다.
      </Typography>
    </Paper>
  );
}
