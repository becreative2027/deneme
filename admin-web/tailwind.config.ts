import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#6c63ff',
        'brand-dark': '#5a52e0',
      },
    },
  },
};

export default config;
