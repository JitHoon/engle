'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useAppContext } from '@/contexts';
import { ExampleForm } from '@/components';

export default function Home() {
  const { isSidebarOpen, toggleSidebar } = useAppContext();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Stack spacing={4} alignItems="center">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Engle
          </Typography>

          <Typography variant="h6" color="text.secondary" textAlign="center">
            Next.js 14+ App Router with TypeScript, TanStack Query, MUI, and
            React Hook Form
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={toggleSidebar}>
              Toggle Sidebar ({isSidebarOpen ? 'Open' : 'Closed'})
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              href="https://mui.com/material-ui/"
              target="_blank"
            >
              MUI Documentation
            </Button>
          </Stack>

          <Box sx={{ width: '100%', mt: 4 }}>
            <ExampleForm
              onSubmit={(data) => {
                console.log('Form data:', data);
                alert(`Submitted: ${JSON.stringify(data, null, 2)}`);
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
