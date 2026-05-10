/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        themeOrange: '#B93C12',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      fontFamily: {
        OldLondon: ['OldLondon', 'serif'],
        TimesNewRoman: ['TimesNewRoman', 'serif'],
        Impact: ['Impact', 'sans-serif'],
        Canopee: ['Canopee', 'serif'],
        EditorialNew: ['EditorialNew', 'serif'],
        Helvetica: ['Helvetica', 'sans-serif'],
        Arial: ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
