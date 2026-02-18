/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "tab-title": '#57C785',
        "primary": '#10E5B2',
        "secondary": '#0B0C15',
        "dark_grey": '#12151D',
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

