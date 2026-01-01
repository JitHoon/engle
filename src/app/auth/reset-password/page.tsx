'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

/**
 * 비밀번호 재설정 페이지
 *
 * 이메일로 받은 링크를 통해 접근하여 새 비밀번호를 설정합니다.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
              textAlign: 'center',
            }}
          >
            <Alert severity="success" sx={{ mb: 2 }}>
              비밀번호가 성공적으로 변경되었습니다!
            </Alert>
            <Button
              variant="contained"
              onClick={() => router.push('/login')}
            >
              로그인 페이지로 이동
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

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
              새 비밀번호를 설정하세요
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="새 비밀번호"
              type="password"
              autoComplete="new-password"
              margin="normal"
              {...register('password', {
                required: '새 비밀번호를 입력해주세요.',
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
              sx={{ mt: 3 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '비밀번호 변경'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
