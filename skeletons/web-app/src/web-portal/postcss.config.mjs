// Tailwind 4 pipeline. `@tailwindcss/postcss` includes prefixing via Lightning CSS,
// so a separate `autoprefixer` step is redundant and adds build noise.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
