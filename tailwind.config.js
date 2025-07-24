/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#555879',
          dark: '#4a4d6b',
          light: '#6a6e8f'
        },
        secondary: {
          DEFAULT: '#98A1BC',
          dark: '#8591aa',
          light: '#aab2c9'
        },
        accent: {
          DEFAULT: '#DED3C4',
          dark: '#d4c7b6',
          light: '#e8ddd2'
        },
        background: {
          DEFAULT: '#F4EBD3',
          dark: '#f0e5c7',
          light: '#f8f1df'
        }
      }
    },
  },
  plugins: [],
};