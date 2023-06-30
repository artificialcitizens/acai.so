/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/**/*.{css}'],
  theme: {
    extend: {
      backgroundColor: {
        lighter: '#313b4b',
        light: '#212529',
        dark: '#15191d',
        darker: '#15191d',
      },
      borderColor: {
        lighter: '#313b4b',
        light: '#313b4b',
        dark: '#2f2f2f',
        darker: '#090909',
      },
      textColor: {
        light: '#e0e0e0',
        default: '#ffffff',
        dark: '#a8a8a8',
      },
    },
  },
  plugins: [],
};
