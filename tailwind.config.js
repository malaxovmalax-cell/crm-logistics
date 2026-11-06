/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdeff',
          300: '#8ec9ff',
          400: '#59abff',
          500: '#3389fc',
          600: '#1d6bf2',
          700: '#1654dc',
          800: '#1846b4',
          900: '#1a3e8e',
          950: '#142756',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warn: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        err: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        cardHover: '0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)',
        pop: '0 12px 40px rgba(15,23,42,0.16), 0 4px 12px rgba(15,23,42,0.08)',
      },
    },
  },
  plugins: [],
};
