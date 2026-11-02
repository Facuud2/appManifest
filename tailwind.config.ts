import type { Config } from "tailwindcss";
import konstaConfig from "konsta/config";

const config: Config = konstaConfig({
  konsta: {
    colors: {
      primary: "#A78BFA",
    },
  },
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
          // Liquid Glass Semantic Colors mapped to CSS Variables
          base: "var(--color-base)",
          surface: "var(--color-surface)",
          surfaceElevated: "var(--color-surface-elevated)",
          surfaceNav: "var(--color-surface-nav)",
          cardBg: "var(--color-surface-card)",
          glassBorder: "var(--glass-border)",
          glassBorderHover: "var(--glass-border-hover)",
          glassBorderFocus: "var(--glass-border-focus)",
          glassSubtle: "var(--glass-subtle)",
          glassSpecular: "var(--glass-specular)",
          glassControl: "var(--glass-control-bg)",
          glassControlHover: "var(--glass-control-hover)",
          glassControlActive: "var(--glass-control-active)",
          focusRing: "var(--focus-ring)",
          
          auraPurple: "var(--color-aura-purple)",
          auraPurpleHover: "var(--color-aura-purple-hover)",
          auraRose: "var(--color-aura-rose)",
          brass: "var(--color-brass)",
          brassHover: "var(--color-brass-hover)",
          darkBg: "var(--color-base)",
          darkSurface: "var(--color-surface-elevated)",
          ink: "var(--color-ink)",
          inkMuted: "var(--color-ink-muted)",
          inkLight: "var(--color-ink-light)",
          emerald: "var(--color-emerald)",
          amber: "var(--color-amber)",
          rose: "var(--color-rose)",

          // Legacy Soft Grunge Witchy Palette (preserved & mapped)
          pink: "var(--color-pink)",
          lavender: "var(--color-lavender)",
          celeste: "var(--color-celeste)",
          sky: "var(--color-sky)",
          mint: "var(--color-mint)",
          butter: "var(--color-butter)",
          peach: "var(--color-peach)",
          warmWhite: "var(--color-warm-white)",
          sage: "var(--color-mint)",
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
          'var(--font-serif)',
          'Lora',
          'Georgia',
          'serif',
        ],
        mono: [
          'var(--font-mono)',
          'Courier Prime',
          'Courier New',
          'monospace',
        ],
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        "glass-hover": "var(--shadow-glass-hover)",
        "glass-sm": "0 4px 16px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 var(--glass-specular)",
        liquid: "var(--shadow-liquid)",
        lens: "var(--shadow-lens)",
        debossed: "var(--shadow-debossed)",
        embossed: "var(--shadow-glass)",
        "neumorph-flat": "var(--shadow-glass)",
        "neumorph-inset": "var(--shadow-debossed)",
        "witchy-glow": "0 0 25px -4px var(--color-aura-purple)",
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
}) as Config;

export default config;
