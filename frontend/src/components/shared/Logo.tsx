import { Dumbbell } from 'lucide-react';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                <Dumbbell className="w-8 h-8 text-primary-500" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
            </div>
            {showText && (
                <span className="text-2xl font-headline font-bold tracking-wider">
                    <span className="text-gradient">SD</span>
                    <span className="text-foreground">FITNESS</span>
                </span>
            )}
        </div>
    );
}
