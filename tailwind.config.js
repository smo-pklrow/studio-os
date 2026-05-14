/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg:        '#1E1E1C',
          surface:   '#252523',
          elevated:  '#2A2A28',
          border:    'rgba(255,255,255,0.08)',
          text:      '#E8E6DF',
          muted:     '#9C9A92',
          subtle:    '#6B6963',
        },
        brand: {
          green:     '#1D9E75',
          greenDark: '#0F6E56',
          greenDeep: '#085041',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
