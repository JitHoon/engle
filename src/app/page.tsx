'use client';

import {
  Box,
  Button,
  Stack,
  Paper,
  Divider,
  Container,
  Typography,
} from '@mui/material';
import { colors } from '@/lib/colors';
import { useAppContext } from '@/contexts';
import { ExampleForm } from '@/components';

export default function Home() {
  const { isSidebarOpen, toggleSidebar } = useAppContext();

  return (
    <Box>
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 3,
          py: 8,
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
          Welcome to Engle
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mb: 4 }}
        >
          Next.js 14+ App Router with TypeScript, TanStack Query, MUI, and React
          Hook Form — Tesla 스타일 테마 적용
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="contained" color="primary" size="large">
            시작하기
          </Button>
          <Button variant="outlined" color="primary" size="large">
            더 알아보기
          </Button>
        </Stack>
      </Box>

      <Divider />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Tesla 컬러 팔레트
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Primary Colors
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
          <ColorSwatch
            color={colors.red.main}
            name="Tesla Red"
            hex="#E31937"
          />
          <ColorSwatch
            color={colors.red.light}
            name="Red Light"
            hex="#FF4D5E"
          />
          <ColorSwatch
            color={colors.red.dark}
            name="Red Dark"
            hex="#B30000"
          />
        </Stack>
        
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Neutral Colors
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
          <ColorSwatch
            color={colors.black.dark}
            name="Dark"
            hex="#171A20"
          />
          <ColorSwatch
            color={colors.black.charcoal}
            name="Charcoal"
            hex="#393C41"
          />
          <ColorSwatch
            color={colors.gray[600]}
            name="Gray 600"
            hex="#5C5E62"
          />
          <ColorSwatch
            color={colors.gray[500]}
            name="Gray 500"
            hex="#818181"
          />
          <ColorSwatch
            color={colors.gray[300]}
            name="Gray 300"
            hex="#D0D0D0"
          />
          <ColorSwatch
            color={colors.gray[100]}
            name="Gray 100"
            hex="#F4F4F4"
          />
        </Stack>
        
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Semantic Colors
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
          <ColorSwatch
            color={colors.success.main}
            name="Success"
            hex="#04AA6D"
          />
          <ColorSwatch
            color={colors.warning.main}
            name="Warning"
            hex="#F5A623"
          />
          <ColorSwatch
            color={colors.info.main}
            name="Info"
            hex="#3E6AE1"
          />
          <ColorSwatch
            color={colors.error.main}
            name="Error"
            hex="#E31937"
          />
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          버튼 스타일
        </Typography>

        <Stack spacing={4} alignItems="center">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" color="primary">
              Primary Button
            </Button>
            <Button variant="contained" color="secondary">
              Secondary Button
            </Button>
            <Button variant="outlined" color="primary">
              Outlined Button
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" color="success">
              Success
            </Button>
            <Button variant="contained" color="warning">
              Warning
            </Button>
            <Button variant="contained" color="error">
              Error
            </Button>
            <Button variant="contained" color="info">
              Info
            </Button>
          </Stack>

          <Button variant="contained" onClick={toggleSidebar}>
            Toggle Sidebar ({isSidebarOpen ? 'Open' : 'Closed'})
          </Button>
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          폼 예시
        </Typography>

        <ExampleForm
          onSubmit={(data) => {
            console.log('Form data:', data);
            alert(`Submitted: ${JSON.stringify(data, null, 2)}`);
          }}
        />
      </Container>
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
