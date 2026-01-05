/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: 'rgba(255,255,255,0.92)',
        surfaceMuted: '#eef2ff',
        accentBlue: '#0a84ff',
        accentPurple: '#7c4dff',
        accentDark: '#050b18',
        borderLight: 'rgba(15,23,42,0.12)',
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
