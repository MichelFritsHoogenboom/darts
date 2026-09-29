/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        oswald: ["Oswald", "sans-serif"],
        "barlow-condensed": ['"Barlow Condensed"', "sans-serif"],
      },
      colors: {
        dartboard: {
          red: {
            DEFAULT: '#c62828',
            dark: '#9b1f1f',
          },
          blue: {
            DEFAULT: '#3d5a80',
            dark: '#2f4766',
            bright: '#1a6fe8',
          },
          green: '#16a34a',
          black: '#1f2937',
          white: '#f9fafb'
        },
       
        logo: '#fafafa',
      }
    },
  },
  plugins: [],
};
