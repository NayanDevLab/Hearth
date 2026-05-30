// Onboarding illustration 3 — Whole household, circle of member avatars.

import React from 'react';

import Svg, { Circle, Ellipse, Path, Text } from 'react-native-svg';

interface IllusFamilyProps {
  width?: number;
  height?: number;
}

const MEMBERS = [
  { x: 140, y: 62, color: '#C96B50', initial: 'A' },
  { x: 208, y: 130, color: '#4AADD1', initial: 'M' },
  { x: 140, y: 198, color: '#EFC84E', initial: 'L' },
  { x: 72, y: 130, color: '#9A7ECF', initial: 'R' },
];

export function IllusFamily({ width = 280, height = 240 }: IllusFamilyProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 240" fill="none">
      {/* background blob */}
      <Ellipse cx="140" cy="130" rx="120" ry="90" fill="#E1F5EC" />
      {/* dashed orbit ring */}
      <Circle cx="140" cy="130" r="68" stroke="#4BBE8D" strokeWidth="2" strokeDasharray="3 6" />
      {/* center white circle */}
      <Circle cx="140" cy="130" r="32" fill="#FFFFFF" stroke="#E5E0D7" strokeWidth="2" />
      {/* center house icon */}
      <Path d="M126 144V126L140 116L154 126V144H142V136H138V144Z" fill="#C96B50" />
      {/* member avatars */}
      {MEMBERS.map((m) => (
        <React.Fragment key={m.initial}>
          <Circle cx={m.x} cy={m.y} r="22" fill={m.color} />
          <Text
            x={m.x}
            y={m.y + 6}
            fontSize="16"
            fontWeight="700"
            textAnchor="middle"
            fill="#FFFFFF"
          >
            {m.initial}
          </Text>
        </React.Fragment>
      ))}
      {/* sparkle dots */}
      <Circle cx="60" cy="60" r="3" fill="#EFC84E" />
      <Circle cx="230" cy="70" r="2" fill="#EFC84E" />
      <Circle cx="220" cy="200" r="3" fill="#EFC84E" />
      <Circle cx="50" cy="200" r="2" fill="#EFC84E" />
    </Svg>
  );
}
