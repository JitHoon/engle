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
 * Tesla 브랜드 컬러 기반 MUI 테마
 *
 * Tesla 주요 색상:
 * - Tesla Red: #E31937 (Primary)
 * - Dark Black: #171A20 (배경/텍스트)
 * - Charcoal: #393C41 (Secondary)
 * - Medium Gray: #5C5E62 (보조)
 * - Light Gray: #F4F4F4 (배경)
 * - White: #FFFFFF (배경)
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E31937', // Tesla Red
      light: '#FF4D5E',
      dark: '#B30000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#393C41', // Tesla Charcoal
      light: '#5C5E62',
      dark: '#171A20',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F4F4F4',
    },
    text: {
      primary: '#171A20', // Tesla Dark
      secondary: '#5C5E62', // Tesla Medium Gray
    },
    grey: {
      50: '#FAFAFA',
      100: '#F4F4F4',
      200: '#E8E8E8',
      300: '#D0D0D0',
      400: '#A0A0A0',
      500: '#818181',
      600: '#5C5E62',
      700: '#393C41',
      800: '#212121',
      900: '#171A20',
    },
    error: {
      main: '#E31937', // Tesla Red (에러에도 동일 사용)
      light: '#FF4D5E',
      dark: '#B30000',
    },
    success: {
      main: '#04AA6D',
      light: '#06D685',
      dark: '#038052',
    },
    warning: {
      main: '#F5A623',
      light: '#F7B955',
      dark: '#C9870F',
    },
    info: {
      main: '#3E6AE1',
      light: '#6B8FEF',
      dark: '#2E4FA8',
    },
  },
  typography: {
    fontFamily: [
      'Gotham',
      '"Helvetica Neue"',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 14, // 기본 폰트 크기 작게
    h1: {
      fontSize: '2rem', // 기본 2.5rem에서 축소
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '1.75rem', // 기본 2rem에서 축소
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem', // 기본 1.75rem에서 축소
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem', // 기본 1.5rem에서 축소
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.125rem', // 기본 1.25rem에서 축소
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem', // 기본 1.125rem에서 축소
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.875rem', // 기본 1rem에서 축소
    },
    body2: {
      fontSize: '0.8125rem', // 기본 0.875rem에서 축소
    },
    button: {
      textTransform: 'none', // Tesla 스타일 - 대문자 변환 없음
      fontWeight: 500,
      fontSize: '0.875rem', // 버튼 텍스트 크기 작게
    },
    caption: {
      fontSize: '0.75rem', // 기본 0.75rem 유지
    },
    overline: {
      fontSize: '0.6875rem', // 기본 0.75rem에서 축소
    },
  },
  shape: {
    borderRadius: 4, // Tesla 미니멀 스타일 - 약간의 라운드
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
            background: '#F4F4F4',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#5C5E62',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#393C41',
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
          backgroundColor: '#171A20',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#000000',
          },
        },
        containedSecondary: {
          backgroundColor: '#F4F4F4',
          color: '#171A20',
          '&:hover': {
            backgroundColor: '#E8E8E8',
          },
        },
        outlinedPrimary: {
          borderColor: '#171A20',
          color: '#171A20',
          borderWidth: '2px', // 3px에서 2px로 축소
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(23, 26, 32, 0.04)',
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
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
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

// 다크 모드 테마 (Tesla 웹사이트의 다크 섹션 기반)
export const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#E31937',
      light: '#FF4D5E',
      dark: '#B30000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F4F4F4',
      light: '#FFFFFF',
      dark: '#D0D0D0',
      contrastText: '#171A20',
    },
    background: {
      default: '#171A20',
      paper: '#212121',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0',
    },
  },
  components: {
    ...theme.components,
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#FFFFFF',
          color: '#171A20',
          '&:hover': {
            backgroundColor: '#F4F4F4',
          },
        },
        containedSecondary: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        outlinedPrimary: {
          borderColor: '#FFFFFF',
          color: '#FFFFFF',
          borderWidth: '3px',
          '&:hover': {
            borderWidth: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
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
