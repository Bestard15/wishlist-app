/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B6B",
        secondary: "#4ECDC4",
        success: "#A8E6CF",
        appbg: "#F7F9FC",
        ink: "#2D3436",
        banana: "#FFE66D",
        peach: "#FFD3B6",
        sky: "#C7F0FF"
      },
      fontFamily: {
        rounded: ["'Baloo 2'", "'Nunito'", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        bubble: "1.5rem",
        blob: "2rem"
      },
      boxShadow: {
        soft: "0 8px 0 rgba(45, 52, 54, 0.12)",
        card: "0 10px 24px rgba(45, 52, 54, 0.12)",
        float: "0 16px 40px rgba(78, 205, 196, 0.22)"
      },
      keyframes: {
        popIn: {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.96)" },
          "65%": { opacity: "1", transform: "translateY(-6px) scale(1.02)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        popIn: "popIn 460ms cubic-bezier(0.22, 1, 0.36, 1) both"
      }
    }
  },
  plugins: []
};