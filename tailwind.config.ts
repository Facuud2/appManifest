import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        manifest: {
          pink: "#F6C9D9",
          lavender: "#DCCFFF",
          celeste: "#CBE9F8",
          sky: "#D6E4FA",
          mint: "#D0EFDF",
          butter: "#F8EDB9",
          peach: "#F7D9CB",
          warmWhite: "#FFFCF8",
          ink: "#493E55",
          inkMuted: "#7B6F88",
          inkLight: "#A59BB2",
          cardBg: "rgba(255, 255, 255, 0.72)",
          glassBorder: "rgba(255, 255, 255, 0.85)",
          glassSubtle: "rgba(255, 255, 255, 0.45)",
          auraPurple: "#B8A3F8",
          auraRose: "#F8A5C2",
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'var(--font-sans)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'sans-serif',
        ],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(184, 163, 248, 0.14)",
        "glass-hover": "0 12px 36px 0 rgba(184, 163, 248, 0.22)",
        "glass-sm": "0 4px 16px 0 rgba(184, 163, 248, 0.08)",
        "liquid": "0 16px 48px -8px rgba(138, 115, 209, 0.18)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "float-gentle": "float 8s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 4s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-6px) scale(1.01)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.85) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1.15) rotate(15deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
