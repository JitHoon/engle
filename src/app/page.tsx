'use client';

import { Box, Button, Stack, Paper, Typography, Fade } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // 위치 조정 변수 (쉽게 변경 가능)
  const LAYOUT_CONFIG = {
    // Engle 텍스트 위치 조정 (음수: 위로, 양수: 아래로)
    titleOffsetY: -110, // px 단위
    // 버튼 위치 조정 (음수: 위로, 양수: 아래로)
    buttonOffsetY: 60, // px 단위
    // Engle 텍스트와 버튼 사이 간격
    spacingBetween: 8, // MUI spacing 단위 (1 = 8px)
  };

  // Fade In 애니메이션 타이밍 (ms)
  const ANIMATION_TIMING = {
    background: 0, // 배경은 즉시 시작
    title: 300, // 텍스트는 300ms 후
    buttons: 600, // 버튼은 600ms 후
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/apps');
    } else {
      router.push('/login');
    }
  };

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
      {/* Spline 3D 배경 */}
      <Fade in={mounted} timeout={1000}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
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
      </Fade>

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

      {/* 콘텐츠 오버레이 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          pointerEvents: 'none', // 오버레이는 클릭 이벤트를 차단하지 않음
        }}
      >
        {/* Engle 서비스명 - 원 위에 */}
        <Fade in={mounted} timeout={1000} style={{ transitionDelay: `${ANIMATION_TIMING.title}ms` }}>
        <Typography
            variant="h1"
          component="h1"
          sx={{
              fontWeight: 600,
              mb: LAYOUT_CONFIG.spacingBetween,
              color: 'white',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
              fontSize: { xs: '3rem', md: '4rem', lg: '6rem' },
              letterSpacing: '-0.02em',
              pointerEvents: 'none',
              transform: `translateY(${LAYOUT_CONFIG.titleOffsetY}px)`,
          }}
        >
            Engle
        </Typography>
        </Fade>

        {/* 버튼들 - 원 아래에 */}
        <Fade in={mounted} timeout={1000} style={{ transitionDelay: `${ANIMATION_TIMING.buttons}ms` }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={6}
            sx={{
              pointerEvents: 'auto', // 버튼만 클릭 가능
              mt: LAYOUT_CONFIG.spacingBetween,
              transform: `translateY(${LAYOUT_CONFIG.buttonOffsetY}px)`,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleGetStarted}
              disabled={isLoading}
              sx={{
                minWidth: { xs: '200px', sm: '180px' },
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              시작하기
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{
                minWidth: { xs: '200px', sm: '180px' },
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              더 알아보기
            </Button>
          </Stack>
        </Fade>
      </Box>
    </Box>
  );
}

// Color Swatch Component
function ColorSwatch({
  color,
  name,
  hex,
}: {
  color: string;
  name: string;
  hex: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 120,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Box
        sx={{
          height: 80,
          backgroundColor: color,
        }}
      />
      <Box sx={{ p: 1.5 }}>
        <Typography variant="body2" fontWeight={500}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hex}
        </Typography>
      </Box>
    </Paper>
  );
}
