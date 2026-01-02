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
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useState } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';

/**
 * Apps 페이지
 *
 * 로그인한 사용자만 접근할 수 있는 보호된 페이지입니다.
 * 미들웨어에서 인증 체크를 수행합니다.
 */
export default function AppsPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
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
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight={500}>
            Engle
          </Typography>
          <IconButton
            onClick={handleProfileClick}
            aria-controls={open ? 'user-profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar
              alt={user?.displayName || 'User'}
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
              }}
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>

          {/* 사용자 프로필 메뉴 */}
          <Menu
            id="user-profile-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  minWidth: 280,
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                  mt: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                },
              },
            }}
          >
            {/* 사용자 정보 섹션 */}
            <Box sx={{ px: 2, py: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  alt={user?.displayName || 'User'}
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                  }}
                >
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
                <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={500} noWrap>
                      {user?.displayName || '이름 없음'}
                    </Typography>
                    {user?.emailVerified && (
                      <Chip
                        icon={<VerifiedIcon />}
                        label="인증됨"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.6875rem' }}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ fontSize: '0.8125rem' }}
                  >
                    {user?.email}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* 로그아웃 버튼 */}
            <MenuItem onClick={handleSignOut}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LogoutIcon fontSize="small" />
                <Typography variant="body2">로그아웃</Typography>
              </Stack>
            </MenuItem>
          </Menu>
        </Box>

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
            <br />이 페이지는 로그인한 사용자만 접근할 수 있는 보호된
            페이지입니다.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
