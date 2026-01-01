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

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

interface SignUpFormProps {
  onSuccess?: () => void;
}

/**
 * 회원가입 폼 컴포넌트
 */
export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { signUp, error: authError, clearError, isLoading } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    try {
      clearError();
      await signUp({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });
      setSuccess(true);
      onSuccess?.();
    } catch {
      // 에러는 AuthContext에서 처리됨
    }
  };

  if (success) {
    return (
      <Box textAlign="center">
        <Alert severity="success" sx={{ mb: 2 }}>
          회원가입이 완료되었습니다!
        </Alert>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          입력하신 이메일로 확인 메일을 발송했습니다.
          <br />
          이메일을 확인하여 계정을 활성화해주세요.
        </Typography>
        <Button component={Link} href="/login" variant="contained">
          로그인 페이지로 이동
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {authError && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {authError}
        </Alert>
      )}

      <TextField
        fullWidth
        label="이름"
        autoComplete="name"
        margin="normal"
        {...register('displayName', {
          required: '이름을 입력해주세요.',
          minLength: {
            value: 2,
            message: '이름은 최소 2자 이상이어야 합니다.',
          },
        })}
        error={!!errors.displayName}
        helperText={errors.displayName?.message}
        disabled={isLoading}
      />

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
        autoComplete="new-password"
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

      <TextField
        fullWidth
        label="비밀번호 확인"
        type="password"
        autoComplete="new-password"
        margin="normal"
        {...register('confirmPassword', {
          required: '비밀번호를 다시 입력해주세요.',
          validate: (value) =>
            value === password || '비밀번호가 일치하지 않습니다.',
        })}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : '회원가입'}
      </Button>

      <Typography variant="body2" textAlign="center" color="text.secondary">
        이미 계정이 있으신가요?{' '}
        <MuiLink component={Link} href="/login" underline="hover">
          로그인
        </MuiLink>
      </Typography>
    </Box>
  );
}
