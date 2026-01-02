'use client';

import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { type ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Spline-viewer 스타일 MUI 테마
 *
 * 주요 색상:
 * - Vibrant Blue: #0066FF (Primary, 인터랙티브 요소)
 * - White: #FFFFFF (배경)
 * - Light Gray: #F7F7F7 (카드 배경)
 * - Dark Gray: #1A1A1A (텍스트)
 * - Pastel Colors: 파스텔 톤 (yellow, pink, blue, purple, teal)
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0066FF', // Vibrant Blue
      light: '#3399FF',
      dark: '#0052CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#666666', // Medium Gray
      light: '#888888',
      dark: '#4A4A4A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#000000', // 모든 페이지 기본 배경 블랙
      paper: '#F7F7F7', // 카드 배경
    },
    text: {
      primary: '#1A1A1A', // Dark Gray
      secondary: '#666666', // Medium Gray
    },
    grey: {
      50: '#F7F7F7', // 카드 배경
      100: '#F0F0F0',
      200: '#E0E0E0',
      300: '#CCCCCC',
      400: '#AAAAAA',
      500: '#888888',
      600: '#666666',
      700: '#4A4A4A',
      800: '#2E2E2E',
      900: '#1A1A1A',
    },
    error: {
      main: '#FF6B6B',
      light: '#FF9999',
      dark: '#CC3333',
    },
    success: {
      main: '#66E0CC', // Teal
      light: '#99F0E0',
      dark: '#33CCAA',
    },
    warning: {
      main: '#FFE066', // Pastel Yellow
      light: '#FFF099',
      dark: '#FFCC33',
    },
    info: {
      main: '#0066FF', // Vibrant Blue
      light: '#3399FF',
      dark: '#0052CC',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 16,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '1rem',
    },
    caption: {
      fontSize: '0.75rem', // 기본 0.75rem 유지
    },
    overline: {
      fontSize: '0.6875rem', // 기본 0.75rem에서 축소
    },
  },
  shape: {
    borderRadius: 12, // Spline-viewer 스타일 - 둥근 모서리
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F7F7F7',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CCCCCC',
            borderRadius: '6px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#AAAAAA',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small', // 기본 크기를 small로 설정
      },
      styleOverrides: {
        root: {
          borderRadius: '4px',
          padding: '6px 16px', // small 크기에 맞게 패딩 축소
          fontSize: '0.875rem',
          fontWeight: 500,
          minWidth: '64px', // 기본 minWidth 축소
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
        sizeMedium: {
          padding: '6px 16px',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '8px 20px',
          fontSize: '0.9375rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#0066FF', // Vibrant Blue
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0052CC',
          },
        },
        containedSecondary: {
          backgroundColor: '#F7F7F7',
          color: '#1A1A1A',
          '&:hover': {
            backgroundColor: '#E0E0E0',
          },
        },
        outlinedPrimary: {
          borderColor: '#0066FF',
          color: '#0066FF',
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: 'rgba(0, 102, 255, 0.08)',
          },
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small', // 기본 크기를 small로 설정
      },
      styleOverrides: {
        root: {
          padding: '8px', // 기본 12px에서 축소
        },
        sizeSmall: {
          padding: '4px',
        },
        sizeMedium: {
          padding: '8px',
        },
        sizeLarge: {
          padding: '12px',
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem', // 기본 아이콘 크기 축소
        },
      },
    },
    MuiSvgIcon: {
      defaultProps: {
        fontSize: 'small', // 기본 아이콘 크기를 small로 설정
      },
      styleOverrides: {
        root: {
          fontSize: '1.25rem', // small: 1.25rem
        },
        fontSizeSmall: {
          fontSize: '1rem',
        },
        fontSizeMedium: {
          fontSize: '1.5rem',
        },
        fontSizeLarge: {
          fontSize: '2rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small', // 기본 크기를 small로 설정
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem', // 입력 텍스트 크기 작게
            '& fieldset': {
              borderColor: '#D0D0D0',
            },
            '&:hover fieldset': {
              borderColor: '#393C41',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#171A20',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem', // 라벨 크기 작게
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem', // 모든 입력 필드 기본 크기
        },
        input: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      defaultProps: {
        size: 'small', // 기본 크기를 small로 설정
      },
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          height: '24px', // 기본 32px에서 축소
        },
        sizeSmall: {
          height: '20px',
          fontSize: '0.6875rem',
        },
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        size: 'small', // 기본 크기를 small로 설정
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: '4px', // 기본 4px 유지하되 작게
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#F7F7F7', // 카드 배경
          boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
          borderRadius: '12px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#171A20',
          boxShadow: 'none',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#171A20',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
  },
});

// 다크 모드 테마 (Spline-viewer 스타일)
export const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3399FF', // 밝은 Blue
      light: '#66B3FF',
      dark: '#0066FF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#888888',
      light: '#AAAAAA',
      dark: '#666666',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#1A1A1A',
      paper: '#2E2E2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
    },
  },
  components: {
    ...theme.components,
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#3399FF',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0066FF',
          },
        },
        containedSecondary: {
          backgroundColor: '#2E2E2E',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#4A4A4A',
          },
        },
        outlinedPrimary: {
          borderColor: '#3399FF',
          color: '#3399FF',
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: 'rgba(51, 153, 255, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2E2E2E',
          boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
