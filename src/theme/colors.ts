// Hearth color tokens — converted from OKLCH to hex for React Native compatibility.
// Pair each semantic color with its soft variant (e.g. rose + roseSoft).

export const colors = {
  // Brand — terracotta
  primary: '#C96B50',
  primarySoft: '#F5E4DB',
  primaryInk: '#7A3A26',

  // Ink — warm neutrals
  ink: '#23252F',
  ink2: '#3B3F4E',
  ink3: '#787E8B',
  ink4: '#A9AFBD',

  // Surfaces — warm off-white
  bg: '#FAF8F4',
  surface: '#FEFDFB',
  surface2: '#F5F2EC',
  line: '#E5E0D7',
  line2: '#ECE8E1',

  // Accents — semantic
  mint: '#4BBE8D',
  mintSoft: '#E1F5EC',
  butter: '#EFC84E',
  butterSoft: '#FAF3D9',
  rose: '#E55A48',
  roseSoft: '#FAE5E2',
  sky: '#4AADD1',
  skySoft: '#E0F1F8',
  lilac: '#9A7ECF',
  lilacSoft: '#F0EAF9',

  // Always
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
