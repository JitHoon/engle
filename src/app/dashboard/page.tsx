'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  Stack,
  Divider,
  Skeleton,
  Chip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';

/**
 * 대시보드 페이지
 *
 * 로그인한 사용자만 접근할 수 있는 보호된 페이지입니다.
 * 미들웨어에서 인증 체크를 수행합니다.
 */
export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* 헤더 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight={500}>
            대시보드
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
          >
            로그아웃
          </Button>
        </Box>

        {/* 사용자 정보 카드 */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Typography variant="h6" gutterBottom>
            내 정보
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              alt={user?.displayName || 'User'}
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">
                  {user?.displayName || '이름 없음'}
                </Typography>
                {user?.emailVerified && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="인증됨"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography color="text.secondary">{user?.email}</Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* 추가 콘텐츠 영역 */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 3,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Typography variant="h6" gutterBottom>
            환영합니다!
          </Typography>
          <Typography color="text.secondary">
            Supabase 이메일 인증이 성공적으로 구현되었습니다.
            <br />
            이 페이지는 로그인한 사용자만 접근할 수 있는 보호된 페이지입니다.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
