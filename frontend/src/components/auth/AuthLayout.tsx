import { type ReactNode } from 'react';
import { Logo } from '../shared/Logo';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    backgroundImage: string;
    quote?: string;
}

export function AuthLayout({
    children,
    title,
    subtitle,
    backgroundImage,
    quote = "Transform Your Body, Transform Your Life"
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-8 bg-primary-50">
            {/* Full screen blurred background image */}
            <div 
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{ backgroundImage: `url(${backgroundImage})`, filter: 'blur(8px)' }}
            />
            {/* Premium Navy Overlay */}
            <div className="absolute inset-0 bg-primary-900/60 Mix-blend-multiply" />

            {/* Central Floating Card Container */}
            <div className="relative z-10 w-full max-w-6xl min-h-[600px] flex flex-col md:flex-row shadow-2xl shadow-primary-900/50 rounded-2xl overflow-hidden bg-white animate-scale-in">
                
                {/* Left Form Section */}
                <div className="w-full md:w-1/2 lg:w-5/12 bg-background p-8 md:p-12 flex flex-col justify-center relative">
                    <div className="mb-10">
                        <Logo />
                    </div>
                    
                    <div className="mb-8 animate-slide-up">
                        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-3 text-primary-900">
                            {title}
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            {subtitle}
                        </p>
                    </div>

                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        {children}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-muted-foreground text-xs text-center">
                            © 2026 SDFitness. Secure & Encrypted.
                        </p>
                    </div>
                </div>

                {/* Right Image Section (Inner Card) */}
                <div className="hidden md:flex flex-1 relative bg-primary-900 flex-col justify-end p-12 overflow-hidden">
                    {/* Unblurred crisp image inside the card */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    
                    {/* Inner Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 to-transparent" />

                    {/* Inspiring Content */}
                    <div className="relative z-10 animate-slide-up max-w-lg mb-4" style={{ animationDelay: '0.2s' }}>
                        <div className="w-12 h-1.5 bg-secondary-500 mb-6 rounded-full shadow-lg shadow-secondary-500/50" />
                        <h2 className="text-4xl lg:text-5xl font-headline font-bold text-white mb-4 leading-tight drop-shadow-xl">
                            {quote}
                        </h2>
                        <p className="text-lg text-primary-100 font-medium drop-shadow-md">
                            Join thousands of members achieving their fitness goals and pushing their limits every single day.
                        </p>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-1/4 right-0 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-glow" />
                </div>

            </div>
        </div>
    );
}
