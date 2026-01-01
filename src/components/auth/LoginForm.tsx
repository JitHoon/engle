'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import type { SignInCredentials } from '@/types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

/**
 * 이메일/비밀번호 로그인 폼 컴포넌트
 */
export default function LoginForm({ onSuccess, onForgotPassword }: LoginFormProps) {
  const { signIn, error: authError, clearError, isLoading } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInCredentials) => {
    try {
      clearError();
      await signIn(data);
      onSuccess?.();
    } catch {
      // 에러는 AuthContext에서 처리됨
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    onForgotPassword?.();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {authError && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {authError}
        </Alert>
      )}

      <TextField
        fullWidth
        label="이메일"
        type="email"
        autoComplete="email"
        margin="normal"
        {...register('email', {
          required: '이메일을 입력해주세요.',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '올바른 이메일 형식이 아닙니다.',
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
      />

      <TextField
        fullWidth
        label="비밀번호"
        type="password"
        autoComplete="current-password"
        margin="normal"
        {...register('password', {
          required: '비밀번호를 입력해주세요.',
          minLength: {
            value: 6,
            message: '비밀번호는 최소 6자 이상이어야 합니다.',
          },
        })}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isLoading}
      />

      <Box sx={{ mt: 1, mb: 2, textAlign: 'right' }}>
        <MuiLink
          component="button"
          type="button"
          variant="body2"
          onClick={handleForgotPassword}
          sx={{ cursor: 'pointer' }}
        >
          비밀번호를 잊으셨나요?
        </MuiLink>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 1, mb: 2 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
      </Button>

      <Typography variant="body2" textAlign="center" color="text.secondary">
        계정이 없으신가요?{' '}
        <MuiLink component={Link} href="/signup" underline="hover">
          회원가입
        </MuiLink>
      </Typography>
    </Box>
  );
}
