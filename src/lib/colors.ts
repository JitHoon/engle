/**
 * Spline-viewer 스타일 브랜드 컬러 팔레트
 *
 * 주요 색상:
 * - Vibrant Blue: 인터랙티브 요소, 버튼
 * - White: 배경
 * - Light Gray: 카드 배경 (#F7F7F7)
 * - Dark Gray: 텍스트
 * - Pastel Colors: 파스텔 톤 (yellow, pink, blue, purple, teal)
 */

export const colors = {
  // Spline-viewer 스타일
  spline: {
    blue: {
      main: '#0066FF', // Vibrant Blue (인터랙티브 요소)
      light: '#3399FF',
      dark: '#0052CC',
    },
    pastel: {
      yellow: '#FFE066',
      pink: '#FFB3D9',
      blue: '#B3E0FF',
      purple: '#D9B3FF',
      teal: '#66E0CC',
    },
  },

  // Primary Brand Color (Vibrant Blue)
  primary: {
    main: '#0066FF',
    light: '#3399FF',
    dark: '#0052CC',
  },

  // Neutral Colors
  black: {
    pure: '#000000',
    dark: '#1A1A1A',
    charcoal: '#333333',
  },

  gray: {
    900: '#1A1A1A',
    800: '#2E2E2E',
    700: '#4A4A4A',
    600: '#666666',
    500: '#888888',
    400: '#AAAAAA',
    300: '#CCCCCC',
    200: '#E0E0E0',
    100: '#F0F0F0',
    50: '#F7F7F7', // 카드 배경
  },

  white: {
    pure: '#FFFFFF',
    off: '#FAFAFA',
    soft: '#F7F7F7', // 카드 배경
  },

  // Semantic Colors
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

  error: {
    main: '#FF6B6B',
    light: '#FF9999',
    dark: '#CC3333',
  },
} as const;

export type Colors = typeof colors;
export type ColorKey = keyof typeof colors;
