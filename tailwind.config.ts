import type { Config } from 'tailwindcss'

const config: Config = {
  // Only generate CSS for classes actually used in code — keeps bundle tiny
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Enable class-based dark mode — toggled by adding 'dark' to <html>
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // --- Brand palette ---
        // These are our custom design tokens.
        // Using CSS variable references so they respond to dark mode automatically.
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fd',
          400: '#818dfb',
          500: '#6366f1', // primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // AND operator color — cool blue
        logic: {
          and: {
            DEFAULT: '#3b82f6',
            subtle: '#1d4ed8',
            bg: '#eff6ff',
            'bg-dark': '#1e3a5f',
          },
          // OR operator color — warm amber
          or: {
            DEFAULT: '#f59e0b',
            subtle: '#d97706',
            bg: '#fffbeb',
            'bg-dark': '#451a03',
          },
        },
        // Surface colors — used for cards, panels, backgrounds
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          border: '#e2e8f0',
          dark: {
            DEFAULT: '#0f1117',
            secondary: '#161b27',
            tertiary: '#1e2535',
            border: '#2d3748',
          },
        },
      },
      fontFamily: {
        // Geist for UI text (modern, clean)
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        // Geist Mono for query preview and code — monospace is key to our aesthetic
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        // Subtle glow for focused/active states — unique touch
        'brand-glow': '0 0 0 3px rgba(99, 102, 241, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      // Nesting depth colors — each level of nesting gets a different left-border color
      // This is one of our signature visual details
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'collapse': 'collapse 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
