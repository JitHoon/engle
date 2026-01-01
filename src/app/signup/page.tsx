'use client';

import { Box, Container, Typography, Paper } from '@mui/material';
import { SignUpForm } from '@/components';

/**
 * 회원가입 페이지
 *
 * 이메일/비밀번호 회원가입을 제공합니다.
 */
export default function SignUpPage() {
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
              새 계정을 만드세요
            </Typography>
          </Box>

          <SignUpForm />
        </Paper>

        {/* 하단 링크 */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            회원가입하면{' '}
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
