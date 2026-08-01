import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0f172a",
          deep: "#090d16",
        },
        surface: {
          DEFAULT: "#1e293b",
          border: "#334155",
        },
        accent: {
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
          dark: "#0891b2",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(6, 182, 212, 0.45), 0 0 60px rgba(6, 182, 212, 0.15)",
        "glow-lg": "0 0 40px rgba(6, 182, 212, 0.55), 0 0 90px rgba(6, 182, 212, 0.2)",
        card: "0 8px 32px rgba(0, 0, 0, 0.35)",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(circle at 50% 0%, rgba(6,182,212,0.12), transparent 60%)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            boxShadow:
              "0 0 20px rgba(6, 182, 212, 0.45), 0 0 60px rgba(6, 182, 212, 0.15)",
          },
          "50%": {
            boxShadow:
              "0 0 32px rgba(6, 182, 212, 0.7), 0 0 90px rgba(6, 182, 212, 0.3)",
          },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
