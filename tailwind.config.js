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
        soft: "0 4px 0 rgba(45, 52, 54, 0.16)",
        card: "0 10px 24px rgba(45, 52, 54, 0.12)",
        float: "0 16px 40px rgba(78, 205, 196, 0.22)"
      },
      keyframes: {
        popIn: {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.96)" },
          "65%": { opacity: "1", transform: "translateY(-6px) scale(1.02)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        floatSlow: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(24px, -32px) scale(1.08)" }
        },
        floatSlower: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-32px, 28px) scale(0.94)" }
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" }
        },
        beat: {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.18)" },
          "45%": { transform: "scale(1)" },
          "60%": { transform: "scale(1.12)" }
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-10px)" },
          "40%": { transform: "translateX(10px)" },
          "60%": { transform: "translateX(-7px)" },
          "80%": { transform: "translateX(7px)" }
        },
        fadeSlide: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        popIn: "popIn 460ms cubic-bezier(0.22, 1, 0.36, 1) both",
        slideUp: "slideUp 380ms cubic-bezier(0.22, 1, 0.36, 1) both",
        fadeIn: "fadeIn 250ms ease-out both",
        floatSlow: "floatSlow 14s ease-in-out infinite",
        floatSlower: "floatSlower 18s ease-in-out infinite",
        wiggle: "wiggle 2.4s ease-in-out infinite",
        beat: "beat 1.6s ease-in-out infinite",
        shake: "shake 420ms ease-in-out",
        fadeSlide: "fadeSlide 320ms cubic-bezier(0.22, 1, 0.36, 1) both"
      }
    }
  },
  plugins: []
};