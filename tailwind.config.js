const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      maxWidth: {
        'container-width': '18.88rem',
      },
      colors: {
        siva: '#f9fafb',
        sivaBorder: 'rgb(245 158, 11, 0.2)',
        rose: '#f43f5e',
        sivaBlockedTable: 'rgba(100, 116, 139, 1)',
      },
    },
    // sivaBorder: 'rgba(100, 116, 139, 1)',

    // colors: {
    //   transparent: 'transparent',
    //   current: 'currentColor',
    //   black: colors.black,
    //   white: colors.white,
    //   red: colors.red,
    //   green: colors.green,
    //   zinc: colors.zinc,
    //   slate: colors.slate,
    // },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
