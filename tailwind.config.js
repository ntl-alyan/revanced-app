/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",    // New Next.js 13+ app directory
    "./src/**/*.{js,ts,jsx,tsx}",     // Existing src directory
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Add this for manual dark mode control
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}