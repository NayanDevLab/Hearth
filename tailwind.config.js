/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: '#C96B50',
        'primary-soft': '#F5E4DB',
        'primary-ink': '#7A3A26',
        // Ink
        ink: '#23252F',
        'ink-2': '#3B3F4E',
        'ink-3': '#787E8B',
        'ink-4': '#A9AFBD',
        // Surfaces
        bg: '#FAF8F4',
        surface: '#FEFDFB',
        'surface-2': '#F5F2EC',
        line: '#E5E0D7',
        'line-2': '#ECE8E1',
        // Accents
        mint: '#4BBE8D',
        'mint-soft': '#E1F5EC',
        butter: '#EFC84E',
        'butter-soft': '#FAF3D9',
        rose: '#E55A48',
        'rose-soft': '#FAE5E2',
        sky: '#4AADD1',
        'sky-soft': '#E0F1F8',
        lilac: '#9A7ECF',
        'lilac-soft': '#F0EAF9',
      },
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular', 'system-ui', 'sans-serif'],
        medium: ['PlusJakartaSans_500Medium'],
        semibold: ['PlusJakartaSans_600SemiBold'],
        bold: ['PlusJakartaSans_700Bold'],
        extrabold: ['PlusJakartaSans_800ExtraBold'],
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '28px',
        pill: '9999px',
      },
      spacing: {
        1.5: '6px',
        3.5: '14px',
        4.5: '18px',
        screen: '22px',
        section: '28px',
      },
    },
  },
  plugins: [],
};
