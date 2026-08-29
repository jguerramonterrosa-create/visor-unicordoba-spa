/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        panel: 'var(--panel)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        primary: {
          DEFAULT: 'var(--primary)',
          strong: 'var(--primary-strong)',
          foreground: 'var(--primary-foreground)',
          soft: 'var(--primary-soft)',
        },
        // Semantic data classification colors (cartographic legend)
        'spa-high': 'var(--spa-high)',
        'spa-friction': 'var(--spa-friction)',
        'spa-comfort': 'var(--spa-comfort)',
        'spa-free': 'var(--spa-free)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        float: '0 10px 40px -12px rgba(15, 23, 42, 0.28), 0 2px 8px -2px rgba(15, 23, 42, 0.12)',
        'float-lg': '0 24px 70px -20px rgba(15, 23, 42, 0.45)',
      },
      borderRadius: {
        panel: 'var(--radius)',
      },
      backdropBlur: {
        panel: '16px',
      },
      keyframes: {
        'panel-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'panel-in': 'panel-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
