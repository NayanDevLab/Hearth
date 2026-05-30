// Onboarding illustration 1 — A home with glowing windows, two figures inside.

import React from 'react';

import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

interface IllusHomeProps {
  width?: number;
  height?: number;
}

export function IllusHome({ width = 280, height = 240 }: IllusHomeProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 240" fill="none">
      {/* sky blob */}
      <Ellipse cx="140" cy="120" rx="130" ry="100" fill="#F5E4DB" />
      {/* crescent moon */}
      <Circle cx="220" cy="70" r="14" fill="#EFC84E" />
      <Circle cx="226" cy="68" r="10" fill="#F5E4DB" />
      {/* house body */}
      <Path d="M70 200V130L140 80L210 130V200Z" fill="#C96B50" />
      {/* roof shadow */}
      <Path d="M70 130L140 80L210 130L140 146Z" fill="#A8503A" />
      {/* door */}
      <Rect x="128" y="158" width="24" height="42" rx="12" fill="#2A2D3A" />
      <Circle cx="146" cy="180" r="1.5" fill="#EFC84E" />
      {/* left window (glowing) */}
      <Rect x="86" y="150" width="28" height="28" rx="6" fill="#FBF3D0" />
      {/* right window (glowing) */}
      <Rect x="166" y="150" width="28" height="28" rx="6" fill="#FBF3D0" />
      {/* figure in left window */}
      <Circle cx="96" cy="162" r="4" fill="#2A2D3A" />
      <Path d="M90 175C91 171 93 170 96 170C99 170 101 171 102 175Z" fill="#2A2D3A" />
      {/* figure in right window */}
      <Circle cx="180" cy="162" r="4" fill="#2A2D3A" />
      <Path d="M174 175C175 171 177 170 180 170C183 170 185 171 186 175Z" fill="#2A2D3A" />
      {/* chimney heart-puff */}
      <Path
        d="M180 92C180 89 182 87 184 87C186 87 188 89 188 91C188 93.2 184 97 184 97C184 97 180 95 180 92Z"
        fill="#FAE5E2"
      />
      {/* ground shadow */}
      <Rect x="40" y="200" width="200" height="6" rx="3" fill="#2A2D3A" fillOpacity={0.12} />
      {/* plants */}
      <Path d="M52 200C52 188 56 182 62 182C62 190 58 196 52 200Z" fill="#4BBE8D" />
      <Path d="M228 200C228 190 231 185 236 185C236 192 233 198 228 200Z" fill="#4BBE8D" />
    </Svg>
  );
}
