import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "senior-sm": ["1.125rem", { lineHeight: "1.75rem" }],
        "senior-base": ["1.25rem", { lineHeight: "2rem" }],
        "senior-lg": ["1.5rem", { lineHeight: "2.25rem" }],
        "senior-xl": ["1.875rem", { lineHeight: "2.5rem" }],
        "senior-2xl": ["2.25rem", { lineHeight: "3rem" }],
        "senior-3xl": ["3rem", { lineHeight: "3.75rem" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Care status colors
        "status-green": "#16a34a",
        "status-yellow": "#ca8a04",
        "status-red": "#dc2626",
        // Calm senior palette
        "kindred-blue": "#1e40af",
        "kindred-teal": "#0f766e",
        "kindred-warm": "#92400e",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "wave": {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "mic-pulse": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave": "wave 1s ease-in-out infinite",
      },
      spacing: {
        "touch": "48px",
        "touch-lg": "64px",
      },
    },
  },
  plugins: [animate],
};

export default config;
