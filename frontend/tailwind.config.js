/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "tab-title": '#57C785',
        "primary": '#10E5B2',
        "primary-two": "#72f38e",
        "secondary": '#0B0C15',
        "tertiary": '#FF6F52',
        "tertiary-two": "#FE9A3D"
      },
      fontFamily: {
        "bungee": ["Bungee-Regular", "sans-serif"],
        "calsans": ["CalSans-Regular", "sans-serif"],
        "staatliches": ["Staatliches-Regular", "sans-serif"],
        "oswald-extralight": ["Oswald-ExtraLight", "sans-serif"],
        "oswald-light": ["Oswald-Light", "sans-serif"],
        "oswald-medium": ["Oswald-Medium", "sans-serif"],
        "oswald-regular": ["Oswald-Regular", "sans-serif"]
      }
    },
  },
  plugins: [],
};

