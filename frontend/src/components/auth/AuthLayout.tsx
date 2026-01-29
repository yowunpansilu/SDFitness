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
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-dark-900">
                {/* Logo */}
                <div className="mb-8">
                    <Logo />
                </div>

                {/* Form Content */}
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    <div className="mb-8 animate-slide-up">
                        <h1 className="text-4xl font-headline font-bold mb-2 text-white">
                            {title}
                        </h1>
                        <p className="text-gray-400 text-lg">
                            {subtitle}
                        </p>
                    </div>

                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-8 pb-6">
                    <p className="text-gray-500 text-sm text-center lg:text-left">
                        © 2026 SDFitness. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-dark-900/50 to-secondary-900/80" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-12">
                    <div className="animate-slide-up">
                        <h2 className="text-5xl font-headline font-bold text-white mb-4 leading-tight">
                            {quote}
                        </h2>
                        <p className="text-xl text-gray-200 font-medium">
                            Join thousands of members achieving their fitness goals
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-1/4 right-12 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl animate-pulse-glow" />
                    <div className="absolute bottom-1/3 left-12 w-24 h-24 bg-secondary-500/20 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
                </div>
            </div>
        </div>
    );
}
