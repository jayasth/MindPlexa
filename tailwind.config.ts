// tailwind.config.ts

import { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2D9CDB",
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
      },
      gradientColorStops: {
        "primary-start": "#5E8D93",
        "primary-end": "#4A707A",
        "secondary-start": "#E0B894",
        "secondary-end": "#C79D7D",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
} as Config;
