/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F9F9F7',
        surface: '#FFFFFF',
        navy: '#1B2E4B',
        'navy-hover': '#3A5A8C',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
        'grade-a': '#16A34A',
        'grade-b': '#65A30D',
        'grade-c': '#CA8A04',
        'grade-d': '#EA580C',
        'grade-f': '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
