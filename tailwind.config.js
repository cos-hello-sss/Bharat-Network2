/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Sans 3"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        saffron: {
          50: '#fff8f0',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
          700: '#c2570a',
          800: '#9a4210',
          900: '#7c3412',
        },
        ink: {
          50: '#f8f7f4',
          100: '#f0ede6',
          200: '#ddd8cc',
          300: '#c5bdb0',
          400: '#a99d8f',
          500: '#8e8075',
          600: '#736660',
          700: '#5e534e',
          800: '#4e4540',
          900: '#3a3230',
          950: '#1c1714',
        },
        jade: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
      }
    },
  },
  plugins: [],
}
