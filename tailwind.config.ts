import { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2D9CDB", // Bold color for accents
        background: "#F4F4F4", // Soft background color
        text: "#575757", // Primary text color
        "subtle-text": "#4F4F4F", // Secondary text color
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
      // Other extends can be added as needed
    },
  },
  // You can add variants if you need to customize how certain styles behave on hover, focus, etc.
  plugins: [require("@tailwindcss/forms")], // Keep this if you need the forms plugin
} as Config;
