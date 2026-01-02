/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        surfaceMuted: '#f8fafc',
        accentBlue: '#2563eb',
        accentPurple: '#7c3aed',
        accentDark: '#111827',
        borderLight: '#e2e8f0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 35px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}
