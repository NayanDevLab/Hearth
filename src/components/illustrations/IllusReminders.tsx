// Onboarding illustration 4 — Stay ahead (bell with notification badge + sound waves).

import React from 'react';

import Svg, { Circle, Ellipse, Path, Rect, Text } from 'react-native-svg';

interface IllusRemindersProps {
  width?: number;
  height?: number;
}

export function IllusReminders({ width = 280, height = 240 }: IllusRemindersProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 240" fill="none">
      {/* background blob */}
      <Ellipse cx="140" cy="130" rx="120" ry="90" fill="#FAF3D9" />
      {/* large card */}
      <Rect
        x="78"
        y="58"
        width="124"
        height="124"
        rx="28"
        fill="#FFFFFF"
        stroke="#E5E0D7"
        strokeWidth="2"
      />
      {/* bell body */}
      <Path
        d="M120 134V112C120 101.51 128.95 93 140 93C151.05 93 160 101.51 160 112V134L166 142H114Z"
        fill="#C96B50"
      />
      {/* bell clapper */}
      <Path
        d="M132 152C132 156.42 135.58 160 140 160C144.42 160 148 156.42 148 152"
        stroke="#7A3A26"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* notification badge */}
      <Circle cx="172" cy="86" r="12" fill="#E55A48" />
      <Text x="172" y="91" fontSize="13" fontWeight="800" textAnchor="middle" fill="#FFFFFF">
        3
      </Text>
      {/* left sound waves */}
      <Path
        d="M50 100C44 108 44 122 50 130"
        stroke="#C96B50"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <Path
        d="M36 90C24 104 24 126 36 140"
        stroke="#C96B50"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* right sound waves */}
      <Path
        d="M230 100C236 108 236 122 230 130"
        stroke="#C96B50"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <Path
        d="M244 90C256 104 256 126 244 140"
        stroke="#C96B50"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </Svg>
  );
}
