/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9945FF',
          light: '#B57BFF',
          dark: '#722BB8',
        },
        secondary: {
          DEFAULT: '#14F195',
          light: '#66FFD1',
          dark: '#00C97B',
        },
        dark: {
          DEFAULT: '#0C0B13',
          light: '#1E1C2E',
        },
        light: '#FFFFFF',
        gray: '#64748b',
      },
      backgroundImage: {
        'hero-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239945FF\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      boxShadow: {
        'glow': '0 0 20px 5px rgba(153, 69, 255, 0.15)',
        'glow-secondary': '0 0 20px 5px rgba(20, 241, 149, 0.15)',
      }
    },
  },
  plugins: [],
}
