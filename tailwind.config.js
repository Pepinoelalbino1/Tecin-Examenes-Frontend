/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f3f6f9',
          100: '#e6eef5',
          200: '#bfddef',
          300: '#99ccea',
          400: '#4d9fdc',
          500: '#0b3b63',
          600: '#0a3559',
          700: '#082a44',
          800: '#061f30',
          900: '#04121b',
        },
        gold: {
          50: '#fffaf0',
          100: '#fff3df',
          200: '#ffe4b3',
          300: '#ffd586',
          400: '#ffc558',
          500: '#b8860b',
          600: '#a37509',
          700: '#886007',
          800: '#664704',
          900: '#443102',
        }
      }
    },
  },
  plugins: [],
}
