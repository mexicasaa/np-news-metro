/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./wordpress-theme/**/*.{php,html,js}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FDFCFB',
        surface: '#FCF9F8',
        'surface-dim': '#DCD9D9',
        'surface-bright': '#FCF9F8',
        'surface-lowest': '#FFFFFF',
        'surface-low': '#F6F3F2',
        'surface-container': '#F0EDED',
        'surface-high': '#EAE7E7',
        'surface-highest': '#E5E2E1',
        
        ink: '#1A1A1A',
        'ink-secondary': '#4B5563',
        'ink-muted': '#6B7280',
        'on-surface': '#1C1B1B',
        'on-surface-variant': '#43474C',
        
        primary: {
          DEFAULT: '#162839',
          container: '#2C3E50',
          dark: '#0D1B2A',
          light: '#36485B',
          fixed: '#D1E4FB',
        },
        
        secondary: {
          DEFAULT: '#775A19',
          gold: '#C5A059',
          container: '#FED488',
          fixed: '#FFDEA5',
        },

        editorial: {
          red: '#BA1A1A',
          'red-dark': '#93000A',
          'red-light': '#FFDAD6',
          slate: '#2C3E50',
          navy: '#162839',
          tan: '#C5A059',
          gold: '#775A19',
          border: '#E5E7EB',
          borderDark: '#D1D5DB',
          rule: '#E5E7EB',
        },

        border: {
          subtle: '#E5E7EB',
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['60px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['40px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-xl': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.7', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-caps': ['11px', { lineHeight: '1.5', letterSpacing: '0.08em', fontWeight: '700' }],
        'caption': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '4px',
        'md': '6px',
        'lg': '8px',
      },
      maxWidth: {
        'site': '1280px',
        'reading': '760px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'dropdown': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
