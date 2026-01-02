'use client';

import { Box, Button, Stack, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/apps');
    } else {
      router.push('/login');
    }
  };

  return (
    <Box>
      <Box
        sx={{
          minWidth: '100vw',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 500,
            mb: 2,
            color: 'text.primary',
          }}
        >
          Engle
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mb: 4 }}
        >
          Practice English with AI
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGetStarted}
            disabled={isLoading}
          >
            시작하기
          </Button>
          <Button variant="outlined" color="primary">
            더 알아보기
          </Button>
        </Stack>
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
