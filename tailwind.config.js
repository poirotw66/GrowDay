/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        primary: { DEFAULT: '#0D9488', light: '#14B8A6', dark: '#0F766E' },
        cta: '#F97316',
        surface: '#F0FDFA',
        ink: '#134E4A',
      },
      animation: {
        'bounce-short': 'bounce 1s infinite',
      },
      transitionDuration: { DEFAULT: '200ms' },
    }
  },
  plugins: [],
}
