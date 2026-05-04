/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf1",
          100: "#d5f5dd",
          500: "#1f8f46",
          600: "#177039",
          900: "#0f2f1b"
        },
        mango: "#f59e0b",
        berry: "#dc2626",
        slate: "#102018"
      },
      boxShadow: {
        card: "0 18px 50px rgba(16, 32, 24, 0.08)"
      }
    }
  },
  plugins: []
};
