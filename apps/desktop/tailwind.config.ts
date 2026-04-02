import type { Config } from "tailwindcss";

export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    darkMode: "media",
    theme: {
        extend: {
            fontFamily: {
                sans: ['"DM Sans"', "sans-serif"],
                mono: ['"DM Mono"', "monospace"],
            },
            colors: {
                surface: {
                    DEFAULT: "#fafaf9",
                    raised: "#ffffff",
                    sunken: "#f4f3ef",
                    border: "#e2e1d9",
                    "border-strong": "#d3d1c7",
                },
                ink: {
                    DEFAULT: "#1c1c1a",
                    secondary: "#5f5e5a",
                    tertiary: "#888780",
                    faint: "#b4b2a9",
                },
                accent: {
                    DEFAULT: "#7c6ff7",
                    soft: "#e8e5fe",
                    strong: "#5a4fd4",
                },
                dark: {
                    surface: "#1a1a18",
                    raised: "#242422",
                    sunken: "#141412",
                    border: "#2e2e2b",
                    "border-strong": "#3a3a36",
                },
                "dark-ink": {
                    DEFAULT: "#f0efe9",
                    secondary: "#b4b2a9",
                    tertiary: "#888780",
                    faint: "#5f5e5a",
                },
            },
            borderRadius: {
                sm: "6px",
                md: "8px",
                lg: "12px",
                xl: "16px",
                "2xl": "20px",
            },
            fontSize: {
                "2xs": "10px",
                xs: "11px",
                sm: "12px",
                base: "13px",
            },
        },
    },
} satisfies Config;
