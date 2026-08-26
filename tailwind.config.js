/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070707',
        surface: '#0d0d0d',
        'surface-highlight': '#1a1a1a',
        primary: {
          400: '#d9ab4f',
          500: '#c89a3d', // Bronze/Amber accent
          600: '#b58731',
        },
        text: {
          primary: '#f3f1eb',
          muted: '#92908a'
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
