/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          background: '#0d1117',
          text: '#c9d1d9',
          textMuted: '#8b949e',
          accent: '#58a6ff',
          border: '#30363d',
          surface: '#161b22',
          hover: '#1f2937',
          selected: '#1f6feb',
          excluded: '#6e7681',
          highlight: '#2f2a1e',
          highlightBorder: '#674c16',
          buttonBackground: '#21262d',
          buttonHover: '#30363d',
        },
      },
    },
  },
  plugins: [],
}