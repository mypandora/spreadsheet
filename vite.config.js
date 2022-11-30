import { resolve } from 'path';
import { defineConfig } from 'vite';
import postcssNesting from 'postcss-nesting';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: '@mypandora/spreadsheet',
      fileName: 'spreadsheet',
    },
  },
  css: {
    postcss: {
      plugins: [postcssNesting],
    },
  },
});
