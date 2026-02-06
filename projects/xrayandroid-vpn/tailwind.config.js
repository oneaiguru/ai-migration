/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        slate: "rgb(var(--slate) / <alpha-value>)",
        tide: "rgb(var(--tide) / <alpha-value>)",
        sun: "rgb(var(--sun) / <alpha-value>)",
        rose: "rgb(var(--rose) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        mist: "rgb(var(--mist) / <alpha-value>)",
        lime: "rgb(var(--lime) / <alpha-value>)",
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at top, rgba(45, 212, 191, 0.35), transparent 55%), radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.18), transparent 45%), linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(10, 18, 28, 0.98))",
        "mesh": "radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.22) 1px, transparent 0)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(45, 212, 191, 0)" },
          "50%": { boxShadow: "0 0 25px rgba(45, 212, 191, 0.35)" },
        },
        sweep: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        rise: "rise 0.7s ease-out both",
        float: "float 6s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        sweep: "sweep 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
