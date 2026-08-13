/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        surface: '#121213',
        'surface-highlight': '#1f1f20',
        primary: {
          400: '#d9a952',
          500: '#c9973e', // Bronze/Amber accent
          600: '#b0812d',
        },
        text: {
          primary: '#f5f5f0',
          muted: '#9c9c9a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
