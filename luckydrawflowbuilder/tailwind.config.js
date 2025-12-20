/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        whatsapp: {
          50: '#E7F8EE',
          100: '#C3EDDA',
          200: '#9FE2C5',
          300: '#7BD7B0',
          400: '#57CC9B',
          500: '#25D366',
          600: '#1EAA52',
          700: '#17803D',
          800: '#105729',
          900: '#092D14',
        },
        // Hyprland-inspired dark theme colors
        slate: {
          750: '#334155',
          850: '#1e293b',
          950: '#020617',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.1s ease-out',
        'slide-in': 'slideIn 0.1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
