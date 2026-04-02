import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: '#eef7f3',
          light: '#f5fbf8',
          dark: '#d4ece2',
        },
        forest: {
          DEFAULT: '#0d3b2e',
          light: '#1a5c42',
          muted: '#2d6a50',
        },
        sage: {
          DEFAULT: '#5a8a75',
          light: '#8aaa98',
          dark: '#3a6a55',
        },
        cream: '#fef7ee',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
