import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e50914',
          dark: '#b0060f',
          light: '#ff2d38',
        },
        accent: {
          green: '#00c853',
          red: '#ff1744',
          gold: '#ffd700',
          orange: '#ff6b35',
        },
        dark: {
          DEFAULT: '#08080f',
          card: '#0c0b18',
          surface: '#0f0e1f',
          border: '#1e1d38',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-red':   '0 0 24px rgba(229, 9, 20, 0.45)',
        'glow-green': '0 0 24px rgba(0, 200, 83, 0.45)',
        'glow-gold':  '0 0 24px rgba(255, 215, 0, 0.45)',
        'glow-xl':    '0 0 60px rgba(229, 9, 20, 0.3)',
        'card':       '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
