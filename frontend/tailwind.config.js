/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0f172a',
          900: '#1e293b',
          800: '#334155',
          700: '#475569'
        },
        cyber: {
          blue: '#0ea5e9',
          purple: '#a78bfa',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b'
        }
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }
    }
  },
  plugins: []
}
