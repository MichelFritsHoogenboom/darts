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
          red: '#a12929',
          green: '#16a34a',
          black: '#1f2937',
          white: '#f9fafb'
        },
       
        logo: '#fafafa',
      }
    },
  },
  plugins: [],
}
