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
        // Archival Ivory Design System
        ivoryBg: '#faf9f5',
        ivorySurface: '#f4f4ef',
        ivorySurfaceHighest: '#e0e4dc',
        ivoryPrimary: '#5f5e5e',
        ivoryText: '#2f342e',
        ivoryTextVariant: '#5c605a',
        ivoryOutline: 'rgba(175, 179, 172, 0.2)', // outline variant 20%
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif"', 'serif'],
      },
      boxShadow: {
        glow: '0 10px 35px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}
