import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    User,
    Apple,
    Dumbbell,
    Calendar,
    CreditCard,
    DollarSign,
    CheckCircle,
    MessageSquare,
    TrendingUp,
    CheckSquare,
    CalendarDays,
    MessageCircle,
} from 'lucide-react';
import { Logo } from '../shared/Logo';
import { cn } from '@/lib/utils';

// Internal helper icons
function ScaleIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h18" />
        </svg>
    );
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { name: 'Daily Progress', href: '/dashboard/daily-progress', icon: CheckSquare },
    { name: 'Weekly Schedule', href: '/dashboard/weekly-schedule', icon: CalendarDays },
    { name: 'Diet Plans', href: '/dashboard/diet-plans', icon: Apple },
    { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
    { name: 'Classes', href: '/dashboard/classes', icon: Calendar },
    { name: 'My Bookings', href: '/dashboard/my-bookings', icon: Calendar },
    { name: 'Membership', href: '/dashboard/membership', icon: CreditCard },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
    { name: 'Attendance', href: '/dashboard/attendance', icon: CheckCircle },
    { name: 'Weight Tracking', href: '/dashboard/weight', icon: ScaleIcon as any },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Feedback', href: '/dashboard/feedback', icon: MessageCircle },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-full flex-col bg-background border-r border-border">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Logo />
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                                isActive
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-card'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                    © 2026 SDFitness
                </p>
            </div>
        </div>
    );
}
