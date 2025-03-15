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
          DEFAULT: '#8a2be2', // Updated to match CSS variables
          dark: '#7825c7',
          light: '#9d4cef',
        },
        secondary: {
          DEFAULT: '#0A0B0D',
          dark: '#000000',
          light: '#1F2125',
        },
        accent: {
          DEFAULT: '#ff69b4', // Updated to match CSS variables
          dark: '#e55aa0',
          light: '#ff85c2',
        },
        background: {
          DEFAULT: '#0a0a0a', // Updated to match CSS variables
          dark: '#050505',
          light: '#1A1D21',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=2832&auto=format&fit=crop')",
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(138, 43, 226, 0.7)' },
          '100%': { boxShadow: '0 0 20px rgba(138, 43, 226, 0.9)' },
        }
      },
      blur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
