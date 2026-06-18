/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark "studio" surfaces.
        ink: {
          900: "#08080e",
          800: "#0f0f1a",
          700: "#171726",
          600: "#1f1f33",
        },
        // Brand: tension (indigo) → through fuchsia → resolve (amber).
        tension: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
        },
        accent: {
          DEFAULT: "#d946ef",
        },
        resolve: {
          DEFAULT: "#f59e0b",
          dark: "#d97706",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
      },
      backgroundImage: {
        brand: "linear-gradient(120deg, #6366f1 0%, #d946ef 50%, #f59e0b 100%)",
        "brand-soft":
          "linear-gradient(120deg, rgba(99,102,241,0.15), rgba(217,70,239,0.12) 50%, rgba(245,158,11,0.12))",
      },
      boxShadow: {
        glow: "0 10px 40px -12px rgba(99,102,241,0.55)",
        "glow-amber": "0 10px 40px -12px rgba(245,158,11,0.5)",
        card: "0 20px 50px -24px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        gradient: "gradient-pan 6s ease infinite",
      },
    },
  },
  plugins: [typography],
};
