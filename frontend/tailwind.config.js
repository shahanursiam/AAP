/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for 'Google Antigravity' feel would go here
        primary: '#1a73e8', // Example
      },
    },
  },
  plugins: [],
}
