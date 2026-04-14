/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // --- SDFitness Design Tokens ---
                // Primary: Bold motivational red
                brand: {
                    DEFAULT: '#DC2626',
                    light: '#EF4444',
                    dark: '#B91C1C',
                    muted: '#FEE2E2',
                },
                // CTA / Success: Green for completions
                cta: {
                    DEFAULT: '#16A34A',
                    light: '#22C55E',
                    dark: '#15803D',
                    muted: '#DCFCE7',
                },
                // Neutral: High contrast slate for text
                ink: {
                    DEFAULT: '#1F2937',
                    strong: '#111827',
                    medium: '#374151',
                    muted: '#6B7280',
                    subtle: '#9CA3AF',
                    faint: '#E5E7EB',
                },
                // Surface: Energetic light backgrounds
                surface: {
                    DEFAULT: '#FFFFFF',
                    bg: '#FEF2F2',      // Warm energetic tint
                    card: '#FFFFFF',
                    hover: '#FEF9F9',
                    overlay: 'rgba(0,0,0,0.5)',
                },
                // Accent: Electric orange for energy bursts
                energy: {
                    DEFAULT: '#FF6B35',
                    light: '#FF8C60',
                    muted: '#FFF0EB',
                },
                // Skeleton shimmer base
                skeleton: {
                    base: '#E5E7EB',
                    shimmer: '#F9FAFB',
                },
            },
            fontFamily: {
                sans: ['"Barlow"', 'sans-serif'],
                headline: ['"Barlow Condensed"', 'sans-serif'],
            },
            fontSize: {
                'display': ['3rem', { lineHeight: '1', fontWeight: '700' }],
                'hero': ['2.25rem', { lineHeight: '1.1', fontWeight: '700' }],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
            },
            keyframes: {
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                'scale-pop': {
                    '0%': { transform: 'scale(0.92)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'pulse-ring': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
                    '50%': { transform: 'scale(1.1)', opacity: '0.4' },
                },
                'spin-3d': {
                    '0%': { transform: 'rotateY(0deg) rotateX(15deg)' },
                    '100%': { transform: 'rotateY(360deg) rotateX(15deg)' },
                },
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.4s ease-out forwards',
                'fade-in': 'fade-in 0.3s ease-out forwards',
                'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'scale-pop': 'scale-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
                'spin-3d': 'spin-3d 8s linear infinite',
                'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                'energy-gradient': 'linear-gradient(135deg, #FF6B35 0%, #DC2626 100%)',
                'cta-gradient': 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                'surface-gradient': 'linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 100%)',
            },
            boxShadow: {
                'brand': '0 4px 24px rgba(220, 38, 38, 0.3)',
                'brand-lg': '0 8px 40px rgba(220, 38, 38, 0.4)',
                'card': '0 1px 12px rgba(31, 41, 55, 0.08)',
                'card-hover': '0 8px 32px rgba(31, 41, 55, 0.14)',
                'nav': '0 -1px 20px rgba(31, 41, 55, 0.08)',
                'cta': '0 4px 20px rgba(22, 163, 74, 0.35)',
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
        function({ addUtilities }) {
            addUtilities({
                '.scroll-hide': {
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none'
                    }
                }
            })
        }
    ],
};
