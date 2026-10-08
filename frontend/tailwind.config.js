/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Toggle dark mode via the `dark` class on <html> (set by TodoDashboard), not the OS preference.
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Sign-in pages: serif headings and text.
        display: ['"Playfair Display"', "Georgia", "serif"],
        serif: ["Lora", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};