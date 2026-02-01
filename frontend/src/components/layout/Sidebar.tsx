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
} from 'lucide-react';
import { Logo } from '../shared/Logo';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Diet Plans', href: '/dashboard/diet-plans', icon: Apple },
    { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
    { name: 'Classes', href: '/dashboard/classes', icon: Calendar },
    { name: 'My Bookings', href: '/dashboard/my-bookings', icon: Calendar }, // Using Calendar for now, could use Ticket or similar
    { name: 'Membership', href: '/dashboard/membership', icon: CreditCard },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
    { name: 'Attendance', href: '/dashboard/attendance', icon: CheckCircle },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-full flex-col bg-dark-900 border-r border-dark-700">
            {/* Logo */}
            <div className="p-6 border-b border-dark-700">
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
                                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-dark-700">
                <p className="text-xs text-gray-500 text-center">
                    © 2026 SDFitness
                </p>
            </div>
        </div>
    );
}
