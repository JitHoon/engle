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
  Tooltip,
  Fade,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import PatternIcon from '@mui/icons-material/Pattern';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TopicIcon from '@mui/icons-material/Topic';
import { useState } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/colors';

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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
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

  // 앱 목록 정의 (흰검흰검 순서)
  const apps = [
    {
      id: 'collections-upgrade',
      name: 'Collections & Upgrade',
      route: '/apps/collections-upgrade',
      color: colors.white.pure, // 흰색
      icon: ArrowUpwardIcon,
      shape: 'square', // 둥근 사각형
    },
    {
      id: 'patterns',
      name: 'Patterns',
      route: '/apps/patterns',
      color: colors.black.pure, // 검은색
      icon: PatternIcon,
      shape: 'square', // 둥근 사각형
    },
    {
      id: 'rephrase',
      name: 'Rephase',
      route: '/apps/rephrase',
      color: colors.white.pure, // 흰색
      icon: AutoFixHighIcon,
      shape: 'circle', // 원형
    },
    {
      id: 'topics',
      name: 'Topics',
      route: '/apps/topics',
      color: colors.black.pure, // 검은색
      icon: TopicIcon,
      shape: 'circle', // 원형
    },
  ];

  const handleAppClick = (route: string) => {
    router.push(route);
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
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'black',
      }}
    >
      {/* Spline 3D 배경 - 덜 흐리게 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          filter: 'grayscale(100%) brightness(0.5)', // 흑백 + 덜 어둡게
          opacity: 0.7, // 덜 흐리게
        }}
      >
        <iframe
          src="https://my.spline.design/aidatamodelinteraction-f5IdzSvCAf5704sHnlgjwlwh/"
          frameBorder="0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: 'auto',
          }}
          allow="fullscreen"
          title="Spline 3D Scene"
        />
      </Box>

      {/* 워터마크 클릭 차단 오버레이 (오른쪽 하단) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '250px',
          height: '100px',
          zIndex: 2,
          pointerEvents: 'auto',
        }}
      />

      {/* 콘텐츠 영역 */}
      <Container
        maxWidth={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
      {/* 헤더 영역 */}
      <Box
        sx={{
          py: 4,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={500}
            color="white"
            onClick={() => router.push('/')}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
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
      </Box>

      {/* 앱 아이콘 그리드 - 헤더 제외한 나머지 영역에서 중앙 정렬 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 0, // flexbox에서 overflow 방지
        }}
      >
        {/* 모바일: 세로로 나열된 직사각형 버튼 */}
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            px: 2,
            mb: 8,
          }}
        >
          {apps.map((app, index) => {
            const IconComponent = app.icon;
            // 배경 색상에 따라 아이콘 색상 결정
            const iconColor =
              app.color === colors.white.pure
                ? colors.black.pure // 흰색 배경: 검은색 아이콘
                : 'white'; // 검은색 또는 primary 배경: 흰색 아이콘

            // 검은색 박스인지 확인
            const isBlackBox = app.color === colors.black.pure;

            return (
              <Fade
                key={app.id}
                in={true}
                timeout={600}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Box
                  onClick={() => handleAppClick(app.route)}
                  sx={{
                    width: '100%',
                    height: '80px',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    border: isBlackBox ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                    backgroundColor: app.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 3,
                    transition: 'all 0.3s ease',
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                  }}
                >
                  <IconComponent
                    sx={{
                      color: iconColor,
                      fontSize: '2rem',
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: iconColor,
                      fontWeight: 500,
                    }}
                  >
                    {app.name}
                  </Typography>
                </Box>
              </Fade>
            );
          })}
        </Box>

        {/* 데스크톱: 그리드 레이아웃 */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'grid' },
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
            maxWidth: 800,
            width: '100%',
            mb: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {apps.map((app, index) => {
            const IconComponent = app.icon;
            // 배경 색상에 따라 아이콘 색상 결정
            const iconColor =
              app.color === colors.white.pure
                ? colors.black.pure // 흰색 배경: 검은색 아이콘
                : 'white'; // 검은색 또는 primary 배경: 흰색 아이콘

            // 검은색 박스인지 확인
            const isBlackBox = app.color === colors.black.pure;

            return (
              <Fade
                key={app.id}
                in={true}
                timeout={600}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Box>
                  <Tooltip title={app.name} arrow placement="top">
                    <Box
                      onClick={() => handleAppClick(app.route)}
                      sx={{
                        width: '100%',
                        maxWidth: { sm: '110px', md: '120px' },
                        aspectRatio: '1',
                        cursor: 'pointer',
                        borderRadius: app.shape === 'circle' ? '50%' : '16px', // 원형 또는 둥근 사각형
                        overflow: 'hidden',
                        border: isBlackBox ? '1px solid rgba(255, 255, 255, 0.3)' : 'none', // 검은색 박스에만 얇고 연한 흰색 테두리
                        backgroundColor: app.color, // 각 앱의 색상 배경
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: 'none', // 그림자 효과 제거
                        justifySelf: 'center', // 그리드 셀 내에서 중앙 정렬
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.05)',
                          boxShadow: 'none', // hover 시에도 그림자 효과 제거
                        },
                      }}
                    >
                      <IconComponent
                        sx={{
                          color: iconColor,
                          fontSize: { sm: '3rem', md: '3.5rem' },
                        }}
                      />
                    </Box>
                  </Tooltip>
                </Box>
              </Fade>
            );
          })}
        </Box>
      </Box>
    </Container>
    </Box>
  );
}
