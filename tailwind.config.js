/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'theme-primary': 'var(--color-primary)',
        'theme-success': 'var(--color-success)',
        'theme-warning': 'var(--color-warning)',
        'theme-error': 'var(--color-error)',
        'theme-info': 'var(--color-info)',
        'theme-page': 'var(--bg-page)',
        'theme-surface': 'var(--bg-surface)',
        'theme-card': 'var(--bg-card)',
        'theme-elevated': 'var(--bg-elevated)',
        'theme-input': 'var(--bg-input)',
        'theme-border': 'var(--border-color)',
      },
      textColor: {
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)',
        'theme-muted': 'var(--text-muted)',
      },
    },
  },
  plugins: [],
}
