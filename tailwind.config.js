/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          0: '#F7F6F3',
          1: '#FFFFFF',
          2: '#F2F1EE',
        },
        border: {
          subtle: '#E8E6E1',
          default: '#D4D1CB',
          strong: '#B8B4AC',
        },
        ink: {
          primary: '#141210',
          secondary: '#6B6660',
          tertiary: '#A09C97',
        },
        ember: {
          50:  '#FFF8F0',
          100: '#FEECD9',
          200: '#FDD5AA',
          400: '#F5A653',
          600: '#D97C28',
          800: '#8B4B10',
        },
        studio: {
          bg:   '#0C0B09',
          card: '#141210',
          ele:  '#1C1A17',
          brd:  '#2A2722',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)',
        'card-xl': '0 4px 24px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.08)',
      },
      letterSpacing: {
        widest2: '0.15em',
        widest3: '0.2em',
      },
    },
  },
  plugins: [],
}


