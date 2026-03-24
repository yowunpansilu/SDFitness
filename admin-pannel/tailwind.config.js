/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                // Gym-inspired color palette
                primary: {
                    DEFAULT: '#FF4500',      // Vibrant Orange-Red
                    50: '#FFF5F2',
                    100: '#FFE8E0',
                    200: '#FFD1C2',
                    300: '#FFB199',
                    400: '#FF8566',
                    500: '#FF4500',          // Main
                    600: '#E63E00',
                    700: '#CC3700',
                    800: '#B33000',
                    900: '#992900',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#0EA5E9',      // Electric Blue
                    50: '#F0F9FF',
                    100: '#E0F2FE',
                    200: '#BAE6FD',
                    300: '#7DD3FC',
                    400: '#38BDF8',
                    500: '#0EA5E9',          // Main
                    600: '#0284C7',
                    700: '#0369A1',
                    800: '#075985',
                    900: '#0C4A6E',
                    foreground: '#FFFFFF',
                },
                accent: {
                    DEFAULT: '#FFD700',      // Gold
                    50: '#FFFEF0',
                    100: '#FFFCE0',
                    200: '#FFF9C2',
                    300: '#FFF599',
                    400: '#FFED66',
                    500: '#FFD700',          // Main
                    600: '#E6C200',
                    700: '#CCAD00',
                    800: '#B39900',
                    900: '#998500',
                    foreground: '#1A1A1A',
                },
                success: {
                    DEFAULT: '#10B981',
                    foreground: '#FFFFFF',
                },
                dark: {
                    DEFAULT: '#1A1A1A',
                    50: '#F5F5F5',
                    100: '#E5E5E5',
                    200: '#D4D4D4',
                    300: '#A3A3A3',
                    400: '#737373',
                    500: '#525252',
                    600: '#404040',
                    700: '#2A2A2A',
                    800: '#1A1A1A',
                    900: '#0A0A0A',
                },
                navy: {
                    50: '#f0f4f8',
                    100: '#d9e2ec',
                    200: '#bcccdc',
                    300: '#9fb3c8',
                    400: '#829ab1',
                    500: '#627d98',
                    600: '#486581',
                    700: '#334e68',
                    800: '#243b53',
                    900: '#102a43',
                    950: '#061626',
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                headline: ['Bebas Neue', 'Impact', 'sans-serif'],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(255, 69, 0, 0.5)" },
                    "50%": { boxShadow: "0 0 40px rgba(255, 69, 0, 0.8)" },
                },
                "slide-up": {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "slide-down": {
                    "0%": { transform: "translateY(-20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "scale-in": {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                "slide-up": "slide-up 0.5s ease-out",
                "slide-down": "slide-down 0.5s ease-out",
                "fade-in": "fade-in 0.3s ease-out",
                "scale-in": "scale-in 0.3s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
