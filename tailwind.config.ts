import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Modern SaaS palette ──────────────────────────────────────────
        brand: {
          DEFAULT: "#16a34a",   // green-600 — primary accent
          light: "#22c55e",     // green-500
          dark: "#15803d",      // green-700
          subtle: "#f0fdf4",    // green-50
          muted: "#dcfce7",     // green-100
          border: "#bbf7d0",    // green-200
        },
        surface: {
          DEFAULT: "#ffffff",
          page: "#f8fafc",      // slate-50
          raised: "#f1f5f9",    // slate-100
          overlay: "#e2e8f0",   // slate-200
        },
        ink: {
          DEFAULT: "#0f172a",   // slate-900
          muted: "#475569",     // slate-600
          subtle: "#94a3b8",    // slate-400
          disabled: "#cbd5e1",  // slate-300
        },
        line: {
          DEFAULT: "#e2e8f0",   // slate-200
          strong: "#cbd5e1",    // slate-300
        },
        // ─── Legacy aliases kept for backward compat ────────────────────
        gold: {
          DEFAULT: "#16a34a",
          light: "#22c55e",
          dark: "#15803d",
          muted: "#16a34a",
        },
        charcoal: {
          DEFAULT: "#0f172a",
          deep: "#1e293b",
          mid: "#334155",
          soft: "#475569",
        },
        ivory: {
          DEFAULT: "#f8fafc",
          warm: "#f1f5f9",
          muted: "#e2e8f0",
          border: "#e2e8f0",
        },
        latte: {
          DEFAULT: "#64748b",
          light: "#94a3b8",
          dark: "#475569",
        },
        red: "#ef4444",
        error: "#dc2626",
        green: "#16a34a",
        blue: "#3b82f6",
        pink: "#ec4899",
        orange: "#f97316",
        light: {
          "100": "#475569",
          "200": "#94a3b8",
          "300": "#e2e8f0",
          "400": "#f1f5f9",
        },
        dark: {
          "100": "#1e293b",
          "200": "#334155",
        },
        // ─── shadcn/ui tokens ─────────────────────────────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        poppins: ["var(--font-poppins)"],
        playfair: ["Inter", "system-ui", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "drop-1": "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "drop-2": "0 4px 6px -1px rgb(22 163 74 / 0.12), 0 2px 4px -2px rgb(22 163 74 / 0.08)",
        "drop-3": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
        "drop-4": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        classical: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
