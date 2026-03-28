import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6c63ff',
        'bg-light': '#f8f8f8',
        'bg-dark': '#111114',
        'surface-light': '#ffffff',
        'surface-dark': '#1c1c1e',
        'text-light': '#1a1a1a',
        'text-dark': '#f2f2f7',
        'text-secondary-light': '#555555',
        'text-secondary-dark': 'rgba(235,235,245,0.8)',
        'border-light': '#e8e8e8',
        'border-dark': '#38383a',
        danger: '#e74c3c',
        'danger-dark': '#ff453a',
        success: '#27ae60',
        'success-dark': '#32d74b',
      },
      maxWidth: {
        mobile: '480px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
