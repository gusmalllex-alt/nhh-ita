// ITA Hospital Portal Design System
// Dark Green Professional Color Palette

export const colors = {
  // Primary Dark Green Palette
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7', 
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Primary green
    600: '#16a34a', // Darker green
    700: '#15803d', // Deep green
    800: '#166534', // Very deep green
    900: '#14532d', // Darkest green
    950: '#052e16', // Almost black green
  },
  
  // Professional Hospital Colors
  hospital: {
    navy: '#1e3a5f',      // Professional navy blue
    teal: '#0f766e',      // Medical teal
    sage: '#6b7280',      // Sage gray
    cream: '#fef3c7',    // Warm cream
    slate: '#475569',     // Slate gray
  },
  
  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b', 
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Neutral Colors
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  }
};

export const typography = {
  fonts: {
    primary: '"Prompt", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    secondary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  }
};

export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Professional hospital shadows
  hospital: {
    card: '0 4px 20px -10px rgba(21, 128, 61, 0.15)',
    button: '0 4px 14px 0 rgba(21, 128, 61, 0.2)',
    modal: '0 25px 50px -12px rgba(30, 58, 95, 0.25)',
  }
};

export const animations = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

// CSS Classes for Tailwind
export const tailwindConfig = {
  theme: {
    extend: {
      colors: colors,
      fontFamily: typography.fonts,
      fontSize: typography.sizes,
      fontWeight: typography.weights,
      spacing: spacing,
      borderRadius: borderRadius,
      boxShadow: shadows,
      transitionDuration: animations.durations,
      transitionTimingFunction: animations.easing,
    }
  }
};

// Utility Classes
export const utils = {
  // Button styles
  button: {
    primary: 'bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-semibold shadow-lg shadow-green-900/25 hover:shadow-green-900/35 transition-all duration-300',
    secondary: 'bg-white border-2 border-green-700 text-green-700 hover:bg-green-50 font-semibold transition-all duration-300',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold transition-all duration-300',
    ghost: 'text-green-700 hover:bg-green-50 font-semibold transition-all duration-300',
  },
  
  // Card styles
  card: {
    base: 'bg-white rounded-2xl shadow-hospital-card border border-green-100 hover:shadow-lg transition-all duration-300',
    interactive: 'bg-white rounded-2xl shadow-hospital-card border border-green-100 hover:shadow-hospital-button hover:-translate-y-1 transition-all duration-300 cursor-pointer',
  },
  
  // Input styles
  input: {
    base: 'w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300 font-medium',
  },
  
  // Text styles
  text: {
    heading: 'font-bold text-green-900',
    subheading: 'font-semibold text-green-800',
    body: 'font-medium text-gray-700',
    muted: 'font-medium text-gray-500',
  }
};
