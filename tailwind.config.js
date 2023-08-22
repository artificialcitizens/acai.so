import plugin from 'tw-elements-react/dist/plugin.cjs';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/**/*.css',
    '"./node_modules/tw-elements-react/dist/js/**/*.js"',
  ],

  theme: {
    extend: {
      acai: {
        primary: '#79586C',
        secondary: '#758496',
        white: '#E7E9E5',
        neutral: '#84868E',
        black: '#2B313B',
        dark: '#402B35',
        darker: '#21171B',
      },
      backgroundColor: {
        lighter: '#313b4b',
        light: '#212529',
        dark: '#15191d',
        base: '#0d0d0d',
        user: '#373737',
        acai: '#5F3C4F',
        'acai-light': '#79586C',
        'acai-dark': '#402B35',
        'acai-darker': '#21171B',
        darker: '#090909',
        'acai-white': '#E7E9E5',
      },
      borderColor: {
        lighter: '#626262',
        light: '#313b4b',
        dark: '#2f2f2f',
        darker: '#090909',
      },
      textColor: {
        light: '#E7E9E5',
        default: '#ffffff',
        dark: '#a8a8a8',
        acai: '#5F3C4F',
        'acai-white': '#E7E9E5',
        'acai-light': '#79586C',
        'acai-dark': '#402B35',
        'acai-darker': '#21171B',
        lighter: '#626262',
        neutral: '#313b4b',
      },
      outlineColor: {
        acai: '#5F3C4F',
        'acai-light': '#79586C',
        'acai-dark': '#402B35',
        'acai-darker': '#21171B',
        lighter: '#626262',
        light: '#313b4b',
        dark: '#2f2f2f',
        darker: '#090909',
      },
      gradientColorStops: (theme) => ({
        acai: '#5F3C4F',
        'acai-light': '#79586C',
        'acai-dark': '#402B35',
        'acai-darker': '#21171B',
        lighter: '#626262',
        light: '#313b4b',
        dark: '#2f2f2f',
        darker: '#090909',
        ...theme('colors'),
      }),
    },
  },
  darkMode: 'class',
  plugins: [plugin],
};
