// Hearth spacing, radii, and shadow tokens.

import { Platform } from 'react-native';

export const spacing = {
  1: 4, // tight icon gaps
  2: 6, // pill internal padding
  3: 8, // card internal (small)
  4: 12, // form rows, default gap
  5: 14, // card padding
  6: 18, // card-to-card gap
  7: 22, // screen horizontal padding
  8: 28, // section-to-section gap
} as const;

export const radius = {
  xs: 8, // stepper buttons, pill internals
  sm: 12, // inputs, chips, small cards
  md: 16, // cards, sheets
  lg: 20, // hero cards, big cards
  xl: 28, // sheet top edge
  pill: 9999, // pills, FAB, avatars
} as const;

export const shadows = {
  sh1: Platform.select({
    ios: {
      shadowColor: '#14161E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
  sh2: Platform.select({
    ios: {
      shadowColor: '#14161E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
    },
    android: { elevation: 4 },
    default: {},
  }),
  sh3: Platform.select({
    ios: {
      shadowColor: '#14161E',
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.1,
      shadowRadius: 44,
    },
    android: { elevation: 8 },
    default: {},
  }),
  cta: Platform.select({
    ios: {
      shadowColor: '#C96B50',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 22,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;
