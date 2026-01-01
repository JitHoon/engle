/**
 * 브랜드 컬러 팔레트
 */

export const colors = {
  // Primary Brand Color
  red: {
    main: '#E31937',
    light: '#FF4D5E',
    dark: '#B30000',
  },

  // Neutral Colors
  black: {
    pure: '#000000',
    dark: '#171A20', 
    charcoal: '#393C41', 
  },

  gray: {
    900: '#171A20', 
    800: '#212121',
    700: '#393C41',
    600: '#5C5E62',
    500: '#818181',
    400: '#A0A0A0',
    300: '#D0D0D0',
    200: '#E8E8E8',
    100: '#F4F4F4',
    50: '#FAFAFA',
  },

  white: {
    pure: '#FFFFFF',
    off: '#FAFAFA',
    soft: '#F4F4F4',
  },

  // Semantic Colors
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

  error: {
    main: '#E31937', 
    light: '#FF4D5E',
    dark: '#B30000',
  },
} as const;

export type colors = typeof colors;
export type ColorKey = keyof colors;
