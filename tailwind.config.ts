import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        root: "#0a0a0f",
        card: "#12121a",
        "card-hover": "#1a1a26",
        elevated: "#1e1e2e",
        "border-subtle": "#2a2a3a",
        "border-focus": "#4a4a6a",
        "text-primary": "#e2e2f0",
        "text-secondary": "#8888a0",
        status: {
          idle: "#6366f1",
          processing: "#f59e0b",
          done: "#22c55e",
          error: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
