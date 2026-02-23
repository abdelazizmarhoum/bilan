/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#060b14',
          900: '#0d1117',
          800: '#131d2e',
          700: '#1a2640',
          600: '#243350',
          500: '#2e4268',
        },
        actif: {
          DEFAULT: '#4f93ff',
          dim:    '#1a3a6e',
          glow:   'rgba(79,147,255,0.25)',
          soft:   'rgba(79,147,255,0.08)',
        },
        passif: {
          DEFAULT: '#f59e0b',
          dim:    '#5a3a0a',
          glow:   'rgba(245,158,11,0.25)',
          soft:   'rgba(245,158,11,0.08)',
        },
        success: {
          DEFAULT: '#10b981',
          glow:   'rgba(16,185,129,0.25)',
          soft:   'rgba(16,185,129,0.08)',
        },
        danger: {
          DEFAULT: '#f43f5e',
          glow:   'rgba(244,63,94,0.25)',
          soft:   'rgba(244,63,94,0.08)',
        },
      },
      boxShadow: {
        'glow-actif':   '0 0 20px rgba(79,147,255,0.2)',
        'glow-passif':  '0 0 20px rgba(245,158,11,0.2)',
        'glow-success': '0 0 20px rgba(16,185,129,0.2)',
        'glow-danger':  '0 0 20px rgba(244,63,94,0.2)',
        'card':         '0 4px 24px rgba(0,0,0,0.4)',
        'card-sm':      '0 2px 12px rgba(0,0,0,0.3)',
      },
      keyframes: {
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulse_ring: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.06)', opacity: '0.7' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 300ms ease-out both',
        shimmer:      'shimmer 1.6s linear infinite',
        pulse_ring:   'pulse_ring 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
