import type React from 'react';

export type Theme = {
  id: string;
  name: string;
  bg: string;
  bgImage: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  onAccent: string;
  rule: string;
  glow: string;
  headFont: string;
  headWeight: number;
  headStyle: React.CSSProperties['fontStyle'];
  headTransform: React.CSSProperties['textTransform'];
  headSize: number;
  headLine: number;
  headTracking: string;
  logoSize: number;
  logoTracking: string;
  cardTitleSize: number;
  cardTitleWeight: number;
  bodyFont: string;
  bodyWeight: number;
  uiFont: string;
  radius: number;
  thumbRadius: number;
  buttonRadius: number;
  buttonFilled: boolean;
  imgFilter: string;
  imgOverlay: string;
  imgBlend: React.CSSProperties['mixBlendMode'];
};

export const alpine: Theme = {
  id: 'alpine',
  name: 'Alpine',
  bg: '#F4F1E9',
  bgImage: 'linear-gradient(180deg, #F7F4ED 0%, #F1EDE3 100%)',
  surface: '#E9E4D8',
  ink: '#18221D',
  muted: '#58625C',
  accent: '#2E5C45',
  onAccent: '#F4F1E9',
  rule: 'rgba(24,34,29,0.14)',
  glow: '#5E9A74',
  headFont: 'Baskerville, "Libre Baskerville", Georgia, serif',
  headWeight: 400,
  headStyle: 'normal',
  headTransform: 'none',
  headSize: 39,
  headLine: 1.0,
  headTracking: '-0.012em',
  logoSize: 21,
  logoTracking: '-0.01em',
  cardTitleSize: 12.5,
  cardTitleWeight: 400,
  bodyFont: '"Avenir Next", Avenir, "Helvetica Neue", sans-serif',
  bodyWeight: 400,
  uiFont: '"Avenir Next", Avenir, "Helvetica Neue", sans-serif',
  radius: 3,
  thumbRadius: 2,
  buttonRadius: 999,
  buttonFilled: false,
  imgFilter: 'saturate(1.04)',
  imgOverlay: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.12) 100%)',
  imgBlend: 'normal',
};

export const canyon: Theme = {
  id: 'canyon',
  name: 'Canyon',
  bg: '#EEDDC7',
  bgImage: 'linear-gradient(180deg, #F1E2CE 0%, #EAD6BD 100%)',
  surface: '#E4CDB1',
  ink: '#35170C',
  muted: '#7A4A35',
  accent: '#B8471D',
  onAccent: '#FBEFE2',
  rule: 'rgba(53,23,12,0.17)',
  glow: '#E07640',
  headFont: 'Futura, "Century Gothic", "Trebuchet MS", sans-serif',
  headWeight: 700,
  headStyle: 'normal',
  headTransform: 'uppercase',
  headSize: 32,
  headLine: 1.04,
  headTracking: '0.004em',
  logoSize: 16,
  logoTracking: '0.14em',
  cardTitleSize: 11.5,
  cardTitleWeight: 600,
  bodyFont: 'Georgia, "Times New Roman", serif',
  bodyWeight: 400,
  uiFont: 'Futura, "Century Gothic", "Trebuchet MS", sans-serif',
  radius: 18,
  thumbRadius: 10,
  buttonRadius: 4,
  buttonFilled: true,
  imgFilter: 'sepia(0.42) saturate(1.45) contrast(1.06) hue-rotate(-10deg) brightness(1.02)',
  imgOverlay: 'linear-gradient(180deg, rgba(232,120,60,0.20) 0%, rgba(120,40,12,0.26) 100%)',
  imgBlend: 'soft-light',
};

export const night: Theme = {
  id: 'night',
  name: 'Night',
  bg: '#0F1417',
  bgImage: 'radial-gradient(120% 90% at 78% 0%, #1B252B 0%, #10161A 55%, #0C1013 100%)',
  surface: '#182126',
  ink: '#EEE8DC',
  muted: '#9DA8A9',
  accent: '#DDB56B',
  onAccent: '#14191C',
  rule: 'rgba(238,232,220,0.13)',
  glow: '#5D86B8',
  headFont: 'Didot, "Bodoni 72", "Playfair Display", serif',
  headWeight: 400,
  headStyle: 'italic',
  headTransform: 'none',
  headSize: 42,
  headLine: 0.98,
  headTracking: '-0.018em',
  logoSize: 24,
  logoTracking: '-0.01em',
  cardTitleSize: 13,
  cardTitleWeight: 400,
  bodyFont: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  bodyWeight: 300,
  uiFont: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  radius: 10,
  thumbRadius: 7,
  buttonRadius: 999,
  buttonFilled: true,
  imgFilter: 'brightness(0.9) contrast(1.1) saturate(0.82) hue-rotate(6deg)',
  imgOverlay: 'linear-gradient(180deg, rgba(90,125,185,0.34) 0%, rgba(30,46,80,0.52) 100%)',
  imgBlend: 'multiply',
};

export const THEMES = [alpine, canyon, night];
