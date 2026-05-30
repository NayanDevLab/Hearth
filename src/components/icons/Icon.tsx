// Hearth icon set — 30 line icons, 24×24 viewBox, currentColor stroke.
// All icons: strokeLinecap="round" strokeLinejoin="round", default stroke 1.75.

import React from 'react';

import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

export interface IconProps {
  size?: number;
  color?: string;
  stroke?: number;
}

type SvgIconBuilder = (props: IconProps) => React.ReactElement;

function makeIcon(render: (color: string, stroke: number) => React.ReactNode): SvgIconBuilder {
  return function IconComponent({ size = 22, color = colors.ink, stroke = 1.75 }: IconProps) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {render(color, stroke)}
      </Svg>
    );
  };
}

const lc = 'round' as const;
const lj = 'round' as const;

export const Icon = {
  home: makeIcon((c, s) => (
    <>
      <Path
        d="M3 11.5L12 4L21 11.5"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Path
        d="M5 10.5V20H19V10.5"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Path d="M10 20V15H14V20" stroke={c} strokeWidth={s} strokeLinecap={lc} strokeLinejoin={lj} />
    </>
  )),

  tasks: makeIcon((c, s) => (
    <>
      <Rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="3"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Path
        d="M8 11L10 13L14 9"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Path d="M14 16H17" stroke={c} strokeWidth={s} strokeLinecap={lc} strokeLinejoin={lj} />
    </>
  )),

  cart: makeIcon((c, s) => (
    <>
      <Path
        d="M3 4H5L7 15H18L20 7H7"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Circle cx="9" cy="19" r="1.5" stroke={c} strokeWidth={s} />
      <Circle cx="17" cy="19" r="1.5" stroke={c} strokeWidth={s} />
    </>
  )),

  wallet: makeIcon((c, s) => (
    <>
      <Rect x="3" y="6" width="18" height="13" rx="3" stroke={c} strokeWidth={s} />
      <Path d="M3 10H21" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Circle cx="16" cy="14" r="1.2" fill={c} />
    </>
  )),

  meal: makeIcon((c, s) => (
    <>
      <Path
        d="M5 4V12C5 13.66 6.34 15 8 15V20"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Path d="M5 4V10" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M8 4V10" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path
        d="M16 4C14.5 4 13 6 13 9C13 12 14.5 13 16 13V20"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
    </>
  )),

  pantry: makeIcon((c, s) => (
    <>
      <Rect x="5" y="3" width="14" height="18" rx="2" stroke={c} strokeWidth={s} />
      <Path d="M5 9H19" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M5 15H19" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Circle cx="9" cy="6" r="0.7" fill={c} />
      <Circle cx="9" cy="12" r="0.7" fill={c} />
      <Circle cx="9" cy="18" r="0.7" fill={c} />
    </>
  )),

  calendar: makeIcon((c, s) => (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2.5" stroke={c} strokeWidth={s} />
      <Path d="M3 10H21" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M8 3V7" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M16 3V7" stroke={c} strokeWidth={s} strokeLinecap={lc} />
    </>
  )),

  users: makeIcon((c, s) => (
    <>
      <Circle cx="9" cy="9" r="3.2" stroke={c} strokeWidth={s} />
      <Path
        d="M3 19C3.7 16 6.3 14.5 9 14.5C11.7 14.5 14.3 16 15 19"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Circle cx="17" cy="8" r="2.4" stroke={c} strokeWidth={s} />
      <Path d="M16 14C18 14 20 15 20.5 17" stroke={c} strokeWidth={s} strokeLinecap={lc} />
    </>
  )),

  bell: makeIcon((c, s) => (
    <>
      <Path
        d="M6 16V11C6 7.69 8.69 5 12 5C15.31 5 18 7.69 18 11V16L19.5 18H4.5Z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Path
        d="M10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
      />
    </>
  )),

  doc: makeIcon((c, s) => (
    <>
      <Path
        d="M7 3H15L19 7V21H7V3Z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Path d="M14 3V8H19" stroke={c} strokeWidth={s} strokeLinecap={lc} strokeLinejoin={lj} />
      <Path d="M10 13H16" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M10 16H14" stroke={c} strokeWidth={s} strokeLinecap={lc} />
    </>
  )),

  tools: makeIcon((c, s) => (
    <>
      <Path
        d="M14.5 6.5C13.17 5.17 11.17 4.83 9.55 5.55L12 8L8 12L5.55 9.55C4.83 11.17 5.17 13.17 6.5 14.5C7.83 15.83 9.83 16.17 11.45 15.45L4 22L7 22L7 22L7 22C6.45 21.45 15.45 12.45 17.5 9.5C18.83 7.83 17.83 5.17 14.5 6.5Z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
    </>
  )),

  recipe: makeIcon((c, s) => (
    <>
      <Path
        d="M6 3H15L18 6V21H6V3Z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Path d="M9 9H15" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M9 13H15" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M9 17H13" stroke={c} strokeWidth={s} strokeLinecap={lc} />
    </>
  )),

  plus: makeIcon((c, s) => (
    <>
      <Path d="M12 5V19" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M5 12H19" stroke={c} strokeWidth={s} strokeLinecap={lc} />
    </>
  )),

  check: makeIcon((c, s) => (
    <Path d="M5 12L9 16L19 6" stroke={c} strokeWidth={s} strokeLinecap={lc} strokeLinejoin={lj} />
  )),

  arrow: makeIcon((c, s) => (
    <>
      <Path d="M5 12H19" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path
        d="M13 6L19 12L13 18"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
    </>
  )),

  arrowLeft: makeIcon((c, s) => (
    <>
      <Path d="M19 12H5" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path
        d="M11 6L5 12L11 18"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
    </>
  )),

  close: makeIcon((c, s) => (
    <>
      <Path d="M6 6L18 18" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M18 6L6 18" stroke={c} strokeWidth={s} strokeLinecap={lc} />
    </>
  )),

  search: makeIcon((c, s) => (
    <>
      <Circle cx="11" cy="11" r="6.5" stroke={c} strokeWidth={s} />
      <Path d="M20 20L16.5 16.5" stroke={c} strokeWidth={s} strokeLinecap={lc} />
    </>
  )),

  more: makeIcon((c, _s) => (
    <>
      <Circle cx="6" cy="12" r="1.4" fill={c} />
      <Circle cx="12" cy="12" r="1.4" fill={c} />
      <Circle cx="18" cy="12" r="1.4" fill={c} />
    </>
  )),

  settings: makeIcon((c, s) => (
    <>
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={s} />
      <Path
        d="M19.4 15C19.79 15.64 19.57 16.47 18.93 16.86L17.68 17.6C17.05 17.99 16.22 17.77 15.83 17.13L15.77 17.06C15.41 16.46 14.74 16.09 14.03 16.09C13.32 16.09 12.65 16.46 12.29 17.06L12.23 17.13C11.84 17.77 11.01 17.99 10.38 17.6L9.13 16.86C8.49 16.47 8.27 15.64 8.66 15C9.02 14.4 9.02 13.6 8.66 13L8.6 12.93C8.21 12.29 8.43 11.46 9.07 11.07L10.32 10.33C10.95 9.94 11.78 10.16 12.17 10.8L12.23 10.87C12.59 11.47 13.26 11.84 13.97 11.84C14.68 11.84 15.35 11.47 15.71 10.87L15.77 10.8C16.16 10.16 16.99 9.94 17.62 10.33L18.87 11.07C19.51 11.46 19.73 12.29 19.34 12.93"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
    </>
  )),

  flame: makeIcon((c, s) => (
    <Path
      d="M12 3C12 3 16 7 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 10 9 9 9 9C9 9 8 14 12 14C14 14 14 11 14 9C14 7 12 3 12 3Z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={lc}
      strokeLinejoin={lj}
    />
  )),

  star: makeIcon((c, s) => (
    <Path
      d="M12 4L14.4 9.2L20 9.7L15.7 13.6L17 19.2L12 16.1L7 19.2L8.3 13.6L4 9.7L9.6 9.2Z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={lc}
      strokeLinejoin={lj}
    />
  )),

  bulb: makeIcon((c, s) => (
    <>
      <Path d="M9 17H15" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M10 21H14" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path
        d="M8 13C7 12 6.5 10.6 6.5 9C6.5 6.52 8.24 4.5 10.5 4.1C10.99 4.03 11.49 4 12 4C14.76 4 17 6.24 17 9C17 10.6 16.3 12 15.5 13C14.5 14 14.5 15 14.5 16H9.5C9.5 15 9.5 14 8 13Z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
    </>
  )),

  heart: makeIcon((c, s) => (
    <Path
      d="M12 20C12 20 5 15.5 5 10C5 7.24 7.24 5 10 5C11.04 5 12 5.4 12 5.4C12 5.4 12.96 5 14 5C16.76 5 19 7.24 19 10C19 15.5 12 20 12 20Z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={lc}
      strokeLinejoin={lj}
    />
  )),

  sparkle: makeIcon((c, s) => (
    <>
      <Path d="M12 4V8" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M12 16V20" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M4 12H8" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M16 12H20" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M6 6L8.5 8.5" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M15.5 15.5L18 18" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M6 18L8.5 15.5" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M15.5 8.5L18 6" stroke={c} strokeWidth={s} strokeLinecap={lc} />
    </>
  )),

  trash: makeIcon((c, s) => (
    <>
      <Path d="M5 7H19" stroke={c} strokeWidth={s} strokeLinecap={lc} />
      <Path d="M10 7V4H14V7" stroke={c} strokeWidth={s} strokeLinecap={lc} strokeLinejoin={lj} />
      <Path
        d="M7 7L8 20H16L17 7"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
    </>
  )),

  edit: makeIcon((c, s) => (
    <>
      <Path
        d="M4 20H8L18 10L14 6L4 16V20Z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Path d="M14 6L18 10" stroke={c} strokeWidth={s} strokeLinecap={lc} strokeLinejoin={lj} />
    </>
  )),

  pin: makeIcon((c, s) => (
    <>
      <Path
        d="M12 21C12 21 5 13.5 5 9C5 5.13 8.13 2 12 2C15.87 2 19 5.13 19 9C19 13.5 12 21 12 21Z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={lc}
        strokeLinejoin={lj}
      />
      <Circle cx="12" cy="9" r="2.5" stroke={c} strokeWidth={s} />
    </>
  )),

  clock: makeIcon((c, s) => (
    <>
      <Circle cx="12" cy="12" r="8" stroke={c} strokeWidth={s} />
      <Path d="M12 8V12L15 14" stroke={c} strokeWidth={s} strokeLinecap={lc} strokeLinejoin={lj} />
    </>
  )),

  shield: makeIcon((c, s) => (
    <Path
      d="M12 3L19 6V12C19 16 16 19 12 21C8 19 5 16 5 12V6L12 3Z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={lc}
      strokeLinejoin={lj}
    />
  )),
} as const;

export type IconName = keyof typeof Icon;
