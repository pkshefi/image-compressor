import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 Color Scheme
        primary: '#6750A4',
        'on-primary': '#FFFFFF',
        secondary: '#958DA5',
        'on-secondary': '#FFFFFF',
        tertiary: '#B58392',
        error: '#B00020',
        'on-error': '#FFFFFF',
        background: '#FEF7FF',
        surface: '#FEF7FF',
        outline: '#79747E',
      },
      boxShadow: {
        'elevation-1': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 2px 4px rgba(0, 0, 0, 0.2), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)'
      },
      borderRadius: {
        'medium': '12px',
        'large': '16px'
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace']
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config