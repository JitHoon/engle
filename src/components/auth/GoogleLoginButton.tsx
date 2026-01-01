'use client';

import { Button, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '@/contexts';

interface GoogleLoginButtonProps {
  fullWidth?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
}

/**
 * Google 로그인 버튼 컴포넌트
 *
 * Supabase OAuth를 사용하여 Google 로그인을 처리합니다.
 */
export default function GoogleLoginButton({
  fullWidth = true,
  variant = 'outlined',
}: GoogleLoginButtonProps) {
  const { signInWithGoogle, isLoading } = useAuth();

  const handleClick = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      onClick={handleClick}
      disabled={isLoading}
      startIcon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <GoogleIcon />
        )
      }
      sx={{
        py: 1.5,
        borderColor: 'grey.300',
        color: 'text.primary',
        '&:hover': {
          borderColor: 'grey.400',
          backgroundColor: 'grey.50',
        },
      }}
    >
      {isLoading ? '로그인 중...' : 'Google로 계속하기'}
    </Button>
  );
}
