import { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        primary: "#2D9CDB",
        secondary: "#F2C94C",
        background: "#F4F4F4",
        text: "#575757",
        "subtle-text": "#4F4F4F",
        alabaster: "#F4F4F4",
        "sonic-silver": "#575757",
        "cadet-blue": "#5E8D93",
        tuscany: "#E0B894",
        jet: "#333333",
        "light-alabaster": "#FAFAFA",
        "dark-cadet-blue": "#4A707A",
        "light-tuscany": "#F0D6C2",
        border: "#E2E8F0",
        input: "#F7FAFC",
        ring: "#CBD5E0",
        card: "#FFFFFF",
        popover: "#F7FAFC",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        card: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
} as Config;
