const path = require('path');

const fromRoot = (...segments) => path.join(__dirname, ...segments);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    fromRoot('apps/shell/index.html'),
    fromRoot('apps/shell/src/**/*.{js,ts,jsx,tsx}'),
    fromRoot('packages/employee-management/src/**/*.{js,ts,jsx,tsx}'),
    fromRoot('packages/schedule/src/**/*.{js,ts,jsx,tsx}')
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        shell: {
          surface: '#edf2f8',
          ink: '#0f172a',
          panel: '#ffffff',
          divider: '#d6dde8',
        },
        nav: {
          background: '#2d3e50',
          surface: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.16)',
          border: '#3d4d60',
          foreground: '#e6ecf5',
          icon: '#cbd6e4',
          muted: '#9aa6b8',
          active: '#4da3ff',
          user: 'rgba(255, 255, 255, 0.14)',
        },
        secondary: {
          surface: '#3a4a5c',
          border: '#2c394a',
          foreground: '#dbe4ef',
          hover: 'rgba(255, 255, 255, 0.12)',
          'hover-foreground': '#ffffff',
          active: '#f3f6fb',
          'active-foreground': '#1f2933',
        },
      },
      boxShadow: {
        shell: '0 10px 30px -12px rgba(31, 45, 63, 0.35)',
        'shell-header': '0 6px 18px -10px rgba(15, 23, 42, 0.45)',
        secondary: '0 6px 18px -12px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [],
};
