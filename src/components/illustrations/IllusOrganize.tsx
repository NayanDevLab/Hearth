// Onboarding illustration 2 — Everything in one place (floating cards).

import React from 'react';

import Svg, { Circle, Ellipse, Path, Rect, Text } from 'react-native-svg';

interface IllusOrganizeProps {
  width?: number;
  height?: number;
}

export function IllusOrganize({ width = 280, height = 240 }: IllusOrganizeProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 240" fill="none">
      {/* background blob */}
      <Ellipse cx="140" cy="130" rx="120" ry="90" fill="#F0EAF9" />
      {/* phone */}
      <Rect
        x="100"
        y="40"
        width="80"
        height="160"
        rx="16"
        fill="#FFFFFF"
        stroke="#23252F"
        strokeWidth="2.5"
      />
      <Rect x="108" y="50" width="64" height="10" rx="3" fill="#E5E0D7" />
      {/* card 1 — task */}
      <Rect x="40" y="62" width="84" height="44" rx="10" fill="#FFFFFF" stroke="#E5E0D7" />
      <Circle cx="56" cy="84" r="6" fill="#4BBE8D" />
      <Path
        d="M53 84L55 86L59 82"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x="68" y="76" width="46" height="4" rx="2" fill="#23252F" />
      <Rect x="68" y="86" width="32" height="3" rx="1.5" fill="#A9AFBD" />
      {/* card 2 — shopping */}
      <Rect x="156" y="50" width="92" height="52" rx="10" fill="#FFFFFF" stroke="#E5E0D7" />
      <Circle cx="172" cy="76" r="10" fill="#FAF3D9" />
      <Path d="M168 74H176M168 78H174" stroke="#C96B50" strokeWidth="1.5" strokeLinecap="round" />
      <Rect x="190" y="68" width="46" height="4" rx="2" fill="#23252F" />
      <Rect x="190" y="78" width="36" height="3" rx="1.5" fill="#A9AFBD" />
      <Rect x="190" y="86" width="28" height="3" rx="1.5" fill="#A9AFBD" />
      {/* card 3 — bill (terracotta) */}
      <Rect x="36" y="140" width="92" height="48" rx="10" fill="#C96B50" />
      <Rect x="48" y="152" width="34" height="4" rx="2" fill="#FFFFFF" fillOpacity={0.85} />
      <Rect x="48" y="162" width="48" height="6" rx="2" fill="#FFFFFF" />
      <Rect x="48" y="174" width="20" height="3" rx="1.5" fill="#FFFFFF" fillOpacity={0.7} />
      <Circle cx="112" cy="164" r="9" fill="#FAF3D9" />
      <Text x="112" y="168" fontSize="10" fontWeight="700" textAnchor="middle" fill="#7A3A26">
        ₹
      </Text>
      {/* card 4 — calendar */}
      <Rect x="160" y="138" width="92" height="58" rx="10" fill="#FFFFFF" stroke="#E5E0D7" />
      <Rect x="172" y="150" width="68" height="4" rx="2" fill="#23252F" />
      <Rect x="172" y="160" width="12" height="10" rx="2" fill="#E0F1F8" />
      <Rect x="188" y="160" width="12" height="10" rx="2" fill="#4AADD1" />
      <Rect x="204" y="160" width="12" height="10" rx="2" fill="#E0F1F8" />
      <Rect x="220" y="160" width="12" height="10" rx="2" fill="#E0F1F8" />
      <Rect x="172" y="174" width="12" height="10" rx="2" fill="#E0F1F8" />
      <Rect x="188" y="174" width="12" height="10" rx="2" fill="#E0F1F8" />
      <Rect x="204" y="174" width="12" height="10" rx="2" fill="#E0F1F8" />
      <Rect x="220" y="174" width="12" height="10" rx="2" fill="#E0F1F8" />
    </Svg>
  );
}
