/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        primary: {
          DEFAULT: 'hsla(222, 80%, 50%)', // Dark blue/black
          // foreground: 'hsl(210, 40%, 98%)', // Light gray/white
        },

        destructive: {
          DEFAULT: 'hsl(0, 84.2%, 60.2%)', // Red
          // foreground: 'hsl(210, 40%, 98%)', // Light gray/white
        },
        // Secondary colors
        secondary: {
          DEFAULT: 'hsl(210, 40%, 96.1%)', // Light gray
          // foreground: 'hsl(222.2, 47.4%, 11.2%)', // Dark blue/black
        },
      },

    },
  },
  plugins: [
    require("tailwindcss-animate"), // for shadcn/ui animations
  ],
};
