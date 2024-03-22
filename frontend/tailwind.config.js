/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/**/*.{html,js,css}", 
    "*.html", 
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ]
}

