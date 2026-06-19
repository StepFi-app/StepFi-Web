/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080F1A',
        surface: '#0D1B2A',
        elevated: '#112236',
        border: 'rgba(30,58,82,0.6)',
        brand: '#22C55E',
        'brand-blue': '#2563EB',
        'text-primary': '#F0F4F8',
        'text-secondary': '#A8BCCF',
        'text-muted': '#6B8CA8',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
