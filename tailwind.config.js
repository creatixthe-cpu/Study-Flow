/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        primary: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
          light: '#8B5CF6',
          glow: 'rgba(124, 58, 237, 0.25)',
        },
        frosted: {
          surface: 'rgba(255, 255, 255, 0.05)',
          surfaceElevated: 'rgba(255, 255, 255, 0.08)',
          surfaceHover: 'rgba(255, 255, 255, 0.10)',
          border: 'rgba(255, 255, 255, 0.10)',
          borderHover: 'rgba(255, 255, 255, 0.18)',
        },
        emerald: {
          accent: '#10B981',
          glow: 'rgba(16, 185, 129, 0.15)'
        },
        flame: {
          accent: '#F97316',
          glow: 'rgba(249, 115, 22, 0.15)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-violet': '0 0 35px -5px rgba(124, 58, 237, 0.45)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
