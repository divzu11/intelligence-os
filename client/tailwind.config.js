export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0E0E0E',
        surface: '#161616',
        surface2: '#1F1F1F',
        border: '#2A2A2A',
        border2: '#333333',
        text: '#F0EDE6',
        muted: '#888888',
        faint: '#444444',
        ht: '#4ECBA0',
        'ht-d': '#0D2B22',
        inv: '#E8A95C',
        'inv-d': '#2B1D0A',
        ops: '#6BA3E8',
        'ops-d': '#0D1E33',
        ins: '#C97BE8',
        'ins-d': '#21102B',
        warn: '#E86B6B',
        'warn-d': '#2B0D0D',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        epilogue: ['Epilogue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
