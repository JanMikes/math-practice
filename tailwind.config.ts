import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chalkboard: {
          dark: '#2d4a3e',
          DEFAULT: '#3a5f4a',
          light: '#4a7359',
        },
        chalk: {
          white: '#f8f4e8',
          yellow: '#fef3c7',
          green: '#86efac',
          red: '#fca5a5',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
