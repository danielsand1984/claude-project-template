import type { Config } from 'tailwindcss';

const config: Config = {
  // Tailwind 4 auto-detects content from imports, but listing explicit
  // paths keeps things predictable for monorepo / IDE tooling.
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Add design-token extensions here (colors, fontFamily, spacing).
      // Example:
      // colors: {
      //   brand: { 50: '#f0f9ff', 500: '#0ea5e9', 900: '#0c4a6e' },
      // },
    },
  },
  plugins: [],
};

export default config;
