/**
 * @fileoverview Konfiguracja motywu (theme)
 */

export const THEME = {
  colors: {
    primary: '#00E5FF',
    secondary: '#FF3D71',
    success: '#00E096',
    warning: '#FFAA00',
    error: '#FF3D71',
    background: {
      dark: '#0A0E27',
      card: '#1A1F3A',
      hover: '#232946',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B8C1EC',
      muted: '#6B7A99',
    },
    border: '#2A3353',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    full: '9999px',
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
    glow: '0 0 20px rgba(0, 229, 255, 0.3)',
  },
  
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const;

export type Theme = typeof THEME;
