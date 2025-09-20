import type { Config } from "tailwindcss";
import "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4xl": "2560px",
    },
    extend: {
      fontFamily: {
        livvic: ["var(--font-livvic)"],
        urbanist: ["var(--font-urbanist)"],
      },
      clipPath: {
        diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        title: "#4A4A4A",
        subtitle: "#565B5B",
        body: "#707070",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0%",
          },
          "100%": {
            opacity: "100%",
          },
        },
        slideUp: {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0%",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "100%",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        fadeIn: "fadeIn 1s ease-in-out",
        slideUp: "slideUp 0.8s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-medium": "float 6s ease-in-out infinite",
        "slow-spin": "spin 60s linear infinite",
        "slow-pulse": "pulse 8s ease-in-out infinite",
      },
      boxShadow: {
        "red-right-bottom": "2px 2px 5px rgba(153 27 27)", // Adjust values as needed
        "red-right-bottom-lg": "4px 4px 5px rgba(153 27 27)",
        "red-right-bottom-xl": "8px 7px 2px rgba(153 27 27)",
        // Add more sizes as needed
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwind-clip-path"),
    require("tailwindcss-animate"),
  ],
} satisfies Config;
