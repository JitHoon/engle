'use client';

import { Button, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '@/contexts';

interface GoogleLoginButtonProps {
  fullWidth?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export default function GoogleLoginButton({
  fullWidth = false,
  variant = 'outlined',
  size = 'large',
}: GoogleLoginButtonProps) {
  const { signInWithGoogle, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // 에러는 AuthContext에서 처리됨
      console.error('Google login failed:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleLogin}
      disabled={isLoading}
      startIcon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <GoogleIcon />
        )
      }
      sx={{
        borderColor: 'grey.300',
        color: 'text.primary',
        backgroundColor: variant === 'contained' ? 'white' : 'transparent',
        '&:hover': {
          borderColor: 'grey.400',
          backgroundColor: variant === 'contained' ? 'grey.50' : 'grey.50',
        },
        textTransform: 'none',
        fontWeight: 500,
        py: 1.5,
      }}
    >
      {isLoading ? '로그인 중...' : 'Google로 계속하기'}
    </Button>
  );
}
