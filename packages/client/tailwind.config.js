/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      aspectRatio: {
        portrait: "25 / 35",
        landscape: "35 / 25",
      },
      scale: {
        "-100": "-1",
      },
    },
  },
  plugins: [],
};
