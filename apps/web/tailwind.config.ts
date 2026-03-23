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
          DEFAULT: '#0a0a0a',
          card: '#1c1b33',
          surface: '#17162d',
          border: '#2d2b4e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
