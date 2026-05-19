/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cyber: {
          950: '#020817',
          900: '#0a0f1e',
          800: '#0d1b2a',
          700: '#112240',
          600: '#1a2f5c',
        },
      },
      boxShadow: {
        neon: '0 0 16px rgba(34,211,238,0.25), 0 0 32px rgba(34,211,238,0.08)',
        'neon-blue': '0 0 16px rgba(59,130,246,0.3), 0 0 32px rgba(59,130,246,0.1)',
        card: '0 4px 24px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: '40px 40px',
      },
    },
  },
  plugins: [],
}
