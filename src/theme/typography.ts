// Hearth typography tokens — Plus Jakarta Sans, 9-step scale.

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const fontSize = {
  display: 40, // hero — splash/onboarding title
  pageTitle: 32, // page-level heading
  screenTitle: 26, // screen heading (edit/detail)
  sectionTitle: 19, // feature section heading
  cardTitle: 16, // card titles, section labels
  body: 14, // default body text
  meta: 12, // captions, time stamps
  caption: 11, // uppercase label
  microcopy: 10, // tiny badge text
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
} as const;

// Letter spacing in points (design values are em-based — converted at their font size)
export const letterSpacing = {
  display: -1.2, // -0.03em @ 40px
  pageTitle: -0.8, // -0.025em @ 32px
  screenTitle: -0.52, // -0.02em @ 26px
  sectionTitle: -0.28, // -0.015em @ 19px
  cardTitle: -0.08, // -0.005em @ 16px
  body: 0,
  meta: 0,
  caption: 0.66, // 0.06em @ 11px
  microcopy: 0.4, // 0.04em @ 10px
} as const;
