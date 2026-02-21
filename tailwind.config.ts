import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7ff",
          100: "#e0e7ff",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3"
        }
      }
    }
  },
  plugins: [],
};

export default config;
