// Hearth wordmark logo — two house silhouettes with a flame above.

import React from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 64 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Rect width="64" height="64" rx="18" fill="#C96B50" />
      <Path d="M16 44V28L24 22L32 28V44H26V35H22V44Z" fill="#FFFFFF" fillOpacity={0.95} />
      <Path d="M36 44V28L44 22L52 28V44H46V35H42V44Z" fill="#FFFFFF" fillOpacity={0.55} />
      {/* flame */}
      <Path
        d="M30 22C30 19 32 17 32 15C32 17 36 18 36 22C36 24.2 34.7 26 33 26C31.3 26 30 24.2 30 22Z"
        fill="#EFC84E"
      />
    </Svg>
  );
}
