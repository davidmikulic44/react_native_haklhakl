/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        textPrimary: "#F5F8FE"
      },
      fontFamily: {
        regular: ["IstokWeb-Regular", "sans-serif"],
        boldItalic: ["IstokWeb-BoldItalic", "sans-serif"],
        bold: ["IstokWeb-Bold", "sans-serif"],
        italic: ["IstokWeb-Italic", "sans-serif"],
      }
    },
  },
  plugins: [],
}

