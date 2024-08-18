import { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: ['app/**/*.{ts,tsx}', 'ui/**/*.{ts,tsx}'],
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
        myLightGray: {
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFFFFF',
          300: '#FEFEFE',
          400: '#FDFDFD',
          500: '#F4F4F4',
          600: '#EBEBEB',
          700: '#E2E2E2',
          800: '#D9D9D9',
          900: '#D0D0D0'
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
        blue: {
          400: '#60A5FA'
        },
        purple: {
          500: '#A78BFA'
        },
        red: {
          400: '#F87171'
        },
        pink: {
          500: '#F472B6'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))'
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', ...fontFamily.sans]
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }]
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover':
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
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
