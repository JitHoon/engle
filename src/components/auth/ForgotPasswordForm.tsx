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

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

/**
 * 비밀번호 재설정 요청 폼 컴포넌트
 */
export default function ForgotPasswordForm({
  onSuccess,
  onBack,
}: ForgotPasswordFormProps) {
  const { resetPassword, error: authError, clearError, isLoading } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError();
      await resetPassword(data.email);
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
          비밀번호 재설정 이메일을 발송했습니다!
        </Alert>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.
          <br />
          이메일을 확인해주세요.
        </Typography>
        <Button component={Link} href="/login" variant="contained">
          로그인 페이지로 이동
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
      </Typography>

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

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          '재설정 이메일 발송'
        )}
      </Button>

      <Typography variant="body2" textAlign="center" color="text.secondary">
        <MuiLink
          component={onBack ? 'button' : Link}
          href={onBack ? undefined : '/login'}
          onClick={onBack}
          underline="hover"
          sx={{ cursor: 'pointer' }}
        >
          로그인으로 돌아가기
        </MuiLink>
      </Typography>
    </Box>
  );
}
