/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        civic: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        civic: '0 4px 24px rgba(30,58,138,.12), 0 2px 8px rgba(30,58,138,.08)',
        'civic-lg': '0 10px 40px rgba(30,58,138,.18), 0 4px 16px rgba(30,58,138,.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease both',
        'slide-up': 'slideUp 0.6s ease both',
      },
    },
  },
  plugins: [],
};
