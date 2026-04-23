import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        line: {
          DEFAULT: "#06C755",
          dark: "#04A347",
        },
        profit: "#E53935",
        loss: "#2E7D32",
      },
    },
  },
  plugins: [],
};
export default config;
