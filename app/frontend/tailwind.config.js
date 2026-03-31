/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        surface: '#141414',
        elevated: '#1E1E1E',
        swim: '#00E5FF',
        yoga: '#00BFA5',
        nudge: '#FF3B30',
        muted: '#A1A1AA',
        subtle: '#27272A'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.35)',
        swim: '0 0 30px rgba(0,229,255,0.18)',
        yoga: '0 0 30px rgba(0,191,165,0.18)'
      },
      backgroundImage: {
        tactical: 'radial-gradient(circle at top, rgba(0,229,255,0.12), transparent 35%), radial-gradient(circle at bottom right, rgba(0,191,165,0.10), transparent 35%)'
      }
    }
  },
  plugins: []
};
