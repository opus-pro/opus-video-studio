import React from 'react';

type IconProps = {size?: number; color?: string; stroke?: number; style?: React.CSSProperties};

const Svg: React.FC<IconProps & {children: React.ReactNode; viewBox?: string}> = ({
  size = 22,
  style,
  children,
  viewBox = '0 0 24 24',
}) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" style={{display: 'block', ...style}}>
    {children}
  </svg>
);

export const Compass: React.FC<IconProps> = ({color = 'currentColor', stroke = 1.8, ...p}) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={stroke} />
    <path d="M15.6 8.4 13.4 13.4 8.4 15.6 10.6 10.6Z" fill={color} stroke={color} strokeWidth={stroke * 0.7} strokeLinejoin="round" />
  </Svg>
);

export const MapIcon: React.FC<IconProps> = ({color = 'currentColor', stroke = 1.8, ...p}) => (
  <Svg {...p}>
    <path
      d="M9 4.5 3.8 6.4v13.1L9 17.6l6 1.9 5.2-1.9V4.5L15 6.4 9 4.5Z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <path d="M9 4.5v13.1M15 6.4v13.1" stroke={color} strokeWidth={stroke} />
  </Svg>
);

export const Bookmark: React.FC<IconProps & {filled?: boolean}> = ({color = 'currentColor', stroke = 1.8, filled, ...p}) => (
  <Svg {...p}>
    <path
      d="M6.5 4.5h11v15.2L12 16.1l-5.5 3.6V4.5Z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

export const User: React.FC<IconProps> = ({color = 'currentColor', stroke = 1.8, ...p}) => (
  <Svg {...p}>
    <circle cx="12" cy="8.6" r="3.8" stroke={color} strokeWidth={stroke} />
    <path d="M4.8 19.8c1.2-3.5 4-5.2 7.2-5.2s6 1.7 7.2 5.2" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </Svg>
);

export const Bell: React.FC<IconProps> = ({color = 'currentColor', stroke = 1.8, ...p}) => (
  <Svg {...p}>
    <path
      d="M6.3 16.4V11a5.7 5.7 0 0 1 11.4 0v5.4l1.5 1.6H4.8l1.5-1.6Z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <path d="M10 20.2a2.2 2.2 0 0 0 4 0" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </Svg>
);

export const Pin: React.FC<IconProps> = ({color = 'currentColor', stroke = 1.8, ...p}) => (
  <Svg {...p}>
    <path d="M12 21s6.5-5.8 6.5-11.2a6.5 6.5 0 1 0-13 0C5.5 15.2 12 21 12 21Z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    <circle cx="12" cy="9.8" r="2.3" stroke={color} strokeWidth={stroke} />
  </Svg>
);

export const Star: React.FC<IconProps> = ({color = 'currentColor', ...p}) => (
  <Svg {...p}>
    <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3.2Z" fill={color} />
  </Svg>
);

export const Sun: React.FC<IconProps> = ({color = 'currentColor', stroke = 2, ...p}) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth={stroke} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const r = (a * Math.PI) / 180;
      return (
        <line
          key={a}
          x1={12 + Math.cos(r) * 7.2}
          y1={12 + Math.sin(r) * 7.2}
          x2={12 + Math.cos(r) * 9.4}
          y2={12 + Math.sin(r) * 9.4}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      );
    })}
  </Svg>
);

export const Wave: React.FC<IconProps> = ({color = 'currentColor', stroke = 2, ...p}) => (
  <Svg {...p}>
    <path d="M3 10c2.2 0 2.2-2 4.5-2S9.7 10 12 10s2.2-2 4.5-2S18.8 10 21 10" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    <path d="M3 15.5c2.2 0 2.2-2 4.5-2s2.2 2 4.5 2 2.2-2 4.5-2 2.3 2 4.5 2" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </Svg>
);

export const Tree: React.FC<IconProps> = ({color = 'currentColor', stroke = 2, ...p}) => (
  <Svg {...p}>
    <path d="M12 3 6.5 11h3L6 16.5h12L14.5 11h3L12 3Z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    <path d="M12 16.5V21" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </Svg>
);

export const Peak: React.FC<IconProps> = ({color = 'currentColor', stroke = 2, ...p}) => (
  <Svg {...p}>
    <path d="M2.5 19.5 9.5 7l4 6.6 2.2-3.4 5.8 9.3h-19Z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    <path d="m7.6 10.4 1.9 1.6 1.7-1.5" stroke={color} strokeWidth={stroke * 0.8} strokeLinejoin="round" strokeLinecap="round" />
  </Svg>
);

export const Alert: React.FC<IconProps> = ({color = 'currentColor', stroke = 2, ...p}) => (
  <Svg {...p}>
    <path d="M12 4 21 19.5H3L12 4Z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    <path d="M12 10v4.2" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    <circle cx="12" cy="16.8" r="1.1" fill={color} />
  </Svg>
);

export const Chevron: React.FC<IconProps> = ({color = 'currentColor', stroke = 2, ...p}) => (
  <Svg {...p}>
    <path d="m9.5 6 6 6-6 6" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// FIELD brand mark: twin peaks with a trail line.
export const FieldMark: React.FC<{size?: number}> = ({size = 26}) => (
  <svg width={size} height={size} viewBox="0 0 26 26" style={{display: 'block'}}>
    <rect width="26" height="26" rx="8" fill="#1F3B2D" />
    <path d="M4.6 18.6 10.4 9.2l3.3 5.2 2.1-3.1 5.6 7.3H4.6Z" fill="#F3EFE6" />
    <path d="M10.4 9.2 12 11.7l-1.6.9-1.5-.9 1.5-2.5Z" fill="#E0663A" />
    <circle cx="18.8" cy="7.2" r="1.9" fill="#E0663A" />
  </svg>
);

export const SignalIcon: React.FC<{color: string}> = ({color}) => (
  <svg width="17" height="11" viewBox="0 0 17 11" style={{display: 'block'}}>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 4.5} y={8 - i * 2.6} width="3" height={3 + i * 2.6} rx="0.9" fill={color} />
    ))}
  </svg>
);

export const WifiIcon: React.FC<{color: string}> = ({color}) => (
  <svg width="15" height="11" viewBox="0 0 15 11" style={{display: 'block'}}>
    <path d="M7.5 10.6 5.3 8.3a3.2 3.2 0 0 1 4.4 0L7.5 10.6Z" fill={color} />
    <path d="M3.6 6.6a5.6 5.6 0 0 1 7.8 0l-1.1 1.1a4 4 0 0 0-5.6 0L3.6 6.6Z" fill={color} />
    <path d="M1.2 4.2a9 9 0 0 1 12.6 0l-1.1 1.1a7.4 7.4 0 0 0-10.4 0L1.2 4.2Z" fill={color} />
  </svg>
);

export const BatteryIcon: React.FC<{color: string}> = ({color}) => (
  <svg width="25" height="12" viewBox="0 0 25 12" style={{display: 'block'}}>
    <rect x="0.6" y="0.6" width="21.4" height="10.8" rx="3.2" stroke={color} strokeOpacity="0.4" strokeWidth="1.1" fill="none" />
    <rect x="2.2" y="2.2" width="15.4" height="7.6" rx="1.8" fill={color} />
    <path d="M23.2 4.1v3.8c.8-.3 1.3-1 1.3-1.9s-.5-1.6-1.3-1.9Z" fill={color} fillOpacity="0.45" />
  </svg>
);
