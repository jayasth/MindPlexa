import { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        light: {
          background: '#F4F4F4',
          text: '#575757',
          primary: '#A8A8A8',
          secondary: '#C0C0C0'
        },
        dark: {
          background: '#1A202C',
          text: '#CBD5E0',
          primary: '#63b3ed',
          secondary: '#f6ad55'
        },
        myGray: {
          50: '#F2F2F2',
          100: '#E0E0E0',
          200: '#C0C0C0',
          300: '#A1A1A1',
          400: '#828282',
          500: '#636363',
          600: '#575757',
          700: '#494949',
          800: '#3C3C3C',
          900: '#2F2F2F'
        },
        lavender: {
          50: '#F8F7FE',
          100: '#F1F0FE',
          200: '#E3E1FD',
          300: '#D5D2FC',
          400: '#BFB8FA',
          500: '#989FF0', // Default shade
          600: '#8A8DE8',
          700: '#7C7BE0',
          800: '#6E69D8',
          900: '#5F56CF'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))'
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
        sans: ['var(--font-sans)', ...fontFamily.sans]
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      boxShadow: {
        card: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      } as unknown,
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      } as unknown
    }
  },
  plugins: [require('@tailwindcss/forms'), require('tailwindcss-animate')]
} as Config;
