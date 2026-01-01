'use client';

import {
  Box,
  Avatar,
  Typography,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';

/**
 * 사용자 프로필 컴포넌트
 *
 * 로그인한 사용자의 프로필 정보와 메뉴를 표시합니다.
 */
export default function UserProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleProfile = () => {
    handleClose();
    router.push('/dashboard');
  };

  if (!user) return null;

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          src={user.photoURL || undefined}
          alt={user.displayName || 'User'}
          sx={{ width: 36, height: 36 }}
        >
          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
        </Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              minWidth: 200,
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1,
              border: '1px solid',
              borderColor: 'grey.200',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={500}>
            {user.displayName || '사용자'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleProfile}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PersonIcon fontSize="small" />
            <Typography variant="body2">내 프로필</Typography>
          </Stack>
        </MenuItem>

        <MenuItem onClick={handleSignOut}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <LogoutIcon fontSize="small" />
            <Typography variant="body2">로그아웃</Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </Box>
  );
}
