'use client';

import { Box, Button, Typography, Fade } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // 위치 조정 변수 (랜딩 페이지와 동일)
  const LAYOUT_CONFIG = {
    // Not Found 텍스트 위치 조정 (음수: 위로, 양수: 아래로)
    titleOffsetY: -110, // px 단위
    // 버튼 위치 조정 (음수: 위로, 양수: 아래로)
    buttonOffsetY: 60, // px 단위
    // 텍스트와 버튼 사이 간격
    spacingBetween: 8, // MUI spacing 단위 (1 = 8px)
  };

  // Fade In 애니메이션 타이밍 (ms)
  const ANIMATION_TIMING = {
    background: 0, // 배경은 즉시 시작
    title: 300, // 텍스트는 300ms 후
    button: 600, // 버튼은 600ms 후
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoHome = () => {
    router.push('/');
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
      {/* Spline 3D 배경 - 흑백 필터 적용 */}
      <Fade in={mounted} timeout={1000}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            filter: 'grayscale(100%) brightness(0.3)', // 흑백 + 어둡게
            opacity: 0.5, // 흐리게
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
          pointerEvents: 'none',
        }}
      >
        {/* Not Found 텍스트 */}
        <Fade
          in={mounted}
          timeout={1000}
          style={{ transitionDelay: `${ANIMATION_TIMING.title}ms` }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 600,
              mb: LAYOUT_CONFIG.spacingBetween,
              color: 'white',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
              fontSize: { xs: '3rem', md: '4rem', lg: '5rem' },
              letterSpacing: '-0.02em',
              pointerEvents: 'none',
              transform: `translateY(${LAYOUT_CONFIG.titleOffsetY}px)`,
            }}
          >
            Not Found
          </Typography>
        </Fade>

        {/* 홈으로 가기 버튼 */}
        <Fade
          in={mounted}
          timeout={1000}
          style={{ transitionDelay: `${ANIMATION_TIMING.button}ms` }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoHome}
            sx={{
              minWidth: { xs: '200px', sm: '180px' },
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              mt: LAYOUT_CONFIG.spacingBetween,
              transform: `translateY(${LAYOUT_CONFIG.buttonOffsetY}px)`,
              pointerEvents: 'auto',
            }}
          >
            홈으로 가기
          </Button>
        </Fade>
      </Box>
    </Box>
  );
}

