/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./hooks/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fasai: {
          50: "#f1faed",
          100: "#e0f3d8",
          200: "#bfe7b1",
          300: "#94d782",
          400: "#66c451",
          500: "#3fae2a",
          600: "#2d8d20",
          700: "#216f1a",
          800: "#195818",
          900: "#124515"
        }
      },
      boxShadow: {
        soft: "0 12px 35px rgba(16, 61, 24, 0.10)",
        card: "0 8px 25px rgba(16, 61, 24, 0.08)"
      }
    }
  },
  plugins: []
};
