/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "tab-title": '#57C785'
      },
      fontFamily: {
        "bungee": ["Bungee-Regular", "sans-serif"],
        "calsans": ["Calsans-Regular", "sans-serif"],
        "staatliches": ["Staatliches-Regular", "sans-serif"]
      }
    },
  },
  plugins: [],
};

