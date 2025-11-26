/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Ensure pages alias and potential external refs picked up
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
    "./src/shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00E5FF',
        secondary: '#B400FF',
        dark: '#0A0A1A',
        'dark-light': '#12121E',
      },
    },
  },
  plugins: [],
}
