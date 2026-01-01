/**
 * Tesla 브랜드 컬러 팔레트
 *
 * 참고: https://www.tesla.com
 * 출처: Tesla 공식 웹사이트 및 브랜드 가이드라인
 */

export const teslaColors = {
  // Primary Brand Color
  red: {
    main: '#E31937', // Tesla Red (Pantone 186 C)
    light: '#FF4D5E',
    dark: '#B30000',
  },

  // Neutral Colors
  black: {
    pure: '#000000',
    dark: '#171A20', // Tesla Dark
    charcoal: '#393C41', // Tesla Charcoal
  },

  gray: {
    900: '#171A20', // Darkest
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
    main: '#E31937', // Same as Tesla Red
    light: '#FF4D5E',
    dark: '#B30000',
  },
} as const;

// 타입 추출
export type TeslaColors = typeof teslaColors;
export type TeslaColorKey = keyof TeslaColors;
