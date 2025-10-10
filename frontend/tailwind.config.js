/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,css}"],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#1a1a1a',
        tertiary: '#2a2a2a',
        text: '#ffffff',
        'text-secondary': '#ebebf5',
        'text-tertiary': '#ebebf599',
        primary: '#1565C0',
        'primary-hover': '#1976D2',
        secondary: '#737373',
        hover: '#2c2c2e',
        border: '#38383a',
        'card-bg': '#1a1a1a',
        'card-border': '#3a3a3a',
        'sidebar-bg': '#1a1a1a',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'sansBlack': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.3)',
        'island': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // 👇 این خط اضافه می‌کنه breakpoint مخصوص تو
      'sl': '900px', // یا هر عرضی که می‌خوای
    },
  },
  plugins: [],
}

