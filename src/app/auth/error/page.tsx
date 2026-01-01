'use client';

import { Box, Container, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Link from 'next/link';

/**
 * Auth Error Page
 *
 * 인증 과정에서 오류가 발생했을 때 표시되는 페이지입니다.
 */
export default function AuthErrorPage() {
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
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <ErrorOutlineIcon
            sx={{ fontSize: 64, color: 'error.main', mb: 2 }}
          />

          <Typography variant="h5" component="h1" gutterBottom fontWeight={500}>
            인증 오류
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            로그인 과정에서 문제가 발생했습니다.
            <br />
            다시 시도해 주세요.
          </Typography>

          <Button
            component={Link}
            href="/login"
            variant="contained"
            color="primary"
          >
            로그인 페이지로 돌아가기
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
