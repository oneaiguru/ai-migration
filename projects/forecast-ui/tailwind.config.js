/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // Safelist for dynamically generated classes
  // Add any classes that are generated at runtime here
  safelist: [
    // Example: If you generate badge colors dynamically
    // 'bg-red-50', 'text-red-700', 'border-red-200',
    // 'bg-yellow-50', 'text-yellow-700', 'border-yellow-200',
    // 'bg-green-50', 'text-green-700', 'border-green-200',
  ],
  
  theme: {
    extend: {
      // Brand colors with CSS custom property fallbacks
      colors: {
        'mytko-accent': 'var(--color-accent, #3b82f6)',
        'mytko-dark': 'var(--color-dark, #4b5563)',
        'mytko-gray': 'var(--color-gray, #6b7280)',
        'mytko-light': 'var(--color-light, #f3f4f6)',
      },
      
      // Consistent border radius scale
      borderRadius: {
        'sm': '0.25rem',    // 4px
        'DEFAULT': '0.5rem', // 8px
        'md': '0.5rem',     // 8px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
      },
      
      // Custom box shadows for depth
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'header': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      
      // Custom transitions
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
      },
      
      // Custom spacing (if needed beyond Tailwind defaults)
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      
      // Typography scale (optional, if you need custom sizes)
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.75rem' }], // 10px
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],   // 11px
      },
      
      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  
  plugins: [
    // Add Tailwind plugins here if needed:
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],
}
