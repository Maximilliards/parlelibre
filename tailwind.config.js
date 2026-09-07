/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        // Calming teal — primary
        teal: {
          50: '#f0fbfa',
          100: '#d6f5f1',
          200: '#aeebe4',
          300: '#7ad9d2',
          400: '#45bfb8',
          500: '#2aa3a0',
          600: '#218583',
          700: '#1f6b6a',
          800: '#1e5655',
          900: '#1c4747',
          950: '#0d2929',
        },
        // Warm amber — accent
        amber: {
          50: '#fdf8ed',
          100: '#faedcd',
          200: '#f4d89e',
          300: '#ecbd60',
          400: '#e4a438',
          500: '#d9882a',
          600: '#bc6820',
          700: '#984d1e',
          800: '#7c3e1f',
          900: '#66331d',
        },
        // Sage — secondary/supporting
        sage: {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#cddccd',
          300: '#a8c3a9',
          400: '#7fa482',
          500: '#5d8762',
          600: '#476c4c',
          700: '#3a573f',
          800: '#304734',
          900: '#283a2c',
        },
        // Warm neutral stone
        stone: {
          50: '#faf9f7',
          100: '#f2f0ec',
          200: '#e6e2da',
          300: '#d3cdc1',
          400: '#b5ad9c',
          500: '#968d7c',
          600: '#7a7163',
          700: '#625a4f',
          800: '#514a42',
          900: '#433d37',
          950: '#2a2622',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'gentle-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-fast': 'fade-in-fast 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.25s ease-out forwards',
        'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
