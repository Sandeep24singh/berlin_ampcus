/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        cloud: "#f8fafc",
        accent: "#0f766e",
        warning: "#b45309",
        danger: "#b91c1c"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        card: "0 20px 45px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
