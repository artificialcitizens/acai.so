/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/**/*.{css}'],
  theme: {
    extend: {
      backgroundColor: {
        lighter: '#313b4b',
        light: '#212529',
        dark: '#15191d',
        darker: '#121212',
        base: '#0d0d0d',
        user: '#423d33',
      },
      borderColor: {
        lighter: '#626262',
        light: '#313b4b',
        dark: '#2f2f2f',
        darker: '#090909',
      },
      textColor: {
        light: '#e0e0e0',
        default: '#ffffff',
        dark: '#a8a8a8',
      },
      outlineColor: {
        light: '#e0e0e0',
        default: '#ffffff',
        dark: '#a8a8a8',
      },
    },
  },
  plugins: [],
};
