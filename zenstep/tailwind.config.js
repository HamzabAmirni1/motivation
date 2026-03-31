/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        zen: {
          green:  '#6ee7b7',
          purple: '#a78bfa',
          blue:   '#7dd3fc',
          rose:   '#fda4af',
          amber:  '#fcd34d',
          bg:     '#0d1117',
          card:   '#161b27',
          border: '#1e2a3a',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(110,231,183,0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(110,231,183,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
