import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#00C853',
          'green-dark': '#00A847',
          'green-light': '#E8F5E8',
        },
        secondary: {
          blue: '#1976D2',
          'blue-light': '#E3F2FD',
        },
        accent: {
          orange: '#FF6F00',
          'orange-light': '#FFF3E0',
          gold: '#FFB300',
          'gold-light': '#FFFDE7',
        },
        neutral: {
          'text-primary': '#212121',
          'text-secondary': '#757575',
          'bg-light': '#F5F5F5',
          'border': '#E0E0E0',
        },
        error: {
          red: '#D32F2F',
          'red-light': '#FFEBEE',
        },
      },
      fontFamily: {
        thai: ['Sarabun', 'Noto Sans Thai', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
